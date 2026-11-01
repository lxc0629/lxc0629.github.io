// playgrounds/cow-grass/cow-grass.generated.tsx
import { useEffect, useRef } from "../libs/react.js";
import * as THREE from "../libs/three.js";
import { OrbitControls } from "../libs/three.js";
import { GLTFLoader } from "../libs/three.js";
import { clone as cloneModel } from "../libs/three.js";

// assets/catalog.ts
var openMoji = (name, codepoint) => Object.freeze({
  path: `assets/openmoji/17.0.0/${name}.svg`,
  format: "svg",
  source: `https://github.com/hfg-gmuend/openmoji/blob/17.0.0/color/svg/${codepoint}.svg`,
  license: "CC-BY-SA-4.0"
});
var assets = Object.freeze({
  "animal/chicken/2d": openMoji("chicken", "1F413"),
  "animal/rabbit/2d": openMoji("rabbit", "1F407"),
  "animal/cow/2d": openMoji("cow", "1F404"),
  "object/apple/2d": openMoji("apple", "1F34E"),
  "object/book/2d": openMoji("book", "1F4D6"),
  "object/chair/2d": openMoji("chair", "1FA91"),
  "object/box/2d": openMoji("box", "1F4E6"),
  "nature/tree/2d": openMoji("tree", "1F333"),
  "nature/flower/2d": openMoji("flower", "1F33C"),
  "place/house/2d": openMoji("house", "1F3E0"),
  "place/school/2d": openMoji("school", "1F3EB"),
  "animal/cow/3d": Object.freeze({
    path: "models/quaternius-cow.glb",
    format: "glb",
    source: "https://quaternius.com/packs/cubeworldkit.html",
    license: "CC0-1.0",
    animations: Object.freeze({ idle: "Idle", walk: "Walk", eat: "Eating" })
  })
});
function asset(id) {
  return assets[id];
}

// playgrounds/cow-grass/cow-grass.generated.tsx
import { on, stateful } from "../pico.js";
import { Source } from "../pico.js";
import { python as python3 } from "../pico.js";
import { playback as playback2 } from "../pico.js";

// playgrounds/shared/python/index.ts
import { python as python2, pythonPreload } from "../pico.js";
import { playback } from "../pico.js";
import { terminal } from "../pico.js";
import { debugger as debuggerComponent, variableTimeline } from "../pico.js";
import { selection } from "../pico.js";

// playgrounds/shared/python/editor.ts
import { EditorState } from "../libs/codemirror.js";
import { globalCompletion, localCompletionSource, python } from "../libs/codemirror.js";
import { autocompletion } from "../libs/codemirror.js";
var cleanPaste = EditorState.transactionFilter.of((tr) => {
  if (!tr.isUserEvent("input.paste")) return tr;
  const specs = [];
  let modified = false;
  tr.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
    const text = inserted.toString();
    const doc = tr.startState.doc;
    const line = doc.lineAt(fromA);
    const lineText = line.text;
    if (/^\s*$/.test(lineText) && lineText.length > 0 && /^\s+/.test(text)) {
      specs.push({ changes: { from: line.from, to: line.to, insert: text } });
      modified = true;
      return;
    }
    const prefix = doc.sliceString(line.from, fromA);
    if (/^\s+$/.test(prefix) && /^\s+/.test(text)) {
      specs.push({ changes: { from: line.from, to: toA, insert: text } });
      modified = true;
      return;
    }
    specs.push({ changes: { from: fromA, to: toA, insert: text } });
  });
  if (!modified) return tr;
  return specs;
});
var pythonEditorOptions = {
  extensions: [cleanPaste, python(), autocompletion({ override: [globalCompletion, localCompletionSource] })]
};

// playgrounds/shared/python/index.ts
function pythonOptions(options = {}) {
  return {
    filename: "main.py",
    editor: pythonEditorOptions,
    preload: [pythonPreload],
    commands: { run: { type: "python.run" }, reset: { type: "python.reset" }, clear: { type: "python.clear" } },
    assemble({ bus, editor, own, observe }) {
      const output = own(terminal.create(bus));
      const debugging = own(debuggerComponent.create(options.debugger ?? {}, bus));
      const focus = own(selection.create(bus));
      bus.emit({ type: "terminal.init" }, "application.start");
      bus.emit({ type: "debugger.init" }, "application.start");
      own({ dispose: bus.subscribe(["editor.selected"], (event) => {
        const from = Math.min(event.anchor, event.head);
        const to = Math.max(event.anchor, event.head);
        bus.emit({ type: "selection.select", selection: from === to ? null : { kind: "source", source: editor.state.source, from, to } }, "editor");
      }) });
      const playing = own(playback.create(options.playback ?? {}, bus));
      let checkedSource = editor.state.source;
      own({ dispose: bus.subscribe(["python.execute"], (event) => {
        checkedSource = event.source.code;
      }) });
      const execution2 = own(python2.create(options.python ?? {}, bus));
      own({ dispose: bus.subscribe(["playback.changed", "selection.changed"], () => {
        const { position } = playing.state;
        const result = execution2.state.result;
        const error = position?.atEnd && result.status === "ready" ? result.value?.error : null;
        const diagnostics = [];
        const lines = checkedSource.split("\n");
        if (error?.line != null && Number.isInteger(error.line) && error.line >= 1 && error.line <= lines.length) {
          const from = lines.slice(0, error.line - 1).reduce((offset, line2) => offset + line2.length + 1, 0);
          diagnostics.push({ from, to: from + lines[error.line - 1].length, severity: "error", message: error.message });
        }
        const selected = focus.state.current;
        const variablePoint = selected?.kind === "runtime-variable" && selected.run === playing.state.trace && position !== null ? variableTimeline(selected).find((point) => point.traceIndex === position.traceIndex) : void 0;
        const line = variablePoint?.line ?? position?.state.line ?? null;
        const highlight = !diagnostics.length && line !== null ? { line, kind: variablePoint?.line != null ? "change" : "execution" } : null;
        bus.emit({ type: "editor.render", source: editor.state.source, highlight }, "playground");
        bus.emit({ type: "editor.diagnostics", source: checkedSource, diagnostics }, "playground");
      }) });
      observe("python", () => ({ ...execution2.state }), ["python.changed"]);
      observe("playback", () => ({ ...playing.state }), ["playback.changed"]);
      observe("selection", () => focus.state, ["selection.changed"]);
      return { python: execution2.state, playback: playing.state, terminal: output, debugger: debugging, selection: focus.state };
    }
  };
}

// playgrounds/cow-grass/cow-grass.generated.tsx
import { playbackHost as playbackHost2 } from "../session.js";
import { SessionPage } from "../session.js";

