// playgrounds/hello/hello.generated.tsx
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

// playgrounds/hello/hello.py
var hello_default = 'hello = int(\n    "40988139186197822331169136684580776850378068696367"\n    "90339031035427709601936987418360190289990610395534"\n    "64343097562622369147702949617029155161432801649123"\n    "89906812792336414280401095468542582925589674135377"\n    "49628963711922168114292411571578753158511504528396"\n    "95512648293114740732760593192277743071574269310306"\n    "91970996349677247008390504859524095479401640114749"\n    "58459554804234851412388070631807579859866070258787"\n    "30657554664043354826586364509205327992724027210551"\n    "44509471955796141388112183668614066147380450146782"\n    "26404433135372265104882928524368481485012453030935"\n    "38619463983765011577993188866082991448946419223423"\n    "38595078605636154194925117268771998222774866619069"\n    "55803479409952698293309399808995134576753088267231"\n    "84123672166924537176089183836269607635317999771159"\n    "45604457232759827003086461284126232446991359924358"\n    "57570405666143891705998336207082239925543233741997"\n    "85427596095279687390435560264629828750632614279198"\n    "58230416617305848257202174672487118986927089804561"\n    "59618343100942104761337746719747317962141531003293"\n    "79075839903148344320990630516493889845253352833964"\n    "70416865224139653163536234265037997780154002928280"\n    "13754797057206760959278874300355857913366899255285"\n    "37394744618517751064054524907927627299331735912122"\n    "1619893890195466"\n)\n\nn = (hello.bit_length() + 7) // 8\nhello = hello.to_bytes(n, "big").decode()\nprint(hello)\n';

// playgrounds/hello/hello.generated.tsx
import { on, stateful } from "../pico.js";
import { Source } from "../pico.js";
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

