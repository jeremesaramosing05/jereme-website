import 'package:flutter/material.dart';

import '../../models/move_classification.dart';

class ClassificationBadge extends StatelessWidget {
  final MoveClassification classification;
  final bool compact;
  const ClassificationBadge(this.classification, {super.key, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final c = classification.color;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: compact ? 6 : 9, vertical: 3),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: c.withValues(alpha: 0.5)),
      ),
      child: Text(
        compact
            ? (classification.glyph.isEmpty ? classification.label[0] : classification.glyph)
            : '${classification.glyph} ${classification.label}'.trim(),
        style: TextStyle(color: c, fontWeight: FontWeight.w700, fontSize: 12),
      ),
    );
  }
}
