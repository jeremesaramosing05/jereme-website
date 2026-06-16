import 'dart:math';

import 'package:chessground/chessground.dart' as cg;
import 'package:dartchess/dartchess.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/chess/chess_logic.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../models/puzzle.dart';
import '../../shared/widgets/chess_board_view.dart';
import 'puzzle_repository.dart';

class PuzzlesScreen extends ConsumerWidget {
  const PuzzlesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repoAsync = ref.watch(puzzleRepositoryProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Tactics Trainer')),
      body: repoAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Could not load puzzles:\n$e')),
        data: (repo) => repo.puzzles.isEmpty
            ? const Center(child: Text('No puzzles bundled.'))
            : _PuzzlePlayer(repo: repo),
      ),
    );
  }
}

enum _Feedback { none, correct, wrong, solved }

class _PuzzlePlayer extends StatefulWidget {
  final PuzzleRepository repo;
  const _PuzzlePlayer({required this.repo});

  @override
  State<_PuzzlePlayer> createState() => _PuzzlePlayerState();
}

class _PuzzlePlayerState extends State<_PuzzlePlayer> {
  final _rand = Random();
  late Puzzle _puzzle;
  late String _fen;
  int _idx = 0; // next expected index into solutionUci
  bool _solverIsWhite = true;
  _Feedback _feedback = _Feedback.none;
  bool _showHint = false;
  int _solvedCount = 0;

  @override
  void initState() {
    super.initState();
    _load(widget.repo.puzzles[_rand.nextInt(widget.repo.puzzles.length)]);
  }

  void _load(Puzzle p) {
    _puzzle = p;
    _fen = p.fen;
    _idx = 0;
    _feedback = _Feedback.none;
    _showHint = false;
    // Auto-play the opponent's setup move, if present.
    if (p.setupMove != null) {
      final res = ChessLogic.applyUci(_fen, p.setupMove!);
      if (res != null) _fen = res.fen;
      _idx = 1;
    }
    _solverIsWhite = ChessLogic.isWhiteToMove(_fen);
    setState(() {});
  }

  void _nextPuzzle() {
    _load(widget.repo.puzzles[_rand.nextInt(widget.repo.puzzles.length)]);
  }

  void _onMove(String uci) {
    if (_idx >= _puzzle.solutionUci.length) return;
    final expected = _puzzle.solutionUci[_idx];
    if (uci != expected && '${uci}q' != expected) {
      setState(() => _feedback = _Feedback.wrong);
      return;
    }
    // Correct solver move.
    final res = ChessLogic.applyUci(_fen, expected);
    if (res == null) return;
    _fen = res.fen;
    _idx++;

    if (_idx >= _puzzle.solutionUci.length) {
      _solvedCount++;
      setState(() => _feedback = _Feedback.solved);
      return;
    }
    // Auto-play opponent reply.
    final reply = ChessLogic.applyUci(_fen, _puzzle.solutionUci[_idx]);
    if (reply != null) {
      _fen = reply.fen;
      _idx++;
    }
    if (_idx >= _puzzle.solutionUci.length) {
      _solvedCount++;
      setState(() => _feedback = _Feedback.solved);
    } else {
      setState(() {
        _feedback = _Feedback.correct;
        _showHint = false;
      });
    }
  }

  List<cg.Shape> _hintShapes() {
    if (!_showHint || _idx >= _puzzle.solutionUci.length) return const [];
    final uci = _puzzle.solutionUci[_idx];
    // Highlight the origin square of the move to find.
    try {
      final from = Square.fromName(uci.substring(0, 2));
      return [cg.Circle(color: AppTheme.seed.withValues(alpha: 0.8), orig: from)];
    } catch (_) {
      return const [];
    }
  }

  @override
  Widget build(BuildContext context) {
    final solved = _feedback == _Feedback.solved;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: Row(
            children: [
              Chip(label: Text('Rating ${_puzzle.rating}')),
              const SizedBox(width: 8),
              if (_puzzle.themes.isNotEmpty)
                Expanded(
                  child: Text(_puzzle.themes.take(3).join(' · '),
                      style: TextStyle(color: Theme.of(context).colorScheme.outline)),
                ),
              Text('Solved: $_solvedCount', style: const TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(12),
          child: AspectRatio(
            aspectRatio: 1,
            child: ChessBoardView(
              fen: _fen,
              orientation: _solverIsWhite ? Side.white : Side.black,
              playerSide: solved
                  ? cg.PlayerSide.none
                  : (_solverIsWhite ? cg.PlayerSide.white : cg.PlayerSide.black),
              shapes: _hintShapes(),
              onMove: _onMove,
            ),
          ),
        ),
        _statusBanner(),
        const Spacer(),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                OutlinedButton.icon(
                  onPressed: solved ? null : () => setState(() => _showHint = true),
                  icon: const Icon(Icons.lightbulb_outline),
                  label: const Text('Hint'),
                ),
                OutlinedButton.icon(
                  onPressed: () => _load(_puzzle),
                  icon: const Icon(Icons.restart_alt),
                  label: const Text('Retry'),
                ),
                FilledButton.icon(
                  onPressed: _nextPuzzle,
                  icon: const Icon(Icons.skip_next),
                  label: const Text('Next'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _statusBanner() {
    final (text, color, icon) = switch (_feedback) {
      _Feedback.none => (
          '${_solverIsWhite ? 'White' : 'Black'} to play — find the best move',
          Theme.of(context).colorScheme.onSurfaceVariant,
          Icons.search
        ),
      _Feedback.correct => ('Correct! Keep going…', const Color(0xFF7FB069), Icons.check),
      _Feedback.wrong => ('Not quite — try another move', const Color(0xFFD0463B), Icons.close),
      _Feedback.solved => ('Solved! 🎉', const Color(0xFF1BBF9E), Icons.emoji_events),
    };
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 8),
          Text(text, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 15)),
        ],
      ),
    );
  }
}
