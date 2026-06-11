"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Live, self-contained recreation of Jereme's Google Apps Script POS system.
 * Runs entirely in the browser with in-memory state — no backend, no login —
 * so any visitor can try the real flow: build a cart, apply a discount,
 * complete a sale, and get a receipt. Mirrors the original's stock control,
 * auto-generated product IDs, duplicate detection, and transaction IDs.
 */

type Product = { id: string; name: string; price: number; stock: number };
type CartItem = { id: string; name: string; price: number; qty: number };
type Receipt = {
  id: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
};
type Msg = { text: string; type: "ok" | "err" } | null;

const CURRENCY = "₱";
const STORE_NAME = "My Store";

const SEED: Product[] = [
  { id: "P001", name: "Coffee", price: 75, stock: 50 },
  { id: "P002", name: "Sandwich", price: 120, stock: 20 },
  { id: "P003", name: "Bottled Water", price: 30, stock: 100 },
  { id: "P004", name: "Softdrinks", price: 30, stock: 40 },
  { id: "P005", name: "Egg", price: 10, stock: 20 },
  { id: "P006", name: "Candy", price: 2, stock: 8 },
  { id: "P007", name: "Milk", price: 14, stock: 15 },
];

const peso = (n: number) => `${CURRENCY}${n.toFixed(2)}`;

