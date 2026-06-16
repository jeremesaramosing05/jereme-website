import 'dart:async';

import 'package:stockfish/stockfish.dart';

/// Minimal transport over a UCI engine process. Abstracted so that tests can
/// replace the native Stockfish with a fake that replays recorded output.
abstract class EngineTransport {
  /// Broadcast stream of raw stdout lines from the engine.
  Stream<String> get stdout;

  /// Becomes true once the underlying engine is ready to accept commands.
  Future<void> get ready;

  /// Send a single UCI command line.
  void send(String command);

  Future<void> dispose();
}

/// Real transport backed by the `stockfish` FFI package (Stockfish 18).
class StockfishTransport implements EngineTransport {
  final Stockfish _engine;
  final Completer<void> _ready = Completer<void>();

  StockfishTransport() : _engine = Stockfish() {
    void listener() {
      final state = _engine.state.value;
      if (state == StockfishState.ready && !_ready.isCompleted) {
        _ready.complete();
      }
      if (state == StockfishState.error && !_ready.isCompleted) {
        _ready.completeError(StateError('Stockfish failed to start'));
      }
    }

    _engine.state.addListener(listener);
    listener(); // in case it is already ready
  }

  @override
  Stream<String> get stdout => _engine.stdout;

  @override
  Future<void> get ready => _ready.future;

  @override
  void send(String command) => _engine.stdin = command;

  @override
  Future<void> dispose() async {
    try {
      _engine.stdin = 'quit';
    } catch (_) {/* already gone */}
    _engine.dispose();
  }
}
