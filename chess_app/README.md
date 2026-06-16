# Chess Trainer ♟️

An **offline** chess training app for Android & iOS, built with Flutter. It plays,
analyzes, and teaches using **Stockfish 18 running natively on-device** (no
server, no internet). The centerpiece is a **coaching analysis window** that
shows the engine's **five best moves** with evaluations, opening-book / sideline
labels, principal variations, and a plain-language coach's note for each.

> Built for coaches, students, and players — *play, train, and improve.*

---

## Features (v1)

- **Coaching Analysis (core).** MultiPV=5 — five candidate moves drawn as
  ranked arrows on the board, each with an eval, a Book / Mainline / Sideline
  badge, its principal variation (playable), and a coach's note. Eval bar +
  opening name + live search depth. Configurable deep look-ahead.
- **Play vs Engine.** Stockfish 18 from ~800 Elo to full strength; choose color,
  undo, resign, then "Analyze this game" hands the moves to the coaching window.
- **Tactics Trainer.** Solve bundled puzzles (Lichess CSV format) with move
  checking, hints, and retry. Drop in the full Lichess database to scale up.
- **Coach & Student.** Save teaching positions (FEN + objective); opening one
  launches the coaching analysis so the student sees the best ideas and *why*.
- **Settings.** Theme, board coordinates, default opponent Elo, analysis depth /
  deep mode, MultiPV count.

---

## Architecture

Feature-first, with a shared core. State via **Riverpod**, navigation via
**go_router**. No code generation — `flutter pub get` then run.

```
lib/
  core/
    engine/      UCI transport, command builders, info parser, engine service
    chess/       dartchess helpers (legal moves, SAN, FEN, material)
    coaching/    move classifier + rule-based commentary generator
    opening/     offline FEN-keyed opening book
    persistence/ shared_preferences repositories (settings, lessons)
    routing/     go_router config
    theme/       app theme + rank/classification colors
  models/        EvalScore (cp|mate), AnalysisLine, EngineConfig, Game, Puzzle…
  features/      home, play, analysis, puzzles, coach, settings
  shared/widgets board view (chessground), eval bar, badges, candidate card
assets/
  puzzles/puzzles.csv     bundled tactics (replace with full Lichess export)
  book/openings.json      offline opening book (extend freely)
```

**Engine flow:** `UciEngineService` performs the UCI handshake, then serializes
searches (only one `go` at a time; a new request `stop`s the previous one). It
streams `info … multipv K … score … pv …` lines through a pure parser
(`UciInfoParser`) into White-relative `AnalysisLine`s. `AnalysisController`
upserts them by rank and exposes the sorted top-5 reactively.

---

## Prerequisites

- **Flutter** stable 3.27+ and Dart 3.6+ (`flutter --version`).
- **Android:** Android Studio with the **Android SDK, NDK, and CMake** installed
  (SDK Manager → SDK Tools). The `stockfish` package compiles native code, so
  the NDK is required.
- **iOS (Mac only):** Xcode 15+ and CocoaPods (`sudo gem install cocoapods`).

---

## One-time setup

The repo ships the Dart source, assets, and tests. Generate the platform
folders (`android/`, `ios/`) once — `flutter create` **preserves** existing
`lib/`, `pubspec.yaml`, and assets, only adding what's missing:

```bash
cd chess_app
flutter create --org com.jereme --project-name chess_app --platforms=android,ios .
flutter pub get
```

### Android config
In `android/app/build.gradle` (or `build.gradle.kts`) make sure:

```gradle
android {
    ndkVersion = "26.1.10909125"   // any installed recent NDK
    defaultConfig {
        minSdkVersion 21           // 24+ recommended for NNUE performance
    }
}
```

Use an **x86_64** emulator image or a real arm64 device — the native engine
`.so` won't load on an unsupported ABI.

### iOS config
In `ios/Podfile` set the platform and install pods:

```ruby
platform :ios, '12.0'
```

```bash
cd ios && pod install && cd ..
```

Bitcode is already disabled in recent Xcode/Flutter defaults.

---

## Get the installable APK (no local setup)

A GitHub Actions workflow (`.github/workflows/build-chess-apk.yml`) builds a
release APK for you:

1. Push this repo, open the **Actions** tab → **Build Chess Trainer APK** → **Run workflow**.
2. When it finishes, download the **`chess-trainer-apk`** artifact.
3. On your phone, enable *Install unknown apps* for your browser/file manager,
   then open the `.apk` to install.

The workflow runs `flutter create` (to generate the `android/` project),
`flutter pub get`, analyze/tests, then `flutter build apk --release`.

## Run locally

```bash
flutter run            # pick your emulator/device
flutter build apk --release   # or build the APK yourself
```

### Verify the engine first (Phase-2 smoke test)
Open **Settings → Run engine smoke test** (or route `/engine-test`) and tap
**Run depth-12 search**. Within a second or two you should see streaming
`#1 … pv …` lines and `✅ Engine responded`. If this works, FFI/NDK is correctly
set up and every other feature will work.

To confirm it's truly offline: enable **airplane mode** and analyze — the engine
still responds (Stockfish's NNUE network is embedded in the binary).

---

## Manual test checklist

1. **Analysis:** Home → Coaching Analysis. Five candidate cards stream in with
   arrows, evals, badges, and notes; the eval bar and depth update live. Tap
   "Play line" to walk a variation; use the nav bar to step back/forward.
2. **Play:** Home → Play vs Engine. Pick a side + Elo, play moves, undo, then
   "Analyze this game".
3. **Puzzles:** Home → Tactics Trainer. Solve a mate-in-one; try Hint and Next.
4. **Coach:** Home → Coach & Student → New position (paste a FEN + objective).
   Tap it to open the coaching analysis.

---

## Tests

Pure-logic tests run without a device or the native engine:

```bash
flutter test
```

Covered: UCI parsing (MultiPV, cp/mate, perspective normalization, bestmove),
move classification thresholds, and eval/win-probability math. The engine
service is injectable (`EngineTransport`) so analysis logic can be tested with a
fake UCI stream.

---

## Extending

- **Full puzzle database:** download the official Lichess puzzle CSV and replace
  `assets/puzzles/puzzles.csv` (identical column order). The in-memory loader and
  rating/theme filters handle it as-is.
- **Bigger opening book:** add entries to `assets/book/openings.json`, keyed by
  the first two FEN fields (`placement side-to-move`) → `{ name, moves: [uci…] }`.

---

## ⚠️ Licensing

`stockfish`, `chessground`, and `dartchess` are **GPL-3.0**, so this app's
engine/board/logic core is GPL-3.0. That's fine for an open-source release.
Note GPL-3.0 conflicts with Apple App Store distribution terms — revisit
licensing (or swap to permissive but weaker libraries) before any closed-source
or App Store release.

## Note on package APIs

`chessground` / `dartchess` evolve across majors. This targets `chessground ^10`
and `dartchess ^0.13`. If a build error points at `GameData`, `onMove`,
`Move.parse`, or `makeSan`, the fix is localized to `shared/widgets/
chess_board_view.dart` and `core/chess/chess_logic.dart` — check the installed
package's API and adjust those two files.
