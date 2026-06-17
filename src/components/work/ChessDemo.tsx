"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Chess, type Square } from "chess.js";

/* ───────────────────────── engine (lightweight, design-focused) ──────────
   A small alpha-beta negamax with a material + center evaluation. It is not
   Stockfish — the shipped Flutter app uses Stockfish 18 on-device — but it is
   plenty to drive a faithful preview of the coaching analysis UI: the five
   best moves, their evaluations, principal variations, and coach's notes. */

const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};
const MATE = 100000;
const ROOT_DEPTH = 2; // plies searched beyond each candidate move
const RANK_COLORS = ["#1BBF9E", "#3B97D3", "#7E8CE0", "#B58CD0", "#C98AB0"];

// Opening book (FEN key = placement + side to move) of mainline theory. Used to
// label candidate moves Book / Mainline / Sideline and to name the position in
// the header. Keys were generated and validated with chess.js.
const BOOK: Record<string, { name: string; moves: string[] }> = {
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w": {
    name: "Starting position",
    moves: ["e2e4", "d2d4", "g1f3", "c2c4"],
  },
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b": {
    name: "King's Pawn Opening",
    moves: ["c7c5", "e7e5", "e7e6", "c7c6", "g8f6", "d7d5", "d7d6"],
  },
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w": {
    name: "Open Game",
    moves: ["g1f3", "f1c4", "b1c3", "f2f4", "d2d4"],
  },
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b": {
    name: "King's Knight Opening",
    moves: ["b8c6", "g8f6", "d7d6"],
  },
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w": {
    name: "Open Game: Knights Out",
    moves: ["f1b5", "f1c4", "d2d4", "b1c3"],
  },
  "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b": {
    name: "Ruy Lopez (Spanish)",
    moves: ["a7a6", "g8f6", "f8c5", "f7f5", "g8e7"],
  },
  "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w": {
    name: "Ruy Lopez: Morphy Defence",
    moves: ["b5a4", "b5c6", "b5c4"],
  },
  "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b": {
    name: "Italian Game",
    moves: ["f8c5", "g8f6", "f8e7"],
  },
  "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w": {
    name: "Giuoco Piano",
    moves: ["c2c3", "d2d3", "b2b4", "e1g1"],
  },
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w": {
    name: "Two Knights Defence",
    moves: ["f3g5", "d2d4", "d2d3", "b1c3"],
  },
  "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b": {
    name: "Scotch Game",
    moves: ["e5d4"],
  },
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b": {
    name: "Four Knights Game",
    moves: ["g8f6", "f8b4", "f8c5"],
  },
  "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w": {
    name: "Caro-Kann Defence",
    moves: ["d2d4", "b1c3", "g1f3"],
  },
  "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w": {
    name: "French Defence",
    moves: ["d2d4", "b1c3", "g1f3"],
  },
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w": {
    name: "Sicilian Defence",
    moves: ["g1f3", "b1c3", "c2c3", "d2d4"],
  },
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b": {
    name: "Sicilian: Open Setup",
    moves: ["d7d6", "b8c6", "e7e6", "g7g6", "a7a6"],
  },
  "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w": {
    name: "Scandinavian Defence",
    moves: ["e4d5"],
  },
  "rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w": {
    name: "Pirc Defence",
    moves: ["d2d4"],
  },
  "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b": {
    name: "Queen's Pawn Opening",
    moves: ["d7d5", "g8f6", "e7e6", "g7g6"],
  },
  "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w": {
    name: "Closed Game",
    moves: ["c2c4", "g1f3", "c1f4", "e2e3"],
  },
  "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b": {
    name: "Queen's Gambit",
    moves: ["e7e6", "c7c6", "d5c4", "e7e5"],
  },
  "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w": {
    name: "Queen's Gambit Declined",
    moves: ["b1c3", "g1f3", "c4d5"],
  },
  "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w": {
    name: "Slav Defence",
    moves: ["g1f3", "b1c3", "c4d5"],
  },
  "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w": {
    name: "Queen's Gambit Accepted",
    moves: ["g1f3", "e2e4", "e2e3"],
  },
  "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w": {
    name: "Indian Defence",
    moves: ["c2c4", "g1f3", "c1g5"],
  },
  "rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b": {
    name: "Indian Game",
    moves: ["e7e6", "g7g6", "c7c5", "e7e5"],
  },
  "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w": {
    name: "Indian: 2...e6",
    moves: ["b1c3", "g1f3", "g2g3"],
  },
  "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/2N5/PP2PPPP/R1BQKBNR b": {
    name: "Nimzo-Indian Setup",
    moves: ["f8b4", "d7d5", "c7c5"],
  },
  "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w": {
    name: "King's Indian / Grünfeld",
    moves: ["b1c3", "g1f3", "g2g3"],
  },
  "rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b": {
    name: "King's Indian: 3.Nc3",
    moves: ["f8g7", "d7d5"],
  },
  "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w": {
    name: "Grünfeld Defence",
    moves: ["c4d5", "g1f3", "d1b3"],
  },
  "rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b": {
    name: "Réti Opening",
    moves: ["d7d5", "g8f6", "c7c5", "g7g6"],
  },
  "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b": {
    name: "English Opening",
    moves: ["e7e5", "c7c5", "g8f6", "e7e6", "g7g6"],
  },
  "rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w": {
    name: "English: Reversed Sicilian",
    moves: ["b1c3", "g2g3", "g1f3"],
  },
};

