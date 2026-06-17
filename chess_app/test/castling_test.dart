import 'package:chess_app/core/chess/chess_logic.dart';
import 'package:flutter_test/flutter_test.dart';

/// Castling regression tests. The app feeds standard UCI (king moves two
/// squares, e.g. `e1g1`) from both the player and Stockfish, while dartchess
/// encodes castling as the king moving onto its own rook (`e1h1`).
/// ChessLogic.applyUci must accept both and reject illegal castles.
void main() {
  // King + both rooks on the back ranks, all castling rights, paths clear.
  const allRooks = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';

  group('successful castling', () {
    test('white kingside via standard UCI e1g1 -> O-O', () {
      final res = ChessLogic.applyUci(allRooks, 'e1g1');
      expect(res, isNotNull);
      expect(res!.san, 'O-O');
      // King on g1, rook on f1.
      expect(res.fen.split(' ').first, startsWith('r3k2r/8/8/8/8/8/8/R4RK1'));
    });

    test('white queenside via standard UCI e1c1 -> O-O-O', () {
      final res = ChessLogic.applyUci(allRooks, 'e1c1');
      expect(res, isNotNull);
      expect(res!.san, 'O-O-O');
      expect(res.fen.split(' ').first, startsWith('r3k2r/8/8/8/8/8/8/2KR3R'));
    });

    test('dartchess king-onto-rook form e1h1 is also accepted -> O-O', () {
      final res = ChessLogic.applyUci(allRooks, 'e1h1');
      expect(res, isNotNull);
      expect(res!.san, 'O-O');
    });

    test('black kingside via standard UCI e8g8 -> O-O', () {
      const blackToMove = 'r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1';
      final res = ChessLogic.applyUci(blackToMove, 'e8g8');
      expect(res, isNotNull);
      expect(res!.san, 'O-O');
    });
  });

  group('illegal castling is rejected', () {
    test('blocked by a piece between king and rook (bishop on f1)', () {
      const blocked = 'r3k2r/8/8/8/8/8/8/R3KB1R w KQkq - 0 1';
      expect(ChessLogic.applyUci(blocked, 'e1g1'), isNull);
    });

    test('while in check (black rook checks on the e-file)', () {
      const inCheck = '4r1k1/8/8/8/8/8/8/R3K2R w KQ - 0 1';
      expect(ChessLogic.applyUci(inCheck, 'e1g1'), isNull);
      expect(ChessLogic.applyUci(inCheck, 'e1c1'), isNull);
    });

    test('through an attacked square (rook on f8 covers f1)', () {
      const throughCheck = 'k4r2/8/8/8/8/8/8/R3K2R w KQ - 0 1';
      expect(ChessLogic.applyUci(throughCheck, 'e1g1'), isNull);
      // The queenside path is safe, so O-O-O is still legal.
      final qs = ChessLogic.applyUci(throughCheck, 'e1c1');
      expect(qs, isNotNull);
      expect(qs!.san, 'O-O-O');
    });

    test('after castling rights are lost (king/rook had moved)', () {
      // Same board, but white has forfeited its castling rights in the FEN.
      const noWhiteRights = 'r3k2r/8/8/8/8/8/8/R3K2R w kq - 0 1';
      expect(ChessLogic.applyUci(noWhiteRights, 'e1g1'), isNull);
      expect(ChessLogic.applyUci(noWhiteRights, 'e1c1'), isNull);
    });
  });
}
