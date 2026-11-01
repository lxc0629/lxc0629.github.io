// playgrounds/hanoi/hanoi.generated.tsx
import { useId } from "../libs/react.js";
import { on, stateful } from "../pico.js";

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

// playgrounds/hanoi/hanoi.generated.tsx
import { python as python3 } from "../pico.js";
import { playback as playback2 } from "../pico.js";
import { Source } from "../pico.js";
import { feature as feature2, playbackHost as playbackHost2, provided as provided2, selectionHost as selectionHost2 } from "../session.js";
import { SessionPage } from "../session.js";
import { traceQueries as traceQueries2 } from "../session.js";

// playgrounds/hanoi/hanoi.script.json
var hanoi_script_default = {
  id: "hanoi",
  title: "\u8BB2\u89E3\u8BE5\u7B97\u6CD5\u4EE3\u7801",
  from: "",
  mode: "instruction",
  auto: true,
  steps: [
    {
      title: "\u8FD9\u5EA7\u5854\u53EA\u80FD\u987A\u65F6\u9488\u8D70",
      concepts: ["recursion"],
      stage: {
        panels: [
          "viz"
        ],
        focus: "viz"
      },
      say: "\u4E09\u6839\u67F1\u5B50 A\u3001B\u3001C \u56F4\u6210\u4E00\u5708\uFF0C\u76D8\u5B50\u53EA\u80FD\u987A\u65F6\u9488\u8D70\u4E00\u683C\uFF1AA\u2192B\u3001B\u2192C\u3001C\u2192A\u3002\u5927\u76D8\u4E0D\u80FD\u538B\u5728\u5C0F\u76D8\u4E0A\u3002\n\n\u4EFB\u52A1\u662F\u628A 3 \u4E2A\u76D8\u5B50\u4ECE A \u642C\u5230 C\u3002\u6CE8\u610F\uFF1AA \u5230 C \u4E0D\u662F\u4E00\u6B65\uFF0C\u8981\u8D70 A\u2192B\u2192C \u4E24\u683C\u3002\n\n\u7A0B\u5E8F\u6BCF\u6253\u5370\u4E00\u884C `A -> B` \u5C31\u662F\u8D70\u4E00\u6B65\uFF0C\u53F3\u8FB9\u7684\u53EF\u89C6\u5316\u7167\u7740\u8F93\u51FA\u642C\u76D8\u5B50\u3002"
    },
    {
      title: "\u5148\u628A\u201C\u8D70\u4E00\u683C\u201D\u5199\u6210\u4E00\u5F20\u8868",
      concepts: ["recursion"],
      stage: {
        panels: []
      },
      say: [
        {
          say: "\u5B57\u5178\u628A\u6BCF\u6839\u67F1\u5B50\u6620\u5C04\u5230\u5B83\u987A\u65F6\u9488\u7684\u4E0B\u4E00\u6839\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n'
        },
        {
          say: "\u6574\u4E2A\u7A0B\u5E8F\u91CC\u201C\u600E\u4E48\u8D70\u201D\u53EA\u5728\u8FD9\u4E00\u5904\u5B9A\u4E49\u3002"
        }
      ]
    },
    {
      title: "hanoi \u662F\u4E00\u4E2A\u627F\u8BFA",
      concepts: ["recursion"],
      say: [
        {
          say: "`hanoi(n, src, dst)` \u53EA\u627F\u8BFA\u4E00\u4EF6\u4E8B\uFF1A\u628A src \u6700\u4E0A\u9762 n \u4E2A\u76D8\u5B50\u642C\u5230 dst\uFF0C\u4E0B\u9762\u66F4\u5927\u7684\u76D8\u5B50\u4E0D\u52A8\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n'
        },
        {
          say: "`aux` \u662F\u5269\u4E0B\u7684\u7B2C\u4E09\u6839\u67F1\u5B50\uFF1A\u4E09\u6839\u91CC\u53BB\u6389 src \u548C dst\uFF0C\u53EA\u5269\u4E00\u4E2A\u3002",
          paragraph: true,
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n'
        },
        {
          say: '\u7559\u610F `aux,` \u7684\u9017\u53F7\uFF1A\u96C6\u5408\u76F8\u51CF\u5F97\u5230\u7684\u662F `{"B"}` \u8FD9\u6837\u4E00\u4E2A\u96C6\u5408\uFF0C\u9017\u53F7\u628A\u5B83\u552F\u4E00\u7684\u5143\u7D20\u62C6\u51FA\u6765\uFF0C`aux` \u624D\u662F\u5B57\u7B26\u4E32 `"B"`\u3002',
          paragraph: true
        },
        {
          say: "\u5C11\u4E86\u9017\u53F7\uFF0C\u540E\u9762\u62FF aux \u5F53\u67F1\u5B50\u540D\u5C31\u4F1A\u51FA\u9519\u3002"
        }
      ]
    },
    {
      title: "\u6700\u7B80\u5355\u7684\u627F\u8BFA\uFF1A\u53EA\u5269\u4E00\u4E2A\u76D8\u5B50",
      concepts: ["recursion"],
      say: [
        {
          say: "\u4E00\u4E2A\u76D8\u5B50\u79BB\u7EC8\u70B9\u53EF\u80FD\u662F\u4E00\u683C\uFF08A\u2192B\uFF09\uFF0C\u4E5F\u53EF\u80FD\u662F\u4E24\u683C\uFF08A\u2192C\uFF09\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n'
        },
        {
          say: "\u6240\u4EE5\u5199 `while`\uFF1A\u8FD8\u6CA1\u5230\uFF0C\u5C31\u518D\u8D70\u4E00\u683C\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n'
        },
        {
          say: "\u6BCF\u8D70\u4E00\u683C\u6253\u5370\u4E00\u884C\uFF0C",
          paragraph: true,
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n'
        },
        {
          say: "\u518D\u628A `src` \u524D\u79FB\u5230\u4E0B\u4E00\u6839\u67F1\u5B50\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n'
        },
        {
          say: "\u5230\u4E86\u5C31 `return`\uFF0C\u8FD9\u4E00\u5C42\u7684\u627F\u8BFA\u5151\u73B0\u4E86\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n'
        },
        {
          say: "\u4E3A\u4EC0\u4E48\u4E00\u5B9A\u662F while\uFF1F\u8BB2\u5B8C\u6574\u4E2A\u7A0B\u5E8F\u540E\u6211\u4EEC\u6539\u4E00\u4E0B\u4EB2\u773C\u770B\u770B\u3002",
          paragraph: true
        }
      ]
    },
    {
      title: "\u8BA9\u8DEF\u539F\u5219",
      concepts: ["recursion"],
      say: "\u5199\u9012\u5F52\u4E4B\u524D\uFF0C\u5148\u60F3\u6E05\u695A\u4E00\u4EF6\u4E8B\uFF1A\u6700\u5927\u7684\u76D8\u5B50\u8981\u4ECE X \u8D70\u5230 Y\uFF0C\u6BD4\u5B83\u5C0F\u7684 n-1 \u4E2A\u5FC5\u987B\u90FD\u5728\u7B2C\u4E09\u6839\u67F1\u5B50\u4E0A\u3002\n\n\u5B83\u4EEC\u5728 X \u4E0A\uFF0C\u5927\u76D8\u62FF\u4E0D\u51FA\u6765\uFF1B\u5728 Y \u4E0A\uFF0C\u5927\u76D8\u653E\u4E0D\u4E0A\u53BB\u3002\u53EA\u5269\u7B2C\u4E09\u6839\u3002\n\n\u6574\u4E2A\u7B97\u6CD5\u5C31\u662F\u8FD9\u6761\u539F\u5219\uFF0C\u4E0B\u9762\u4E24\u6BB5\u4EE3\u7801\u90FD\u662F\u5B83\u63A8\u51FA\u6765\u7684\u3002"
    },
    {
      title: "\u7EC8\u70B9\u5C31\u5728\u4E0B\u4E00\u683C",
      concepts: ["recursion"],
      say: [
        {
          say: "\u7EC8\u70B9\u5728\u4E0B\u4E00\u683C\u65F6\uFF0C\u5927\u76D8\u53EA\u8D70\u4E00\u6B65\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n'
        },
        {
          say: "\u6309\u8BA9\u8DEF\u539F\u5219\uFF1A\u5148\u628A n-1 \u4E2A\u642C\u5230 aux\uFF0C",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n'
        },
        {
          say: "\u5927\u76D8\u8D70\u4E00\u683C\uFF0C",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n'
        },
        {
          say: "\u518D\u628A n-1 \u4E2A\u642C\u5230 dst \u4E0A\u9762\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n'
        },
        {
          say: "\u4E09\u884C\u90FD\u662F\u540C\u4E00\u4E2A\u627F\u8BFA\uFF0C\u53EA\u662F n \u5C11\u4E86\u4E00\u4E2A\uFF0C\u6216\u53EA\u642C 1 \u4E2A\u3002",
          paragraph: true
        },
        {
          say: "\u4E0D\u7528\u8FFD\u8FDB `hanoi(n - 1, \u2026)` \u53BB\u770B\u5B83\u600E\u4E48\u642C\uFF1An == 1 \u5DF2\u7ECF\u5151\u73B0\uFF0C\u6240\u4EE5 n == 2 \u6210\u7ACB\uFF0Cn == 3 \u4E5F\u6210\u7ACB\u3002",
          paragraph: true
        },
        {
          say: "\u8FD9\u5C31\u662F\u9012\u5F52\u7684\u201C\u4FE1\u4EFB\u201D\u3002"
        }
      ]
    },
    {
      title: "\u7EC8\u70B9\u5728\u4E24\u683C\u5916",
      concepts: ["recursion"],
      say: [
        {
          say: "\u7EC8\u70B9\u5728\u4E24\u683C\u5916\uFF08\u6BD4\u5982 A\u2192C\uFF09\u65F6\uFF0Caux \u6070\u597D\u5728\u4E2D\u95F4\uFF0C\u5927\u76D8\u8981\u8D70\u4E24\u6B65\uFF1Asrc\u2192aux\uFF0C\u518D aux\u2192dst\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n'
        },
        {
          say: "\u6BCF\u4E00\u6B65\u524D\u90FD\u7528\u4E00\u6B21\u8BA9\u8DEF\u539F\u5219\uFF1A"
        },
        {
          say: "\xB7 \u5927\u76D8\u8D70 src\u2192aux \u524D\uFF0C\u5C0F\u76D8\u8981\u5728 dst\uFF1B",
          paragraph: true
        },
        {
          say: "\xB7 \u5927\u76D8\u8D70 aux\u2192dst \u524D\uFF0C\u5C0F\u76D8\u8981\u5728 src\u3002",
          paragraph: true
        },
        {
          say: "\u4E8E\u662F\u662F\u4E94\u884C\uFF1A\u5C0F\u76D8\u53BB dst\uFF0C",
          paragraph: true,
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n        hanoi(n - 1, src, dst)\n'
        },
        {
          say: "\u5927\u76D8\u5230 aux\uFF0C",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n        hanoi(n - 1, src, dst)\n        hanoi(1, src, aux)\n'
        },
        {
          say: "\u5C0F\u76D8\u56DE src\uFF0C",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n        hanoi(n - 1, src, dst)\n        hanoi(1, src, aux)\n        hanoi(n - 1, dst, src)\n'
        },
        {
          say: "\u5927\u76D8\u5230 dst\uFF0C",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n        hanoi(n - 1, src, dst)\n        hanoi(1, src, aux)\n        hanoi(n - 1, dst, src)\n        hanoi(1, aux, dst)\n'
        },
        {
          say: "\u5C0F\u76D8\u518D\u5230 dst\u3002",
          write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n        hanoi(n - 1, src, dst)\n        hanoi(1, src, aux)\n        hanoi(n - 1, dst, src)\n        hanoi(1, aux, dst)\n        hanoi(n - 1, src, dst)\n'
        }
      ]
    },
    {
      title: "\u8FD0\u884C",
      concepts: ["recursion"],
      stage: {
        panels: [
          "viz",
          "output"
        ],
        focus: "viz",
        arrange: {
          split: "row",
          children: [
            {
              slot: "viz"
            },
            {
              split: "column",
              children: [
                {
                  slot: "editor"
                },
                {
                  slot: "output"
                }
              ]
            }
          ]
        },
        sizes: {
          viz: 1.65,
          "column:editor+output": 1.15,
          editor: 1.35
        }
      },
      say: [
        {
          say: "3 \u4E2A\u76D8\u5B50\u4E00\u5171\u8D70\u4E86 21 \u6B65\u3002"
        },
        {
          say: "\u770B\u6700\u5927\u7684\u76D8\u5B50\uFF1A\u5B83\u53EA\u8D70\u4E86\u4E24\u6B21\uFF0CA\u2192B \u548C B\u2192C\u3002"
        },
        {
          say: "\u6BCF\u6B21\u8D70\u4E4B\u524D\uFF0C\u5C0F\u76D8\u90FD\u6070\u597D\u8BA9\u5F00\u4E86\u2014\u2014\u8DDF\u7740\u5B83\u8D70\u4E00\u904D\u3002",
          do: [
            {
              action: "hanoi.followDisk",
              args: {
                disk: 3
              }
            }
          ]
        }
      ],
      do: [
        {
          action: "code.run"
        }
      ]
    },
    {
      title: "\u7B2C\u4E00\u6B65\u662F\u8C01\u8D70\u7684",
      concepts: ["recursion", "debug"],
      stage: {
        panels: [
          "viz",
          "debug"
        ],
        focus: "debug",
        arrange: {
          split: "column",
          children: [
            {
              split: "row",
              children: [
                {
                  slot: "editor"
                },
                {
                  slot: "viz"
                }
              ]
            },
            {
              slot: "debug"
            }
          ]
        },
        sizes: {
          "row:editor+viz": 1.35,
          editor: 1.35,
          debug: 1.05
        }
      },
      say: "\u6211\u505C\u5728\u7B2C 9 \u884C\u7B2C\u4E00\u6B21\u6267\u884C\uFF0C\u4E5F\u5C31\u662F\u6253\u5370\u7B2C\u4E00\u884C `A -> B` \u4E4B\u524D\u3002\u770B Debugger \u7684\u8C03\u7528\u6808\uFF1A`hanoi(3, A, C)` \u2192 `hanoi(2, A, C)` \u2192 `hanoi(1, A, C)`\u3002\n\n\u6700\u5916\u9762\u4E24\u5C42\u4E00\u53E5 print \u90FD\u6CA1\u6267\u884C\uFF0C\u5B83\u4EEC\u53EA\u662F\u628A\u4EFB\u52A1\u5206\u4E0B\u53BB\uFF1B\u771F\u6B63\u8D70\u68CB\u7684\u6C38\u8FDC\u662F `n == 1` \u90A3\u4E00\u5C42\u3002",
      do: [
        {
          action: "hanoi.locateMove",
          args: {
            move: 1,
            phase: "print"
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "note",
            at: {
              line: 9,
              text: "print"
            },
            text: "\u771F\u6B63\u8D70\u68CB\u7684\u662F n == 1 \u8FD9\u4E00\u5C42"
          }
        }
      ]
    },
    {
      title: "while \u8D70\u4E86\u4E24\u8F6E",
      concepts: ["recursion", "debug"],
      say: "\u73B0\u5728\u505C\u5728\u7B2C 10 \u884C\uFF0C\u884C\u5C3E\u663E\u793A\u8FD9\u4E00\u523B\u7684\u53D8\u91CF\u3002\n\n\u7B2C\u4E00\u6B21\u505C\u5728\u8FD9\u91CC\uFF0C`src` \u662F A\uFF0C\u6267\u884C\u5B8C\u53D8\u6210 B\uFF0C\u8FD8\u6CA1\u5230 C\uFF0C\u4E8E\u662F\u518D\u8D70\u4E00\u8F6E\uFF1B\u7B2C\u4E8C\u6B21\u505C\u5728\u8FD9\u91CC\uFF0C`src` \u662F B\uFF0C\u6267\u884C\u5B8C\u5C31\u662F C\uFF0C\u5FAA\u73AF\u7ED3\u675F\u3002\n\n\u8FD9\u4E2A\u76D8\u5B50\u4E00\u53E3\u6C14\u8D70\u4E86\u4E24\u683C\u2014\u2014\u5B83\u662F\u6700\u5C0F\u7684\u76D8\u5B50\uFF0C\u8DEF\u4E0A\u6CA1\u4EBA\u6321\u3002",
      do: [
        {
          action: "hanoi.locateMove",
          args: {
            move: 1,
            phase: "advance"
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "note",
            at: {
              line: 8,
              text: "while"
            },
            text: "\u6CA1\u5230 dst\uFF0C\u5C31\u518D\u8D70\u4E00\u683C"
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "mark",
            at: {
              line: 10
            }
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "mark",
            at: {
              variable: "src"
            }
          }
        }
      ],
      offer: [
        {
          action: "hanoi.locateMove",
          args: {
            move: 1,
            phase: "advance"
          },
          label: "\u7B2C\u4E00\u8F6E"
        },
        {
          action: "hanoi.locateMove",
          args: {
            move: 2,
            phase: "advance"
          },
          label: "\u7B2C\u4E8C\u8F6E"
        }
      ]
    },
    {
      title: "\u6613\u9519\u70B9\uFF1A\u628A while \u6539\u6210 if",
      concepts: ["recursion", "debug"],
      stage: {
        panels: []
      },
      say: "\u5F88\u591A\u4EBA\u89C9\u5F97\u201C\u4E00\u4E2A\u76D8\u5B50\u8D70\u4E00\u683C\u5C31\u884C\u201D\uFF0C\u628A while \u5199\u6210 if\u3002\u6211\u53EA\u6539\u7B2C 8 \u884C\u8FD9\u4E00\u5904\u3002",
      write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        if src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n        hanoi(n - 1, src, dst)\n        hanoi(1, src, aux)\n        hanoi(n - 1, dst, src)\n        hanoi(1, aux, dst)\n        hanoi(n - 1, src, dst)\n'
    },
    {
      title: "\u7B2C\u4E8C\u6B65\u5C31\u9519\u4E86",
      concepts: ["recursion", "debug"],
      stage: {
        panels: [
          "viz",
          "output"
        ],
        focus: "viz",
        arrange: {
          split: "row",
          children: [
            {
              slot: "viz"
            },
            {
              split: "column",
              children: [
                {
                  slot: "editor"
                },
                {
                  slot: "output"
                }
              ]
            }
          ]
        },
        sizes: {
          viz: 1.65,
          "column:editor+output": 1.15,
          editor: 1.35
        }
      },
      say: [
        {
          say: "\u6539\u5B8C\u4E86\uFF0C\u8FD0\u884C\u770B\u770B\u3002",
          do: [
            {
              action: "code.run"
            }
          ]
        },
        {
          say: "\u53EF\u89C6\u5316\u5728\u7B2C 2 \u6B65\u753B\u4E86\u7EA2\u53C9\uFF1A\u76D8\u5B50 2 \u538B\u5728\u4E86\u76D8\u5B50 1 \u4E0A\u3002",
          do: [
            {
              action: "annotation.show",
              args: {
                kind: "note",
                at: {
                  object: "disk:1"
                },
                text: "\u76D8\u5B50 1 \u505C\u5728\u4E86 B"
              }
            },
            {
              action: "annotation.show",
              args: {
                kind: "note",
                at: {
                  output: 2
                },
                text: "\u7B2C 2 \u6B65\uFF1A\u76D8\u5B50 2 \u538B\u4E0A\u76D8\u5B50 1"
              }
            }
          ]
        },
        {
          say: "\u53EF\u9519\u771F\u7684\u5728\u7B2C 2 \u6B65\u5417\uFF1F\u7EE7\u7EED\u5F80\u4E0B\u770B\u3002",
          paragraph: true
        }
      ]
    },
    {
      title: "\u7EA2\u53C9\u4E0D\u4E00\u5B9A\u662F\u72AF\u9519\u7684\u5730\u65B9",
      concepts: ["recursion", "debug"],
      stage: {
        panels: [
          "viz",
          "debug"
        ],
        focus: "debug",
        arrange: {
          split: "column",
          children: [
            {
              split: "row",
              children: [
                {
                  slot: "editor"
                },
                {
                  slot: "viz"
                }
              ]
            },
            {
              slot: "debug"
            }
          ]
        },
        sizes: {
          "row:editor+viz": 1.35,
          editor: 1.35,
          debug: 1.05
        }
      },
      say: "\u56DE\u5230\u7B2C 1 \u6B65\uFF1A\u8FD9\u4E00\u5C42\u662F `hanoi(1, A, C)`\uFF0C\u8981\u8D70\u4E24\u683C\u3002`if` \u53EA\u8D70\u4E86\u4E00\u683C\u5C31\u7ED3\u675F\uFF0C\u76D8\u5B50 1 \u505C\u5728\u4E86 B\u3002\n\n\u63A5\u7740 `hanoi(1, A, B)` \u8BA9\u76D8\u5B50 2 \u8D70 A\u2192B\uFF0C\u6B63\u597D\u538B\u4E0A\u53BB\u2014\u2014\u7EA2\u53C9\u662F\u5728\u8FD9\u65F6\u624D\u51FA\u73B0\u7684\u3002\n\n`while` \u662F\u201C\u8D70\u5230\u4E3A\u6B62\u201D\uFF0C`if` \u53EA\u662F\u201C\u8D70\u4E00\u6B21\u201D\u3002",
      do: [
        {
          action: "hanoi.locateMove",
          args: {
            move: 1,
            phase: "print"
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "note",
            at: {
              line: 8,
              text: "if"
            },
            text: "\u53EA\u5224\u65AD\u4E00\u6B21\uFF1A\u8D70\u4E00\u683C\u5C31\u7ED3\u675F"
          }
        }
      ],
      offer: [
        {
          action: "hanoi.locateMove",
          args: {
            move: 1,
            phase: "print"
          },
          label: "\u72AF\u9519\u7684\u7B2C 1 \u6B65"
        },
        {
          action: "hanoi.locateMove",
          args: {
            move: 2,
            phase: "print"
          },
          label: "\u51FA\u7EA2\u53C9\u7684\u7B2C 2 \u6B65"
        }
      ]
    },
    {
      title: "\u6539\u56DE while",
      concepts: ["recursion", "debug"],
      stage: {
        panels: []
      },
      say: "\u628A\u7B2C 8 \u884C\u6539\u56DE\u6765\u3002",
      write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n        hanoi(n - 1, src, dst)\n        hanoi(1, src, aux)\n        hanoi(n - 1, dst, src)\n        hanoi(1, aux, dst)\n        hanoi(n - 1, src, dst)\n'
    },
    {
      title: "\u6613\u9519\u70B9\uFF1A\u76F4\u63A5\u5957\u7ECF\u5178\u4E09\u6B65",
      concepts: ["recursion", "debug"],
      say: "\u5B66\u8FC7\u7ECF\u5178\u6C49\u8BFA\u5854\u7684\u540C\u5B66\u4F1A\u95EE\uFF1A\u5206\u4E24\u79CD\u60C5\u51B5\u592A\u9EBB\u70E6\uFF0C\u76F4\u63A5\u5199\u7ECF\u5178\u7684\u4E09\u6B65\u884C\u4E0D\u884C\uFF1F\u53CD\u6B63 n == 1 \u7684 while \u80FD\u8D70\u4E24\u683C\u3002\n\n\u6211\u628A\u4E24\u4E2A\u5206\u652F\u6362\u6210\u7ECF\u5178\u7684\u4E09\u6B65\u3002",
      write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    hanoi(n - 1, src, aux)\n    hanoi(1, src, dst)\n    hanoi(n - 1, aux, dst)\n'
    },
    {
      title: "\u7B2C\u516D\u6B65\u649E\u4E0A\u4E86",
      concepts: ["recursion", "debug"],
      stage: {
        panels: [
          "viz",
          "output"
        ],
        focus: "viz",
        arrange: {
          split: "row",
          children: [
            {
              slot: "viz"
            },
            {
              split: "column",
              children: [
                {
                  slot: "editor"
                },
                {
                  slot: "output"
                }
              ]
            }
          ]
        },
        sizes: {
          viz: 1.65,
          "column:editor+output": 1.15,
          editor: 1.35
        }
      },
      say: [
        {
          say: "\u6539\u5B8C\u4E86\uFF0C\u8FD0\u884C\u770B\u770B\u3002",
          do: [
            {
              action: "code.run"
            }
          ]
        },
        {
          say: "\u7B2C 6 \u6B65\u753B\u4E86\u7EA2\u53C9\uFF1A\u76D8\u5B50 3 \u538B\u5728\u4E86\u76D8\u5B50 1 \u4E0A\u3002"
        }
      ]
    },
    {
      title: "\u5927\u76D8\u8DEF\u8FC7\u65F6\uFF0C\u90A3\u91CC\u6709\u4EBA",
      concepts: ["recursion", "debug"],
      stage: {
        panels: [
          "viz",
          "debug"
        ],
        focus: "viz",
        arrange: {
          split: "column",
          children: [
            {
              split: "row",
              children: [
                {
                  slot: "editor"
                },
                {
                  slot: "viz"
                }
              ]
            },
            {
              slot: "debug"
            }
          ]
        },
        sizes: {
          "row:editor+viz": 1.35,
          editor: 1.35,
          viz: 1.05
        }
      },
      say: "\u505C\u5728\u7B2C 6 \u6B21\u6253\u5370\uFF1A\u8C03\u7528\u6808\u662F `hanoi(3, A, C)` \u2192 `hanoi(1, A, C)`\uFF0C\u5728\u642C\u6700\u5927\u7684\u76D8\u5B50\uFF0C\u8981\u8D70 A\u2192B\u2192C \u4E24\u683C\u3002\u53EF\u662F\u524D\u9762\u521A\u628A\u4E24\u4E2A\u5C0F\u76D8\u642C\u5230\u4E86 aux\uFF0C\u4E5F\u5C31\u662F B\u2014\u2014\u5927\u76D8\u8D70\u7B2C\u4E00\u683C\u5C31\u649E\u4E0A\u4E86\u3002\n\n\u8BA9\u8DEF\u539F\u5219\u8BF4\u7684\u662F\u5927\u76D8\u7684\u6BCF\u4E00\u6B65\u3002\u7ECF\u5178\u4E09\u6B65\u53EA\u8BA9\u4E86\u4E00\u6B21\u8DEF\uFF0C\u6240\u4EE5\u7EC8\u70B9\u5728\u4E24\u683C\u5916\u65F6\u5FC5\u987B\u62C6\u6210\u4E94\u6B65\u3002\n\n\u8FD9\u4E5F\u8BF4\u660E\u4E86 while \u7684\u8FB9\u754C\uFF1A\u4E00\u53E3\u6C14\u8D70\u4E24\u683C\uFF0C\u53EA\u5BF9\u8DEF\u4E0A\u6CA1\u4EBA\u7684\u76D8\u5B50\u624D\u5408\u6CD5\u3002",
      do: [
        {
          action: "hanoi.locateMove",
          args: {
            move: 6,
            phase: "print"
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "link",
            at: {
              line: 14,
              text: "hanoi(1, src, dst)"
            },
            to: {
              object: "disk:3"
            },
            text: "\u4E00\u53E3\u6C14\u8D70\u4E24\u683C"
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "note",
            at: {
              object: "disk:1"
            },
            text: "B \u4E0A\u8FD8\u6709\u5C0F\u76D8"
          }
        }
      ]
    },
    {
      title: "\u6539\u56DE\u6765",
      concepts: ["recursion", "debug"],
      stage: {
        panels: []
      },
      say: "\u628A\u4E24\u4E2A\u5206\u652F\u6062\u590D\u3002",
      write: 'def next_of(peg):\n    return {"A": "B", "B": "C", "C": "A"}[peg]\n\ndef hanoi(n, src, dst):\n    aux, = set("ABC") - {src, dst}\n\n    if n == 1:\n        while src != dst:\n            print(f"{src} -> {next_of(src)}")\n            src = next_of(src)\n        return\n\n    if next_of(src) == dst:\n        hanoi(n - 1, src, aux)\n        hanoi(1, src, dst)\n        hanoi(n - 1, aux, dst)\n    else:\n        hanoi(n - 1, src, dst)\n        hanoi(1, src, aux)\n        hanoi(n - 1, dst, src)\n        hanoi(1, aux, dst)\n        hanoi(n - 1, src, dst)\n'
    },
    {
      title: "\u56DE\u987E",
      concepts: ["recursion"],
      stage: {
        panels: [
          "viz"
        ],
        focus: "viz"
      },
      say: "\u4E09\u4EF6\u4E8B\uFF1A\n1. \u627F\u8BFA\uFF1A`hanoi(n, src, dst)` \u53EA\u7BA1\u628A n \u4E2A\u76D8\u5B50\u4ECE src \u642C\u5230 dst\u3002\n2. \u8BA9\u8DEF\u539F\u5219\uFF1A\u5927\u76D8\u6BCF\u8D70\u4E00\u6B65\uFF0C\u5C0F\u76D8\u90FD\u5FC5\u987B\u5728\u7B2C\u4E09\u6839\u67F1\u5B50\u4E0A\u3002\n3. \u4FE1\u4EFB\uFF1An == 1 \u5151\u73B0\u4E86\uFF0C\u66F4\u5927\u7684 n \u5C31\u9760\u540C\u4E00\u4E2A\u627F\u8BFA\u5151\u73B0\u3002\n\n\u6709\u4EFB\u4F55\u5730\u65B9\u60F3\u518D\u770B\u4E00\u904D\uFF0C\u76F4\u63A5\u5728\u4E0B\u9762\u95EE\u6211\u3002",
      do: [
        {
          action: "code.run"
        }
      ],
      offer: [
        {
          action: "hanoi.disks",
          args: {
            disks: 4
          },
          label: "\u6362 4 \u4E2A\u76D8\u5B50\u8FD0\u884C"
        }
      ]
    }
  ]
};

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