const fenKey = (fen: string) => fen.split(/\s+/).slice(0, 2).join(" ");
const CENTER = new Set(["d4", "e4", "d5", "e5"]);
const BIG_CENTER = new Set([
  "c3", "d3", "e3", "f3", "c4", "d4", "e4", "f4",
  "c5", "d5", "e5", "f5", "c6", "d6", "e6", "f6",
]);

function evalWhite(game: Chess): number {
  if (game.isCheckmate()) return game.turn() === "w" ? -MATE : MATE;
  if (game.isDraw() || game.isStalemate()) return 0;
  let score = 0;
  for (const row of game.board()) {
    for (const sq of row) {
      if (!sq) continue;
      const base = PIECE_VALUE[sq.type];
      let positional = 0;
      if (CENTER.has(sq.square)) positional += 18;
      else if (BIG_CENTER.has(sq.square)) positional += 8;
      score += (sq.color === "w" ? 1 : -1) * (base + positional);
    }
  }
  return score;
}

function negamax(game: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || game.isGameOver()) {
    return evalWhite(game) * (game.turn() === "w" ? 1 : -1);
  }
  let best = -Infinity;
  // Captures first for cheap move ordering.
  const moves = game
    .moves({ verbose: true })
    .sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));
  for (const m of moves) {
    game.move(m);
    const score = -negamax(game, depth - 1, -beta, -alpha);
    game.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

type Line = {
  rank: number;
  san: string;
  from: string;
  to: string;
  uci: string;
  scoreWhite: number;
  mate: boolean;
  pv: string[];
  kind: "Book" | "Mainline" | "Sideline";
};

function shallowBest(game: Chess): { from: string; to: string; san: string } | null {
  const moves = game.moves({ verbose: true });
  let best = null as null | { from: string; to: string; san: string };
  let bestScore = -Infinity;
  for (const m of moves) {
    game.move(m);
    const s = -negamax(game, 1, -Infinity, Infinity);
    game.undo();
    if (s > bestScore) {
      bestScore = s;
      best = { from: m.from, to: m.to, san: m.san };
    }
  }
  return best;
}

function buildPv(fen: string, firstSan: string, plies = 6): string[] {
  const game = new Chess(fen);
  const pv: string[] = [];
  try {
    game.move(firstSan);
    pv.push(firstSan);
  } catch {
    return pv;
  }
  for (let i = 0; i < plies - 1 && !game.isGameOver(); i++) {
    const b = shallowBest(game);
    if (!b) break;
    game.move({ from: b.from as Square, to: b.to as Square, promotion: "q" });
    pv.push(b.san);
  }
  return pv;
}

function analyze(fen: string): Line[] {
  const root = new Chess(fen);
  const whiteToMove = root.turn() === "w";
  const book = BOOK[fenKey(fen)];
  const scored = root.moves({ verbose: true }).map((m) => {
    root.move(m);
    let moverScore: number;
    let mate = false;
    if (root.isCheckmate()) {
      moverScore = MATE;
      mate = true;
    } else {
      moverScore = -negamax(root, ROOT_DEPTH, -Infinity, Infinity);
    }
    root.undo();
    const uci = m.from + m.to + (m.promotion ?? "");
    return {
      san: m.san,
      from: m.from,
      to: m.to,
      uci,
      moverScore,
      mate,
      scoreWhite: whiteToMove ? moverScore : -moverScore,
    };
  });

  scored.sort((a, b) => b.moverScore - a.moverScore);

  return scored.slice(0, 5).map((s, i) => ({
    rank: i + 1,
    san: s.san,
    from: s.from,
    to: s.to,
    uci: s.uci,
    scoreWhite: s.scoreWhite,
    mate: s.mate,
    pv: buildPv(fen, s.san),
    kind: book?.moves.includes(s.uci)
      ? "Book"
      : i === 0
        ? "Mainline"
        : "Sideline",
  }));
}

/* ───────────────────────────── coaching notes ───────────────────────────── */

function coachNote(fen: string, line: Line, bestWhite: number, whiteToMove: boolean): string {
  const parts: string[] = [];
  const intent = moveIntent(fen, line);
  if (intent) parts.push(intent);

  if (line.mate) parts.unshift("Forced checkmate — the sharpest finish.");

  if (line.rank === 1) {
    parts.push(`The engine prefers this — ${assess(line.scoreWhite, whiteToMove)}.`);
  } else {
    const gap = whiteToMove ? bestWhite - line.scoreWhite : line.scoreWhite - bestWhite;
    if (gap <= 20) parts.push("Almost as strong as the top move.");
    else if (gap <= 90) parts.push("Playable, but gives a little back.");
    else parts.push(`Weaker — about ${(gap / 100).toFixed(1)} pawns behind the best move.`);
  }
  if (line.kind === "Book") parts.push("This follows established theory.");
  return parts.join(" ");
}

function moveIntent(fen: string, line: Line): string | null {
  const g = new Chess(fen);
  const piece = g.get(line.from as Square);
  const target = g.get(line.to as Square);
  const isCastle = line.san.startsWith("O-O");
  const check = line.san.includes("+") || line.san.includes("#");
  const capture = !!target;
  if (isCastle) return "Castles — tucks the king away and connects the rooks.";
  if (check && capture) return "A forcing capture with check.";
  if (check) return "Gives check and seizes the initiative.";
  if (capture) return "Wins material or trades to clarify the position.";
  switch (piece?.type) {
    case "p":
      return "A pawn move — claims space and shapes the center.";
    case "n":
      return "Develops the knight toward active squares.";
    case "b":
      return "Activates the bishop along its diagonal.";
    case "r":
      return "Brings the rook into play on an open file.";
    case "q":
      return "Repositions the queen with purpose.";
    case "k":
      return "A king move — improves safety or activity.";
    default:
      return null;
  }
}

function assess(scoreWhite: number, whiteToMove: boolean): string {
  const moverCp = whiteToMove ? scoreWhite : -scoreWhite;
  if (Math.abs(scoreWhite) >= MATE - 1000) return "it forces mate";
  if (moverCp > 150) return "it keeps a clear advantage";
  if (moverCp > 40) return "it holds a small edge";
  if (moverCp > -40) return "it keeps the balance";
  return "it is the most resilient defense";
}

function fmtEval(scoreWhite: number, mate: boolean): string {
  if (mate || Math.abs(scoreWhite) >= MATE - 1000) return scoreWhite > 0 ? "#" : "-#";
  const pawns = Math.max(-99, Math.min(99, scoreWhite / 100));
  return (pawns >= 0 ? "+" : "") + pawns.toFixed(2);
}

function winProb(scoreWhite: number): number {
  if (Math.abs(scoreWhite) >= MATE - 1000) return scoreWhite > 0 ? 1 : 0;
  return 1 / (1 + Math.pow(10, -scoreWhite / 400));
}

/* ─────────────────────────────── board glyphs ───────────────────────────── */

const GLYPH: Record<string, string> = {
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

/* ─────────────────────────────── component ─────────────────────────────── */

export function ChessDemo() {
  const reduce = useReducedMotion();
  const [fen, setFen] = useState(() => new Chess().fen());
  const [selected, setSelected] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [lines, setLines] = useState<Line[]>([]);
  const [thinking, setThinking] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [hoverRank, setHoverRank] = useState<number | null>(null);

  const game = useMemo(() => new Chess(fen), [fen]);
  const whiteToMove = game.turn() === "w";
  const book = BOOK[fenKey(fen)];

  // Recompute analysis whenever the position changes (async so UI stays snappy).
  useEffect(() => {
    let cancelled = false;
    setThinking(true);
    const t = setTimeout(() => {
      const result = analyze(fen);
      if (!cancelled) {
        setLines(result);
        setThinking(false);
      }
    }, 30);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [fen]);

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(
      game.moves({ square: selected as Square, verbose: true }).map((m) => m.to),
    );
  }, [game, selected]);

  const playMove = useCallback(
    (from: string, to: string) => {
      const next = new Chess(fen);
      try {
        next.move({ from: from as Square, to: to as Square, promotion: "q" });
      } catch {
        return false;
      }
      setFen(next.fen());
      setSelected(null);
      return true;
    },
    [fen],
  );

  const onSquare = (sq: string) => {
    if (game.isGameOver()) return;
    if (selected && legalTargets.has(sq)) {
      playMove(selected, sq);
      return;
    }
    const piece = game.get(sq as Square);
    if (piece && piece.color === game.turn()) setSelected(sq);
    else setSelected(null);
  };

  const reset = () => {
    setFen(new Chess().fen());
    setSelected(null);
  };
  const undo = () => {
    const g = new Chess(fen);
    if (g.history().length === 0) return;
    g.undo();
    setFen(g.fen());
    setSelected(null);
  };

  const best = lines[0];
  const status = game.isCheckmate()
    ? `Checkmate — ${whiteToMove ? "Black" : "White"} wins`
    : game.isDraw()
      ? "Draw"
      : game.inCheck()
        ? `${whiteToMove ? "White" : "Black"} to move — in check`
        : `${whiteToMove ? "White" : "Black"} to move`;

  // Build the display matrix honoring orientation.
  const board = game.board();
  const rows = orientation === "w" ? board : [...board].reverse().map((r) => [...r].reverse());

  const square = (file: number, rankIdx: number) => {
    const f = orientation === "w" ? file : 7 - file;
    const r = orientation === "w" ? 7 - rankIdx : rankIdx;
    return FILES[f] + (r + 1);
  };

  // SVG arrow coordinates for candidate moves (viewBox 0..8).
  const sqCenter = (alg: string) => {
    const file = FILES.indexOf(alg[0]);
    const rank = parseInt(alg[1], 10) - 1;
    const x = (orientation === "w" ? file : 7 - file) + 0.5;
    const y = (orientation === "w" ? 7 - rank : rank) + 0.5;
    return { x, y };
  };

  const arrowsToShow = showArrows
    ? lines.filter((l) => hoverRank == null || l.rank === hoverRank)
    : hoverRank != null
      ? lines.filter((l) => l.rank === hoverRank)
      : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="font-display text-sm tracking-tight text-foreground">
            Coaching Analysis
          </p>
          <p className="text-xs text-muted">
            {book ? book.name : "Five best moves, explained"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowArrows((s) => !s)}
            className="rounded-md border border-line px-2 py-1 text-muted transition-colors hover:text-accent"
          >
            {showArrows ? "Hide arrows" : "Show arrows"}
          </button>
          <button
            onClick={() => setOrientation((o) => (o === "w" ? "b" : "w"))}
            className="rounded-md border border-line px-2 py-1 text-muted transition-colors hover:text-accent"
          >
            Flip
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[auto_1fr]">
        {/* board + eval bar */}
        <div className="flex gap-2">
          <EvalBarV prob={best ? winProb(best.scoreWhite) : 0.5} />
          <div className="relative">
            <div
              className="grid select-none overflow-hidden rounded-lg border border-line"
              style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))", width: "min(70vw, 380px)" }}
            >
              {rows.map((row, rankIdx) =>
                row.map((cell, file) => {
                  const alg = square(file, rankIdx);
                  const dark = (file + rankIdx) % 2 === 1;
                  const isSel = selected === alg;
                  const isTarget = legalTargets.has(alg);
                  return (
                    <button
                      key={alg}
                      onClick={() => onSquare(alg)}
                      className="relative flex aspect-square items-center justify-center"
                      style={{
                        background: isSel
                          ? "var(--accent)"
                          : dark
                            ? "#b58863"
                            : "#edd6b0",
                      }}
                    >
                      {cell && (
                        <span
                          style={{
                            fontSize: "min(8vw, 30px)",
                            lineHeight: 1,
                            color: cell.color === "w" ? "#fbfbf8" : "#1c1b1a",
                            textShadow:
                              cell.color === "w"
                                ? "0 1px 1px rgba(0,0,0,.45)"
                                : "0 1px 0 rgba(255,255,255,.25)",
                          }}
                        >
                          {GLYPH[cell.type]}
                        </span>
                      )}
                      {isTarget && (
                        <span
                          className="pointer-events-none absolute h-1/3 w-1/3 rounded-full"
                          style={{ background: "rgba(27,191,158,.55)" }}
                        />
                      )}
                    </button>
                  );
                }),
              )}
            </div>

            {/* candidate arrows */}
            <svg
              viewBox="0 0 8 8"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <defs>
                {RANK_COLORS.map((c, i) => (
                  <marker
                    key={i}
                    id={`ah-${i}`}
                    markerWidth="3"
                    markerHeight="3"
                    refX="1.6"
                    refY="1.5"
                    orient="auto"
                  >
                    <path d="M0,0 L3,1.5 L0,3 Z" fill={c} />
                  </marker>
                ))}
              </defs>
              <AnimatePresence>
                {arrowsToShow.map((l) => {
                  const a = sqCenter(l.from);
                  const b = sqCenter(l.to);
                  const c = RANK_COLORS[l.rank - 1];
                  return (
                    <motion.line
                      key={l.uci}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: l.rank === 1 ? 0.95 : 0.55 }}
                      exit={{ opacity: 0 }}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={c}
                      strokeWidth={l.rank === 1 ? 0.16 : 0.11}
                      strokeLinecap="round"
                      markerEnd={`url(#ah-${l.rank - 1})`}
                    />
                  );
                })}
              </AnimatePresence>
            </svg>
          </div>
        </div>

        {/* coaching panel */}
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{status}</p>
            {thinking ? (
              <span className="text-xs text-muted">analyzing…</span>
            ) : best ? (
              <span className="text-xs text-muted">
                {best.mate ? "Mate found" : `eval ${fmtEval(best.scoreWhite, best.mate)}`}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {lines.map((l) => (
                <motion.button
                  key={l.uci}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onMouseEnter={() => setHoverRank(l.rank)}
                  onMouseLeave={() => setHoverRank(null)}
                  onClick={() => playMove(l.from, l.to)}
                  className="rounded-xl border border-line bg-background/40 p-3 text-left transition-colors hover:border-accent"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        color: RANK_COLORS[l.rank - 1],
                        border: `1.5px solid ${RANK_COLORS[l.rank - 1]}`,
                        background: `${RANK_COLORS[l.rank - 1]}22`,
                      }}
                    >
                      {l.rank}
                    </span>
                    <span className="text-base font-bold text-foreground">{l.san}</span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        color: l.kind === "Sideline" ? "var(--muted)" : RANK_COLORS[0],
                        background: l.kind === "Sideline" ? "transparent" : `${RANK_COLORS[0]}1f`,
                        border: l.kind === "Sideline" ? "1px solid var(--line)" : "none",
                      }}
                    >
                      {l.kind}
                    </span>
                    <span className="ml-auto rounded-md bg-foreground/90 px-2 py-0.5 text-xs font-bold text-background">
                      {fmtEval(l.scoreWhite, l.mate)}
                    </span>
                  </div>
                  {l.pv.length > 1 && (
                    <p className="mt-1.5 truncate text-xs text-muted">
                      {l.pv
                        .map((s, i) => (i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ${s}` : s))
                        .join(" ")}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
                    {coachNote(fen, l, best?.scoreWhite ?? l.scoreWhite, whiteToMove)}
                  </p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <DemoButton onClick={() => best && playMove(best.from, best.to)} primary>
              Play best move
            </DemoButton>
            <DemoButton onClick={undo}>Undo</DemoButton>
            <DemoButton onClick={reset}>Reset</DemoButton>
          </div>
          <p className="mt-3 text-xs text-muted">
            A design preview — tap a piece to move, or tap a line to play it. The
            shipped Android/iOS app runs Stockfish 18 on-device for full-strength,
            deep analysis.
          </p>
        </div>
      </div>
    </div>
  );
}

function EvalBarV({ prob }: { prob: number }) {
  const whitePct = Math.max(3, Math.min(97, prob * 100));
  return (
    <div className="w-3 shrink-0 overflow-hidden rounded-full border border-line">
      <div className="flex h-full w-full flex-col">
        <div style={{ height: `${100 - whitePct}%`, background: "#2b2b2b", transition: "height .4s" }} />
        <div style={{ height: `${whitePct}%`, background: "#f4f4f2", transition: "height .4s" }} />
      </div>
    </div>
  );
}

function DemoButton({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        primary
          ? "rounded-lg bg-accent px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-strong"
          : "rounded-lg border border-line px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent"
      }
    >
      {children}
    </button>
  );
}
