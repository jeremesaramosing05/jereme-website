import 'dart:math' as math;

/// A chess engine evaluation, always normalized to **White's perspective**.
///
/// Stockfish reports scores from the side-to-move's point of view; we flip them
/// at parse time so a positive value here always means "good for White".
sealed class EvalScore {
  const EvalScore();

  /// Centipawn evaluation (100 = one pawn).
  const factory EvalScore.cp(int centipawns) = Cp;

  /// Mate in [moves] plies-to-mate (positive = White mates, negative = Black mates).
  const factory EvalScore.mate(int moves) = Mate;

  /// A large bounded centipawn value used to make mate scores comparable in
  /// arithmetic (e.g. classification deltas). Clamped so deltas stay finite.
  int get clampedCentipawns => switch (this) {
        Cp(:final centipawns) => centipawns.clamp(-20000, 20000),
        Mate(:final moves) =>
          moves >= 0 ? 100000 - moves * 100 : -100000 - moves * 100,
      };

  /// Win probability for White in `[0, 1]` using the logistic model
  /// commonly used by Lichess / chess.com (k ≈ 1/400 on the centipawn scale).
  double get whiteWinProbability {
    switch (this) {
      case Mate(:final moves):
        return moves >= 0 ? 1.0 : 0.0;
      case Cp(:final centipawns):
        return 1.0 / (1.0 + math.pow(10, -centipawns / 400.0));
    }
  }

  /// Returns this score from the perspective of [whiteToMove] (true) or Black.
  double winProbabilityFor({required bool white}) =>
      white ? whiteWinProbability : 1.0 - whiteWinProbability;

  /// Negates the score (used when flipping perspective at parse time).
  EvalScore get negated => switch (this) {
        Cp(:final centipawns) => Cp(-centipawns),
        Mate(:final moves) => Mate(-moves),
      };

  /// Human-readable, White-relative label, e.g. "+1.24", "-0.30", "M3", "-M5".
  String get display {
    switch (this) {
      case Mate(:final moves):
        final n = moves.abs();
        return moves >= 0 ? 'M$n' : '-M$n';
      case Cp(:final centipawns):
        final pawns = centipawns / 100.0;
        final sign = centipawns > 0 ? '+' : (centipawns < 0 ? '' : '');
        return '$sign${pawns.toStringAsFixed(2)}';
    }
  }

  @override
  String toString() => display;
}

final class Cp extends EvalScore {
  final int centipawns;
  const Cp(this.centipawns);

  @override
  bool operator ==(Object other) => other is Cp && other.centipawns == centipawns;
  @override
  int get hashCode => centipawns.hashCode;
}

final class Mate extends EvalScore {
  final int moves;
  const Mate(this.moves);

  @override
  bool operator ==(Object other) => other is Mate && other.moves == moves;
  @override
  int get hashCode => moves.hashCode;
}
