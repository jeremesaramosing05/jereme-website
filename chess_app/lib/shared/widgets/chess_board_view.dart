import 'package:chessground/chessground.dart' as cg;
import 'package:dartchess/dartchess.dart';
import 'package:fast_immutable_collections/fast_immutable_collections.dart';
import 'package:flutter/material.dart';

import '../../core/chess/chess_logic.dart';

/// App-wide wrapper around the chessground board so every screen gets a
/// consistent look and a single upgrade point.
///
/// NOTE: chessground's API evolves across majors. This targets chessground
/// ^10. If a build error mentions `GameData`/`onMove` signatures, adjust here.
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
  NormalMove? _promotionMove;

  @override
  Widget build(BuildContext context) {
    final position = ChessLogic.tryPosition(widget.fen);

    return LayoutBuilder(
      builder: (context, constraints) {
        final size = constraints.biggest.shortestSide;
        return cg.Chessboard(
          size: size,
          orientation: widget.orientation,
          fen: widget.fen,
          lastMove: widget.lastMove,
          shapes: ISet(widget.shapes),
          settings: cg.ChessboardSettings(
            enableCoordinates: widget.showCoordinates,
            animationDuration: const Duration(milliseconds: 180),
          ),
          game: position == null
              ? null
              : cg.GameData(
                  playerSide: widget.playerSide,
                  sideToMove: position.turn,
                  validMoves: cg.makeLegalMoves(position),
                  promotionMove: _promotionMove,
                  isCheck: position.isCheck,
                  onMove: _onMove,
                  onPromotionSelection: _onPromotion,
                ),
        );
      },
    );
  }

  void _onMove(NormalMove move, {bool? isDrop}) {
    final uci = move.uci;
    // Detect a promotion that arrived without a role and prompt for the piece.
    if (ChessLogic.applyUci(widget.fen, uci) == null &&
        ChessLogic.applyUci(widget.fen, '${uci}q') != null) {
      setState(() => _promotionMove = move);
      return;
    }
    widget.onMove?.call(uci);
  }

  void _onPromotion(Role? role) {
    final move = _promotionMove;
    setState(() => _promotionMove = null);
    if (move == null || role == null) return;
    final promo = NormalMove(from: move.from, to: move.to, promotion: role);
    widget.onMove?.call(promo.uci);
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
