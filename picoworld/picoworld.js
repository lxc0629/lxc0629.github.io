// playgrounds/picoworld/picoworld.tsx
import { useEffect, useState } from "../libs/react.js";
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
      own({ dispose: bus.subscribe(["playback.changed", "selection.changed"], () => {
        const { position } = playing.state;
        const result = execution.state.result;
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
      observe("python", () => ({ ...execution.state }), ["python.changed"]);
      observe("playback", () => ({ ...playing.state }), ["playback.changed"]);
      observe("selection", () => focus.state, ["selection.changed"]);
      return { python: execution.state, playback: playing.state, terminal: output, debugger: debugging, selection: focus.state };
    }
  };
}

// playgrounds/picoworld/picoworld.tsx
import { python as python3 } from "../pico.js";
import { playback as playback2 } from "../pico.js";
import { playbackHost } from "../session.js";
import { useSession } from "../session.js";
import { playground } from "../session.js";
import { source } from "../session.js";
import { picoWorld, picoWorldProgram } from "../world.js";
import { jsx } from "../libs/react.js";
var layoutOptions = { open: ["viz"] };
var STARTER = `# \u6BCF\u5C42\u5411\u5185\u6536\u4E00\u683C\uFF0C\u5806\u51FA\u4E00\u5EA7\u4E94\u5C42\u7802\u5CA9\u91D1\u5B57\u5854\u3002
for layer in range(5):
    radius = 4 - layer
    for x in range(-radius, radius + 1):
        for y in range(-radius, radius + 1):
            drop(x, y, "sandstone")

# \u7ED9\u5854\u5C16\u52A0\u4E0A\u4E00\u5757\u91D1\u8272\u7684\u9876\u77F3\u3002
drop(0, 0, "gold_block")
`;
var picoWorldCourse = stateful("picoworld-course", (source2) => ({ source: source2 }), [
  on("editor.changed", edit, ["python.clear"]),
  on("python.run", run, ["python.execute"])
]);
function edit(state, event, { emit }) {
  state.source = event.source;
  emit({ type: "python.clear" });
}
function run(state, _event, { emit }) {
  emit(picoWorldProgram.compute(state.source));
}
function create(bus) {
  const course = picoWorldCourse.create(STARTER, bus);
  const execution = python3.create({}, bus);
  const player = playback2.create({}, bus);
  bus.emit({ type: "python.run" });
  return () => {
    player.dispose();
    execution.dispose();
    course.dispose();
  };
}
var examples = {
  pyramid: { create, events: [] },
  rewind: { create, events: [{ type: "debugger.seek", traceIndex: 1 }] }
};
var mountOptions = {
  ...pythonOptions({ playback: { stepMs: 400 } }),
  layout: layoutOptions,
  filename: "picoworld.py",
  start: [{ type: "python.run" }]
};
var starter = STARTER;
var PICOWORLD_SESSION = Object.freeze({
  features: Object.freeze([playground, source]),
  provide: (view) => [playbackHost.with(view.parts.playback)]
});
function Root(host = {}) {
  const view = usePlayground(picoWorldCourse, host.source ?? STARTER, { ...mountOptions, ...host.options });
  useSession(view, PICOWORLD_SESSION);
  const [world, setWorld] = useState(null);
  const trace = view?.parts.playback.trace ?? null;
  const position = view?.parts.playback.position ?? null;
  const bus = view?.bus;
  useEffect(() => {
    if (!bus) return;
    const instance = picoWorld.create(bus);
    setWorld(instance);
    return () => {
      instance.dispose();
    };
  }, [bus]);
  useEffect(() => {
    if (world) bus?.emit({ type: "picoworld.render", trace, position }, "world");
  }, [bus, world, trace, position]);
  if (!view) return null;
  return /* @__PURE__ */ jsx(
    PlaygroundShell,
    {
      name: "Pico World",
      layout: view.layout,
      onEvent: view.send,
      menu: view.menu,
      toolbar: [...view.toolbar, { controls: [{ kind: "button", icon: "play", label: "\u8FD0\u884C", disabled: view.parts.python.result.status === "pending", event: { type: "python.run" } }] }],
      editor: /* @__PURE__ */ jsx(Widget, { widget: view.editor }),
      panels: [
        { key: "viz", icon: "viz", title: "\u4E16\u754C", flush: true, content: world ? /* @__PURE__ */ jsx(Widget, { widget: world }) : null },
        { key: "debug", icon: "debug", title: "\u8C03\u8BD5", content: /* @__PURE__ */ jsx(Widget, { widget: view.parts.debugger }) },
        { key: "output", icon: "output", title: "\u8F93\u51FA", content: /* @__PURE__ */ jsx(Widget, { widget: view.parts.terminal }) }
      ]
    }
  );
}
export {
  Root,
  examples,
  picoWorldCourse,
  starter
};
