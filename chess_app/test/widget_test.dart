import 'package:chess_app/core/theme/app_theme.dart';
import 'package:chess_app/features/home/home_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Home screen renders the mode hub', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.dark(),
        home: const HomeScreen(),
      ),
    );

    expect(find.text('Coaching Analysis'), findsOneWidget);
    expect(find.text('Play vs Engine'), findsOneWidget);
    expect(find.text('Tactics Trainer'), findsOneWidget);
    expect(find.text('Coach & Student'), findsOneWidget);
  });
}
