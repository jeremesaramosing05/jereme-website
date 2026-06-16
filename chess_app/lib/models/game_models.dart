import 'eval_score.dart';
import 'move_classification.dart';

enum PlayerSide { white, black, both }

enum GameResult { whiteWins, blackWins, draw, ongoing }

/// A single played move in a game record.
class GameMove {
  final int ply; // 1-based
  final String uci; // e2e4
  final String san; // e4
  final String fenAfter;
  final EvalScore? evalAfter;
  final MoveClassification? classification;

  const GameMove({
    required this.ply,
    required this.uci,
    required this.san,
    required this.fenAfter,
    this.evalAfter,
    this.classification,
  });

  GameMove copyWith({EvalScore? evalAfter, MoveClassification? classification}) =>
      GameMove(
        ply: ply,
        uci: uci,
        san: san,
        fenAfter: fenAfter,
        evalAfter: evalAfter ?? this.evalAfter,
        classification: classification ?? this.classification,
      );

  Map<String, dynamic> toJson() => {
        'ply': ply,
        'uci': uci,
        'san': san,
        'fenAfter': fenAfter,
      };

  factory GameMove.fromJson(Map<String, dynamic> j) => GameMove(
        ply: j['ply'] as int,
        uci: j['uci'] as String,
        san: j['san'] as String,
        fenAfter: j['fenAfter'] as String,
      );
}

/// A persisted game (played vs engine or imported).
class GameRecord {
  final String id;
  final DateTime createdAt;
  final String startFen;
  final PlayerSide humanSide;
  final List<GameMove> moves;
  final GameResult result;
  final String? title;

  const GameRecord({
    required this.id,
    required this.createdAt,
    required this.startFen,
    required this.humanSide,
    required this.moves,
    this.result = GameResult.ongoing,
    this.title,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'createdAt': createdAt.toIso8601String(),
        'startFen': startFen,
        'humanSide': humanSide.name,
        'result': result.name,
        'title': title,
        'moves': moves.map((m) => m.toJson()).toList(),
      };

  factory GameRecord.fromJson(Map<String, dynamic> j) => GameRecord(
        id: j['id'] as String,
        createdAt: DateTime.parse(j['createdAt'] as String),
        startFen: j['startFen'] as String,
        humanSide: PlayerSide.values.byName(j['humanSide'] as String),
        result: GameResult.values.byName(j['result'] as String),
        title: j['title'] as String?,
        moves: (j['moves'] as List)
            .map((e) => GameMove.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
