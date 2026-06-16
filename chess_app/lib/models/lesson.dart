import 'game_models.dart';

/// A single position a coach sets up for a student.
class CoachPosition {
  final String id;
  final String title;
  final String fen;
  final PlayerSide toMove;
  final String? prompt; // coach's instruction / objective
  final List<String> targetMoves; // optional "correct ideas" in UCI

  const CoachPosition({
    required this.id,
    required this.title,
    required this.fen,
    required this.toMove,
    this.prompt,
    this.targetMoves = const [],
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'fen': fen,
        'toMove': toMove.name,
        'prompt': prompt,
        'targetMoves': targetMoves,
      };

  factory CoachPosition.fromJson(Map<String, dynamic> j) => CoachPosition(
        id: j['id'] as String,
        title: j['title'] as String,
        fen: j['fen'] as String,
        toMove: PlayerSide.values.byName(j['toMove'] as String),
        prompt: j['prompt'] as String?,
        targetMoves:
            (j['targetMoves'] as List?)?.map((e) => e as String).toList() ?? const [],
      );
}

/// A named collection of coach positions forming a lesson.
class Lesson {
  final String id;
  final String title;
  final String? notes;
  final List<CoachPosition> positions;

  const Lesson({
    required this.id,
    required this.title,
    this.notes,
    this.positions = const [],
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'notes': notes,
        'positions': positions.map((p) => p.toJson()).toList(),
      };

  factory Lesson.fromJson(Map<String, dynamic> j) => Lesson(
        id: j['id'] as String,
        title: j['title'] as String,
        notes: j['notes'] as String?,
        positions: (j['positions'] as List)
            .map((e) => CoachPosition.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
