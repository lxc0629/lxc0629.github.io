// playgrounds/music/music.generated.tsx
import { useEffect, useRef, useState } from "../libs/react.js";
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

// playgrounds/music/music.generated.tsx
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

// playgrounds/music/music.script.json
var music_script_default = {
  id: "music-pitch",
  title: "\u6CBF\u7740\u4E00\u4E2A\u97F3\u7B26\u8D70\u8FC7\u4EE3\u7801\u3001\u97F3\u9AD8\u4E0E\u58F0\u97F3",
  mode: "instruction",
  steps: [
    {
      title: "\u4E50\u8C31\u5148\u6210\u4E3A\u6570\u636E",
      concepts: ["list", "value"],
      stage: { panels: ["viz"], focus: "viz" },
      say: "TWINKLE \u5217\u8868\u5C31\u662F\u4E50\u8C31\u3002\u6BCF\u4E2A\u5143\u7EC4\u7684\u7B2C\u4E00\u4E2A\u503C\u662F\u97F3\u540D\uFF0C\u7B2C\u4E8C\u4E2A\u503C\u662F\u62CD\u6570\u3002\u97F3\u540D\u51B3\u5B9A\u7EB5\u5411\u97F3\u9AD8\uFF0C\u62CD\u6570\u51B3\u5B9A\u6A2A\u5411\u957F\u5EA6\uFF1B\u6240\u4EE5\u8C31\u9762\u3001\u5377\u5E18\u548C\u4EE3\u7801\u4F7F\u7528\u7684\u662F\u540C\u4E00\u4EFD\u97F3\u4E50\u6570\u636E\u3002"
    },
    {
      title: "\u97F3\u540D\u600E\u6837\u7B97\u6210 MIDI",
      concepts: ["function", "dict", "value"],
      stage: { panels: ["viz", "debug"], focus: "debug" },
      do: [
        { action: "code.run" },
        { action: "code.locate", args: { line: 10, occurrence: 1 } },
        { action: "annotation.show", args: { kind: "mark", at: { variable: "octave" } } }
      ],
      say: "midi \u628A\u97F3\u540D\u62C6\u6210\u5B57\u6BCD\u90E8\u5206\u4E0E\u516B\u5EA6\u3002SEMITONES \u7ED9\u51FA\u97F3\u5728\u4E00\u4E2A\u516B\u5EA6\u5185\u7684\u534A\u97F3\u504F\u79FB\uFF0C\u518D\u7528 12 \xD7 (octave + 1) \u52A0\u4E0A\u504F\u79FB\u3002C4 \u5F97\u5230 60\uFF0CG4 \u5F97\u5230 67\uFF0CC5 \u5F97\u5230 72\u3002",
      predict: {
        question: "\u5982\u679C C4 \u662F 60\uFF0C\u90A3\u4E48\u9AD8\u4E00\u4E2A\u516B\u5EA6\u7684 C5 \u662F\u591A\u5C11\uFF1F",
        choices: [
          { label: "61", reply: "\u76F8\u90BB MIDI \u6570\u5B57\u53EA\u9AD8\u4E00\u4E2A\u534A\u97F3\uFF1B\u4E00\u4E2A\u5B8C\u6574\u516B\u5EA6\u5305\u542B 12 \u4E2A\u534A\u97F3\u3002" },
          { label: "67", reply: "67 \u662F G4\uFF1B\u4ECE C \u5230\u4E0B\u4E00\u4E2A C \u8981\u8DE8\u8FC7 12 \u4E2A\u534A\u97F3\u3002" },
          { label: "72", correct: true, reply: "\u6B63\u786E\u3002\u97F3\u540D\u76F8\u540C\u3001\u516B\u5EA6\u589E\u52A0 1\uFF0CMIDI \u5C31\u589E\u52A0 12\u3002" }
        ]
      }
    },
    {
      title: "\u5FAA\u73AF\u628A\u6574\u5F20\u8C31\u9001\u53BB\u6F14\u594F",
      concepts: ["loop", "function", "list"],
      stage: { panels: ["viz", "debug"], focus: "debug" },
      do: [
        { action: "code.locate", args: { line: 16, occurrence: 1 } },
        { action: "annotation.show", args: { kind: "mark", at: { variable: "note_name" } } },
        { action: "annotation.show", args: { kind: "mark", at: { variable: "beats" } } }
      ],
      say: "play \u4E0D\u77E5\u9053\u300A\u5C0F\u661F\u661F\u300B\u7684\u5185\u5BB9\uFF0C\u5B83\u53EA\u904D\u5386\u4EFB\u4F55 melody\u3002\u6BCF\u4E00\u8F6E\u628A note_name \u4EA4\u7ED9 midi\uFF0C\u628A\u7B97\u51FA\u7684\u97F3\u9AD8\u4E0E beats \u4E00\u8D77\u4F20\u7ED9 note\u3002\u51FD\u6570\u8D1F\u8D23\u7FFB\u8BD1\uFF0C\u5FAA\u73AF\u8D1F\u8D23\u6309\u987A\u5E8F\u5904\u7406\u6574\u5F20\u8C31\u3002"
    },
    {
      title: "\u540C\u4E00\u4E8B\u4EF6\u751F\u6210\u4E09\u79CD\u5448\u73B0",
      concepts: ["debug", "value"],
      stage: { panels: ["viz", "debug"], focus: "viz" },
      say: "World \u4E0A\u65B9\u663E\u793A\u7B80\u8C31\u3001\u97F3\u540D\u548C MIDI\uFF1B\u4E0B\u65B9\u5377\u5E18\u7528\u7EB5\u5411\u4F4D\u7F6E\u8868\u793A MIDI\uFF0C\u7528\u5BBD\u5EA6\u8868\u793A\u62CD\u6570\uFF1B\u8FD0\u884C\u4EE3\u7801\u540E\uFF0C\u58F0\u97F3\u9891\u7387\u4E5F\u4ECE MIDI \u63A8\u5BFC\u3002\u5B83\u4EEC\u4E0D\u662F\u4E09\u4EFD\u4E50\u8C31\uFF0C\u800C\u662F\u540C\u4E00\u7EC4 note \u4E8B\u4EF6\u7684\u4E09\u79CD\u5448\u73B0\u3002"
    },
    {
      title: "\u5361\u519C\u662F\u540C\u4E00\u65CB\u5F8B\u5EF6\u540E\u8FDB\u5165",
      concepts: ["function", "list"],
      stage: { panels: ["viz", "debug"], focus: "viz" },
      do: [
        { action: "music.work", args: { value: "2" } },
        { action: "code.run" }
      ],
      say: "\u73B0\u5728\u7B2C\u4E8C\u58F0\u90E8\u5148 rest(4)\uFF0C\u518D\u8C03\u7528\u540C\u4E00\u4E2A play(CANON_THEME)\u3002\u5377\u5E18\u4E2D\u4E24\u6761\u5F62\u72B6\u76F8\u540C\u7684\u65CB\u5F8B\u76F8\u5DEE\u56DB\u62CD\uFF0C\u8FD9\u5C31\u662F\u5361\u519C\u6700\u76F4\u63A5\u7684\u7A0B\u5E8F\u6A21\u578B\uFF1A\u590D\u7528\u540C\u4E00\u6570\u636E\uFF0C\u6539\u53D8\u5F00\u59CB\u65F6\u95F4\u3002"
    }
  ]
};

