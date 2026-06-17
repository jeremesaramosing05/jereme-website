import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/chess/chess_logic.dart';
import '../../core/engine/uci_engine_service.dart';
import '../../core/providers.dart';
import '../../models/engine_config.dart';
import '../../models/game_models.dart';

class PlayState {
  final List<String> fens; // index 0 = start
  final List<String> sans;
  final List<String> ucis;
  final PlayerSide humanSide; // white or black
  final EngineConfig config;
  final bool engineThinking;
  final String? outcome;

  const PlayState({
    required this.fens,
    this.sans = const [],
    this.ucis = const [],
    this.humanSide = PlayerSide.white,
    this.config = const EngineConfig(mode: StrengthMode.limitElo, multiPv: 1),
    this.engineThinking = false,
    this.outcome,
  });

  factory PlayState.initial() => const PlayState(fens: [ChessLogic.startFen]);

  String get fen => fens.last;
  bool get whiteToMove => ChessLogic.isWhiteToMove(fen);
  bool get isHumanTurn =>
      (whiteToMove && humanSide == PlayerSide.white) ||
      (!whiteToMove && humanSide == PlayerSide.black);
  bool get isOver => outcome != null;

  PlayState copyWith({
    List<String>? fens,
    List<String>? sans,
    List<String>? ucis,
    PlayerSide? humanSide,
    EngineConfig? config,
    bool? engineThinking,
    String? outcome,
    bool clearOutcome = false,
  }) =>
      PlayState(
        fens: fens ?? this.fens,
        sans: sans ?? this.sans,
        ucis: ucis ?? this.ucis,
        humanSide: humanSide ?? this.humanSide,
        config: config ?? this.config,
        engineThinking: engineThinking ?? this.engineThinking,
        outcome: clearOutcome ? null : (outcome ?? this.outcome),
      );
}

class PlayController extends Notifier<PlayState> {
  @override
  PlayState build() => PlayState.initial();

  UciEngineService get _engine => ref.read(engineServiceProvider);

  void newGame({required PlayerSide humanSide, required EngineConfig config}) {
    state = PlayState(
      fens: [ChessLogic.startFen],
      sans: const [],
      ucis: const [],
      humanSide: humanSide,
      config: config.copyWith(multiPv: 1),
    );
    if (!state.isHumanTurn) _engineMove();
  }

  void playHuman(String uci) {
    if (!state.isHumanTurn || state.isOver) return;
    final res = ChessLogic.applyUci(state.fen, uci);
    if (res == null) return;
    _push(res.fen, res.san, uci);
    if (_checkOver()) return;
    _engineMove();
  }

  Future<void> _engineMove() async {
    state = state.copyWith(engineThinking: true);
    final best = await _engine.bestMove(SearchRequest(
      fen: state.fen,
      whiteToMove: state.whiteToMove,
      config: state.config,
    ));
    if (best == null) {
      state = state.copyWith(engineThinking: false);
      return;
    }
    final res = ChessLogic.applyUci(state.fen, best);
    state = state.copyWith(engineThinking: false);
    if (res != null) {
      _push(res.fen, res.san, best);
      _checkOver();
    }
  }

  void undo() {
    // Undo back to the human's previous turn (pop engine + human plies).
    if (state.fens.length <= 1 || state.engineThinking) return;
    final fens = [...state.fens];
    final sans = [...state.sans];
    final ucis = [...state.ucis];
    void pop() {
      fens.removeLast();
      if (sans.isNotEmpty) sans.removeLast();
      if (ucis.isNotEmpty) ucis.removeLast();
    }

    pop();
    // If it is now the engine's turn, pop one more so the human is to move.
    final whiteToMove = ChessLogic.isWhiteToMove(fens.last);
    final humanToMove = (whiteToMove && state.humanSide == PlayerSide.white) ||
        (!whiteToMove && state.humanSide == PlayerSide.black);
    if (!humanToMove && fens.length > 1) pop();
    state = state.copyWith(fens: fens, sans: sans, ucis: ucis, clearOutcome: true);
  }

  void resign() {
    final winner = state.humanSide == PlayerSide.white ? 'Black' : 'White';
    state = state.copyWith(outcome: '$winner wins — you resigned');
  }

  void _push(String fen, String san, String uci) {
    state = state.copyWith(
      fens: [...state.fens, fen],
      sans: [...state.sans, san],
      ucis: [...state.ucis, uci],
    );
  }

  bool _checkOver() {
    final o = ChessLogic.outcome(state.fen);
    if (o != null) {
      state = state.copyWith(outcome: o);
      return true;
    }
    return false;
  }
}

final playControllerProvider =
    NotifierProvider<PlayController, PlayState>(PlayController.new);
