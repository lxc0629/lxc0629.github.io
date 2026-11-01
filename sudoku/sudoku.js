// playgrounds/sudoku/sudoku.generated.tsx
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

// playgrounds/sudoku/sudoku.generated.tsx
import { playbackHost as playbackHost2, provided as provided2 } from "../session.js";
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
function caseChoices(options) {
  const values = options.choices.map((choice) => choice.value);
  return feature(`${options.id}.choices`, {
    requires: [options.state],
    actions: [{
      id: options.id,
      label: options.label,
      tags: ["run"],
      args: { value: { type: "string", enum: values } },
      when: ({ get }, { value }) => typeof value === "string" && values.includes(value) && get(options.state) !== null,
      event: (_context, { value }) => options.event(value)
    }],
    views: [{ slot: "toolbar", label: options.label, controls: ({ get }) => {
      const state = get(options.state);
      return state === null ? [] : [{
        kind: "choices",
        label: options.label,
        value: options.current(state),
        choices: options.choices.map((choice) => ({ ...choice, event: { type: "session.invoke", action: options.id, args: { value: choice.value } } }))
      }];
    } }]
  });
}
function courseAi(answers) {
  return {
    port: mockAiPort((request) => request.kind === "explain" ? { title: "\u8FD9\u4E00\u6B65\u5728\u505A\u4EC0\u4E48", text: answers.explain, primary: { action: "selection.locate", label: "\u5B9A\u4F4D\u5230\u6267\u884C" } } : { title: "\u53EF\u4EE5\u4ECE\u8FD9\u91CC\u60F3\u8D77", text: answers.question }, { delayMs: 300 })
  };
}

