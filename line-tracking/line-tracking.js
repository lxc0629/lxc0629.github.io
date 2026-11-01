// playgrounds/line-tracking/line-tracking.generated.tsx
import { useEffect, useRef } from "../libs/react.js";
import * as THREE from "../libs/three.js";
import { OrbitControls } from "../libs/three.js";
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

// playgrounds/line-tracking/line-tracking.generated.tsx
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

// playgrounds/line-tracking/line-tracking.script.json
var line_tracking_script_default = {
  id: "line-tracking",
  title: "\u4ECE\u4F20\u611F\u5668\u89C4\u5219\u5199\u51FA\u5DE1\u7EBF\u7A0B\u5E8F",
  from: "",
  mode: "instruction",
  auto: true,
  steps: [
    { title: "\u5148\u5199\u6301\u7EED\u5DE5\u4F5C\u7684\u63A7\u5236\u5FAA\u73AF", concepts: ["loop", "motion"], stage: { panels: ["viz"] }, say: [{ say: "\u673A\u5668\u4EBA\u4E0D\u77E5\u9053\u6574\u5F20\u5730\u56FE\uFF0C\u53EA\u80FD\u53CD\u590D\u89C2\u5BDF\u5F53\u524D\u4F4D\u7F6E\u3002\u53EA\u8981\u8FD8\u6CA1\u5230\u7EC8\u70B9\uFF0C\u5C31\u7EE7\u7EED\u4E00\u8F6E\u201C\u8BFB\u53D6\u2014\u5224\u65AD\u2014\u884C\u52A8\u201D\u3002", write: "while not at_goal():\n" }, { say: "\u6BCF\u8F6E\u540C\u65F6\u8BFB\u53D6\u5DE6\u53F3\u63A2\u5934\uFF1B\u5143\u7EC4\u62C6\u5305\u8BA9\u4E24\u4E2A\u8BFB\u6570\u6709\u6E05\u695A\u7684\u540D\u5B57\u3002", write: "while not at_goal():\n    left, right = get_sensors()\n" }] },
    { title: "\u53CC\u767D\u65F6\u4FDD\u6301\u76F4\u884C", concepts: ["branch", "motion"], say: [{ say: "\u4E24\u53EA\u63A2\u5934\u90FD\u662F\u767D\u8272\uFF0C\u8BF4\u660E\u9ED1\u7EBF\u5728\u8F66\u8EAB\u4E2D\u592E\u3002\u7528 and \u8868\u793A\u4E24\u4E2A\u6761\u4EF6\u5FC5\u987B\u540C\u65F6\u6210\u7ACB\u3002", write: 'while not at_goal():\n    left, right = get_sensors()\n\n    if left == "white" and right == "white":\n        forward()\n' }] },
    { title: "\u5148\u5904\u7406\u53CC\u9ED1\u8DEF\u53E3", concepts: ["branch", "motion"], say: [{ say: "\u53CC\u9ED1\u662F\u5341\u5B57\u8DEF\u53E3\uFF0C\u672C\u8BFE\u89C4\u5B9A\u5DE6\u8F6C\u3002\u5148\u8F6C\u5411\uFF0C\u518D\u524D\u8FDB\u4E00\u6B65\u3002\u8FD9\u4E2A\u7279\u6B8A\u60C5\u51B5\u5FC5\u987B\u5199\u5728\u66F4\u5BBD\u6CDB\u7684 or \u5206\u652F\u524D\u9762\u3002", write: 'while not at_goal():\n    left, right = get_sensors()\n\n    if left == "white" and right == "white":\n        forward()\n    elif left == "black" and right == "black":\n        turn_left()\n        forward()\n' }] },
    { title: "\u5355\u4FA7\u538B\u7EBF\u65F6\u4FEE\u6B63\u65B9\u5411", concepts: ["branch", "motion"], say: [{ say: "\u5269\u4E0B\u7684\u9ED1\u8272\u8BFB\u6570\u8868\u793A\u81F3\u5C11\u4E00\u4FA7\u538B\u7EBF\u3002\u5916\u5C42 or \u5224\u65AD\u9700\u8981\u4FEE\u6B63\uFF0C\u5185\u5C42 if \u51B3\u5B9A\u5411\u54EA\u8FB9\u8F6C\u3002", write: 'while not at_goal():\n    left, right = get_sensors()\n\n    if left == "white" and right == "white":\n        forward()\n    elif left == "black" and right == "black":\n        turn_left()\n        forward()\n    elif left == "black" or right == "black":\n        if left == "black":\n            turn_left()\n        else:\n            turn_right()\n        forward()\n' }] },
    { title: "\u8FD0\u884C\u5B8C\u6574\u63A7\u5236\u5668", concepts: ["loop", "motion"], stage: { panels: ["viz", "debug"], focus: "viz" }, do: [{ action: "code.run" }], say: "\u8FD0\u884C\u65F6\uFF0C\u540C\u4E00\u4EFD\u7A0B\u5E8F\u4F1A\u5728\u8BB8\u591A\u8F6E\u5FAA\u73AF\u4E2D\u53CD\u590D\u4F7F\u7528\u3002\u5730\u56FE\u4E0D\u540C\uFF0C\u63A7\u5236\u89C4\u5219\u4E0D\u53D8\uFF1B\u8FD9\u5C31\u662F\u7528\u53CD\u9988\u800C\u4E0D\u662F\u8BB0\u8DEF\u7EBF\u63A7\u5236\u673A\u5668\u4EBA\u3002" },
    { title: "Debugger \u770B\u7B2C\u4E00\u8F6E\u53CD\u9988", concepts: ["debug", "motion"], stage: { panels: ["viz", "debug"], focus: "debug" }, do: [{ action: "code.locate", args: { line: 2, occurrence: 1 } }, { action: "annotation.show", args: { kind: "mark", at: { variable: "left" } } }, { action: "annotation.show", args: { kind: "mark", at: { variable: "right" } } }], say: "\u505C\u5728\u7B2C\u4E00\u6B21\u8BFB\u53D6\u540E\uFF0C\u5BF9\u7167\u53D8\u91CF\u680F\u7684 left\u3001right \u4E0E\u8F66\u5934\u63A2\u5934\u3002\u7EE7\u7EED\u5355\u6B65\uFF0C\u770B\u7A0B\u5E8F\u53EA\u8FDB\u5165\u4E00\u4E2A\u5206\u652F\uFF0C\u518D\u6267\u884C forward\u3002" },
    { title: "\u770B\u540C\u4E00\u53E5\u4EE3\u7801\u6267\u884C\u5F88\u591A\u6B21", concepts: ["debug", "loop", "motion"], do: [{ action: "code.locate", args: { line: 2, occurrence: 6 } }], say: "\u73B0\u5728\u5B9A\u4F4D\u5230\u540C\u4E00\u884C\u7684\u7B2C 6 \u6B21\u6267\u884C\u3002\u6E90\u7801\u6CA1\u6709\u590D\u5236\u516D\u4EFD\uFF0C\u662F while \u8BA9\u7A0B\u5E8F\u56DE\u5230\u8FD9\u91CC\uFF1B\u53D8\u91CF\u503C\u548C\u5C0F\u8F66\u4F4D\u7F6E\u5374\u5DF2\u7ECF\u53D8\u5316\u3002\u8FD9\u6B63\u662F\u5FAA\u73AF\u590D\u7528\u89C4\u5219\u7684\u610F\u4E49\u3002" },
    { title: "\u6545\u610F\u7406\u89E3\u5206\u652F\u987A\u5E8F", concepts: ["branch", "motion"], stage: { panels: ["viz", "debug"], focus: "debug" }, say: "\u53CC\u9ED1\u540C\u65F6\u6EE1\u8DB3\u201C\u5DE6\u9ED1\u6216\u53F3\u9ED1\u201D\u3002\u5982\u679C\u628A or \u5206\u652F\u63D0\u524D\uFF0C\u5341\u5B57\u8DEF\u53E3\u4F1A\u88AB\u5F53\u6210\u666E\u901A\u5355\u4FA7\u4FEE\u6B63\u3002\u6761\u4EF6\u4ECE\u7279\u6B8A\u5230\u4E00\u822C\u6392\u5217\uFF0C\u662F\u63A7\u5236\u7A0B\u5E8F\u6B63\u786E\u6027\u7684\u7EC4\u6210\u90E8\u5206\u3002" },
    { title: "\u56DE\u987E\u63A7\u5236\u601D\u60F3", concepts: ["loop", "branch", "motion"], say: "\u6BCF\u4E00\u8F6E\u90FD\u662F\uFF1A\u8BFB\u53D6\u4E8B\u5B9E \u2192 \u6309\u4F18\u5148\u7EA7\u5206\u7C7B \u2192 \u9009\u62E9\u52A8\u4F5C \u2192 \u524D\u8FDB\u4E00\u6B65\u3002Debugger \u5C55\u793A\u63A7\u5236\u6D41\uFF0CWorld \u5C55\u793A\u52A8\u4F5C\u540E\u679C\uFF1B\u628A\u4E24\u8005\u5BF9\u7167\uFF0C\u624D\u80FD\u770B\u89C1\u4EE3\u7801\u600E\u6837\u6210\u4E3A\u771F\u5B9E\u63A7\u5236\u7B56\u7565\u3002" }
  ]
};

