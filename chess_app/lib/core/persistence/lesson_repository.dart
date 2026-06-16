import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../models/lesson.dart';

/// Persists coach lessons as a JSON blob in shared_preferences. Small data set,
/// no need for a database in v1.
class LessonRepository {
  static const _key = 'coach_lessons';
  final SharedPreferences _prefs;
  LessonRepository(this._prefs);

  static Future<LessonRepository> create() async =>
      LessonRepository(await SharedPreferences.getInstance());

  List<Lesson> loadAll() {
    final raw = _prefs.getString(_key);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List;
      return list
          .map((e) => Lesson.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> saveAll(List<Lesson> lessons) async {
    final raw = jsonEncode(lessons.map((l) => l.toJson()).toList());
    await _prefs.setString(_key, raw);
  }

  Future<void> upsert(Lesson lesson) async {
    final all = loadAll();
    final idx = all.indexWhere((l) => l.id == lesson.id);
    if (idx >= 0) {
      all[idx] = lesson;
    } else {
      all.add(lesson);
    }
    await saveAll(all);
  }

  Future<void> delete(String id) async {
    final all = loadAll()..removeWhere((l) => l.id == id);
    await saveAll(all);
  }
}
