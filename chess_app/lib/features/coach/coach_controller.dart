import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../models/lesson.dart';

/// Manages the coach's saved positions. For v1 all positions live in a single
/// implicit lesson; the model supports multiple lessons for later expansion.
class CoachController extends Notifier<List<CoachPosition>> {
  @override
  List<CoachPosition> build() {
    final lessons = ref.read(lessonRepositoryProvider).loadAll();
    return lessons.expand((l) => l.positions).toList();
  }

  static const _lessonId = 'default-lesson';

  Future<void> _persist() async {
    final lesson = Lesson(
      id: _lessonId,
      title: 'Coaching Positions',
      positions: state,
    );
    await ref.read(lessonRepositoryProvider).saveAll([lesson]);
  }

  Future<void> addPosition(CoachPosition pos) async {
    state = [...state, pos];
    await _persist();
  }

  Future<void> deletePosition(String id) async {
    state = state.where((p) => p.id != id).toList();
    await _persist();
  }
}

final coachControllerProvider =
    NotifierProvider<CoachController, List<CoachPosition>>(CoachController.new);
