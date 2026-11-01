// playgrounds/gacha/gacha.generated.tsx
import { useState } from "../libs/react.js";
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

// playgrounds/gacha/gacha.generated.tsx
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
function courseAi(answers) {
  return {
    port: mockAiPort((request) => request.kind === "explain" ? { title: "\u8FD9\u4E00\u6B65\u5728\u505A\u4EC0\u4E48", text: answers.explain, primary: { action: "selection.locate", label: "\u5B9A\u4F4D\u5230\u6267\u884C" } } : { title: "\u53EF\u4EE5\u4ECE\u8FD9\u91CC\u60F3\u8D77", text: answers.question }, { delayMs: 300 })
  };
}

// playgrounds/gacha/gacha.script.json
var gacha_script_default = {
  id: "gacha-rules",
  title: "\u4ECE\u6982\u7387\u8868\u5230\u4E00\u53F0\u53EF\u4FEE\u6539\u7684\u76F2\u76D2\u673A",
  mode: "instruction",
  steps: [
    {
      title: "\u5148\u8BA4\u51FA\u89C4\u5219\u6570\u636E",
      concepts: ["dict", "list", "value"],
      stage: { panels: ["viz"], focus: "viz" },
      say: "Editor \u9876\u90E8\u4E0D\u662F\u6D41\u7A0B\uFF0C\u800C\u662F\u8FD9\u53F0\u673A\u5668\u7684\u89C4\u5219\u3002STARTING_MONEY \u548C BOX_PRICE \u51B3\u5B9A\u80FD\u62BD\u51E0\u6B21\uFF1BSTYLES \u4FDD\u5B58\u6BCF\u4E2A\u7B49\u7EA7\u6709\u54EA\u4E9B\u6B3E\u5F0F\uFF1B\u4E24\u5F20 WEIGHTS \u5B57\u5178\u5206\u522B\u63CF\u8FF0\u666E\u901A\u6C60\u548C\u4FDD\u5E95\u6C60\u3002\u4EE5\u540E\u6539\u53D8\u673A\u5668\uFF0C\u5E94\u8BE5\u5148\u6539\u8FD9\u4E9B\u6570\u636E\u3002"
    },
    {
      title: "\u6743\u91CD\u5982\u4F55\u53D8\u6210\u4E00\u6B21\u968F\u673A\u9009\u62E9",
      concepts: ["function", "loop", "dict"],
      stage: { panels: ["viz", "debug"], focus: "debug" },
      do: [
        { action: "code.run" },
        { action: "code.locate", args: { line: 21, occurrence: 1 } },
        { action: "annotation.show", args: { kind: "mark", at: { variable: "point" } } }
      ],
      say: "weighted_pick \u5148\u5728\u5168\u90E8\u6743\u91CD\u7684\u603B\u957F\u5EA6\u4E0A\u968F\u673A\u53D6\u4E00\u4E2A point\uFF0C\u518D\u9010\u9879\u51CF\u53BB\u6BCF\u4E2A\u533A\u95F4\u7684\u957F\u5EA6\u3002point \u7B2C\u4E00\u6B21\u843D\u5230\u96F6\u4EE5\u4E0B\u65F6\uFF0C\u5BF9\u5E94\u7B49\u7EA7\u5C31\u662F\u672C\u6B21\u7ED3\u679C\u3002\u6743\u91CD\u4E0D\u5FC5\u51D1\u6210 100\uFF0C\u5B83\u4EEC\u8868\u8FBE\u7684\u662F\u533A\u95F4\u6BD4\u4F8B\u3002"
    },
    {
      title: "\u4FDD\u5E95\u53EA\u8D1F\u8D23\u5207\u6362\u6982\u7387\u8868",
      concepts: ["branch", "function"],
      stage: { panels: ["viz", "debug"], focus: "debug" },
      do: [
        { action: "code.locate", args: { line: 29, occurrence: 1 } },
        { action: "annotation.show", args: { kind: "mark", at: { variable: "is_pity" } } }
      ],
      say: "tier_for_draw \u6CA1\u6709\u590D\u5236\u968F\u673A\u7B97\u6CD5\u3002\u5B83\u53EA\u5224\u65AD\u8FD9\u4E00\u62BD\u662F\u5426\u5230\u8FBE\u4FDD\u5E95\uFF0C\u7136\u540E\u628A NORMAL_WEIGHTS \u6216 PITY_WEIGHTS \u4EA4\u7ED9\u540C\u4E00\u4E2A weighted_pick\u3002\u89C4\u5219\u4E0E\u673A\u5236\u56E0\u6B64\u53EF\u4EE5\u5206\u522B\u4FEE\u6539\u3002",
      predict: {
        question: "\u628A PITY_AFTER \u4ECE 10 \u6539\u6210 5\uFF0C\u54EA\u4E00\u62BD\u7B2C\u4E00\u6B21\u4F7F\u7528\u4FDD\u5E95\u8868\uFF1F",
        choices: [
          { label: "\u7B2C 4 \u62BD", reply: "draws_without_s \u8981\u7B49\u4E8E PITY_AFTER - 1\uFF0C\u524D\u56DB\u62BD\u90FD\u6CA1\u51FA S \u540E\uFF0C\u7B2C\u4E94\u62BD\u624D\u6EE1\u8DB3\u3002" },
          { label: "\u7B2C 5 \u62BD", correct: true, reply: "\u6B63\u786E\u3002\u8FDB\u5165\u7B2C\u4E94\u62BD\u524D\uFF0C\u8FDE\u7EED\u672A\u51FA S \u7684\u8BA1\u6570\u662F 4\uFF0C\u521A\u597D\u7B49\u4E8E 5 - 1\u3002" },
          { label: "\u7B2C 6 \u62BD", reply: "\u4FDD\u5E95\u5224\u65AD\u53D1\u751F\u5728\u62BD\u53D6\u4E4B\u524D\uFF1B\u8BA1\u6570\u8FBE\u5230 4 \u65F6\uFF0C\u7B2C\u4E94\u62BD\u5DF2\u7ECF\u5207\u6362\u6982\u7387\u8868\u3002" }
        ]
      }
    },
    {
      title: "\u5FAA\u73AF\u540C\u65F6\u66F4\u65B0\u94B1\u548C\u4FDD\u5E95\u72B6\u6001",
      concepts: ["loop", "branch", "value"],
      stage: { panels: ["viz", "debug"], focus: "viz" },
      do: [
        { action: "code.locate", args: { line: 47, occurrence: 1 } }
      ],
      say: "\u6BCF\u8F6E\u5FAA\u73AF\u5148\u4ED8\u6B3E\uFF0C\u518D\u51B3\u5B9A\u7B49\u7EA7\u548C\u6B3E\u5F0F\uFF0C\u6700\u540E\u66F4\u65B0\u8FDE\u7EED\u672A\u51FA S \u7684\u6B21\u6570\u3002World \u4E2D\u7684\u4E00\u5F20\u5361\u3001\u4E00\u683C\u4FDD\u5E95\u548C\u4E00\u6761\u5386\u53F2\u8BB0\u5F55\uFF0C\u90FD\u6765\u81EA\u8FD9\u6B21 open_box \u5DF2\u7ECF\u8BB0\u5F55\u7684\u4E8B\u5B9E\uFF1B\u62D6\u52A8 Debugger \u65F6\u53EA\u662F\u56DE\u653E\uFF0C\u4E0D\u4F1A\u91CD\u65B0\u62BD\u53D6\u3002"
    },
    {
      title: "\u7528\u4FEE\u6539\u53C2\u6570\u505A\u5B9E\u9A8C",
      concepts: ["dict", "value"],
      stage: { panels: ["viz"] },
      say: "\u7ED3\u675F\u8BB2\u89E3\u540E\u53EF\u4EE5\u53EA\u6539\u4E00\u4E2A\u53C2\u6570\u518D\u8FD0\u884C\uFF1A\u589E\u52A0 STARTING_MONEY \u4F1A\u5F97\u5230\u66F4\u591A\u62BD\u6570\uFF1B\u6539\u53D8 NORMAL_WEIGHTS \u4F1A\u6539\u53D8\u957F\u671F\u6BD4\u4F8B\uFF1B\u6539\u53D8 PITY_AFTER \u4F1A\u79FB\u52A8\u4FDD\u5E95\u89E6\u53D1\u4F4D\u7F6E\u3002\u4E00\u6B21\u7ED3\u679C\u53EF\u80FD\u5076\u7136\uFF0C\u8FDE\u7EED\u8FD0\u884C\u624D\u80FD\u9010\u6E10\u770B\u89C1\u6982\u7387\u89C4\u5219\u3002"
    }
  ]
};

