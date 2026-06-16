import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(settingsProvider);
    final notifier = ref.read(settingsProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const _SectionHeader('Appearance'),
          SwitchListTile(
            title: const Text('Dark theme'),
            value: s.darkMode,
            onChanged: (v) => notifier.update(s.copyWith(darkMode: v)),
          ),
          SwitchListTile(
            title: const Text('Show board coordinates'),
            value: s.showCoordinates,
            onChanged: (v) => notifier.update(s.copyWith(showCoordinates: v)),
          ),
          const _SectionHeader('Feedback'),
          SwitchListTile(
            title: const Text('Move sounds'),
            value: s.soundEnabled,
            onChanged: (v) => notifier.update(s.copyWith(soundEnabled: v)),
          ),
          SwitchListTile(
            title: const Text('Haptics'),
            value: s.hapticsEnabled,
            onChanged: (v) => notifier.update(s.copyWith(hapticsEnabled: v)),
          ),
          const _SectionHeader('Engine — Play'),
          ListTile(
            title: const Text('Default opponent Elo'),
            subtitle: Slider(
              value: s.defaultElo.toDouble(),
              min: 800,
              max: 2850,
              divisions: 41,
              label: '${s.defaultElo}',
              onChanged: (v) => notifier.update(s.copyWith(defaultElo: v.round())),
            ),
            trailing: Text('${s.defaultElo}'),
          ),
          const _SectionHeader('Engine — Coaching analysis'),
          SwitchListTile(
            title: const Text('Deep analysis (look further ahead)'),
            subtitle: const Text('Search open-ended instead of a fixed depth'),
            value: s.deepAnalysis,
            onChanged: (v) => notifier.update(s.copyWith(deepAnalysis: v)),
          ),
          if (!s.deepAnalysis)
            ListTile(
              title: const Text('Analysis depth'),
              subtitle: Slider(
                value: s.analysisDepth.toDouble(),
                min: 12,
                max: 35,
                divisions: 23,
                label: '${s.analysisDepth}',
                onChanged: (v) => notifier.update(s.copyWith(analysisDepth: v.round())),
              ),
              trailing: Text('${s.analysisDepth}'),
            ),
          SwitchListTile(
            title: const Text('Deepen the #1 line'),
            subtitle: const Text('Let the best move search the furthest'),
            value: s.deepenBestLine,
            onChanged: (v) => notifier.update(s.copyWith(deepenBestLine: v)),
          ),
          ListTile(
            title: const Text('Candidate lines (MultiPV)'),
            subtitle: Slider(
              value: s.multiPv.toDouble(),
              min: 1,
              max: 5,
              divisions: 4,
              label: '${s.multiPv}',
              onChanged: (v) => notifier.update(s.copyWith(multiPv: v.round())),
            ),
            trailing: Text('${s.multiPv}'),
          ),
          const SizedBox(height: 24),
          const ListTile(
            dense: true,
            leading: Icon(Icons.info_outline),
            title: Text('Engine: Stockfish 18 (on-device, offline)'),
            subtitle: Text('Analysis powered by MultiPV — five candidate lines.'),
          ),
          ListTile(
            leading: const Icon(Icons.memory),
            title: const Text('Run engine smoke test'),
            subtitle: const Text('Verify the native Stockfish binary loads'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/engine-test'),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader(this.text);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 6),
        child: Text(
          text.toUpperCase(),
          style: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontWeight: FontWeight.w700,
            fontSize: 12,
            letterSpacing: 0.8,
          ),
        ),
      );
}
