import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/chess/chess_logic.dart';
import '../../models/game_models.dart';
import '../../models/lesson.dart';
import 'coach_controller.dart';

class CoachScreen extends ConsumerWidget {
  const CoachScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final positions = ref.watch(coachControllerProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Coach & Student')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createPosition(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('New position'),
      ),
      body: positions.isEmpty
          ? _empty(context)
          : ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: positions.length,
              separatorBuilder: (_, __) => const SizedBox(height: 4),
              itemBuilder: (context, i) {
                final p = positions[i];
                return Card(
                  child: ListTile(
                    title: Text(p.title),
                    subtitle: Text(
                      p.prompt?.isNotEmpty == true
                          ? p.prompt!
                          : '${p.toMove == PlayerSide.white ? "White" : "Black"} to move',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: PopupMenuButton<String>(
                      onSelected: (v) {
                        if (v == 'delete') {
                          ref.read(coachControllerProvider.notifier).deletePosition(p.id);
                        }
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'delete', child: Text('Delete')),
                      ],
                    ),
                    onTap: () => context.push('/analysis', extra: p.fen),
                  ),
                );
              },
            ),
    );
  }

  Widget _empty(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.cast_for_education,
                  size: 64, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 16),
              Text('Set up a teaching position',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              const Text(
                'As a coach, add a position by FEN with an objective for your '
                'student. Opening it launches the coaching analysis so the '
                'student sees the five best ideas and why.',
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );

  Future<void> _createPosition(BuildContext context, WidgetRef ref) async {
    final titleC = TextEditingController();
    final fenC = TextEditingController(text: ChessLogic.startFen);
    final promptC = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New coaching position'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: titleC, decoration: const InputDecoration(labelText: 'Title')),
              TextField(
                controller: fenC,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'FEN'),
              ),
              TextField(
                controller: promptC,
                decoration: const InputDecoration(labelText: 'Objective / prompt (optional)'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Save')),
        ],
      ),
    );

    if (ok != true) return;
    final fen = fenC.text.trim();
    if (ChessLogic.tryPosition(fen) == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Invalid FEN — position not saved')));
      }
      return;
    }
    final pos = CoachPosition(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      title: titleC.text.trim().isEmpty ? 'Untitled position' : titleC.text.trim(),
      fen: fen,
      toMove: ChessLogic.isWhiteToMove(fen) ? PlayerSide.white : PlayerSide.black,
      prompt: promptC.text.trim().isEmpty ? null : promptC.text.trim(),
    );
    await ref.read(coachControllerProvider.notifier).addPosition(pos);
  }
}
