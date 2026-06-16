import 'package:shared_preferences/shared_preferences.dart';

import '../../models/app_settings.dart';

/// Loads/saves [AppSettings] using shared_preferences (scalar keys only).
class SettingsRepository {
  final SharedPreferences _prefs;
  SettingsRepository(this._prefs);

  static Future<SettingsRepository> create() async =>
      SettingsRepository(await SharedPreferences.getInstance());

  AppSettings load() => AppSettings(
        darkMode: _prefs.getBool('darkMode') ?? true,
        showCoordinates: _prefs.getBool('showCoordinates') ?? true,
        soundEnabled: _prefs.getBool('soundEnabled') ?? true,
        hapticsEnabled: _prefs.getBool('hapticsEnabled') ?? true,
        defaultElo: _prefs.getInt('defaultElo') ?? 1500,
        analysisDepth: _prefs.getInt('analysisDepth') ?? 20,
        deepAnalysis: _prefs.getBool('deepAnalysis') ?? false,
        deepenBestLine: _prefs.getBool('deepenBestLine') ?? true,
        multiPv: _prefs.getInt('multiPv') ?? 5,
      );

  Future<void> save(AppSettings s) async {
    await _prefs.setBool('darkMode', s.darkMode);
    await _prefs.setBool('showCoordinates', s.showCoordinates);
    await _prefs.setBool('soundEnabled', s.soundEnabled);
    await _prefs.setBool('hapticsEnabled', s.hapticsEnabled);
    await _prefs.setInt('defaultElo', s.defaultElo);
    await _prefs.setInt('analysisDepth', s.analysisDepth);
    await _prefs.setBool('deepAnalysis', s.deepAnalysis);
    await _prefs.setBool('deepenBestLine', s.deepenBestLine);
    await _prefs.setInt('multiPv', s.multiPv);
  }
}
