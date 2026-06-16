/// A tactics puzzle. Mirrors the Lichess puzzle CSV schema.
///
/// In a Lichess puzzle, [fen] is the position *before* the opponent's setup
/// move; the first move in [solutionUci] is played automatically by the board,
/// and the solver must find the remaining moves.
class Puzzle {
  final String id;
  final String fen;
  final List<String> solutionUci;
  final int rating;
  final List<String> themes;

  const Puzzle({
    required this.id,
    required this.fen,
    required this.solutionUci,
    required this.rating,
    this.themes = const [],
  });

  /// The opponent's setup move (auto-played), if present.
  String? get setupMove => solutionUci.isEmpty ? null : solutionUci.first;

  /// The moves the solver must find (everything after the setup move).
  List<String> get playerMoves =>
      solutionUci.length <= 1 ? const [] : solutionUci.sublist(1);

  /// Parse one Lichess CSV row:
  /// PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,...
  static Puzzle? fromCsvRow(List<String> cells) {
    if (cells.length < 4) return null;
    final moves = cells[2].trim().split(RegExp(r'\s+')).where((m) => m.isNotEmpty).toList();
    if (moves.isEmpty) return null;
    return Puzzle(
      id: cells[0].trim(),
      fen: cells[1].trim(),
      solutionUci: moves,
      rating: int.tryParse(cells[3].trim()) ?? 1500,
      themes: cells.length > 7
          ? cells[7].trim().split(RegExp(r'\s+')).where((t) => t.isNotEmpty).toList()
          : const [],
    );
  }
}

/// A solver's attempt record (kept in memory / prefs for streaks).
class PuzzleAttempt {
  final String puzzleId;
  final bool solved;
  final int hintsUsed;
  final DateTime at;

  const PuzzleAttempt({
    required this.puzzleId,
    required this.solved,
    required this.hintsUsed,
    required this.at,
  });
}
