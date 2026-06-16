import 'dart:async';
import 'dart:math' as math;

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/chess/chess_logic.dart';
import '../../core/coaching/coach_commentary.dart';
import '../../core/engine/uci_engine_service.dart';
import '../../core/engine/uci_info_parser.dart';
import '../../core/providers.dart';
import '../../models/analysis_line.dart';

/// Snapshot of the engine's current thinking for one position.
class AnalysisState {
  final String fen;
  final bool whiteToMove;
  final Map<int, AnalysisLine> linesByRank;
  final bool thinking;
  final int depth;
  final String? openingName;

  const AnalysisState({
    required this.fen,
    required this.whiteToMove,
    this.linesByRank = const {},
    this.thinking = false,
    this.depth = 0,
    this.openingName,
  });

  factory AnalysisState.initial() => const AnalysisState(
        fen: ChessLogic.startFen,
        whiteToMove: true,
      );

  /// Candidate lines sorted by rank (1..N).
  List<AnalysisLine> get lines =>
      linesByRank.values.toList()..sort((a, b) => a.rank.compareTo(b.rank));

  AnalysisLine? get best => linesByRank[1];

  AnalysisState copyWith({
    String? fen,
    bool? whiteToMove,
    Map<int, AnalysisLine>? linesByRank,
    bool? thinking,
    int? depth,
    String? openingName,
    bool clearOpeningName = false,
  }) =>
      AnalysisState(
        fen: fen ?? this.fen,
        whiteToMove: whiteToMove ?? this.whiteToMove,
        linesByRank: linesByRank ?? this.linesByRank,
        thinking: thinking ?? this.thinking,
        depth: depth ?? this.depth,
        openingName: clearOpeningName ? null : (openingName ?? this.openingName),
      );
}

/// Drives a MultiPV search and exposes the streaming top-N candidate lines.
class AnalysisController extends Notifier<AnalysisState> {
  StreamSubscription<UciEvent>? _sub;

  @override
  AnalysisState build() {
    final engine = ref.read(engineServiceProvider);
    _sub = engine.events.listen(_onEvent);
    ref.onDispose(() => _sub?.cancel());
    return AnalysisState.initial();
  }

  /// Point the engine at [fen] and (re)start the analysis.
  Future<void> setPosition(String fen) async {
    final white = ChessLogic.isWhiteToMove(fen);
    final book = ref.read(openingBookProvider).valueOrNull;
    state = state.copyWith(
      fen: fen,
      whiteToMove: white,
      linesByRank: const {},
      thinking: true,
      depth: 0,
      openingName: book?.nameFor(fen),
      clearOpeningName: book?.nameFor(fen) == null,
    );

    final settings = ref.read(settingsProvider);
    final engine = ref.read(engineServiceProvider);
    await engine.analyze(SearchRequest(
      fen: fen,
      whiteToMove: white,
      config: settings.analysisConfig(),
    ));
  }

  Future<void> stop() => ref.read(engineServiceProvider).stop();

  /// Classify a candidate line as book / mainline / sideline.
  LineKind kindFor(AnalysisLine line) {
    final book = ref.read(openingBookProvider).valueOrNull;
    final uci = line.firstMoveUci;
    if (book != null && uci != null && book.isBookMove(state.fen, uci)) {
      return LineKind.book;
    }
    return line.rank == 1 ? LineKind.mainline : LineKind.sideline;
  }

  void _onEvent(UciEvent e) {
    switch (e) {
      case InfoEvent(:final line):
        final withSan = line.copyWith(pvSan: ChessLogic.pvToSan(state.fen, line.pvUci));
        final map = Map<int, AnalysisLine>.from(state.linesByRank)
          ..[line.rank] = withSan;
        state = state.copyWith(
          linesByRank: map,
          depth: math.max(state.depth, line.depth),
          thinking: true,
        );
      case BestMoveEvent():
        state = state.copyWith(thinking: false);
      default:
        break;
    }
  }
}

final analysisControllerProvider =
    NotifierProvider<AnalysisController, AnalysisState>(AnalysisController.new);
