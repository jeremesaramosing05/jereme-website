import 'package:chessground/chessground.dart' as cg;
import 'package:dartchess/dartchess.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/chess/chess_logic.dart';
import '../../core/coaching/coach_commentary.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/chess_board_view.dart';
import '../../shared/widgets/eval_bar.dart';
import 'analysis_controller.dart';
import 'widgets/candidate_card.dart';

class AnalysisScreen extends ConsumerStatefulWidget {
  /// Optional starting position (FEN) or full line of UCI moves to load.
  final String? initialFen;
  final List<String> initialMoves;

  const AnalysisScreen({super.key, this.initialFen, this.initialMoves = const []});

  @override
  ConsumerState<AnalysisScreen> createState() => _AnalysisScreenState();
}

class _AnalysisScreenState extends ConsumerState<AnalysisScreen> {
  final _commentary = const CoachCommentary();
  late List<String> _history; // FEN at each ply (index 0 = start)
  int _index = 0;
  Side _orientation = Side.white;

  @override
  void initState() {
    super.initState();
    final start = widget.initialFen ?? ChessLogic.startFen;
    _history = [start];
    for (final uci in widget.initialMoves) {
      final res = ChessLogic.applyUci(_history.last, uci);
      if (res == null) break;
      _history.add(res.fen);
    }
    _index = _history.length - 1;
    WidgetsBinding.instance.addPostFrameCallback((_) => _sync());
  }

  String get _fen => _history[_index];

  void _sync() => ref.read(analysisControllerProvider.notifier).setPosition(_fen);

  void _onMove(String uci) {
    final res = ChessLogic.applyUci(_fen, uci);
    if (res == null) return;
    setState(() {
      // Truncate any forward history when a new move is played.
      _history = [..._history.sublist(0, _index + 1), res.fen];
      _index = _history.length - 1;
    });
    _sync();
  }

  void _go(int delta) {
    final next = (_index + delta).clamp(0, _history.length - 1);
    if (next == _index) return;
    setState(() => _index = next);
    _sync();
  }

  Future<void> _enterFen() async {
    final controller = TextEditingController(text: _fen);
    final fen = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Load FEN'),
        content: TextField(
          controller: controller,
          maxLines: 2,
          decoration: const InputDecoration(hintText: 'Paste a FEN string'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
              onPressed: () => Navigator.pop(ctx, controller.text.trim()),
              child: const Text('Load')),
        ],
      ),
    );
    if (fen == null || fen.isEmpty) return;
    if (ChessLogic.tryPosition(fen) == null) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Invalid FEN')));
      }
      return;
    }
    setState(() {
      _history = [fen];
      _index = 0;
    });
    _sync();
  }

  @override
  Widget build(BuildContext context) {
    final analysis = ref.watch(analysisControllerProvider);

    final shapes = <cg.Shape>[];
    for (final line in analysis.lines) {
      final uci = line.firstMoveUci;
      if (uci == null) continue;
      final shape = arrowForUci(
        uci,
        AppTheme.rankColor(line.rank).withValues(alpha: line.rank == 1 ? 0.9 : 0.5),
        scale: line.rank == 1 ? 1.0 : 0.7,
      );
      if (shape != null) shapes.add(shape);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Coaching Analysis'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flip_camera_android_outlined),
            tooltip: 'Flip board',
            onPressed: () => setState(() => _orientation =
                _orientation == Side.white ? Side.black : Side.white),
          ),
          IconButton(
            icon: const Icon(Icons.edit_note),
            tooltip: 'Load FEN',
            onPressed: _enterFen,
          ),
        ],
      ),
      body: LayoutBuilder(builder: (context, constraints) {
        final wide = constraints.maxWidth > 720;
        final board = _boardArea(analysis, shapes);
        final coaching = _coachingArea(analysis);
        if (wide) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 5, child: Padding(padding: const EdgeInsets.all(12), child: board)),
              Expanded(flex: 4, child: coaching),
            ],
          );
        }
        return Column(
          children: [
            Padding(padding: const EdgeInsets.all(12), child: board),
            Expanded(child: coaching),
          ],
        );
      }),
    );
  }

  Widget _boardArea(AnalysisState analysis, List<cg.Shape> shapes) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        EvalBar(score: analysis.best?.score),
        const SizedBox(width: 10),
        Expanded(
          child: AspectRatio(
            aspectRatio: 1,
            child: ChessBoardView(
              fen: _fen,
              orientation: _orientation,
              playerSide: cg.PlayerSide.both,
              shapes: shapes,
              onMove: _onMove,
            ),
          ),
        ),
      ],
    );
  }

  Widget _coachingArea(AnalysisState analysis) {
    final headline = analysis.best != null
        ? _commentary.headline(analysis.best!.score, analysis.whiteToMove)
        : 'Thinking…';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (analysis.openingName != null)
                      Text(analysis.openingName!,
                          style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w600)),
                    Text(headline,
                        style: const TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w600, height: 1.3)),
                  ],
                ),
              ),
              if (analysis.thinking)
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: Row(children: [
                    const SizedBox(
                        width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                    const SizedBox(width: 6),
                    Text('d${analysis.depth}',
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                  ]),
                ),
            ],
          ),
        ),
        Expanded(
          child: analysis.lines.isEmpty
              ? const Center(child: Text('Analyzing the position…'))
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                  itemCount: analysis.lines.length,
                  itemBuilder: (context, i) {
                    final line = analysis.lines[i];
                    final kind = ref.read(analysisControllerProvider.notifier).kindFor(line);
                    final note = _commentary.forLine(
                      fen: _fen,
                      line: line,
                      bestScore: analysis.best?.score ?? line.score,
                      kind: kind,
                      whiteToMove: analysis.whiteToMove,
                    );
                    return CandidateCard(
                      line: line,
                      kind: kind,
                      coachNote: note,
                      isBest: line.rank == 1,
                      onPreview: line.firstMoveUci == null
                          ? null
                          : () => _onMove(line.firstMoveUci!),
                    );
                  },
                ),
        ),
        _navBar(),
      ],
    );
  }

  Widget _navBar() {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            IconButton.filledTonal(
                onPressed: _index > 0 ? () => _go(-_index) : null,
                icon: const Icon(Icons.first_page)),
            IconButton.filledTonal(
                onPressed: _index > 0 ? () => _go(-1) : null,
                icon: const Icon(Icons.chevron_left)),
            Text('$_index / ${_history.length - 1}',
                style: const TextStyle(fontWeight: FontWeight.w600)),
            IconButton.filledTonal(
                onPressed: _index < _history.length - 1 ? () => _go(1) : null,
                icon: const Icon(Icons.chevron_right)),
            IconButton.filledTonal(
                onPressed: _index < _history.length - 1
                    ? () => _go(_history.length - 1 - _index)
                    : null,
                icon: const Icon(Icons.last_page)),
          ],
        ),
      ),
    );
  }
}
