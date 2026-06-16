import 'package:flutter/services.dart' show rootBundle;

import '../../models/puzzle.dart';

/// Loads the bundled puzzle CSV into memory.
///
/// To use the full Lichess database, replace `assets/puzzles/puzzles.csv` with
/// the official export — the column order is identical.
class PuzzleRepository {
  final List<Puzzle> puzzles;
  PuzzleRepository(this.puzzles);

  static Future<PuzzleRepository> loadFromAsset(
      [String path = 'assets/puzzles/puzzles.csv']) async {
    final raw = await rootBundle.loadString(path);
    final lines = raw.split('\n');
    final out = <Puzzle>[];
    for (var i = 0; i < lines.length; i++) {
      final line = lines[i].trim();
      if (line.isEmpty) continue;
      if (i == 0 && line.startsWith('PuzzleId')) continue; // header
      final cells = _splitCsv(line);
      final puzzle = Puzzle.fromCsvRow(cells);
      if (puzzle != null) out.add(puzzle);
    }
    return PuzzleRepository(out);
  }

  /// Simple CSV splitter (handles quoted cells; puzzle data rarely needs more).
  static List<String> _splitCsv(String line) {
    final cells = <String>[];
    final buf = StringBuffer();
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      final c = line[i];
      if (c == '"') {
        inQuotes = !inQuotes;
      } else if (c == ',' && !inQuotes) {
        cells.add(buf.toString());
        buf.clear();
      } else {
        buf.write(c);
      }
    }
    cells.add(buf.toString());
    return cells;
  }

  /// Puzzles within a rating window, sorted by rating.
  List<Puzzle> byRating({int min = 0, int max = 4000}) =>
      (puzzles.where((p) => p.rating >= min && p.rating <= max).toList())
        ..sort((a, b) => a.rating.compareTo(b.rating));

  List<Puzzle> byTheme(String theme) =>
      puzzles.where((p) => p.themes.contains(theme)).toList();
}
