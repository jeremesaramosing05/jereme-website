import 'package:dartchess/dartchess.dart';

/// Thin helpers around [dartchess] so the rest of the app never touches the
/// library directly (keeps a single upgrade point).
class ChessLogic {
  const ChessLogic._();

  static const startFen =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  /// Parse a FEN into an immutable [Position]. Throws on invalid FEN.
  static Position positionFromFen(String fen) =>
      Chess.fromSetup(Setup.parseFen(fen));

  static Position? tryPosition(String fen) {
    try {
      return positionFromFen(fen);
    } catch (_) {
      return null;
    }
  }

  static bool isWhiteToMove(String fen) {
    final p = tryPosition(fen);
    return p?.turn == Side.white;
  }

  /// Standard UCI encodes castling as the king moving two squares
  /// (`e1g1`/`e1c1`), which is what Stockfish emits and what a player naturally
  /// plays. dartchess instead encodes castling as the king moving onto its own
  /// rook (`e1h1`/`e1a1`). Without translation, `pos.isLegal` rejects the
  /// standard form, so neither the engine nor the player could ever castle.
  static const _castlingAliases = {
    'e1g1': 'e1h1', // White O-O
    'e1c1': 'e1a1', // White O-O-O
    'e8g8': 'e8h8', // Black O-O
    'e8c8': 'e8a8', // Black O-O-O
  };

  /// Resolve [uci] to a legal [Move] in [pos], accepting both the standard
  /// two-square castling form and dartchess's king-onto-rook form.
  static Move? legalMove(Position pos, String uci) {
    final move = Move.parse(uci);
    if (move == null) return null;
    if (pos.isLegal(move)) return move;
    // Not legal as written — try the dartchess castling encoding, but only when
    // a king actually sits on the from-square (so e.g. a rook's e1->g1 slide is
    // never misread as castling). isLegal on the alias is the real guard.
    final alias = _castlingAliases[uci];
    if (alias == null) return null;
    final from = Square.fromName(uci.substring(0, 2));
    if (pos.board.roleAt(from) != Role.king) return null;
    final aliasMove = Move.parse(alias);
    if (aliasMove != null && pos.isLegal(aliasMove)) return aliasMove;
    return null;
  }

  /// Apply a UCI move to a FEN, returning (newFen, san) or null if illegal.
  static ({String fen, String san})? applyUci(String fen, String uci) {
    final pos = tryPosition(fen);
    if (pos == null) return null;
    final move = legalMove(pos, uci);
    if (move == null) return null;
    final (next, san) = pos.makeSan(move);
    return (fen: next.fen, san: san);
  }

  /// Render a UCI principal variation as SAN, starting from [fen].
  /// Stops cleanly if any move becomes illegal.
  static List<String> pvToSan(String fen, List<String> pvUci, {int max = 12}) {
    final start = tryPosition(fen);
    if (start == null) return const [];
    Position pos = start; // non-nullable so makeSan stays promoted across the loop
    final out = <String>[];
    for (final uci in pvUci.take(max)) {
      final move = legalMove(pos, uci);
      if (move == null) break;
      final (next, san) = pos.makeSan(move);
      out.add(san);
      pos = next;
    }
    return out;
  }

  /// Material balance in centipawns from White's perspective (pawn=100…queen=900).
  /// Counted directly from the FEN placement field to avoid depending on
  /// board-internals APIs.
  static int materialCp(String fen) {
    const values = {
      'p': 100,
      'n': 320,
      'b': 330,
      'r': 500,
      'q': 900,
      'k': 0,
    };
    final placement = fen.trim().split(RegExp(r'\s+')).first;
    var total = 0;
    for (final ch in placement.split('')) {
      final lower = ch.toLowerCase();
      final value = values[lower];
      if (value == null) continue;
      total += (ch == lower) ? -value : value; // lowercase = black
    }
    return total;
  }

  static bool isGameOver(String fen) => tryPosition(fen)?.isGameOver ?? false;

  static bool isCheck(String fen) => tryPosition(fen)?.isCheck ?? false;

  /// Outcome string for a finished position, or null if ongoing.
  static String? outcome(String fen) {
    final pos = tryPosition(fen);
    if (pos == null || !pos.isGameOver) return null;
    if (pos.isCheckmate) {
      return pos.turn == Side.white ? 'Black wins by checkmate' : 'White wins by checkmate';
    }
    if (pos.isStalemate) return 'Draw by stalemate';
    if (pos.isInsufficientMaterial) return 'Draw — insufficient material';
    return 'Draw';
  }
}