// playgrounds/music/music.generated.tsx
import { jsx, jsxs } from "../libs/react.js";
var RESOURCE = "music";
var MUSIC_HEADER = `SEMITONES = {
    "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
    "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11,
}


def midi(note_name):
    # C4 = 12 \xD7 (4 + 1) + 0 = 60
    name = note_name[:-1]
    octave = int(note_name[-1])
    return 12 * (octave + 1) + SEMITONES[name]


def play(melody):
    for note_name, beats in melody:
        note(midi(note_name), beats, note_name)


`;
var STARTER = MUSIC_HEADER + `TWINKLE = [
    ("C4", 1), ("C4", 1), ("G4", 1), ("G4", 1),
    ("A4", 1), ("A4", 1), ("G4", 2),
    ("F4", 1), ("F4", 1), ("E4", 1), ("E4", 1),
    ("D4", 1), ("D4", 1), ("C4", 2),
]

tempo(100)
play(TWINKLE)`;
var ODE = MUSIC_HEADER + `PHRASE = [("E4", 1), ("E4", 1), ("F4", 1), ("G4", 1)]
ENDING = [("G4", 1), ("F4", 1), ("E4", 1), ("D4", 1),
          ("C4", 1), ("C4", 1), ("D4", 1), ("E4", 1),
          ("E4", 1.5), ("D4", 0.5), ("D4", 2)]

tempo(108)
play(PHRASE)
play(ENDING)`;
var CANON = MUSIC_HEADER + `CANON_THEME = [
    ("D4", 1), ("A4", 1), ("B4", 1), ("F#4", 1),
    ("G4", 1), ("D4", 1), ("G4", 1), ("A4", 1),
]

tempo(92)
voice(1)
play(CANON_THEME)

voice(2)
rest(4)
play(CANON_THEME)`;
function melodyTarget(notes, voice = 1, offset = 0) {
  let start = offset;
  return notes.map(([label, pitch, beats]) => {
    const item = { voice, start, pitch, beats, label };
    start += beats;
    return item;
  });
}
var TWINKLE_TARGET = melodyTarget([["C4", 60, 1], ["C4", 60, 1], ["G4", 67, 1], ["G4", 67, 1], ["A4", 69, 1], ["A4", 69, 1], ["G4", 67, 2], ["F4", 65, 1], ["F4", 65, 1], ["E4", 64, 1], ["E4", 64, 1], ["D4", 62, 1], ["D4", 62, 1], ["C4", 60, 2]]);
var ODE_TARGET = melodyTarget([["E4", 64, 1], ["E4", 64, 1], ["F4", 65, 1], ["G4", 67, 1], ["G4", 67, 1], ["F4", 65, 1], ["E4", 64, 1], ["D4", 62, 1], ["C4", 60, 1], ["C4", 60, 1], ["D4", 62, 1], ["E4", 64, 1], ["E4", 64, 1.5], ["D4", 62, 0.5], ["D4", 62, 2]]);
var CANON_THEME = [["D4", 62, 1], ["A4", 69, 1], ["B4", 71, 1], ["F#4", 66, 1], ["G4", 67, 1], ["D4", 62, 1], ["G4", 67, 1], ["A4", 69, 1]];
var WORKS = [{ name: "\u5C0F\u661F\u661F", source: STARTER, target: TWINKLE_TARGET }, { name: "\u6B22\u4E50\u9882", source: ODE, target: ODE_TARGET }, { name: "\u5361\u519C", source: CANON, target: [...melodyTarget(CANON_THEME), ...melodyTarget(CANON_THEME, 2, 4)] }];
var PRELUDE = `import _pico_runtime
__music_log = []
__music_voice = 1
__music_bpm = 100
__music_positions = {1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0}
_pico_runtime.register_trace_resource("${RESOURCE}", __music_log)

def tempo(bpm):
    global __music_bpm
    if type(bpm) not in (int, float) or not 40 <= bpm <= 200: raise ValueError("tempo \u5FC5\u987B\u5728 40 \u5230 200 \u4E4B\u95F4")
    __music_bpm = float(bpm)
    __music_log.append({"kind": "tempo", "bpm": __music_bpm})

def voice(number):
    global __music_voice
    if type(number) is not int or number not in __music_positions: raise ValueError("voice \u5FC5\u987B\u662F 1 \u5230 4 \u7684\u6574\u6570")
    __music_voice = number
    __music_log.append({"kind": "voice", "voice": number})

def note(pitch, beats, label=""):
    if type(pitch) is not int or not 36 <= pitch <= 96: raise ValueError("pitch \u5FC5\u987B\u662F 36 \u5230 96 \u7684 MIDI \u6574\u6570")
    if type(beats) not in (int, float) or beats <= 0 or abs(beats * 4 - round(beats * 4)) > 1e-9: raise ValueError("beats \u5FC5\u987B\u662F\u6B63\u7684\u56DB\u5206\u4E4B\u4E00\u62CD\u500D\u6570")
    if not isinstance(label, str): raise TypeError("label \u5FC5\u987B\u662F\u5B57\u7B26\u4E32")
    start = __music_positions[__music_voice]
    __music_log.append({"kind": "note", "voice": __music_voice, "start": start, "pitch": pitch, "beats": float(beats), "label": label, "bpm": __music_bpm})
    __music_positions[__music_voice] = start + beats

def rest(beats):
    if type(beats) not in (int, float) or beats <= 0 or abs(beats * 4 - round(beats * 4)) > 1e-9: raise ValueError("beats \u5FC5\u987B\u662F\u6B63\u7684\u56DB\u5206\u4E4B\u4E00\u62CD\u500D\u6570")
    start = __music_positions[__music_voice]
    __music_log.append({"kind": "rest", "voice": __music_voice, "start": start, "beats": float(beats), "bpm": __music_bpm})
    __music_positions[__music_voice] = start + beats`;
