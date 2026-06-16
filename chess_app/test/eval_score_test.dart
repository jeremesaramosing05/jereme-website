import 'package:chess_app/models/eval_score.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('win probability is 0.5 at equality', () {
    expect(const EvalScore.cp(0).whiteWinProbability, closeTo(0.5, 1e-9));
  });

  test('positive cp favors white', () {
    expect(const EvalScore.cp(200).whiteWinProbability, greaterThan(0.5));
    expect(const EvalScore.cp(-200).whiteWinProbability, lessThan(0.5));
  });

  test('mate scores saturate probability', () {
    expect(const EvalScore.mate(3).whiteWinProbability, 1.0);
    expect(const EvalScore.mate(-3).whiteWinProbability, 0.0);
  });

  test('negation flips perspective', () {
    expect(const EvalScore.cp(40).negated, const EvalScore.cp(-40));
    expect(const EvalScore.mate(2).negated, const EvalScore.mate(-2));
  });

  test('display formatting', () {
    expect(const EvalScore.cp(34).display, '+0.34');
    expect(const EvalScore.cp(-120).display, '-1.20');
    expect(const EvalScore.mate(3).display, 'M3');
    expect(const EvalScore.mate(-5).display, '-M5');
  });

  test('clamped centipawns keep mate finite and comparable', () {
    expect(const EvalScore.mate(1).clampedCentipawns, greaterThan(const EvalScore.cp(2000).clampedCentipawns));
    expect(const EvalScore.mate(-1).clampedCentipawns, lessThan(const EvalScore.cp(-2000).clampedCentipawns));
  });
}
