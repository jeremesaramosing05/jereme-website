import 'package:flutter/material.dart';

import '../../../core/coaching/coach_commentary.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/analysis_line.dart';
import '../../../shared/widgets/eval_bar.dart';

/// One candidate move in the coaching window: rank, move, eval, line type and
/// the coach's natural-language note. Tapping plays the line through on the board.
class CandidateCard extends StatelessWidget {
  final AnalysisLine line;
  final LineKind kind;
  final String coachNote;
  final VoidCallback? onPreview;
  final bool isBest;

  const CandidateCard({
    super.key,
    required this.line,
    required this.kind,
    required this.coachNote,
    this.onPreview,
    this.isBest = false,
  });

  @override
  Widget build(BuildContext context) {
    final rankColor = AppTheme.rankColor(line.rank);
    final firstSan = line.pvSan.isNotEmpty ? line.pvSan.first : '…';

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onPreview,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _RankChip(rank: line.rank, color: rankColor),
                  const SizedBox(width: 10),
                  Text(
                    firstSan,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(width: 10),
                  _KindBadge(kind: kind),
                  const Spacer(),
                  ScorePill(score: line.score),
                ],
              ),
              if (line.pvSan.length > 1) ...[
                const SizedBox(height: 8),
                Text(
                  _formatPv(line.pvSan),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontFeatures: const [FontFeature.tabularFigures()],
                    fontSize: 13,
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.school_outlined,
                      size: 15, color: rankColor.withValues(alpha: 0.9)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      coachNote,
                      style: const TextStyle(fontSize: 13, height: 1.35),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Text('depth ${line.depth}',
                      style: TextStyle(
                          fontSize: 11,
                          color: Theme.of(context).colorScheme.outline)),
                  const Spacer(),
                  if (onPreview != null)
                    TextButton.icon(
                      onPressed: onPreview,
                      icon: const Icon(Icons.play_arrow_rounded, size: 18),
                      label: const Text('Play line'),
                      style: TextButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatPv(List<String> san) {
    final buf = StringBuffer();
    for (var i = 0; i < san.length; i++) {
      if (i.isEven) buf.write('${(i ~/ 2) + 1}. ');
      buf.write('${san[i]} ');
    }
    return buf.toString().trim();
  }
}

class _RankChip extends StatelessWidget {
  final int rank;
  final Color color;
  const _RankChip({required this.rank, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 30,
      height: 30,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        shape: BoxShape.circle,
        border: Border.all(color: color, width: 1.5),
      ),
      child: Text('$rank',
          style: TextStyle(color: color, fontWeight: FontWeight.w800)),
    );
  }
}

class _KindBadge extends StatelessWidget {
  final LineKind kind;
  const _KindBadge({required this.kind});

  @override
  Widget build(BuildContext context) {
    final color = switch (kind) {
      LineKind.book => const Color(0xFFB58863),
      LineKind.mainline => const Color(0xFF1BBF9E),
      LineKind.sideline => Theme.of(context).colorScheme.outline,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(kind.label,
          style: TextStyle(
              color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}