var music = stateful("music", (source2) => ({ source: source2, workIndex: 0 }), [
  on("editor.changed", (state, event) => {
    state.source = event.source;
  }, []),
  on("python.run", run, ["python.execute"]),
  on("music.work.changed", changeWork, ["editor.render", "python.clear", "python.run"])
]);
function run(state, _event, { emit }) {
  emit({ type: "python.execute", source: new Source(state.source, { prelude: PRELUDE }), options: { trace: { events: ["stmt", "call", "return"], observe: { globals: true, locals: true } }, timeoutMs: 4e3, maxTraceSteps: 12e3 } });
}
function changeWork(state, event, { emit }) {
  if (!Number.isInteger(event.workIndex) || !WORKS[event.workIndex] || event.workIndex === state.workIndex) return;
  state.workIndex = event.workIndex;
  state.source = WORKS[event.workIndex].source;
  emit({ type: "editor.render", source: state.source });
  emit({ type: "python.clear" });
  emit({ type: "python.run" });
}
function create(bus) {
  const course = music.create(STARTER, bus);
  const player = playback2.create({}, bus);
  const execution2 = python3.create({}, bus);
  return () => {
    execution2.dispose();
    player.dispose();
    course.dispose();
  };
}
var examples = { twinkle: { create, events: [{ type: "python.run" }] }, canon: { create, events: [{ type: "music.work.changed", workIndex: 2 }] } };
function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function readMusicWorld(position, trace) {
  const count = position?.state.resources?.[RESOURCE] ?? 0;
  let bpm = 100;
  const notes = [];
  for (const value of trace?.resources[RESOURCE]?.slice(0, count) ?? []) {
    const item = record(value);
    if (!item) continue;
    if (item.kind === "tempo" && typeof item.bpm === "number") bpm = item.bpm;
    if (item.kind === "note" && typeof item.voice === "number" && typeof item.start === "number" && typeof item.pitch === "number" && typeof item.beats === "number") notes.push({ voice: item.voice, start: item.start, pitch: item.pitch, beats: item.beats, label: typeof item.label === "string" ? item.label : "" });
  }
  return { bpm, notes };
}
function soundsAdded(position, trace) {
  const log = trace.resources[RESOURCE] ?? [];
  const from = position.previous.resources?.[RESOURCE] ?? 0;
  const to = position.state.resources?.[RESOURCE] ?? 0;
  const items = log.slice(0, to).map(record);
  return items.slice(from).flatMap((added, offset) => {
    const { kind, start, beats, bpm, pitch, voice } = added ?? {};
    if (kind !== "note" && kind !== "rest" || typeof start !== "number" || typeof beats !== "number" || typeof bpm !== "number") return [];
    const beat = 60 / bpm;
    const end = start + beats;
    const own = kind === "note" && typeof pitch === "number" ? [{ pitch, seconds: beats * beat, delay: 0 }] : [];
    const others = items.slice(0, from + offset).flatMap((item) => {
      const { kind: otherKind, voice: otherVoice, pitch: otherPitch, start: otherStart, beats: otherBeats } = item ?? {};
      return otherKind === "note" && otherVoice !== voice && typeof otherPitch === "number" && typeof otherStart === "number" && typeof otherBeats === "number" && otherStart >= start && otherStart < end ? [{ pitch: otherPitch, seconds: otherBeats * beat, delay: (otherStart - start) * beat }] : [];
    });
    return [...own, ...others];
  });
}
function playSounds(context, sounds, at) {
  return sounds.map((sound) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const begin = at + sound.delay;
    const end = begin + sound.seconds;
    oscillator.type = "triangle";
    oscillator.frequency.value = 440 * 2 ** ((sound.pitch - 69) / 12);
    gain.gain.setValueAtTime(1e-4, begin);
    gain.gain.exponentialRampToValueAtTime(0.12, begin + 0.02);
    gain.gain.exponentialRampToValueAtTime(1e-4, end);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(begin);
    oscillator.stop(end + 0.03);
    return oscillator;
  });
}
var OVERHEAD_MS = 90;
function paceOf(position, trace) {
  if (position.atEnd) return 400;
  const records = trace.resources[RESOURCE]?.slice(position.previous.resources?.[RESOURCE] ?? 0, position.state.resources?.[RESOURCE] ?? 0) ?? [];
  const timed = records.map(record).filter((item) => (item?.kind === "note" || item?.kind === "rest") && typeof item.beats === "number" && typeof item.bpm === "number");
  if (!timed.length) return 15;
  return Math.max(80, timed.reduce((sum, item) => sum + item.beats * 6e4 / item.bpm, 0) - OVERHEAD_MS);
}
var DEGREE = { 60: "1", 62: "2", 64: "3", 65: "4", 67: "5", 69: "6", 71: "7", 72: "1\xB7" };
var VOICE_COLOR = ["", "var(--pico-accent-deep)", "var(--pico-hue-fn-strong)", "var(--pico-hue-branch-strong)", "var(--pico-hue-loop-strong)"];
function MusicWorldView({ world, target, position, trace }) {
  const score = trace ? readMusicWorld(trace.position(trace.steps.length + 1), trace) : world;
  const length = Math.max(1, ...target.map((note) => note.start + note.beats), ...score.notes.map((note) => note.start + note.beats));
  const context = useRef(null);
  const [locked, setLocked] = useState(true);
  const audio = () => {
    const Audio = window.AudioContext ?? window.webkitAudioContext;
    return Audio === void 0 ? null : context.current ??= new Audio();
  };
  useEffect(() => {
    if (!locked) return;
    const unlock = () => {
      const ready = audio();
      void ready?.resume().then(() => {
        if (ready.state === "running") setLocked(false);
      });
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, [locked]);
  useEffect(() => () => {
    void context.current?.close();
  }, []);
  const reached = useRef({ trace: null, index: -1 });
  const index = position?.traceIndex ?? -1;
  useEffect(() => {
    const before = reached.current;
    reached.current = { trace, index };
    const ready = context.current;
    if (position === null || trace === null || before.trace !== trace || index !== before.index + 1 || ready?.state !== "running") return;
    playSounds(ready, soundsAdded(position, trace), ready.currentTime);
  }, [trace, index]);
  const current = world.notes.at(-1)?.start ?? null;
  const row = (pitch) => (76 - pitch) * 18;
  const width = (beats) => beats / length * 100;
  const left = (start) => start / length * 100;
  return /* @__PURE__ */ jsxs("div", { className: "music-world", children: [
    /* @__PURE__ */ jsx("style", { children: STYLE }),
    /* @__PURE__ */ jsxs("div", { className: "music-toolbar", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        world.bpm,
        " BPM"
      ] }),
      locked && /* @__PURE__ */ jsx("span", { title: "\u6D4F\u89C8\u5668\u8981\u6C42\u5148\u64CD\u4F5C\u9875\u9762\u624D\u80FD\u53D1\u58F0", children: "\u58F0\u97F3\u672A\u542F\u7528\uFF1A\u70B9\u51FB\u9875\u9762\u4EFB\u610F\u5904" }),
      /* @__PURE__ */ jsxs("b", { children: [
        current === null ? "\u2014" : current.toFixed(1),
        " / ",
        length,
        " \u62CD"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "music-score", children: world.notes.map((note, index2) => /* @__PURE__ */ jsxs("div", { style: { left: `${left(note.start)}%`, width: `${width(note.beats)}%`, borderColor: VOICE_COLOR[note.voice] }, children: [
      /* @__PURE__ */ jsx("b", { children: DEGREE[note.pitch] ?? "\xB7" }),
      /* @__PURE__ */ jsx("span", { children: note.label || note.pitch }),
      /* @__PURE__ */ jsx("em", { children: note.pitch })
    ] }, index2)) }),
    /* @__PURE__ */ jsxs("div", { className: "music-roll", children: [
      /* @__PURE__ */ jsx("div", { className: "music-keys", children: Array.from({ length: 41 }, (_, index2) => {
        const pitch = 76 - index2;
        return /* @__PURE__ */ jsx("span", { "data-black": [1, 3, 6, 8, 10].includes(pitch % 12), children: pitch % 12 === 0 ? `C${Math.floor(pitch / 12) - 1}` : "" }, pitch);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "music-grid", children: [
        target.map((note, index2) => /* @__PURE__ */ jsx("i", { className: "music-target", style: { top: row(note.pitch), left: `${left(note.start)}%`, width: `${width(note.beats)}%` } }, `t${index2}`)),
        world.notes.map((note, index2) => /* @__PURE__ */ jsx("i", { className: "music-note", style: { top: row(note.pitch), left: `${left(note.start)}%`, width: `${width(note.beats)}%`, background: VOICE_COLOR[note.voice] }, children: /* @__PURE__ */ jsx("span", { children: note.label || note.pitch }) }, index2))
      ] })
    ] })
  ] });
}
var STYLE = `.music-world{height:100%;display:grid;grid-template-rows:40px minmax(92px,.35fr) minmax(260px,1fr);background:var(--pico-surface);overflow:hidden;font:600 var(--pico-size-xs)/1 var(--pico-font-ui)}.music-toolbar{display:flex;align-items:center;gap:14px;padding:6px 12px;border-bottom:var(--pico-line);background:var(--pico-surface-raised)}.music-toolbar b{margin-left:auto;font-family:var(--pico-font-mono)}.music-score{position:relative;margin:12px 16px 8px 64px;border-block:1px solid var(--pico-hairline);background:repeating-linear-gradient(to bottom,transparent 0 14px,var(--pico-hairline) 15px,transparent 16px 28px)}.music-score>div{position:absolute;top:18px;height:54px;display:grid;place-items:center;border-left:3px solid;background:var(--pico-surface-raised);box-shadow:inset -1px 0 var(--pico-hairline)}.music-score b{font-size:18px}.music-score span{font-family:var(--pico-font-mono)}.music-score em{position:absolute;right:3px;top:3px;color:var(--pico-ink-soft);font-style:normal;font-size:10px}.music-roll{display:grid;grid-template-columns:54px 1fr;min-height:0;margin:0 16px 14px;border:var(--pico-line);background:var(--pico-surface-raised);overflow:auto}.music-keys{position:relative;height:738px;border-right:var(--pico-line)}.music-keys span{display:block;height:18px;padding:3px;border-bottom:1px solid var(--pico-hairline);background:var(--pico-surface-raised);font:9px/1 var(--pico-font-mono)}.music-keys span[data-black=true]{width:72%;margin-left:auto;color:var(--pico-on-accent);background:var(--pico-ink)}.music-grid{position:relative;height:738px;min-width:520px;background:repeating-linear-gradient(to bottom,transparent 0 17px,var(--pico-hairline) 18px),repeating-linear-gradient(to right,transparent 0 calc(12.5% - 1px),var(--pico-hairline) 12.5%)}.music-grid i{position:absolute;height:16px;border-radius:3px}.music-target{border:2px solid var(--pico-ink-soft);background:transparent;opacity:.5}.music-note{z-index:2;color:var(--pico-on-accent);overflow:hidden}.music-note span{padding:0 4px;font:10px/16px var(--pico-font-mono)}@media(max-width:800px){.music-world{grid-template-rows:40px 100px 1fr}.music-score{margin-left:12px}}`;
var layoutOptions = { open: ["viz", "debug"], ratio: 0.42, tree: { split: "column", children: [{ slot: "viz" }, { slot: "debug" }], key: "world" } };
var mountOptions = { ...pythonOptions({ playback: { stepMs: 110, stepMsFor: paceOf } }), filename: "music.py", layout: layoutOptions, automatic: 500, start: [{ type: "python.run" }] };
var starter = STARTER;
var MUSIC_SCRIPT = music_script_default;
var musicState = provided2("music.state");
var MUSIC_SESSION = pythonSession({
  world: { title: "\u4E50\u8C31\u4E0E\u94A2\u7434\u5377\u5E18", render: (view) => {
    const state = view.get(musicState);
    const playing = view.get(playbackHost2);
    return /* @__PURE__ */ jsx(MusicWorldView, { world: readMusicWorld(playing?.position ?? null, playing?.trace ?? null), target: WORKS[state.workIndex].target, position: playing?.position ?? null, trace: playing?.trace ?? null });
  } },
  domain: [caseChoices({ id: "music.work", label: "\u4F5C\u54C1", state: musicState, current: (state) => String(state.workIndex), choices: WORKS.map((work, index) => ({ value: String(index), label: work.name, title: work.name })), event: (value) => ({ type: "music.work.changed", workIndex: Number(value) }) })],
  provide: (view) => [musicState.with(view.state)],
  ai: courseAi({
    explain: "\u6CBF\u7740\u4E00\u4E2A\u97F3\u7B26\u770B\u56DB\u79CD\u8868\u793A\uFF1A\u5217\u8868\u91CC\u7684\u97F3\u540D\u548C\u62CD\u6570\uFF0Cmidi \u51FD\u6570\u7B97\u51FA\u7684\u6574\u6570\uFF0C\u5377\u5E18\u4E0A\u7684\u4F4D\u7F6E\u4E0E\u5BBD\u5EA6\uFF0C\u4EE5\u53CA\u64AD\u653E\u51FA\u7684\u58F0\u97F3\u3002",
    question: "\u5148\u627E\u4E00\u4E2A\u97F3\u7B26\uFF0C\u4F8B\u5982 G4\uFF1A\u5B83\u4E3A\u4EC0\u4E48\u662F 67\uFF1F\u518D\u770B\u4E00\u62CD\u548C\u4E24\u62CD\u5728\u5377\u5E18\u5BBD\u5EA6\u4E0A\u6709\u4EC0\u4E48\u533A\u522B\u3002"
  }),
  scripts: [MUSIC_SCRIPT]
});
var MUSIC_COURSE = {
  name: "\u7528 Python \u5199\u4E00\u9996\u6B4C",
  component: music,
  starter: STARTER,
  playground: mountOptions,
  session: MUSIC_SESSION
};
function Root(host = {}) {
  return /* @__PURE__ */ jsx(SessionPage, { course: MUSIC_COURSE, host });
}
export {
  MUSIC_COURSE,
  MUSIC_SCRIPT,
  MusicWorldView,
  Root,
  STARTER,
  WORKS,
  examples,
  music,
  paceOf,
  playSounds,
  readMusicWorld,
  soundsAdded,
  starter
};