// playgrounds/sudoku/sudoku.script.json
var sudoku_script_default = {
  id: "sudoku",
  title: "\u4E00\u6B65\u6B65\u5199\u51FA\u53CC\u5C42\u679A\u4E3E",
  from: "",
  mode: "instruction",
  auto: true,
  steps: [
    { title: "\u5148\u51C6\u5907\u8DE8\u5FAA\u73AF\u7684\u6210\u529F\u6807\u8BB0", concepts: ["backtrack", "list"], stage: { panels: ["viz"] }, say: [{ say: "\u6211\u4EEC\u8981\u679A\u4E3E\u4E24\u4E2A\u7A7A\u683C\u3002\u5148\u7528 solved \u8BB0\u5F55\u662F\u5426\u5DF2\u7ECF\u627E\u5230\u7B54\u6848\uFF1B\u5B83\u7A0D\u540E\u4F1A\u628A\u5185\u5C42\u5FAA\u73AF\u7684\u7ED3\u679C\u4F20\u7ED9\u5916\u5C42\u3002", write: "solved = False\n" }] },
    { title: "\u5916\u5C42\u9009\u62E9\u7B2C\u4E00\u4E2A\u7A7A\u683C", concepts: ["backtrack", "list"], say: [{ say: "a \u4F9D\u6B21\u53D6 1\u30012\u30013\u30014\u3002\u6BCF\u6362\u4E00\u4E2A a\uFF0C\u5C31\u628A\u7B2C\u4E00\u7A7A\u683C\u66F4\u65B0\u4E00\u6B21\u3002", write: "solved = False\n\nfor a in range(1, 5):\n    place(1, a)\n" }] },
    { title: "\u5185\u5C42\u5B8C\u6574\u679A\u4E3E\u7B2C\u4E8C\u4E2A\u7A7A\u683C", concepts: ["backtrack", "list"], say: [{ say: "\u5BF9\u5F53\u524D a\uFF0Cb \u4E5F\u4ECE 1 \u5230 4\u3002\u8FD9\u6837\u5F62\u6210\u6700\u591A 4\xD74 \u7EC4\u5019\u9009\u3002", write: "solved = False\n\nfor a in range(1, 5):\n    place(1, a)\n\n    for b in range(1, 5):\n        place(2, b)\n" }] },
    { title: "\u9A8C\u8BC1\u5F53\u524D\u7EC4\u5408", concepts: ["backtrack", "list"], say: [{ say: "\u4E24\u4E2A\u683C\u5B50\u90FD\u6709\u503C\u540E\uFF0Cis_valid \u68C0\u67E5\u6BCF\u884C\u3001\u6BCF\u5217\u548C\u6BCF\u4E2A 2\xD72 \u5BAB\u3002\u6210\u529F\u65F6\u8BBE\u7F6E\u6807\u8BB0\u5E76\u9000\u51FA\u5185\u5C42\u5FAA\u73AF\u3002", write: "solved = False\n\nfor a in range(1, 5):\n    place(1, a)\n\n    for b in range(1, 5):\n        place(2, b)\n\n        if is_valid():\n            solved = True\n            break\n" }] },
    { title: "\u8BA9\u5916\u5C42\u4E5F\u77E5\u9053\u5DF2\u7ECF\u6210\u529F", concepts: ["backtrack", "list"], say: [{ say: "\u5185\u5C42 break \u53EA\u9000\u51FA b \u7684\u5FAA\u73AF\u3002\u56DE\u5230\u5916\u5C42\u540E\u68C0\u67E5 solved\uFF0C\u518D break \u4E00\u6B21\uFF0C\u624D\u4E0D\u4F1A\u8986\u76D6\u521A\u627E\u5230\u7684\u7B54\u6848\u3002", write: "solved = False\n\nfor a in range(1, 5):\n    place(1, a)\n\n    for b in range(1, 5):\n        place(2, b)\n\n        if is_valid():\n            solved = True\n            break\n\n    if solved:\n        break\n" }] },
    { title: "\u8FD0\u884C\u5E76\u89C2\u5BDF\u679A\u4E3E\u987A\u5E8F", concepts: ["backtrack", "list"], stage: { panels: ["viz", "debug"], focus: "viz" }, do: [{ action: "code.run" }], say: "\u68CB\u76D8\u4F1A\u6309 (a,b) \u7684\u987A\u5E8F\u5C1D\u8BD5\u5019\u9009\u3002\u51B2\u7A81\u7EBF\u6765\u81EA\u5F53\u524D\u68CB\u76D8\u4E8B\u5B9E\uFF0Cis_valid \u5219\u51B3\u5B9A\u7A0B\u5E8F\u662F\u5426\u505C\u6B62\u3002" },
    { title: "Debugger \u770B\u5185\u5C42\u5FAA\u73AF\u91CD\u6765", concepts: ["backtrack", "list"], stage: { panels: ["viz", "debug"], focus: "debug" }, do: [{ action: "code.locate", args: { line: 7, occurrence: 1 } }, { action: "annotation.show", args: { kind: "mark", at: { variable: "a" } } }, { action: "annotation.show", args: { kind: "mark", at: { variable: "b" } } }], say: "\u7B2C\u4E00\u6B21\u6267\u884C place(2,b) \u65F6\u67E5\u770B a\u3001b\u3002\u7EE7\u7EED\u5B9A\u4F4D\u540E\u7EED occurrence\uFF0C\u4F1A\u770B\u5230 b \u5FEB\u901F\u53D8\u5316\uFF1Bb \u8DD1\u5B8C\u540E a \u624D\u589E\u52A0\uFF0Cb \u53C8\u4ECE 1 \u5F00\u59CB\u3002" },
    { title: "\u770B\u627E\u5230\u7B54\u6848\u7684\u90A3\u4E2A\u65F6\u523B", concepts: ["backtrack", "list"], do: [{ action: "code.locate", args: { line: 9, occurrence: 1 } }], say: "\u505C\u5728\u7B2C\u4E00\u6B21 is_valid \u6210\u7ACB\u7684\u4F4D\u7F6E\u3002\u5355\u6B65\u540E solved \u4ECE False \u53D8\u6210 True\uFF0C\u5148\u9000\u51FA\u5185\u5C42\uFF0C\u518D\u7531\u672B\u5C3E\u7684 if \u9000\u51FA\u5916\u5C42\u3002\u5E03\u5C14\u53D8\u91CF\u5728\u4E24\u4E2A\u63A7\u5236\u5C42\u4E4B\u95F4\u4F20\u9012\u4E86\u7ED3\u679C\u3002" },
    { title: "\u56DE\u987E\u641C\u7D22\u7A0B\u5E8F", concepts: ["backtrack", "list"], say: "\u5D4C\u5957\u5FAA\u73AF\u7CFB\u7EDF\u5730\u4EA7\u751F\u5019\u9009\uFF0C\u9A8C\u8BC1\u51FD\u6570\u7B5B\u6389\u4E0D\u5408\u6CD5\u72B6\u6001\uFF0C\u6807\u8BB0\u548C break \u63D0\u524D\u7EC8\u6B62\u641C\u7D22\u3002World \u8BF4\u660E\u201C\u8FD9\u4E2A\u5019\u9009\u4E3A\u4EC0\u4E48\u51B2\u7A81\u201D\uFF0CDebugger \u8BF4\u660E\u201C\u7A0B\u5E8F\u4E0B\u4E00\u6B65\u4E3A\u4EC0\u4E48\u6362\u5019\u9009\u6216\u505C\u6B62\u201D\u3002" }
  ]
};

