import 'package:chess_app/core/engine/uci_info_parser.dart';
import 'package:chess_app/models/eval_score.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const parser = UciInfoParser();

  test('parses a cp info line for white to move', () {
    final e = parser.parse(
      'info depth 18 seldepth 24 multipv 1 score cp 34 nodes 100 pv e2e4 e7e5 g1f3',
      whiteToMove: true,
    );
    expect(e, isA<InfoEvent>());
    final line = (e as InfoEvent).line;
    expect(line.rank, 1);
    expect(line.depth, 18);
    expect(line.score, const EvalScore.cp(34));
    expect(line.pvUci, ['e2e4', 'e7e5', 'g1f3']);
  });

  test('normalizes scores to white perspective when black is to move', () {
    final e = parser.parse(
      'info depth 12 multipv 2 score cp 50 pv d7d5',
      whiteToMove: false,
    );
    final line = (e as InfoEvent).line;
    // +50 for black-to-move means -50 for white.
    expect(line.score, const EvalScore.cp(-50));
    expect(line.rank, 2);
  });

  test('parses mate scores and flips sign for black', () {
    final white = parser.parse('info multipv 1 score mate 3 pv h5f7', whiteToMove: true);
    expect((white as InfoEvent).line.score, const EvalScore.mate(3));

    final black = parser.parse('info multipv 1 score mate 2 pv a1a8', whiteToMove: false);
    expect((black as InfoEvent).line.score, const EvalScore.mate(-2));
  });

  test('parses bestmove with ponder', () {
    final e = parser.parse('bestmove e2e4 ponder e7e5', whiteToMove: true);
    expect(e, isA<BestMoveEvent>());
    expect((e as BestMoveEvent).bestMoveUci, 'e2e4');
    expect(e.ponderUci, 'e7e5');
  });

  test('handles bestmove (none)', () {
    final e = parser.parse('bestmove (none)', whiteToMove: true);
    expect((e as BestMoveEvent).bestMoveUci, isNull);
  });

  test('returns handshake events', () {
    expect(parser.parse('uciok', whiteToMove: true), isA<UciOkEvent>());
    expect(parser.parse('readyok', whiteToMove: true), isA<ReadyOkEvent>());
  });

  test('ignores info lines without a pv', () {
    final e = parser.parse('info depth 1 score cp 10 nodes 20 nps 100', whiteToMove: true);
    expect(e, isNull);
  });
}
