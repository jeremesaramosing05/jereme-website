import 'package:chessground/chessground.dart' as cg;
import 'package:dartchess/dartchess.dart';
import 'package:flutter/material.dart';

import '../../core/chess/chess_logic.dart';

/// App-wide wrapper around the chessground board so every screen gets a
/// consistent look and a single upgrade point.
///
/// Targets chessground ^10.0, which uses a [cg.ChessboardController] holding the
/// position/game state. We rebuild that controller's [cg.GameData] whenever the
/// FEN or interactivity changes. Promotion is handled inside the board widget,
/// which fires [onMove] with the fully-resolved move.
class ChessBoardView extends StatefulWidget {
  final String fen;
  final Side orientation;

  /// Which side the human may move. Use [cg.PlayerSide.none] for a static board.
  final cg.PlayerSide playerSide;

  /// Called with the chosen move in UCI (e.g. `e2e4`, `e7e8q`).
  final void Function(String uci)? onMove;

  final List<cg.Shape> shapes;
  final Move? lastMove;
  final bool showCoordinates;

  const ChessBoardView({
    super.key,
    required this.fen,
    this.orientation = Side.white,
    this.playerSide = cg.PlayerSide.none,
    this.onMove,
    this.shapes = const [],
    this.lastMove,
    this.showCoordinates = true,
  });

  @override
  State<ChessBoardView> createState() => _ChessBoardViewState();
}

class _ChessBoardViewState extends State<ChessBoardView> {
  late final cg.ChessboardController _controller =
      cg.ChessboardController(game: _gameData());

  @override
  void didUpdateWidget(ChessBoardView old) {
    super.didUpdateWidget(old);
    if (old.fen != widget.fen ||
        old.playerSide != widget.playerSide ||
        old.lastMove != widget.lastMove) {
      _controller.updatePosition(_gameData(), resetPremove: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  cg.GameData _gameData() {
    final pos = ChessLogic.tryPosition(widget.fen);
    final safeFen = pos != null ? widget.fen : ChessLogic.startFen;
    final position = pos ?? ChessLogic.positionFromFen(ChessLogic.startFen);
    final interactive = widget.playerSide != cg.PlayerSide.none;
    return cg.GameData(
      fen: safeFen,
      playerSide: widget.playerSide,
      sideToMove: position.turn,
      validMoves: interactive ? _validMoves(position) : const {},
      lastMove: widget.lastMove,
    );
  }

  /// Handle a move from the board. If a pawn reaches the last rank without a
  /// promotion piece already chosen, ask the player which piece to promote to
  /// (Queen/Rook/Bishop/Knight) and emit the move with that suffix.
  Future<void> _handleMove(String uci) async {
    // The move may already carry a promotion piece (e.g. "e7e8q").
    if (uci.length >= 5) {
      widget.onMove?.call(uci);
      return;
    }
    final pos = ChessLogic.tryPosition(widget.fen);
    final isPawn =
        pos != null && pos.board.roleAt(Square.fromName(uci.substring(0, 2))) == Role.pawn;
    final toRank = uci.substring(3, 4); // destination rank digit
    final reachesLastRank = toRank == '8' || toRank == '1';

    if (isPawn && reachesLastRank) {
      final role = await _pickPromotion();
      if (!mounted) return;
      if (role == null) {
        // Cancelled — revert the board to the position before the move.
        _controller.updatePosition(_gameData(), resetPremove: true);
        return;
      }
      widget.onMove?.call('$uci$role');
    } else {
      widget.onMove?.call(uci);
    }
  }

  Future<String?> _pickPromotion() {
    const choices = [('Queen', 'q'), ('Rook', 'r'), ('Bishop', 'b'), ('Knight', 'n')];
    return showDialog<String>(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: const Text('Promote pawn to'),
        children: [
          for (final (label, code) in choices)
            SimpleDialogOption(
              onPressed: () => Navigator.pop(ctx, code),
              child: Text(label),
            ),
        ],
      ),
    );
  }

  cg.ValidMoves _validMoves(Position pos) {
    final map = <Square, Set<Square>>{};
    for (final entry in pos.legalMoves.entries) {
      final dests = entry.value.squares;
      if (dests.isNotEmpty) map[entry.key] = dests.toSet();
    }
    // dartchess lists castling as the king moving onto its own rook (e1->h1).
    // Also offer the intuitive two-square king target (e1->g1/c1) so a player
    // can castle by moving the king toward the rook. ChessLogic.applyUci
    // accepts both encodings.
    void addCastleTarget(String king, String rook, String kingTwoSquares) {
      final from = Square.fromName(king);
      final dests = map[from];
      if (dests != null && dests.contains(Square.fromName(rook))) {
        dests.add(Square.fromName(kingTwoSquares));
      }
    }

    if (pos.turn == Side.white) {
      addCastleTarget('e1', 'h1', 'g1');
      addCastleTarget('e1', 'a1', 'c1');
    } else {
      addCastleTarget('e8', 'h8', 'g8');
      addCastleTarget('e8', 'a8', 'c8');
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final size = constraints.biggest.shortestSide;
        return cg.Chessboard(
          size: size,
          controller: _controller,
          orientation: widget.orientation,
          settings: cg.ChessboardSettings(
            enableCoordinates: widget.showCoordinates,
            animationDuration: const Duration(milliseconds: 180),
          ),
          onMove: (move, {bool? viaDragAndDrop}) => _handleMove(move.uci),
          shapes: widget.shapes.toSet(),
        );
      },
    );
  }
}

/// Convenience: an arrow shape for a UCI move on the board.
cg.Shape? arrowForUci(String uci, Color color, {double scale = 1.0}) {
  if (uci.length < 4) return null;
  try {
    final from = Square.fromName(uci.substring(0, 2));
    final to = Square.fromName(uci.substring(2, 4));
    return cg.Arrow(color: color, orig: from, dest: to, scale: scale);
  } catch (_) {
    return null;
  }
}