// playgrounds/sudoku/sudoku.generated.tsx
import { jsx, jsxs } from "../libs/react.js";
var RESOURCE = "sudoku";
var layoutOptions = { open: ["viz", "debug"], ratio: 0.4 };
var STARTER = `solved = False

for a in range(1, 5):
    place(1, a)

    for b in range(1, 5):
        place(2, b)

        if is_valid():
            solved = True
            break

    if solved:
        break`;
var CASES = [
  { name: "\u540C\u884C\u7EA6\u675F", board: [[1, null, 3, null], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]], solution: [2, 4], attempts: 8 },
  { name: "\u540C\u5BAB\u7EA6\u675F", board: [[2, 4, 1, 3], [3, 1, 4, 2], [4, null, 3, 1], [null, 3, 2, 4]], solution: [2, 1], attempts: 5 },
  { name: "\u4EA4\u53C9\u7EA6\u675F", board: [[4, 3, 2, 1], [1, 2, null, 3], [3, null, 1, 2], [2, 1, 3, 4]], solution: [4, 4], attempts: 16 }
];
function preludeFor(testCase) {
  const board = testCase.board.map((row) => row.map((value) => value ?? 0));
  return `def __make_sudoku():
    board = ${JSON.stringify(board)}
    blanks = [(row, col) for row in range(4) for col in range(4) if board[row][col] == 0]
    log = []
    import _pico_runtime
    _pico_runtime.register_trace_resource("${RESOURCE}", log)

    def conflicts():
        found = set()
        groups = []
        groups.extend([[(row, col) for col in range(4)] for row in range(4)])
        groups.extend([[(row, col) for row in range(4)] for col in range(4)])
        groups.extend([[(row + dr, col + dc) for dr in range(2) for dc in range(2)] for row in (0, 2) for col in (0, 2)])
        for group in groups:
            positions = {}
            for row, col in group:
                value = board[row][col]
                if value != 0:
                    positions.setdefault(value, []).append((row, col))
            for cells in positions.values():
                if len(cells) > 1:
                    found.update(cells)
        return [row * 4 + col for row, col in sorted(found)]

    def valid():
        return all(board[row][col] != 0 for row in range(4) for col in range(4)) and not conflicts()

    def record(action, index=0, number=0, checked=False):
        log.append({"action": action, "index": index, "number": number,
                    "board": [value for row in board for value in row],
                    "conflicts": conflicts(), "complete": valid(), "checked": checked})

    def place(index, number):
        if isinstance(index, bool) or not isinstance(index, int) or index not in (1, 2):
            raise ValueError("place \u7684\u7A7A\u683C\u7F16\u53F7\u53EA\u80FD\u662F 1 \u6216 2")
        if isinstance(number, bool) or not isinstance(number, int) or number not in range(1, 5):
            raise ValueError("place \u7684\u6570\u5B57\u53EA\u80FD\u662F 1 \u5230 4")
        row, col = blanks[index - 1]
        board[row][col] = number
        record("place", index, number)

    def is_valid():
        answer = valid()
        record("check", checked=True)
        return answer

    return place, is_valid

place, is_valid = __make_sudoku()`;
}
var sudoku = stateful("sudoku", (source2) => ({ source: source2, caseIndex: 0 }), [
  on("editor.changed", edit, []),
  on("python.run", run, ["python.execute"]),
  on("sudoku.case.changed", selectCase, ["python.clear", "python.run"])
]);
function edit(state, event) {
  state.source = event.source;
}
function run(state, _event, { emit }) {
  emit({ type: "python.execute", source: new Source(state.source, { prelude: preludeFor(CASES[state.caseIndex]) }), options: {
    trace: { events: ["stmt", "call", "return"], observe: { globals: true, locals: true } },
    timeoutMs: 3e3,
    maxTraceSteps: 4e3
  } });
}
function selectCase(state, event, { emit }) {
  if (!Number.isInteger(event.caseIndex) || event.caseIndex < 0 || event.caseIndex >= CASES.length || event.caseIndex === state.caseIndex) return;
  state.caseIndex = event.caseIndex;
  emit({ type: "python.clear" });
  emit({ type: "python.run" });
}
function create(bus) {
  const course = sudoku.create(STARTER, bus);
  const player = playback2.create({}, bus);
  const execution2 = python3.create({}, bus);
  bus.emit({ type: "python.run" });
  return () => {
    execution2.dispose();
    player.dispose();
    course.dispose();
  };
}
var examples = {
  first: { create, events: [] },
  second: { create, events: [{ type: "sudoku.case.changed", caseIndex: 1 }] },
  third: { create, events: [{ type: "sudoku.case.changed", caseIndex: 2 }] }
};
function initialWorld(testCase) {
  const board = testCase.board.flat().map((value) => value ?? 0);
  return { board, blanks: board.flatMap((value, index) => value === 0 ? [index] : []), conflicts: [], complete: false, checked: false, action: "initial", placed: null };
}
function recordAt(state, trace) {
  const count = state?.resources?.[RESOURCE] ?? 0;
  const value = count > 0 ? trace?.resources[RESOURCE]?.[count - 1] : null;
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function readSudokuWorld(position, trace, caseIndex) {
  const base = initialWorld(CASES[caseIndex] ?? CASES[0]);
  const record = recordAt(position?.state, trace);
  if (record === null) return base;
  const board = Array.isArray(record.board) && record.board.every((value) => typeof value === "number") ? record.board : base.board;
  const conflicts = Array.isArray(record.conflicts) && record.conflicts.every((value) => typeof value === "number") ? record.conflicts : [];
  const action = record.action === "check" ? "check" : record.action === "place" ? "place" : "initial";
  const index = typeof record.index === "number" && record.index >= 1 && record.index <= 2 ? base.blanks[record.index - 1] : null;
  return { board, blanks: base.blanks, conflicts, complete: record.complete === true, checked: record.checked === true, action, placed: index };
}
function changedResource(position, trace) {
  return (position.state.resources?.[RESOURCE] ?? 0) !== (position.previous.resources?.[RESOURCE] ?? 0);
}
function paceOf(position, trace) {
  return position.atEnd ? 700 : changedResource(position, trace) ? 460 : 150;
}
function SudokuBoard({ world }) {
  const center = (index) => ({ x: 50 + index % 4 * 100, y: 50 + Math.floor(index / 4) * 100 });
  const conflictPairs = [];
  for (let i = 0; i < world.conflicts.length; i += 1) for (let j = i + 1; j < world.conflicts.length; j += 1) {
    const a = world.conflicts[i];
    const b = world.conflicts[j];
    const sameRow = Math.floor(a / 4) === Math.floor(b / 4);
    const sameCol = a % 4 === b % 4;
    const sameBox = Math.floor(a % 4 / 2) === Math.floor(b % 4 / 2) && Math.floor(a / 8) === Math.floor(b / 8);
    if (world.board[a] === world.board[b] && (sameRow || sameCol || sameBox)) conflictPairs.push([a, b]);
  }
  return /* @__PURE__ */ jsx("div", { className: "sdk-wrap", "data-complete": world.complete, children: /* @__PURE__ */ jsxs("svg", { viewBox: "-18 -18 436 436", preserveAspectRatio: "xMidYMid meet", role: "img", "aria-label": world.complete ? "\u6570\u72EC\u5B8C\u6210" : "4 \u4E58 4 \u6570\u72EC\u68CB\u76D8", children: [
    /* @__PURE__ */ jsx("rect", { className: "sdk-board", x: "0", y: "0", width: "400", height: "400", rx: "8" }),
    conflictPairs.map(([a, b]) => {
      const from = center(a);
      const to = center(b);
      return /* @__PURE__ */ jsx("line", { className: "sdk-conflict-line", x1: from.x, y1: from.y, x2: to.x, y2: to.y }, `${a}-${b}`);
    }),
    world.board.map((value, index) => {
      const x = index % 4 * 100;
      const y = Math.floor(index / 4) * 100;
      const blank = world.blanks.includes(index);
      const conflict = world.conflicts.includes(index);
      return /* @__PURE__ */ jsxs("g", { className: "sdk-cell", "data-blank": blank, "data-conflict": conflict, "data-placed": world.placed === index, children: [
        /* @__PURE__ */ jsx("rect", { x: x + 4, y: y + 4, width: "92", height: "92", rx: "7" }),
        value !== 0 && /* @__PURE__ */ jsx("text", { x: x + 50, y: y + 63, children: value })
      ] }, index);
    }),
    [1, 2, 3].map((line) => /* @__PURE__ */ jsxs("g", { className: line === 2 ? "sdk-grid sdk-grid--major" : "sdk-grid", children: [
      /* @__PURE__ */ jsx("line", { x1: line * 100, y1: "0", x2: line * 100, y2: "400" }),
      /* @__PURE__ */ jsx("line", { x1: "0", y1: line * 100, x2: "400", y2: line * 100 })
    ] }, line)),
    /* @__PURE__ */ jsx("rect", { className: "sdk-frame", x: "0", y: "0", width: "400", height: "400", rx: "8" })
  ] }) });
}
var STYLE = `
.sdk-wrap { width:100%; height:100%; min-width:0; min-height:0; display:grid; place-items:center; padding:clamp(12px,4vmin,32px); }
.sdk-wrap svg { display:block; width:100%; height:100%; min-width:0; min-height:0; }
.sdk-board { fill:var(--pico-surface); }
.sdk-cell rect { fill:var(--pico-surface-raised); transition:fill var(--pico-duration-fast); }
.sdk-cell text { text-anchor:middle; font:650 42px/1 var(--pico-font-ui); fill:var(--pico-ink); }
.sdk-cell[data-blank="true"] text { fill:var(--pico-accent-deep); }
.sdk-cell[data-conflict="true"] rect { fill:var(--pico-hue-error-bg); stroke:var(--pico-hue-error-strong); stroke-width:3; }
.sdk-cell[data-placed="true"] text { animation:sdk-pop 360ms var(--pico-ease-out); transform-origin:center; transform-box:fill-box; }
.sdk-conflict-line { stroke:var(--pico-hue-error-strong); stroke-width:3; stroke-dasharray:8 7; opacity:.8; }
.sdk-grid line,.sdk-frame { fill:none; stroke:var(--pico-ink-soft); stroke-width:2; }
.sdk-grid--major line,.sdk-frame { stroke:var(--pico-ink); stroke-width:6; }
.sdk-wrap[data-complete="true"] .sdk-cell[data-blank="true"] rect { fill:var(--pico-hue-branch-bg); }
.sdk-wrap[data-complete="true"] .sdk-frame { stroke:var(--pico-hue-branch-strong); filter:drop-shadow(0 0 8px var(--pico-accent-glow)); }
@keyframes sdk-pop { from { transform:scale(.65); opacity:.35; } to { transform:scale(1); opacity:1; } }
@media (prefers-reduced-motion:reduce) { .sdk-cell[data-placed="true"] text { animation:none; } }
`;
var mountOptions = {
  ...pythonOptions({ playback: { stepMs: 150, stepMsFor: paceOf } }),
  filename: "sudoku.py",
  layout: layoutOptions,
  automatic: 500,
  start: [{ type: "python.run" }]
};
var starter = STARTER;
var SUDOKU_SCRIPT = sudoku_script_default;
var sudokuState = provided2("sudoku.state");
var SUDOKU_SESSION = pythonSession({
  world: { title: "\u68CB\u76D8", render: (view) => {
    const state = view.get(sudokuState);
    const playing = view.get(playbackHost2);
    return /* @__PURE__ */ jsxs("div", { className: "pico-scene", children: [
      /* @__PURE__ */ jsx("style", { children: STYLE }),
      /* @__PURE__ */ jsx(SudokuBoard, { world: readSudokuWorld(playing?.position ?? null, playing?.trace ?? null, state.caseIndex) })
    ] });
  } },
  domain: [caseChoices({
    id: "sudoku.case",
    label: "\u6570\u72EC",
    state: sudokuState,
    current: (state) => String(state.caseIndex),
    choices: CASES.map((item, index) => ({ value: String(index), label: String(index + 1), title: item.name })),
    event: (value) => ({ type: "sudoku.case.changed", caseIndex: Number(value) })
  })],
  provide: (view) => [sudokuState.with(view.state)],
  ai: courseAi({
    explain: "\u8FD9\u4E00\u53E5\u5C5E\u4E8E\u4E24\u5C42\u679A\u4E3E\u91CC\u7684\u4E00\u6B65\uFF1A\u5916\u5C42\u56FA\u5B9A\u7B2C\u4E00\u4E2A\u7A7A\u683C\uFF0C\u5185\u5C42\u628A\u7B2C\u4E8C\u4E2A\u7A7A\u683C\u4ECE 1 \u8BD5\u5230 4\uFF0C\u6BCF\u6B21\u653E\u5B8C\u90FD\u7528 is_valid() \u68C0\u67E5\u6574\u76D8\u3002",
    question: "\u5148\u60F3\u6E05\u695A\u4E24\u5C42\u5FAA\u73AF\u7684\u987A\u5E8F\uFF1Aa \u56FA\u5B9A\u65F6 b \u8981\u8DD1\u5B8C\u4E00\u8F6E\u3002\u518D\u770B\u4E24\u6B21 break \u5206\u522B\u505C\u54EA\u4E00\u5C42\uFF0C\u4EE5\u53CA solved \u600E\u6837\u628A\u201C\u627E\u5230\u4E86\u201D\u4F20\u7ED9\u5916\u5C42\u3002"
  }),
  scripts: [SUDOKU_SCRIPT]
});
var SUDOKU_COURSE = {
  name: "\u8FF7\u4F60\u6570\u72EC",
  component: sudoku,
  starter: STARTER,
  playground: mountOptions,
  session: SUDOKU_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: SUDOKU_COURSE, host });
}
export {
  CASES,
  Root,
  STARTER,
  SUDOKU_COURSE,
  SUDOKU_SCRIPT,
  SUDOKU_SESSION,
  examples,
  paceOf,
  readSudokuWorld,
  starter,
  sudoku
};