// playgrounds/gacha/gacha.generated.tsx
import { jsx, jsxs } from "../libs/react.js";
var RESOURCE = "gacha";
var STARTER = `from random import random, choice

STARTING_MONEY = 100
BOX_PRICE = 10

STYLES = {
    "C": ["\u6C7D\u6C34\u718A", "\u5E03\u4E01\u72D7", "\u996D\u56E2\u732B"],
    "B": ["\u98DE\u884C\u718A", "\u4FA6\u63A2\u72D7", "\u5FCD\u8005\u732B"],
    "A": ["\u6708\u7403\u718A", "\u8239\u957F\u732B"],
    "S": ["\u661F\u5149\u9F99"],
    "SSS": ["\u94F6\u6CB3\u9690\u85CF\u6B3E"],
}

NORMAL_WEIGHTS = {"C": 50, "B": 30, "A": 14, "S": 5, "SSS": 1}

PITY_AFTER = 10
PITY_WEIGHTS = {"S": 5, "SSS": 1}


def weighted_pick(weights):
    point = random() * sum(weights.values())
    for name, weight in weights.items():
        point -= weight
        if point < 0:
            return name


def tier_for_draw(draws_without_s):
    is_pity = draws_without_s == PITY_AFTER - 1
    weights = PITY_WEIGHTS if is_pity else NORMAL_WEIGHTS
    return weighted_pick(weights), is_pity


money = STARTING_MONEY
draws_without_s = 0

while money >= BOX_PRICE:
    money -= BOX_PRICE
    tier, is_pity = tier_for_draw(draws_without_s)
    style = choice(STYLES[tier])

    if tier in ("S", "SSS"):
        draws_without_s = 0
    else:
        draws_without_s += 1

    open_box(tier, style, money, draws_without_s, is_pity)`;
var PRELUDE = `import _pico_runtime
__gacha_log = []
_pico_runtime.register_trace_resource("${RESOURCE}", __gacha_log)

def open_box(tier, style, money, pity_count, is_pity):
    if not isinstance(tier, str) or not isinstance(style, str):
        raise TypeError("tier \u548C style \u5FC5\u987B\u662F\u5B57\u7B26\u4E32")
    if type(money) is not int or money < 0 or type(pity_count) is not int or pity_count < 0:
        raise ValueError("money \u548C pity_count \u5FC5\u987B\u662F\u975E\u8D1F\u6574\u6570")
    if type(is_pity) is not bool:
        raise TypeError("is_pity \u5FC5\u987B\u662F\u5E03\u5C14\u503C")
    if len(__gacha_log) >= 200:
        raise RuntimeError("\u5355\u6B21\u8FD0\u884C\u6700\u591A\u62BD\u53D6 200 \u6B21")
    config = None
    if not __gacha_log:
        config = {"starting_money": globals().get("STARTING_MONEY"), "box_price": globals().get("BOX_PRICE"),
                  "pity_after": globals().get("PITY_AFTER"), "normal_weights": globals().get("NORMAL_WEIGHTS"),
                  "pity_weights": globals().get("PITY_WEIGHTS"), "styles": globals().get("STYLES")}
    __gacha_log.append({"number": len(__gacha_log) + 1, "tier": tier, "style": style, "money": money,
                        "pity_count": pity_count, "is_pity": is_pity, "config": config})`;
