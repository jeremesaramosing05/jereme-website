import '../../models/eval_score.dart';
import '../../models/move_classification.dart';

/// Classifies a played move by how much it gave away versus the best move.
///
/// All evals are **White-relative**. We convert to "centipawn loss" from the
/// mover's perspective so the same thresholds work for both colors.
class MoveClassifier {
  const MoveClassifier();

  // Thresholds in centipawns of loss. Kept as named constants for tuning/tests.
  static const inaccuracy = 50;
  static const mistake = 150;
  static const blunder = 300;

  MoveClassification classify({
    required bool moverIsWhite,
    required EvalScore evalBefore, // best eval available before the move
    required EvalScore evalAfter, // eval after the actual move
    required bool wasBestMove,
    EvalScore? secondBest, // eval of the 2nd candidate (for "great")
    bool isBookMove = false,
    int materialDeltaForMover = 0, // <0 means mover sacrificed material
  }) {
    if (isBookMove) return MoveClassification.book;

    final before = evalBefore.clampedCentipawns;
    final after = evalAfter.clampedCentipawns;
    // Loss = how much worse the position became for the mover.
    final loss = moverIsWhite ? (before - after) : (after - before);

    // Brilliant: the best move, a real sacrifice, still keeping a fine position.
    final stillFine = moverIsWhite ? after >= -50 : -after >= -50;
    if (wasBestMove && materialDeltaForMover <= -100 && stillFine) {
      return MoveClassification.brilliant;
    }

    // Great: best move that is clearly the *only* good move (big gap to #2).
    if (wasBestMove && secondBest != null) {
      final secondLoss = moverIsWhite
          ? before - secondBest.clampedCentipawns
          : secondBest.clampedCentipawns - before;
      if (secondLoss >= mistake) return MoveClassification.great;
    }

    if (loss >= blunder) return MoveClassification.blunder;
    if (loss >= mistake) return MoveClassification.mistake;
    if (loss >= inaccuracy) return MoveClassification.inaccuracy;
    if (wasBestMove) return MoveClassification.best;
    if (loss < 20) return MoveClassification.excellent;
    return MoveClassification.good;
  }
}