// playgrounds/hanoi/hanoi.generated.tsx
import { mockAiPort as mockAiPort2 } from "../session.js";
import { jsx, jsxs } from "../libs/react.js";
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
var NEXT_OF = `def next_of(peg):
    return {"A": "B", "B": "C", "C": "A"}[peg]
`;
var PROMISE = `${NEXT_OF}
def hanoi(n, src, dst):
    aux, = set("ABC") - {src, dst}
`;
var BASE_CASE = `${PROMISE}
    if n == 1:
        while src != dst:
            print(f"{src} -> {next_of(src)}")
            src = next_of(src)
        return
`;
var NEAR = `${BASE_CASE}
    if next_of(src) == dst:
        hanoi(n - 1, src, aux)
        hanoi(1, src, dst)
        hanoi(n - 1, aux, dst)
`;
var STARTER = `${NEAR}    else:
        hanoi(n - 1, src, dst)
        hanoi(1, src, aux)
        hanoi(n - 1, dst, src)
        hanoi(1, aux, dst)
        hanoi(n - 1, src, dst)
`;
var PITFALLS = {
  stepOnce: STARTER.replace("while src != dst:", "if src != dst:"),
  classic: `${BASE_CASE}
    hanoi(n - 1, src, aux)
    hanoi(1, src, dst)
    hanoi(n - 1, aux, dst)
`
};
var HANOI_SCRIPT = hanoi_script_default;
var START = { action: "script.play", label: HANOI_SCRIPT.title, args: { script: HANOI_SCRIPT } };
function hanoiAnswer(request) {
  if (request.kind === "explain") {
    const [title, text] = explainLine(request.text.trim());
    return { title, text, primary: { action: "selection.locate", label: "\u5B9A\u4F4D\u5230\u6267\u884C" } };
  }
  return {
    title: "\u5148\u4ECE\u5B8C\u6574\u8BB2\u89E3\u5F00\u59CB",
    text: "\u8FD9\u4E2A\u6F14\u793A\u91CC\u7684 AI \u8FD8\u53EA\u51C6\u5907\u4E86\u6C49\u8BFA\u5854\u7684\u5B8C\u6574\u8BB2\u89E3\uFF1A\u4E00\u6BB5\u4E00\u6BB5\u5199\u51FA\u4EE3\u7801\uFF0C\u518D\u4E00\u8D77\u770B\u8FD0\u884C\u548C\u4E24\u4E2A\u6613\u9519\u70B9\u3002\u8BB2\u89E3\u4E2D\u968F\u65F6\u53EF\u4EE5\u5728\u8FD9\u91CC\u8FFD\u95EE\u3002",
    primary: START
  };
}
function explainLine(line) {
  if (/^def\s+/.test(line)) return ["\u8FD9\u53E5\u5728\u5B9A\u4E49\u51FD\u6570", "\u6267\u884C\u5230 def \u65F6 Python \u53EA\u521B\u5EFA\u51FD\u6570\u5BF9\u8C61\uFF0C\u4E0D\u6267\u884C\u51FD\u6570\u4F53\uFF1B\u7B49\u5230\u8C03\u7528\u65F6\u624D\u5EFA\u7ACB\u65B0\u7684\u8C03\u7528\u5E27\u3002"];
  if (/^while\s+/.test(line)) return ["\u8FD9\u662F\u5FAA\u73AF\u6761\u4EF6", "\u6BCF\u8F6E\u5F00\u59CB\u524D\u90FD\u4F1A\u91CD\u65B0\u6C42\u503C\u6761\u4EF6\uFF1B\u5FAA\u73AF\u4F53\u6539\u4E86 src\uFF0C\u6240\u4EE5\u8FD9\u4E00\u53E5\u5728\u4E00\u6B21\u8C03\u7528\u91CC\u53EF\u80FD\u6267\u884C\u591A\u6B21\u3002"];
  if (/^if\s+/.test(line)) return ["\u8FD9\u662F\u4E00\u6B21\u5206\u652F\u5224\u65AD", "\u5148\u6C42\u51FA\u5192\u53F7\u524D\u8868\u8FBE\u5F0F\u7684\u771F\u5047\uFF0C\u53EA\u5728\u4E3A True \u65F6\u8FDB\u5165\u7F29\u8FDB\u5757\u3002"];
  if (/hanoi\s*\(/.test(line)) return ["\u8FD9\u53E5\u521B\u5EFA\u4E00\u4E2A\u66F4\u5C0F\u7684\u5B50\u4EFB\u52A1", "\u5148\u6C42\u503C\u53C2\u6570\uFF0C\u518D\u4E3A\u65B0\u7684 hanoi \u8C03\u7528\u5EFA\u7ACB\u7ED1\u5B9A\uFF1A\u628A\u201C\u642C\u591A\u5C11\u4E2A\u3001\u4ECE\u54EA\u91CC\u3001\u5230\u54EA\u91CC\u201D\u4EA4\u7ED9\u4E0B\u4E00\u5C42\u3002"];
  if (/^return\b/.test(line)) return ["\u8FD9\u53E5\u7ED3\u675F\u5F53\u524D\u8C03\u7528", "return \u53EA\u7ED3\u675F\u8FD9\u4E00\u5C42\uFF0C\u63A7\u5236\u6743\u56DE\u5230\u8C03\u7528\u5B83\u7684\u90A3\u4E00\u884C\u4E4B\u540E\u3002"];
  if (/^print\s*\(/.test(line)) return ["\u8FD9\u53E5\u4EA7\u751F\u4E00\u6B65\u79FB\u52A8", "f \u5B57\u7B26\u4E32\u5148\u6C42\u503C\uFF0C\u518D\u6253\u5370\uFF1B\u53EF\u89C6\u5316\u53EA\u6839\u636E\u6253\u5370\u51FA\u6765\u7684 `X -> Y` \u642C\u76D8\u5B50\u3002"];
  return ["\u6309\u6C42\u503C\u987A\u5E8F\u8BFB\u8FD9\u4E00\u53E5", "\u5148\u770B\u53F3\u8FB9\u8BFB\u4E86\u54EA\u4E9B\u540D\u5B57\uFF0C\u518D\u770B\u5DE6\u8FB9\u7ED1\u5B9A\u6216\u4FEE\u6539\u4E86\u4EC0\u4E48\u3002\u5B9A\u4F4D\u5230\u6267\u884C\u540E\u53EF\u4EE5\u5BF9\u7167\u53D8\u91CF\u3002"];
}
var ARBITRARY_PYTHON_EXAMPLE = `items = [1, 2]
items.append(3)
print(items)
`;
function hanoiDriver(source2, disks) {
  return /^def\s+hanoi\s*\(\s*n\s*,\s*src\s*,\s*dst\s*\)/m.test(source2) ? `hanoi(${disks}, "A", "C")
` : "";
}
var DISK_COUNTS = [3, 4, 5, 6];
var hanoi = stateful("hanoi", (source2) => ({ source: source2, disks: 3 }), [
  on("editor.changed", (state, event, { emit }) => {
    if (state.source === event.source) return;
    state.source = event.source;
    emit({ type: "python.clear" });
  }),
  on("python.run", (state, _event, { emit }) => {
    emit({ type: "python.execute", source: new Source(state.source, { driver: hanoiDriver(state.source, state.disks) }), options: {
      trace: { events: ["call", "stmt", "return"], observe: { globals: true, locals: true } },
      timeoutMs: 1e4,
      maxTraceSteps: 2e4
    } });
  }),
  on("hanoi.disks.changed", (state, { disks }, { emit }) => {
    if (disks === state.disks || !DISK_COUNTS.includes(disks)) return;
    state.disks = disks;
    emit({ type: "python.clear" });
    emit({ type: "python.run" });
  })
]);
function create(bus) {
  const course2 = hanoi.create(STARTER, bus);
  const playing = playback2.create({}, bus);
  const running = python3.create({}, bus);
  bus.emit({ type: "python.run" });
  return () => {
    running.dispose();
    playing.dispose();
    course2.dispose();
  };
}
var edited = (code) => [{ type: "editor.changed", source: code }, { type: "python.run" }];
var examples = {
  starter: { create, events: [] },
  fourDisks: { create, events: [{ type: "hanoi.disks.changed", disks: 4 }] },
  stepOnce: { create, events: edited(PITFALLS.stepOnce) },
  classic: { create, events: edited(PITFALLS.classic) },
  arbitraryPython: { create, events: edited(ARBITRARY_PYTHON_EXAMPLE) }
};
var pythonCourse = pythonOptions();
var mountOptions = { ...pythonCourse, filename: "hanoi.py", layout: layoutOptions, automatic: 500, start: [{ type: "python.run" }] };
var starter = STARTER;
var hanoiState = provided2("hanoi.state");
function moveStatement(source2, phase) {
  const pattern = phase === "print" ? /^\s*print\s*\(/ : /^\s*src\s*=\s*next_of\(src\)\s*$/;
  let offset = 0;
  for (const line of source2.split("\n")) {
    if (pattern.test(line)) {
      const indent = line.length - line.trimStart().length;
      return { kind: "source", source: source2, from: offset + indent, to: offset + line.trimEnd().length };
    }
    offset += line.length + 1;
  }
  return null;
}
function movesOf(output, n) {
  const pegs = initialPegs(n);
  let broken = false;
  let k = 0;
  return output.flatMap(({ text, step }) => {
    const parsed = parseMoveLine(text.trim());
    if (parsed === null) return [];
    const disk = pegs[parsed.from].at(-1);
    const top = pegs[parsed.to].at(-1);
    const legal = !broken && disk !== void 0 && (top === void 0 || disk < top);
    if (legal) pegs[parsed.to].push(pegs[parsed.from].pop());
    else broken = true;
    return [{ k: ++k, ...parsed, disk: disk ?? null, step, legal }];
  });
}
var show = (args) => ({ action: "annotation.show", args });
function followStops(moves, disk, disks) {
  const pegs = initialPegs(disks);
  const object = diskId(disk);
  return moves.flatMap((move) => {
    if (!move.legal) return [];
    const third = PEGS.find((peg) => peg !== move.from && peg !== move.to);
    const smaller = PEGS.flatMap((peg) => pegs[peg].filter((other) => other < disk).map(() => peg));
    pegs[move.to].push(pegs[move.from].pop());
    if (move.disk !== disk) return [];
    const aside = smaller.every((peg) => peg === third);
    const before = aside ? `${move.from}\u2192${move.to} \u524D\uFF0C\u5C0F\u76D8\u90FD\u5728 ${third}` : `${move.from}\u2192${move.to} \u524D\uFF0C\u5C0F\u76D8\u6CA1\u6709\u5168\u5728 ${third}`;
    return [
      { step: Math.max(1, move.step - 1), do: [show({ kind: "mark", at: { object } }), show({ kind: "note", at: { object }, text: before })] },
      { step: move.step, dwell: 1200, do: [show({ kind: "note", at: { object }, text: `\u8D70\u5230\u4E86 ${move.to}` })] }
    ];
  });
}
var LOCATED = { on: "navigate.located", fail: ["navigate.failed"] };
var FOLLOWED = { on: "tour.finished", fail: ["tour.cancelled"], timeoutMs: 12e4 };
var course = feature2("hanoi.course", {
  requires: [hanoiState, playbackHost2, traceQueries2],
  queries: [
    { id: "hanoi.moves", run: (context) => movesOf(context.query("trace.output"), context.get(hanoiState)?.disks ?? 3) },
    { id: "hanoi.firstIllegal", run: (context) => {
      const moves = context.query("hanoi.moves");
      const illegal = moves.find((move) => !move.legal);
      return illegal === void 0 ? null : { k: illegal.k, step: illegal.step };
    } }
  ],
  actions: [
    {
      id: "hanoi.disks",
      label: "\u76D8\u5B50\u6570\u91CF",
      tags: ["run"],
      settle: () => PYTHON_RAN,
      args: { disks: { type: "integer", enum: DISK_COUNTS } },
      when: (_context, { disks }) => typeof disks === "number" && DISK_COUNTS.includes(disks),
      event: (_context, { disks }) => ({ type: "hanoi.disks.changed", disks })
    },
    {
      id: "hanoi.locateMove",
      label: "\u5B9A\u4F4D\u79FB\u52A8",
      tags: ["navigate"],
      settle: () => LOCATED,
      args: { move: { type: "integer", description: "\u7B2C\u51E0\u6B21\u79FB\u52A8\uFF0C\u4ECE 1 \u5F00\u59CB" }, phase: { type: "string", enum: ["print", "advance"] } },
      when: (context, { move, phase }) => {
        if (typeof move !== "number" || !Number.isInteger(move) || move < 1 || phase !== "print" && phase !== "advance") return false;
        return context.get(playbackHost2)?.trace != null && moveStatement(context.get(hanoiState)?.source ?? "", phase) !== null;
      },
      event: ({ get }, { move, phase }) => ({
        type: "navigate.locate",
        target: moveStatement(get(hanoiState)?.source ?? "", phase),
        occurrence: move
      })
    },
    {
      id: "hanoi.followDisk",
      label: "\u8DDF\u7740\u8FD9\u4E2A\u76D8\u5B50\u8D70",
      tags: ["navigate", "present"],
      settle: () => FOLLOWED,
      args: { disk: { type: "integer" } },
      when: (context, { disk }) => typeof disk === "number" && Number.isInteger(disk) && disk >= 1 && disk <= (context.get(hanoiState)?.disks ?? 3) && context.get(playbackHost2)?.trace != null && context.query("hanoi.moves").some((move) => move.disk === disk && move.legal),
      event: (context, { disk }, caller) => ({
        type: "session.invoke",
        action: "trace.tour",
        actor: caller.actor,
        ...caller.process === null ? {} : { process: caller.process },
        args: { stops: followStops(context.query("hanoi.moves"), disk, context.get(hanoiState)?.disks ?? 3) }
      })
    }
  ]
});
var hanoiViews = feature2("hanoi.views", {
  requires: [course, hanoiState],
  views: [
    { slot: "toolbar", label: "\u7528\u4F8B", controls: ({ get }) => [{
      kind: "choices",
      label: "\u76D8\u5B50\u6570\u91CF",
      value: String(get(hanoiState)?.disks ?? 3),
      choices: DISK_COUNTS.map((n) => ({ value: String(n), label: String(n), title: `${n} \u4E2A\u76D8\u5B50`, event: { type: "session.invoke", action: "hanoi.disks", args: { disks: n } } }))
    }] }
  ]
});
var HANOI_SESSION = pythonSession({
  world: {
    title: "\u53EF\u89C6\u5316",
    render: (view) => {
      const state = view.get(hanoiState);
      const position = view.get(playbackHost2)?.position ?? null;
      const result = view.get(pythonHost).python.result;
      const value = result.status === "ready" ? result.value : null;
      const trace = value?.trace ?? null;
      const selected = selectedDisk(view.get(selectionHost2)?.current ?? null, trace);
      const select = (disk) => {
        if (trace === null) return;
        view.dispatch(disk === selected ? { type: "selection.clear" } : { type: "selection.select", selection: { kind: "world-object", run: trace, objectId: diskId(disk) } });
      };
      return /* @__PURE__ */ jsxs("div", { className: "pico-scene pico-hanoi-scene", children: [
        /* @__PURE__ */ jsx("style", { children: HANOI_STYLE }),
        /* @__PURE__ */ jsx(HanoiScene, { world: sceneWorld(value, position, state.source, state.disks), n: state.disks, selected, onSelect: select })
      ] });
    }
  },
  domain: [course, hanoiViews],
  provide: (view) => [hanoiState.with(view.state)],
  ai: { port: mockAiPort2(hanoiAnswer, { delayMs: 300 }) },
  script: { pace: { settle: 1800 } },
  scripts: [HANOI_SCRIPT]
});
var HANOI_COURSE = {
  name: "Tower of Hanoi",
  component: hanoi,
  starter: STARTER,
  playground: mountOptions,
  session: HANOI_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: HANOI_COURSE, host });
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
  const source2 = frame.locals.src;
  const target = frame.locals.dst;
  if (typeof n !== "number" || typeof source2 !== "string" || typeof target !== "string") return null;
  if (!isPeg(source2) || !isPeg(target)) return null;
  return { n, from: source2, to: target };
}
function callArrowPath(from, to) {
  const x1 = PEG_X[from];
  const x2 = PEG_X[to];
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${ARROW_Y} Q ${midX} ${ARROW_LIFT}, ${x2} ${ARROW_Y}`;
}
function sceneWorld(result, position, source2, n) {
  const state = position?.state;
  const world = hanoiWorld(state?.stdout ?? "", n);
  const error = world.error;
  const pegs = world.pegs;
  const line = state?.line ?? null;
  const lineText = line === null ? "" : source2.split("\n")[line - 1] ?? "";
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
            "data-anchor": isVirtual ? void 0 : diskId(disk),
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
export {
  ARBITRARY_PYTHON_EXAMPLE,
  HANOI_COURSE,
  HANOI_SCRIPT,
  HANOI_SESSION,
  PITFALLS,
  Root,
  STARTER,
  diskId,
  examples,
  hanoi,
  hanoiAnswer,
  hanoiDriver,
  sceneWorld,
  selectedDisk,
  starter
};