var gacha = stateful("gacha", (source2) => ({ source: source2 }), [
  on("editor.changed", (state, event) => {
    state.source = event.source;
  }, []),
  on("python.run", run, ["python.execute"])
]);
function run(state, _event, { emit }) {
  emit({ type: "python.execute", source: new Source(state.source, { prelude: PRELUDE }), options: {
    trace: { events: ["stmt", "call", "return"], observe: { globals: true, locals: true } },
    timeoutMs: 4e3,
    maxTraceSteps: 12e3
  } });
}
function create(bus) {
  const course = gacha.create(STARTER, bus);
  const player = playback2.create({}, bus);
  const execution2 = python3.create({}, bus);
  return () => {
    execution2.dispose();
    player.dispose();
    course.dispose();
  };
}
var examples = { random: { create, events: [{ type: "python.run" }] } };
function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function numberMap(value) {
  const source2 = record(value);
  if (!source2) return {};
  return Object.fromEntries(Object.entries(source2).filter((entry) => typeof entry[1] === "number"));
}
function stylesMap(value) {
  const source2 = record(value);
  if (!source2) return {};
  return Object.fromEntries(Object.entries(source2).map(([key, item]) => [key, Array.isArray(item) ? item.filter((name) => typeof name === "string") : []]));
}
function configOf(value) {
  const item = record(value);
  if (!item) return null;
  return { startingMoney: Number(item.starting_money), boxPrice: Number(item.box_price), pityAfter: Number(item.pity_after), normalWeights: numberMap(item.normal_weights), pityWeights: numberMap(item.pity_weights), styles: stylesMap(item.styles) };
}
function readGachaWorld(position, trace) {
  const count = position?.state.resources?.[RESOURCE] ?? 0;
  const values = trace?.resources[RESOURCE]?.slice(0, count) ?? [];
  const totalCount = trace?.resources[RESOURCE]?.length ?? values.length;
  let config = null;
  const draws = values.flatMap((value) => {
    const item = record(value);
    if (!item) return [];
    config ??= configOf(item.config);
    if (typeof item.number !== "number" || typeof item.tier !== "string" || typeof item.style !== "string" || typeof item.money !== "number") return [];
    return [{ number: item.number, tier: item.tier, style: item.style, money: item.money, pityCount: Number(item.pity_count), isPity: item.is_pity === true }];
  });
  return { config, draws, totalCount };
}
var TIER_COLOR = {
  SSS: "#d97706",
  S: "var(--pico-hue-fn-strong)",
  A: "var(--pico-accent)",
  B: "var(--pico-hue-branch-strong)",
  C: "var(--pico-ink-soft)"
};
function FigureSvg({ tier, style }) {
  if (tier === "SSS" || style === "\u94F6\u6CB3\u9690\u85CF\u6B3E") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "40", rx: "36", ry: "11", stroke: "#d97706", strokeWidth: "2", strokeDasharray: "5 3", transform: "rotate(-20 40 40)" }),
      /* @__PURE__ */ jsx("polygon", { points: "14,18 16,22 20,22 17,25 18,29 14,26 10,29 11,25 8,22 12,22", fill: "#ffd700" }),
      /* @__PURE__ */ jsx("polygon", { points: "68,26 69.5,29 73,29 70,31 71,35 68,32 65,35 66,31 63,29 66.5,29", fill: "#f59e0b" }),
      /* @__PURE__ */ jsx("circle", { cx: "24", cy: "22", r: "8", fill: "#ffd700", stroke: "#b45309", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "24", cy: "22", r: "4.5", fill: "#fef3c7" }),
      /* @__PURE__ */ jsx("circle", { cx: "56", cy: "22", r: "8", fill: "#ffd700", stroke: "#b45309", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "56", cy: "22", r: "4.5", fill: "#fef3c7" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "41", r: "25", fill: "var(--pico-surface-raised)", stroke: "#d97706", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "42", rx: "19", ry: "15", fill: "#fef3c7", stroke: "#f59e0b", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "33", cy: "40", r: "2.5", fill: "#0f172a" }),
      /* @__PURE__ */ jsx("circle", { cx: "34", cy: "39", r: "1", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("circle", { cx: "47", cy: "40", r: "2.5", fill: "#0f172a" }),
      /* @__PURE__ */ jsx("circle", { cx: "48", cy: "39", r: "1", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "46", rx: "3.5", ry: "2", fill: "#d97706" }),
      /* @__PURE__ */ jsx("polygon", { points: "40,8 42,13 47,13 43,16 45,21 40,18 35,21 37,16 33,13 38,13", fill: "#ffd700", stroke: "#b45309", strokeWidth: "1" })
    ] });
  }
  if (tier === "S" || style === "\u661F\u5149\u9F99") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("path", { d: "M26 28 C22 18 16 12 12 10 C16 18 20 24 24 32 Z", fill: "#818cf8", stroke: "#4338ca", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("path", { d: "M54 28 C58 18 64 12 68 10 C64 18 60 24 56 32 Z", fill: "#818cf8", stroke: "#4338ca", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("path", { d: "M18 42 C10 40 6 46 8 52 C14 50 18 46 22 45 Z", fill: "#c7d2fe", opacity: "0.7" }),
      /* @__PURE__ */ jsx("path", { d: "M62 42 C70 40 74 46 72 52 C66 50 62 46 58 45 Z", fill: "#c7d2fe", opacity: "0.7" }),
      /* @__PURE__ */ jsx("path", { d: "M40 22 C26 22 22 34 22 48 C22 62 34 68 40 70 C46 68 58 62 58 48 C58 34 54 22 40 22 Z", fill: "var(--pico-surface-raised)", stroke: "#6366f1", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("polygon", { points: "40,26 44,33 40,40 36,33", fill: "#38bdf8", stroke: "#0284c7", strokeWidth: "1" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "33", r: "1.5", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "31", cy: "46", rx: "4", ry: "5.5", fill: "#4338ca" }),
      /* @__PURE__ */ jsx("circle", { cx: "32", cy: "44.5", r: "1.8", fill: "#38bdf8" }),
      /* @__PURE__ */ jsx("circle", { cx: "30", cy: "48", r: "1", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "49", cy: "46", rx: "4", ry: "5.5", fill: "#4338ca" }),
      /* @__PURE__ */ jsx("circle", { cx: "50", cy: "44.5", r: "1.8", fill: "#38bdf8" }),
      /* @__PURE__ */ jsx("circle", { cx: "48", cy: "48", r: "1", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("path", { d: "M37 57 Q40 59 43 57", stroke: "#4338ca", strokeWidth: "2", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("polygon", { points: "36,58 38,62 39,58", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("polygon", { points: "41,58 42,62 44,58", fill: "#ffffff" })
    ] });
  }
  if (style === "\u8239\u957F\u732B") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("polygon", { points: "18,36 24,16 34,28", fill: "var(--pico-surface-raised)", stroke: "#0ea5e9", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("polygon", { points: "21,32 25,20 32,28", fill: "#bae6fd" }),
      /* @__PURE__ */ jsx("polygon", { points: "62,36 56,16 46,28", fill: "var(--pico-surface-raised)", stroke: "#0ea5e9", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("polygon", { points: "59,32 55,20 48,28", fill: "#bae6fd" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "46", r: "23", fill: "var(--pico-surface-raised)", stroke: "#0ea5e9", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("path", { d: "M16 32 C26 22 54 22 64 32 C68 36 60 40 56 38 C48 34 32 34 24 38 C20 40 12 36 16 32 Z", fill: "#0f172a", stroke: "#0ea5e9", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "28", r: "2", fill: "#ffd700" }),
      /* @__PURE__ */ jsx("path", { d: "M40 30 L40 36 M36 33 Q40 37 44 33", stroke: "#ffd700", strokeWidth: "1.5", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "32", cy: "46", rx: "3.5", ry: "4", fill: "#0284c7" }),
      /* @__PURE__ */ jsx("circle", { cx: "33", cy: "45", r: "1.2", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "48", cy: "46", rx: "3.5", ry: "4", fill: "#0284c7" }),
      /* @__PURE__ */ jsx("circle", { cx: "49", cy: "45", r: "1.2", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("polygon", { points: "38.5,52 41.5,52 40,54", fill: "#f43f5e" }),
      /* @__PURE__ */ jsx("path", { d: "M37 55 Q40 57 43 55", stroke: "#0f172a", strokeWidth: "1.5", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("line", { x1: "20", y1: "48", x2: "28", y2: "50", stroke: "#94a3b8", strokeWidth: "1.5", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("line", { x1: "60", y1: "48", x2: "52", y2: "50", stroke: "#94a3b8", strokeWidth: "1.5", strokeLinecap: "round" })
    ] });
  }
  if (tier === "A" || style === "\u6708\u7403\u718A") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("circle", { cx: "22", cy: "24", r: "9", fill: "#0ea5e9", stroke: "#0369a1", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "22", cy: "24", r: "5", fill: "#e0f2fe" }),
      /* @__PURE__ */ jsx("circle", { cx: "58", cy: "24", r: "9", fill: "#0ea5e9", stroke: "#0369a1", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "58", cy: "24", r: "5", fill: "#e0f2fe" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "43", r: "26", fill: "var(--pico-surface-raised)", stroke: "#0ea5e9", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "44", rx: "20", ry: "16", fill: "#f0f9ff", stroke: "#38bdf8", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("path", { d: "M40 16 A6 6 0 1 0 46 22 A4.5 4.5 0 1 1 40 16 Z", fill: "#0ea5e9" }),
      /* @__PURE__ */ jsx("circle", { cx: "33", cy: "42", r: "2.5", fill: "#0c4a6e" }),
      /* @__PURE__ */ jsx("circle", { cx: "34", cy: "41", r: "0.9", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("circle", { cx: "47", cy: "42", r: "2.5", fill: "#0c4a6e" }),
      /* @__PURE__ */ jsx("circle", { cx: "48", cy: "41", r: "0.9", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "49", rx: "6", ry: "4.5", fill: "#bae6fd" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "47.5", rx: "3", ry: "1.8", fill: "#0369a1" }),
      /* @__PURE__ */ jsx("path", { d: "M38 50 Q40 52 42 50", stroke: "#0369a1", strokeWidth: "1.5", strokeLinecap: "round" })
    ] });
  }
  if (style === "\u4FA6\u63A2\u72D7") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("ellipse", { cx: "17", cy: "46", rx: "7", ry: "15", fill: "#92400e", stroke: "#78350f", strokeWidth: "1.5", transform: "rotate(15 17 46)" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "63", cy: "46", rx: "7", ry: "15", fill: "#92400e", stroke: "#78350f", strokeWidth: "1.5", transform: "rotate(-15 63 46)" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "46", r: "23", fill: "var(--pico-surface-raised)", stroke: "#059669", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("path", { d: "M20 34 C24 18 56 18 60 34 C64 37 56 38 52 36 C44 34 36 34 28 36 C24 38 16 37 20 34 Z", fill: "#b45309", stroke: "#78350f", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "31", cy: "47", r: "2.5", fill: "#0f172a" }),
      /* @__PURE__ */ jsx("circle", { cx: "32", cy: "46", r: "0.9", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("circle", { cx: "49", cy: "47", r: "6", fill: "#ecfdf5", stroke: "#d97706", strokeWidth: "1.8" }),
      /* @__PURE__ */ jsx("circle", { cx: "49", cy: "47", r: "2.5", fill: "#0f172a" }),
      /* @__PURE__ */ jsx("circle", { cx: "50", cy: "46", r: "0.9", fill: "#ffffff" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "55", rx: "7", ry: "5", fill: "#fef3c7" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "53", rx: "3.5", ry: "2.2", fill: "#451a03" }),
      /* @__PURE__ */ jsx("path", { d: "M40 55 L40 58 M37 58 Q40 60 43 58", stroke: "#451a03", strokeWidth: "1.5", strokeLinecap: "round" })
    ] });
  }
  if (style === "\u5FCD\u8005\u732B") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("polygon", { points: "18,34 24,14 34,26", fill: "#1e293b", stroke: "#059669", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("polygon", { points: "62,34 56,14 46,26", fill: "#1e293b", stroke: "#059669", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "45", r: "23", fill: "var(--pico-surface-raised)", stroke: "#059669", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("path", { d: "M19 45 C19 58 29 68 40 68 C51 68 61 58 61 45 C61 44 48 48 40 48 C32 48 19 44 19 45 Z", fill: "#1e293b" }),
      /* @__PURE__ */ jsx("rect", { x: "20", y: "28", width: "40", height: "9", rx: "3", fill: "#047857" }),
      /* @__PURE__ */ jsx("rect", { x: "33", y: "29.5", width: "14", height: "6", rx: "2", fill: "#cbd5e1" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "31", cy: "41", rx: "4", ry: "2.8", fill: "#10b981" }),
      /* @__PURE__ */ jsx("circle", { cx: "31.5", cy: "40.5", r: "1.2", fill: "#064e3b" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "49", cy: "41", rx: "4", ry: "2.8", fill: "#10b981" }),
      /* @__PURE__ */ jsx("circle", { cx: "48.5", cy: "40.5", r: "1.2", fill: "#064e3b" })
    ] });
  }
  if (tier === "B" || style === "\u98DE\u884C\u718A") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("circle", { cx: "22", cy: "24", r: "8", fill: "#d97706", stroke: "#b45309", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "22", cy: "24", r: "4.5", fill: "#fde68a" }),
      /* @__PURE__ */ jsx("circle", { cx: "58", cy: "24", r: "8", fill: "#d97706", stroke: "#b45309", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("circle", { cx: "58", cy: "24", r: "4.5", fill: "#fde68a" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "45", r: "24", fill: "var(--pico-surface-raised)", stroke: "#059669", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("path", { d: "M18 40 C18 25 62 25 62 40 C62 44 58 46 54 44 C44 42 36 42 26 44 C22 46 18 44 18 40 Z", fill: "#78350f" }),
      /* @__PURE__ */ jsx("rect", { x: "23", y: "32", width: "15", height: "11", rx: "5", fill: "#a7f3d0", stroke: "#059669", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("rect", { x: "42", y: "32", width: "15", height: "11", rx: "5", fill: "#a7f3d0", stroke: "#059669", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("circle", { cx: "32", cy: "49", r: "2.5", fill: "#0f172a" }),
      /* @__PURE__ */ jsx("circle", { cx: "48", cy: "49", r: "2.5", fill: "#0f172a" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "54", rx: "5", ry: "3.5", fill: "#fed7aa" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "53", rx: "2.5", ry: "1.5", fill: "#78350f" }),
      /* @__PURE__ */ jsx("path", { d: "M38 56 Q40 58 42 56", stroke: "#78350f", strokeWidth: "1.5", strokeLinecap: "round" })
    ] });
  }
  if (style === "\u5E03\u4E01\u72D7") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("ellipse", { cx: "18", cy: "44", rx: "7", ry: "14", fill: "#fef08a", stroke: "#ca8a04", strokeWidth: "1.5", transform: "rotate(20 18 44)" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "62", cy: "44", rx: "7", ry: "14", fill: "#fef08a", stroke: "#ca8a04", strokeWidth: "1.5", transform: "rotate(-20 62 44)" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "46", r: "23", fill: "#fef9c3", stroke: "#ca8a04", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("path", { d: "M22 36 C24 22 56 22 58 36 C54 38 52 35 48 37 C44 39 42 35 38 37 C34 39 30 35 26 38 C23 38 21 37 22 36 Z", fill: "#92400e" }),
      /* @__PURE__ */ jsx("circle", { cx: "40", cy: "20", r: "4", fill: "#ef4444" }),
      /* @__PURE__ */ jsx("path", { d: "M40 18 Q44 12 46 14", stroke: "#15803d", strokeWidth: "1.5", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("circle", { cx: "32", cy: "46", r: "2.5", fill: "#451a03" }),
      /* @__PURE__ */ jsx("circle", { cx: "48", cy: "46", r: "2.5", fill: "#451a03" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "27", cy: "50", rx: "3", ry: "1.8", fill: "#fbcfe8" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "53", cy: "50", rx: "3", ry: "1.8", fill: "#fbcfe8" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "52", rx: "3.5", ry: "2.2", fill: "#451a03" }),
      /* @__PURE__ */ jsx("path", { d: "M37 55 Q40 58 43 55", stroke: "#451a03", strokeWidth: "1.5", strokeLinecap: "round" })
    ] });
  }
  if (style === "\u996D\u56E2\u732B") {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
      /* @__PURE__ */ jsx("polygon", { points: "20,32 26,16 36,26", fill: "var(--pico-surface-raised)", stroke: "#64748b", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("polygon", { points: "23,28 27,20 33,26", fill: "#fbcfe8" }),
      /* @__PURE__ */ jsx("polygon", { points: "60,32 54,16 44,26", fill: "var(--pico-surface-raised)", stroke: "#64748b", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("polygon", { points: "57,28 53,20 47,26", fill: "#fbcfe8" }),
      /* @__PURE__ */ jsx("path", { d: "M40 22 C52 22 62 38 62 54 C62 64 54 68 40 68 C26 68 18 64 18 54 C18 38 28 22 40 22 Z", fill: "var(--pico-surface-raised)", stroke: "#64748b", strokeWidth: "2.5" }),
      /* @__PURE__ */ jsx("rect", { x: "30", y: "52", width: "20", height: "16", rx: "3", fill: "#1e293b" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "36", cy: "30", rx: "1", ry: "1.8", fill: "#475569", transform: "rotate(25 36 30)" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "44", cy: "29", rx: "1", ry: "1.8", fill: "#475569", transform: "rotate(-20 44 29)" }),
      /* @__PURE__ */ jsx("path", { d: "M29 44 Q33 41 37 44", stroke: "#334155", strokeWidth: "1.8", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("path", { d: "M43 44 Q47 41 51 44", stroke: "#334155", strokeWidth: "1.8", strokeLinecap: "round" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "26", cy: "47", rx: "3", ry: "1.8", fill: "#fbcfe8" }),
      /* @__PURE__ */ jsx("ellipse", { cx: "54", cy: "47", rx: "3", ry: "1.8", fill: "#fbcfe8" }),
      /* @__PURE__ */ jsx("polygon", { points: "38.5,47.5 41.5,47.5 40,49", fill: "#f43f5e" })
    ] });
  }
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 80 80", className: "gacha-fig", fill: "none", children: [
    /* @__PURE__ */ jsx("circle", { cx: "22", cy: "24", r: "8", fill: "#bae6fd", stroke: "#38bdf8", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx("circle", { cx: "22", cy: "24", r: "4.5", fill: "#e0f2fe" }),
    /* @__PURE__ */ jsx("circle", { cx: "58", cy: "24", r: "8", fill: "#bae6fd", stroke: "#38bdf8", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx("circle", { cx: "58", cy: "24", r: "4.5", fill: "#e0f2fe" }),
    /* @__PURE__ */ jsx("circle", { cx: "40", cy: "45", r: "24", fill: "var(--pico-surface-raised)", stroke: "#64748b", strokeWidth: "2.5" }),
    /* @__PURE__ */ jsx("path", { d: "M50 12 L44 26", stroke: "#f43f5e", strokeWidth: "3.5", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("circle", { cx: "24", cy: "34", r: "3", fill: "#e0f2fe", stroke: "#38bdf8", strokeWidth: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "60", cy: "36", r: "2", fill: "#e0f2fe", stroke: "#38bdf8", strokeWidth: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "32", cy: "44", r: "2.5", fill: "#0f172a" }),
    /* @__PURE__ */ jsx("circle", { cx: "48", cy: "44", r: "2.5", fill: "#0f172a" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "28", cy: "48", rx: "3", ry: "1.8", fill: "#fbcfe8" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "52", cy: "48", rx: "3", ry: "1.8", fill: "#fbcfe8" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "50", rx: "6", ry: "4", fill: "#e0f2fe" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "40", cy: "48.5", rx: "2.5", ry: "1.5", fill: "#0284c7" }),
    /* @__PURE__ */ jsx("path", { d: "M38 51 Q40 53 42 51", stroke: "#0284c7", strokeWidth: "1.5", strokeLinecap: "round" })
  ] });
}
function BlindBoxSvg() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 120 120", className: "gacha-box-svg", fill: "none", children: [
    /* @__PURE__ */ jsx("ellipse", { cx: "60", cy: "106", rx: "42", ry: "9", fill: "var(--pico-hairline)", opacity: "0.6" }),
    /* @__PURE__ */ jsx("polygon", { points: "60,24 96,42 60,60 24,42", fill: "var(--pico-paper)", stroke: "var(--pico-hairline)", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx("polygon", { points: "24,42 60,60 60,98 24,80", fill: "var(--pico-surface-raised)", stroke: "var(--pico-hairline)", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx("polygon", { points: "60,60 96,42 96,80 60,98", fill: "var(--pico-surface)", stroke: "var(--pico-hairline)", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx("polygon", { points: "53,27 67,34 67,56 53,50", fill: "var(--pico-accent-wash)", stroke: "var(--pico-accent)", strokeWidth: "1" }),
    /* @__PURE__ */ jsx("polygon", { points: "38,49 46,53 46,91 38,87", fill: "var(--pico-accent)", opacity: "0.85" }),
    /* @__PURE__ */ jsx("polygon", { points: "74,53 82,49 82,87 74,91", fill: "var(--pico-accent)", opacity: "0.75" }),
    /* @__PURE__ */ jsx("ellipse", { cx: "60", cy: "39", rx: "8", ry: "4.5", fill: "var(--pico-accent-wash)", stroke: "var(--pico-accent)", strokeWidth: "1.2" }),
    /* @__PURE__ */ jsx("circle", { cx: "60", cy: "39", r: "2.5", fill: "var(--pico-accent)" }),
    /* @__PURE__ */ jsx("circle", { cx: "42", cy: "70", r: "10", fill: "var(--pico-surface-raised)", stroke: "var(--pico-accent)", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx("text", { x: "42", y: "75", textAnchor: "middle", fill: "var(--pico-accent-deep)", fontFamily: "var(--pico-font-ui)", fontWeight: "900", fontSize: "14", children: "?" })
  ] });
}
function GachaWorldView({ world }) {
  const { draws, totalCount } = world;
  const [inspectedNum, setInspectedNum] = useState(null);
  const isFinal = totalCount > 0 && draws.length >= totalCount;
  const currentDraw = inspectedNum !== null ? draws.find((d) => d.number === inspectedNum) : !isFinal && draws.length > 0 ? draws.at(-1) : null;
  return /* @__PURE__ */ jsxs("div", { className: "gacha-world", children: [
    /* @__PURE__ */ jsx("style", { children: STYLE }),
    /* @__PURE__ */ jsx("div", { className: "gacha-stage", children: draws.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "gacha-box-hero", children: [
      /* @__PURE__ */ jsx(BlindBoxSvg, {}),
      /* @__PURE__ */ jsx("span", { className: "gacha-box-label", children: "\u76F2\u76D2" })
    ] }) : currentDraw ? /* @__PURE__ */ jsx("div", { className: "gacha-card-hero", onClick: () => {
      if (isFinal) setInspectedNum(null);
    }, style: { cursor: isFinal ? "pointer" : "default" }, children: /* @__PURE__ */ jsxs("div", { className: "gacha-card", style: { borderColor: TIER_COLOR[currentDraw.tier] ?? "var(--pico-hairline)" }, children: [
      /* @__PURE__ */ jsx("div", { className: "gacha-card-head", children: /* @__PURE__ */ jsx("span", { className: "gacha-card-tier", style: { background: TIER_COLOR[currentDraw.tier] ?? "var(--pico-accent)" }, children: currentDraw.tier }) }),
      /* @__PURE__ */ jsx("div", { className: "gacha-card-art", children: /* @__PURE__ */ jsx(FigureSvg, { tier: currentDraw.tier, style: currentDraw.style }) }),
      /* @__PURE__ */ jsxs("div", { className: "gacha-card-foot", children: [
        /* @__PURE__ */ jsx("strong", { className: "gacha-card-title", children: currentDraw.style }),
        currentDraw.isPity && /* @__PURE__ */ jsx("span", { className: "gacha-card-pity", children: "\u4FDD\u5E95\u51FA\u8D27" })
      ] })
    ] }) }) : /* @__PURE__ */ jsxs("div", { className: "gacha-grid-hero", children: [
      /* @__PURE__ */ jsx("div", { className: "gacha-grid-head", children: /* @__PURE__ */ jsx("span", { className: "gacha-grid-title", children: "\u62BD\u53D6\u6210\u679C" }) }),
      /* @__PURE__ */ jsx("div", { className: "gacha-grid-items", children: draws.map((draw) => {
        const color = TIER_COLOR[draw.tier] ?? "var(--pico-accent)";
        const isHigh = draw.tier === "SSS" || draw.tier === "S";
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `gacha-grid-item ${isHigh ? "gacha-high" : ""}`,
            style: { borderColor: isHigh ? color : void 0 },
            onClick: () => setInspectedNum(draw.number),
            children: [
              /* @__PURE__ */ jsx("span", { className: "gacha-grid-tier", style: { background: color }, children: draw.tier }),
              /* @__PURE__ */ jsx(FigureSvg, { tier: draw.tier, style: draw.style }),
              /* @__PURE__ */ jsx("span", { className: "gacha-grid-name", children: draw.style })
            ]
          },
          draw.number
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "gacha-rail", children: [
      /* @__PURE__ */ jsxs("div", { className: "gacha-rail-head", children: [
        /* @__PURE__ */ jsx("span", { children: "\u5DF2\u62BD\u51FA" }),
        /* @__PURE__ */ jsxs("span", { className: "gacha-rail-count", children: [
          draws.length,
          "/",
          totalCount || 10
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "gacha-rail-list", children: draws.map((draw) => {
        const isSelected = currentDraw?.number === draw.number;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `gacha-rail-item ${isSelected ? "active" : ""}`,
            onClick: () => setInspectedNum(inspectedNum === draw.number ? null : draw.number),
            children: [
              /* @__PURE__ */ jsx("span", { className: "gacha-rail-tag", style: { background: TIER_COLOR[draw.tier] ?? "var(--pico-accent)" }, children: draw.tier }),
              /* @__PURE__ */ jsx("span", { className: "gacha-rail-name", children: draw.style })
            ]
          },
          draw.number
        );
      }) })
    ] })
  ] });
}
var STYLE = `.gacha-world{height:100%;display:grid;grid-template-columns:1fr 130px;background:var(--pico-paper);overflow:hidden;font:600 var(--pico-size-xs)/1.3 var(--pico-font-ui);color:var(--pico-ink)}.gacha-stage{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;position:relative;overflow:auto}.gacha-rail{border-left:var(--pico-line);background:var(--pico-surface);display:flex;flex-direction:column;overflow:hidden}.gacha-rail-head{padding:8px 10px;font-size:11px;font-weight:700;color:var(--pico-ink-soft);border-bottom:var(--pico-line);display:flex;justify-content:space-between;align-items:center}.gacha-rail-count{font-family:var(--pico-font-mono)}.gacha-rail-list{flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px}.gacha-rail-item{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:var(--pico-radius-sm);background:var(--pico-surface-raised);border:var(--pico-line);cursor:pointer;font-size:12px;font-weight:600;transition:all .15s}.gacha-rail-item:hover,.gacha-rail-item.active{border-color:var(--pico-accent);box-shadow:var(--pico-shadow)}.gacha-rail-num{font-family:var(--pico-font-mono);font-size:11px;color:var(--pico-ink-soft);width:18px}.gacha-rail-tag{font-size:10px;font-weight:800;padding:1px 4px;border-radius:3px;color:#fff}.gacha-rail-name{color:var(--pico-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}.gacha-box-hero{display:flex;flex-direction:column;align-items:center;gap:14px}.gacha-box-svg{width:130px;height:130px;filter:drop-shadow(0 8px 18px rgba(15,23,42,.08));animation:gacha-float 3s ease-in-out infinite}.gacha-box-label{font-size:13px;font-weight:700;color:var(--pico-ink-soft);padding:4px 14px;border-radius:20px;background:var(--pico-surface-raised);border:var(--pico-line)}.gacha-card-hero{display:flex;flex-direction:column;align-items:center;gap:12px}.gacha-card{width:190px;height:250px;border-radius:12px;background:var(--pico-surface-raised);border:2px solid;box-shadow:var(--pico-shadow-float);display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:14px;position:relative}.gacha-card-head{width:100%;display:flex;justify-content:center;align-items:center}.gacha-card-tier{font-size:11px;font-weight:800;padding:2px 7px;border-radius:4px;color:#fff}.gacha-card-art{flex:1;display:flex;align-items:center;justify-content:center;width:100%}.gacha-card-art svg{width:86px;height:86px}.gacha-card-foot{display:flex;flex-direction:column;align-items:center;gap:2px}.gacha-card-title{font-size:16px;font-weight:800;color:var(--pico-ink)}.gacha-card-pity{font-size:10px;font-weight:700;color:var(--pico-hue-loop-strong)}.gacha-grid-hero{width:100%;max-width:620px;display:flex;flex-direction:column;gap:10px}.gacha-grid-head{display:flex;justify-content:space-between;align-items:center}.gacha-grid-title{font-size:13px;font-weight:800;color:var(--pico-ink)}.gacha-grid-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px}.gacha-grid-item{background:var(--pico-surface-raised);border:1.5px solid var(--pico-hairline);border-radius:8px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;box-shadow:var(--pico-shadow);transition:all .15s}.gacha-grid-item:hover{transform:translateY(-2px);box-shadow:var(--pico-shadow-float)}.gacha-grid-item.gacha-high{box-shadow:0 3px 10px rgba(217,119,6,.15)}.gacha-grid-item svg{width:42px;height:42px}.gacha-grid-tier{font-size:9px;font-weight:800;color:#fff;padding:1px 4px;border-radius:3px}.gacha-grid-name{font-size:11px;font-weight:700;color:var(--pico-ink);text-align:center;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}@keyframes gacha-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`;
var layoutOptions = { open: ["viz", "debug"], ratio: 0.42, tree: { split: "column", children: [{ slot: "viz" }, { slot: "debug" }], key: "world" } };
var mountOptions = { ...pythonOptions({ playback: { stepMs: 120 } }), filename: "gacha.py", layout: layoutOptions, automatic: 500, start: [{ type: "python.run" }] };
var starter = STARTER;
var GACHA_SCRIPT = gacha_script_default;
var gachaState = provided2("gacha.state");
var GACHA_SESSION = pythonSession({
  world: { title: "\u76F2\u76D2\u5B9E\u9A8C\u53F0", render: (view) => {
    const playing = view.get(playbackHost2);
    return /* @__PURE__ */ jsx(GachaWorldView, { world: readGachaWorld(playing?.position ?? null, playing?.trace ?? null) });
  } },
  provide: (view) => [gachaState.with(view.state)],
  ai: courseAi({
    explain: "\u8FD9\u6BB5\u4EE3\u7801\u628A\u6982\u7387\u8868\u3001\u4FDD\u5E95\u9009\u62E9\u548C\u62BD\u5361\u5FAA\u73AF\u5206\u5F00\u3002\u5148\u770B\u5F53\u524D\u53D8\u91CF\u5C5E\u4E8E\u89C4\u5219\u3001\u72B6\u6001\u8FD8\u662F\u672C\u6B21\u968F\u673A\u7ED3\u679C\u3002",
    question: "\u5148\u6539\u4E00\u4E2A\u53C2\u6570\u518D\u8FD0\u884C\uFF1A\u94B1\u548C\u5355\u4EF7\u51B3\u5B9A\u62BD\u6570\uFF0C\u6743\u91CD\u51B3\u5B9A\u957F\u671F\u6BD4\u4F8B\uFF0CPITY_AFTER \u51B3\u5B9A\u4F55\u65F6\u6362\u6210\u4FDD\u5E95\u8868\u3002"
  }),
  scripts: [GACHA_SCRIPT]
});
var GACHA_COURSE = {
  name: "\u8BBE\u8BA1\u4E00\u53F0\u76F2\u76D2\u673A",
  component: gacha,
  starter: STARTER,
  playground: mountOptions,
  session: GACHA_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: GACHA_COURSE, host });
}
export {
  GACHA_COURSE,
  GACHA_SCRIPT,
  Root,
  STARTER,
  examples,
  gacha,
  readGachaWorld,
  starter
};
