// playgrounds/hello/hello.generated.tsx
import { PlaygroundShell, Widget } from "../pico.js";
import { python as python3 } from "../pico.js";
import { playback as playback2 } from "../pico.js";
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

// playgrounds/hello/hello.py
var hello_default = 'hello = int(\n    "40988139186197822331169136684580776850378068696367"\n    "90339031035427709601936987418360190289990610395534"\n    "64343097562622369147702949617029155161432801649123"\n    "89906812792336414280401095468542582925589674135377"\n    "49628963711922168114292411571578753158511504528396"\n    "95512648293114740732760593192277743071574269310306"\n    "91970996349677247008390504859524095479401640114749"\n    "58459554804234851412388070631807579859866070258787"\n    "30657554664043354826586364509205327992724027210551"\n    "44509471955796141388112183668614066147380450146782"\n    "26404433135372265104882928524368481485012453030935"\n    "38619463983765011577993188866082991448946419223423"\n    "38595078605636154194925117268771998222774866619069"\n    "55803479409952698293309399808995134576753088267231"\n    "84123672166924537176089183836269607635317999771159"\n    "45604457232759827003086461284126232446991359924358"\n    "57570405666143891705998336207082239925543233741997"\n    "85427596095279687390435560264629828750632614279198"\n    "58230416617305848257202174672487118986927089804561"\n    "59618343100942104761337746719747317962141531003293"\n    "79075839903148344320990630516493889845253352833964"\n    "70416865224139653163536234265037997780154002928280"\n    "13754797057206760959278874300355857913366899255285"\n    "37394744618517751064054524907927627299331735912122"\n    "1619893890195466"\n)\n\nn = (hello.bit_length() + 7) // 8\nhello = hello.to_bytes(n, "big").decode()\nprint(hello)\n';

// playgrounds/hello/hello.generated.tsx
import { on, stateful } from "../pico.js";
import { Source } from "../pico.js";
import { jsx } from "../libs/react.js";
var hello = stateful("hello", (source) => ({ source }), [
  on("editor.changed", edit, []),
  on("python.run", run, ["python.execute"]),
  on("terminal.submitted", submit, ["python.input"])
]);
function edit(state, event) {
  state.source = event.source;
}
function run(state, _event, { emit }) {
  emit({ type: "python.execute", source: new Source(state.source), options: {
    stdin: { kind: "interactive", value: "" },
    trace: { events: ["call", "stmt", "return"], observe: { globals: true, locals: true } },
    timeoutMs: 3e3,
    maxTraceSteps: 2e3
  } });
}
function submit(_state, event, { emit }) {
  emit({ type: "python.input", requestId: event.requestId, line: event.line });
}
function createExample(bus) {
  const course = hello.create(hello_default, bus);
  const player = playback2.create({}, bus);
  const execution = python3.create({}, bus);
  return () => {
    execution.dispose();
    player.dispose();
    course.dispose();
  };
}
var examples = {
  starter: { create: createExample, events: [{ type: "python.run" }] },
  input: { create: createExample, events: [
    { type: "editor.changed", source: "a = input('first: ')\nb = input('second: ')\nprint(a, b)\n" },
    { type: "python.run" },
    ({ terminal: terminal2 }) => ({ type: "terminal.submitted", requestId: terminal2.view.input.id, line: "0" }),
    ({ terminal: terminal2 }) => ({ type: "terminal.submitted", requestId: terminal2.view.input.id, line: "0" })
  ] }
};
var layoutOptions = { open: ["output"], ratio: 0.5 };
var mountOptions = { ...pythonOptions(), filename: "hello.py", layout: layoutOptions };
var starter = hello_default;
function Root(host = {}) {
  const app = usePlayground(hello, host.source ?? hello_default, { ...mountOptions, ...host.options });
  if (!app) return null;
  const running = app.parts.python.result.status === "pending";
  return /* @__PURE__ */ jsx(
    PlaygroundShell,
    {
      name: "Hello, Python!",
      layout: app.layout,
      onEvent: app.send,
      menu: app.menu,
      toolbar: [...app.toolbar, { controls: [{
        kind: "button",
        icon: "play",
        label: running ? "\u6B63\u5728\u8FD0\u884C" : "\u8FD0\u884C",
        disabled: running,
        event: { type: "python.run" }
      }] }],
      editor: /* @__PURE__ */ jsx(Widget, { widget: app.editor }),
      panels: [
        { key: "debug", icon: "debug", title: "\u8C03\u8BD5", content: /* @__PURE__ */ jsx(Widget, { widget: app.parts.debugger }) },
        { key: "output", icon: "output", title: "\u8F93\u51FA", content: /* @__PURE__ */ jsx(Widget, { widget: app.parts.terminal }) }
      ]
    }
  );
}
export {
  Root,
  examples,
  hello,
  starter
};
