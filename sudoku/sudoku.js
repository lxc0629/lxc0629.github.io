// playgrounds/sudoku/sudoku.generated.tsx
import { on, stateful } from "../pico.js";
import { Source } from "../pico.js";
import { python as python3 } from "../pico.js";
import { playback as playback2 } from "../pico.js";
import { PlaygroundShell, Widget } from "../pico.js";
import { usePlayground } from "../pico.js";

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
      const execution = own(python2.create(options.python ?? {}, bus));
      own({ dispose: bus.subscribe(["playback.changed"], () => {
        const { position } = playing.state;
        const result = execution.state.result;
        const error = position?.atEnd && result.status === "ready" ? result.value?.error : null;
        const diagnostics = [];
        const lines = checkedSource.split("\n");
        if (error?.line != null && Number.isInteger(error.line) && error.line >= 1 && error.line <= lines.length) {
          const from = lines.slice(0, error.line - 1).reduce((offset, line) => offset + line.length + 1, 0);
          diagnostics.push({ from, to: from + lines[error.line - 1].length, severity: "error", message: error.message });
        }
        const selected = focus.state.current;
        const changesSelectedVariable = selected?.kind === "runtime-variable" && selected.run === playing.state.trace && position !== null && variableTimeline(selected).some((point) => point.traceIndex === position.traceIndex);
        const highlight = !diagnostics.length && position?.state.line != null ? { line: position.state.line, kind: changesSelectedVariable ? "change" : "execution" } : null;
        bus.emit({ type: "editor.render", source: editor.state.source, highlight }, "playground");
        bus.emit({ type: "editor.diagnostics", source: checkedSource, diagnostics }, "playground");
      }) });
      observe("python", () => ({ ...execution.state }), ["python.changed"]);
      observe("playback", () => ({ ...playing.state }), ["playback.changed"]);
      observe("selection", () => focus.state, ["selection.changed"]);
      return { python: execution.state, playback: playing.state, terminal: output, debugger: debugging, selection: focus.state };
    }
  };
}

// playgrounds/sudoku/sudoku.generated.tsx
import { Fragment, jsx, jsxs } from "../libs/react.js";
var RESOURCE = "sudoku";
var layoutOptions = { open: ["world", "debug"], ratio: 0.4 };
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
var sudoku = stateful("sudoku", (source) => ({ source, caseIndex: 0 }), [
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
  const execution = python3.create({}, bus);
  bus.emit({ type: "python.run" });
  return () => {
    execution.dispose();
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
function Root(host = {}) {
  const view = usePlayground(sudoku, host.source ?? STARTER, { ...mountOptions, ...host.options });
  if (!view) return null;
  const world = readSudokuWorld(view.parts.playback.position, view.parts.playback.trace, view.state.caseIndex);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: STYLE }),
    /* @__PURE__ */ jsx(
      PlaygroundShell,
      {
        name: "\u8FF7\u4F60\u6570\u72EC",
        layout: view.layout,
        onEvent: view.send,
        menu: view.menu,
        toolbar: [...view.toolbar, { label: "\u7528\u4F8B", controls: [{ kind: "choices", label: "\u6570\u72EC", value: String(view.state.caseIndex), choices: CASES.map((item, caseIndex) => ({
          value: String(caseIndex),
          label: String(caseIndex + 1),
          title: item.name,
          event: { type: "sudoku.case.changed", caseIndex }
        })) }] }],
        editor: /* @__PURE__ */ jsx(Widget, { widget: view.editor }),
        panels: [
          { key: "world", icon: "viz", title: "\u68CB\u76D8", flush: true, content: /* @__PURE__ */ jsx("div", { className: "pico-scene", children: /* @__PURE__ */ jsx(SudokuBoard, { world }) }) },
          { key: "debug", icon: "debug", title: "\u8C03\u8BD5", content: /* @__PURE__ */ jsx(Widget, { widget: view.parts.debugger }) },
          { key: "output", icon: "output", title: "\u7EC8\u7AEF", content: /* @__PURE__ */ jsx(Widget, { widget: view.parts.terminal }) }
        ]
      }
    )
  ] });
}
export {
  CASES,
  Root,
  STARTER,
  examples,
  paceOf,
  readSudokuWorld,
  starter,
  sudoku
};
