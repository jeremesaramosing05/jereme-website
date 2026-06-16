import 'engine_config.dart';

/// User-tunable settings, persisted via shared_preferences.
class AppSettings {
  final bool darkMode;
  final bool showCoordinates;
  final bool soundEnabled;
  final bool hapticsEnabled;

  /// Default engine strength for Play mode.
  final int defaultElo;

  /// Analysis search depth (quick vs deep look-ahead).
  final int analysisDepth;

  /// Use open-ended (`go infinite`) deep analysis instead of a depth cap.
  final bool deepAnalysis;

  /// Re-search the #1 move alone so the best line "sees furthest".
  final bool deepenBestLine;

  /// How many candidate lines the coaching window shows (1–5).
  final int multiPv;

  const AppSettings({
    this.darkMode = true,
    this.showCoordinates = true,
    this.soundEnabled = true,
    this.hapticsEnabled = true,
    this.defaultElo = 1500,
    this.analysisDepth = 20,
    this.deepAnalysis = false,
    this.deepenBestLine = true,
    this.multiPv = 5,
  });

  /// Builds the analysis [EngineConfig] implied by these settings.
  EngineConfig analysisConfig() => EngineConfig(
        mode: StrengthMode.fullStrength,
        multiPv: multiPv,
        depth: deepAnalysis ? null : analysisDepth,
        infinite: deepAnalysis,
        deepenBestLine: deepenBestLine,
        hashMb: deepAnalysis ? 128 : 64,
      );

  AppSettings copyWith({
    bool? darkMode,
    bool? showCoordinates,
    bool? soundEnabled,
    bool? hapticsEnabled,
    int? defaultElo,
    int? analysisDepth,
    bool? deepAnalysis,
    bool? deepenBestLine,
    int? multiPv,
  }) =>
      AppSettings(
        darkMode: darkMode ?? this.darkMode,
        showCoordinates: showCoordinates ?? this.showCoordinates,
        soundEnabled: soundEnabled ?? this.soundEnabled,
        hapticsEnabled: hapticsEnabled ?? this.hapticsEnabled,
        defaultElo: defaultElo ?? this.defaultElo,
        analysisDepth: analysisDepth ?? this.analysisDepth,
        deepAnalysis: deepAnalysis ?? this.deepAnalysis,
        deepenBestLine: deepenBestLine ?? this.deepenBestLine,
        multiPv: multiPv ?? this.multiPv,
      );

  Map<String, Object> toMap() => {
        'darkMode': darkMode,
        'showCoordinates': showCoordinates,
        'soundEnabled': soundEnabled,
        'hapticsEnabled': hapticsEnabled,
        'defaultElo': defaultElo,
        'analysisDepth': analysisDepth,
        'deepAnalysis': deepAnalysis,
        'deepenBestLine': deepenBestLine,
        'multiPv': multiPv,
      };
}