export function PosDemo() {
  const reduce = useReducedMotion();
  const [products, setProducts] = useState<Product[]>(SEED);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", stock: "" });

  const subtotal = useMemo(
    () => cart.reduce((s, c) => s + c.price * c.qty, 0),
    [cart],
  );
  const disc = Math.max(0, Number(discount) || 0);
  const total = Math.max(0, subtotal - disc);

  function inCart(id: string) {
    return cart.find((c) => c.id === id)?.qty ?? 0;
  }

  function addToCart(p: Product) {
    const current = inCart(p.id);
    if (current + 1 > p.stock) {
      setMsg({ text: `Only ${p.stock} ${p.name} in stock.`, type: "err" });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id);
      if (existing) {
        return prev.map((c) =>
          c.id === p.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
    setMsg(null);
  }

  function setQty(id: string, qty: number) {
    const stock = products.find((p) => p.id === id)?.stock ?? 0;
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    if (qty > stock) {
      setMsg({ text: `Only ${stock} in stock.`, type: "err" });
      return;
    }
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  }

  function completeSale() {
    if (cart.length === 0) {
      setMsg({ text: "Cart is empty.", type: "err" });
      return;
    }
    const ts = Date.now();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const sale: Receipt = {
      id: `TX${ts}${rand}`,
      date: new Date(),
      items: cart.slice(),
      subtotal,
      discount: disc,
      total,
    };
    // Deduct stock, exactly like the server-side saveTransaction()
    setProducts((prev) =>
      prev.map((p) => {
        const sold = cart.find((c) => c.id === p.id);
        return sold ? { ...p, stock: p.stock - sold.qty } : p;
      }),
    );
    setReceipt(sale);
    setCart([]);
    setDiscount("");
    setMsg(null);
  }

  function newSale() {
    setReceipt(null);
    setMsg(null);
  }

  function submitProduct() {
    const name = form.name.trim();
    const price = Number(form.price);
    const stock = parseInt(form.stock, 10);
    if (!name) return setMsg({ text: "Enter a product name.", type: "err" });
    if (isNaN(price) || price < 0)
      return setMsg({ text: "Enter a valid price.", type: "err" });
    if (isNaN(stock) || stock < 0)
      return setMsg({ text: "Enter a valid stock quantity.", type: "err" });
    if (
      products.some((p) => p.name.toLowerCase() === name.toLowerCase())
    )
      return setMsg({ text: `"${name}" already exists.`, type: "err" });

    // Auto-generate the next P### id, mirroring the Apps Script logic
    const maxNum = products.reduce((m, p) => {
      const match = /^P(\d+)$/.exec(p.id);
      return match ? Math.max(m, parseInt(match[1], 10)) : m;
    }, 0);
    const id = `P${String(maxNum + 1).padStart(3, "0")}`;
    setProducts((prev) => [...prev, { id, name, price, stock }]);
    setForm({ name: "", price: "", stock: "" });
    setShowAdd(false);
    setMsg({ text: `Added ${name} (${id}).`, type: "ok" });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg tracking-tight">
            {STORE_NAME}
          </span>
          <span className="text-xs text-muted">Point of Sale</span>
        </div>
        <span className="rounded-full border border-accent/40 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-accent">
          Live demo
        </span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[1.3fr_1fr]">
        {/* Catalog */}
        <div className="border-b border-line p-5 sm:border-b-0 sm:border-r">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted">Products</h3>
            <button
              type="button"
              onClick={() => setShowAdd((v) => !v)}
              className="text-xs text-accent transition-colors hover:text-accent-strong"
            >
              {showAdd ? "Cancel" : "+ Add product"}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showAdd && (
              <motion.div
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="space-y-2 rounded-lg border border-line bg-background p-3">
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Product name"
                    className="w-full rounded-md border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
                  />
                  <div className="flex gap-2">
                    <input
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      type="number"
                      min="0"
                      placeholder="Price"
                      className="w-full rounded-md border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
                    />
                    <input
                      value={form.stock}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stock: e.target.value }))
                      }
                      type="number"
                      min="0"
                      placeholder="Stock"
                      className="w-full rounded-md border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={submitProduct}
                    className="w-full rounded-md bg-foreground py-2 text-sm text-background transition-colors hover:bg-accent-strong"
                  >
                    Save product
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
            {products.map((p) => {
              const remaining = p.stock - inCart(p.id);
              const soldOut = remaining <= 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={soldOut}
                  onClick={() => addToCart(p)}
                  className="group flex flex-col rounded-lg border border-line bg-background p-3 text-left transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span className="text-sm font-medium leading-tight">
                    {p.name}
                  </span>
                  <span className="mt-1 text-sm text-accent">
                    {peso(p.price)}
                  </span>
                  <span className="mt-2 text-[11px] text-muted">
                    {soldOut ? "Sold out" : `${remaining} in stock`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart / Receipt */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {receipt ? (
              <motion.div
                key="receipt"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
              >
                <div className="rounded-lg border border-dashed border-line bg-background p-4 font-mono text-xs">
                  <p className="text-center font-display text-sm font-semibold">
                    {STORE_NAME}
                  </p>
                  <p className="text-center text-muted">Sales Receipt</p>
                  <div className="my-2 border-t border-dashed border-line" />
                  <p>TXN: {receipt.id}</p>
                  <p>{receipt.date.toLocaleString()}</p>
                  <div className="my-2 border-t border-dashed border-line" />
                  {receipt.items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.name} ×{it.qty}
                      </span>
                      <span>{peso(it.price * it.qty)}</span>
                    </div>
                  ))}
                  <div className="my-2 border-t border-dashed border-line" />
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{peso(receipt.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>{peso(receipt.discount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Grand Total</span>
                    <span>{peso(receipt.total)}</span>
                  </div>
                  <div className="my-2 border-t border-dashed border-line" />
                  <p className="text-center">Thank you!</p>
                </div>
                <button
                  type="button"
                  onClick={newSale}
                  className="mt-3 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-strong"
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
                    Tap a product to add it
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {cart.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="flex-1 truncate">{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={`Decrease ${c.name}`}
                            onClick={() => setQty(c.id, c.qty - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-line transition-colors hover:border-accent hover:text-accent"
                          >
                            −
                          </button>
                          <span className="w-5 text-center tabular-nums">
                            {c.qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${c.name}`}
                            onClick={() => setQty(c.id, c.qty + 1)}
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

                {/* Totals */}
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
                    <span className="tabular-nums text-accent">
                      {peso(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={completeSale}
                  className="mt-4 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-strong"
                >
                  Complete sale
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {msg && (
            <p
              className={`mt-3 rounded-md px-3 py-2 text-xs ${
                msg.type === "err"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {msg.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
