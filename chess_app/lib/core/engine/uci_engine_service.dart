import 'dart:async';

import '../../models/engine_config.dart';
import 'engine_transport.dart';
import 'uci_commands.dart';
import 'uci_info_parser.dart';

/// A single analysis/search request.
class SearchRequest {
  final String fen;
  final bool whiteToMove;
  final EngineConfig config;

  /// Optional moves applied after [fen] (so deep PVs replay correctly).
  final List<String> moves;

  const SearchRequest({
    required this.fen,
    required this.whiteToMove,
    required this.config,
    this.moves = const [],
  });
}

/// Long-lived service wrapping a UCI engine.
///
/// Responsibilities:
///  * one-time UCI handshake,
///  * **serialized** searches (only one `go` in flight; a new request stops the
///    current one first so `info` lines from two searches never interleave),
///  * exposing parsed [UciEvent]s for the active search.
class UciEngineService {
  final EngineTransport _transport;
  final UciInfoParser _parser;

  StreamSubscription<String>? _sub;
  final _events = StreamController<UciEvent>.broadcast();

  bool _handshakeDone = false;
  bool _whiteToMove = true;

  /// Guards command ordering: each request chains onto the previous one.
  Future<void> _chain = Future.value();

  /// Completes when the in-flight search emits `bestmove`.
  Completer<void>? _searchDone;

  UciEngineService(this._transport, {UciInfoParser parser = const UciInfoParser()})
      : _parser = parser;

  /// Parsed events for the currently active search (info lines + bestmove).
  Stream<UciEvent> get events => _events.stream;

  Future<void> init() async {
    if (_handshakeDone) return;
    await _transport.ready;
    _sub = _transport.stdout.listen(_onLine);
    _send(UciCommands.uci);
    await _waitFor<UciOkEvent>();
    _send(UciCommands.isReady);
    await _waitFor<ReadyOkEvent>();
    _handshakeDone = true;
  }

  void _onLine(String raw) {
    final event = _parser.parse(raw, whiteToMove: _whiteToMove);
    if (event == null) return;
    _events.add(event);
    if (event is BestMoveEvent && !(_searchDone?.isCompleted ?? true)) {
      _searchDone!.complete();
    }
  }

  void _send(String cmd) => _transport.send(cmd);

  /// Stops any running search, configures options, and starts a new one.
  /// Eagerly interrupts the current search so stepping through positions stays
  /// responsive; the chain then serializes the actual command sequence.
  Future<void> analyze(SearchRequest req) {
    if (_handshakeDone &&
        _searchDone != null &&
        !_searchDone!.isCompleted) {
      _send(UciCommands.stop);
    }
    _chain = _chain.then((_) => _runSearch(req)).catchError((_) {});
    return _chain;
  }

  Future<void> _runSearch(SearchRequest req) async {
    await init();
    await _stopRunning();

    _whiteToMove = req.whiteToMove;
    for (final opt in UciCommands.optionsFor(req.config)) {
      _send(opt);
    }
    _send(UciCommands.positionFen(req.fen, moves: req.moves));

    _searchDone = Completer<void>();
    _send(req.config.goCommand);

    // For finite searches, await completion so the chain serializes properly.
    if (!req.config.infinite) {
      await _searchDone!.future;
    }
  }

  /// Request the engine to play a move for [req] (single-line search) and
  /// return the chosen UCI move.
  Future<String?> bestMove(SearchRequest req) async {
    String? best;
    final sub = events.listen((e) {
      if (e is BestMoveEvent) best = e.bestMoveUci;
    });
    final single = req.config.copyWith(multiPv: 1, infinite: false);
    await analyze(SearchRequest(
      fen: req.fen,
      whiteToMove: req.whiteToMove,
      config: single,
      moves: req.moves,
    ));
    await sub.cancel();
    return best;
  }

  Future<void> stop() => _stopRunning();

  Future<void> _stopRunning() async {
    if (_searchDone != null && !_searchDone!.isCompleted) {
      _send(UciCommands.stop);
      await _searchDone!.future.timeout(
        const Duration(seconds: 3),
        onTimeout: () {},
      );
    }
  }

  Future<void> dispose() async {
    await _sub?.cancel();
    await _events.close();
    await _transport.dispose();
  }

  Future<T> _waitFor<T extends UciEvent>() =>
      events.firstWhere((e) => e is T).then((e) => e as T);
}
