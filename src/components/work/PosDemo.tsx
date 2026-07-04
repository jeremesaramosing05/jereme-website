"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Live, self-contained recreation of Jereme's Google Apps Script POS &
 * Inventory system (v3). Runs entirely in the browser with in-memory state,
 * mirroring the real app: PIN login with Admin/Cashier roles, a Sell / Stock /
 * History / Reports workspace, cash-tendered & change, barcode scanning,
 * restock and adjustments, receipts with reprint, full-transaction void that
 * restores stock, a sales dashboard, low-stock flags, and an audit log.
 *
 * Seed data is taken from the real spreadsheet and AuditLog export, so the
 * Reports tab opens on the same numbers shown in the case study (₱390 across
 * three sales). The only web adaptation: "reprint" renders the receipt on
 * screen instead of calling window.print(), which would print the whole page.
 */

type Role = "Admin" | "Cashier";
type User = { id: string; name: string; pin: string; role: Role };
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  reorderLevel: number | null;
};
type CartItem = { id: string; name: string; price: number; qty: number };
type TxStatus = "ACTIVE" | "VOIDED";
type Transaction = {
  txId: string;
  ts: number;
  items: CartItem[];
  total: number;
  cashier: string;
  discount: number;
  cash: number;
  change: number;
  status: TxStatus;
  voidReason: string;
};
type AuditEntry = { ts: number; user: string; action: string; details: string };
type ReceiptView = { tx: Transaction; isReprint: boolean };
type Tab = "sell" | "stock" | "history" | "reports";
type Period = "today" | "week" | "month";
type Msg = { text: string; type: "ok" | "err"; area: string } | null;

const CURRENCY = "₱";
const STORE_NAME = "My Store";
const peso = (n: number) => `${CURRENCY}${n.toFixed(2)}`;

const USERS: User[] = [
  { id: "U001", name: "Admin", pin: "1234", role: "Admin" },
  { id: "U002", name: "Cashier", pin: "5678", role: "Cashier" },
];

const SEED_PRODUCTS: Product[] = [
  { id: "P001", name: "Coffee", price: 75, stock: 30, barcode: "4801234567890", reorderLevel: 10 },
  { id: "P002", name: "Sandwich", price: 120, stock: 4, barcode: "", reorderLevel: 5 },
  { id: "P003", name: "Bottled Water", price: 30, stock: 96, barcode: "4809876543210", reorderLevel: 20 },
  { id: "P004", name: "Softdrinks", price: 15, stock: 25, barcode: "", reorderLevel: 10 },
  { id: "P005", name: "Egg", price: 10, stock: 20, barcode: "", reorderLevel: 12 },
  { id: "P006", name: "Candy", price: 2, stock: 5, barcode: "", reorderLevel: 10 },
  { id: "P007", name: "Milk", price: 14, stock: 8, barcode: "", reorderLevel: 10 },
];

/** Reconstructed from the real receipts + AuditLog export (totals: 135+165+90 = ₱390). */
function seedTransactions(now: number): Transaction[] {
  return [
    {
      txId: "TX17831812601881517",
      ts: now - 15 * 60000,
      items: [
        { id: "P001", name: "Coffee", price: 75, qty: 1 },
        { id: "P004", name: "Softdrinks", price: 15, qty: 1 },
      ],
      total: 90, cashier: "Admin", discount: 0, cash: 90, change: 0,
      status: "ACTIVE", voidReason: "",
    },
    {
      txId: "TX17831976808582598",
      ts: now - 10 * 60000,
      items: [
        { id: "P002", name: "Sandwich", price: 120, qty: 1 },
        { id: "P004", name: "Softdrinks", price: 15, qty: 1 },
      ],
      total: 135, cashier: "Admin", discount: 0, cash: 200, change: 65,
      status: "ACTIVE", voidReason: "",
    },
    {
      txId: "TX17831980752484321",
      ts: now - 5 * 60000,
      items: [
        { id: "P002", name: "Sandwich", price: 120, qty: 1 },
        { id: "P003", name: "Bottled Water", price: 30, qty: 1 },
        { id: "P004", name: "Softdrinks", price: 15, qty: 1 },
      ],
      total: 165, cashier: "Admin", discount: 0, cash: 200, change: 35,
      status: "ACTIVE", voidReason: "",
    },
  ];
}

