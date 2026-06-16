import 'package:flutter/material.dart';

/// Central design system. Defined once so every screen inherits the same
/// "serious training studio" look — calm, dark-first, board-forward.
class AppTheme {
  const AppTheme._();

  static const seed = Color(0xFF3B97D3); // analytical blue
  static const evalWhite = Color(0xFFF4F4F2);
  static const evalBlack = Color(0xFF2B2B2B);

  // Candidate-rank arrow palette (rank 1 = strongest/brightest).
  static const rankColors = <Color>[
    Color(0xFF1BBF9E), // #1 teal-green
    Color(0xFF3B97D3), // #2 blue
    Color(0xFF7E8CE0), // #3 indigo
    Color(0xFFB58CD0), // #4 violet
    Color(0xFFC98AB0), // #5 mauve
  ];

  static Color rankColor(int rank) =>
      rankColors[(rank - 1).clamp(0, rankColors.length - 1)];

  static ThemeData dark() => _build(Brightness.dark);
  static ThemeData light() => _build(Brightness.light);

  static ThemeData _build(Brightness brightness) {
    final scheme = ColorScheme.fromSeed(
      seedColor: seed,
      brightness: brightness,
    );
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: scheme.surface,
    );
    return base.copyWith(
      cardTheme: CardThemeData(
        elevation: 0,
        color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.symmetric(vertical: 5),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: scheme.surface,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: scheme.onSurface,
          fontSize: 20,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.3,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      ),
      textTheme: base.textTheme.copyWith(
        headlineSmall: base.textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
        titleMedium: base.textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
