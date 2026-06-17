import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/chess/chess_logic.dart';
import '../../core/engine/uci_engine_service.dart';
import '../../core/providers.dart';
import '../../models/engine_config.dart';

/// A diagnostic screen that confirms the native Stockfish binary loads and
/// responds. Run this first on a new device/emulator (Phase 2 verification).
class EngineSmokeScreen extends ConsumerStatefulWidget {
  const EngineSmokeScreen({super.key});

  @override
  ConsumerState<EngineSmokeScreen> createState() => _EngineSmokeScreenState();
}

class _EngineSmokeScreenState extends ConsumerState<EngineSmokeScreen> {
  final _log = <String>[];
  bool _running = false;

  Future<void> _run() async {
    setState(() {
      _running = true;
      _log.clear();
      _log.add('Booting Stockfish…');
    });
    final engine = ref.read(engineServiceProvider);
    final sub = engine.events.listen((e) => setState(() => _log.add(e.toString())));
    try {
      await engine.analyze(const SearchRequest(
        fen: ChessLogic.startFen,
        whiteToMove: true,
        config: EngineConfig(multiPv: 1, depth: 12),
      ));
      _log.add('✅ Engine responded — FFI is working.');
    } catch (e) {
      _log.add('❌ Engine error: $e');
    } finally {
      await sub.cancel();
      if (mounted) setState(() => _running = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Engine smoke test')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _running ? null : _run,
        icon: const Icon(Icons.play_arrow),
        label: Text(_running ? 'Running…' : 'Run depth-12 search'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _log.length,
        itemBuilder: (_, i) => Text(
          _log[i],
          style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
        ),
      ),
    );
  }
}