// playgrounds/shared/python/session.ts
import { createElement } from "../libs/react.js";
import { mockAiPort } from "../session.js";
import { Widget } from "../pico.js";
import { feature, playbackHost, provided, selectionHost } from "../session.js";
import { stage } from "../session.js";
import { source } from "../session.js";
import { draftViews } from "../session.js";
import { hintViews } from "../session.js";
import { execution } from "../session.js";
import { navigate } from "../session.js";
import { liveVariables } from "../session.js";
import { traceQueries } from "../session.js";
import { annotations, registerAnchorResolver } from "../session.js";
import { annotationViews, debuggerAnchors, terminalAnchors } from "../session.js";
import { tour } from "../session.js";
import { sessionContext } from "../session.js";
import { playground } from "../session.js";
import { playgroundSnapshot } from "../session.js";
import { sessionEvidence } from "../session.js";
import { ai } from "../session.js";
import { aiViews } from "../session.js";
import { script } from "../session.js";
import { scriptRail } from "../session.js";
import { aiScript } from "../session.js";
import { worldPanel } from "../session.js";
var pythonHost = provided("python.parts");
var OUTPUT_PANEL = "output";
var DEBUG_PANEL = "debug";
var PYTHON_RAN = { on: "python.changed", until: (event) => event.result.status !== "pending" };
var pythonViews = feature("python.views", {
  requires: [pythonHost, playbackHost, annotations, playground],
  create: ({ get, own }) => {
    const parts = get(pythonHost);
    const playing = get(playbackHost);
    const run2 = () => playing.trace;
    for (const resolver of [debuggerAnchors(parts.debugger, run2), terminalAnchors(parts.terminal, run2)]) {
      own({ dispose: registerAnchorResolver(get(playground), resolver) });
    }
  },
  queries: [{ id: "python.result", run: ({ get }) => resultOf(get(pythonHost)?.python ?? null) }],
  views: [
    { slot: "panel", key: OUTPUT_PANEL, icon: "output", title: "\u8F93\u51FA", render: ({ get }) => createElement(Widget, { widget: get(pythonHost).terminal }) },
    { slot: "panel", key: DEBUG_PANEL, icon: "debug", title: "\u8C03\u8BD5", render: ({ get }) => createElement(Widget, { widget: get(pythonHost).debugger }) }
  ]
});
function resultOf(python4) {
  const result = python4?.result ?? null;
  if (result === null || result.status === "pending") return { status: "pending" };
  if (result.status === "failed") return { status: "failed", error: String(result.error) };
  if (result.value === null) return { status: "none" };
  const { trace, returncode, error, waiting } = result.value;
  const end = trace.at(trace.steps.length + 1);
  const tail = (text) => (text ?? "").slice(-2e3);
  return {
    status: "ready",
    returncode,
    steps: trace.steps.length,
    error: error === null ? null : { message: error.message, line: error.line },
    waiting: waiting?.prompt ?? null,
    stdout: tail(end.stdout),
    stderr: tail(end.stderr)
  };
}
function pythonSession(options) {
  const features = [
    stage,
    source,
    draftViews,
    hintViews,
    execution.with({ run: { type: "python.run" }, settle: PYTHON_RAN }),
    navigate.with({ debuggerPanel: DEBUG_PANEL }),
    liveVariables,
    traceQueries,
    annotations,
    annotationViews,
    tour,
    sessionContext,
    sessionEvidence,
    playground,
    playgroundSnapshot,
    ...options.ai === void 0 ? [] : [ai.with(options.ai), aiViews],
    script.with(options.script ?? {}),
    scriptRail.with({ library: options.scripts ?? [] }),
    ...options.ai === void 0 ? [] : [aiScript.with({ narrate: false })],
    worldPanel(options.world),
    pythonViews,
    ...options.domain ?? []
  ];
  return Object.freeze({
    features: Object.freeze(features),
    provide: (view) => [
      playbackHost.with(view.parts.playback),
      selectionHost.with(view.parts.selection),
      pythonHost.with({ python: view.parts.python, terminal: view.parts.terminal, debugger: view.parts.debugger }),
      ...options.provide?.(view) ?? []
    ],
    editorExtensions: pythonEditorOptions.extensions
  });
}
function courseAi(answers) {
  return {
    port: mockAiPort((request) => request.kind === "explain" ? { title: "\u8FD9\u4E00\u6B65\u5728\u505A\u4EC0\u4E48", text: answers.explain, primary: { action: "selection.locate", label: "\u5B9A\u4F4D\u5230\u6267\u884C" } } : { title: "\u53EF\u4EE5\u4ECE\u8FD9\u91CC\u60F3\u8D77", text: answers.question }, { delayMs: 300 })
  };
}

