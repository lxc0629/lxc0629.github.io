// playgrounds/24point/24point.generated.tsx
import { useEffect, useState } from "../libs/react.js";
import { on, stateful } from "../pico.js";
import { Source } from "../pico.js";
import { python as execution2 } from "../pico.js";
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
      const execution3 = own(python2.create(options.python ?? {}, bus));
      own({ dispose: bus.subscribe(["playback.changed", "selection.changed"], () => {
        const { position } = playing.state;
        const result = execution3.state.result;
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
      observe("python", () => ({ ...execution3.state }), ["python.changed"]);
      observe("playback", () => ({ ...playing.state }), ["playback.changed"]);
      observe("selection", () => focus.state, ["selection.changed"]);
      return { python: execution3.state, playback: playing.state, terminal: output, debugger: debugging, selection: focus.state };
    }
  };
}

// playgrounds/24point/24point.generated.tsx
import { feature as feature2, playbackHost as playbackHost2, provided as provided2 } from "../session.js";
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
    const run = () => playing.trace;
    for (const resolver of [debuggerAnchors(parts.debugger, run), terminalAnchors(parts.terminal, run)]) {
      own({ dispose: registerAnchorResolver(get(playground), resolver) });
    }
  },
  queries: [{ id: "python.result", run: ({ get }) => resultOf(get(pythonHost)?.python ?? null) }],
  views: [
    { slot: "panel", key: OUTPUT_PANEL, icon: "output", title: "\u8F93\u51FA", render: ({ get }) => createElement(Widget, { widget: get(pythonHost).terminal }) },
    { slot: "panel", key: DEBUG_PANEL, icon: "debug", title: "\u8C03\u8BD5", render: ({ get }) => createElement(Widget, { widget: get(pythonHost).debugger }) }
  ]
});
function resultOf(python3) {
  const result = python3?.result ?? null;
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

// playgrounds/24point/24point.script.json
var point_script_default = {
  id: "24point",
  title: "\u4ECE\u56DB\u5F20\u724C\u5199\u51FA\u4E00\u68F5\u8FD0\u7B97\u6811",
  from: "",
  mode: "instruction",
  auto: true,
  steps: [
    {
      title: "\u5148\u5199\u6700\u5C0F\u7684\u5B50\u95EE\u9898",
      concepts: ["recursion"],
      stage: {
        panels: [
          "viz"
        ]
      },
      say: [
        {
          say: "\u7B2C\u4E00\u9898\u662F 3\u30018\u30016\u30015\u3002\u5148\u8BA9 3 \u548C 8 \u76F8\u4E58\uFF0C\u5F97\u5230\u4E2D\u95F4\u7ED3\u679C 24\u3002",
          write: "3 * 8\n"
        }
      ]
    },
    {
      title: "\u6784\u9020\u53E6\u4E00\u652F\u5E76\u7EC4\u5408",
      concepts: ["recursion"],
      say: [
        {
          say: "6 \u51CF 5 \u5F97\u5230 1\uFF1B\u62EC\u53F7\u628A\u5B83\u58F0\u660E\u4E3A\u72EC\u7ACB\u5B50\u8868\u8FBE\u5F0F\u3002\u6700\u540E\u628A\u4E24\u4E2A\u5B50\u7ED3\u679C\u76F8\u4E58\u3002",
          write: "(3 * 8) * (6 - 5)\n"
        }
      ]
    },
    {
      title: "\u8FD0\u884C\u6B63\u786E\u8868\u8FBE\u5F0F",
      concepts: ["recursion"],
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
      say: "\u52A8\u753B\u5148\u6D88\u8D39 3\u30018\uFF0C\u518D\u6D88\u8D39 6\u30015\uFF0C\u6700\u540E\u6839\u8282\u70B9\u7B97\u51FA 24\u3002\u56DB\u5F20\u724C\u6070\u597D\u4ECE\u724C\u6C60\u6D88\u5931\u3002"
    },
    {
      title: "\u6E90\u7801\u600E\u6837\u53D8\u6210\u6811",
      concepts: ["recursion"],
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
            line: 1,
            occurrence: 1
          }
        }
      ],
      say: "\u53EA\u6709\u4E00\u884C\u6E90\u7801\uFF0C\u4F46\u89E3\u6790\u5668\u5148\u5EFA\u7ACB\u6811\uFF0C\u518D\u6309\u53F6\u5B50\u548C\u5185\u90E8\u8282\u70B9\u6C42\u503C\u3002Debugger \u6307\u5411\u6574\u6761\u8868\u8FBE\u5F0F\uFF0CWorld \u5C55\u5F00\u8FD9\u4E00\u884C\u5185\u90E8\u7684\u8BA1\u7B97\u7ED3\u6784\u3002"
    },
    {
      title: "\u62EC\u53F7\u4E0D\u662F\u88C5\u9970",
      concepts: ["recursion"],
      say: [
        {
          say: "\u53BB\u6389\u5173\u952E\u62EC\u53F7\uFF0C\u5199\u6210\u8FDE\u7EED\u4E58\u6CD5\u518D\u51CF 5\u3002\u4F18\u5148\u7EA7\u548C\u7ED3\u5408\u65B9\u5411\u8BA9\u8FD0\u7B97\u6811\u53D1\u751F\u53D8\u5316\u3002",
          write: "3 * 8 * 6 - 5\n"
        }
      ]
    },
    {
      title: "\u8FD0\u884C\u9519\u8BEF\u7ED3\u6784",
      concepts: ["recursion"],
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
      say: "\u56DB\u5F20\u724C\u4ECD\u5404\u7528\u4E00\u6B21\uFF0C\u4F46\u6839\u8282\u70B9\u4E0D\u662F 24\u3002\u201C\u8F93\u5165\u5408\u6CD5\u201D\u548C\u201C\u8FD0\u7B97\u7ED3\u6784\u6B63\u786E\u201D\u662F\u4E24\u6761\u72EC\u7ACB\u7EA6\u675F\u3002"
    },
    {
      title: "\u5236\u9020\u91CD\u590D\u7528\u724C",
      concepts: ["recursion"],
      say: [
        {
          say: "\u628A\u6700\u540E\u7684 5 \u6362\u6210 3\uFF0C\u4F1A\u91CD\u590D\u4F7F\u7528 3\uFF0C\u540C\u65F6\u9057\u6F0F 5\u3002",
          write: "(3 * 8) * (6 - 3)\n"
        }
      ]
    },
    {
      title: "\u724C\u6C60\u8BB0\u5F55\u8F93\u5165\u7EA6\u675F",
      concepts: ["recursion"],
      stage: {
        panels: [
          "viz"
        ]
      },
      do: [
        {
          action: "code.run"
        }
      ],
      say: "\u7B2C\u4E8C\u4E2A 3 \u65E0\u724C\u53EF\u53D6\uFF0C5 \u4ECD\u7559\u5728\u724C\u6C60\u3002World \u7528\u724C\u7684\u8EAB\u4EFD\u8865\u8DB3\u4E86\u666E\u901A\u7B97\u672F\u7ED3\u679C\u770B\u4E0D\u5230\u7684\u4FE1\u606F\u3002"
    },
    {
      title: "\u6062\u590D\u5E76\u56DE\u987E",
      concepts: ["recursion"],
      stage: {
        panels: [
          "viz",
          "debug"
        ]
      },
      say: [
        {
          say: "\u6062\u590D\u6B63\u786E\u8FD0\u7B97\u6811\u5E76\u518D\u6B21\u8FD0\u884C\u3002",
          write: "(3 * 8) * (6 - 5)\n"
        }
      ]
    },
    {
      title: "\u8868\u8FBE\u5F0F\u5C31\u662F\u7A0B\u5E8F\u7ED3\u6784",
      concepts: ["recursion"],
      do: [
        {
          action: "code.run"
        }
      ],
      say: "\u53F6\u5B50\u9009\u62E9\u8F93\u5165\uFF0C\u62EC\u53F7\u51B3\u5B9A\u7EC4\u5408\uFF0C\u5185\u90E8\u8282\u70B9\u4FDD\u5B58\u5C40\u90E8\u7ED3\u679C\uFF0C\u6839\u8282\u70B9\u7ED9\u51FA\u7B54\u6848\u3002\u8FD0\u884C\u628A\u9690\u542B\u7684\u8BED\u6CD5\u6811\u53D8\u6210\u53EF\u89C2\u5BDF\u4E8B\u5B9E\u3002"
    }
  ]
};

