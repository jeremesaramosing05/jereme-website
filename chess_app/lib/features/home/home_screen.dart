import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chess Trainer'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 4, 4, 16),
            child: Text(
              'Train like a master.\nPlay, analyze, and improve.',
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(height: 1.25),
            ),
          ),
          _ModeCard(
            title: 'Coaching Analysis',
            subtitle:
                'See the five best moves with evaluations and a coach\'s note — '
                'book lines and sidelines, explained.',
            icon: Icons.insights,
            color: AppTheme.rankColor(1),
            onTap: () => context.push('/analysis'),
            featured: true,
          ),
          _ModeCard(
            title: 'Play vs Engine',
            subtitle: 'Stockfish 18 from beginner to grandmaster strength.',
            icon: Icons.sports_esports_outlined,
            color: AppTheme.rankColor(2),
            onTap: () => context.push('/play'),
          ),
          _ModeCard(
            title: 'Tactics Trainer',
            subtitle: 'Solve puzzles and sharpen your calculation.',
            icon: Icons.extension_outlined,
            color: AppTheme.rankColor(3),
            onTap: () => context.push('/puzzles'),
          ),
          _ModeCard(
            title: 'Coach & Student',
            subtitle: 'Set up teaching positions and learn from them.',
            icon: Icons.cast_for_education_outlined,
            color: AppTheme.rankColor(4),
            onTap: () => context.push('/coach'),
          ),
        ],
      ),
    );
  }
}

class _ModeCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  final bool featured;

  const _ModeCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
    this.featured = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(title,
                            style: const TextStyle(
                                fontSize: 17, fontWeight: FontWeight.w700)),
                        if (featured) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text('CORE',
                                style: TextStyle(
                                    color: color,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800)),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(subtitle,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                            height: 1.3)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}