// playgrounds/hello/hello.script.json
var hello_script_default = {
  id: "hello",
  title: "\u4EB2\u624B\u8FD8\u539F\u85CF\u5728\u6574\u6570\u91CC\u7684\u6587\u5B57",
  from: "",
  mode: "instruction",
  auto: true,
  steps: [
    {
      title: "\u5148\u770B\u4E00\u4E2A\u80FD\u8BFB\u61C2\u7684\u5C0F\u4F8B\u5B50",
      concepts: ["value"],
      say: [
        {
          say: "\u6B63\u5F0F\u4EE3\u7801\u628A\u4E00\u5E45\u5F88\u957F\u7684\u6587\u5B57\u56FE\u85CF\u8FDB\u5927\u6574\u6570\u3002\u5148\u7528\u540C\u6837\u65B9\u6CD5\u85CF\u77ED\u5355\u8BCD\uFF1A310939249775 \u662F Hello \u7684\u4E94\u4E2A\u5B57\u8282\u6309\u5927\u7AEF\u5E8F\u6392\u6210\u7684\u6570\u3002",
          write: "hello = 310939249775\n"
        }
      ]
    },
    {
      title: "\u7B97\u6574\u6570\u9700\u8981\u591A\u5C11\u5B57\u8282",
      concepts: ["value"],
      say: [
        {
          say: "bit_length \u7ED9\u51FA\u81F3\u5C11\u9700\u8981\u591A\u5C11\u4E2A\u4E8C\u8FDB\u5236\u4F4D\u3002\u4E00\u4E2A\u5B57\u8282 8 \u4F4D\uFF0C\u7528 `(\u4F4D\u6570 + 7) // 8` \u5411\u4E0A\u53D6\u6574\u3002",
          write: "hello = 310939249775\n\nn = (hello.bit_length() + 7) // 8\n"
        }
      ]
    },
    {
      title: "\u4ECE\u6574\u6570\u8FD8\u539F\u5B57\u8282\u548C\u6587\u5B57",
      concepts: ["value"],
      say: [
        {
          say: "to_bytes \u9700\u8981\u957F\u5EA6\u548C\u987A\u5E8F\u3002big \u8868\u793A\u6700\u9AD8\u4F4D\u5B57\u8282\u5728\u524D\u3002",
          write: 'hello = 310939249775\n\nn = (hello.bit_length() + 7) // 8\nraw = hello.to_bytes(n, "big")\n'
        },
        {
          say: "decode \u628A\u539F\u59CB\u5B57\u8282\u6309 UTF-8 \u89E3\u91CA\u6210 str\uFF0Cprint \u624D\u4EA7\u751F\u8F93\u51FA\u3002",
          write: 'hello = 310939249775\n\nn = (hello.bit_length() + 7) // 8\nraw = hello.to_bytes(n, "big")\ntext = raw.decode()\nprint(text)\n'
        }
      ]
    },
    {
      title: "\u8FD0\u884C\u8F6C\u6362\u94FE",
      concepts: ["value"],
      stage: {
        panels: [
          "debug",
          "output"
        ],
        focus: "output"
      },
      do: [
        {
          action: "code.run"
        }
      ],
      say: "\u8F93\u51FA\u662F Hello\u3002\u56DB\u4E2A\u53D8\u91CF\u5206\u522B\u4FDD\u5B58\u6574\u6570\u3001\u957F\u5EA6\u3001\u5B57\u8282\u548C\u6587\u5B57\uFF0C\u8BA9\u6BCF\u6B21\u8868\u793A\u8F6C\u6362\u90FD\u80FD\u88AB\u89C2\u5BDF\u3002"
    },
    {
      title: "Debugger \u770B\u7C7B\u578B\u9010\u6B65\u51FA\u73B0",
      concepts: ["value", "debug"],
      stage: {
        panels: [
          "debug",
          "output"
        ],
        focus: "debug"
      },
      do: [
        {
          action: "code.locate",
          args: {
            line: 3,
            occurrence: 1
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "mark",
            at: {
              variable: "hello"
            }
          }
        },
        {
          action: "annotation.show",
          args: {
            kind: "mark",
            at: {
              variable: "n"
            }
          }
        }
      ],
      say: "\u505C\u5728\u957F\u5EA6\u8BA1\u7B97\u5904\uFF0Chello \u4ECD\u662F int\u3002\u7EE7\u7EED\u5355\u6B65\uFF0Craw \u51FA\u73B0\u4E3A bytes\uFF0Ctext \u51FA\u73B0\u4E3A str\u3002\u53D8\u91CF\u540D\u53EA\u662F\u540D\u5B57\uFF0C\u503C\u624D\u6709\u7C7B\u578B\u3002"
    },
    {
      title: "\u7406\u89E3\u6B63\u5F0F\u8BFE\u7A0B\u4EE3\u7801",
      concepts: ["value"],
      say: "\u6B63\u5F0F starter \u53EA\u662F\u628A\u540C\u4E00\u8FC7\u7A0B\u538B\u7F29\u4E86\uFF1A\u76F8\u90BB\u6570\u5B57\u5B57\u7B26\u4E32\u62FC\u63A5\u540E\u4EA4\u7ED9 int\uFF1B\u5927\u6574\u6570\u7B97\u957F\u5EA6\u3001to_bytes\u3001decode\uFF0C\u6700\u540E\u91CD\u65B0\u7ED1\u5B9A\u5230 hello\u3002\u6570\u636E\u66F4\u957F\uFF0C\u8F6C\u6362\u6A21\u578B\u76F8\u540C\u3002"
    },
    {
      title: "\u6362\u9519\u5B57\u8282\u5E8F\u505A\u5BF9\u6BD4",
      concepts: ["value"],
      say: [
        {
          say: "\u628A big \u6539\u6210 little\u3002\u6574\u6570\u76F8\u540C\uFF0C\u4F46\u8FD8\u539F\u51FA\u7684\u5B57\u8282\u987A\u5E8F\u53CD\u8F6C\u3002",
          write: 'hello = 310939249775\n\nn = (hello.bit_length() + 7) // 8\nraw = hello.to_bytes(n, "little")\ntext = raw.decode()\nprint(text)\n'
        }
      ]
    },
    {
      title: "\u7528\u9519\u8BEF\u8FFD\u67E5\u4E0A\u4E00\u6B65",
      concepts: ["value", "debug"],
      stage: {
        panels: [
          "debug",
          "output"
        ],
        focus: "debug"
      },
      do: [
        {
          action: "code.run"
        }
      ],
      say: "\u9519\u8BEF\u843D\u5728 decode\uFF0C\u4F46\u6839\u56E0\u662F\u4E0A\u4E00\u884C\u9009\u62E9\u4E86\u9519\u8BEF\u5B57\u8282\u5E8F\u3002Debugger \u544A\u8BC9\u6211\u4EEC\u5F02\u5E38\u53D1\u751F\u70B9\uFF0C\u8FFD\u56E0\u8FD8\u8981\u56DE\u770B\u4EA7\u751F\u8BE5\u503C\u7684\u8BED\u53E5\u3002"
    },
    {
      title: "\u56DE\u987E\u8868\u793A\u8F6C\u6362",
      concepts: ["value"],
      say: "\u4FE1\u606F\u7ECF\u8FC7 int \u2192 bytes \u2192 str \u4E09\u79CD\u8868\u793A\u3002\u6BCF\u4E2A API \u90FD\u89C4\u5B9A\u8F93\u5165\u3001\u8F93\u51FA\u548C\u987A\u5E8F\uFF1B\u5199\u51FA\u4E2D\u95F4\u53D8\u91CF\uFF0C\u662F\u7406\u89E3\u7D27\u51D1\u4EE3\u7801\u7684\u53EF\u9760\u65B9\u6CD5\u3002"
    }
  ]
};

