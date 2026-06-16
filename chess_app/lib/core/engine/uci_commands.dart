import '../../models/engine_config.dart';

/// Builders for the UCI command strings we send to Stockfish.
class UciCommands {
  const UciCommands._();

  static const uci = 'uci';
  static const isReady = 'isready';
  static const stop = 'stop';
  static const quit = 'quit';
  static const newGame = 'ucinewgame';

  static String setOption(String name, Object value) =>
      'setoption name $name value $value';

  static String positionFen(String fen, {List<String> moves = const []}) {
    final base = 'position fen $fen';
    return moves.isEmpty ? base : '$base moves ${moves.join(' ')}';
  }

  static String positionStartpos({List<String> moves = const []}) {
    const base = 'position startpos';
    return moves.isEmpty ? base : '$base moves ${moves.join(' ')}';
  }

  /// All the `setoption` lines implied by [config], in apply order.
  static List<String> optionsFor(EngineConfig config) {
    final out = <String>[
      setOption('Threads', config.threads),
      setOption('Hash', config.hashMb),
      setOption('MultiPV', config.multiPv),
    ];
    switch (config.mode) {
      case StrengthMode.fullStrength:
        out.add(setOption('UCI_LimitStrength', false));
        out.add(setOption('Skill Level', 20));
      case StrengthMode.limitElo:
        out.add(setOption('UCI_LimitStrength', true));
        out.add(setOption('UCI_Elo', config.uciElo));
      case StrengthMode.skillLevel:
        out.add(setOption('UCI_LimitStrength', false));
        out.add(setOption('Skill Level', config.skillLevel));
    }
    return out;
  }
}
