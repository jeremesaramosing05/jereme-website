import 'dart:math';

import 'package:chessground/chessground.dart' as cg;
import 'package:dartchess/dartchess.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../models/engine_config.dart';
import '../../models/game_models.dart';
import '../../shared/widgets/chess_board_view.dart';
import 'play_controller.dart';

class PlayScreen extends ConsumerStatefulWidget {
  const PlayScreen({super.key});

  @override
  ConsumerState<PlayScreen> createState() => _PlayScreenState();
}

class _PlayScreenState extends ConsumerState<PlayScreen> {
  bool _started = false;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(playControllerProvider);

    ref.listen(playControllerProvider, (prev, next) {
      if (prev?.outcome == null && next.outcome != null) {
        _showGameOver(next.outcome!);
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Play vs Engine'),
        actions: [
          if (_started)
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'New game',
              onPressed: () => setState(() => _started = false),
            ),
        ],
      ),
      body: _started ? _game(state) : _setup(),
    );
  }

  Widget _setup() => _NewGameSetup(
        defaultElo: ref.read(settingsProvider).defaultElo,
        onStart: (side, config) {
          ref.read(playControllerProvider.notifier)
              .newGame(humanSide: side, config: config);
          setState(() => _started = true);
        },
      );

  Widget _game(PlayState state) {
    final humanWhite = state.humanSide == PlayerSide.white;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: AspectRatio(
            aspectRatio: 1,
            child: ChessBoardView(
              fen: state.fen,
              orientation: humanWhite ? Side.white : Side.black,
              playerSide: humanWhite ? cg.PlayerSide.white : cg.PlayerSide.black,
              onMove: (uci) =>
                  ref.read(playControllerProvider.notifier).playHuman(uci),
            ),
          ),
        ),
        if (state.engineThinking)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 4),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
              SizedBox(width: 8),
              Text('Engine is thinking…'),
            ]),
          ),
        Expanded(child: _moveList(state)),
        _controls(state),
      ],
    );
  }

  Widget _moveList(PlayState state) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 10,
        runSpacing: 4,
        children: [
          for (var i = 0; i < state.sans.length; i++)
            Text(
              i.isEven ? '${(i ~/ 2) + 1}. ${state.sans[i]}' : state.sans[i],
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
        ],
      ),
    );
  }

  Widget _controls(PlayState state) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            OutlinedButton.icon(
              onPressed: state.ucis.isEmpty ? null : () => ref.read(playControllerProvider.notifier).undo(),
              icon: const Icon(Icons.undo),
              label: const Text('Undo'),
            ),
            OutlinedButton.icon(
              onPressed: state.isOver ? null : () => ref.read(playControllerProvider.notifier).resign(),
              icon: const Icon(Icons.flag_outlined),
              label: const Text('Resign'),
            ),
            FilledButton.icon(
              onPressed: state.ucis.isEmpty
                  ? null
                  : () => context.push('/analysis', extra: List<String>.from(state.ucis)),
              icon: const Icon(Icons.insights),
              label: const Text('Analyze'),
            ),
          ],
        ),
      ),
    );
  }

  void _showGameOver(String outcome) {
    final ucis = List<String>.from(ref.read(playControllerProvider).ucis);
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Game over'),
        content: Text(outcome),
        actions: [
          TextButton(
            onPressed: () => setState(() {
              _started = false;
              Navigator.pop(ctx);
            }),
            child: const Text('New game'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.push('/analysis', extra: ucis);
            },
            child: const Text('Analyze this game'),
          ),
        ],
      ),
    );
  }
}

class _NewGameSetup extends StatefulWidget {
  final int defaultElo;
  final void Function(PlayerSide side, EngineConfig config) onStart;
  const _NewGameSetup({required this.defaultElo, required this.onStart});

  @override
  State<_NewGameSetup> createState() => _NewGameSetupState();
}

class _NewGameSetupState extends State<_NewGameSetup> {
  late double _elo = widget.defaultElo.toDouble();
  bool _maxStrength = false;
  int _side = 0; // 0 white, 1 black, 2 random

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('New game', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 20),
        const Text('Play as', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        SegmentedButton<int>(
          segments: const [
            ButtonSegment(value: 0, label: Text('White'), icon: Icon(Icons.circle_outlined)),
            ButtonSegment(value: 1, label: Text('Black'), icon: Icon(Icons.circle)),
            ButtonSegment(value: 2, label: Text('Random'), icon: Icon(Icons.casino_outlined)),
          ],
          selected: {_side},
          onSelectionChanged: (s) => setState(() => _side = s.first),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            const Text('Engine strength', style: TextStyle(fontWeight: FontWeight.w600)),
            const Spacer(),
            Text(_maxStrength ? 'Maximum' : '${_elo.round()} Elo'),
          ],
        ),
        Slider(
          value: _elo,
          min: 800,
          max: 2850,
          divisions: 41,
          label: '${_elo.round()}',
          onChanged: _maxStrength ? null : (v) => setState(() => _elo = v),
        ),
        SwitchListTile(
          title: const Text('Full strength (Stockfish 18)'),
          subtitle: const Text('Ignore the Elo limit — play the engine at its best'),
          value: _maxStrength,
          onChanged: (v) => setState(() => _maxStrength = v),
        ),
        const SizedBox(height: 24),
        FilledButton.icon(
          onPressed: _start,
          icon: const Icon(Icons.play_arrow_rounded),
          label: const Text('Start game'),
        ),
      ],
    );
  }

  void _start() {
    final side = switch (_side) {
      0 => PlayerSide.white,
      1 => PlayerSide.black,
      _ => Random().nextBool() ? PlayerSide.white : PlayerSide.black,
    };
    final config = _maxStrength
        ? const EngineConfig(mode: StrengthMode.fullStrength, multiPv: 1, moveTimeMs: 1000)
        : EngineConfig(
            mode: StrengthMode.limitElo,
            uciElo: _elo.round(),
            multiPv: 1,
            moveTimeMs: 800,
          );
    widget.onStart(side, config);
  }
}