// playgrounds/cow-grass/cow-grass.script.json
var cow_grass_script_default = {
  id: "cow-grass",
  title: "\u4ECE\u6BCF\u65E5\u53D8\u5316\u5199\u51FA\u7267\u573A\u6A21\u62DF",
  from: "",
  mode: "instruction",
  auto: true,
  steps: [
    {
      title: "\u5B9A\u4E49\u72B6\u6001\u548C\u53C2\u6570",
      concepts: ["value"],
      stage: {
        panels: [
          "viz"
        ]
      },
      say: [
        {
          say: "grass \u662F\u53D8\u5316\u7684\u72B6\u6001\uFF1Bgrowth\u3001cows\u3001eat \u51B3\u5B9A\u53D8\u5316\u901F\u5EA6\uFF1Bday \u8BB0\u5F55\u65F6\u95F4\u3002",
          write: "grass = 100\ngrowth = 12\ncows = 4\neat = 5\nday = 1\n"
        }
      ]
    },
    {
      title: "\u5199\u51FA\u4E00\u5929\u7684\u751F\u957F",
      concepts: ["value"],
      say: [
        {
          say: "\u4E00\u5929\u5148\u957F\u8349\u3002\u8D4B\u503C\u8BFB\u53D6\u65E7 grass\uFF0C\u52A0\u4E0A growth\uFF0C\u518D\u5199\u56DE\u65B0\u503C\u3002",
          write: "grass = 100\ngrowth = 12\ncows = 4\neat = 5\nday = 1\n\ngrass = grass + growth\n"
        }
      ]
    },
    {
      title: "\u6263\u9664\u6574\u7FA4\u725B\u7684\u91C7\u98DF",
      concepts: ["value"],
      say: [
        {
          say: "\u6574\u7FA4\u603B\u98DF\u91CF\u662F cows * eat\u3002\u4E58\u6CD5\u5148\u7B97\uFF0C\u518D\u4ECE\u5F53\u524D\u8349\u91CF\u6263\u9664\uFF0C\u6700\u540E\u65E5\u671F\u524D\u8FDB\u3002",
          write: "grass = 100\ngrowth = 12\ncows = 4\neat = 5\nday = 1\n\ngrass = grass + growth\ngrass = grass - cows * eat\nday = day + 1\n"
        }
      ]
    },
    {
      title: "\u8FD0\u884C\u4E00\u5929",
      concepts: ["value"],
      stage: {
        panels: [
          "viz",
          "debug"
        ],
        focus: "viz"
      },
      do: [
        {
          action: "code.run"
        }
      ],
      say: "\u8349\u5148\u4ECE 100 \u957F\u5230 112\uFF0C\u518D\u88AB\u5403\u5230 92\uFF0Cday \u53D8\u6210 2\u3002\u4E09\u4E2A\u753B\u9762\u53D8\u5316\u5BF9\u5E94\u4E09\u6761\u5DF2\u6267\u884C\u8BED\u53E5\u3002"
    },
    {
      title: "Debugger \u5206\u5F00\u770B\u4E09\u4E2A\u65F6\u523B",
      concepts: ["debug", "value"],
      stage: {
        panels: [
          "viz",
          "debug"
        ],
        focus: "debug"
      },
      do: [
        {
          action: "code.locate",
          args: {
            line: 7,
            occurrence: 1
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "mark",
            at: {
              variable: "grass"
            }
          }
        }
      ],
      say: "\u957F\u8349\u540E grass \u662F 112\uFF1B\u91C7\u98DF\u540E\u662F 92\uFF1Bday \u8D4B\u503C\u53EA\u6539\u65E5\u671F\u3002Debugger \u628A\u201C\u6BCF\u5929\u51C0\u5C11 8\u201D\u5C55\u5F00\u6210\u4E24\u4E2A\u65B9\u5411\u76F8\u53CD\u7684\u8FC7\u7A0B\u3002"
    },
    {
      title: "\u7528\u5FAA\u73AF\u8868\u8FBE\u7A33\u5B9A\u89C4\u5219",
      concepts: ["loop"],
      say: [
        {
          say: "\u6BCF\u5929\u505A\u540C\u6837\u4E09\u4EF6\u4E8B\uFF0C\u8BA9 for \u4EA7\u751F\u56DB\u5929\u3002\u5FAA\u73AF\u4F53\u4EE3\u8868\u7A33\u5B9A\u7684\u6BCF\u65E5\u89C4\u5219\u3002",
          write: "grass = 100\ngrowth = 12\ncows = 4\neat = 5\nday = 1\n\nfor _ in range(4):\n    grass = grass + growth\n    grass = grass - cows * eat\n    day = day + 1\n"
        }
      ]
    },
    {
      title: "\u770B\u540C\u4E00\u884C\u53CD\u590D\u6267\u884C",
      concepts: ["debug", "loop"],
      stage: {
        panels: [
          "viz",
          "debug"
        ],
        focus: "debug"
      },
      do: [
        {
          action: "code.run"
        },
        {
          action: "code.locate",
          args: {
            line: 8,
            occurrence: 3
          }
        }
      ],
      say: "\u73B0\u5728\u505C\u5728\u957F\u8349\u8BED\u53E5\u7B2C 3 \u6B21\u6267\u884C\u3002\u540C\u4E00\u884C\u670D\u52A1\u4E0D\u540C\u65E5\u671F\uFF0Cgrass \u7684\u5F53\u524D\u503C\u8BA9\u6BCF\u6B21\u7ED3\u679C\u4E0D\u540C\uFF1B\u5FAA\u73AF\u628A\u91CD\u590D\u7ED3\u6784\u4E0E\u53D8\u5316\u6570\u636E\u5206\u5F00\u3002"
    },
    {
      title: "\u63D0\u70BC\u6BCF\u65E5\u51C0\u53D8\u5316",
      concepts: ["value", "loop"],
      say: "\u6BCF\u5929\u51C0\u53D8\u5316\u662F growth - cows * eat\uFF0C\u5373 12 - 20 = -8\u3002\u56DB\u5929\u540E\u662F 68\u3002\u516C\u5F0F\u6982\u62EC\u8D8B\u52BF\uFF0C\u9010\u6B65\u7A0B\u5E8F\u4FDD\u7559\u5148\u957F\u540E\u5403\u7684\u8FC7\u7A0B\u3002"
    },
    {
      title: "\u53C2\u6570\u51B3\u5B9A\u957F\u671F\u884C\u4E3A",
      concepts: ["value", "loop"],
      say: "growth \u5927\u4E8E\u603B\u98DF\u91CF\u65F6\u8349\u589E\u52A0\uFF0C\u76F8\u7B49\u65F6\u7A33\u5B9A\uFF0C\u66F4\u5C0F\u65F6\u4E0B\u964D\u3002\u7A0B\u5E8F\u9AA8\u67B6\u4E0D\u53D8\uFF0C\u53C2\u6570\u6539\u53D8\u8F68\u8FF9\uFF1B\u5EFA\u6A21\u5C31\u662F\u5206\u6E05\u72B6\u6001\u3001\u89C4\u5219\u3001\u65F6\u95F4\u548C\u53C2\u6570\u3002"
    }
  ]
};

