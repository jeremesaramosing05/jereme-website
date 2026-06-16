import 'package:chess_app/core/coaching/move_classifier.dart';
import 'package:chess_app/models/eval_score.dart';
import 'package:chess_app/models/move_classification.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const classifier = MoveClassifier();

  MoveClassification classifyWhite(int before, int after,
          {bool best = false, int material = 0, EvalScore? second}) =>
      classifier.classify(
        moverIsWhite: true,
        evalBefore: EvalScore.cp(before),
        evalAfter: EvalScore.cp(after),
        wasBestMove: best,
        secondBest: second,
        materialDeltaForMover: material,
      );

  test('book move short-circuits', () {
    final c = classifier.classify(
      moverIsWhite: true,
      evalBefore: const EvalScore.cp(0),
      evalAfter: const EvalScore.cp(-400),
      wasBestMove: false,
      isBookMove: true,
    );
    expect(c, MoveClassification.book);
  });

  test('thresholds for white losses', () {
    expect(classifyWhite(0, 0, best: true), MoveClassification.best);
    expect(classifyWhite(30, 20), MoveClassification.excellent); // loss 10
    expect(classifyWhite(100, 70), MoveClassification.good); // loss 30
    expect(classifyWhite(100, 40), MoveClassification.inaccuracy); // loss 60
    expect(classifyWhite(200, 30), MoveClassification.mistake); // loss 170
    expect(classifyWhite(200, -150), MoveClassification.blunder); // loss 350
  });

  test('boundary values', () {
    expect(classifyWhite(100, 51), MoveClassification.good); // loss 49
    expect(classifyWhite(100, 50), MoveClassification.inaccuracy); // loss 50
    expect(classifyWhite(200, 51), MoveClassification.inaccuracy); // loss 149
    expect(classifyWhite(200, 50), MoveClassification.mistake); // loss 150
    expect(classifyWhite(300, 1), MoveClassification.mistake); // loss 299
    expect(classifyWhite(300, 0), MoveClassification.blunder); // loss 300
  });

  test('black perspective mirrors white', () {
    // For black, lower white-relative eval is better. before=-200, after=-30
    // => black gave away 170 cp => mistake.
    final c = classifier.classify(
      moverIsWhite: false,
      evalBefore: const EvalScore.cp(-200),
      evalAfter: const EvalScore.cp(-30),
      wasBestMove: false,
    );
    expect(c, MoveClassification.mistake);
  });

  test('brilliant: best move that sacrifices material yet stays fine', () {
    final c = classifyWhite(120, 110, best: true, material: -300);
    expect(c, MoveClassification.brilliant);
  });

  test('great: best move and the only good one', () {
    final c = classifyWhite(100, 100,
        best: true, second: const EvalScore.cp(-100)); // 2nd is 200 worse
    expect(c, MoveClassification.great);
  });
}