// playgrounds/line-tracking/line-tracking.generated.tsx
import { jsx, jsxs } from "../libs/react.js";
var RESOURCE = "robot";
var layoutOptions = { open: ["viz", "debug"], ratio: 0.4 };
var STARTER = `while not at_goal():
    left, right = get_sensors()

    if left == "white" and right == "white":
        forward()
    elif left == "black" and right == "black":
        turn_left()
        forward()
    elif left == "black" or right == "black":
        if left == "black":
            turn_left()
        else:
            turn_right()
        forward()`;
var VECTOR = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] };
var ORDER = ["N", "E", "S", "W"];
function turnBetween(from, to) {
  const delta = (ORDER.indexOf(to) - ORDER.indexOf(from) + 4) % 4;
  if (delta === 0) return "straight";
  if (delta === 3) return "left";
  if (delta === 1) return "right";
  throw new Error(`\u8DEF\u7EBF\u4E0D\u80FD\u5728\u4E00\u4E2A\u683C\u70B9\u6389\u5934\uFF1A${from} -> ${to}`);
}
function buildRoute(name, setting, segments) {
  if (segments.length === 0) throw new Error("\u8DEF\u7EBF\u81F3\u5C11\u9700\u8981\u4E00\u6BB5");
  const points = [{ x: 0, z: 0 }];
  const actions = ["straight"];
  const headings = [segments[0].direction];
  const branches = [];
  let heading = segments[0].direction;
  let turns = 0;
  let junctions = 0;
  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const segment = segments[segmentIndex];
    if (segmentIndex > 0) {
      const turn = turnBetween(heading, segment.direction);
      if (turn === "straight") throw new Error("\u76F8\u90BB\u540C\u5411\u8DEF\u7EBF\u6BB5\u5E94\u5408\u5E76");
      turns += 1;
      if (segment.junction) {
        if (turn !== "left") throw new Error("\u5341\u5B57\u8DEF\u53E3\u5FC5\u987B\u9075\u5FAA\u5DE6\u8F6C\u89C4\u5219");
        actions[actions.length - 1] = "junction";
        junctions += 1;
        const from = points.at(-1);
        const [sx, sz] = VECTOR[heading];
        const right = ORDER[(ORDER.indexOf(heading) + 1) % 4];
        const [rx, rz] = VECTOR[right];
        branches.push({ from, to: { x: from.x + sx * 2, z: from.z + sz * 2 } });
        branches.push({ from, to: { x: from.x + rx * 2, z: from.z + rz * 2 } });
      } else actions[actions.length - 1] = turn;
    }
    const [dx, dz] = VECTOR[segment.direction];
    for (let step = 0; step < segment.length; step += 1) {
      const from = points.at(-1);
      points.push({ x: from.x + dx, z: from.z + dz });
      actions.push("straight");
      headings.push(segment.direction);
    }
    heading = segment.direction;
  }
  actions[actions.length - 1] = "goal";
  return { name, setting, points, actions, headings, branches, turns, junctions };
}
var ROUTES = [
  buildRoute("\u5C71\u8C37\u86C7\u5F62\u7EBF", "\u5C71\u8C37", [
    { direction: "E", length: 5 },
    { direction: "N", length: 3 },
    { direction: "W", length: 5 },
    { direction: "N", length: 3 },
    { direction: "E", length: 5 },
    { direction: "N", length: 3 },
    { direction: "W", length: 5 },
    { direction: "N", length: 3 }
  ]),
  buildRoute("\u5DE5\u5382\u8FD0\u8F93\u7EBF", "\u5DE5\u5382", [
    { direction: "E", length: 6 },
    { direction: "N", length: 3, junction: true },
    { direction: "W", length: 6, junction: true },
    { direction: "N", length: 3 },
    { direction: "E", length: 6 },
    { direction: "N", length: 3, junction: true },
    { direction: "W", length: 6 },
    { direction: "N", length: 3 },
    { direction: "E", length: 6 }
  ]),
  buildRoute("\u57CE\u5E02\u5DE1\u68C0\u73AF\u7EBF", "\u57CE\u5E02", [
    { direction: "E", length: 7 },
    { direction: "N", length: 3, junction: true },
    { direction: "W", length: 7, junction: true },
    { direction: "N", length: 3 },
    { direction: "E", length: 7 },
    { direction: "N", length: 3, junction: true },
    { direction: "W", length: 7, junction: true },
    { direction: "N", length: 3 },
    { direction: "E", length: 7 },
    { direction: "N", length: 3, junction: true },
    { direction: "W", length: 7 },
    { direction: "N", length: 3 },
    { direction: "E", length: 7 }
  ])
];
function preludeFor(route) {
  return `def __make_robot():
    points = ${JSON.stringify(route.points.map((point) => [point.x, point.z]))}
    actions = ${JSON.stringify(route.actions)}
    headings = ${JSON.stringify(route.headings)}
    log = []
    index = 0
    facing = headings[0]
    turned = False
    failed = False
    import _pico_runtime
    _pico_runtime.register_trace_resource("${RESOURCE}", log)

    def sensors():
        action = actions[index]
        if action == "junction": return ("black", "black")
        if action == "left": return ("black", "white")
        if action == "right": return ("white", "black")
        return ("white", "white")

    def snapshot(action, message=""):
        left, right = sensors()
        x, z = points[index]
        log.append({"action": action, "index": index, "x": x, "z": z, "heading": facing,
                    "left": left, "right": right, "goal": index == len(points) - 1,
                    "failed": failed, "message": message})

    def fail(message):
        nonlocal failed
        failed = True
        snapshot("fail", message)
        raise RuntimeError(message)

    def ensure_active():
        if failed: raise RuntimeError("\u5C0F\u8F66\u5DF2\u7ECF\u8131\u8F68")
        if index == len(points) - 1: fail("\u5C0F\u8F66\u5DF2\u7ECF\u5230\u8FBE\u7EC8\u70B9\uFF0C\u4E0D\u80FD\u7EE7\u7EED\u64CD\u4F5C")

    def get_sensors():
        ensure_active()
        snapshot("sensors")
        return sensors()

    def turn_left():
        nonlocal facing, turned
        ensure_active()
        if turned or actions[index] not in ("left", "junction"):
            fail("\u5DE6\u8F6C\u540E\u524D\u65B9\u6CA1\u6709\u5BFC\u8F68\uFF0C\u5C0F\u8F66\u8131\u8F68")
        facing = {"N": "W", "W": "S", "S": "E", "E": "N"}[facing]
        turned = True
        snapshot("turn_left")

    def turn_right():
        nonlocal facing, turned
        ensure_active()
        if turned or actions[index] != "right":
            fail("\u53F3\u8F6C\u540E\u524D\u65B9\u6CA1\u6709\u5BFC\u8F68\uFF0C\u5C0F\u8F66\u8131\u8F68")
        facing = {"N": "E", "E": "S", "S": "W", "W": "N"}[facing]
        turned = True
        snapshot("turn_right")

    def forward():
        nonlocal index, turned
        ensure_active()
        expected = actions[index]
        if expected == "straight" and turned:
            fail("\u76F4\u7EBF\u8DEF\u6BB5\u4E0D\u5E94\u8F6C\u5411\uFF0C\u5C0F\u8F66\u8131\u8F68")
        if expected in ("left", "right", "junction") and not turned:
            fail("\u524D\u65B9\u5BFC\u8F68\u5DF2\u7ECF\u8F6C\u5F2F\uFF0C\u5C0F\u8F66\u76F4\u884C\u8131\u8F68")
        index += 1
        turned = False
        snapshot("forward")

    def at_goal():
        return index == len(points) - 1

    return get_sensors, forward, turn_left, turn_right, at_goal

get_sensors, forward, turn_left, turn_right, at_goal = __make_robot()`;
}
var lineTracking = stateful("line-tracking", (source2) => ({ source: source2, routeIndex: 0 }), [
  on("editor.changed", edit, []),
  on("python.run", run, ["python.execute"]),
  on("line-tracking.route.changed", selectRoute, ["python.clear", "python.run"])
]);
function edit(state, event) {
  state.source = event.source;
}
function run(state, _event, { emit }) {
  emit({ type: "python.execute", source: new Source(state.source, { prelude: preludeFor(ROUTES[state.routeIndex]) }), options: {
    trace: { events: ["stmt", "call", "return"], observe: { globals: true, locals: true } },
    timeoutMs: 5e3,
    maxTraceSteps: 2e4
  } });
}
function selectRoute(state, event, { emit }) {
  if (!Number.isInteger(event.routeIndex) || event.routeIndex < 0 || event.routeIndex >= ROUTES.length || event.routeIndex === state.routeIndex) return;
  state.routeIndex = event.routeIndex;
  emit({ type: "python.clear" });
  emit({ type: "python.run" });
}
function create(bus) {
  const course = lineTracking.create(STARTER, bus);
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
  valley: { create, events: [] },
  factory: { create, events: [{ type: "line-tracking.route.changed", routeIndex: 1 }] },
  city: { create, events: [{ type: "line-tracking.route.changed", routeIndex: 2 }] }
};
function initialWorld(route) {
  const point = route.points[0];
  return { index: 0, x: point.x, z: point.z, heading: route.headings[0], left: "white", right: "white", action: "initial", goal: false, failed: false, message: null };
}
function objectRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function robotWorldOf(state, trace, routeIndex) {
  const base = initialWorld(ROUTES[routeIndex] ?? ROUTES[0]);
  const count = state?.resources?.[RESOURCE] ?? 0;
  const record = objectRecord(count > 0 ? trace?.resources[RESOURCE]?.[count - 1] : null);
  if (record === null) return base;
  const heading = record.heading === "N" || record.heading === "E" || record.heading === "S" || record.heading === "W" ? record.heading : base.heading;
  return {
    index: typeof record.index === "number" ? record.index : 0,
    x: typeof record.x === "number" ? record.x : base.x,
    z: typeof record.z === "number" ? record.z : base.z,
    heading,
    left: record.left === "black" ? "black" : "white",
    right: record.right === "black" ? "black" : "white",
    action: typeof record.action === "string" ? record.action : "initial",
    goal: record.goal === true,
    failed: record.failed === true,
    message: typeof record.message === "string" && record.message ? record.message : null
  };
}
function readRobotWorld(position, trace, routeIndex) {
  return robotWorldOf(position?.state, trace, routeIndex);
}
function paceOf(position, trace) {
  const changed = (position.state.resources?.[RESOURCE] ?? 0) !== (position.previous.resources?.[RESOURCE] ?? 0);
  return position.atEnd ? 700 : changed ? 380 : 130;
}
var HEADING_ANGLE = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 };
function boundsOf(route) {
  const all = [...route.points, ...route.branches.flatMap((branch) => [branch.from, branch.to])];
  const xs = all.map((point) => point.x);
  const zs = all.map((point) => point.z);
  return { minX: Math.floor(Math.min(...xs)) - 2, maxX: Math.ceil(Math.max(...xs)) + 2, minZ: Math.floor(Math.min(...zs)) - 2, maxZ: Math.ceil(Math.max(...zs)) + 2 };
}
var VoxelRouteScene = class {
  #renderer;
  #scene = new THREE.Scene();
  #camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  #controls;
  #car = new THREE.Group();
  #leftSensor;
  #rightSensor;
  #trail;
  #route;
  #center;
  #target = new THREE.Vector3();
  #mapWidth;
  #mapDepth;
  #targetAngle = 0;
  #raf = 0;
  constructor(host, route) {
    this.#route = route;
    const bounds = boundsOf(route);
    this.#center = new THREE.Vector3((bounds.minX + bounds.maxX) / 2, 0, -(bounds.minZ + bounds.maxZ) / 2);
    this.#mapWidth = bounds.maxX - bounds.minX + 1;
    this.#mapDepth = bounds.maxZ - bounds.minZ + 1;
    this.#renderer = new THREE.WebGLRenderer({ antialias: true });
    this.#renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.#renderer.shadowMap.enabled = true;
    host.append(this.#renderer.domElement);
    this.#scene.background = new THREE.Color(15397879);
    this.#scene.add(new THREE.HemisphereLight(16777215, 6320237, 2.2));
    const sun = new THREE.DirectionalLight(16777215, 2.8);
    sun.position.set(-8, 18, 10);
    sun.castShadow = true;
    this.#scene.add(sun);
    const tileGeometry = new THREE.BoxGeometry(0.96, 0.22, 0.96);
    const tileMaterials = [
      new THREE.MeshStandardMaterial({ color: 15068656, roughness: 0.94 }),
      new THREE.MeshStandardMaterial({ color: 14279912, roughness: 0.94 })
    ];
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) for (let z = bounds.minZ; z <= bounds.maxZ; z += 1) {
      const tile = new THREE.Mesh(tileGeometry, tileMaterials[Math.abs(x + z) % 2]);
      tile.position.set(x, -0.12, -z);
      tile.receiveShadow = true;
      this.#scene.add(tile);
    }
    const trackMaterial = new THREE.MeshStandardMaterial({ color: 1383204, roughness: 0.82 });
    const addTrack = (from, to) => {
      const dx = to.x - from.x;
      const dz = to.z - from.z;
      const length = Math.hypot(dx, dz);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(dx) > 0 ? length + 0.42 : 0.36, 0.06, Math.abs(dz) > 0 ? length + 0.42 : 0.36), trackMaterial);
      mesh.position.set((from.x + to.x) / 2, 0.025, -(from.z + to.z) / 2);
      this.#scene.add(mesh);
    };
    for (let index = 1; index < route.points.length; index += 1) addTrack(route.points[index - 1], route.points[index]);
    route.branches.forEach((branch) => addTrack(branch.from, branch.to));
    route.actions.forEach((action, index) => {
      if (action !== "junction") return;
      const point = route.points[index];
      const pad = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.07, 1.45), trackMaterial);
      pad.position.set(point.x, 0.035, -point.z);
      this.#scene.add(pad);
    });
    const start = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.16, 1.25), new THREE.MeshStandardMaterial({ color: 2269291, emissive: 736554 }));
    start.position.set(route.points[0].x, 0.1, -route.points[0].z);
    this.#scene.add(start);
    const endPoint = route.points.at(-1);
    const goal = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.18, 1.25), new THREE.MeshStandardMaterial({ color: 14988574, emissive: 7493632 }));
    goal.position.set(endPoint.x, 0.11, -endPoint.z);
    this.#scene.add(goal);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2, 10), new THREE.MeshStandardMaterial({ color: 3359061 }));
    pole.position.set(endPoint.x, 1.1, -endPoint.z);
    this.#scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.45), new THREE.MeshBasicMaterial({ color: 16041008, side: THREE.DoubleSide }));
    flag.position.set(endPoint.x + 0.38, 1.65, -endPoint.z);
    this.#scene.add(flag);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.36, 1.25), new THREE.MeshStandardMaterial({ color: 959977, metalness: 0.12, roughness: 0.45 }));
    body.position.y = 0.45;
    body.castShadow = true;
    this.#car.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.35, 0.62), new THREE.MeshStandardMaterial({ color: 1389906, roughness: 0.35 }));
    cabin.position.set(0, 0.75, 0.12);
    cabin.castShadow = true;
    this.#car.add(cabin);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 1976635 });
    for (const side of [-1, 1]) for (const front of [-0.38, 0.38]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.16, 16), wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 0.5, 0.26, front);
      this.#car.add(wheel);
    }
    const sensorGeometry = new THREE.SphereGeometry(0.1, 16, 12);
    this.#leftSensor = new THREE.Mesh(sensorGeometry, new THREE.MeshStandardMaterial({ color: 14220287, emissive: 3983063, emissiveIntensity: 1.4 }));
    this.#rightSensor = this.#leftSensor.clone();
    this.#rightSensor.material = this.#leftSensor.material.clone();
    this.#leftSensor.position.set(-0.3, 0.2, -0.78);
    this.#rightSensor.position.set(0.3, 0.2, -0.78);
    this.#car.add(this.#leftSensor, this.#rightSensor);
    this.#scene.add(this.#car);
    this.#trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 2282478, transparent: true, opacity: 0.85 }));
    this.#scene.add(this.#trail);
    const span = Math.max(this.#mapWidth, this.#mapDepth);
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;
    this.#controls.target.copy(this.#center);
    this.#controls.minDistance = Math.max(6, span * 0.55);
    this.#controls.maxDistance = span * 3;
    this.#controls.minPolarAngle = 0.08;
    this.#controls.maxPolarAngle = Math.PI / 2 - 0.06;
    this.resize();
    this.#tick();
  }
  resize() {
    const parent = this.#renderer.domElement.parentElement;
    if (!parent) return;
    const width = Math.max(1, parent.clientWidth);
    const height = Math.max(1, parent.clientHeight);
    this.#renderer.setSize(width, height, false);
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
    const needed = Math.max(this.#mapDepth, this.#mapWidth / this.#camera.aspect);
    const distance = needed / (2 * Math.tan(THREE.MathUtils.degToRad(this.#camera.fov / 2))) * 1.05;
    const direction = new THREE.Vector3(0.16, 1, 0.24).normalize();
    this.#camera.position.copy(this.#center).addScaledVector(direction, distance);
    this.#controls.target.copy(this.#center);
    this.#controls.update();
  }
  setWorld(world) {
    this.#target.set(world.x, 0.12, -world.z);
    this.#targetAngle = HEADING_ANGLE[world.heading];
    const paintSensor = (sensor, black) => {
      const material = sensor.material;
      material.color.setHex(black ? 15680580 : 14220287);
      material.emissive.setHex(black ? 10424889 : 3983063);
    };
    paintSensor(this.#leftSensor, world.left === "black");
    paintSensor(this.#rightSensor, world.right === "black");
    const points = this.#route.points.slice(0, Math.min(world.index + 1, this.#route.points.length)).map((point) => new THREE.Vector3(point.x, 0.22, -point.z));
    this.#trail.geometry.dispose();
    this.#trail.geometry = new THREE.BufferGeometry().setFromPoints(points);
    if (world.action === "initial") {
      this.#car.position.copy(this.#target);
      this.#car.rotation.y = this.#targetAngle;
    }
  }
  #tick = () => {
    this.#raf = requestAnimationFrame(this.#tick);
    this.#car.position.lerp(this.#target, 0.12);
    let delta = this.#targetAngle - this.#car.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    this.#car.rotation.y += delta * 0.14;
    this.#controls.update();
    this.#renderer.render(this.#scene, this.#camera);
  };
  dispose() {
    cancelAnimationFrame(this.#raf);
    this.#controls.dispose();
    this.#scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Line)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material.dispose());
    });
    this.#renderer.dispose();
    this.#renderer.domElement.remove();
  }
};
function RouteWorld({ route, world }) {
  const host = useRef(null);
  const scene = useRef(null);
  const boot = useRef(world);
  useEffect(() => {
    if (!host.current) return;
    const created = new VoxelRouteScene(host.current, route);
    scene.current = created;
    created.setWorld(boot.current);
    const observer = new ResizeObserver(() => created.resize());
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      created.dispose();
      scene.current = null;
    };
  }, [route]);
  useEffect(() => {
    scene.current?.setWorld(world);
  }, [world]);
  const state = world.goal ? "\u5DE1\u7EBF\u6210\u529F" : world.failed ? "\u5C0F\u8F66\u8131\u8F68" : world.left === "black" && world.right === "black" ? "\u53CC\u9ED1 \xB7 \u5341\u5B57\u8DEF\u53E3" : world.left === "black" ? "\u5DE6\u9ED1\u53F3\u767D \xB7 \u5411\u5DE6\u4FEE\u6B63" : world.right === "black" ? "\u5DE6\u767D\u53F3\u9ED1 \xB7 \u5411\u53F3\u4FEE\u6B63" : "\u53CC\u767D \xB7 \u5BFC\u8F68\u5C45\u4E2D";
  return /* @__PURE__ */ jsxs("div", { className: "line-world", children: [
    /* @__PURE__ */ jsx("div", { className: "line-canvas", ref: host }),
    /* @__PURE__ */ jsx("div", { className: "line-status", "data-kind": world.goal ? "success" : world.failed ? "error" : "normal", children: state }),
    world.message && /* @__PURE__ */ jsx("div", { className: "line-error", role: "alert", children: world.message })
  ] });
}
var STYLE = `
.line-world { position:relative; width:100%; height:100%; overflow:hidden; background:var(--pico-surface); }
.line-canvas { position:absolute; inset:0; }.line-canvas canvas { display:block; width:100%; height:100%; }
.line-status { position:absolute; top:14px; left:50%; transform:translateX(-50%); padding:7px 12px; border:var(--pico-line); border-radius:999px; background:color-mix(in srgb,var(--pico-surface-raised) 88%,transparent); color:var(--pico-ink); box-shadow:var(--pico-shadow); font:650 var(--pico-size-xs)/1 var(--pico-font-ui); white-space:nowrap; }
.line-status[data-kind="success"] { color:var(--pico-hue-branch-ink); border-color:var(--pico-hue-branch-strong); background:var(--pico-hue-branch-bg); }
.line-status[data-kind="error"],.line-error { color:var(--pico-hue-error-ink); border-color:var(--pico-hue-error-strong); background:var(--pico-hue-error-bg); }
.line-error { position:absolute; left:16px; right:16px; bottom:14px; padding:8px 12px; border-radius:var(--pico-radius); font:600 var(--pico-size-xs)/1.4 var(--pico-font-ui); }
`;
var mountOptions = { ...pythonOptions({ playback: { stepMs: 130, stepMsFor: paceOf } }), filename: "line-tracking.py", layout: layoutOptions, automatic: 500, start: [{ type: "python.run" }] };
var starter = STARTER;
var LINE_TRACKING_SCRIPT = line_tracking_script_default;
var courseState = provided2("line-tracking.state");
var LINE_TRACKING_SESSION = pythonSession({
  world: { title: "\u8DEF\u7EBF", render: (view) => {
    const state = view.get(courseState);
    const playing = view.get(playbackHost2);
    return /* @__PURE__ */ jsxs("div", { className: "line-world-root", style: { width: "100%", height: "100%", position: "relative" }, children: [
      /* @__PURE__ */ jsx("style", { children: STYLE }),
      /* @__PURE__ */ jsx(RouteWorld, { route: ROUTES[state.routeIndex], world: readRobotWorld(playing?.position ?? null, playing?.trace ?? null, state.routeIndex) }, state.routeIndex)
    ] });
  } },
  domain: [caseChoices({
    id: "line-tracking.route",
    label: "\u8DEF\u7EBF",
    state: courseState,
    current: (state) => String(state.routeIndex),
    choices: ROUTES.map((item, index) => ({ value: String(index), label: String(index + 1), title: item.name })),
    event: (value) => ({ type: "line-tracking.route.changed", routeIndex: Number(value) })
  })],
  provide: (view) => [courseState.with(view.state)],
  ai: courseAi({
    explain: "\u8FD9\u4E00\u53E5\u662F\u5DE1\u7EBF\u5FAA\u73AF\u91CC\u7684\u4E00\u6B65\uFF1A\u5148\u8BFB\u5DE6\u53F3\u4E24\u4E2A\u4F20\u611F\u5668\uFF0C\u518D\u51B3\u5B9A\u5F80\u54EA\u8FB9\u4FEE\u6B63\uFF0C\u5FAA\u73AF\u76F4\u5230 at_goal()\u3002",
    question: "\u60F3\u4E00\u60F3\u5DE6\u3001\u53F3\u4F20\u611F\u5668\u5404\u538B\u5728\u7EBF\u4E0A\u65F6\u673A\u5668\u4EBA\u5E94\u8BE5\u600E\u4E48\u8F6C\u3002\u8FD0\u884C\u540E\u5728\u8DEF\u7EBF\u4E0A\u9010\u6B65\u770B\u4F20\u611F\u5668\u8BFB\u6570\u548C\u6BCF\u4E00\u6B65\u7684\u52A8\u4F5C\u3002"
  }),
  scripts: [LINE_TRACKING_SCRIPT]
});
var LINE_TRACKING_COURSE = {
  name: "\u673A\u5668\u4EBA\u5DE1\u7EBF",
  component: lineTracking,
  starter: STARTER,
  playground: mountOptions,
  session: LINE_TRACKING_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: LINE_TRACKING_COURSE, host });
}
export {
  LINE_TRACKING_COURSE,
  LINE_TRACKING_SCRIPT,
  LINE_TRACKING_SESSION,
  ROUTES,
  Root,
  STARTER,
  examples,
  lineTracking,
  paceOf,
  readRobotWorld,
  starter
};
