import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../models/eval_score.dart';

/// A slim vertical bar showing who stands better. White's share fills from the
/// bottom. Smoothly animates between evaluations.
class EvalBar extends StatelessWidget {
  final EvalScore? score; // White-relative
  final double width;

  const EvalBar({super.key, required this.score, this.width = 14});

  @override
  Widget build(BuildContext context) {
    final whiteShare = (score?.whiteWinProbability ?? 0.5).clamp(0.02, 0.98);
    return ClipRRect(
      borderRadius: BorderRadius.circular(6),
      child: SizedBox(
        width: width,
        child: Column(
          children: [
            Expanded(
              flex: ((1 - whiteShare) * 1000).round(),
              child: Container(color: AppTheme.evalBlack),
            ),
            Expanded(
              flex: (whiteShare * 1000).round(),
              child: Container(color: AppTheme.evalWhite),
            ),
          ],
        ),
      ),
    );
  }
}

/// A small pill rendering the score text (e.g. "+1.2", "M3").
class ScorePill extends StatelessWidget {
  final EvalScore score;
  const ScorePill({super.key, required this.score});

  @override
  Widget build(BuildContext context) {
    final cp = score.clampedCentipawns;
    final favored = cp.abs() < 30
        ? Colors.grey
        : (cp > 0 ? AppTheme.evalWhite : AppTheme.evalBlack);
    final fg = cp > 0 ? Colors.black : Colors.white;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: favored,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        score.display,
        style: TextStyle(
          color: cp.abs() < 30 ? Colors.white : fg,
          fontWeight: FontWeight.w700,
          fontFeatures: const [FontFeature.tabularFigures()],
        ),
      ),
    );
  }
}
