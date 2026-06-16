import 'package:flutter/material.dart';

/// Quality buckets for a played move, in the spirit of chess.com's Game Review.
enum MoveClassification {
  brilliant('Brilliant', '!!'),
  great('Great', '!'),
  best('Best', '★'),
  excellent('Excellent', ''),
  good('Good', ''),
  book('Book', '📖'),
  inaccuracy('Inaccuracy', '?!'),
  mistake('Mistake', '?'),
  blunder('Blunder', '??');

  final String label;
  final String glyph;
  const MoveClassification(this.label, this.glyph);

  /// Semantic color used by badges and the move list.
  Color get color => switch (this) {
        MoveClassification.brilliant => const Color(0xFF1BBF9E),
        MoveClassification.great => const Color(0xFF3B97D3),
        MoveClassification.best => const Color(0xFF7FB069),
        MoveClassification.excellent => const Color(0xFF7FB069),
        MoveClassification.good => const Color(0xFF9DB17C),
        MoveClassification.book => const Color(0xFFB58863),
        MoveClassification.inaccuracy => const Color(0xFFE6B800),
        MoveClassification.mistake => const Color(0xFFE08A1E),
        MoveClassification.blunder => const Color(0xFFD0463B),
      };

  bool get isMistakeLike =>
      this == inaccuracy || this == mistake || this == blunder;
}