// playgrounds/hello/hello.generated.tsx
import { jsx } from "../libs/react.js";
var hello = stateful("hello", (source2) => ({ source: source2 }), [
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
  const execution2 = python3.create({}, bus);
  return () => {
    execution2.dispose();
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
var mountOptions = { ...pythonOptions(), filename: "hello.py", layout: layoutOptions, automatic: 500, start: [{ type: "python.run" }] };
var starter = hello_default;
var HELLO_SCRIPT = hello_script_default;
var HELLO_SESSION = pythonSession({
  world: { title: "\u8F6C\u6362\u94FE", render: () => /* @__PURE__ */ jsx("div", { className: "pico-scene", style: { padding: 16 }, children: "\u5341\u8FDB\u5236\u6570\u5B57 \u2192 \u5927\u6574\u6570 \u2192 \u5B57\u8282 \u2192 \u6587\u5B57\u3002\u8FD0\u884C\u540E\u5728\u8C03\u8BD5\u91CC\u770B\u53D8\u91CF hello \u7684\u7C7B\u578B\u600E\u6837\u4E00\u6B65\u6B65\u53D8\u5316\u3002" }) },
  ai: courseAi({
    explain: "\u8FD9\u4E00\u53E5\u5728\u6362\u4E00\u79CD\u8868\u793A\u540C\u4E00\u4EFD\u6570\u636E\uFF1A\u6570\u5B57\u6587\u5B57\u53D8\u6210\u5927\u6574\u6570\uFF0C\u5927\u6574\u6570\u6309\u5B57\u8282\u62C6\u5F00\uFF0C\u5B57\u8282\u518D\u6309 UTF-8 \u89E3\u7801\u6210\u6587\u5B57\u3002",
    question: "\u76EF\u4F4F\u53D8\u91CF hello \u7684\u7C7B\u578B\uFF1A\u5148\u662F int\uFF0C\u7ECF\u8FC7 to_bytes \u53D8\u6210 bytes\uFF0C\u518D\u7ECF decode \u53D8\u6210 str\u3002\u6BCF\u4E00\u6B65\u90FD\u6CA1\u6709\u4E22\u4FE1\u606F\uFF0C\u53EA\u662F\u6362\u4E86\u8868\u793A\u3002"
  }),
  scripts: [HELLO_SCRIPT]
});
var HELLO_COURSE = {
  name: "Hello, Python!",
  component: hello,
  starter: hello_default,
  playground: mountOptions,
  session: HELLO_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: HELLO_COURSE, host });
}
export {
  HELLO_COURSE,
  HELLO_SCRIPT,
  Root,
  examples,
  hello,
  starter
};