function seedAudit(now: number): AuditEntry[] {
  return [
    { ts: now - 16 * 60000, user: "Admin", action: "LOGIN", details: "Logged in as Admin" },
    { ts: now - 15 * 60000, user: "Admin", action: "SALE", details: "TX17831812601881517 total 90 cash 90 change 0" },
    { ts: now - 10 * 60000, user: "Admin", action: "SALE", details: "TX17831976808582598 total 135 cash 200 change 65" },
    { ts: now - 5 * 60000, user: "Admin", action: "SALE", details: "TX17831980752484321 total 165 cash 200 change 35" },
  ];
}

const isLow = (p: Product) => p.reorderLevel !== null && p.stock <= p.reorderLevel;
const fmtTime = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

export function PosDemo() {
  const reduce = useReducedMotion();

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [loginId, setLoginId] = useState("U001");
  const [pin, setPin] = useState("");

  // Data — seeded in the login handler (an event handler, so clock reads and
  // setState are allowed there; this keeps render pure per the lint rules).
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [now, setNow] = useState(0);

  // UI
  const [tab, setTab] = useState<Tab>("sell");
  const [msg, setMsg] = useState<Msg>(null);

  // Sell
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pick, setPick] = useState("P001");
  const [qty, setQty] = useState("1");
  const [scan, setScan] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");
  const [receipt, setReceipt] = useState<ReceiptView | null>(null);

  // Stock forms
  const [inSel, setInSel] = useState("P001");
  const [inQty, setInQty] = useState("");
  const [inSupplier, setInSupplier] = useState("");
  const [adjSel, setAdjSel] = useState("P001");
  const [adjQty, setAdjQty] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [bcSel, setBcSel] = useState("P002");
  const [bcVal, setBcVal] = useState("");
  const [np, setNp] = useState({ name: "", barcode: "", price: "", stock: "" });

  // History
  const [histQuery, setHistQuery] = useState("");
  const [voidTarget, setVoidTarget] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");

  // Reports
  const [period, setPeriod] = useState<Period>("today");

  const isAdmin = user?.role === "Admin";
  const flash = (area: string, text: string, type: "ok" | "err") =>
    setMsg({ area, text, type });
  const logAudit = (action: string, details: string) =>
    setAudit((prev) => [
      ...prev,
      { ts: Date.now(), user: user?.name ?? "system", action, details },
    ]);

  const subtotal = useMemo(
    () => cart.reduce((s, c) => s + c.price * c.qty, 0),
    [cart],
  );
  const disc = Math.max(0, Number(discount) || 0);
  const grand = Math.max(0, subtotal - disc);
  const cashNum = Number(cash);
  const changeDue = cash !== "" && !isNaN(cashNum) ? cashNum - grand : null;
  const productById = (id: string) => products.find((p) => p.id === id);
  const inCart = (id: string) => cart.find((c) => c.id === id)?.qty ?? 0;

  // ---------- Auth ----------
  function doLogin() {
    const u = USERS.find((x) => x.id === loginId);
    if (!u) return flash("login", "Select a user.", "err");
    if (u.pin !== pin.trim()) {
      setAudit((prev) => [
        ...prev,
        { ts: Date.now(), user: u.name, action: "LOGIN_FAIL", details: "Incorrect PIN" },
      ]);
      return flash("login", "Incorrect PIN.", "err");
    }
    const t = Date.now();
    setNow(t);
    // Seed the demo data on first login (idempotent — re-login keeps history).
    setTransactions((prev) => (prev.length ? prev : seedTransactions(t)));
    setAudit((prev) => [
      ...(prev.length ? prev : seedAudit(t)),
      { ts: t, user: u.name, action: "LOGIN", details: `Logged in as ${u.role}` },
    ]);
    setUser(u);
    setPin("");
    setMsg(null);
    setTab("sell");
  }

  function logout() {
    setUser(null);
    setCart([]);
    setReceipt(null);
    setMsg(null);
    setVoidTarget(null);
  }

  // ---------- Sell ----------
  function addItem(p: Product, add: number) {
    const next = inCart(p.id) + add;
    if (next > p.stock) return flash("sell", `Only ${p.stock} ${p.name} in stock.`, "err");
    setCart((prev) => {
      const ex = prev.find((c) => c.id === p.id);
      if (ex) return prev.map((c) => (c.id === p.id ? { ...c, qty: next } : c));
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: add }];
    });
    setMsg(null);
  }

  function onScanEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = scan.trim();
    setScan("");
    if (!code) return;
    const p = products.find((x) => x.barcode && x.barcode === code);
    if (!p) return flash("sell", `No product with barcode "${code}".`, "err");
    addItem(p, 1);
  }

  function addByPick() {
    const p = productById(pick);
    const n = parseInt(qty, 10);
    if (!p) return;
    if (isNaN(n) || n <= 0) return flash("sell", "Enter a valid quantity.", "err");
    addItem(p, n);
  }

  function setLineQty(id: string, next: number) {
    const stock = productById(id)?.stock ?? 0;
    if (next <= 0) return setCart((prev) => prev.filter((c) => c.id !== id));
    if (next > stock) return flash("sell", `Only ${stock} in stock.`, "err");
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: next } : c)));
  }

  function completeSale() {
    if (cart.length === 0) return flash("sell", "Cart is empty.", "err");
    if (isNaN(cashNum) || cashNum < grand)
      return flash("sell", `Cash tendered must be at least ${peso(grand)}.`, "err");

    const change = Math.round((cashNum - grand) * 100) / 100;
    const txId = `TX${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    const tx: Transaction = {
      txId, ts: Date.now(), items: cart.slice(), total: grand,
      cashier: user!.name, discount: disc, cash: cashNum, change,
      status: "ACTIVE", voidReason: "",
    };
    setProducts((prev) =>
      prev.map((p) => {
        const sold = cart.find((c) => c.id === p.id);
        return sold ? { ...p, stock: p.stock - sold.qty } : p;
      }),
    );
    setTransactions((prev) => [...prev, tx]);
    logAudit("SALE", `${txId} total ${grand} cash ${cashNum} change ${change}`);
    setReceipt({ tx, isReprint: false });
    setCart([]);
    setDiscount("");
    setCash("");
    setMsg(null);
  }

  // ---------- Stock (Admin) ----------
  function submitStockIn() {
    const p = productById(inSel);
    const n = parseInt(inQty, 10);
    if (!p) return;
    if (isNaN(n) || n <= 0) return flash("stock", "Enter a valid quantity.", "err");
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: x.stock + n } : x)));
    logAudit("STOCK_IN", `${p.id} ${p.name} +${n}${inSupplier ? ` from ${inSupplier}` : ""}`);
    flash("stock", `Stocked in. ${p.name} now has ${p.stock + n}.`, "ok");
    setInQty("");
    setInSupplier("");
  }

  function submitAdjust() {
    const p = productById(adjSel);
    const n = parseInt(adjQty, 10);
    const reason = adjReason.trim();
    if (!p) return;
    if (isNaN(n) || n === 0) return flash("stock", "Enter a non-zero adjustment (e.g. -3 or 5).", "err");
    if (!reason) return flash("stock", "A reason is required.", "err");
    if (p.stock + n < 0) return flash("stock", `Adjustment would make stock negative (current: ${p.stock}).`, "err");
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: x.stock + n } : x)));
    logAudit("ADJUSTMENT", `${p.id} ${p.name} ${n > 0 ? "+" : ""}${n} — ${reason}`);
    flash("stock", `Adjusted. ${p.name} now has ${p.stock + n}.`, "ok");
    setAdjQty("");
    setAdjReason("");
  }

  function submitBarcode() {
    const p = productById(bcSel);
    const code = bcVal.trim();
    if (!p) return;
    if (!code) return flash("stock", "Enter a barcode.", "err");
    if (products.some((x) => x.barcode === code && x.id !== p.id))
      return flash("stock", `Barcode ${code} is already assigned.`, "err");
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, barcode: code } : x)));
    logAudit("BARCODE_SET", `${p.id} ${p.name} → ${code}`);
    flash("stock", `Barcode ${code} assigned to ${p.name}.`, "ok");
    setBcVal("");
  }

  function submitProduct() {
    const name = np.name.trim();
    const price = Number(np.price);
    const stock = parseInt(np.stock, 10);
    const barcode = np.barcode.trim();
    if (!name) return flash("stock", "Enter a product name.", "err");
    if (isNaN(price) || price < 0) return flash("stock", "Enter a valid price.", "err");
    if (isNaN(stock) || stock < 0) return flash("stock", "Enter a valid stock quantity.", "err");
    if (products.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      return flash("stock", `"${name}" already exists.`, "err");
    if (barcode && products.some((p) => p.barcode === barcode))
      return flash("stock", `Barcode ${barcode} is already assigned.`, "err");
    const maxNum = products.reduce((m, p) => {
      const match = /^P(\d+)$/.exec(p.id);
      return match ? Math.max(m, parseInt(match[1], 10)) : m;
    }, 0);
    const id = `P${String(maxNum + 1).padStart(3, "0")}`;
    setProducts((prev) => [...prev, { id, name, price, stock, barcode, reorderLevel: null }]);
    logAudit("PRODUCT_ADD", `${id} ${name} price ${price} stock ${stock}`);
    flash("stock", `Added ${name} (${id}).`, "ok");
    setNp({ name: "", barcode: "", price: "", stock: "" });
  }

  // ---------- History ----------
  const historyRows = useMemo(() => {
    const q = histQuery.trim().toLowerCase();
    return transactions
      .slice()
      .sort((a, b) => b.ts - a.ts)
      .filter((t) => {
        if (!q) return true;
        return `${t.txId} ${t.cashier} ${fmtTime(t.ts)}`.toLowerCase().includes(q);
      });
  }, [transactions, histQuery]);

  function confirmVoid() {
    const reason = voidReason.trim();
    if (!voidTarget) return;
    if (!reason) return flash("hist", "A reason is required to void.", "err");
    const tx = transactions.find((t) => t.txId === voidTarget);
    if (!tx || tx.status === "VOIDED") return;
    setProducts((prev) =>
      prev.map((p) => {
        const line = tx.items.find((it) => it.id === p.id);
        return line ? { ...p, stock: p.stock + line.qty } : p;
      }),
    );
    setTransactions((prev) =>
      prev.map((t) => (t.txId === voidTarget ? { ...t, status: "VOIDED", voidReason: reason } : t)),
    );
    logAudit("VOID", `${voidTarget} — ${reason}`);
    flash("hist", "Transaction voided and stock restored.", "ok");
    setVoidTarget(null);
    setVoidReason("");
  }

  // ---------- Reports ----------
  const report = useMemo(() => {
    const start = new Date(now || 0);
    start.setHours(0, 0, 0, 0);
    if (period === "week") start.setDate(start.getDate() - 6);
    else if (period === "month") start.setDate(start.getDate() - 29);
    const from = start.getTime();

    const active = transactions.filter((t) => t.status !== "VOIDED" && t.ts >= from);
    const sales = active.reduce((s, t) => s + t.total, 0);
    const prodAgg = new Map<string, { qty: number; revenue: number }>();
    const cashierAgg = new Map<string, { sales: number; count: number }>();
    for (const t of active) {
      const c = cashierAgg.get(t.cashier) ?? { sales: 0, count: 0 };
      c.sales += t.total;
      c.count += 1;
      cashierAgg.set(t.cashier, c);
      for (const it of t.items) {
        const a = prodAgg.get(it.name) ?? { qty: 0, revenue: 0 };
        a.qty += it.qty;
        a.revenue += it.price * it.qty;
        prodAgg.set(it.name, a);
      }
    }
    return {
      total: sales,
      count: active.length,
      avg: active.length ? sales / active.length : 0,
      top: [...prodAgg.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
      byCashier: [...cashierAgg.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.sales - a.sales),
    };
  }, [transactions, period, now]);

  const lowStock = products.filter(isLow);
  const shortId = (id: string) => (id.length > 12 ? `…${id.slice(-9)}` : id);

  // Reusable field styles
  const field =
    "w-full rounded-md border border-line bg-background px-3 py-1.5 text-sm outline-none focus:border-accent";
  const primaryBtn =
    "rounded-md bg-accent px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-strong disabled:opacity-45";

  const msgLine = (area: string) =>
    msg && msg.area === area ? (
      <p
        className={`mt-3 rounded-md px-3 py-2 text-xs ${
          msg.type === "err"
            ? "bg-red-500/10 text-red-600 dark:text-red-400"
            : "bg-accent/10 text-accent"
        }`}
      >
        {msg.text}
      </p>
    ) : null;

  // ---------- Render: login ----------
  if (!user) {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg tracking-tight">{STORE_NAME}</span>
            <span className="text-xs text-muted">Point of Sale</span>
          </div>
          <span className="rounded-full border border-accent/40 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-accent">
            Live demo
          </span>
        </div>
        <div className="mx-auto max-w-xs px-5 py-10 text-center">
          <h3 className="font-display text-lg">Sign in</h3>
          <p className="mt-1 text-xs text-muted">
            Choose a user and enter the PIN. Admin sees everything; Cashier sees
            only the Sell tab.
          </p>
          <div className="mt-5 space-y-2 text-left">
            <select
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className={field}
            >
              {USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
              type="password"
              inputMode="numeric"
              placeholder="PIN"
              className={field}
            />
            <button type="button" onClick={doLogin} className={`${primaryBtn} w-full`}>
              Login
            </button>
          </div>
          <p className="mt-4 text-[11px] text-muted">
            Admin PIN <span className="font-medium text-foreground">1234</span> · Cashier PIN{" "}
            <span className="font-medium text-foreground">5678</span>
          </p>
          {msgLine("login")}
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: "sell", label: "Sell" },
    { id: "stock", label: "Stock", adminOnly: true },
    { id: "history", label: "History" },
    { id: "reports", label: "Reports", adminOnly: true },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg tracking-tight">{STORE_NAME}</span>
          <span className="text-xs text-muted">Point of Sale</span>
        </div>
        <div className="flex items-center gap-3">
          {lowStock.length > 0 && (
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
              {lowStock.length} low
            </span>
          )}
          <span className="text-[11px] text-muted">
            {user.name} · {user.role}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-line px-2 py-1 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-line px-4 pt-3">
        {tabs
          .filter((t) => !t.adminOnly || isAdmin)
          .map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setMsg(null);
              }}
              className={`rounded-t-md px-3.5 py-2 text-sm transition-colors ${
                tab === t.id
                  ? "bg-accent text-background"
                  : "text-muted hover:text-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* ============ SELL ============ */}
            {tab === "sell" && (
              <div className="grid gap-5 sm:grid-cols-[1.25fr_1fr]">
                {/* Left: pick + grid */}
                <div>
                  <input
                    value={scan}
                    onChange={(e) => setScan(e.target.value)}
                    onKeyDown={onScanEnter}
                    placeholder="Scan barcode, then Enter (try 4801234567890)"
                    className={`${field} mb-2`}
                  />
                  <div className="mb-3 flex gap-2">
                    <select value={pick} onChange={(e) => setPick(e.target.value)} className={field}>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {peso(p.price)} (stock: {p.stock})
                          {isLow(p) ? " ⚠ LOW" : ""}
                        </option>
                      ))}
                    </select>
                    <input
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      type="number"
                      min="1"
                      className="w-16 rounded-md border border-line bg-background px-2 py-1.5 text-center text-sm outline-none focus:border-accent"
                    />
                    <button type="button" onClick={addByPick} className={primaryBtn}>
                      Add
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
                    {products.map((p) => {
                      const remaining = p.stock - inCart(p.id);
                      const soldOut = remaining <= 0;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={soldOut}
                          onClick={() => addItem(p, 1)}
                          className="group flex flex-col rounded-lg border border-line bg-background p-3 text-left transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <span className="flex items-center gap-1.5 text-sm font-medium leading-tight">
                            {p.name}
                            {isLow(p) && (
                              <span className="rounded bg-red-500/10 px-1 text-[9px] font-semibold text-red-600 dark:text-red-400">
                                LOW
                              </span>
                            )}
                          </span>
                          <span className="mt-1 text-sm text-accent">{peso(p.price)}</span>
                          <span className="mt-2 text-[11px] text-muted">
                            {soldOut ? "Sold out" : `${remaining} in stock`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: cart / receipt */}
                <div>
                  <AnimatePresence mode="wait">
                    {receipt ? (
                      <motion.div
                        key="receipt"
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Receipt view={receipt} />
                        <button
                          type="button"
                          onClick={() => setReceipt(null)}
                          className={`${primaryBtn} mt-3 w-full`}
                        >
                          Start new sale
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cart"
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <h3 className="mb-3 text-sm font-medium text-muted">Cart</h3>
                        {cart.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-line py-8 text-center text-sm text-muted">
                            Tap a product or scan to add
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {cart.map((c) => (
                              <li key={c.id} className="flex items-center gap-2 text-sm">
                                <span className="flex-1 truncate">{c.name}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    aria-label={`Decrease ${c.name}`}
                                    onClick={() => setLineQty(c.id, c.qty - 1)}
                                    className="flex h-6 w-6 items-center justify-center rounded border border-line transition-colors hover:border-accent hover:text-accent"
                                  >
                                    −
                                  </button>
                                  <span className="w-5 text-center tabular-nums">{c.qty}</span>
                                  <button
                                    type="button"
                                    aria-label={`Increase ${c.name}`}
                                    onClick={() => setLineQty(c.id, c.qty + 1)}
                                    className="flex h-6 w-6 items-center justify-center rounded border border-line transition-colors hover:border-accent hover:text-accent"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="w-16 text-right tabular-nums">
                                  {peso(c.price * c.qty)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                          <div className="flex justify-between text-muted">
                            <span>Subtotal</span>
                            <span className="tabular-nums">{peso(subtotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted">
                            <span>Discount ({CURRENCY})</span>
                            <input
                              value={discount}
                              onChange={(e) => setDiscount(e.target.value)}
                              type="number"
                              min="0"
                              placeholder="0"
                              className="w-20 rounded-md border border-line bg-background px-2 py-1 text-right text-sm outline-none focus:border-accent"
                            />
                          </div>
                          <div className="flex justify-between font-display text-lg">
                            <span>Total</span>
                            <span className="tabular-nums text-accent">{peso(grand)}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted">
                            <span>Cash ({CURRENCY})</span>
                            <input
                              value={cash}
                              onChange={(e) => setCash(e.target.value)}
                              type="number"
                              min="0"
                              placeholder="0.00"
                              className="w-24 rounded-md border border-line bg-background px-2 py-1 text-right text-sm outline-none focus:border-accent"
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Change</span>
                            <span
                              className={`tabular-nums ${
                                changeDue === null
                                  ? "text-muted"
                                  : changeDue < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-accent"
                              }`}
                            >
                              {changeDue === null
                                ? peso(0)
                                : changeDue < 0
                                  ? "Insufficient"
                                  : peso(changeDue)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={completeSale}
                          className={`${primaryBtn} mt-4 w-full`}
                        >
                          Complete sale
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {msgLine("sell")}
                </div>
              </div>
            )}

            {/* ============ STOCK ============ */}
            {tab === "stock" && isAdmin && (
              <div className="grid gap-4 md:grid-cols-2">
                <StockCard title="Stock In (restock / delivery)">
                  <ProductSelect value={inSel} onChange={setInSel} products={products} field={field} />
                  <div className="flex gap-2">
                    <input value={inQty} onChange={(e) => setInQty(e.target.value)} type="number" min="1" placeholder="Qty" className={field} />
                    <input value={inSupplier} onChange={(e) => setInSupplier(e.target.value)} placeholder="Supplier (optional)" className={field} />
                  </div>
                  <button type="button" onClick={submitStockIn} className={`${primaryBtn} w-full`}>Add stock</button>
                </StockCard>

                <StockCard title="Adjustment (correction / damage)">
                  <ProductSelect value={adjSel} onChange={setAdjSel} products={products} field={field} />
                  <div className="flex gap-2">
                    <input value={adjQty} onChange={(e) => setAdjQty(e.target.value)} type="number" placeholder="+/- Qty" className={field} />
                    <input value={adjReason} onChange={(e) => setAdjReason(e.target.value)} placeholder="Reason (required)" className={field} />
                  </div>
                  <button type="button" onClick={submitAdjust} className={`${primaryBtn} w-full`}>Apply adjustment</button>
                </StockCard>

                <StockCard title="Assign barcode">
                  <ProductSelect value={bcSel} onChange={setBcSel} products={products} field={field} />
                  <input value={bcVal} onChange={(e) => setBcVal(e.target.value)} placeholder="Barcode" className={field} />
                  <button type="button" onClick={submitBarcode} className={`${primaryBtn} w-full`}>Assign barcode</button>
                </StockCard>

                <StockCard title="Add new product">
                  <div className="flex gap-2">
                    <input value={np.name} onChange={(e) => setNp((f) => ({ ...f, name: e.target.value }))} placeholder="Product name" className={field} />
                    <input value={np.barcode} onChange={(e) => setNp((f) => ({ ...f, barcode: e.target.value }))} placeholder="Barcode (optional)" className={field} />
                  </div>
                  <div className="flex gap-2">
                    <input value={np.price} onChange={(e) => setNp((f) => ({ ...f, price: e.target.value }))} type="number" min="0" placeholder="Price" className={field} />
                    <input value={np.stock} onChange={(e) => setNp((f) => ({ ...f, stock: e.target.value }))} type="number" min="0" placeholder="Opening stock" className={field} />
                  </div>
                  <button type="button" onClick={submitProduct} className={`${primaryBtn} w-full`}>Save product</button>
                </StockCard>

                <div className="md:col-span-2">
                  {msgLine("stock")}
                </div>
              </div>
            )}

            {/* ============ HISTORY ============ */}
            {tab === "history" && (
              <div>
                <input
                  value={histQuery}
                  onChange={(e) => setHistQuery(e.target.value)}
                  placeholder="Search TXN id or cashier"
                  className={`${field} mb-3`}
                />
                <div className="overflow-hidden rounded-lg border border-line">
                  <table className="w-full text-sm">
                    <thead className="bg-background text-xs text-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Time</th>
                        <th className="px-3 py-2 text-left font-medium">TXN</th>
                        <th className="px-3 py-2 text-left font-medium">Cashier</th>
                        <th className="px-3 py-2 text-right font-medium">Total</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-muted">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        historyRows.map((t) => {
                          const voided = t.status === "VOIDED";
                          return (
                            <tr
                              key={t.txId}
                              className={`border-t border-line ${voided ? "text-muted line-through" : ""}`}
                              title={voided ? `VOIDED: ${t.voidReason}` : t.txId}
                            >
                              <td className="px-3 py-2">{fmtTime(t.ts)}</td>
                              <td className="px-3 py-2 tabular-nums">{shortId(t.txId)}</td>
                              <td className="px-3 py-2">{t.cashier}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{peso(t.total)}</td>
                              <td className="px-3 py-2">
                                <div className="flex justify-end gap-1.5 no-underline">
                                  <button
                                    type="button"
                                    onClick={() => setReceipt({ tx: t, isReprint: true })}
                                    className="rounded border border-line px-2 py-0.5 text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
                                  >
                                    Reprint
                                  </button>
                                  {isAdmin && !voided && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVoidTarget(t.txId);
                                        setVoidReason("");
                                      }}
                                      className="rounded border border-red-500/40 px-2 py-0.5 text-[11px] text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                                    >
                                      Void
                                    </button>
                                  )}
                                  {voided && (
                                    <span className="text-[11px] text-red-600 dark:text-red-400">VOIDED</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {receipt && (
                  <div className="mt-4 max-w-xs">
                    <Receipt view={receipt} />
                    <button
                      type="button"
                      onClick={() => setReceipt(null)}
                      className="mt-2 w-full rounded-md border border-line py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      Close receipt
                    </button>
                  </div>
                )}

                {voidTarget && (
                  <div className="mt-4 rounded-lg border border-red-500/30 bg-background p-3">
                    <p className="mb-2 text-xs text-muted">
                      Voiding <span className="tabular-nums">{voidTarget}</span> — restores stock and keeps the record.
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={voidReason}
                        onChange={(e) => setVoidReason(e.target.value)}
                        placeholder="Reason (required)"
                        className={field}
                      />
                      <button
                        type="button"
                        onClick={confirmVoid}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoidTarget(null)}
                        className="rounded-md border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {msgLine("hist")}
              </div>
            )}

            {/* ============ REPORTS ============ */}
            {tab === "reports" && isAdmin && (
              <div>
                <div className="mb-4 flex gap-1.5">
                  {(["today", "week", "month"] as Period[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                        period === p ? "bg-accent text-background" : "border border-line text-muted hover:border-accent"
                      }`}
                    >
                      {p === "today" ? "Today" : p === "week" ? "Last 7 days" : "Last 30 days"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Total sales" value={peso(report.total)} />
                  <Stat label="Transactions" value={String(report.count)} />
                  <Stat label="Avg. sale" value={peso(report.avg)} />
                </div>

                {lowStock.length > 0 && (
                  <ReportTable
                    title="Low stock"
                    head={["Product", "Stock", "Reorder"]}
                    rows={lowStock.map((p) => [p.name, String(p.stock), String(p.reorderLevel ?? "")])}
                    highlightFirstCol
                  />
                )}

                <ReportTable
                  title="Top products"
                  head={["Product", "Qty sold", "Revenue"]}
                  rows={report.top.map((p) => [p.name, String(p.qty), peso(p.revenue)])}
                  empty="No sales in this period"
                />

                <ReportTable
                  title="Sales by cashier"
                  head={["Cashier", "Transactions", "Sales"]}
                  rows={report.byCashier.map((c) => [c.name, String(c.count), peso(c.sales)])}
                  empty="No sales in this period"
                />

                <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
                  Audit log
                </h4>
                <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-line">
                  <table className="w-full text-xs">
                    <tbody>
                      {audit
                        .slice()
                        .reverse()
                        .slice(0, 12)
                        .map((a, i) => (
                          <tr key={`${a.ts}-${i}`} className="border-t border-line first:border-t-0">
                            <td className="whitespace-nowrap px-3 py-1.5 text-muted">{fmtTime(a.ts)}</td>
                            <td className="px-3 py-1.5">{a.user}</td>
                            <td className="px-3 py-1.5">
                              <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">{a.action}</span>
                            </td>
                            <td className="px-3 py-1.5 text-muted">{a.details}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Small presentational helpers ----------

function Receipt({ view }: { view: ReceiptView }) {
  const { tx, isReprint } = view;
  return (
    <div className="rounded-lg border border-dashed border-line bg-background p-4 font-mono text-xs">
      <p className="text-center font-display text-sm font-semibold">{STORE_NAME}</p>
      <p className="text-center text-muted">Sales Receipt</p>
      {isReprint && <p className="text-center font-semibold text-accent">*** REPRINT ***</p>}
      <div className="my-2 border-t border-dashed border-line" />
      <p>TXN: {tx.txId}</p>
      <p>{new Date(tx.ts).toLocaleString()}</p>
      <p>Cashier: {tx.cashier}</p>
      <div className="my-2 border-t border-dashed border-line" />
      {tx.items.map((it) => (
        <div key={it.id} className="flex justify-between">
          <span>
            {it.name} ×{it.qty}
          </span>
          <span>{peso(it.price * it.qty)}</span>
        </div>
      ))}
      <div className="my-2 border-t border-dashed border-line" />
      <Row label="Subtotal" value={peso(tx.items.reduce((s, it) => s + it.price * it.qty, 0))} />
      <Row label="Discount" value={peso(tx.discount)} />
      <div className="flex justify-between font-semibold">
        <span>Grand Total</span>
        <span>{peso(tx.total)}</span>
      </div>
      <Row label="Cash" value={peso(tx.cash)} />
      <Row label="Change" value={peso(tx.change)} />
      <div className="my-2 border-t border-dashed border-line" />
      <p className="text-center">{tx.status === "VOIDED" ? "— VOIDED —" : "Thank you!"}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StockCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-background p-3">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ProductSelect({
  value,
  onChange,
  products,
  field,
}: {
  value: string;
  onChange: (v: string) => void;
  products: Product[];
  field: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} (stock: {p.stock}){isLow(p) ? " ⚠ LOW" : ""}
        </option>
      ))}
    </select>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-background p-3 text-center">
      <div className="font-display text-xl tabular-nums text-accent">{value}</div>
      <div className="mt-1 text-[11px] text-muted">{label}</div>
    </div>
  );
}

function ReportTable({
  title,
  head,
  rows,
  empty,
  highlightFirstCol,
}: {
  title: string;
  head: string[];
  rows: string[][];
  empty?: string;
  highlightFirstCol?: boolean;
}) {
  return (
    <div className="mt-5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h4>
      <div className="mt-2 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-background text-xs text-muted">
            <tr>
              {head.map((h, i) => (
                <th key={h} className={`px-3 py-2 font-medium ${i === 0 ? "text-left" : "text-right"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={head.length} className="px-3 py-4 text-center text-muted">
                  {empty ?? "No data"}
                </td>
              </tr>
            ) : (
              rows.map((r, ri) => (
                <tr key={ri} className="border-t border-line">
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-3 py-2 ${ci === 0 ? "text-left" : "text-right tabular-nums"} ${
                        highlightFirstCol && ci === 1 ? "text-red-600 dark:text-red-400" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
