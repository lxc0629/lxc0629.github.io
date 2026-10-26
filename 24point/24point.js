// playgrounds/24point/24point.generated.tsx
import { useEffect, useState } from "../libs/react.js";
import { on, stateful } from "../pico.js";
import { Source } from "../pico.js";
import { python as execution } from "../pico.js";
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
      const execution2 = own(python2.create(options.python ?? {}, bus));
      own({ dispose: bus.subscribe(["playback.changed"], () => {
        const { position } = playing.state;
        const result = execution2.state.result;
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
      observe("python", () => ({ ...execution2.state }), ["python.changed"]);
      observe("playback", () => ({ ...playing.state }), ["playback.changed"]);
      observe("selection", () => focus.state, ["selection.changed"]);
      return { python: execution2.state, playback: playing.state, terminal: output, debugger: debugging, selection: focus.state };
    }
  };
}

// playgrounds/24point/24point.generated.tsx
import { Fragment, jsx, jsxs } from "../libs/react.js";
var persistent = /* @__PURE__ */ new WeakSet();
var point24gpt = stateful("point24gpt", (options) => {
  const state = { source: options.source ?? initialSource, choice: "0", completed: [...options.completed ?? (options.persist ? readCompleted() : [])] };
  if (options.persist) persistent.add(state);
  return state;
}, [
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
]);
function createExample(bus) {
  const course = point24gpt.create({}, bus);
  const player = playback2.create({}, bus);
  const runner = execution.create({}, bus);
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
  return `assets/playing-cards/${rank}_of_${card.suit}.svg`;
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
var layoutOptions = { open: ["world"], ratio: 0.4 };
function makeRequest(source, cards) {
  return {
    source,
    prelude: `${evaluator}
_p24 = _calculate24(${JSON.stringify(source)}, ${JSON.stringify(cards.map((card) => card.value))})
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
var savedOptions = { persist: true };
var mountOptions = { ...pythonOptions(), filename: "24point-gpt.py", layout: layoutOptions };
var starter = initialSource;
function Root(host = {}) {
  const view = usePlayground(point24gpt, { ...savedOptions, source: host.source ?? initialSource }, { ...mountOptions, ...host.options });
  const selected = view?.state.choice ?? "0";
  const hasRun = view?.parts.python.result.status === "pending" || view?.parts.python.result.status === "ready" && view.parts.python.result.value !== null;
  const execution2 = view?.parts.python.result;
  const calculation = view?.parts.playback.trace ? calculationFromTrace(view.parts.playback.trace) : null;
  const isCompleted = (choice) => view?.state.completed.includes(choice) === true;
  if (!view) return /* @__PURE__ */ jsx(Fragment, {});
  const cards = cases[Number(selected)];
  return /* @__PURE__ */ jsx(
    PlaygroundShell,
    {
      name: "24 \u70B9",
      layout: view.layout,
      onEvent: view.send,
      menu: view.menu,
      editor: view ? /* @__PURE__ */ jsx(Widget, { widget: view.editor }) : null,
      toolbar: [...view.toolbar, { controls: [{
        kind: "choices",
        label: "\u9898\u76EE",
        value: selected,
        choices: cases.map((_, index) => ({
          value: String(index),
          event: { type: "point24gpt.select", choice: String(index) },
          title: `\u7B2C ${index + 1} \u9898${isCompleted(String(index)) ? "\uFF0C\u5DF2\u5B8C\u6210" : ""}`,
          label: /* @__PURE__ */ jsxs("span", { style: { color: isCompleted(String(index)) ? "var(--pico-hue-branch-strong)" : void 0 }, children: [
            index + 1,
            isCompleted(String(index)) && /* @__PURE__ */ jsx("span", { "aria-label": "\u6B63\u786E", children: " \u2713" })
          ] })
        }))
      }, {
        kind: "button",
        icon: "play",
        label: "\u8FD0\u884C",
        disabled: !view || execution2?.status === "pending",
        event: { type: "python.run" }
      }] }],
      panels: [{
        key: "world",
        title: "\u5361\u724C",
        icon: "viz",
        flush: true,
        content: /* @__PURE__ */ jsx("div", { className: "pico-scene", children: execution2?.status === "failed" ? /* @__PURE__ */ jsx("div", { role: "alert", style: { color: errorInk }, children: "\u2717 \u8FD0\u884C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5" }) : /* @__PURE__ */ jsx(Replay, { cards, calculation, hand: !hasRun }) })
      }]
    }
  );
}
export {
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
