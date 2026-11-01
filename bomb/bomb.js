// playgrounds/bomb/bomb.generated.tsx
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

// playgrounds/bomb/bomb.generated.tsx
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

// playgrounds/bomb/bomb.script.json
var bomb_script_default = {
  id: "bomb",
  title: "\u628A\u62C6\u5F39\u624B\u518C\u7FFB\u8BD1\u6210\u7A0B\u5E8F",
  from: "",
  mode: "instruction",
  auto: true,
  steps: [
    { title: "\u7B2C\u4E00\u9636\u6BB5\u5148\u9010\u6839\u641C\u7D22", concepts: ["loop", "branch"], stage: { panels: ["viz"] }, say: [{ say: "\u624B\u518C\u7B2C\u4E00\u9636\u6BB5\u8981\u6C42\u9EC4\u8272\u4E14\u5E26\u7535\u3002for \u5FAA\u73AF\u8BA9 wire \u4F9D\u6B21\u53D6 1 \u5230 8\u3002", write: "for wire in range(1, 9):\n" }, { say: "\u5148\u63A2\u6D4B\u989C\u8272\uFF0C\u628A\u89C2\u5BDF\u7ED3\u679C\u4FDD\u5B58\u5728 color\u3002", write: "for wire in range(1, 9):\n    color = get_color(wire)\n" }] },
    { title: "\u7528\u77ED\u8DEF and \u5B89\u5168\u6D4B\u91CF", concepts: ["branch"], say: [{ say: "\u5148\u5224\u65AD\u989C\u8272\uFF0C\u518D\u628A get_voltage \u653E\u5728 and \u53F3\u8FB9\u3002\u989C\u8272\u4E0D\u5339\u914D\u65F6 Python \u4F1A\u77ED\u8DEF\uFF0C\u4E0D\u6D4B\u7535\u538B\u3002", write: 'for wire in range(1, 9):\n    color = get_color(wire)\n    if color == "yellow" and get_voltage(wire) > 0:\n' }] },
    { title: "\u526A\u7EBF\u540E\u9A6C\u4E0A\u9000\u51FA\u641C\u7D22", concepts: ["loop", "branch"], say: [{ say: "\u547D\u4E2D\u76EE\u6807\u5C31\u526A\u7EBF\uFF0C\u5E76\u7528 break \u505C\u6B62\u5F53\u524D\u5FAA\u73AF\u3002\u5426\u5219\u4E0B\u4E00\u8F6E\u8FD8\u79FB\u52A8\u63A2\u9488\uFF0C\u4F1A\u8FDD\u53CD\u72B6\u6001\u673A\u3002", write: 'for wire in range(1, 9):\n    color = get_color(wire)\n    if color == "yellow" and get_voltage(wire) > 0:\n        cut(wire)\n        break\n' }] },
    { title: "\u590D\u4F4D\u540E\u5199\u7B2C\u4E8C\u4E2A\u9636\u6BB5", concepts: ["loop", "branch"], say: [{ say: "\u7B2C\u4E00\u9636\u6BB5\u5B8C\u6210\u540E\uFF0Creset_probe \u8BA9\u63A2\u9488\u5F52\u4ED3\u5E76\u8FDB\u5165\u4E0B\u4E00\u9636\u6BB5\u3002\u7B2C\u4E8C\u4E2A\u5FAA\u73AF\u590D\u7528\u540C\u4E00\u7B97\u6CD5\u9AA8\u67B6\uFF0C\u53EA\u628A\u89C4\u5219\u6362\u6210\u7EA2\u8272\u5E26\u7535\u5F15\u4FE1\u3002", write: 'for wire in range(1, 9):\n    color = get_color(wire)\n    if color == "yellow" and get_voltage(wire) > 0:\n        cut(wire)\n        break\n\nreset_probe()\n\nfor wire in range(1, 9):\n    color = get_color(wire)\n    if color == "red" and get_voltage(wire) > 0:\n        cut(wire)\n        break\n' }] },
    { title: "\u8FD0\u884C\u6807\u51C6\u53CC\u4FDD\u9669", concepts: ["loop", "branch"], stage: { panels: ["viz", "debug"], focus: "viz" }, do: [{ action: "code.run" }], say: "\u8FD0\u884C\u540E\uFF0CWorld \u6309\u4E8B\u4EF6\u663E\u793A\u63A2\u9488\u79FB\u52A8\u3001\u989C\u8272\u63ED\u793A\u3001\u7535\u538B\u6D4B\u91CF\u3001\u526A\u7EBF\u548C\u9636\u6BB5\u5207\u6362\u3002\u4EAE\u8D77\u591A\u5C11\u6839\u7EBF\uFF0C\u5C31\u662F\u7A0B\u5E8F\u5B9E\u9645\u68C0\u67E5\u4E86\u591A\u5C11\u6B21\u3002" },
    { title: "Debugger \u770B\u77ED\u8DEF\u53D1\u751F\u5728\u54EA\u91CC", concepts: ["debug", "branch"], stage: { panels: ["viz", "debug"], focus: "debug" }, do: [{ action: "code.locate", args: { line: 3, occurrence: 1 } }, { action: "annotation.show", args: { kind: "mark", at: { variable: "color" } } }], say: "\u505C\u5728\u7B2C\u4E00\u6B21 if\u3002\u989C\u8272\u4E0D\u662F yellow \u65F6\uFF0C\u53F3\u4FA7 get_voltage \u6839\u672C\u4E0D\u6267\u884C\uFF1B\u7EE7\u7EED\u5230\u9EC4\u8272\u7EBF\uFF0C\u624D\u4F1A\u770B\u5230\u7535\u538B\u724C\u51FA\u73B0\u3002\u77ED\u8DEF\u65E2\u662F\u5E03\u5C14\u8BED\u4E49\uFF0C\u4E5F\u662F\u51CF\u5C11\u5371\u9669\u52A8\u4F5C\u7684\u7A0B\u5E8F\u7B56\u7565\u3002" },
    { title: "\u770B break \u4E0E\u9636\u6BB5\u4EA4\u63A5", concepts: ["debug", "branch"], do: [{ action: "code.locate", args: { line: 5, occurrence: 1 } }], say: "\u547D\u4E2D\u540E\u6267\u884C break\uFF0C\u63A7\u5236\u6D41\u8DF3\u5230 reset_probe\uFF0C\u800C\u4E0D\u662F\u56DE\u5230\u5FAA\u73AF\u5F00\u5934\u3002Debugger \u5C55\u793A\u63A7\u5236\u6D41\u8DF3\u8F6C\uFF0CWorld \u5C55\u793A\u72B6\u6001\u4ECE\u201C\u5DF2\u526A\u7EBF\u3001\u7B49\u5F85\u590D\u4F4D\u201D\u53D8\u5230\u4E0B\u4E00\u9636\u6BB5\u3002" },
    { title: "\u89C4\u5219\u53D8\u5316\uFF0C\u9AA8\u67B6\u4FDD\u6301", concepts: ["loop", "branch"], stage: { panels: ["viz"] }, say: "\u5207\u6362\u7528\u4F8B\u65F6\uFF0C\u989C\u8272\u3001\u7535\u538B\u8303\u56F4\u548C\u9636\u6BB5\u6570\u91CF\u4F1A\u53D8\u5316\uFF1B\u9010\u6839\u641C\u7D22\u3001\u77ED\u8DEF\u5224\u65AD\u3001\u547D\u4E2D\u540E break\u3001\u9636\u6BB5\u95F4 reset \u7684\u7ED3\u6784\u4FDD\u6301\u7A33\u5B9A\u3002\u7A0B\u5E8F\u8BBE\u8BA1\u5C31\u662F\u8BC6\u522B\u54EA\u4E9B\u5173\u7CFB\u7A33\u5B9A\u3001\u54EA\u4E9B\u53C2\u6570\u6765\u81EA\u9700\u6C42\u3002" },
    { title: "\u56DE\u987E\u72B6\u6001\u673A\u601D\u7EF4", concepts: ["loop", "branch"], say: "for \u8D1F\u8D23\u5BFB\u627E\u76EE\u6807\uFF0Cif \u8D1F\u8D23\u628A\u624B\u518C\u53D8\u6210\u6761\u4EF6\uFF0Cbreak \u7ED3\u675F\u5F53\u524D\u641C\u7D22\uFF0Creset_probe \u63A8\u8FDB\u9636\u6BB5\u3002\u52A8\u4F5C\u5FC5\u987B\u6309\u72B6\u6001\u987A\u5E8F\u53D1\u751F\uFF1BDebugger \u544A\u8BC9\u4F60\u6267\u884C\u5230\u4E86\u54EA\u91CC\uFF0CWorld \u544A\u8BC9\u4F60\u8FD9\u4E2A\u52A8\u4F5C\u5728\u89C4\u5219\u7CFB\u7EDF\u91CC\u9020\u6210\u4E86\u4EC0\u4E48\u3002" }
  ]
};

