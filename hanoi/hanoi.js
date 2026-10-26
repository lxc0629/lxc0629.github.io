// playgrounds/hanoi/hanoi.generated.tsx
import { useEffect, useId, useRef, useState } from "../libs/react.js";
import { on, stateful } from "../pico.js";
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

// playgrounds/hanoi/hanoi.generated.tsx
import { python as python3 } from "../pico.js";
import { playback as playback2 } from "../pico.js";
import { Source } from "../pico.js";
import { sourceOccurrences, variableTimeline as variableTimeline2 } from "../pico.js";
import { Fragment, jsx, jsxs } from "../libs/react.js";
var layoutOptions = { open: ["viz", "debug"] };
function diskId(disk) {
  return `disk:${disk}`;
}
var DISK_OBJECT = /^disk:(\d+)$/;
function selectedDisk(selection2, trace) {
  if (selection2 === null || selection2.kind !== "world-object" || trace === null || selection2.run !== trace) return null;
  const match = DISK_OBJECT.exec(selection2.objectId);
  return match === null ? null : Number(match[1]);
}
var HANOI_PITFALLS = [
  { kind: "pitfall-loop", label: "\u628A while \u6539\u6210 if" },
  { kind: "pitfall-base", label: "\u628A n == 1 \u6539\u6210 n == 0" }
];
var HANOI_PROMPTS = [
  "\u4ECE\u7A7A\u767D\u5F00\u59CB\u6559\u6211\u5199 Python \u8BED\u6CD5",
  "\u4E3A\u4EC0\u4E48\u8FD9\u6BB5\u7B97\u6CD5\u8981\u7528\u9012\u5F52\uFF1F",
  "\u89E3\u91CA\u5668\u600E\u6837\u6267\u884C\u6211\u9009\u4E2D\u7684\u8FD9\u4E00\u53E5\uFF1F",
  "\u8FD9\u6BB5\u4EE3\u7801\u6700\u5BB9\u6613\u8E29\u4EC0\u4E48\u5751\uFF1F"
];
function hanoiAIResponse(question) {
  if (/如果|改成|换成|删掉|还对吗|会怎样|坑|陷阱|反例|深入/.test(question)) return {
    intent: "experiment",
    title: "\u5148\u522B\u731C\uFF0C\u6539\u4E00\u5904\u518D\u8DD1",
    body: "\u4E0B\u9762\u4E24\u4E2A\u6539\u52A8\u5404\u53EA\u52A8\u4E00\u884C\uFF0C\u6539\u5B8C\u4ECD\u7531\u5F53\u524D Runner\u3001Trace \u548C\u76D8\u5B50\u53EF\u89C6\u5316\u7ED9\u51FA\u7ED3\u8BBA\u3002\u5148\u770B\u8F93\u51FA\u5C11\u4E86\u51E0\u6B65\uFF0C\u518D\u770B\u8C03\u8BD5\u91CC\u7B2C\u4E00\u6B21\u51FA\u73B0\u5DEE\u5F02\u7684\u4F4D\u7F6E\u3002",
    action: null,
    chips: HANOI_PITFALLS
  };
  if (/调试|错误|报错|不对|定位/.test(question)) return {
    intent: "debug",
    title: "\u4ECE\u5F53\u524D\u8BC1\u636E\u5F00\u59CB\u5B9A\u4F4D",
    body: "\u5148\u505C\u5728\u79BB\u5F53\u524D\u9009\u62E9\u6700\u8FD1\u7684\u4E00\u6B21\u6267\u884C\uFF0C\u518D\u9010\u6B65\u89C2\u5BDF Editor\u3001Variables \u548C\u76D8\u5B50\u3002\u7B2C\u4E00\u4E2A\u548C\u9884\u671F\u4E0D\u4E00\u6837\u7684\u4F4D\u7F6E\u624D\u662F\u6709\u6548\u7EBF\u7D22\u3002",
    action: { kind: "locate", label: "\u5B9A\u4F4D\u76F8\u5173\u6267\u884C" },
    chips: []
  };
  if (/语法|规则|写法|怎么写|缩进|括号/.test(question)) return {
    intent: "syntax",
    title: "\u4E00\u6BB5\u4E00\u6BB5\u5199\u51FA\u5408\u6CD5 Python",
    body: "Editor \u4F1A\u4ECE\u7A7A\u767D\u5F00\u59CB\uFF0C\u6211\u6BCF\u6B21\u53EA\u5199\u4E00\u5C0F\u6BB5\u53EF\u4EE5\u8FD0\u884C\u7684\u4EE3\u7801\uFF0C\u5E76\u8BF4\u660E\u8FD9\u4E00\u6BB5\u4E3A\u4EC0\u4E48\u5408\u6CD5\u3002\u505C\u5728\u54EA\u4E00\u6BB5\u90FD\u53EF\u4EE5\u81EA\u5DF1\u63A5\u7740\u6539\u3002",
    action: { kind: "lesson-syntax", label: "\u4ECE\u7A7A\u767D\u5F00\u59CB\u5199" },
    chips: []
  };
  if (/内核|解释器|执行|调用栈|栈帧|字节码|绑定/.test(question)) return {
    intent: "runtime",
    title: "\u8FD9\u4E00\u53E5\u5982\u4F55\u8FDB\u5165\u6267\u884C",
    body: "\u89E3\u91CA\u5668\u5148\u5728\u5F53\u524D\u8C03\u7528\u5E27\u91CC\u6C42\u503C\u53C2\u6570\uFF0C\u518D\u5EFA\u7ACB\u65B0\u7684\u53C2\u6570\u7ED1\u5B9A\u3002Runner \u628A\u8BED\u53E5\u3001\u5E27\u548C\u503C\u53D8\u5316\u8BB0\u5165 Trace\uFF0C\u754C\u9762\u53EA\u8BFB\u53D6\u8FD9\u4E9B\u4E8B\u5B9E\u3002",
    action: { kind: "locate", label: "\u5B9A\u4F4D\u5F53\u524D\u6267\u884C" },
    chips: []
  };
  if (/算法|为什么|递归|思路|原理/.test(question)) return {
    intent: "algorithm",
    title: "\u628A\u4E00\u6B21\u8C03\u7528\u770B\u6210\u4E00\u4E2A\u627F\u8BFA",
    body: "hanoi(n, src, dst) \u53EA\u627F\u8BFA\u4E00\u4EF6\u4E8B\uFF1A\u628A n \u4E2A\u76D8\u5B50\u4ECE\u8FD9\u91CC\u642C\u5230\u90A3\u91CC\u3002\u5B83\u4E0D\u5173\u5FC3\u8FC7\u7A0B\u4E2D\u8C01\u5728\u52A8\uFF0C\u53EA\u628A\u4EFB\u52A1\u62C6\u6210\u66F4\u5C0F\u7684\u540C\u4E00\u4E2A\u627F\u8BFA\u3002",
    action: { kind: "lesson-algorithm", label: "\u4ECE\u4EE3\u7801\u5F00\u59CB\u62C6\u89E3" },
    chips: HANOI_PITFALLS
  };
  return {
    intent: "logic",
    title: "\u8F93\u5165\u3001\u52A8\u4F5C\u548C\u7ED3\u679C",
    body: "\u5F53\u524D\u8BED\u53E5\u5148\u8BFB\u53D6\u8FD9\u4E00\u5C42\u8C03\u7528\u5E27\u91CC\u7684\u503C\uFF0C\u518D\u4EA7\u751F\u5B50\u8C03\u7528\u3001\u53D8\u91CF\u53D8\u5316\u6216\u4E00\u6B21\u8F93\u51FA\u3002\u53EF\u4EE5\u5B9A\u4F4D\u5230\u672C\u6B21\u6267\u884C\u9010\u6B65\u9A8C\u8BC1\u3002",
    action: { kind: "locate", label: "\u5B9A\u4F4D\u76F8\u5173\u6267\u884C" },
    chips: HANOI_PITFALLS
  };
}
var STARTER = `def next_of(peg):
    return {"A": "B", "B": "C", "C": "A"}[peg]

def hanoi(n, src, dst):
    aux, = set("ABC") - {src, dst}

    if n == 1:
        while src != dst:
            print(f"{src} -> {next_of(src)}")
            src = next_of(src)
        return

    if next_of(src) == dst:
        hanoi(n - 1, src, aux)
        hanoi(1, src, dst)
        hanoi(n - 1, aux, dst)
    else:
        hanoi(n - 1, src, dst)
        hanoi(1, src, aux)
        hanoi(n - 1, dst, src)
        hanoi(1, aux, dst)
        hanoi(n - 1, src, dst)
`;
var ARBITRARY_PYTHON_EXAMPLE = `items = [1, 2]
items.append(3)
print(items)
`;
function hanoiDriver(source, disks) {
  return /^def\s+hanoi\s*\(\s*n\s*,\s*src\s*,\s*dst\s*\)/m.test(source) ? `hanoi(${disks}, "A", "C")
` : "";
}
var HANOI_LESSONS = {
  syntax: [
    {
      title: "\u5148\u5199\u4E00\u4E2A\u80FD\u8FD0\u884C\u7684\u51FD\u6570",
      body: "\u51FD\u6570\u7528 def \u5F00\u5934\uFF0C\u53C2\u6570\u5199\u5728\u62EC\u53F7\u91CC\uFF0C\u5192\u53F7\u540E\u5FC5\u987B\u7F29\u8FDB\u3002\u5148\u53EA\u5199\u6700\u5916\u9762\u7684\u4E00\u5C42\uFF0C\u8BA9\u8FD9\u4E00\u5C0F\u6BB5\u80FD\u5355\u72EC\u8DD1\u8D77\u6765\u3002",
      source: `def next_of(peg):
    return {"A": "B", "B": "C", "C": "A"}[peg]


print(next_of("A"))
`
    },
    {
      title: "\u7B2C\u4E8C\u4E2A\u51FD\u6570\u5148\u7528 pass \u5360\u4F4D",
      body: "pass \u662F\u5408\u6CD5\u7684\u7A7A\u8BED\u53E5\uFF1A\u51FD\u6570\u5B58\u5728\u3001\u53EF\u4EE5\u8C03\u7528\uFF0C\u4F46\u4EC0\u4E48\u4E5F\u4E0D\u505A\u3002\u5148\u7528\u5B83\u628A\u9AA8\u67B6\u642D\u8D77\u6765\uFF0C\u5C31\u4E0D\u5FC5\u4E00\u6B21\u5199\u5BF9\u5168\u90E8\u3002",
      source: `def next_of(peg):
    return {"A": "B", "B": "C", "C": "A"}[peg]


def hanoi(n, src, dst):
    pass


print(next_of("A"))
hanoi(1, "A", "C")
`
    },
    {
      title: "\u518D\u52A0\u5224\u65AD\u548C\u5FAA\u73AF",
      body: "if \u540E\u9762\u7684\u4EE3\u7801\u5757\u540C\u6837\u8981\u7F29\u8FDB\uFF1Breturn \u7ED3\u675F\u8FD9\u4E00\u5C42\u8C03\u7528\u3002f \u5B57\u7B26\u4E32\u91CC\u7528\u5927\u62EC\u53F7\u53D6\u53D8\u91CF\u503C\uFF0C\u6240\u4EE5\u80FD\u5728\u8F93\u51FA\u91CC\u770B\u5230\u67F1\u5B50\u540D\u3002",
      source: `def next_of(peg):
    return {"A": "B", "B": "C", "C": "A"}[peg]


def hanoi(n, src, dst):
    aux, = set("ABC") - {src, dst}
    if n == 1:
        while src != dst:
            print(f"{src} -> {next_of(src)}")
            src = next_of(src)
        return


hanoi(1, "A", "C")
`
    }
  ],
  algorithm: [
    {
      title: "\u5148\u53EA\u770B\u4EFB\u52A1\uFF0C\u4E0D\u642C\u76D8\u5B50",
      body: "\u4E00\u6B21\u8C03\u7528\u5C31\u662F\u4E00\u9879\u4EFB\u52A1\uFF1A\u628A n \u4E2A\u76D8\u5B50\u4ECE src \u642C\u5230 dst\u3002\u5148\u53EA\u628A\u4EFB\u52A1\u6253\u5370\u51FA\u6765\uFF0C\u786E\u8BA4\u81EA\u5DF1\u80FD\u7528\u4E00\u53E5\u8BDD\u8BF4\u6E05\u5B83\u3002",
      source: `def hanoi(n, src, dst):
    aux, = set("ABC") - {src, dst}
    print("\u4EFB\u52A1", n, src, "->", dst, "\u501F\u9053", aux)


hanoi(3, "A", "C")
`
    },
    {
      title: "\u518D\u52A0\u51FA\u53E3\uFF1A\u53EA\u5269\u4E00\u4E2A\u76D8\u5B50",
      body: "\u9012\u5F52\u5FC5\u987B\u5148\u6709\u51FA\u53E3\u3002n \u7B49\u4E8E 1 \u65F6\u4E0D\u9700\u8981\u4EFB\u4F55\u5B50\u4EFB\u52A1\uFF0C\u76F4\u63A5\u642C\u8D70\u5C31\u7ED3\u675F\u8FD9\u4E00\u5C42\u3002",
      source: `def hanoi(n, src, dst):
    aux, = set("ABC") - {src, dst}
    if n == 1:
        print("\u642C 1 \u4E2A", src, "->", dst)
        return
    print("\u62C6\u6210\u4E09\u4EF6\u4E8B", n, src, aux, dst)


hanoi(3, "A", "C")
`
    },
    {
      title: "\u628A\u4EFB\u52A1\u62C6\u6210\u4E09\u4E2A\u66F4\u5C0F\u7684\u81EA\u5DF1",
      body: "\u628A n-1 \u4E2A\u642C\u5230 aux\uFF0C\u628A\u6700\u5927\u7684\u642C\u5230 dst\uFF0C\u518D\u628A n-1 \u4E2A\u642C\u5230 dst\u3002\u4E09\u6B21\u5B50\u8C03\u7528\u4ECD\u7136\u662F\u540C\u4E00\u4E2A\u627F\u8BFA\uFF0C\u53EA\u662F\u76D8\u5B50\u5C11\u4E86\u4E00\u4E2A\u3002",
      source: `def hanoi(n, src, dst):
    aux, = set("ABC") - {src, dst}
    if n == 1:
        print("\u642C 1 \u4E2A", src, "->", dst)
        return
    hanoi(n - 1, src, aux)
    hanoi(1, src, dst)
    hanoi(n - 1, aux, dst)


hanoi(3, "A", "C")
`
    }
  ]
};
var CASE_CHOICES = [3, 4, 5, 6].map((n) => ({
  value: String(n),
  label: String(n),
  title: `${n} \u4E2A\u76D8\u5B50`
}));
var hanoi = stateful("hanoi", (source) => ({ source, disks: 3, lesson: false }), [
  on("editor.changed", (state, event, { emit }) => {
    if (state.source === event.source) return;
    state.source = event.source;
    emit({ type: "python.clear" });
  }),
  on("hanoi.lesson.changed", (state, { active }) => {
    state.lesson = active;
  }),
  on("python.run", (state, _event, { emit }) => {
    emit({ type: "python.execute", source: new Source(state.source, { driver: state.lesson ? "" : hanoiDriver(state.source, state.disks) }), options: {
      trace: { events: ["call", "stmt", "return"], observe: { globals: true, locals: true } },
      timeoutMs: 1e4,
      maxTraceSteps: 2e4
    } });
  }),
  on("hanoi.disks.changed", (state, { disks }, { emit }) => {
    if (disks === state.disks || ![3, 4, 5, 6].includes(disks)) return;
    state.disks = disks;
    emit({ type: "python.clear" });
    emit({ type: "python.run" });
  })
]);
function create(bus) {
  const course = hanoi.create(STARTER, bus);
  const playing = playback2.create({}, bus);
  const execution = python3.create({}, bus);
  bus.emit({ type: "python.run" });
  return () => {
    execution.dispose();
    playing.dispose();
    course.dispose();
  };
}
var examples = {
  starter: { create, events: [] },
  fourDisks: { create, events: [{ type: "hanoi.disks.changed", disks: 4 }] },
  lessonSyntaxStart: { create, events: [
    { type: "hanoi.lesson.changed", active: true },
    { type: "editor.changed", source: HANOI_LESSONS.syntax[0].source },
    { type: "python.run" }
  ] },
  arbitraryPython: { create, events: [
    { type: "editor.changed", source: ARBITRARY_PYTHON_EXAMPLE },
    { type: "python.run" }
  ] }
};
var mountOptions = { ...pythonOptions(), filename: "hanoi.py", layout: layoutOptions, automatic: 500, start: [{ type: "python.run" }] };
var starter = STARTER;
var CLOSED_AI = {
  open: false,
  mode: "chat",
  lesson: "syntax",
  step: 0,
  writing: false,
  composing: true,
  messages: [],
  input: "",
  history: [],
  historyOpen: false
};
function conversationTitle(messages) {
  const first = messages.find((message) => message.role === "user")?.text ?? messages.find((message) => message.role === "assistant")?.title ?? "AI \u6559\u5B66";
  return first.length > 28 ? `${first.slice(0, 28)}\u2026` : first;
}
function typingDelay(character) {
  if (character === "\n") return 320;
  if (character === ":") return 210;
  if (/[)\]}]/.test(character)) return 120;
  if (character === ",") return 85;
  if (/\s/.test(character)) return 28;
  return 42;
}
function selectedCodeAIResponse(code) {
  const line = code.trim();
  if (/^def\s+/.test(line)) return {
    intent: "syntax",
    title: "\u8FD9\u53E5\u5728\u5B9A\u4E49\u51FD\u6570",
    body: "def \u628A\u51FD\u6570\u540D\u3001\u53C2\u6570\u5217\u8868\u548C\u540E\u7EED\u7F29\u8FDB\u4EE3\u7801\u5757\u7ED1\u5B9A\u5728\u4E00\u8D77\u3002\u6267\u884C\u5230\u5B9A\u4E49\u8BED\u53E5\u65F6\uFF0CPython \u521B\u5EFA\u51FD\u6570\u5BF9\u8C61\uFF0C\u4F46\u4E0D\u4F1A\u7ACB\u523B\u6267\u884C\u51FD\u6570\u4F53\uFF1B\u7B49\u5230\u540E\u9762\u8C03\u7528\u5B83\u65F6\u624D\u4F1A\u5EFA\u7ACB\u65B0\u7684\u8C03\u7528\u5E27\u3002",
    action: { kind: "locate", label: "\u770B\u5B83\u4F55\u65F6\u6267\u884C" },
    chips: []
  };
  if (/^if\s+/.test(line)) return {
    intent: "logic",
    title: "\u8FD9\u662F\u4E00\u6B21\u5206\u652F\u5224\u65AD",
    body: "Python \u5148\u6C42\u51FA\u5192\u53F7\u524D\u8868\u8FBE\u5F0F\u7684\u771F\u5047\uFF0C\u53EA\u5728\u7ED3\u679C\u4E3A True \u65F6\u8FDB\u5165\u7F29\u8FDB\u5757\u3002\u53EF\u4EE5\u6253\u5F00\u8C03\u8BD5\uFF0C\u6BD4\u8F83\u8FD9\u53E5\u591A\u6B21\u51FA\u73B0\u65F6\u5404\u5C42\u8C03\u7528\u5E27\u91CC\u7684\u53D8\u91CF\u3002",
    action: { kind: "locate", label: "\u5B9A\u4F4D\u6BCF\u6B21\u5224\u65AD" },
    chips: []
  };
  if (/^while\s+/.test(line)) return {
    intent: "logic",
    title: "\u8FD9\u662F\u5FAA\u73AF\u6761\u4EF6",
    body: "\u6BCF\u8F6E\u5F00\u59CB\u524D\u90FD\u4F1A\u91CD\u65B0\u6C42\u503C\u6761\u4EF6\u3002\u5FAA\u73AF\u4F53\u4FEE\u6539\u4E86 src\uFF0C\u6240\u4EE5\u540C\u4E00\u53E5\u4F1A\u5728 Trace \u4E2D\u591A\u6B21\u51FA\u73B0\uFF1B\u9009\u62E9\u540E\u7684\u4E0A\u4E00\u5904\u3001\u4E0B\u4E00\u5904\u4F1A\u5728\u8FD9\u4E9B\u771F\u5B9E\u6267\u884C\u4F4D\u7F6E\u4E4B\u95F4\u79FB\u52A8\u3002",
    action: { kind: "locate", label: "\u67E5\u770B\u5FAA\u73AF\u8F68\u8FF9" },
    chips: []
  };
  if (/hanoi\s*\(/.test(line)) return {
    intent: "algorithm",
    title: "\u8FD9\u53E5\u521B\u5EFA\u4E00\u4E2A\u66F4\u5C0F\u7684\u5B50\u4EFB\u52A1",
    body: "\u8C03\u7528\u524D\u5148\u6C42\u503C n - 1\u3001\u8D77\u70B9\u548C\u7EC8\u70B9\uFF0C\u518D\u4E3A\u65B0\u7684 hanoi \u8C03\u7528\u5EFA\u7ACB\u53C2\u6570\u7ED1\u5B9A\u3002\u5B83\u6CA1\u6709\u590D\u5236\u6574\u5EA7\u5854\uFF0C\u800C\u662F\u628A\u201C\u642C\u591A\u5C11\u4E2A\u3001\u4ECE\u54EA\u91CC\u3001\u5230\u54EA\u91CC\u201D\u4EA4\u7ED9\u4E0B\u4E00\u5C42\u5B8C\u6210\u3002",
    action: { kind: "locate", label: "\u8FDB\u5165\u8FD9\u6B21\u8C03\u7528" },
    chips: HANOI_PITFALLS
  };
  if (/^return\b/.test(line)) return {
    intent: "runtime",
    title: "\u8FD9\u53E5\u7ED3\u675F\u5F53\u524D\u8C03\u7528\u5E27",
    body: "return \u53EA\u7ED3\u675F\u5F53\u524D\u8FD9\u4E00\u5C42\u51FD\u6570\uFF0C\u4E0D\u4F1A\u7ED3\u675F\u5916\u5C42\u9012\u5F52\u3002Debugger \u4E2D\u8FD9\u4E00\u5C42\u5E27\u4F1A\u9000\u51FA\uFF0C\u63A7\u5236\u6743\u56DE\u5230\u8C03\u7528\u5B83\u7684\u4E0A\u4E00\u5C42\u8BED\u53E5\u4E4B\u540E\u3002",
    action: { kind: "locate", label: "\u67E5\u770B\u8FD4\u56DE\u4F4D\u7F6E" },
    chips: []
  };
  if (/^print\s*\(/.test(line)) return {
    intent: "runtime",
    title: "\u8FD9\u53E5\u4EA7\u751F\u53EF\u89C2\u5BDF\u8F93\u51FA",
    body: "Python \u5148\u8BA1\u7B97 f \u5B57\u7B26\u4E32\u91CC\u7684\u8868\u8FBE\u5F0F\uFF0C\u518D\u8C03\u7528 print\u3002Hanoi World \u53EA\u89E3\u6790\u771F\u6B63\u5199\u5165 stdout \u7684\u79FB\u52A8\uFF0C\u6240\u4EE5\u8FD9\u4E00\u53E5\u540C\u65F6\u8FDE\u63A5\u4E86\u7A0B\u5E8F\u6267\u884C\u4E8B\u5B9E\u548C\u76D8\u9762\u53D8\u5316\u3002",
    action: { kind: "locate", label: "\u5B9A\u4F4D\u8F93\u51FA\u53D1\u751F\u65F6" },
    chips: []
  };
  return {
    intent: "logic",
    title: "\u6309\u6C42\u503C\u987A\u5E8F\u8BFB\u8FD9\u4E00\u53E5",
    body: "\u5148\u770B\u53F3\u4FA7\u8BFB\u53D6\u4E86\u54EA\u4E9B\u540D\u5B57\u548C\u8868\u8FBE\u5F0F\uFF0C\u518D\u770B\u5DE6\u4FA7\u662F\u5426\u4EA7\u751F\u7ED1\u5B9A\u6216\u4FEE\u6539\u3002\u6253\u5F00\u8C03\u8BD5\u540E\uFF0CEditor \u7684\u6267\u884C\u884C\u3001Variables \u548C\u8C03\u7528\u7ED3\u6784\u4F1A\u505C\u5728\u540C\u4E00\u4E2A Trace \u4F4D\u7F6E\u3002",
    action: { kind: "locate", label: "\u7528 Trace \u9A8C\u8BC1" },
    chips: []
  };
}
function Root(host = {}) {
  const view = usePlayground(hanoi, host.source ?? STARTER, { ...mountOptions, ...host.options });
  const [ai, setAI] = useState(CLOSED_AI);
  const restoreSource = useRef(null);
  const restorePanels = useRef(layoutOptions.open);
  const nextMessageId = useRef(0);
  const nextConversationId = useRef(0);
  const typingTimer = useRef(null);
  const input = useRef(null);
  const stopTyping = () => {
    if (typingTimer.current === null) return;
    window.clearTimeout(typingTimer.current);
    typingTimer.current = null;
  };
  useEffect(() => stopTyping, []);
  if (view === null) return null;
  const n = view.state.disks;
  const result = view.parts.python.result;
  const trace = result.status === "ready" && result.value !== null ? result.value.trace : null;
  const world = sceneWorld(result.status === "ready" ? result.value : null, view.parts.playback.position, view.state.source, n);
  const selection2 = view.parts.selection.current;
  const selected = selectedDisk(selection2, trace);
  const selectDisk = (disk) => {
    if (trace === null) return;
    if (disk === selected) view.send({ type: "selection.clear" }, "world");
    else view.send({ type: "selection.select", selection: { kind: "world-object", run: trace, objectId: diskId(disk) } }, "world");
  };
  const applySource = (source) => {
    view.editor.receive({ type: "editor.render", source });
    view.send({ type: "editor.changed", source }, "hanoi.ai");
  };
  const say = (message) => {
    setAI((current) => ({ ...current, messages: [...current.messages, { id: ++nextMessageId.current, role: "assistant", ...message }] }));
  };
  const showPanel = (key) => {
    const current = view.layout.getSnapshot();
    const open = new Set(current.open ?? []);
    open.add("ai");
    open.add(key);
    view.send({ type: "layout.change", value: { open: [...open] } }, "hanoi.ai");
  };
  const openAI = () => {
    restorePanels.current = view.layout.getSnapshot().open;
    view.send({ type: "layout.change", value: { open: ["ai"] } }, "hanoi.ai");
    setAI((current) => ({ ...CLOSED_AI, open: true, history: current.history }));
  };
  const closeAI = () => {
    stopTyping();
    const leavingLesson = ai.mode === "lesson";
    if (leavingLesson) view.send({ type: "hanoi.lesson.changed", active: false }, "hanoi.ai");
    if (restoreSource.current !== null) applySource(restoreSource.current);
    restoreSource.current = null;
    view.send({ type: "layout.change", value: { open: restorePanels.current } }, "hanoi.ai");
    setAI((current) => {
      const history = current.messages.length === 0 ? current.history : [{
        id: ++nextConversationId.current,
        title: conversationTitle(current.messages),
        messages: current.messages
      }, ...current.history];
      return { ...CLOSED_AI, history };
    });
  };
  const newQuestion = () => {
    stopTyping();
    if (ai.mode === "lesson") view.send({ type: "hanoi.lesson.changed", active: false }, "hanoi.ai");
    if (restoreSource.current !== null) applySource(restoreSource.current);
    restoreSource.current = null;
    view.send({ type: "layout.change", value: { open: ["ai"] } }, "hanoi.ai");
    setAI((current) => {
      const history = current.messages.length === 0 ? current.history : [{
        id: ++nextConversationId.current,
        title: conversationTitle(current.messages),
        messages: current.messages
      }, ...current.history];
      return { ...CLOSED_AI, open: true, history };
    });
  };
  const restoreOriginalSource = () => {
    stopTyping();
    view.send({ type: "hanoi.lesson.changed", active: false }, "hanoi.ai");
    if (restoreSource.current !== null) applySource(restoreSource.current);
    restoreSource.current = null;
    setAI((current) => ({
      ...current,
      mode: "chat",
      step: 0,
      writing: false,
      composing: false,
      messages: [...current.messages, {
        id: ++nextMessageId.current,
        role: "assistant",
        title: "\u5DF2\u56DE\u5230\u539F\u6765\u7684\u4EE3\u7801",
        text: "AI \u4ECD\u7136\u4FDD\u6301\u6253\u5F00\u3002\u4F60\u53EF\u4EE5\u7EE7\u7EED\u8FFD\u95EE\uFF0C\u4E5F\u53EF\u4EE5\u4ECE Topbar \u6253\u5F00\u8C03\u8BD5\u3001\u8F93\u51FA\u6216\u53EF\u89C6\u5316\u3002"
      }]
    }));
  };
  const locateSelection = () => {
    const current = view.parts.playback.position?.traceIndex ?? 0;
    const points = selection2?.kind === "source" ? sourceOccurrences(trace, selection2).map((item) => item.traceIndex) : selection2?.kind === "runtime-variable" ? variableTimeline2(selection2).map((item) => item.traceIndex) : [];
    const next = points.find((index) => index >= current) ?? points[0];
    if (next === void 0) {
      say({ text: selection2?.kind === "world-object" ? "\u5F53\u524D Trace \u8FD8\u6CA1\u6709\u76D8\u5B50\u5BF9\u8C61\u5230\u6267\u884C\u4F4D\u7F6E\u7684\u7A33\u5B9A\u6620\u5C04\u3002\u8BF7\u5148\u5728 Editor \u9009\u4E2D\u8BED\u53E5\uFF0C\u6216\u5728 Variables \u9009\u4E2D\u53D8\u91CF\u3002" : "\u8BF7\u5148\u5728 Editor \u9009\u4E2D\u4E00\u6BB5\u4EE3\u7801\uFF0C\u6216\u5728 Variables \u9009\u4E2D\u4E00\u4E2A\u53D8\u91CF\u3002" });
      return;
    }
    showPanel("debug");
    view.send({ type: "debugger.seek", traceIndex: next }, "hanoi.ai");
    say({ text: `\u5DF2\u7ECF\u5B9A\u4F4D\u5230\u7B2C ${next} \u4E2A Trace \u4F4D\u7F6E\u3002AI Card \u4F1A\u7559\u5728\u8FD9\u91CC\uFF0C\u4F60\u53EF\u4EE5\u7EE7\u7EED\u8FFD\u95EE\u8FD9\u4E00\u5904\u53D1\u751F\u4E86\u4EC0\u4E48\u3002` });
  };
  const writeInto = (full, done) => {
    stopTyping();
    const current = view.state.source;
    let resume = 0;
    while (resume < current.length && resume < full.length && current[resume] === full[resume]) resume += 1;
    view.editor.receive({ type: "editor.render", source: full.slice(0, resume) });
    let written = resume;
    setAI((current2) => ({ ...current2, writing: true }));
    const writeCharacter = () => {
      written = Math.min(full.length, written + 1);
      view.editor.receive({ type: "editor.render", source: full.slice(0, written) });
      if (written >= full.length) {
        stopTyping();
        view.send({ type: "editor.changed", source: full }, "hanoi.ai");
        setAI((current2) => ({ ...current2, writing: false }));
        done();
        return;
      }
      typingTimer.current = window.setTimeout(writeCharacter, typingDelay(full[written - 1] ?? ""));
    };
    typingTimer.current = window.setTimeout(writeCharacter, 260);
  };
  const startLesson = (lesson) => {
    if (restoreSource.current === null) restoreSource.current = view.state.source;
    stopTyping();
    view.send({ type: "hanoi.lesson.changed", active: true }, "hanoi.ai");
    applySource("");
    const first = HANOI_LESSONS[lesson][0];
    setAI((current) => ({
      ...current,
      mode: "lesson",
      lesson,
      step: 0,
      writing: false,
      composing: false,
      messages: [...current.messages, {
        id: ++nextMessageId.current,
        role: "assistant",
        title: first.title,
        text: first.body,
        action: { kind: "write-step", label: "\u8BA9 AI \u5199\u8FD9\u4E00\u6B65" }
      }]
    }));
  };
  const writeStep = () => {
    const steps = HANOI_LESSONS[ai.lesson];
    const step = steps[ai.step];
    writeInto(step.source, () => {
      const last = ai.step === steps.length - 1;
      if (last) {
        say({
          title: "\u4EE3\u7801\u5DF2\u5199\u5B8C\u5E76\u81EA\u52A8\u8FD0\u884C",
          text: "\u4F60\u53EF\u4EE5\u76F4\u63A5\u6253\u5F00\u8C03\u8BD5\u6216\u8F93\u51FA\u9A8C\u8BC1\u7ED3\u679C\uFF0C\u4E5F\u53EF\u4EE5\u7EE7\u7EED\u8FFD\u95EE\u3002\u6062\u590D\u539F\u4EE3\u7801\u53EA\u7ED3\u675F\u8FD9\u6B21\u6559\u5B66\uFF0C\u4E0D\u4F1A\u5173\u95ED AI\u3002",
          action: { kind: "restore-source", label: "\u7ED3\u675F\u6559\u5B66\u5E76\u6062\u590D\u539F\u4EE3\u7801" },
          chips: [
            { kind: "show-debug", label: "\u6253\u5F00\u8C03\u8BD5" },
            { kind: "show-output", label: "\u67E5\u770B\u8F93\u51FA" }
          ]
        });
        return;
      }
      const index = ai.step + 1;
      const next = steps[index];
      setAI((current) => ({
        ...current,
        step: index,
        messages: [...current.messages, {
          id: ++nextMessageId.current,
          role: "assistant",
          title: next.title,
          text: `\u4E0A\u4E00\u6BB5\u5DF2\u7ECF\u5199\u5B8C\u5E76\u81EA\u52A8\u8FD0\u884C\u3002${next.body}`,
          action: { kind: "write-step", label: "\u5199\u5165\u8FD9\u4E00\u6B65" }
        }]
      }));
    });
  };
  const runPitfall = (kind) => {
    const target = kind === "pitfall-loop" ? "while src != dst:" : "if n == 1:";
    const replacement = kind === "pitfall-loop" ? "if src != dst:" : "if n == 0:";
    const source = view.state.source;
    if (!source.includes(target)) {
      say({ text: `\u5F53\u524D Editor \u91CC\u6CA1\u6709 ${target} \u3002\u5148\u9000\u51FA\u6559\u5B66\uFF0C\u56DE\u5230\u539F\u6765\u7684\u7A0B\u5E8F\u518D\u8BD5\u8FD9\u4E2A\u5B9E\u9A8C\u3002` });
      return;
    }
    if (restoreSource.current === null) restoreSource.current = source;
    applySource(source.replace(target, replacement));
    say({
      title: kind === "pitfall-loop" ? "\u53EA\u5224\u65AD\u4E00\u6B21\u4F1A\u600E\u6837" : "\u628A\u51FA\u53E3\u632A\u8D70\u4F1A\u600E\u6837",
      text: kind === "pitfall-loop" ? "\u6539\u5B8C\u4E4B\u540E\u5FAA\u73AF\u4F53\u53EA\u68C0\u67E5\u4E00\u6B21\u3002n == 1 \u8FD9\u5C42\u5982\u679C\u4E00\u6B21\u5230\u4E0D\u4E86\u76EE\u6807\u67F1\u5C31\u76F4\u63A5\u8FD4\u56DE\uFF0C\u540E\u9762\u7684\u79FB\u52A8\u4F1A\u6D88\u5931\u2014\u2014\u770B\u8F93\u51FA\u5C11\u4E86\u54EA\u51E0\u6B65\u3002" : "\u7EC8\u6B62\u6761\u4EF6\u53D8\u6210 n == 0 \u4E4B\u540E\uFF0Cn == 1 \u4E0D\u518D\u662F\u51FA\u53E3\uFF0C\u51FD\u6570\u4F1A\u7EE7\u7EED\u8C03\u7528\u66F4\u5C0F\u7684 n\u3002\u770B\u8C03\u8BD5\u91CC\u7684\u8C03\u7528\u6808\u5728\u54EA\u91CC\u505C\u4E0B\u3002",
      action: { kind: "restore-source", label: "\u6062\u590D\u539F\u6765\u7684\u4EE3\u7801" }
    });
  };
  const runAIAction = (action) => {
    if (action === "lesson-syntax") startLesson("syntax");
    else if (action === "lesson-algorithm") startLesson("algorithm");
    else if (action === "write-step") writeStep();
    else if (action === "pitfall-loop" || action === "pitfall-base") runPitfall(action);
    else if (action === "locate") locateSelection();
    else if (action === "ask-again") setAI((current) => ({ ...current, composing: true }));
    else if (action === "restore-source") restoreOriginalSource();
    else if (action === "show-debug") showPanel("debug");
    else if (action === "show-output") showPanel("output");
    else if (action === "show-viz") showPanel("viz");
  };
  const ask = (prompt) => {
    const question = (prompt ?? ai.input).trim();
    if (question === "" || ai.writing) return;
    const answer = hanoiAIResponse(question);
    setAI((current) => ({
      ...current,
      input: "",
      composing: false,
      messages: [
        ...current.messages,
        { id: ++nextMessageId.current, role: "user", text: question },
        {
          id: ++nextMessageId.current,
          role: "assistant",
          title: answer.title,
          text: answer.body,
          action: answer.action ?? void 0,
          chips: answer.chips.length > 0 ? answer.chips : void 0
        }
      ]
    }));
  };
  const explainSelection = () => {
    if (selection2?.kind !== "source" || selection2.source !== view.state.source) return;
    const code = selection2.source.slice(Math.min(selection2.from, selection2.to), Math.max(selection2.from, selection2.to)).trim();
    if (code === "") return;
    const answer = selectedCodeAIResponse(code);
    if (!ai.open) restorePanels.current = view.layout.getSnapshot().open;
    if (ai.mode === "lesson") view.send({ type: "hanoi.lesson.changed", active: false }, "hanoi.ai.corner");
    view.send({ type: "layout.change", value: { open: ["ai"] } }, "hanoi.ai.corner");
    setAI((current) => {
      const history = current.messages.length === 0 ? current.history : [{
        id: ++nextConversationId.current,
        title: conversationTitle(current.messages),
        messages: current.messages
      }, ...current.history];
      return {
        ...CLOSED_AI,
        open: true,
        composing: false,
        history,
        messages: [
          { id: ++nextMessageId.current, role: "user", text: `\u89E3\u91CA\u8FD9\u6BB5\u4EE3\u7801\uFF1A${code}` },
          {
            id: ++nextMessageId.current,
            role: "assistant",
            title: answer.title,
            text: answer.body,
            action: answer.action ?? void 0,
            chips: answer.chips.length > 0 ? answer.chips : void 0
          }
        ]
      };
    });
  };
  const onEvent = (event) => {
    if (event.type === "hanoi.ai.toggle") {
      if (ai.open) closeAI();
      else openAI();
      return;
    }
    view.send(event);
  };
  const context = aiContext(selection2, trace, view.parts.playback.position?.traceIndex ?? null);
  return /* @__PURE__ */ jsxs("div", { className: "pico-hanoi-app", children: [
    /* @__PURE__ */ jsx("style", { children: HANOI_STYLE }),
    /* @__PURE__ */ jsx("style", { children: HANOI_AI_STYLE }),
    /* @__PURE__ */ jsx(
      PlaygroundShell,
      {
        name: "Tower of Hanoi",
        layout: view.layout,
        onEvent,
        menu: view.menu,
        toolbar: [
          ...view.toolbar,
          { label: "\u7528\u4F8B", controls: [{
            kind: "choices",
            label: "\u76D8\u5B50\u6570\u91CF",
            choices: CASE_CHOICES.map((choice) => ({ ...choice, event: { type: "hanoi.disks.changed", disks: Number(choice.value) } })),
            value: String(n)
          }] },
          { label: "AI", controls: [{ kind: "button", icon: "hint", label: "AI", pressed: ai.open, event: { type: "hanoi.ai.toggle" } }] }
        ],
        editor: /* @__PURE__ */ jsxs("div", { className: "pico-hanoi-editor", children: [
          /* @__PURE__ */ jsx(Widget, { widget: view.editor }),
          selection2?.kind === "source" && selection2.source === view.state.source && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "pico-hanoi-ai-corner",
              title: "\u8BA9 AI \u89E3\u91CA\u9009\u4E2D\u4EE3\u7801",
              "aria-label": "\u8BA9 AI \u89E3\u91CA\u9009\u4E2D\u4EE3\u7801",
              onClick: explainSelection,
              children: "AI"
            }
          )
        ] }),
        panels: [
          ...ai.open ? [{ key: "ai", title: "AI \u52A9\u6559", flush: true, content: /* @__PURE__ */ jsx(
            HanoiAI,
            {
              state: ai,
              context,
              inputRef: input,
              onInput: (value) => setAI((current) => ({ ...current, input: value })),
              onAsk: () => ask(),
              onPrompt: ask,
              onHistory: () => setAI((current) => ({ ...current, historyOpen: !current.historyOpen })),
              onNewQuestion: newQuestion,
              onAction: runAIAction
            }
          ) }] : [],
          { key: "viz", icon: "viz", title: "\u53EF\u89C6\u5316", flush: true, content: /* @__PURE__ */ jsx("div", { className: "pico-scene pico-hanoi-scene", children: /* @__PURE__ */ jsx(HanoiScene, { world, n, selected, onSelect: selectDisk }) }) },
          { key: "output", icon: "output", title: "\u8F93\u51FA", content: /* @__PURE__ */ jsx(Widget, { widget: view.parts.terminal }) },
          { key: "debug", icon: "debug", title: "\u8C03\u8BD5", content: /* @__PURE__ */ jsx(Widget, { widget: view.parts.debugger }) }
        ]
      }
    )
  ] });
}
function aiContext(selection2, trace, current) {
  if (selection2?.kind === "source") {
    const points = sourceOccurrences(trace, selection2);
    const ordinal = points.find((item) => item.traceIndex === current)?.ordinal;
    return ordinal === void 0 ? `\u9009\u4E2D\u8BED\u53E5\uFF0C\u672C\u6B21\u8FD0\u884C\u51FA\u73B0 ${points.length} \u6B21` : `\u9009\u4E2D\u8BED\u53E5\u7684\u7B2C ${ordinal} \u6B21\u6267\u884C`;
  }
  if (selection2?.kind === "runtime-variable") {
    const name = selection2.path.at(-1);
    return `\u53D8\u91CF ${String(name)}\uFF0C\u672C\u6B21\u8FD0\u884C\u6709 ${variableTimeline2(selection2).length} \u6B21\u53EF\u8BC1\u660E\u7684\u53D8\u5316`;
  }
  if (selection2?.kind === "world-object") return `\u76D8\u9762\u5BF9\u8C61 ${selection2.objectId}`;
  return current === null ? "\u5F53\u524D\u6E90\u7801" : "\u5F53\u524D\u6267\u884C\u4F4D\u7F6E";
}
function HanoiAI({ state, context, inputRef, onInput, onAsk, onPrompt, onHistory, onNewQuestion, onAction }) {
  const inputId = useId();
  const log = useRef(null);
  const submit = (event) => {
    event.preventDefault();
    onAsk();
  };
  const steps = state.mode === "lesson" ? HANOI_LESSONS[state.lesson] : null;
  useEffect(() => {
    const element = log.current;
    if (element !== null) element.scrollTop = element.scrollHeight;
  }, [state.historyOpen, state.messages.length, state.writing]);
  useEffect(() => {
    if (!state.historyOpen && state.mode === "chat" && state.composing) inputRef.current?.focus();
  }, [inputRef, state.composing, state.historyOpen, state.mode]);
  const lastAssistant = [...state.messages].reverse().find((message) => message.role === "assistant")?.id;
  return /* @__PURE__ */ jsxs("section", { className: "pico-hanoi-ai", "aria-label": "AI \u52A9\u6559", children: [
    /* @__PURE__ */ jsxs("header", { className: "pico-hanoi-ai-head", children: [
      /* @__PURE__ */ jsx("span", { className: "pico-hanoi-ai-mark", "aria-hidden": "true", children: "AI" }),
      /* @__PURE__ */ jsxs("div", { className: "pico-hanoi-ai-id", children: [
        /* @__PURE__ */ jsx("strong", { children: state.historyOpen ? "\u5386\u53F2\u5BF9\u8BDD" : steps === null ? "\u52A9\u6559" : state.lesson === "syntax" ? "\u8BED\u6CD5\u6559\u5B66" : "\u7B97\u6CD5\u62C6\u89E3" }),
        /* @__PURE__ */ jsx("small", { children: steps === null ? context : `\u7B2C ${state.step + 1} / ${steps.length} \u6BB5 \xB7 ${state.writing ? "\u6B63\u5728\u8F93\u5165\u4EE3\u7801" : "\u7B49\u5F85\u4F60\u7684\u4E0B\u4E00\u6B65"}` })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "pico-hanoi-ai-history-button",
          "aria-label": "\u67E5\u770B\u5386\u53F2\u5BF9\u8BDD",
          "aria-pressed": state.historyOpen,
          disabled: state.history.length === 0,
          onClick: onHistory,
          children: [
            /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 18 18", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsx("path", { d: "M4.2 5.5A6 6 0 1 1 3 9" }),
              /* @__PURE__ */ jsx("path", { d: "M2.5 3.5v3h3M9 5.5V9l2.2 1.4" })
            ] }),
            /* @__PURE__ */ jsx("span", { children: "\u5386\u53F2" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { ref: log, className: "pico-hanoi-ai-log", role: "log", "aria-live": "polite", "aria-busy": state.writing, children: state.historyOpen ? /* @__PURE__ */ jsx("div", { className: "pico-hanoi-ai-history", children: state.history.map((conversation, index) => /* @__PURE__ */ jsxs("details", { open: index === 0, children: [
      /* @__PURE__ */ jsx("summary", { children: conversation.title }),
      /* @__PURE__ */ jsx("div", { className: "pico-hanoi-ai-history-messages", children: conversation.messages.map((message) => /* @__PURE__ */ jsxs("p", { "data-role": message.role, children: [
        message.title !== void 0 && /* @__PURE__ */ jsx("strong", { children: message.title }),
        message.text
      ] }, message.id)) })
    ] }, conversation.id)) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      state.messages.length === 0 && /* @__PURE__ */ jsxs("div", { className: "pico-hanoi-ai-empty", children: [
        /* @__PURE__ */ jsx("strong", { children: "\u53EF\u4EE5\u76F4\u63A5\u95EE" }),
        /* @__PURE__ */ jsx("div", { className: "pico-hanoi-ai-prompts", "aria-label": "\u63D0\u95EE\u793A\u4F8B", children: HANOI_PROMPTS.map((question) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onPrompt(question), children: question }, question)) })
      ] }),
      state.messages.map((message) => {
        if (message.role === "user") return /* @__PURE__ */ jsx("p", { className: "pico-hanoi-ai-said", children: message.text }, message.id);
        const action = message.id === lastAssistant ? message.action : void 0;
        const chips = message.id === lastAssistant ? message.chips : void 0;
        return /* @__PURE__ */ jsxs("article", { className: "pico-hanoi-ai-note", children: [
          /* @__PURE__ */ jsx("span", { className: "pico-hanoi-ai-avatar", "aria-hidden": "true", children: "AI" }),
          /* @__PURE__ */ jsxs("div", { className: "pico-hanoi-ai-response", children: [
            message.title !== void 0 && /* @__PURE__ */ jsx("h2", { children: message.title }),
            /* @__PURE__ */ jsx("p", { children: message.text }),
            action !== void 0 && /* @__PURE__ */ jsx("button", { type: "button", className: "pico-hanoi-ai-cta", disabled: state.writing, onClick: () => onAction(action.kind), children: state.writing ? "\u6B63\u5728\u8F93\u5165\u4EE3\u7801\u2026" : action.label }),
            chips !== void 0 && /* @__PURE__ */ jsxs("div", { className: "pico-hanoi-ai-chips", children: [
              /* @__PURE__ */ jsx("span", { className: "pico-hanoi-ai-chips-label", children: "\u7EE7\u7EED\u9A8C\u8BC1" }),
              chips.map((chip) => /* @__PURE__ */ jsx("button", { type: "button", className: "pico-hanoi-ai-chip", disabled: state.writing, onClick: () => onAction(chip.kind), children: chip.label }, chip.kind))
            ] })
          ] })
        ] }, message.id);
      })
    ] }) }),
    !state.historyOpen && state.mode === "chat" && state.messages.length > 0 && !state.composing && /* @__PURE__ */ jsxs("div", { className: "pico-hanoi-ai-followup", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onAction("ask-again"), children: "\u7EE7\u7EED\u8FFD\u95EE" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onNewQuestion, children: "\u6362\u4E00\u4E2A\u95EE\u9898" })
    ] }),
    !state.historyOpen && state.mode === "chat" && state.composing && /* @__PURE__ */ jsxs("form", { className: "pico-hanoi-ai-compose", onSubmit: submit, children: [
      /* @__PURE__ */ jsx("label", { htmlFor: inputId, children: "\u5411 AI \u63D0\u95EE" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: inputId,
          ref: inputRef,
          rows: 1,
          value: state.input,
          disabled: state.writing,
          placeholder: state.messages.length === 0 ? "\u8F93\u5165\u95EE\u9898\uFF0C\u6216\u9009\u62E9\u4E0A\u9762\u7684\u4F8B\u5B50" : "\u7EE7\u7EED\u95EE\u8FD9\u4E00\u5904\u4EE3\u7801\u6216\u6267\u884C\u8FC7\u7A0B",
          onChange: (event) => onInput(event.currentTarget.value),
          onKeyDown: (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onAsk();
            }
          }
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "pico-hanoi-ai-send", "aria-label": "\u53D1\u9001\u95EE\u9898", title: "\u53D1\u9001\uFF08Enter\uFF09", disabled: state.input.trim() === "" || state.writing, children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 18 18", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx("path", { d: "m3 9 11-5-3.4 10-2-4.1L3 9Z" }),
        /* @__PURE__ */ jsx("path", { d: "m8.6 9.9 5.4-5.9" })
      ] }) })
    ] })
  ] });
}
var PEGS = ["A", "B", "C"];
function initialPegs(n) {
  const pegs = { A: [], B: [], C: [] };
  for (let disk = n; disk >= 1; disk -= 1) pegs.A.push(disk);
  return pegs;
}
function hanoiWorld(stdout, n) {
  const pegs = initialPegs(n);
  const moves = [];
  let error = null;
  for (const line of stdout.split("\n").map((line2) => line2.trim())) {
    if (error !== null) break;
    const parsed = parseMoveLine(line);
    if (parsed === null) continue;
    const disk = pegs[parsed.from].at(-1);
    const targetTop = pegs[parsed.to].at(-1);
    if (disk === void 0 || targetTop !== void 0 && disk > targetTop) {
      error = line;
      continue;
    }
    pegs[parsed.from] = pegs[parsed.from].slice(0, -1);
    pegs[parsed.to] = [...pegs[parsed.to], disk];
    moves.push({ disk, from: parsed.from, to: parsed.to });
  }
  return { pegs, moves, error };
}
var PEG_X = { A: 90, B: 220, C: 350 };
var BASE_Y = 220;
var PEG_TOP = 64;
var DISK_H = 18;
var DISK_GAP = 3;
var FLOOR = BASE_Y - 8;
var ARROW_Y = 32;
var ARROW_LIFT = 8;
var DISK_COLORS = [
  "var(--pico-hanoi-red)",
  "var(--pico-hanoi-blue)",
  "var(--pico-hanoi-orange)",
  "var(--pico-hanoi-green)",
  "var(--pico-hanoi-yellow)",
  "var(--pico-hanoi-purple)",
  "var(--pico-hanoi-cyan)"
];
function isPeg(value) {
  return value === "A" || value === "B" || value === "C";
}
function parseMoveLine(line) {
  const match = /^([ABC]) -> ([ABC])$/.exec(line);
  if (match === null) return null;
  const from = match[1];
  const to = match[2];
  if (!isPeg(from) || !isPeg(to)) return null;
  return { from, to };
}
function pendingPrintMove(trace, traceIndex, state) {
  const stdout = state.stdout ?? "";
  const depth = state.frames?.length ?? 0;
  for (let index = traceIndex + 1; index <= trace.steps.length + 1; index += 1) {
    const next = trace.at(index);
    const printed = (next.stdout ?? "").slice(stdout.length);
    if (printed.length > 0) return parseMoveLine(printed.trim());
    const nextDepth = next.frames?.length ?? 0;
    if (nextDepth < depth || nextDepth === depth && trace.steps[index - 1]?.event === "stmt") break;
  }
  return null;
}
function diskTopY(index) {
  return FLOOR - (index + 1) * DISK_H - index * DISK_GAP;
}
function hanoiCall(state) {
  const frame = state?.frames?.at(-1);
  if (frame?.name !== "hanoi") return null;
  const n = frame.locals.n;
  const source = frame.locals.src;
  const target = frame.locals.dst;
  if (typeof n !== "number" || typeof source !== "string" || typeof target !== "string") return null;
  if (!isPeg(source) || !isPeg(target)) return null;
  return { n, from: source, to: target };
}
function callArrowPath(from, to) {
  const x1 = PEG_X[from];
  const x2 = PEG_X[to];
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${ARROW_Y} Q ${midX} ${ARROW_LIFT}, ${x2} ${ARROW_Y}`;
}
function sceneWorld(result, position, source, n) {
  const state = position?.state;
  const world = hanoiWorld(state?.stdout ?? "", n);
  const error = world.error;
  const pegs = world.pegs;
  const line = state?.line ?? null;
  const lineText = line === null ? "" : source.split("\n")[line - 1] ?? "";
  const trace = result?.trace ?? null;
  const next = position?.traceIndex ?? 0;
  const call = position?.event === "stmt" && /^\s*hanoi\(/.test(lineText) && trace !== null && trace.steps[next]?.event === "call" ? hanoiCall(trace.at(next + 1)) : null;
  const printedMove = position?.event === "stmt" && /^\s*print\(/.test(lineText) && trace !== null && state !== void 0 ? pendingPrintMove(trace, next, state) : null;
  const preview = call ?? (printedMove === null ? null : { n: 1, ...printedMove });
  let displayPegs = pegs;
  let virtualTarget = null;
  let virtualMoved = [];
  if (preview !== null && error === null) {
    const sourceStack = pegs[preview.from];
    if (preview.n <= sourceStack.length) {
      const moved = sourceStack.slice(-preview.n);
      displayPegs = {
        ...pegs,
        [preview.to]: [...pegs[preview.to], ...moved]
      };
      virtualTarget = preview.to;
      virtualMoved = moved;
    }
  }
  return { error, displayPegs, virtualTarget, virtualMoved, preview };
}
function HanoiScene({ world, n, selected, onSelect }) {
  const arrowId = useId();
  const { error, displayPegs, virtualTarget, virtualMoved, preview } = world;
  return /* @__PURE__ */ jsxs("svg", { className: "pico-hanoi-svg", viewBox: "0 0 440 260", role: "img", "aria-label": "\u6C49\u8BFA\u5854", preserveAspectRatio: "xMidYMid meet", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("marker", { id: arrowId, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "5", markerHeight: "5", orient: "auto-start-reverse", children: /* @__PURE__ */ jsx("path", { d: "M 0 0 L 10 5 L 0 10 z", className: "pico-hanoi-arrow-head" }) }) }),
    /* @__PURE__ */ jsx("rect", { className: "pico-hanoi-base", x: "16", y: BASE_Y - 4, width: "408", height: "8", rx: "4" }),
    PEGS.map((peg) => /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("rect", { className: "pico-hanoi-peg", x: PEG_X[peg] - 3.5, y: PEG_TOP, width: "7", height: BASE_Y - PEG_TOP, rx: "3.5" }),
      displayPegs[peg].map((disk, index) => {
        const width = 20 + disk * 14;
        const isVirtual = virtualTarget === peg && virtualMoved.includes(disk);
        const className = isVirtual ? "pico-hanoi-disk pico-hanoi-disk--virtual" : "pico-hanoi-disk";
        return /* @__PURE__ */ jsxs(
          "g",
          {
            className: "pico-hanoi-disk-group",
            role: "button",
            tabIndex: 0,
            "aria-pressed": selected === disk,
            "aria-label": `\u76D8\u5B50 ${disk}${selected === disk ? "\uFF0C\u5DF2\u9009\u4E2D" : ""}`,
            style: { color: DISK_COLORS[(disk - 1) % DISK_COLORS.length] },
            onClick: () => onSelect(disk),
            onKeyDown: (event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onSelect(disk);
            },
            children: [
              /* @__PURE__ */ jsx(
                "rect",
                {
                  className,
                  x: PEG_X[peg] - width / 2,
                  y: diskTopY(index),
                  width,
                  height: DISK_H,
                  rx: "6"
                }
              ),
              !isVirtual && /* @__PURE__ */ jsx(
                "path",
                {
                  className: "pico-hanoi-disk-shine",
                  d: `M ${PEG_X[peg] - width / 2 + 7} ${diskTopY(index) + 3.5} h ${width - 14}`
                }
              )
            ]
          },
          disk
        );
      }),
      /* @__PURE__ */ jsx("text", { className: "pico-hanoi-label", x: PEG_X[peg], y: "245", textAnchor: "middle", children: peg })
    ] }, peg)),
    preview !== null && error === null && /* @__PURE__ */ jsx(
      "path",
      {
        className: "pico-hanoi-move",
        d: callArrowPath(preview.from, preview.to),
        markerEnd: `url(#${arrowId})`
      }
    ),
    error !== null && /* @__PURE__ */ jsx("g", { className: "pico-hanoi-error", transform: "translate(220 130)", "aria-label": "\u975E\u6CD5\u79FB\u52A8", children: /* @__PURE__ */ jsx("path", { d: "M -22 -22 L 22 22 M 22 -22 L -22 22" }) })
  ] });
}
var HANOI_STYLE = `
  .pico-hanoi-scene {
    --pico-hanoi-red: light-dark(#e45151, #f06a6a);
    --pico-hanoi-orange: light-dark(#ee9134, #f3a34d);
    --pico-hanoi-yellow: light-dark(#ebc844, #f1d35c);
    --pico-hanoi-green: light-dark(#4ba96b, #62bd80);
    --pico-hanoi-cyan: light-dark(#36adba, #56c4cc);
    --pico-hanoi-blue: light-dark(#4c83ce, #6a9bdf);
    --pico-hanoi-purple: light-dark(#9565be, #af85d2);
    display: grid; place-items: center; width: 100%; height: 100%; padding: var(--pico-space-4); }
    .pico-hanoi-svg { width: 100%; height: 100%; max-width: 720px; }
    .pico-hanoi-disk-group { cursor: pointer; outline: none; }
    .pico-hanoi-disk-group[aria-pressed="true"] .pico-hanoi-disk { stroke: var(--pico-accent); stroke-width: 2.5; filter: drop-shadow(0 0 5px color-mix(in srgb, var(--pico-accent) 60%, transparent)); }
    .pico-hanoi-disk-group:focus-visible .pico-hanoi-disk { stroke: var(--pico-accent); stroke-width: 2.5; stroke-dasharray: 5 3; }
  .pico-hanoi-base { fill: color-mix(in srgb, var(--pico-ink-soft) 35%, var(--pico-surface)); }
  .pico-hanoi-peg { fill: var(--pico-hairline); stroke: color-mix(in srgb, var(--pico-ink-soft) 18%, transparent); stroke-width: 1; }
  .pico-hanoi-label { fill: var(--pico-ink-soft); font: 500 var(--pico-size-sm)/1 var(--pico-font-mono); }
  .pico-hanoi-disk { fill: currentColor; stroke: color-mix(in srgb, currentColor 80%, var(--pico-ink)); stroke-width: 1; filter: drop-shadow(0 2px 1px color-mix(in srgb, var(--pico-ink) 12%, transparent)); }
  .pico-hanoi-disk-shine { fill: none; stroke: var(--pico-on-accent); stroke-opacity: .35; stroke-width: 1.5; stroke-linecap: round; pointer-events: none; }
  .pico-hanoi-disk--virtual { fill: color-mix(in srgb, currentColor 14%, var(--pico-paper)); stroke: currentColor; stroke-width: 1.5; stroke-dasharray: 4 3; filter: none; }
  .pico-hanoi-move { fill: none; stroke: var(--pico-accent); stroke-width: 2; stroke-linecap: round; }
  .pico-hanoi-arrow-head { fill: var(--pico-accent); }
  .pico-hanoi-error path { fill: none; stroke: var(--pico-hue-error-strong); stroke-width: 8; stroke-linecap: round; }
`;
var HANOI_AI_STYLE = `
  .pico-hanoi-app { position: relative; width: 100%; height: 100%; min-width: 0; min-height: 0; }
  .pico-hanoi-app > .pico-page { height: 100%; }
  .pico-hanoi-editor { position: relative; display: flex; flex: 1; min-width: 0; min-height: 0; }
  .pico-hanoi-editor > * { flex: 1; min-width: 0; min-height: 0; }
  .pico-hanoi-ai-corner { position: absolute; z-index: 8; right: var(--pico-space-3); bottom: var(--pico-space-3); display: grid; width: 34px; height: 34px; place-items: center; padding: 0; border: 1px solid color-mix(in srgb, var(--pico-accent) 55%, var(--pico-hairline)); border-radius: 10px; background: var(--pico-surface-raised); color: var(--pico-accent-deep); box-shadow: var(--pico-shadow-float); font: 700 var(--pico-size-xs)/1 var(--pico-font-ui); cursor: pointer; }
  .pico-hanoi-ai-corner:hover { border-color: var(--pico-accent); background: var(--pico-accent-wash); transform: translateY(-1px); }
  .pico-hanoi-ai {
    display: flex; width: 100%; height: 100%; min-width: 0; min-height: 0;
    flex-direction: column; background: var(--pico-surface-raised);
  }
  .pico-hanoi-ai-head { display: flex; align-items: center; gap: var(--pico-space-3); min-height: 58px; padding: var(--pico-space-3) var(--pico-space-4); border-bottom: var(--pico-line); background: var(--pico-surface-raised); }
  .pico-hanoi-ai-mark, .pico-hanoi-ai-avatar { display: grid; place-items: center; flex: 0 0 auto; background: var(--pico-accent-wash); color: var(--pico-accent-deep); font: 700 var(--pico-size-xs)/1 var(--pico-font-ui); letter-spacing: -0.01em; }
  .pico-hanoi-ai-mark { width: 32px; height: 32px; border-radius: 10px; }
  .pico-hanoi-ai-avatar { width: 26px; height: 26px; border-radius: 8px; }
  .pico-hanoi-ai-id { display: grid; gap: 3px; min-width: 0; }
  .pico-hanoi-ai-id strong { color: var(--pico-ink); font: 650 var(--pico-size-sm)/1.2 var(--pico-font-ui); }
  .pico-hanoi-ai-id small { overflow: hidden; color: var(--pico-ink-soft); font: 500 var(--pico-size-xs)/1.2 var(--pico-font-ui); text-overflow: ellipsis; white-space: nowrap; }
  .pico-hanoi-ai-history-button { display: inline-flex; align-items: center; gap: var(--pico-space-1); flex: 0 0 auto; min-height: 32px; margin-left: auto; padding: 0 8px; border: 0; border-radius: 8px; background: transparent; color: var(--pico-ink-soft); font: 600 var(--pico-size-xs)/1 var(--pico-font-ui); cursor: pointer; }
  .pico-hanoi-ai-history-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  .pico-hanoi-ai-history-button:hover:not(:disabled), .pico-hanoi-ai-history-button[aria-pressed="true"] { background: var(--pico-accent-wash); color: var(--pico-accent-deep); }
  .pico-hanoi-ai-history-button:disabled { opacity: .38; cursor: default; }

  .pico-hanoi-ai-log { display: flex; flex: 1 1 auto; min-height: 0; flex-direction: column; gap: var(--pico-space-5); padding: var(--pico-space-4); overflow: auto; color: var(--pico-ink); font: 400 var(--pico-size-code)/1.65 var(--pico-font-text); scrollbar-color: var(--pico-hairline) transparent; user-select: text; -webkit-user-select: text; }
  .pico-hanoi-ai-empty { display: grid; gap: var(--pico-space-2); margin: auto 0; }
  .pico-hanoi-ai-empty > strong { font: 650 var(--pico-size-md)/1.35 var(--pico-font-ui); letter-spacing: -0.01em; }
  .pico-hanoi-ai-empty > p { max-width: 38ch; margin: 0 0 var(--pico-space-2); color: var(--pico-ink-soft); }
  .pico-hanoi-ai-prompts { display: grid; gap: var(--pico-space-2); }
  .pico-hanoi-ai .pico-hanoi-ai-prompts button { min-height: 38px; padding: var(--pico-space-2) var(--pico-space-3); border: var(--pico-line); border-radius: 9px; background: var(--pico-surface); color: var(--pico-ink); font: 500 var(--pico-size-sm)/1.35 var(--pico-font-text); text-align: left; cursor: pointer; transition: border-color var(--pico-duration-fast), background var(--pico-duration-fast), transform var(--pico-duration-fast); }
  .pico-hanoi-ai .pico-hanoi-ai-prompts button:hover { border-color: var(--pico-accent); background: var(--pico-accent-wash); transform: translateX(2px); }
  .pico-hanoi-ai-history { display: grid; align-content: start; gap: var(--pico-space-2); }
  .pico-hanoi-ai-history details { border-bottom: var(--pico-line); }
  .pico-hanoi-ai-history summary { padding: var(--pico-space-2) 0; color: var(--pico-ink); font: 600 var(--pico-size-sm)/1.4 var(--pico-font-ui); cursor: pointer; }
  .pico-hanoi-ai-history-messages { display: grid; gap: var(--pico-space-2); padding: 0 0 var(--pico-space-3); }
  .pico-hanoi-ai-history-messages p { display: grid; gap: 2px; margin: 0; color: var(--pico-ink-soft); }
  .pico-hanoi-ai-history-messages p[data-role="user"] { color: var(--pico-ink); }
  .pico-hanoi-ai-history-messages strong { color: var(--pico-ink); font: 650 var(--pico-size-sm)/1.4 var(--pico-font-ui); }
  .pico-hanoi-ai-note { display: grid; grid-template-columns: 26px minmax(0, 1fr); align-items: start; gap: var(--pico-space-3); }
  .pico-hanoi-ai-response { display: grid; gap: var(--pico-space-2); min-width: 0; }
  .pico-hanoi-ai-response h2 { margin: 1px 0 0; color: var(--pico-ink); font: 650 var(--pico-size-sm)/1.4 var(--pico-font-ui); letter-spacing: -0.01em; }
  .pico-hanoi-ai-response p { max-width: 64ch; margin: 0; color: var(--pico-ink-soft); }
  .pico-hanoi-ai-said { align-self: flex-end; max-width: 84%; margin: 0; padding: 9px var(--pico-space-3); border-radius: 12px 12px 4px 12px; background: var(--pico-accent-wash); color: var(--pico-ink); }

  .pico-hanoi-ai .pico-hanoi-ai-cta { justify-self: start; min-height: 36px; margin-top: var(--pico-space-1); padding: 0 var(--pico-space-3); border: 1px solid color-mix(in srgb, var(--pico-accent) 55%, var(--pico-hairline)); border-radius: 9px; background: var(--pico-accent-wash); color: var(--pico-accent-deep); font: 650 var(--pico-size-sm)/1 var(--pico-font-ui); cursor: pointer; transition: background var(--pico-duration-fast), border-color var(--pico-duration-fast); }
  .pico-hanoi-ai .pico-hanoi-ai-cta:hover:not(:disabled) { border-color: var(--pico-accent); background: color-mix(in srgb, var(--pico-accent) 18%, transparent); }
  .pico-hanoi-ai .pico-hanoi-ai-cta:disabled { opacity: .55; cursor: progress; }
  .pico-hanoi-ai-chips { display: flex; flex-wrap: wrap; gap: var(--pico-space-2); margin-top: var(--pico-space-2); }
  .pico-hanoi-ai-chips-label { flex: 0 0 100%; color: var(--pico-ink-soft); font: 600 var(--pico-size-xs)/1.4 var(--pico-font-ui); }
  .pico-hanoi-ai .pico-hanoi-ai-chip { min-height: 34px; padding: 0 10px; border: var(--pico-line); border-radius: 8px; background: var(--pico-surface); color: var(--pico-ink); font: 500 var(--pico-size-xs)/1.2 var(--pico-font-ui); cursor: pointer; transition: color var(--pico-duration-fast), border-color var(--pico-duration-fast), background var(--pico-duration-fast); }
  .pico-hanoi-ai .pico-hanoi-ai-chip:hover:not(:disabled) { border-color: var(--pico-accent); background: var(--pico-accent-wash); color: var(--pico-accent-deep); }
  .pico-hanoi-ai .pico-hanoi-ai-chip:disabled { opacity: .45; cursor: not-allowed; }

  .pico-hanoi-ai-followup { display: grid; grid-template-columns: 1fr 1fr; gap: var(--pico-space-2); padding: var(--pico-space-3) var(--pico-space-4); border-top: var(--pico-line); background: var(--pico-surface-raised); }
  .pico-hanoi-ai-followup button { width: 100%; min-height: 38px; border: var(--pico-line); border-radius: 9px; background: var(--pico-surface); color: var(--pico-ink); font: 600 var(--pico-size-sm)/1 var(--pico-font-ui); cursor: pointer; transition: border-color var(--pico-duration-fast), background var(--pico-duration-fast); }
  .pico-hanoi-ai-followup button:hover { border-color: var(--pico-accent); background: var(--pico-accent-wash); }
  .pico-hanoi-ai-compose { display: flex; align-items: flex-end; gap: var(--pico-space-2); margin: 0 var(--pico-space-3) var(--pico-space-3); padding: 5px; border: var(--pico-line); border-radius: 12px; background: var(--pico-surface); transition: border-color var(--pico-duration-fast), box-shadow var(--pico-duration-fast); }
  .pico-hanoi-ai-compose:focus-within { border-color: var(--pico-accent); box-shadow: 0 0 0 3px var(--pico-accent-wash); }
  .pico-hanoi-ai-compose label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .pico-hanoi-ai .pico-hanoi-ai-compose textarea { field-sizing: content; flex: 1 1 auto; min-width: 0; min-height: 38px; max-height: 132px; padding: 8px 9px; border: 0; outline: 0; background: transparent; color: var(--pico-ink); font: 400 var(--pico-size-code)/1.5 var(--pico-font-text); resize: none; }
  .pico-hanoi-ai .pico-hanoi-ai-compose textarea::placeholder { color: var(--pico-code-dim); }
  .pico-hanoi-ai .pico-hanoi-ai-send { display: grid; place-items: center; flex: 0 0 auto; width: 38px; height: 38px; padding: 0; border: 0; border-radius: 10px; background: var(--pico-accent); color: var(--pico-on-accent); cursor: pointer; transition: background var(--pico-duration-fast), transform var(--pico-duration-fast); }
  .pico-hanoi-ai .pico-hanoi-ai-send svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
  .pico-hanoi-ai .pico-hanoi-ai-send:hover:not(:disabled) { background: var(--pico-accent-deep); transform: translateY(-1px); }
  .pico-hanoi-ai .pico-hanoi-ai-send:active:not(:disabled) { transform: translateY(0); }
  .pico-hanoi-ai .pico-hanoi-ai-send:disabled { background: var(--pico-hairline); color: var(--pico-ink-soft); cursor: not-allowed; }

  @media (max-width: 760px) {
    .pico-hanoi-ai-log { padding: var(--pico-space-3); }
  }
  @media (prefers-reduced-motion: reduce) {
    .pico-hanoi-ai .pico-hanoi-ai-prompts button:hover,
    .pico-hanoi-ai .pico-hanoi-ai-send:hover:not(:disabled) { transform: none; }
  }
`;
export {
  ARBITRARY_PYTHON_EXAMPLE,
  HANOI_LESSONS,
  HANOI_PITFALLS,
  Root,
  STARTER,
  diskId,
  examples,
  hanoi,
  hanoiAIResponse,
  hanoiDriver,
  sceneWorld,
  selectedCodeAIResponse,
  selectedDisk,
  starter
};
