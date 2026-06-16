import 'package:dartchess/dartchess.dart';

import '../../models/analysis_line.dart';
import '../../models/eval_score.dart';

/// How a candidate move relates to known theory / the engine's preference.
enum LineKind {
  book('Book', 'known opening theory'),
  mainline('Mainline', "the engine's main recommendation"),
  sideline('Sideline', 'a reasonable alternative');

  final String label;
  final String blurb;
  const LineKind(this.label, this.blurb);
}

/// Generates short, instructive, **offline & deterministic** coaching notes for
/// a candidate line — the "master explaining to the disciple" voice.
class CoachCommentary {
  const CoachCommentary();

  String forLine({
    required String fen,
    required AnalysisLine line,
    required EvalScore bestScore,
    required LineKind kind,
    required bool whiteToMove,
  }) {
    final parts = <String>[];

    final intent = _moveIntent(fen, line.firstMoveUci);
    if (intent != null) parts.add(intent);

    // Relative standing.
    if (line.rank == 1) {
      parts.add('The engine prefers this — ${_assessment(line.score, whiteToMove)}.');
    } else {
      final gap = _lossVs(bestScore, line.score, whiteToMove);
      if (gap <= 20) {
        parts.add('Nearly as strong as the top move (${kind.blurb}).');
      } else if (gap <= 80) {
        parts.add('Playable, but gives back a little (${kind.blurb}).');
      } else {
        parts.add('Weaker — it concedes about ${(gap / 100).toStringAsFixed(1)} pawns versus the best move.');
      }
    }

    if (kind == LineKind.book) {
      parts.add('This follows established theory.');
    }

    if (line.score is Mate) {
      final m = (line.score as Mate);
      parts.insert(0, m.moves.abs() <= 0
          ? 'Checkmate!'
          : 'Forced mate in ${m.moves.abs()} — the sharpest path.');
    }

    return parts.join(' ');
  }

  /// Best-move teaching summary shown at the top of the coaching window.
  String headline(EvalScore best, bool whiteToMove) {
    final who = best.whiteWinProbability >= 0.5 ? 'White' : 'Black';
    final pct = (best.winProbabilityFor(white: who == 'White') * 100).round();
    if (best is Mate) {
      return 'Forced mate is on the board.';
    }
    final loss = best.clampedCentipawns.abs();
    if (loss < 40) return 'The position is balanced ($who ~$pct%). Choose a plan.';
    if (loss < 150) return '$who is a little better (~$pct%). Press the edge.';
    if (loss < 400) return '$who is clearly better (~$pct%).';
    return '$who is winning (~$pct%). Convert carefully.';
  }

  // --- helpers -------------------------------------------------------------

  String? _moveIntent(String fen, String? uci) {
    if (uci == null) return null;
    try {
      final pos = Chess.fromSetup(Setup.parseFen(fen));
      final move = Move.parse(uci);
      if (move == null || !pos.isLegal(move) || move is! NormalMove) return null;

      final movingPiece = pos.board.pieceAt(move.from);
      final capture = pos.board.pieceAt(move.to) != null;
      final (next, san) = pos.makeSan(move);
      final givesCheck = next.isCheck;
      final isCastle = san.startsWith('O-O');

      if (isCastle) return 'Castles — tucks the king to safety and connects the rooks.';
      if (givesCheck && capture) return 'A forcing capture with check.';
      if (givesCheck) return 'Gives check, seizing the initiative.';
      if (capture) return 'Wins material or trades to clarify the position.';

      return switch (movingPiece?.role) {
        Role.pawn => 'A pawn move — grabs space and shapes the center.',
        Role.knight => 'Develops the knight toward active squares.',
        Role.bishop => 'Activates the bishop along its diagonal.',
        Role.rook => 'Brings the rook into play, often eyeing an open file.',
        Role.queen => 'Repositions the queen with purpose — watch for overextension.',
        Role.king => 'A king move — improves safety or activity.',
        _ => null,
      };
    } catch (_) {
      return null;
    }
  }

  String _assessment(EvalScore score, bool whiteToMove) {
    final cp = score.clampedCentipawns;
    final moverCp = whiteToMove ? cp : -cp;
    if (score is Mate) return 'it forces mate';
    if (moverCp > 150) return 'it keeps a clear advantage';
    if (moverCp > 40) return 'it holds a small edge';
    if (moverCp > -40) return 'it keeps the balance';
    return 'it is the most resilient defense';
  }

  int _lossVs(EvalScore best, EvalScore line, bool whiteToMove) {
    final b = best.clampedCentipawns;
    final l = line.clampedCentipawns;
    return whiteToMove ? (b - l) : (l - b);
  }
}