// playgrounds/bomb/bomb.generated.tsx
import { jsx, jsxs } from "../libs/react.js";
var RESOURCE = "bomb";
var layoutOptions = { open: ["viz", "debug"], ratio: 0.4 };
var STARTER = `# \u9636\u6BB5\u4E00\uFF1A\u5207\u65AD\u5E26\u7535\u7684\u9EC4\u8272\u4E3B\u7535\u6E90\u7EBF
for wire in range(1, 9):
    color = get_color(wire)
    if color == "yellow" and get_voltage(wire) > 0:
        cut(wire)
        break

reset_probe()

# \u9636\u6BB5\u4E8C\uFF1A\u5207\u65AD\u5E26\u7535\u7684\u7EA2\u8272\u526F\u5F15\u4FE1
for wire in range(1, 9):
    color = get_color(wire)
    if color == "red" and get_voltage(wire) > 0:
        cut(wire)
        break`;
var CASE2_SOURCE = `# \u9636\u6BB5\u4E00\uFF1A\u5207\u65AD 0V \u7EFF\u8272\u63A5\u5730\u4FDD\u9669\u7EBF
for wire in range(1, 9):
    color = get_color(wire)
    if color == "green" and get_voltage(wire) == 0:
        cut(wire)
        break

reset_probe()

# \u9636\u6BB5\u4E8C\uFF1A\u5207\u65AD\u4E0D\u4F4E\u4E8E 60V \u7684\u84DD\u8272\u51B7\u5374\u7EBF
for wire in range(1, 9):
    color = get_color(wire)
    if color == "blue" and get_voltage(wire) >= 60:
        cut(wire)
        break`;