// playgrounds/cow-grass/cow-grass.generated.tsx
import { jsx, jsxs } from "../libs/react.js";
var layoutOptions = { open: ["viz", "debug"], ratio: 0.4 };
var INITIAL_SOURCE = `grass = 100        # \u5F53\u524D\u8349\u91CF
growth = 12        # \u6BCF\u5929\u65B0\u957F\u51FA\u7684\u8349
cows = 4           # \u725B\u7684\u6570\u91CF
eat = 5            # \u6BCF\u5934\u725B\u6BCF\u5929\u5403\u591A\u5C11\u8349
day = 1            # \u5F53\u524D\u662F\u7B2C\u51E0\u5929

# \u7B2C 1 \u5929
grass = grass + growth
grass = grass - cows * eat
day = day + 1

# \u7B2C 2 \u5929
grass = grass + growth
grass = grass - cows * eat
day = day + 1

# \u7B2C 3 \u5929
grass = grass + growth
grass = grass - cows * eat
day = day + 1

# \u7B2C 4 \u5929
grass = grass + growth
grass = grass - cows * eat
day = day + 1`;
var HOLD = { grow: 1900, eat: 2400, rest: 800 };
var HOLD_IDLE = 260;
var cowGrass = stateful("cow-grass", (source2) => ({ source: source2 }), [
  on("editor.changed", edit, []),
  on("python.run", run, ["python.execute"])
]);
function edit(state, event) {
  state.source = event.source;
}
function run(state, _event, { emit }) {
  emit({ type: "python.execute", source: new Source(state.source), options: {
    trace: { events: ["stmt"], observe: { globals: true, locals: false } }
  } });
}
function create(bus) {
  const course = cowGrass.create(INITIAL_SOURCE, bus);
  const execution2 = python3.create({}, bus);
  const player = playback2.create({}, bus);
  bus.emit({ type: "python.run" });
  return () => {
    player.dispose();
    execution2.dispose();
    course.dispose();
  };
}
var examples = {
  starter: { create, events: [] },
  printTotals: { create, events: [
    { type: "editor.changed", source: INITIAL_SOURCE + "\nprint(grass, day)\n" },
    { type: "python.run" }
  ] }
};
var FIELD_W = 17;
var MIN_ROWS = 3;
var MAX_ROWS = 22;
var MAX_COWS = 8;
var CAP_H = 0.24;
var MEADOW = 46;
var TUFT_H = 0.62;
var BLADES = 4;
var EDGE = 0.3;
var CAPACITY = FIELD_W * MAX_ROWS;
var COW_TURN = Math.PI;
function cowColumns(count) {
  const slots = Math.min(Math.max(Math.floor(count), 0), MAX_COWS);
  if (slots <= 0) return [];
  if (slots === 1) return [Math.round(FIELD_W / 2 - 0.5)];
  const margin = 1.5;
  const span = FIELD_W - 1 - margin * 2;
  return Array.from({ length: slots }, (_, index) => Math.round(margin + span * index / (slots - 1)));
}
function herdHash(value) {
  let state = Math.imul(value + 2654435769, 2246822507);
  state ^= state >>> 13;
  state = Math.imul(state, 3266489909);
  state ^= state >>> 16;
  return state >>> 0;
}
function herdColumns(count, day) {
  const columns = cowColumns(count);
  if (columns.length <= 1) return columns;
  const spacing = Math.min(...columns.slice(1).map((column, index) => column - columns[index]));
  const reach = Math.min(0.5, spacing / 6);
  const shifted = columns.map((column, index) => column + (herdHash(day * 31 + index) % 2001 / 1e3 - 1) * reach);
  const shuffled = [...shifted];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = herdHash(day * 977 + index * 7) % (index + 1);
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}
function cowTrait(index) {
  const turns = [-0.55, 0.34, -0.22, 0.52, -0.4, 0.18, 0.6, -0.12];
  const gaps = [-0.3, 0.55, 0.1, -0.5, 0.35, -0.15, 0.6, 0.2];
  const phases = [0.15, 0.62, 0.38, 0.85, 0.47, 0.28, 0.72, 0.05];
  const slot = index % MAX_COWS;
  return { turn: turns[slot], gap: gaps[slot], phase: phases[slot] };
}
var COW_LENGTH = 2.5;
var BOOT_NUMBERS = { grass: 100, cows: 4, day: 1 };
var BOOT = { before: BOOT_NUMBERS, after: BOOT_NUMBERS, phase: "idle", step: 0, hold: HOLD_IDLE, rows: MIN_ROWS, notice: null };
function numbersOf(state) {
  const globals = state?.globals;
  if (globals === void 0) return null;
  const read = (name) => {
    const value = globals[name];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };
  const grass = read("grass");
  const day = read("day");
  if (grass === null || day === null) return null;
  return { grass, day, cows: read("cows") ?? 0 };
}
function occasionBetween(before, after) {
  if (before === null || after === null) return null;
  if (after.grass > before.grass) return "grow";
  if (after.grass < before.grass) return "eat";
  if (after.day > before.day) return "rest";
  return null;
}
function occasionAt(trace, index) {
  if (trace === null || index < 1 || index > trace.steps.length + 1) return null;
  return occasionBetween(numbersOf(trace.at(index - 1)), numbersOf(trace.at(index)));
}
function holdMsOf(trace, index) {
  const occasion = occasionAt(trace, index);
  return occasion === null ? HOLD_IDLE : HOLD[occasion];
}
function worldOf(trace, position) {
  if (trace === null) return BOOT;
  const index = position?.traceIndex ?? trace.steps.length + 1;
  const hold = holdMsOf(trace, index);
  const after = numbersOf(position?.state ?? trace.finalState);
  if (after === null) return { ...BOOT, step: index, hold, rows: rowsFor(maxGrassOf(trace)), notice: null };
  const before = numbersOf(position?.previous ?? trace.at(Math.max(0, index - 1))) ?? after;
  const occasion = occasionAt(trace, index);
  const rows = rowsFor(maxGrassOf(trace));
  const notice = noticeOf(before, after);
  return { before, after, phase: occasion ?? "idle", step: index, hold, rows, notice };
}
function raggedOf(columns) {
  const strength = 1.25 * Math.min(1, 4 / Math.max(1, columns.length));
  return Array.from({ length: FIELD_W }, (_, x) => {
    const wave = 0.62 * Math.sin(x * 0.72 + 0.6) + 0.22 * Math.sin(x * 1.9 + 2.1);
    const dip = columns.reduce((sum, column) => sum - strength * Math.exp(-((x - column) ** 2) / 1.5), 0);
    return wave + dip;
  });
}
function borderRow(x, grass, rows, ragged) {
  const span = clamp01(Math.min(Math.max(grass, 0), CAPACITY - grass) / 22);
  const limit = grass / FIELD_W + (ragged[x] ?? 0) * span;
  return Math.min(rows, Math.max(0, limit));
}
function tileGrass(x, row, grass, rows, ragged) {
  const offset = borderRow(x, grass, rows, ragged) - (row + 0.5);
  return Math.min(1, Math.max(0, offset / EDGE + 0.5));
}
function rowsFor(maxGrass) {
  return Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.ceil(Math.max(0, maxGrass) / FIELD_W)));
}
var tallest = /* @__PURE__ */ new WeakMap();
function maxGrassOf(trace) {
  if (trace === null) return 0;
  const cached = tallest.get(trace);
  if (cached !== void 0) return cached;
  const end = trace.steps.length + 1;
  const step = end > 600 ? Math.ceil(end / 600) : 1;
  let max = 0;
  for (let index = 0; index <= end; index += step) {
    const values = numbersOf(trace.at(index));
    if (values !== null && values.grass > max) max = values.grass;
  }
  const final = numbersOf(trace.at(end));
  if (final !== null) max = Math.max(max, final.grass);
  tallest.set(trace, max);
  return max;
}
function noticeOf(before, after) {
  const cows = after?.cows ?? before?.cows ?? 0;
  if (cows > MAX_COWS) return "crowded";
  if ((after?.grass ?? before?.grass ?? 0) > CAPACITY) return "overflow";
  if (after !== null && after.grass <= 0) return "exhausted";
  return null;
}
var NOTICE_TEXT = {
  exhausted: "\u8349\u88AB\u5403\u5B8C\u4E86",
  crowded: `\u753B\u9762\u91CC\u6700\u591A\u663E\u793A ${MAX_COWS} \u5934\u725B\uFF0C\u628A cows \u8C03\u5C0F\u4E00\u4E9B`,
  overflow: `\u7267\u573A\u6700\u591A\u753B\u4E0B ${CAPACITY} \u8349\u91CF\uFF0C\u628A grass / growth \u8C03\u5C0F\u4E00\u4E9B`
};
function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}
function smoothstep(t) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}
function hash(x, z, salt = 0) {
  const n = Math.sin(x * 12.9898 + z * 78.233 + salt * 37.719) * 43758.5453;
  return n - Math.floor(n);
}
var DAYLIGHT = {
  background: 13100279,
  sun: 16774365,
  sunIntensity: 1.7,
  sunHeight: 18,
  ambient: 14674679,
  ambientIntensity: 1.45
};
var Channel = class {
  value;
  #from;
  #to;
  #start = 0;
  #duration = 0;
  #window;
  constructor(value, window2) {
    this.value = value;
    this.#from = value;
    this.#to = value;
    this.#window = window2;
  }
  set(to, now, duration) {
    if (duration <= 0) {
      this.#from = to;
      this.#to = to;
      this.value = to;
      this.#duration = 0;
      return;
    }
    if (to === this.#to) return;
    this.#from = this.value;
    this.#to = to;
    this.#start = now;
    this.#duration = duration;
  }
  at(now) {
    if (this.#duration <= 0) return this.value;
    const begin = this.#start + this.#window[0] * this.#duration;
    const end = this.#start + this.#window[1] * this.#duration;
    const t = end <= begin ? 1 : (now - begin) / (end - begin);
    this.value = this.#from + (this.#to - this.#from) * smoothstep(t);
    return this.value;
  }
};
function makeTexture(paint, seed, smooth = false) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx === null) throw new Error("2D canvas unavailable");
  let state = seed >>> 0;
  const rand = () => {
    state = state * 1664525 + 1013904223 >>> 0;
    return state / 4294967296;
  };
  paint(Object.assign(ctx, { __rand: rand }), size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = smooth ? THREE.LinearFilter : THREE.NearestFilter;
  return texture;
}
function randOf(ctx) {
  return ctx.__rand ?? (() => 0.5);
}
function turfTexture() {
  return makeTexture((ctx, size) => {
    const rand = randOf(ctx);
    ctx.fillStyle = "#b4b4b4";
    ctx.fillRect(0, 0, size, size);
    for (const [color, count] of [["#9c9c9c", 90], ["#c6c6c6", 70], ["#d2d2d2", 40], ["#8b8b8b", 40]]) {
      ctx.fillStyle = color;
      for (let i = 0; i < count; i += 1) {
        ctx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 1 + Math.floor(rand() * 2), 1 + Math.floor(rand() * 2));
      }
    }
  }, 7);
}
function meadowTexture() {
  const texture = makeTexture((ctx, size) => {
    const rand = randOf(ctx);
    ctx.fillStyle = "#bdbdbd";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 120; i += 1) {
      const tone = 150 + Math.floor(rand() * 70);
      ctx.fillStyle = `rgb(${tone}, ${tone}, ${tone})`;
      ctx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 1 + Math.floor(rand() * 2), 1 + Math.floor(rand() * 2));
    }
    ctx.strokeStyle = "rgba(90, 90, 90, 0.55)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.75, 0.75, size - 1.5, size - 1.5);
  }, 41);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