// playgrounds/24point/24point.generated.tsx
import { mockAiPort as mockAiPort2 } from "../session.js";
import { jsx, jsxs } from "../libs/react.js";
var persistent = /* @__PURE__ */ new WeakSet();
var POINT24_DECLARATIONS = [
  on("editor.changed", (state, event, { emit }) => {
    state.source = event.source;
    emit({ type: "python.clear" });
  }),
  on("python.run", (state, _event, { emit }) => {
    const request = makeRequest(state.source, cases[Number(state.choice)]);
    emit({ type: "python.execute", source: new Source(request.source, request), options: request.options });
  }),
  on("point24gpt.select", (state, event, { emit }) => {
    if (event.choice === state.choice || !cases.some((_, index) => String(index) === event.choice)) return;
    state.choice = event.choice;
    emit({ type: "python.clear" });
  }),
  on("python.changed", (state, event, { emit }) => {
    if (event.result.status !== "ready" || !event.result.value || state.completed.includes(state.choice)) return;
    if (calculationFromTrace(event.result.value.trace).frames.at(-1)?.success === true) {
      state.completed = [...state.completed, state.choice];
      if (persistent.has(state)) {
        try {
          window.localStorage.setItem(progressKey, JSON.stringify(state.completed));
        } catch {
        }
      }
      emit({ type: "point24gpt.completed", choice: state.choice });
    }
  })
];
var point24gpt = stateful("point24gpt", (options) => {
  const state = { source: options.source ?? initialSource, choice: "0", completed: [...options.completed ?? (options.persist ? readCompleted() : [])] };
  if (options.persist) persistent.add(state);
  return state;
}, POINT24_DECLARATIONS);
var point24Course = stateful("point24gpt", (source2) => {
  const state = { source: source2, choice: "0", completed: [...readCompleted()] };
  persistent.add(state);
  return state;
}, POINT24_DECLARATIONS);
function createExample(bus) {
  const course = point24gpt.create({}, bus);
  const player = playback2.create({}, bus);
  const runner = execution2.create({}, bus);
  return () => {
    runner.dispose();
    player.dispose();
    course.dispose();
  };
}
var examples = {
  /** 初始代码原样运行：四张 1 都不是牌池里的牌，走校验失败路径。 */
  starter: { create: createExample, events: [
    { type: "python.run" }
  ] },
  /** 切到第 2 题并改成 `(1+2+3)*4`：完整走成功路径并产生完成通知。 */
  edited: { create: createExample, events: [
    { type: "point24gpt.select", choice: "1" },
    { type: "editor.changed", source: "(1+2+3)*4" },
    { type: "python.run" }
  ] }
};
var cardPath = (card) => {
  const rank = { 1: "ace", 11: "jack", 12: "queen", 13: "king" }[card.value] ?? card.value;
  return new URL(`assets/playing-cards/${rank}_of_${card.suit}.svg`, import.meta.url).href;
};
var ink = "var(--pico-ink)";
var accent = "var(--pico-accent-deep)";
var errorInk = "var(--pico-hue-error-strong)";
var surface = "var(--pico-surface-raised)";
function treeLayout(nodes) {
  const leaves = nodes.filter((node) => node.left === void 0);
  const levels = /* @__PURE__ */ new Map();
  const points = /* @__PURE__ */ new Map();
  for (const node of [...nodes].reverse()) {
    const level = levels.get(node.id) ?? 0;
    levels.set(node.id, level);
    if (node.left !== void 0) {
      levels.set(node.left, level + 1);
      levels.set(node.right, level + 1);
    }
  }
  const depth = Math.max(1, ...levels.values());
  for (const node of nodes) {
    const x = node.left === void 0 ? 95 + leaves.indexOf(node) * 530 / Math.max(1, leaves.length - 1) : (points.get(node.left).x + points.get(node.right).x) / 2;
    points.set(node.id, {
      x: leaves.length === 1 ? 360 : x,
      y: nodes.length === 1 ? 380 : 195 + levels.get(node.id) * 370 / depth
    });
  }
  return points;
}
function Cross({ x, y, label }) {
  return /* @__PURE__ */ jsxs("g", { transform: `translate(${x} ${y})`, role: "img", "aria-label": label, children: [
    /* @__PURE__ */ jsx("title", { children: label }),
    /* @__PURE__ */ jsx("circle", { r: "15", fill: surface }),
    /* @__PURE__ */ jsx("path", { d: "M-6-6 6 6 M6-6-6 6", fill: "none", stroke: errorInk, strokeWidth: "3", strokeLinecap: "round" })
  ] });
}
function WorldSvg({ cards, calculation, frame, hand = false }) {
  const nodes = calculation?.nodes ?? [];
  const points = treeLayout(nodes);
  const visible = new Set(frame?.visible ?? []);
  const errors = new Set(frame?.errors ?? []);
  const active = new Set(frame?.focus ?? []);
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 720 680",
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": "24 \u70B9\u5361\u724C\u4E0E\u8BA1\u7B97\u6811",
      style: { display: "block", fontFamily: "var(--pico-font-mono)" },
      children: [
        /* @__PURE__ */ jsx("style", { children: `
      .point24-card { transition: transform 650ms var(--pico-ease-out); }
      .point24-result { transition: opacity 450ms ease; }
      @media (prefers-reduced-motion: reduce) {
        .point24-card { transition-duration: 80ms; }
        .point24-result { transition-duration: 80ms; }
      }
    ` }),
        nodes.filter((node) => node.left !== void 0).map((node) => {
          const p = points.get(node.id);
          const left = points.get(node.left);
          const right = points.get(node.right);
          const operatorY = left.y;
          return /* @__PURE__ */ jsxs("g", { className: "point24-result", opacity: visible.has(node.id) ? 1 : 0, children: [
            /* @__PURE__ */ jsx(
              "path",
              {
                d: `M${left.x} ${left.y} L${p.x} ${p.y} L${right.x} ${right.y}`,
                stroke: "var(--pico-ink-soft)",
                strokeWidth: "1.7",
                fill: "none"
              }
            ),
            /* @__PURE__ */ jsx("rect", { x: (left.x + right.x) / 2 - 20, y: operatorY - 23, width: "40", height: "46", fill: surface }),
            /* @__PURE__ */ jsx("text", { x: (left.x + right.x) / 2, y: operatorY + 10, textAnchor: "middle", fontSize: "32", fill: ink, children: node.op })
          ] }, node.id);
        }),
        cards.map((card, index) => {
          const leaf = nodes.find((node) => node.card === index);
          const moved = leaf && frame?.taken.includes(leaf.id);
          const p = moved ? points.get(leaf.id) : hand ? { x: 240 + index * 80, y: 345 + Math.abs(index - 1.5) * 18 } : { x: 458 + index * 66, y: 67 };
          const scale = hand ? 1.55 : moved ? Math.min(1, 4 / nodes.filter((node) => node.left === void 0).length) : 0.62;
          const angle = hand ? (index - 1.5) * 10 : 0;
          const highlighted = leaf && active.has(leaf.id) && (frame?.phase === "highlight" || frame?.phase === "move");
          return /* @__PURE__ */ jsxs("g", { className: "point24-card", transform: `translate(${p.x} ${p.y}) rotate(${angle}) scale(${scale})`, children: [
            highlighted && /* @__PURE__ */ jsx("rect", { x: "-48", y: "-67", width: "96", height: "134", rx: "8", fill: "var(--pico-accent-wash)", stroke: accent, strokeWidth: "3" }),
            /* @__PURE__ */ jsx("image", { href: cardPath(card), x: "-42", y: "-61", width: "84", height: "122" }),
            moved && errors.has(leaf.id) && /* @__PURE__ */ jsx(Cross, { x: 35, y: -52, label: leaf.error ?? "\u7ED3\u679C\u4E0D\u662F 24" }),
            frame?.remaining.includes(index) && /* @__PURE__ */ jsx(Cross, { x: 35, y: -52, label: "\u8FD9\u5F20\u724C\u5C1A\u672A\u4F7F\u7528" })
          ] }, index);
        }),
        nodes.map((node) => {
          const p = points.get(node.id);
          const isLeaf = node.left === void 0;
          if (isLeaf && node.card !== -1) return null;
          const show = isLeaf ? frame?.taken.includes(node.id) : visible.has(node.id);
          return /* @__PURE__ */ jsxs("g", { className: isLeaf ? void 0 : "point24-result", opacity: show ? 1 : 0, children: [
            /* @__PURE__ */ jsx("rect", { x: p.x - 52, y: p.y - 31, width: "104", height: "62", rx: "8", fill: surface }),
            /* @__PURE__ */ jsx(
              "rect",
              {
                x: p.x - 52,
                y: p.y - 31,
                width: "104",
                height: "62",
                rx: "8",
                fill: active.has(node.id) && frame?.phase === "calculate" ? "var(--pico-accent-wash)" : surface
              }
            ),
            /* @__PURE__ */ jsx(
              "text",
              {
                x: p.x,
                y: p.y + 12,
                textAnchor: "middle",
                fontSize: node.value.length > 5 ? 26 : 38,
                fill: ink,
                children: node.value
              }
            ),
            errors.has(node.id) && /* @__PURE__ */ jsx(Cross, { x: p.x + 51, y: p.y - 25, label: node.error ?? "\u7ED3\u679C\u4E0D\u662F 24" }),
            frame?.success && node.id === nodes.at(-1)?.id && /* @__PURE__ */ jsxs("g", { transform: `translate(${p.x + 57} ${p.y - 10})`, children: [
              /* @__PURE__ */ jsx("title", { children: "\u6B63\u786E" }),
              /* @__PURE__ */ jsx("path", { d: "m-8 0 6 6 12-14", fill: "none", stroke: "var(--pico-hue-branch-strong)", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" })
            ] })
          ] }, node.id);
        }),
        calculation?.message && /* @__PURE__ */ jsxs("text", { x: "360", y: "350", textAnchor: "middle", fill: errorInk, fontSize: "22", children: [
          "\u2717 ",
          calculation.message
        ] })
      ]
    }
  );
}
var initialSource = `# \u4F7F\u7528\u53F3\u4FA7\u7684\u5361\u724C\uFF0C\u5199\u51FA\u80FD\u8BA1\u7B97\u51FA 24 \u7684\u8868\u8FBE\u5F0F
# \u6570\u5B57\u8BF7\u4F7F\u7528 1, 2, ... 10, J, Q, K
# \u8FD0\u7B97\u8BF7\u4F7F\u7528\u52A0\u6CD5 +\u3001\u51CF\u6CD5 -\u3001\u4E58\u6CD5 *\u3001\u9664\u6CD5 /
1 + 1 + 1 + 1`;
var cases = [
  [3, 8, 6, 5],
  [1, 2, 3, 4],
  [10, 12, 3, 1],
  [13, 9, 10, 4],
  [11, 7, 5, 4]
].map((values) => values.map((value, index) => ({ value, suit: ["diamonds", "clubs", "hearts", "spades"][index] })));
var evaluator = String.raw`
import ast as _ast
from fractions import Fraction as _Fraction
import _pico_runtime as _runtime

def _calculate24(source, cards):
    nodes, frames, values = [], [], {}
    used, taken, visible, errors = [], [], [], []

    def frame(phase, focus=(), remaining=(), success=False):
        frames.append(dict(phase=phase, focus=list(focus), taken=list(taken),
                           visible=list(visible), errors=list(errors),
                           remaining=list(remaining), success=success))

    def validate(node):
        if isinstance(node, _ast.Constant) and type(node.value) is int:
            if not 0 <= node.value <= 999:
                raise ValueError("请使用卡牌上的数字")
            return
        if isinstance(node, _ast.Name) and node.id in ("J", "Q", "K"):
            return
        if isinstance(node, _ast.BinOp) and type(node.op) in (_ast.Add, _ast.Sub, _ast.Mult, _ast.Div):
            validate(node.left)
            validate(node.right)
            return
        raise ValueError("只使用数字、J Q K、括号和 + − × ÷")

    def build(node):
        if isinstance(node, (_ast.Constant, _ast.Name)):
            number = node.value if isinstance(node, _ast.Constant) else dict(J=11, Q=12, K=13)[node.id]
            card = next((i for i, value in enumerate(cards) if value == number and i not in used), -1)
            item = dict(number=number, value=str(number), card=card)
            if card == -1:
                item["error"] = "这张牌已经用过" if number in cards else "题目中没有这张牌"
            else:
                used.append(card)
            value = _Fraction(number)
        else:
            left, right = build(node.left), build(node.right)
            a, b = values[left], values[right]
            symbol = {_ast.Add: "+", _ast.Sub: "−", _ast.Mult: "×", _ast.Div: "÷"}[type(node.op)]
            item = dict(left=left, right=right, op=symbol)
            value = None
            if a is not None and b is not None:
                if isinstance(node.op, _ast.Div) and b == 0:
                    item["error"] = "不能除以 0"
                else:
                    value = {_ast.Add: lambda: a+b, _ast.Sub: lambda: a-b,
                             _ast.Mult: lambda: a*b, _ast.Div: lambda: a/b}[type(node.op)]()
            item["value"] = str(value) if value is not None else "—"
        item["id"] = len(nodes)
        nodes.append(item)
        values[item["id"]] = value
        return item["id"]

    def take(ids):
        for i in ids:
            if "error" in nodes[i]:
                errors.append(i)
                taken.append(i)
        frame("highlight", ids)
        for i in ids:
            if i not in taken:
                taken.append(i)
        frame("move", ids)
        frame("pause")

    def compute(i):
        node = nodes[i]
        if "left" not in node:
            take([i])
            return
        left, right = node["left"], node["right"]
        if "left" not in nodes[left] and "left" not in nodes[right]:
            take([left, right])
        else:
            compute(left)
            compute(right)
        visible.append(i)
        if "error" in node or (i == len(nodes)-1 and values[i] != 24):
            errors.append(i)
        frame("calculate", [i])
        frame("pause")

    try:
        if len(source) > 2000:
            raise ValueError("请写一个简短的单行表达式")
        tree = _ast.parse(source)
        if len(tree.body) != 1 or not isinstance(tree.body[0], _ast.Expr):
            raise ValueError("请写一个单行表达式")
        expression = tree.body[0]
        if expression.lineno != expression.end_lineno:
            raise ValueError("请把表达式写在同一行")
        validate(expression.value)
        leaves = sum(isinstance(n, (_ast.Constant, _ast.Name)) for n in _ast.walk(expression.value))
        if leaves > 6:
            raise ValueError("只有四张牌，每张只能使用一次")
        root = build(expression.value)
        if values[root] != 24:
            nodes[root].setdefault("error", "结果不是 24")
        frame("pool")
        compute(root)
        if root not in errors and "error" in nodes[root]:
            errors.append(root)
        remaining = [i for i in range(4) if i not in used]
        frame("end", remaining=remaining, success=not errors and not remaining and values[root] == 24)
        return dict(nodes=nodes, frames=frames, message="")
    except (SyntaxError, ValueError, RecursionError) as error:
        message = "表达式语法有误" if isinstance(error, SyntaxError) else str(error)
        frame("end")
        return dict(nodes=[], frames=frames, message=message)
`;
var layoutOptions = { open: ["viz"], ratio: 0.4 };
function makeRequest(source2, cards) {
  return {
    source: source2,
    prelude: `${evaluator}
_p24 = _calculate24(${JSON.stringify(source2)}, ${JSON.stringify(cards.map((card) => card.value))})
_runtime.register_trace_resource("point24", [_p24])
J, Q, K = 11, 12, 13`,
    options: { trace: { events: [], observe: null }, timeoutMs: 1500, maxTraceSteps: 100 }
  };
}
function calculationFromTrace(trace) {
  const count = trace.finalState.resources?.point24 ?? 0;
  const record = trace.resources.point24?.[count - 1];
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return { nodes: [], frames: [], message: "\u8BA1\u7B97\u7ED3\u679C\u4E0D\u53EF\u7528\uFF0C\u8BF7\u91CD\u65B0\u8FD0\u884C" };
  }
  return record;
}
function frameAt(calculation, index) {
  return { current: calculation.frames[index] ?? null, next: calculation.frames[index + 1] ?? null };
}
var frameDuration = (frame) => ({
  pool: 800,
  highlight: 650,
  move: 800,
  calculate: 700,
  pause: 450,
  end: 0
})[frame.phase];
function Replay({ cards, calculation, hand }) {
  const [cursor, setCursor] = useState({ calculation: null, index: 0 });
  const index = cursor.calculation === calculation ? cursor.index : 0;
  const { current, next } = calculation ? frameAt(calculation, index) : { current: null, next: null };
  useEffect(() => {
    if (!current || !next) return;
    const timer = setTimeout(() => setCursor({ calculation, index: index + 1 }), frameDuration(current));
    return () => clearTimeout(timer);
  }, [calculation, current, next, index]);
  return /* @__PURE__ */ jsx(WorldSvg, { cards, calculation, frame: current, hand: hand && !calculation });
}
var progressKey = `pico:24point-gpt:completed:${cases.map((cards) => cards.map((card) => card.value).join(",")).join(";")}`;
function readCompleted() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(progressKey) ?? "[]");
    return new Set(Array.isArray(saved) ? saved.filter((value) => typeof value === "string" && cases.some((_, index) => String(index) === value)) : []);
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
var mountOptions = { ...pythonOptions(), filename: "24point-gpt.py", layout: layoutOptions, automatic: 500 };
var starter = initialSource;
var POINT24_SCRIPT = point_script_default;
var point24State = provided2("point24.state");
var point24Cases = feature2("point24.cases", {
  requires: [point24State],
  actions: [{
    id: "point24.select",
    label: "\u9009\u62E9\u9898\u76EE",
    tags: ["run"],
    settle: () => PYTHON_RAN,
    args: { choice: { type: "string", enum: cases.map((_, index) => String(index)) } },
    when: (context, { choice }) => typeof choice === "string" && cases.some((_, index) => String(index) === choice) && choice !== context.get(point24State)?.choice,
    event: (_context, { choice }) => ({ type: "point24gpt.select", choice })
  }],
  views: [{ slot: "toolbar", label: "\u9898\u76EE", controls: ({ get }) => {
    const state = get(point24State);
    return [{ kind: "choices", label: "\u9898\u76EE", value: state.choice, choices: cases.map((_, index) => ({
      value: String(index),
      label: String(index + 1),
      title: `\u7B2C ${index + 1} \u9898`,
      event: { type: "session.invoke", action: "point24.select", args: { choice: String(index) } }
    })) }];
  } }]
});
function point24Answer(request) {
  if (request.kind === "explain") return {
    title: "\u6CBF\u8868\u8FBE\u5F0F\u6811\u68C0\u67E5\u8FD9\u4E00\u6B65",
    text: "\u53F6\u5B50\u5BF9\u5E94\u8F93\u5165\u724C\uFF0C\u5185\u90E8\u8282\u70B9\u5BF9\u5E94\u8FD0\u7B97\uFF0C\u6839\u8282\u70B9\u662F\u6700\u7EC8\u7ED3\u679C\u300224 \u70B9\u8FD8\u8981\u540C\u65F6\u68C0\u67E5\u724C\u6C60\uFF1A\u56DB\u5F20\u724C\u5FC5\u987B\u5404\u4F7F\u7528\u4E00\u6B21\u3002",
    primary: { action: "selection.locate", label: "\u5B9A\u4F4D\u5230\u6267\u884C" }
  };
  return {
    title: "\u5148\u4ECE\u724C\u6C60\u548C\u62EC\u53F7\u770B\u8D77",
    text: "\u6BCF\u5F20\u724C\u8981\u6070\u597D\u4F7F\u7528\u4E00\u6B21\uFF0C\u6700\u540E\u7684\u6839\u8282\u70B9\u5FC5\u987B\u7B49\u4E8E 24\u3002\u62EC\u53F7\u51B3\u5B9A\u8FD0\u7B97\u6811\u7684\u5F62\u72B6\uFF1B\u8FD0\u884C\u540E\u53EF\u4EE5\u6CBF\u6811\u89C2\u5BDF\u6BCF\u6B21\u53D6\u724C\u548C\u4E2D\u95F4\u7ED3\u679C\u3002",
    primary: { action: "script.play", label: "\u5F00\u59CB\u8BB2\u89E3", args: { script: POINT24_SCRIPT } }
  };
}
var POINT24_STYLE = `
.point24-world {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--pico-surface);
  box-sizing: border-box;
  padding: var(--pico-space-3);
}
.point24-world svg {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}
`;
var POINT24_SESSION = pythonSession({
  world: { title: "\u5361\u724C", render: (view) => {
    const state = view.get(point24State);
    const result = view.get(pythonHost).python.result;
    const trace = view.get(playbackHost2)?.trace ?? null;
    const calculation = trace ? calculationFromTrace(trace) : null;
    const completed = result.status === "ready" && result.value !== null;
    return /* @__PURE__ */ jsxs("div", { className: "point24-world", children: [
      /* @__PURE__ */ jsx("style", { children: POINT24_STYLE }),
      result.status === "failed" ? /* @__PURE__ */ jsx("div", { role: "alert", style: { color: errorInk }, children: "\u2717 \u8FD0\u884C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" }) : /* @__PURE__ */ jsx(Replay, { cards: cases[Number(state.choice)], calculation, hand: !completed })
    ] });
  } },
  domain: [point24Cases],
  provide: (view) => [point24State.with(view.state)],
  ai: { port: mockAiPort2(point24Answer, { delayMs: 300 }) },
  scripts: [POINT24_SCRIPT]
});
var POINT24_COURSE = {
  name: "24 \u70B9",
  component: point24Course,
  starter: initialSource,
  playground: { ...mountOptions, start: [{ type: "python.run" }] },
  session: POINT24_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: POINT24_COURSE, host });
}
export {
  POINT24_COURSE,
  POINT24_SCRIPT,
  Root,
  WorldSvg,
  calculationFromTrace,
  cardPath,
  cases,
  evaluator,
  examples,
  frameAt,
  frameDuration,
  initialSource,
  makeRequest,
  point24gpt,
  starter,
  treeLayout
};
