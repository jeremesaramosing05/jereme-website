import 'dart:io';

import 'package:chess_app/core/chess/chess_logic.dart';
import 'package:flutter_test/flutter_test.dart';

/// Validates the bundled puzzle data so a broken puzzle can never ship:
/// every move in every solution must be legal from the running position, and
/// puzzles tagged `mateIn1`/`mate` must actually end in checkmate. Reads the
/// real asset file (tests run from the package root).
void main() {
  final csv = File('assets/puzzles/puzzles.csv');

  test('puzzles.csv exists and has at least one puzzle', () {
    expect(csv.existsSync(), isTrue, reason: 'bundled puzzle file is missing');
    final rows = csv.readAsLinesSync().where((l) => l.trim().isNotEmpty).toList();
    expect(rows.length, greaterThan(1), reason: 'no puzzle rows after the header');
  });

  test('every bundled puzzle is legal and matches its theme', () {
    final rows = csv.readAsLinesSync().where((l) => l.trim().isNotEmpty).toList();
    for (final row in rows.skip(1)) {
      final cells = row.split(',');
      final id = cells[0].trim();
      var fen = cells[1].trim();
      final moves = cells[2].trim().split(RegExp(r'\s+')).where((m) => m.isNotEmpty).toList();
      final themes = cells.length > 7 ? cells[7] : '';

      expect(moves, isNotEmpty, reason: '$id has no solution moves');

      for (var i = 0; i < moves.length; i++) {
        final res = ChessLogic.applyUci(fen, moves[i]);
        expect(res, isNotNull, reason: '$id: move "${moves[i]}" (#$i) is illegal');
        fen = res!.fen;
      }

      if (themes.contains('mateIn1') || themes.contains('mate')) {
        final outcome = ChessLogic.outcome(fen);
        expect(outcome, contains('checkmate'),
            reason: '$id is tagged mate but the solution does not end in checkmate');
      }
    }
  });
}
