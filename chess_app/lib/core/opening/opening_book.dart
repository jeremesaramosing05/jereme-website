import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;

/// A lightweight, offline opening book.
///
/// Keyed by the first four FEN fields (placement + side + castling + en
/// passant) so move counters don't affect lookups. Backed by a bundled JSON
/// asset that is trivial to extend:
///
/// ```json
/// { "<fenKey>": { "name": "Ruy Lopez", "moves": ["e2e4", "g1f3"] } }
/// ```
class OpeningBook {
  final Map<String, _BookEntry> _entries;
  OpeningBook(this._entries);

  static OpeningBook empty() => OpeningBook({});

  static Future<OpeningBook> loadFromAsset(
      [String path = 'assets/book/openings.json']) async {
    try {
      final raw = await rootBundle.loadString(path);
      final data = jsonDecode(raw) as Map<String, dynamic>;
      final entries = data.map((k, v) {
        final m = v as Map<String, dynamic>;
        return MapEntry(
          k,
          _BookEntry(
            name: m['name'] as String? ?? 'Opening',
            moves: (m['moves'] as List).map((e) => e as String).toSet(),
          ),
        );
      });
      return OpeningBook(entries);
    } catch (_) {
      return OpeningBook.empty();
    }
  }

  /// Key on placement + side-to-move only. Castling/en-passant encodings differ
  /// between FEN producers (dartchess omits an unreachable e.p. square), so we
  /// deliberately ignore them to keep book lookups stable.
  static String fenKey(String fen) {
    final parts = fen.trim().split(RegExp(r'\s+'));
    return parts.take(2).join(' ');
  }

  /// True if [uci] is a known theory move in the position [fen].
  bool isBookMove(String fen, String uci) =>
      _entries[fenKey(fen)]?.moves.contains(uci) ?? false;

  /// True if the position itself is a known book position.
  bool isBookPosition(String fen) => _entries.containsKey(fenKey(fen));

  /// The opening name for this position, if known.
  String? nameFor(String fen) => _entries[fenKey(fen)]?.name;
}

class _BookEntry {
  final String name;
  final Set<String> moves;
  _BookEntry({required this.name, required this.moves});
}
