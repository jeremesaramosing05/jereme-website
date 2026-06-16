import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/app_settings.dart';
import 'engine/engine_transport.dart';
import 'engine/uci_engine_service.dart';
import 'opening/opening_book.dart';
import 'persistence/lesson_repository.dart';
import 'persistence/settings_repository.dart';
import '../features/puzzles/puzzle_repository.dart';

/// Overridden in `main()` once SharedPreferences has loaded.
final settingsRepositoryProvider = Provider<SettingsRepository>(
  (ref) => throw UnimplementedError('settingsRepositoryProvider not overridden'),
);

final lessonRepositoryProvider = Provider<LessonRepository>(
  (ref) => throw UnimplementedError('lessonRepositoryProvider not overridden'),
);

/// Current user settings (mutable).
class SettingsNotifier extends Notifier<AppSettings> {
  @override
  AppSettings build() => ref.read(settingsRepositoryProvider).load();

  Future<void> update(AppSettings next) async {
    state = next;
    await ref.read(settingsRepositoryProvider).save(next);
  }
}

final settingsProvider =
    NotifierProvider<SettingsNotifier, AppSettings>(SettingsNotifier.new);

/// The long-lived engine service. Created lazily; disposed with the container.
final engineServiceProvider = Provider<UciEngineService>((ref) {
  final service = UciEngineService(StockfishTransport());
  ref.onDispose(service.dispose);
  return service;
});

/// Offline opening book (loaded once from the bundled asset).
final openingBookProvider = FutureProvider<OpeningBook>(
  (ref) => OpeningBook.loadFromAsset(),
);

/// Bundled puzzle set (loaded once from the CSV asset).
final puzzleRepositoryProvider = FutureProvider<PuzzleRepository>(
  (ref) => PuzzleRepository.loadFromAsset(),
);