function bladeGeometry(width) {
  const half = width / 2;
  const positions = new Float32Array([
    -half,
    0,
    0,
    half,
    0,
    0,
    half,
    1,
    0,
    -half,
    0,
    0,
    half,
    1,
    0,
    -half,
    1,
    0,
    half,
    0,
    0,
    -half,
    0,
    0,
    -half,
    1,
    0,
    half,
    0,
    0,
    -half,
    1,
    0,
    half,
    1,
    0
  ]);
  const uvs = new Float32Array([
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    0,
    1,
    1,
    0,
    1
  ]);
  const normals = new Float32Array(positions.length);
  for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  return geometry;
}
function tuftTexture() {
  const texture = makeTexture((ctx, size) => {
    const rand = randOf(ctx);
    ctx.clearRect(0, 0, size, size);
    const tones = ["#4f9b2f", "#63b83c", "#7ed24e"];
    for (let blade = 0; blade < 11; blade += 1) {
      const root = 2 + Math.floor(rand() * (size - 4));
      const height = Math.floor(size * (0.45 + rand() * 0.55));
      const lean = Math.round((rand() - 0.5) * 8);
      const wide = 3 + Math.floor(rand() * 2);
      const tone = tones[Math.floor(rand() * tones.length)];
      for (let row = 0; row < height; row += 2) {
        const t = row / height;
        const offset = Math.round(lean * t * t);
        const shrink = Math.floor(t * (wide - 1) * 0.5);
        ctx.fillStyle = tone;
        ctx.fillRect(Math.max(0, root - Math.floor(wide / 2) + offset + shrink), size - 1 - row - 1, Math.max(1, wide - shrink * 2), 2);
      }
    }
  }, 33, false);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
var template = null;
function loadCow() {
  if (template !== null) return template;
  template = (async () => {
    const model = asset("animal/cow/3d");
    if (model.format !== "glb") throw new Error("expected a glb asset");
    const gltf = await new GLTFLoader().loadAsync(new URL(model.path, import.meta.url).href);
    const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
    return { scene: gltf.scene, clips: gltf.animations, names: model.animations, length: Math.max(size.x, size.z, 1e-3) };
  })();
  return template;
}
var Pasture = class {
  #renderer;
  #scene = new THREE.Scene();
  #camera;
  #controls;
  #turf;
  #tufts;
  #sun;
  #ambient;
  #herd = new THREE.Group();
  #board;
  /** 越界/吃光提示；出现动画交给 CSS，文字由 React 按 notice 渲染。 */
  #overlay;
  #cows = [];
  /** 显示用草量（浮点）：一格格铺草，所以动画就是它平滑地走。 */
  #grass = new Channel(BOOT.before.grass, [0, 1]);
  #opacity = new Channel(0, [0.04, 0.3]);
  #size = new THREE.Vector2(1, 1);
  /** 只有已执行语句减少草量时，才推进牛的位置、摆头和骨骼动画。 */
  #moving = false;
  /** 显示中的草量已经归零：牛吃完最后一口，开始离场。 */
  #exhausted = false;
  /** 当前牧场行数（由这一版程序的草量峰值决定）。 */
  #rows = MIN_ROWS;
  #columns = herdColumns(BOOT.before.cows, BOOT.before.day);
  #ragged = raggedOf(this.#columns);
  /** 当前排布属于第几天：新一天的排布等到下一次吃草才启用。 */
  #day = BOOT.before.day;
  #notice = null;
  /** 这一步跑完牧场就没有草了：牛会在吃完最后一口后离场。 */
  #leaving = false;
  /** 草被吃光后地皮变枯：0 = 正常草皮，1 = 晒干的地。 */
  #dry = new Channel(0, [0, 1]);
  #last = 0;
  #transitionStart = 0;
  #transitionSpan = 1;
  #wanted = BOOT.before.cows;
  #drawn = Number.NaN;
  #drawnDry = Number.NaN;
  #raf = 0;
  #dead = false;
  constructor(host, board, overlay) {
    this.#board = board;
    this.#overlay = overlay;
    this.#renderer = new THREE.WebGLRenderer({ antialias: true });
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.#renderer.shadowMap.enabled = true;
    this.#renderer.shadowMap.type = THREE.PCFShadowMap;
    host.append(this.#renderer.domElement);
    this.#camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.5, 240);
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;
    this.#controls.dampingFactor = 0.08;
    this.#controls.enablePan = true;
    this.#controls.screenSpacePanning = false;
    this.#controls.minPolarAngle = THREE.MathUtils.degToRad(16);
    this.#controls.maxPolarAngle = THREE.MathUtils.degToRad(74);
    this.#camera.position.set(0, 11.5, 17.7);
    const anisotropy = this.#renderer.capabilities.getMaxAnisotropy();
    const turf = turfTexture();
    turf.anisotropy = anisotropy;
    this.#turf = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, CAP_H, 1),
      new THREE.MeshStandardMaterial({ map: turf, roughness: 0.95, metalness: 0 }),
      FIELD_W * MAX_ROWS
    );
    this.#turf.receiveShadow = true;
    this.#turf.castShadow = true;
    this.#turf.frustumCulled = false;
    this.#turf.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.#scene.add(this.#turf);
    const meadow = meadowTexture();
    meadow.anisotropy = anisotropy;
    meadow.repeat.set(MEADOW, MEADOW);
    const meadowMesh = new THREE.Mesh(
      new THREE.BoxGeometry(MEADOW, 1.6, MEADOW),
      new THREE.MeshStandardMaterial({ map: meadow, color: 7122246, roughness: 1, metalness: 0 })
    );
    meadowMesh.position.y = -0.02 - 0.8;
    meadowMesh.receiveShadow = true;
    this.#scene.add(meadowMesh);
    const tuft = tuftTexture();
    tuft.anisotropy = anisotropy;
    const tuftGeometry = bladeGeometry(1.02);
    this.#tufts = new THREE.InstancedMesh(
      tuftGeometry,
      new THREE.MeshStandardMaterial({ map: tuft, alphaTest: 0.28, side: THREE.FrontSide, roughness: 0.9, metalness: 0 }),
      FIELD_W * MAX_ROWS * BLADES
    );
    this.#tufts.castShadow = false;
    this.#tufts.frustumCulled = false;
    this.#tufts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.#scene.add(this.#tufts);
    this.#scene.background = new THREE.Color(DAYLIGHT.background);
    this.#sun = new THREE.DirectionalLight(DAYLIGHT.sun, DAYLIGHT.sunIntensity);
    this.#sun.position.set(8, DAYLIGHT.sunHeight, 6);
    this.#sun.castShadow = true;
    this.#sun.shadow.mapSize.set(1024, 1024);
    this.#sun.shadow.camera.left = -12;
    this.#sun.shadow.camera.right = 12;
    this.#sun.shadow.camera.top = 9;
    this.#sun.shadow.camera.bottom = -9;
    this.#sun.shadow.camera.near = 1;
    this.#sun.shadow.camera.far = 64;
    this.#sun.shadow.bias = -15e-4;
    this.#sun.shadow.normalBias = 0.02;
    this.#scene.add(this.#sun);
    this.#ambient = new THREE.HemisphereLight(DAYLIGHT.ambient, 4609087, DAYLIGHT.ambientIntensity);
    this.#scene.add(this.#ambient);
    this.#scene.add(this.#herd);
    void this.#spawnCows();
    this.resize();
    this.#raf = requestAnimationFrame(this.#tick);
  }
  async #spawnCows() {
    const loaded = await loadCow();
    if (this.#dead) return;
    const base = COW_LENGTH / loaded.length;
    const clip = (name) => loaded.clips.find((entry) => entry.name === name);
    for (let slot = 0; slot < MAX_COWS; slot += 1) {
      const root = new THREE.Group();
      const model = cloneModel(loaded.scene);
      const materials = [];
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const material = child.material.clone();
        materials.push(material);
        child.material = material;
        child.castShadow = true;
      });
      model.position.y = -new THREE.Box3().setFromObject(model).min.y;
      root.add(model);
      root.visible = false;
      this.#herd.add(root);
      const mixer = new THREE.AnimationMixer(model);
      mixer.setTime(cowTrait(this.#cows.length).phase * 2.7);
      const build = (name) => {
        const found = clip(name);
        return found === void 0 ? null : mixer.clipAction(found);
      };
      this.#cows.push({
        root,
        mixer,
        actions: { idle: build(loaded.names.idle), walk: build(loaded.names.walk), eat: build(loaded.names.eat) },
        materials,
        base,
        clip: null
      });
    }
    this.#poseHerd(this.#grass.value, this.#opacity.value, 1, 0, true);
  }
  setWorld(world, instant = false) {
    const now = performance.now();
    const span = instant ? 0 : world.hold;
    this.#moving = !instant && world.after.grass < world.before.grass;
    this.#leaving = this.#moving && world.after.grass <= 0 && world.before.grass > 0;
    this.#wanted = Math.max(0, Math.min(world.after.cows, MAX_COWS));
    if (world.rows !== this.#rows) {
      this.#rows = world.rows;
      this.#writeField(this.#grass.value, this.#dry.value);
      this.resize();
    }
    if (this.#wanted !== this.#columns.length || (instant || this.#moving) && world.after.day !== this.#day) {
      this.#day = world.after.day;
      this.#columns = herdColumns(this.#wanted, this.#day);
      this.#ragged = raggedOf(this.#columns);
      this.#drawn = Number.NaN;
    }
    this.#notice = world.notice;
    this.#transitionStart = now;
    this.#transitionSpan = Math.max(1, span);
    this.#exhausted = false;
    this.#showNotice(world.notice === "exhausted" ? (instant ? world.after.grass : this.#grass.value) <= 0.15 : world.notice !== null);
    this.#grass.set(world.after.grass, now, span);
    const grazing = world.after.grass > 0 || !instant && world.before.grass > 0;
    if (instant || this.#moving) this.#opacity.set(grazing ? 1 : 0, now, span);
    else this.#opacity.set(this.#opacity.at(now), now, 0);
    this.#dry.set(world.after.grass <= 0 ? 1 : 0, now, instant ? 0 : Math.max(span, 1100));
    if (instant) this.#poseHerd(world.after.grass, this.#opacity.value, 1, 0, true);
  }
  resize() {
    const width = Math.max(1, this.#board.clientWidth);
    const height = Math.max(1, this.#board.clientHeight);
    this.#size.set(width, height);
    this.#renderer.setSize(width, height, false);
    this.#camera.aspect = width / height;
    this.#fit();
  }
  dispose() {
    this.#dead = true;
    cancelAnimationFrame(this.#raf);
    this.#controls.dispose();
    this.#turf.geometry.dispose();
    this.#tufts.geometry.dispose();
    this.#renderer.dispose();
    this.#renderer.domElement.remove();
  }
  #showNotice(shown) {
    if (this.#overlay !== null) this.#overlay.dataset.shown = shown ? "true" : "false";
  }
  /** 让牧场铺满卡片：迭代求相机距离，按包围盒八个角点的投影收敛。 */
  #fit() {
    const target = new THREE.Vector3(0, 0.9, 0);
    const halfW = FIELD_W / 2;
    const halfD = this.#rows / 2;
    const corners = [
      [-halfW, -0.4, -halfD],
      [halfW, -0.4, -halfD],
      [-halfW, -0.4, halfD],
      [halfW, -0.4, halfD],
      [-halfW, TUFT_H + 1.15, -halfD],
      [halfW, TUFT_H + 1.15, -halfD],
      [-halfW, TUFT_H + 1.15, halfD],
      [halfW, TUFT_H + 1.15, halfD]
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const direction = new THREE.Vector3().subVectors(this.#camera.position, target).normalize();
    let distance = 26;
    for (let round = 0; round < 5; round += 1) {
      this.#camera.position.copy(target).addScaledVector(direction, distance);
      this.#camera.lookAt(target);
      this.#camera.updateMatrixWorld();
      this.#camera.updateProjectionMatrix();
      let worst = 0;
      for (const corner of corners) {
        const point = corner.clone().project(this.#camera);
        worst = Math.max(worst, Math.abs(point.x), Math.abs(point.y));
      }
      if (worst <= 0) break;
      distance *= worst / 0.97;
    }
    this.#camera.position.copy(target).addScaledVector(direction, distance);
    this.#controls.target.copy(target);
    this.#controls.minDistance = distance * 0.7;
    this.#controls.maxDistance = distance * 1.25;
    this.#controls.update();
  }
  /** 一行一行地铺草：地表块保留（被吃过变黄），草簇按剩余草量长出来。 */
  #writeField(grass, dry) {
    const tuftMatrix = new THREE.Matrix4();
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const axis = new THREE.Vector3(0, 1, 0);
    const capColor = new THREE.Color();
    const bladeColor = new THREE.Color();
    const grassTone = new THREE.Color(7122246);
    const eatenTone = new THREE.Color(11977834);
    const bareTone = new THREE.Color(11568466);
    const bladeFresh = new THREE.Color(16777215);
    const bladeDry = new THREE.Color(14272905);
    let index = 0;
    for (let x = 0; x < FIELD_W; x += 1) {
      for (let row = 0; row < this.#rows; row += 1) {
        const tile = row * FIELD_W + x;
        const share = tileGrass(x, row, grass, this.#rows, this.#ragged);
        capColor.copy(grassTone).lerp(eatenTone, 1 - share);
        const withered = dry <= 0 ? 0 : clamp01((dry - (this.#rows - 1 - row) * 0.05) / 0.4);
        capColor.lerp(bareTone, withered);
        this.#turf.setColorAt(tile, capColor);
        const grown = smoothstep(share);
        const full = TUFT_H * (0.5 + 0.75 * hash(x, row, 1));
        const height = full * grown;
        bladeColor.copy(bladeFresh).lerp(bladeDry, 1 - grown);
        const px = x - FIELD_W / 2 + 0.5;
        const pz = row - this.#rows / 2 + 0.5;
        matrix.makeScale(0.97, 1, 0.97);
        matrix.setPosition(px, -CAP_H / 2, pz);
        this.#turf.setMatrixAt(tile, matrix);
        for (let blade = 0; blade < BLADES; blade += 1) {
          const jitterX = (hash(x, row, blade + 11) - 0.5) * 0.3;
          const jitterZ = (hash(x, row, blade + 23) - 0.5) * 0.3;
          position.set(px + jitterX, 0, pz + jitterZ);
          const spare = grown < 0.5 ? 0.5 : 0;
          scale.set((0.9 + 0.3 * hash(x, row, blade + 31)) * (1 - spare), height, 1);
          quaternion.setFromAxisAngle(axis, Math.PI / BLADES * blade + hash(x, row, blade + 41) * 0.5);
          tuftMatrix.compose(position, quaternion, scale);
          this.#tufts.setMatrixAt(index, tuftMatrix);
          this.#tufts.setColorAt(index, bladeColor);
          index += 1;
        }
      }
    }
    this.#turf.count = this.#rows * FIELD_W;
    this.#tufts.count = index;
    this.#turf.instanceMatrix.needsUpdate = true;
    this.#tufts.instanceMatrix.needsUpdate = true;
    if (this.#tufts.instanceColor !== null) this.#tufts.instanceColor.needsUpdate = true;
    if (this.#turf.instanceColor !== null) this.#turf.instanceColor.needsUpdate = true;
    this.#drawn = grass;
    this.#drawnDry = dry;
  }
  /** 只在吃草期间跟随前沿；其余语句保留原位置和骨骼姿态，连 idle 动画也不推进。 */
  #poseHerd(grass, fade, progress, delta, force = false) {
    for (let i = 0; i < this.#cows.length && i < MAX_COWS; i += 1) {
      const cow = this.#cows[i];
      const trait = cowTrait(i + this.#day);
      const inside = i < this.#wanted && fade > 0.01;
      const appeared = inside && !cow.root.visible;
      cow.root.visible = inside;
      if (i < this.#columns.length && (inside || force) && (this.#moving || appeared || force)) {
        const column = this.#columns[i];
        const row = Math.min(this.#rows - 0.35, Math.max(0.35, borderRow(column, grass, this.#rows, this.#ragged)));
        cow.root.position.set(column - FIELD_W / 2 + 0.5, 0, row - this.#rows / 2 + 0.95 + trait.gap);
        const sway = this.#moving ? 0.09 * Math.sin(progress * 7 + trait.phase * 6.3) : 0;
        cow.root.rotation.y = COW_TURN + trait.turn + sway;
        cow.root.scale.setScalar(cow.base);
      }
      const transparent = fade < 0.99;
      for (const material of cow.materials) {
        material.opacity = fade;
        if (material.transparent !== transparent) {
          material.transparent = transparent;
          material.needsUpdate = true;
        }
      }
      if (!this.#moving) continue;
      const stepping = progress > 0.5 + trait.phase * 0.3;
      const wanted = !inside ? null : this.#leaving && this.#exhausted ? "walk" : stepping ? "walk" : "eat";
      if (cow.clip !== wanted) {
        cow.clip = wanted;
        for (const [name, action] of Object.entries(cow.actions)) {
          if (action === null) continue;
          if (name === wanted) action.reset().fadeIn(0.18).play();
          else action.fadeOut(0.18);
        }
      }
      cow.mixer.update(delta);
    }
  }
  #tick = () => {
    this.#raf = requestAnimationFrame(this.#tick);
    const now = performance.now();
    const grass = this.#grass.at(now);
    const fade = this.#opacity.at(now);
    const progress = this.#transitionSpan <= 0 ? 1 : clamp01((now - this.#transitionStart) / this.#transitionSpan);
    const delta = this.#last === 0 ? 1 / 60 : Math.min(0.06, (now - this.#last) / 1e3);
    this.#last = now;
    const dry = this.#dry.at(now);
    if (this.#leaving && !this.#exhausted && grass <= 0.15) {
      this.#exhausted = true;
      if (this.#notice === "exhausted") this.#showNotice(true);
      this.#opacity.set(0, now, Math.max(600, this.#transitionSpan * 0.35));
    }
    if (!(Math.abs(grass - this.#drawn) < 1e-3) || Math.abs(dry - this.#drawnDry) > 1e-3) this.#writeField(grass, dry);
    this.#controls.update();
    this.#poseHerd(grass, fade, progress, delta);
    if (progress >= 1) this.#moving = false;
    this.#renderer.render(this.#scene, this.#camera);
  };
};
var BOARD_STYLE = `
.cg-over {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; pointer-events: none; opacity: 0; transform: scale(.92);
  transition: opacity var(--pico-duration-move) var(--pico-ease-out), transform var(--pico-duration-move) var(--pico-ease-out);
}
.cg-over[data-shown="true"] { opacity: 1; transform: none; }
.cg-over-mark { width: 54px; height: 54px; fill: none; stroke: var(--pico-hue-error-strong); stroke-width: 5.5; stroke-linecap: round; }
.cg-over[data-kind="crowded"] .cg-over-mark, .cg-over[data-kind="overflow"] .cg-over-mark {
  display: grid; place-items: center; width: 54px; height: 54px; stroke: none;
  color: var(--pico-accent); font: 700 46px/1 var(--pico-font-ui); text-shadow: 0 1px 2px color-mix(in srgb, var(--pico-paper) 70%, transparent);
}
.cg-over-text {
  padding: 3px 9px; border-radius: var(--pico-radius-sm);
  background: color-mix(in srgb, var(--pico-surface-raised) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--pico-hairline) 60%, transparent);
  color: var(--pico-ink); font: 600 var(--pico-size-sm)/1.3 var(--pico-font-ui);
}
.cg-board { position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: inherit; background: var(--pico-surface); }
.cg-board canvas { display: block; width: 100%; height: 100%; }
.cg-canvas { position: absolute; inset: 0; }
`;
function CowPasture({ world }) {
  const board = useRef(null);
  const canvas = useRef(null);
  const overlay = useRef(null);
  const pasture = useRef(null);
  const boot = useRef(world);
  const step = useRef(world.step);
  useEffect(() => {
    const host = canvas.current;
    const area = board.current;
    if (host === null || area === null) return;
    const scene = new Pasture(host, area, overlay.current);
    pasture.current = scene;
    scene.setWorld(boot.current, true);
    const observer = new ResizeObserver(() => scene.resize());
    observer.observe(area);
    return () => {
      observer.disconnect();
      scene.dispose();
      pasture.current = null;
    };
  }, []);
  useEffect(() => {
    const jump = Math.abs(world.step - step.current) > 1;
    step.current = world.step;
    pasture.current?.setWorld(world, jump);
  }, [world]);
  return /* @__PURE__ */ jsxs("div", { className: "cg-board", ref: board, children: [
    /* @__PURE__ */ jsx("style", { children: BOARD_STYLE }),
    /* @__PURE__ */ jsx("div", { className: "cg-canvas", ref: canvas }),
    /* @__PURE__ */ jsxs("div", { className: "cg-over", "data-shown": "false", "data-kind": world.notice ?? "none", ref: overlay, children: [
      world.notice === "exhausted" ? /* @__PURE__ */ jsx("svg", { className: "cg-over-mark", viewBox: "0 0 48 48", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M7 7 41 41M41 7 7 41" }) }) : /* @__PURE__ */ jsx("span", { className: "cg-over-mark", "aria-hidden": "true", children: "!" }),
      /* @__PURE__ */ jsx("span", { className: "cg-over-text", children: world.notice === null ? "" : NOTICE_TEXT[world.notice] })
    ] })
  ] });
}
var mountOptions = {
  ...pythonOptions({ playback: { stepMs: HOLD_IDLE, stepMsFor: (position, trace) => holdMsOf(trace, position.traceIndex) } }),
  layout: layoutOptions,
  filename: "cow-grass.py",
  automatic: 500,
  start: [{ type: "python.run" }]
};
var starter = INITIAL_SOURCE;
var COW_GRASS_SCRIPT = cow_grass_script_default;
var COW_GRASS_SESSION = pythonSession({
  world: { title: "\u7267\u573A", render: (view) => {
    const playing = view.get(playbackHost2);
    return /* @__PURE__ */ jsx(CowPasture, { world: worldOf(playing?.trace ?? null, playing?.position ?? null) });
  } },
  ai: courseAi({
    explain: "\u8FD9\u4E00\u53E5\u5728\u66F4\u65B0\u8349\u91CF\uFF1A\u6BCF\u5929\u5148\u957F\u51FA\u65B0\u8349\uFF0C\u518D\u88AB\u725B\u5403\u6389\uFF0C\u8349\u91CF\u7684\u53D8\u5316\u51B3\u5B9A\u80FD\u5403\u51E0\u5929\u3002",
    question: "\u628A\u201C\u6BCF\u5929\u957F\u591A\u5C11\u201D\u548C\u201C\u6BCF\u5929\u5403\u591A\u5C11\u201D\u5206\u5F00\u770B\uFF0C\u8349\u91CF\u6BCF\u5929\u51C0\u53D8\u5316\u662F\u591A\u5C11\uFF1F\u8FD0\u884C\u540E\u5728\u7267\u573A\u91CC\u9010\u5929\u89C2\u5BDF\u3002"
  }),
  scripts: [COW_GRASS_SCRIPT]
});
var COW_GRASS_COURSE = {
  name: "\u725B\u5403\u8349",
  component: cowGrass,
  starter: INITIAL_SOURCE,
  playground: mountOptions,
  session: COW_GRASS_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: COW_GRASS_COURSE, host });
}
export {
  CAPACITY,
  COW_GRASS_COURSE,
  COW_GRASS_SCRIPT,
  COW_GRASS_SESSION,
  INITIAL_SOURCE,
  NOTICE_TEXT,
  Root,
  borderRow,
  cowColumns,
  cowGrass,
  examples,
  herdColumns,
  holdMsOf,
  raggedOf,
  rowsFor,
  starter,
  tileGrass,
  worldOf
};
