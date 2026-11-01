// session/gallery/ai/session-ai.tsx
import { on, stateful } from "../pico.js";
import { usePlayground } from "../pico.js";
import { playback } from "../pico.js";
import { selection } from "../pico.js";
import { feature } from "../session.js";
import { useSession } from "../session.js";
import { playbackHost, selectionHost } from "../session.js";
import { stage } from "../session.js";
import { source } from "../session.js";
import { playground } from "../session.js";
import { sessionContext } from "../session.js";
import { sessionEvidence } from "../session.js";
import { ai } from "../session.js";
import { aiViews } from "../session.js";
import { draftViews } from "../session.js";
import { hintViews } from "../session.js";
import { lectureOf, script } from "../session.js";
import { scriptViews } from "../session.js";
import { SessionShell } from "../session.js";
import { mockAiPort } from "../session.js";
import { jsx } from "../libs/react.js";
var starter = `def greet(name):
    return f"hi {name}"


print(greet("pico"))
`;
var DEMO_SCRIPT = {
  id: "demo",
  title: "\u6F14\u793A\u8BB2\u89E3",
  from: "",
  steps: [
    { title: "\u5148\u5199\u51FD\u6570\u5934", say: "def\u3001\u51FD\u6570\u540D\u3001\u53C2\u6570\u548C\u5192\u53F7\u7EC4\u6210\u4E00\u884C\uFF1B\u51FD\u6570\u4F53\u8FD8\u6CA1\u60F3\u597D\u65F6\u7528 pass \u5360\u4F4D\u3002", write: "def greet(name):\n    pass\n" },
    { title: "\u518D\u5199\u8FD4\u56DE\u503C", say: "\u628A pass \u6362\u6210 return\uFF0C\u51FD\u6570\u8C03\u7528\u5C31\u4F1A\u5F97\u5230\u8FD9\u4E2A\u503C\u3002", write: 'def greet(name):\n    return f"hi {name}"\n' },
    {
      title: "\u4E24\u6B65\u90FD\u5199\u5B8C\u4E86",
      say: "\u53EF\u4EE5\u7EE7\u7EED\u5411 AI \u8FFD\u95EE\uFF0C\u4E5F\u53EF\u4EE5\u6062\u590D\u8BB2\u89E3\u524D\u7684\u4EE3\u7801\u3002",
      do: [{ action: "panel.open", args: { panels: ["events"] } }],
      offer: [{ action: "demo.restore", label: "\u6062\u590D\u539F\u6765\u7684\u4EE3\u7801" }]
    }
  ]
};
var GALLERY_PROMPTS = ["\u4ECE\u7A7A\u767D\u5F00\u59CB\u6559\u6211\u5199\u4E00\u4E2A\u51FD\u6570", "\u4E3A\u4EC0\u4E48\u51FD\u6570\u8981 return\uFF1F", "\u6162\u4E00\u70B9\u56DE\u7B54\uFF082.5 \u79D2\uFF09", "\u8FD9\u6B21\u8BF7\u6A21\u62DF\u5931\u8D25"];
function galleryAnswer(request) {
  if (request.text.includes("\u5931\u8D25")) throw new Error("Mock\uFF1A\u6A21\u62DF\u7684\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\u3002");
  if (request.kind === "explain") return {
    title: "\u8FD9\u6BB5\u4EE3\u7801\u505A\u4E86\u4EC0\u4E48",
    text: `\u9009\u4E2D\u7684 ${request.text.split("\n")[0]} \u4F1A\u5728\u8FD0\u884C\u65F6\u6C42\u503C\u3002\u6CA1\u6709 Trace \u65F6\u53EA\u80FD\u505A\u9759\u6001\u89E3\u91CA\uFF1B\u63A5\u5165\u8BFE\u7A0B\u540E\u53EF\u4EE5\u5B9A\u4F4D\u5230\u771F\u5B9E\u6267\u884C\u3002`,
    primary: { action: "demo.script", label: "\u4ECE\u7A7A\u767D\u5F00\u59CB\u5199\u4E00\u904D" }
  };
  if (request.text.includes("\u6559")) return {
    title: "\u4E00\u6BB5\u4E00\u6BB5\u5199",
    text: "Editor \u4F1A\u4ECE\u7A7A\u767D\u5F00\u59CB\u3002\u53EF\u4EE5\u5148\u81EA\u5DF1\u5199\uFF0C\u9700\u8981\u65F6\u53EA\u770B\u5F53\u524D\u4E00\u5C0F\u6BB5\u63D0\u793A\uFF0C\u4E5F\u53EF\u4EE5\u968F\u65F6\u4EA4\u7ED9 AI \u63A5\u7740\u5199\u3002",
    primary: { action: "demo.script", label: "\u5F00\u59CB\u6F14\u793A\u6559\u5B66" }
  };
  return {
    title: "return \u628A\u503C\u4EA4\u8FD8\u7ED9\u8C03\u7528\u8005",
    text: '\u6CA1\u6709 return \u7684\u51FD\u6570\u8FD4\u56DE None\u3002print(greet("pico")) \u6253\u5370\u7684\u662F greet \u4EA4\u8FD8\u7684\u503C\u3002',
    actions: [{ action: "demo.script", label: "\u5199\u4E00\u904D\u770B\u770B" }, { action: "ai.compose", label: "\u7EE7\u7EED\u8FFD\u95EE" }]
  };
}
var GALLERY_AI = mockAiPort(galleryAnswer, { delayMs: (request) => request.text.includes("\u6162") ? 2500 : 300 });
var RESET = [{ type: "script.stop" }, { type: "ai.close" }, { type: "source.restore", actor: "host" }];
var SCENARIOS = [
  { id: "home", label: "\u9996\u5C4F", events: [{ type: "ai.open" }] },
  { id: "answered", label: "\u56DE\u7B54\u4E0E\u52A8\u4F5C", events: [{ type: "ai.ask", text: GALLERY_PROMPTS[1] }] },
  { id: "typewriter", label: "\u8BB2\u89E3 \xB7 AI \u5199", events: [{ type: "ai.open" }, { type: "script.play", script: DEMO_SCRIPT }, { type: "script.skip" }, { type: "script.write" }] },
  { id: "ghost", label: "\u8BB2\u89E3 \xB7 \u5199\u4F5C\u63D0\u793A", events: [{ type: "ai.open" }, { type: "script.play", script: DEMO_SCRIPT }, { type: "script.skip" }, { type: "script.follow" }, { type: "script.hint" }] },
  { id: "pending", label: "\u7B49\u5F85\u56DE\u7B54", events: [{ type: "ai.ask", text: GALLERY_PROMPTS[2] }] },
  { id: "failed", label: "\u56DE\u7B54\u5931\u8D25", events: [{ type: "ai.ask", text: GALLERY_PROMPTS[3] }] },
  { id: "history", label: "\u5386\u53F2\u5BF9\u8BDD", events: [
    { type: "ai.open" },
    { type: "ai.say", reply: { title: "\u4E0A\u4E00\u8F6E\uFF1A\u4E3A\u4EC0\u4E48\u8981\u7F29\u8FDB", text: "\u7F29\u8FDB\u51B3\u5B9A\u8BED\u53E5\u5C5E\u4E8E\u54EA\u4E2A\u4EE3\u7801\u5757\u3002" } },
    { type: "ai.renew" },
    { type: "ai.say", reply: { title: "\u8FD9\u4E00\u8F6E", text: "\u70B9\u51FB\u53F3\u4E0A\u89D2\u201C\u5386\u53F2\u201D\u67E5\u770B\u4E0A\u4E00\u8F6E\u3002" } }
  ] }
];
var scenarioTypes = [...new Set([...RESET, ...SCENARIOS.flatMap((item) => item.events)].map((event) => event.type))];
var scenarios = stateful("gallery.scenarios", () => ({ current: SCENARIOS[0].id }), [
  on("gallery.scenario", (state, { id }, { emit }) => {
    const chosen = SCENARIOS.find((item) => item.id === id);
    if (chosen === void 0) return;
    state.current = id;
    queueMicrotask(() => {
      for (const event of [...RESET, ...chosen.events]) emit(event);
    });
  }, scenarioTypes),
  on("gallery.restore", (_state, _event, { emit }) => {
    emit({ type: "script.stop" });
    emit({ type: "source.restore", actor: "host" });
  }, ["script.stop", "source.restore"])
]);
var galleryCourse = feature("gallery.course", {
  requires: [source, script, ai],
  create: ({ bus, own }) => own(scenarios.create(bus)).state,
  actions: [
    { id: "demo.script", label: "\u5F00\u59CB\u6F14\u793A\u8BB2\u89E3", when: ({ get }) => lectureOf(get)?.writing == null, event: () => ({ type: "script.play", script: DEMO_SCRIPT }) },
    { id: "demo.restore", label: "\u6062\u590D\u539F\u6765\u7684\u4EE3\u7801", when: ({ get }) => get(playground)?.getSnapshot().code.lent != null, event: () => ({ type: "gallery.restore" }) }
  ],
  views: [{ slot: "toolbar", label: "\u573A\u666F", controls: ({ get }) => [{
    kind: "choices",
    label: "Mock \u573A\u666F",
    value: get(galleryCourse)?.current ?? SCENARIOS[0].id,
    choices: SCENARIOS.map((item) => ({ value: item.id, label: item.label, event: { type: "gallery.scenario", id: item.id } }))
  }] }]
});
var eventLog = feature("gallery.events", {
  create: ({ bus, own }) => {
    const log = { lines: [] };
    own({ dispose: bus.subscribeAll((event, origin) => {
      if (event.type.endsWith(".render") || event.type.startsWith("log.")) return;
      log.lines = [`${event.type} \u2190 ${origin}`, ...log.lines].slice(0, 40);
    }) });
    return log;
  },
  views: [{ slot: "panel", key: "events", icon: "output", title: "\u4E8B\u4EF6", render: ({ get }) => /* @__PURE__ */ jsx("ol", { className: "pico-gallery-events", "aria-label": "\u6700\u8FD1\u7684\u603B\u7EBF\u4E8B\u4EF6", style: { margin: 0, paddingLeft: "2.5em", font: "var(--pico-size-xs)/1.7 var(--pico-font-mono)", color: "var(--pico-ink-soft)", userSelect: "text" }, children: (get(eventLog)?.lines ?? []).map((line, index, lines) => /* @__PURE__ */ jsx("li", { children: line }, lines.length - index)) }) }]
});
var gallery = stateful("gallery", (initial) => ({ source: initial }), [
  on("editor.changed", (state, event) => {
    state.source = event.source;
  })
]);
function assemble({ bus, editor, own }) {
  const focus = own(selection.create(bus));
  const playing = own(playback.create({}, bus));
  own({ dispose: bus.subscribe(["editor.selected"], (event) => {
    const from = Math.min(event.anchor, event.head), to = Math.max(event.anchor, event.head);
    bus.emit({ type: "selection.select", selection: from === to ? null : { kind: "source", source: editor.state.source, from, to } }, "editor");
  }) });
  return { selection: focus.state, playback: playing.state };
}
var OPTIONS = { filename: "demo.py", assemble, layout: { open: [] } };
var GALLERY_SESSION = {
  features: [
    stage,
    playground,
    source,
    draftViews,
    hintViews,
    sessionContext,
    ai.with({ port: GALLERY_AI, prompts: GALLERY_PROMPTS }),
    aiViews,
    script,
    scriptViews.with({ library: [DEMO_SCRIPT] }),
    sessionEvidence,
    galleryCourse,
    eventLog
  ],
  provide: (view) => [playbackHost.with(view.parts.playback), selectionHost.with(view.parts.selection)]
};
function Root(host = {}) {
  const view = usePlayground(gallery, host.source ?? starter, { ...OPTIONS, ...host.options });
  const session = useSession(view, GALLERY_SESSION);
  if (view === null || session === null) return null;
  return /* @__PURE__ */ jsx(SessionShell, { name: "Session Mock \xB7 AI", view, session });
}
export {
  DEMO_SCRIPT,
  GALLERY_AI,
  GALLERY_PROMPTS,
  GALLERY_SESSION,
  RESET,
  Root,
  SCENARIOS,
  eventLog,
  galleryAnswer,
  galleryCourse,
  starter
};
