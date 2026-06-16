/// How the engine should choose its playing strength.
enum StrengthMode { fullStrength, limitElo, skillLevel }

/// Configuration for an engine search / game.
class EngineConfig {
  final StrengthMode mode;

  /// Used when [mode] is [StrengthMode.limitElo]. Stockfish accepts ~1320–3190.
  final int uciElo;

  /// Used when [mode] is [StrengthMode.skillLevel]. Range 0–20.
  final int skillLevel;

  /// Number of candidate lines to report (1 for play, 5 for the coaching window).
  final int multiPv;

  /// Target search depth. Higher = "sees further ahead". Null => use [moveTimeMs].
  final int? depth;

  /// Alternative to [depth]: think for this many milliseconds.
  final int? moveTimeMs;

  /// If true, run `go infinite` and stream until stopped (Deep Analysis mode).
  final bool infinite;

  final int threads;
  final int hashMb;

  /// After a MultiPV pass, re-search the #1 move alone (deeper) to extend its
  /// principal variation — "the best move sees the furthest".
  final bool deepenBestLine;

  const EngineConfig({
    this.mode = StrengthMode.fullStrength,
    this.uciElo = 1500,
    this.skillLevel = 20,
    this.multiPv = 5,
    this.depth = 18,
    this.moveTimeMs,
    this.infinite = false,
    this.threads = 2,
    this.hashMb = 64,
    this.deepenBestLine = true,
  });

  /// Strong, multi-line config for the coaching/analysis window.
  static const analysis = EngineConfig(
    mode: StrengthMode.fullStrength,
    multiPv: 5,
    depth: 22,
    deepenBestLine: true,
  );

  /// Deep, open-ended analysis ("foresee far into the future").
  static const deepAnalysis = EngineConfig(
    mode: StrengthMode.fullStrength,
    multiPv: 5,
    depth: null,
    infinite: true,
    deepenBestLine: true,
    hashMb: 128,
  );

  EngineConfig copyWith({
    StrengthMode? mode,
    int? uciElo,
    int? skillLevel,
    int? multiPv,
    int? depth,
    int? moveTimeMs,
    bool? infinite,
    int? threads,
    int? hashMb,
    bool? deepenBestLine,
  }) =>
      EngineConfig(
        mode: mode ?? this.mode,
        uciElo: uciElo ?? this.uciElo,
        skillLevel: skillLevel ?? this.skillLevel,
        multiPv: multiPv ?? this.multiPv,
        depth: depth ?? this.depth,
        moveTimeMs: moveTimeMs ?? this.moveTimeMs,
        infinite: infinite ?? this.infinite,
        threads: threads ?? this.threads,
        hashMb: hashMb ?? this.hashMb,
        deepenBestLine: deepenBestLine ?? this.deepenBestLine,
      );

  /// The `go` command suffix for this config.
  String get goCommand {
    if (infinite) return 'go infinite';
    if (moveTimeMs != null) return 'go movetime $moveTimeMs';
    return 'go depth ${depth ?? 18}';
  }
}
