import 'eval_score.dart';

/// One candidate line from the engine (one `multipv` rank).
///
/// Produced by parsing Stockfish `info ... multipv K ... score ... pv ...`
/// lines. [score] is always White-relative.
class AnalysisLine {
  /// 1-based MultiPV rank (1 = engine's best move).
  final int rank;
  final EvalScore score;
  final int depth;

  /// Principal variation as raw UCI move strings (e.g. `e2e4`, `g1f3`).
  final List<String> pvUci;

  /// Principal variation rendered as SAN for display (e.g. `e4`, `Nf3`).
  /// Filled in by the controller once the moves are replayed on a position.
  final List<String> pvSan;

  const AnalysisLine({
    required this.rank,
    required this.score,
    required this.depth,
    required this.pvUci,
    this.pvSan = const [],
  });

  /// The single best move of this line in UCI (first PV move), or null.
  String? get firstMoveUci => pvUci.isEmpty ? null : pvUci.first;

  AnalysisLine copyWith({
    EvalScore? score,
    int? depth,
    List<String>? pvUci,
    List<String>? pvSan,
  }) =>
      AnalysisLine(
        rank: rank,
        score: score ?? this.score,
        depth: depth ?? this.depth,
        pvUci: pvUci ?? this.pvUci,
        pvSan: pvSan ?? this.pvSan,
      );

  @override
  String toString() => '#$rank ${score.display} d$depth ${pvUci.take(6).join(" ")}';
}
