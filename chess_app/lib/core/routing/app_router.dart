import 'package:go_router/go_router.dart';

import '../../features/analysis/analysis_screen.dart';
import '../../features/coach/coach_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/play/play_screen.dart';
import '../../features/puzzles/puzzles_screen.dart';
import '../../features/settings/engine_smoke_screen.dart';
import '../../features/settings/settings_screen.dart';

final appRouter = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
    GoRoute(path: '/play', builder: (_, __) => const PlayScreen()),
    GoRoute(
      path: '/analysis',
      builder: (_, state) {
        // `extra` may be a List<String> of UCI moves (from Play) or a FEN String
        // (from a coach position). Either is optional.
        final extra = state.extra;
        if (extra is List) {
          return AnalysisScreen(initialMoves: extra.cast<String>());
        }
        if (extra is String && extra.isNotEmpty) {
          return AnalysisScreen(initialFen: extra);
        }
        return const AnalysisScreen();
      },
    ),
    GoRoute(path: '/puzzles', builder: (_, __) => const PuzzlesScreen()),
    GoRoute(path: '/coach', builder: (_, __) => const CoachScreen()),
    GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
    GoRoute(path: '/engine-test', builder: (_, __) => const EngineSmokeScreen()),
  ],
);