var CASE3_SOURCE = `# \u9636\u6BB5\u4E00\uFF1A\u5B89\u5168\u56DE\u8DEF
for wire in range(1, 9):
    color = get_color(wire)
    if color == "white" and get_voltage(wire) == 0:
        cut(wire)
        break

reset_probe()

# \u9636\u6BB5\u4E8C\uFF1A\u7A33\u538B\u7535\u6E90
for wire in range(1, 9):
    color = get_color(wire)
    voltage = get_voltage(wire) if color == "yellow" else -1
    if color == "yellow" and 20 <= voltage <= 40:
        cut(wire)
        break

reset_probe()

# \u9636\u6BB5\u4E09\uFF1A\u526F\u5F15\u4FE1
for wire in range(1, 9):
    color = get_color(wire)
    if color == "red" and get_voltage(wire) >= 100:
        cut(wire)
        break`;
var CASES = [
  {
    name: "\u6807\u51C6\u53CC\u4FDD\u9669",
    stages: [
      { label: "PWR", rule: "\u9EC4\u8272\uFF0C\u7535\u538B > 0V", color: "yellow", min: 0 },
      { label: "DET", rule: "\u7EA2\u8272\uFF0C\u7535\u538B > 0V", color: "red", min: 0 }
    ],
    wires: [
      { color: "blue", voltage: 0 },
      { color: "yellow", voltage: 48 },
      { color: "green", voltage: 12 },
      { color: "white", voltage: 0 },
      { color: "purple", voltage: 24 },
      { color: "red", voltage: 100 },
      { color: "orange", voltage: 0 },
      { color: "blue", voltage: 36 }
    ]
  },
  {
    name: "\u63A5\u5730\u540E\u51B7\u5374",
    stages: [
      { label: "GND", rule: "\u7EFF\u8272\uFF0C\u7535\u538B = 0V", color: "green", min: 0, minInclusive: true, max: 0, maxInclusive: true },
      { label: "COOL", rule: "\u84DD\u8272\uFF0C\u7535\u538B \u2265 60V", color: "blue", min: 60, minInclusive: true }
    ],
    wires: [
      { color: "red", voltage: 110 },
      { color: "green", voltage: 12 },
      { color: "blue", voltage: 48 },
      { color: "white", voltage: 0 },
      { color: "green", voltage: 0 },
      { color: "yellow", voltage: 24 },
      { color: "blue", voltage: 72 },
      { color: "purple", voltage: 0 }
    ]
  },
  {
    name: "\u4E09\u7EA7\u8054\u9501",
    stages: [
      { label: "SAFE", rule: "\u767D\u8272\uFF0C\u7535\u538B = 0V", color: "white", min: 0, minInclusive: true, max: 0, maxInclusive: true },
      { label: "PWR", rule: "\u9EC4\u8272\uFF0C20V \u2264 \u7535\u538B \u2264 40V", color: "yellow", min: 20, minInclusive: true, max: 40, maxInclusive: true },
      { label: "DET", rule: "\u7EA2\u8272\uFF0C\u7535\u538B \u2265 100V", color: "red", min: 100, minInclusive: true }
    ],
    wires: [
      { color: "red", voltage: 80 },
      { color: "white", voltage: 12 },
      { color: "yellow", voltage: 48 },
      { color: "green", voltage: 0 },
      { color: "white", voltage: 0 },
      { color: "yellow", voltage: 24 },
      { color: "red", voltage: 120 },
      { color: "blue", voltage: 60 }
    ]
  }
];
function preludeFor(testCase) {
  const stages = testCase.stages.map((stage2) => ({
    label: stage2.label,
    color: stage2.color,
    min: stage2.min ?? null,
    min_inclusive: stage2.minInclusive === true,
    max: stage2.max ?? null,
    max_inclusive: stage2.maxInclusive === true
  }));
  const literal = (value) => JSON.stringify(value).replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False").replace(/\bnull\b/g, "None");
  return `def __make_bomb():
    wires = ${JSON.stringify(testCase.wires)}
    stages = ${literal(stages)}
    log = []
    revealed = set()
    measured = set()
    cut_wires = []
    stage_index = 0
    mode = "search"
    probe = 0
    import _pico_runtime
    _pico_runtime.register_trace_resource("${RESOURCE}", log)

    def snapshot(action, message=""):
        log.append({"action": action, "message": message, "stage": stage_index, "mode": mode, "probe": probe,
                    "colors": [wire["color"] if index + 1 in revealed else "" for index, wire in enumerate(wires)],
                    "voltages": [wire["voltage"] if index + 1 in measured else None for index, wire in enumerate(wires)],
                    "cut": list(cut_wires)})

    def fail(message):
        nonlocal mode
        mode = "failed"
        snapshot("fail", message)
        raise RuntimeError(message)

    def check_index(index):
        if isinstance(index, bool) or not isinstance(index, int) or index < 1 or index > 8:
            fail("\u5BFC\u7EBF\u7F16\u53F7\u53EA\u80FD\u662F 1 \u5230 8")

    def require_search():
        if mode == "waiting": fail("\u526A\u7EBF\u540E\u63A2\u9488\u4ECD\u5728\u79FB\u52A8\uFF1B\u8BF7\u7528 break \u9000\u51FA\u5FAA\u73AF\uFF0C\u518D\u8C03\u7528 reset_probe()")
        if mode == "defused": fail("\u70B8\u5F39\u5DF2\u7ECF\u89E3\u9664\uFF0C\u4E0D\u80FD\u7EE7\u7EED\u63A2\u6D4B")
        if mode == "failed": raise RuntimeError("\u70B8\u5F39\u5DF2\u7ECF\u5F15\u7206")

    def get_color(index):
        nonlocal probe
        require_search()
        check_index(index)
        probe = index
        revealed.add(index)
        snapshot("color")
        return wires[index - 1]["color"]

    def get_voltage(index):
        require_search()
        check_index(index)
        if probe != index or index not in revealed:
            fail("\u5FC5\u987B\u5148\u628A\u63A2\u9488\u79FB\u52A8\u5230\u540C\u4E00\u6839\u5BFC\u7EBF\u5E76\u8BFB\u53D6\u989C\u8272")
        measured.add(index)
        snapshot("voltage")
        return wires[index - 1]["voltage"]

    def matches(stage, wire):
        value = wire["voltage"]
        if wire["color"] != stage["color"]: return False
        if stage["min"] is not None and (value < stage["min"] or (value == stage["min"] and not stage["min_inclusive"])): return False
        if stage["max"] is not None and (value > stage["max"] or (value == stage["max"] and not stage["max_inclusive"])): return False
        return True

    def cut(index):
        nonlocal stage_index, mode
        require_search()
        check_index(index)
        if probe != index or index not in measured:
            fail("\u526A\u7EBF\u524D\u5FC5\u987B\u5728\u540C\u4E00\u6839\u5BFC\u7EBF\u4E0A\u8BFB\u53D6\u989C\u8272\u548C\u7535\u538B")
        stage = stages[stage_index]
        wire = wires[index - 1]
        if not matches(stage, wire):
            fail(f"\u5F53\u524D\u9636\u6BB5 {stage['label']} \u4E0D\u63A5\u53D7 {index} \u53F7 {wire['color']} \u8272 {wire['voltage']}V \u5BFC\u7EBF")
        cut_wires.append(index)
        stage_index += 1
        mode = "defused" if stage_index == len(stages) else "waiting"
        snapshot("cut")

    def reset_probe():
        nonlocal mode, probe
        if mode != "waiting": fail("\u53EA\u6709\u5B8C\u6210\u975E\u6700\u7EC8\u9636\u6BB5\u540E\u624D\u80FD\u590D\u4F4D\u63A2\u9488")
        mode = "search"
        probe = 0
        snapshot("reset")

    return get_color, get_voltage, cut, reset_probe

get_color, get_voltage, cut, reset_probe = __make_bomb()`;
}
var bomb = stateful("bomb", (source2) => ({ source: source2, caseIndex: 0 }), [
  on("editor.changed", edit, []),
  on("python.run", run, ["python.execute"]),
  on("bomb.case.changed", selectCase, ["python.clear", "python.run"])
]);
function edit(state, event) {
  state.source = event.source;
}
function run(state, _event, { emit }) {
  emit({ type: "python.execute", source: new Source(state.source, { prelude: preludeFor(CASES[state.caseIndex]) }), options: {
    trace: { events: ["stmt", "call", "return"], observe: { globals: true, locals: true } },
    timeoutMs: 4e3,
    maxTraceSteps: 6e3
  } });
}
function selectCase(state, event, { emit }) {
  if (!Number.isInteger(event.caseIndex) || event.caseIndex < 0 || event.caseIndex >= CASES.length || event.caseIndex === state.caseIndex) return;
  state.caseIndex = event.caseIndex;
  emit({ type: "python.clear" });
  emit({ type: "python.run" });
}
function create(bus) {
  const course = bomb.create(STARTER, bus);
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
  standard: { create, events: [] },
  cooling: { create, events: [{ type: "editor.changed", source: CASE2_SOURCE }, { type: "bomb.case.changed", caseIndex: 1 }] },
  interlock: { create, events: [{ type: "editor.changed", source: CASE3_SOURCE }, { type: "bomb.case.changed", caseIndex: 2 }] }
};
function initialWorld() {
  return { colors: Array(8).fill(""), voltages: Array(8).fill(null), cut: [], stage: 0, mode: "search", probe: null, action: "initial", message: null };
}
function objectRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function bombWorldOf(state, trace, _caseIndex) {
  const initial = initialWorld();
  const count = state?.resources?.[RESOURCE] ?? 0;
  const record = objectRecord(count > 0 ? trace?.resources[RESOURCE]?.[count - 1] : null);
  if (record === null) return initial;
  const colors = Array.isArray(record.colors) ? record.colors.map((value) => typeof value === "string" ? value : "") : initial.colors;
  const voltages = Array.isArray(record.voltages) ? record.voltages.map((value) => typeof value === "number" ? value : null) : initial.voltages;
  const cut = Array.isArray(record.cut) ? record.cut.filter((value) => typeof value === "number") : [];
  const mode = record.mode === "waiting" || record.mode === "defused" || record.mode === "failed" ? record.mode : "search";
  return {
    colors,
    voltages,
    cut,
    stage: typeof record.stage === "number" ? record.stage : 0,
    mode,
    probe: typeof record.probe === "number" && record.probe > 0 ? record.probe : null,
    action: typeof record.action === "string" ? record.action : "initial",
    message: typeof record.message === "string" && record.message ? record.message : null
  };
}
function readBombWorld(position, trace, caseIndex) {
  return bombWorldOf(position?.state, trace, caseIndex);
}
function paceOf(position, trace) {
  const changed = (position.state.resources?.[RESOURCE] ?? 0) !== (position.previous.resources?.[RESOURCE] ?? 0);
  return position.atEnd ? 700 : changed ? 520 : 150;
}
var COLOR_LABEL = { blue: "\u84DD", yellow: "\u9EC4", green: "\u7EFF", white: "\u767D", purple: "\u7D2B", red: "\u7EA2", orange: "\u6A59" };
function BombPanel({ testCase, world }) {
  const x = (index) => 94 + index * 76;
  const stageState = (index) => index < world.stage ? "done" : index === world.stage && world.mode !== "defused" ? "active" : "later";
  return /* @__PURE__ */ jsxs("div", { className: "bomb-world", "data-mode": world.mode, children: [
    /* @__PURE__ */ jsxs("details", { className: "bomb-manual", children: [
      /* @__PURE__ */ jsxs("summary", { children: [
        /* @__PURE__ */ jsx("span", { children: "\u62C6\u5F39\u624B\u518C" }),
        /* @__PURE__ */ jsx("strong", { children: testCase.name })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bomb-manual-sheet", "aria-label": "\u62C6\u5F39\u624B\u518C", children: /* @__PURE__ */ jsx("ol", { children: testCase.stages.map((stage2, index) => /* @__PURE__ */ jsxs("li", { "data-state": stageState(index), children: [
        /* @__PURE__ */ jsx("i", { children: index + 1 }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("b", { children: stage2.label }),
          stage2.rule
        ] })
      ] }, stage2.label)) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bomb-machine", children: [
      /* @__PURE__ */ jsx("div", { className: "bomb-machine-status", "data-mode": world.mode, children: world.mode === "defused" ? "DEFUSED" : world.mode === "failed" ? "DETONATED" : "ARMED" }),
      /* @__PURE__ */ jsx("div", { className: "bomb-stage-lights", children: testCase.stages.map((stage2, index) => /* @__PURE__ */ jsxs("span", { "data-state": stageState(index), children: [
        /* @__PURE__ */ jsx("i", {}),
        stage2.label
      ] }, stage2.label)) }),
      /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 720 430", preserveAspectRatio: "xMidYMid meet", role: "img", "aria-label": world.mode === "defused" ? "\u70B8\u5F39\u5DF2\u89E3\u9664" : world.mode === "failed" ? "\u70B8\u5F39\u5DF2\u5F15\u7206" : "\u516B\u6839\u5F85\u68C0\u6D4B\u5BFC\u7EBF", children: [
        /* @__PURE__ */ jsx("rect", { className: "bomb-shell-shadow", x: "28", y: "27", width: "664", height: "378", rx: "28" }),
        /* @__PURE__ */ jsx("rect", { className: "bomb-shell", x: "24", y: "22", width: "672", height: "378", rx: "28" }),
        /* @__PURE__ */ jsx("rect", { className: "bomb-panel", x: "46", y: "88", width: "628", height: "280", rx: "18" }),
        /* @__PURE__ */ jsx("text", { className: "bomb-serial", x: "55", y: "64", children: "PICO \xB7 FIELD UNIT 08" }),
        [{ x: 45, y: 43 }, { x: 675, y: 43 }, { x: 45, y: 379 }, { x: 675, y: 379 }].map((point, index) => /* @__PURE__ */ jsxs("g", { className: "bomb-screw", transform: `translate(${point.x} ${point.y})`, children: [
          /* @__PURE__ */ jsx("circle", { r: "7" }),
          /* @__PURE__ */ jsx("path", { d: "M-3 0h6" })
        ] }, index)),
        /* @__PURE__ */ jsx("path", { className: "bomb-rail", d: "M64 122H656" }),
        /* @__PURE__ */ jsx("rect", { className: "bomb-safe-dock", x: "50", y: "106", width: "28", height: "32", rx: "7" }),
        /* @__PURE__ */ jsxs("g", { className: "bomb-probe", transform: `translate(${world.probe === null ? 64 : x(world.probe - 1)} 0)`, children: [
          /* @__PURE__ */ jsx("path", { d: "M0 101V151" }),
          /* @__PURE__ */ jsx("path", { d: "M-8 151L0 164l8-13" }),
          /* @__PURE__ */ jsx("circle", { cx: "0", cy: "101", r: "8" })
        ] }),
        testCase.wires.map((wire, index) => {
          const number = index + 1;
          const revealed = world.colors[index] !== "";
          const cut = world.cut.includes(number);
          const px = x(index);
          return /* @__PURE__ */ jsxs("g", { className: "bomb-wire", "data-color": revealed ? wire.color : "hidden", "data-cut": cut, "data-probed": world.probe === number, children: [
            /* @__PURE__ */ jsx("circle", { className: "bomb-terminal", cx: px, cy: "164", r: "13" }),
            /* @__PURE__ */ jsx("circle", { className: "bomb-terminal-core", cx: px, cy: "164", r: "5" }),
            /* @__PURE__ */ jsx("path", { className: "bomb-cable", d: cut ? `M${px} 177C${px - 10} 202 ${px + 8} 220 ${px - 3} 240` : `M${px} 177C${px - 13} 220 ${px + 13} 280 ${px} 329` }),
            cut && /* @__PURE__ */ jsx("path", { className: "bomb-cable", d: `M${px + 4} 267C${px - 7} 290 ${px + 8} 311 ${px} 329` }),
            cut && /* @__PURE__ */ jsxs("g", { className: "bomb-cut", transform: `translate(${px} 253)`, children: [
              /* @__PURE__ */ jsx("path", { d: "M-13-10L10 12M13-10L-10 12" }),
              /* @__PURE__ */ jsx("circle", { cx: "-13", cy: "-10", r: "4" }),
              /* @__PURE__ */ jsx("circle", { cx: "13", cy: "-10", r: "4" })
            ] }),
            /* @__PURE__ */ jsxs("g", { className: "bomb-socket", children: [
              /* @__PURE__ */ jsx("rect", { x: px - 25, y: "328", width: "50", height: "34", rx: "9" }),
              /* @__PURE__ */ jsx("circle", { cx: px, cy: "345", r: "7" })
            ] }),
            world.voltages[index] !== null && /* @__PURE__ */ jsxs("g", { className: "bomb-voltage", children: [
              /* @__PURE__ */ jsx("rect", { x: px - 25, y: "191", width: "50", height: "25", rx: "6" }),
              /* @__PURE__ */ jsxs("text", { x: px, y: "208", children: [
                world.voltages[index],
                "V"
              ] })
            ] }),
            /* @__PURE__ */ jsx("text", { className: "bomb-number", x: px, y: "389", children: number }),
            revealed && /* @__PURE__ */ jsx("text", { className: "bomb-color-name", x: px, y: "410", children: COLOR_LABEL[wire.color] })
          ] }, number);
        }),
        /* @__PURE__ */ jsxs("g", { className: "bomb-stamp", "data-visible": world.mode === "defused" || world.mode === "failed", "data-kind": world.mode, transform: "translate(360 265) rotate(-7)", children: [
          /* @__PURE__ */ jsx("rect", { x: "-112", y: "-34", width: "224", height: "68", rx: "9" }),
          /* @__PURE__ */ jsx("text", { y: "11", children: world.mode === "defused" ? "DEFUSED" : "DETONATED" })
        ] })
      ] }),
      world.message && /* @__PURE__ */ jsx("div", { className: "bomb-error", role: "alert", children: world.message })
    ] })
  ] });
}
var STYLE = `
.bomb-world { position:relative; width:100%; height:100%; min-height:0; background:var(--pico-surface); }
.bomb-manual { position:absolute; z-index:4; top:12px; left:14px; color:var(--pico-ink); font:650 var(--pico-size-xs)/1.3 var(--pico-font-ui); }
.bomb-manual[open] { width:min(430px,calc(100% - 28px)); }
.bomb-manual summary { display:inline-flex; align-items:center; gap:8px; height:31px; padding:0 10px; border:var(--pico-line); border-radius:8px; color:var(--pico-accent-deep); background:color-mix(in srgb,var(--pico-surface-raised) 94%,transparent); box-shadow:var(--pico-shadow); cursor:pointer; list-style:none; }
.bomb-manual summary::-webkit-details-marker { display:none; }.bomb-manual summary::before { content:"?"; display:grid; place-items:center; width:17px; height:17px; border:1px solid currentColor; border-radius:50%; font:800 11px/1 var(--pico-font-ui); }
.bomb-manual summary strong { color:var(--pico-ink-soft); font-weight:600; }.bomb-manual[open] summary { border-color:var(--pico-accent); background:var(--pico-surface-raised); }
.bomb-manual-sheet { margin-top:7px; padding:12px; border:var(--pico-line); border-radius:10px; background:color-mix(in srgb,var(--pico-surface-raised) 97%,transparent); box-shadow:var(--pico-shadow-float); backdrop-filter:blur(10px); }
.bomb-manual ol { margin:0; padding:0; list-style:none; display:grid; gap:8px; }
.bomb-manual li { min-width:0; display:grid; grid-template-columns:26px 1fr; gap:8px; align-items:center; padding:8px 10px; border:var(--pico-line); border-radius:var(--pico-radius); color:var(--pico-ink-soft); background:var(--pico-surface); font:550 var(--pico-size-xs)/1.35 var(--pico-font-ui); }
.bomb-manual li i { display:grid; place-items:center; width:24px; height:24px; border-radius:50%; color:var(--pico-ink-soft); background:var(--pico-surface-raised); font-style:normal; font-weight:750; }
.bomb-manual li span { min-width:0; }.bomb-manual li b { display:block; color:inherit; letter-spacing:.06em; }
.bomb-manual li[data-state="active"] { color:var(--pico-hue-loop-ink); border-color:var(--pico-hue-loop-strong); background:var(--pico-hue-loop-bg); }
.bomb-manual li[data-state="done"] { color:var(--pico-hue-branch-ink); border-color:var(--pico-hue-branch-strong); background:var(--pico-hue-branch-bg); }
.bomb-machine { position:relative; width:100%; height:100%; min-width:0; min-height:0; display:grid; place-items:center; padding:52px 14px 8px; overflow:hidden; background-image:linear-gradient(color-mix(in srgb,var(--pico-hairline) 34%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--pico-hairline) 34%,transparent) 1px,transparent 1px); background-size:24px 24px; }
.bomb-machine svg { display:block; width:100%; height:100%; min-width:0; min-height:0; filter:drop-shadow(0 12px 22px color-mix(in srgb,var(--pico-ink) 14%,transparent)); }
.bomb-machine-status { position:absolute; top:15px; left:50%; transform:translateX(-50%); padding:6px 10px; border:1px solid var(--pico-hue-error-strong); border-radius:6px; color:var(--pico-hue-error-ink); background:var(--pico-hue-error-bg); font:800 12px/1 var(--pico-font-mono); letter-spacing:.12em; }
.bomb-machine-status[data-mode="defused"] { color:var(--pico-hue-branch-ink); border-color:var(--pico-hue-branch-strong); background:var(--pico-hue-branch-bg); }
.bomb-stage-lights { position:absolute; top:12px; right:18px; display:flex; gap:7px; }
.bomb-stage-lights span { display:flex; align-items:center; gap:6px; padding:6px 9px; border:var(--pico-line); border-radius:999px; color:var(--pico-ink-soft); background:var(--pico-surface-raised); font:750 12px/1 var(--pico-font-ui); letter-spacing:.04em; }
.bomb-stage-lights i { width:7px; height:7px; border-radius:50%; background:var(--pico-hairline); box-shadow:0 0 0 2px var(--pico-surface); }
.bomb-stage-lights span[data-state="active"] { color:var(--pico-hue-loop-ink); border-color:var(--pico-hue-loop-strong); }.bomb-stage-lights span[data-state="active"] i { background:var(--pico-hue-loop-strong); box-shadow:0 0 7px var(--pico-hue-loop-strong); }
.bomb-stage-lights span[data-state="done"] { color:var(--pico-hue-branch-ink); border-color:var(--pico-hue-branch-strong); }.bomb-stage-lights span[data-state="done"] i { background:var(--pico-hue-branch-strong); }
.bomb-shell-shadow { fill:color-mix(in srgb,var(--pico-ink) 16%,transparent); }.bomb-shell { fill:var(--pico-surface-raised); stroke:var(--pico-ink-soft); stroke-width:3; }.bomb-panel { fill:var(--pico-code-bg); stroke:var(--pico-hairline); stroke-width:2; }
.bomb-serial { fill:var(--pico-ink-soft); font:700 12px/1 var(--pico-font-mono); letter-spacing:.12em; }
.bomb-screw circle { fill:var(--pico-surface); stroke:var(--pico-hairline); }.bomb-screw path { stroke:var(--pico-ink-soft); stroke-width:2; }
.bomb-rail { fill:none; stroke:var(--pico-ink-soft); stroke-width:10; stroke-linecap:round; }.bomb-safe-dock { fill:var(--pico-accent-wash); stroke:var(--pico-accent-deep); stroke-width:2; }
.bomb-probe { transition:transform var(--pico-duration-move) var(--pico-ease-out); }
.bomb-probe path,.bomb-probe circle { fill:var(--pico-surface-raised); stroke:var(--pico-accent-deep); stroke-width:4; stroke-linejoin:round; }
.bomb-terminal { fill:var(--pico-surface); stroke:var(--pico-ink-soft); stroke-width:4; }.bomb-terminal-core { fill:var(--pico-ink-soft); }.bomb-wire[data-probed="true"] .bomb-terminal { stroke:var(--pico-accent); filter:drop-shadow(0 0 7px var(--pico-accent)); }
.bomb-cable { fill:none; stroke:#64748b; stroke-width:15; stroke-linecap:round; }
.bomb-wire[data-color="blue"] .bomb-cable { stroke:#2584d8; }.bomb-wire[data-color="yellow"] .bomb-cable { stroke:#e4b51e; }.bomb-wire[data-color="green"] .bomb-cable { stroke:#279b62; }
.bomb-wire[data-color="white"] .bomb-cable { stroke:#e9eef5; }.bomb-wire[data-color="purple"] .bomb-cable { stroke:#8b5ed7; }.bomb-wire[data-color="red"] .bomb-cable { stroke:#d94a4a; }.bomb-wire[data-color="orange"] .bomb-cable { stroke:#dd7d27; }
.bomb-cut path { fill:none; stroke:var(--pico-hue-error-strong); stroke-width:3; }.bomb-cut circle { fill:var(--pico-surface-raised); stroke:var(--pico-hue-error-strong); stroke-width:3; }
.bomb-socket rect { fill:var(--pico-surface); stroke:var(--pico-ink-soft); stroke-width:2; }.bomb-socket circle { fill:var(--pico-ink-soft); }
.bomb-voltage rect { fill:var(--pico-surface-raised); stroke:var(--pico-accent-deep); stroke-width:1.5; }.bomb-voltage text,.bomb-number,.bomb-color-name { text-anchor:middle; fill:var(--pico-ink); font:650 12px/1 var(--pico-font-ui); }
.bomb-number { font:800 16px/1 var(--pico-font-mono); }.bomb-color-name { fill:var(--pico-ink-soft); }
.bomb-stamp { opacity:0; transition:opacity var(--pico-duration-move),transform var(--pico-duration-move); }
.bomb-stamp[data-visible="true"] { opacity:1; }.bomb-stamp rect { fill:color-mix(in srgb,var(--pico-surface-raised) 86%,transparent); stroke:var(--pico-hue-error-strong); stroke-width:5; }
.bomb-stamp text { text-anchor:middle; fill:var(--pico-hue-error-strong); font:850 29px/1 var(--pico-font-ui); letter-spacing:.08em; }
.bomb-stamp[data-kind="defused"] rect { stroke:var(--pico-hue-branch-strong); }.bomb-stamp[data-kind="defused"] text { fill:var(--pico-hue-branch-strong); }
.bomb-error { position:absolute; inset:auto 16px 14px; padding:8px 12px; border-radius:var(--pico-radius); color:var(--pico-hue-error-ink); background:var(--pico-hue-error-bg); font:600 var(--pico-size-xs)/1.4 var(--pico-font-ui); }
@media(max-width:800px){.bomb-manual li{padding:6px 8px}.bomb-manual summary strong{display:none}.bomb-stage-lights span{padding:6px}.bomb-machine{padding-inline:6px}}
`;
var mountOptions = { ...pythonOptions({ playback: { stepMs: 150, stepMsFor: paceOf } }), filename: "bomb.py", layout: layoutOptions, automatic: 500, start: [{ type: "python.run" }] };
var starter = STARTER;
var BOMB_SCRIPT = bomb_script_default;
var courseState = provided2("bomb.state");
var BOMB_SESSION = pythonSession({
  world: { title: "\u63A7\u5236\u7BB1", render: (view) => {
    const state = view.get(courseState);
    const playing = view.get(playbackHost2);
    return /* @__PURE__ */ jsxs("div", { className: "pico-scene", children: [
      /* @__PURE__ */ jsx("style", { children: STYLE }),
      /* @__PURE__ */ jsx(BombPanel, { testCase: CASES[state.caseIndex], world: readBombWorld(playing?.position ?? null, playing?.trace ?? null, state.caseIndex) })
    ] });
  } },
  domain: [caseChoices({
    id: "bomb.case",
    label: "\u578B\u53F7",
    state: courseState,
    current: (state) => String(state.caseIndex),
    choices: CASES.map((item, index) => ({ value: String(index), label: String(index + 1), title: item.name })),
    event: (value) => ({ type: "bomb.case.changed", caseIndex: Number(value) })
  })],
  provide: (view) => [courseState.with(view.state)],
  ai: courseAi({
    explain: "\u8FD9\u4E00\u53E5\u5728\u6309\u624B\u518C\u7684\u67D0\u4E2A\u9636\u6BB5\u5904\u7406\u7EBF\u8DEF\uFF1A\u5FAA\u73AF\u9010\u6839\u68C0\u67E5\uFF0C\u6761\u4EF6\u5224\u65AD\u51B3\u5B9A\u526A\u4E0D\u526A\uFF1B\u5BF9\u7167\u53F3\u8FB9\u63A7\u5236\u7BB1\u4E0A\u8FD9\u6839\u7EBF\u7684\u989C\u8272\u548C\u72B6\u6001\u3002",
    question: "\u5148\u8BFB\u624B\u518C\u7684\u6BCF\u4E2A\u9636\u6BB5\u8981\u6C42\u4EC0\u4E48\uFF0C\u518D\u770B\u4EE3\u7801\u91CC\u5BF9\u5E94\u7684\u5FAA\u73AF\u548C\u6761\u4EF6\u3002\u8FD0\u884C\u540E\u5728\u63A7\u5236\u7BB1\u4E0A\u9010\u6B65\u89C2\u5BDF\u54EA\u6839\u7EBF\u88AB\u526A\u3001\u4E3A\u4EC0\u4E48\u3002"
  }),
  scripts: [BOMB_SCRIPT]
});
var BOMB_COURSE = {
  name: "\u62C6\u5F39\u4E13\u5BB6",
  component: bomb,
  starter: STARTER,
  playground: mountOptions,
  session: BOMB_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: BOMB_COURSE, host });
}
export {
  BOMB_COURSE,
  BOMB_SCRIPT,
  BOMB_SESSION,
  CASE2_SOURCE,
  CASE3_SOURCE,
  CASES,
  Root,
  STARTER,
  bomb,
  examples,
  paceOf,
  readBombWorld,
  starter
};
