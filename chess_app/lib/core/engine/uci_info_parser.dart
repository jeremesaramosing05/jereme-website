import '../../models/analysis_line.dart';
import '../../models/eval_score.dart';

/// Result of parsing a single line of Stockfish UCI output.
sealed class UciEvent {
  const UciEvent();
}

/// An `info ...` line carrying one MultiPV candidate.
class InfoEvent extends UciEvent {
  final AnalysisLine line;
  const InfoEvent(this.line);
}

/// A `bestmove ...` line — the search has finished.
class BestMoveEvent extends UciEvent {
  final String? bestMoveUci;
  final String? ponderUci;
  const BestMoveEvent(this.bestMoveUci, this.ponderUci);
}

/// Handshake / housekeeping tokens we care about.
class UciOkEvent extends UciEvent {
  const UciOkEvent();
}

class ReadyOkEvent extends UciEvent {
  const ReadyOkEvent();
}

/// Pure parser for Stockfish stdout lines.
///
/// [whiteToMove] is needed because UCI scores are reported from the
/// side-to-move's perspective; we normalize everything to White-relative.
class UciInfoParser {
  const UciInfoParser();

  UciEvent? parse(String raw, {required bool whiteToMove}) {
    final line = raw.trim();
    if (line.isEmpty) return null;
    if (line == 'uciok') return const UciOkEvent();
    if (line == 'readyok') return const ReadyOkEvent();

    if (line.startsWith('bestmove')) {
      final tokens = line.split(RegExp(r'\s+'));
      String? best;
      String? ponder;
      if (tokens.length > 1 && tokens[1] != '(none)') best = tokens[1];
      final pIdx = tokens.indexOf('ponder');
      if (pIdx != -1 && pIdx + 1 < tokens.length) ponder = tokens[pIdx + 1];
      return BestMoveEvent(best, ponder);
    }

    if (!line.startsWith('info')) return null;
    // Only "info" lines that carry a principal variation are useful candidates.
    final tokens = line.split(RegExp(r'\s+'));

    int rank = 1;
    int depth = 0;
    EvalScore? score;
    List<String> pv = const [];

    for (var i = 0; i < tokens.length; i++) {
      switch (tokens[i]) {
        case 'multipv':
          rank = int.tryParse(_next(tokens, i)) ?? rank;
        case 'depth':
          depth = int.tryParse(_next(tokens, i)) ?? depth;
        case 'score':
          final type = _next(tokens, i);
          final value = int.tryParse(_next(tokens, i + 1)) ?? 0;
          final raw = type == 'mate' ? EvalScore.mate(value) : EvalScore.cp(value);
          // Normalize to White's perspective.
          score = whiteToMove ? raw : raw.negated;
        case 'pv':
          pv = tokens.sublist(i + 1);
          i = tokens.length; // pv is always last
      }
    }

    if (score == null || pv.isEmpty) return null;
    return InfoEvent(AnalysisLine(
      rank: rank,
      score: score,
      depth: depth,
      pvUci: pv,
    ));
  }

  String _next(List<String> tokens, int i) =>
      (i + 1 < tokens.length) ? tokens[i + 1] : '';
}
