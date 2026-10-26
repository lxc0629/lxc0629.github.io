// playgrounds/chickenrabbit/chickenrabbit.generated.tsx
import { on, stateful } from "../pico.js";
import { Source } from "../pico.js";
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

// playgrounds/chickenrabbit/chickenrabbit.generated.tsx
import { PlaygroundShell, Widget } from "../pico.js";

// assets/catalog.ts
var openMoji = (name, codepoint) => Object.freeze({
  path: `assets/openmoji/17.0.0/${name}.svg`,
  format: "svg",
  source: `https://github.com/hfg-gmuend/openmoji/blob/17.0.0/color/svg/${codepoint}.svg`,
  license: "CC-BY-SA-4.0"
});
var assets = Object.freeze({
  "animal/chicken/2d": openMoji("chicken", "1F413"),
  "animal/rabbit/2d": openMoji("rabbit", "1F407"),
  "animal/cow/2d": openMoji("cow", "1F404"),
  "object/apple/2d": openMoji("apple", "1F34E"),
  "object/book/2d": openMoji("book", "1F4D6"),
  "object/chair/2d": openMoji("chair", "1FA91"),
  "object/box/2d": openMoji("box", "1F4E6"),
  "nature/tree/2d": openMoji("tree", "1F333"),
  "nature/flower/2d": openMoji("flower", "1F33C"),
  "place/house/2d": openMoji("house", "1F3E0"),
  "place/school/2d": openMoji("school", "1F3EB"),
  "animal/cow/3d": Object.freeze({
    path: "models/quaternius-cow.glb",
    format: "glb",
    source: "https://quaternius.com/packs/cubeworldkit.html",
    license: "CC0-1.0",
    animations: Object.freeze({ idle: "Idle", walk: "Walk", eat: "Eating" })
  })
});
function asset(id) {
  return assets[id];
}

// playgrounds/chickenrabbit/chickenrabbit.generated.tsx
import { Fragment, jsx, jsxs } from "../libs/react.js";
var layoutOptions = { open: ["world", "debugger"], ratio: 0.4 };
var STARTER = `observation = (10, 28)

heads = observation[0]
legs = observation[1]

# \u8BA9\u6BCF\u4E00\u53EA\u52A8\u7269\u90FD\u62AC\u8D77 2 \u6761\u817F
raise_legs(2)

# \u7EDF\u8BA1\u73B0\u5728\u8FD8\u6709\u591A\u5C11\u6761\u817F\u7740\u5730
grounded = count_grounded_legs()

# \u9E21\u62AC\u8D77 2 \u6761\u817F\u540E\uFF0C\u6CA1\u6709\u817F\u7740\u5730
# \u5154\u5B50\u62AC\u8D77 2 \u6761\u817F\u540E\uFF0C\u8FD8\u6709 2 \u6761\u817F\u7740\u5730
# \u6240\u4EE5\uFF1A\u7740\u5730\u817F\u6570 / 2 = \u5154\u5B50\u6570\u91CF
rabbits = grounded // 2

# \u4E5F\u53EF\u4EE5\u53EA\u62AC\u8D77 1 \u6761\u817F\uFF08raise_legs(1)\uFF09\uFF0C\u7B97\u6CD5\u8981\u8DDF\u7740\u6539\uFF1A
# \u9E21\u62AC\u8D77 1 \u6761\u817F\u540E\uFF0C\u8FD8\u6709 1 \u6761\u817F\u7740\u5730\uFF1B\u5154\u5B50\u62AC\u8D77 1 \u6761\u817F\u540E\uFF0C\u8FD8\u6709 3 \u6761\u817F\u7740\u5730
# \u6240\u4EE5\uFF1Agrounded - heads = 2 \xD7 \u5154\u5B50\u6570\u91CF\uFF0C\u4E5F\u5C31\u662F rabbits = (grounded - heads) // 2

# \u603B\u52A8\u7269\u6570 - \u5154\u5B50\u6570 = \u9E21\u7684\u6570\u91CF
chickens = heads - rabbits`;
var PRELUDE = `def __observation():
    """\u7B3C\u5B50\u7684\u8BFB\u6570\uFF1A\u5B66\u751F\u5199\u4E0B\u7684 observation\u3002\u4E16\u754C\u663E\u793A\u548C\u7B54\u6848\u90FD\u4EE5\u5B83\u4E3A\u51C6\u3002"""
    value = globals().get("observation")
    if not isinstance(value, (tuple, list)) or len(value) != 2:
        raise ValueError("observation \u5E94\u8BE5\u662F\u4E24\u4E2A\u6574\u6570\u7684\u5143\u7EC4\uFF0C\u4F8B\u5982 observation = (10, 28)")
    heads, legs = value
    if heads < 0 or legs < 2 * heads or legs > 4 * heads or (legs - 2 * heads) % 2 != 0:
        raise ValueError(f"observation \u4E0D\u6210\u7ACB\uFF1A{heads} \u53EA\u9E21\u5154\u53EA\u53EF\u80FD\u6709 {2 * heads} \u5230 {4 * heads} \u6761\u817F\uFF0C\u800C\u4E14\u817F\u6570\u51CF\u53BB 2 \u500D\u5934\u6570\u8981\u80FD\u88AB 2 \u6574\u9664")
    return heads, legs

def __build_cage():
    """\u7B3C\u5B50\u7684\u89C4\u5219\u4E0E\u771F\u5B9E\u6210\u5458\u7531 observation \u73B0\u7B97\uFF1B\u52A8\u4F5C\u72B6\u6001\u7559\u5728\u95ED\u5305\u91CC\uFF0C\u5B66\u751F\u53EF\u89C1\u7684\u5168\u5C40\u53EA\u6709\u4E09\u4E2A\u52A8\u4F5C\u51FD\u6570\u3002"""
    log = []

    def snapshot(raised, counted, revealed):
        heads, legs = __observation()
        record = {
            "raised": raised,
            "grounded": legs - raised * heads,
            "counted": counted,
            "revealed": revealed,
        }
        if revealed:
            rabbits = (legs - 2 * heads) // 2
            record["chickens"] = heads - rabbits
            record["rabbits"] = rabbits
        return record

    # \u72B6\u6001\u4E0D\u653E\u8FDB globals\uFF1A\u6CE8\u518C\u6210 trace \u8D44\u6E90\uFF0C\u6309\u843D\u70B9\u8BB0\u5F55\u957F\u5EA6\uFF0C\u89C6\u56FE\u636E\u6B64\u8BFB\u56DE\u4E16\u754C\u3002
    import _pico_runtime

    _pico_runtime.register_trace_resource("cage", log)
    raised = 0
    counted = False
    revealed = False

    def raise_legs(count):
        """\u8BA9\u7B3C\u4E2D\u6BCF\u53EA\u52A8\u7269\u62AC\u8D77 count \u6761\u817F\u3002"""
        nonlocal raised
        if count not in (0, 1, 2):
            raise ValueError("raise_legs \u53EA\u80FD\u63A5\u6536 0\u30011 \u6216 2")
        raised = count
        log.append(snapshot(raised, counted, revealed))

    def count_grounded_legs():
        """\u8FD4\u56DE\u6B64\u523B\u8FD8\u7740\u5730\u7684\u817F\u6570\u3002"""
        nonlocal counted
        counted = True
        record = snapshot(raised, counted, revealed)
        log.append(record)
        return record["grounded"]

    def reveal():
        """\u53EA\u6709\u5B66\u751F\u7B97\u51FA\u7684\u9E21\u3001\u5154\u6570\u91CF\u90FD\u5BF9\uFF0C\u7B3C\u5B50\u624D\u663E\u5F62\u3002"""
        nonlocal revealed
        heads, legs = __observation()
        rabbits = (legs - 2 * heads) // 2
        if globals().get("chickens") == heads - rabbits and globals().get("rabbits") == rabbits:
            revealed = True
            log.append(snapshot(raised, counted, revealed))

    return raise_legs, count_grounded_legs, reveal

raise_legs, count_grounded_legs, __reveal = __build_cage()`;
var DRIVER = "__reveal()";
var EDITED = `observation = (10, 28)

heads = observation[0]
legs = observation[1]

raise_legs(1)
grounded = count_grounded_legs()

# \u9E21\u62AC\u8D77 1 \u6761\u817F\u540E\uFF0C\u8FD8\u6709 1 \u6761\u817F\u7740\u5730\uFF1B\u5154\u5B50\u62AC\u8D77 1 \u6761\u817F\u540E\uFF0C\u8FD8\u6709 3 \u6761\u817F\u7740\u5730
# \u6240\u4EE5\uFF1Agrounded - heads = 2 \xD7 \u5154\u5B50\u6570\u91CF
rabbits = (grounded - heads) // 2

chickens = heads - rabbits
print(chickens, rabbits)`;
var STEP_MS = 240;
var BIND_MS = 200;
var MOVE_MS = 700;
var REVEAL_MS = 900;
var chickenRabbit = stateful("chickenrabbit", (source) => ({ source }), [
  on("editor.changed", edit, []),
  on("python.run", run, ["python.execute"])
]);
function edit(state, event) {
  state.source = event.source;
}
function run(state, _event, { emit }) {
  emit({ type: "python.execute", source: new Source(state.source, { prelude: PRELUDE, driver: DRIVER }), options: {
    trace: { events: ["stmt", "call", "return"], observe: { globals: true, locals: false } }
  } });
}
function create(bus) {
  const course = chickenRabbit.create(STARTER, bus);
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
  starter: { create, events: [] },
  edited: { create, events: [
    { type: "editor.changed", source: EDITED },
    { type: "python.run" }
  ] },
  changeObservation: { create, events: [
    { type: "editor.changed", source: STARTER.replace("(10, 28)", "(12, 32)") + "\nprint(chickens, rabbits)\n" },
    { type: "python.run" }
  ] }
};
var INITIAL = {
  heads: null,
  legs: null,
  raised: 0,
  grounded: null,
  counted: false,
  revealed: false,
  chickens: null,
  rabbits: null
};
function asRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}
var RESOURCE = "cage";
function observationOf(state) {
  const value = state?.globals?.["observation"];
  if (!Array.isArray(value) || value.length !== 2) return null;
  const heads = value[0];
  const legs = value[1];
  const whole = (n) => typeof n === "number" && Number.isInteger(n) && n >= 0;
  return whole(heads) && whole(legs) ? [heads, legs] : null;
}
function readWorld(position, trace) {
  return worldOfState(position?.state, trace);
}
function worldOfState(state, trace) {
  const observed = observationOf(state);
  const heads = observed?.[0] ?? INITIAL.heads;
  const legs = observed?.[1] ?? INITIAL.legs;
  const count = state?.resources?.[RESOURCE] ?? 0;
  const raw = asRecord(count > 0 ? trace?.resources[RESOURCE]?.[count - 1] : void 0);
  const number = (key, fallback) => {
    const value = raw?.[key];
    return typeof value === "number" ? value : fallback;
  };
  const raised = raw === null ? 0 : number("raised", 0);
  return {
    heads,
    legs,
    raised: raised === 1 ? 1 : raised === 2 ? 2 : 0,
    // 没有记录就是还没动过世界：所有腿都着地。
    grounded: raw === null ? legs : number("grounded", legs ?? 0),
    counted: raw?.["counted"] === true,
    revealed: raw?.["revealed"] === true,
    chickens: typeof raw?.["chickens"] === "number" ? raw["chickens"] : null,
    rabbits: typeof raw?.["rabbits"] === "number" ? raw["rabbits"] : null
  };
}
function moved(before, after) {
  return before.raised !== after.raised || before.grounded !== after.grounded || before.counted !== after.counted || before.revealed !== after.revealed;
}
function paceOf(position, trace) {
  if (trace === null) return MOVE_MS;
  if (position.atEnd) return REVEAL_MS;
  return moved(worldOfState(position.previous, trace), worldOfState(position.state, trace)) ? MOVE_MS : BIND_MS;
}
function assetUrl(path) {
  return new URL(path, import.meta.url).href;
}
var SPECIES = {
  chicken: {
    url: assetUrl(asset("animal/chicken/2d").path),
    // 实测素材：主体 x 11.25–60.89、y 10.97–62.02，脚趾触地 y = 62。
    art: { x0: 11.25, x1: 60.89, y0: 10.97, ground: 62 },
    belly: "M-10,54.6H82V-20H-10Z",
    // 数组顺序＝抬腿顺序：抬起一只脚时抬的是近侧这条；两条腿都画在身体后面。
    legs: [
      { hx: 32.24, hy: 54.6, far: false, width: 2, behind: true, shank: ["M0,0 L-0.65,4.98 Q-2.26,5.51 -2.92,6.4"], fine: ["M1.46,5.53 L-0.29,4.6"] },
      { hx: 40.66, hy: 54.6, far: true, width: 2, behind: true, shank: ["M0,0 L-0.65,4.98 Q-2.26,5.51 -2.92,6.4"], fine: ["M1.46,5.53 L-0.29,4.6"] }
    ],
    pose: [
      { lean: 0, swing: 0 },
      // 抬起一只脚：单脚独立，身体后仰 5° 把重心压到着地那条腿上，抬起的腿再多转 100°。
      { lean: 5, swing: 100 },
      // 两条腿都抬起：身体再仰一点并整体上跳（hop），两只脚一起离地。
      { lean: 12, swing: 100, hop: 2.6 }
    ],
    pivot: { x: 37.7, y: 62 }
  },
  rabbit: {
    url: assetUrl(asset("animal/rabbit/2d").path),
    // 实测素材：主体 x 8.02–63.70、y 10.27–58.08，脚掌触地 y = 58.1。
    art: { x0: 8.02, x1: 63.7, y0: 10.27, ground: 58.1 },
    // 控制线只掏两块：素材自带的前腿（11–30）与它那只折起来的后脚（30–41，46 以下）。
    // 其余轮廓（下巴、肚子下缘、尾巴、后腿根的黑边）一律保留，所以身子是圆的。
    belly: "M-12,-22H83V58.6H41V46H30V41.5H11V58.6H-12Z",
    // 四条腿都自己画：前腿两条用白袜色（素材那只前腿就是白底黑边），
    // 后腿两条用皮毛色加黑描边，前一只后一只地错开，看得出是两只后脚。
    // 顺序＝抬腿顺序：抬 1 条抬前腿，抬 2 条抬两条前腿，后腿始终不动。
    legs: [
      { hx: 24, hy: 43.5, far: true, width: 2.2, hollow: { width: 4.4, edge: 1 }, shank: ["M0,0 C0.2,3.4 0.2,7.4 0,11.3 C-0.7,12.1 -1.5,12.7 -2.3,13"] },
      { hx: 29.5, hy: 43.5, far: false, width: 2.5, hollow: { width: 5, edge: 1 }, shank: ["M0,0 C0.2,3 0.2,6.8 0,10.5 C-0.7,11.3 -1.5,11.9 -2.3,12.2"] },
      { hx: 39.5, hy: 47.5, far: true, width: 2.2, hollow: { width: 4.4, edge: 1, fill: "var(--pico-cr-rabbit-coat)" }, shank: ["M0,0 C0.1,2.4 0.1,5.2 0,8.2 C-0.5,8.8 -1.1,9.2 -1.7,9.4"] },
      { hx: 34.5, hy: 48.5, far: false, width: 2.5, hollow: { width: 5, edge: 1, fill: "var(--pico-cr-rabbit-coat)" }, shank: ["M0,0 C0.1,2.2 0.1,4.8 0,7.5 C-0.5,8.1 -1.2,8.5 -1.8,8.7"] }
    ],
    pose: [
      { lean: 0, swing: 0 },
      // 抬起一条前腿：身体不动，那条腿自己往前抬到接近水平（脚掌离地够远才看得出）。
      { lean: 0, swing: 78 },
      // 两条前腿都抬起：身体坐着后仰，两条前腿往前上方收起（像兔子求食那样抱在胸前）。
      { lean: 14, swing: 48 }
    ],
    // 支点取后腿根下面：坐起时是后腿根在压着地，屁股不会坐到地面以下。
    pivot: { x: 44, y: 58.1 }
  }
};
var BOARD = { width: 760, height: 380, front: 366 };
function RabbitFeatures() {
  return /* @__PURE__ */ jsxs("g", { "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M18.2,20 C18.1,16.8 19.1,14 20.7,12.8 M23.8,18.7 C26,16.7 27.1,14.2 27.2,12.7",
        fill: "none",
        stroke: "var(--pico-cr-rabbit-pink)",
        strokeWidth: 1.15,
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ jsx("circle", { cx: 19.8, cy: 26.4, r: 1.75, fill: "var(--pico-cr-animal-ink)" }),
    /* @__PURE__ */ jsx("circle", { cx: 19.2, cy: 25.8, r: 0.55, fill: "var(--pico-cr-rabbit-limb)" })
  ] });
}
var FOREGROUND = [
  { species: "chicken", x: 100, y: BOARD.front, height: 176 },
  { species: "rabbit", x: 648, y: BOARD.front, height: 170 }
];
var CROWD_BAND = {
  left: 210,
  right: 550,
  front: 250,
  /** 后排最多排到这条线附近：排数与排距把后排托到画板上部，顶上不留空地。 */
  top: 96,
  depth: 0.74,
  maxHeight: 88,
  maxPerRow: 4,
  maxRows: 3
};
var WIDEST = 1.3;
var PREVIEW = 2;
var PREVIEW_GAP = 80;
function crowdRows(total) {
  const rows = Math.min(CROWD_BAND.maxRows, Math.max(1, Math.ceil(total / CROWD_BAND.maxPerRow)));
  const base = Math.floor(total / rows);
  return Array.from({ length: rows }, (_, row) => Math.max(1, base + (row < total % rows ? 1 : 0)));
}
function crowdSeats(total) {
  const width = CROWD_BAND.right - CROWD_BAND.left;
  const rows = crowdRows(Math.max(1, Math.floor(total) || 0));
  const front = Math.min(CROWD_BAND.maxHeight, width / (WIDEST * Math.max(1, rows[0])));
  const pitch = Math.max(front + 14, (CROWD_BAND.front - CROWD_BAND.top) / Math.max(1, rows.length - 1));
  const seats = [];
  rows.forEach((count, row) => {
    const height = front * CROWD_BAND.depth ** row;
    const span = width - height * WIDEST;
    const step = count === 1 ? 0 : span / (count - 1);
    for (let index = 0; index < count; index += 1) {
      seats.push({
        x: CROWD_BAND.left + height * WIDEST / 2 + step * index,
        y: CROWD_BAND.front - row * pitch,
        height,
        mirror: (row + index) % 2 === 1
      });
    }
  });
  return seats;
}
function crowdSpecies(total, chickens, rabbits) {
  const quota = { chicken: chickens, rabbit: rabbits };
  const used = { chicken: 0, rabbit: 0 };
  const fit = (want) => quota[want] > used[want] ? want : want === "chicken" ? "rabbit" : "chicken";
  return Array.from({ length: total }, (_, index) => {
    const want = index === 0 ? "chicken" : index === 1 ? "rabbit" : used.chicken / Math.max(1, chickens) <= used.rabbit / Math.max(1, rabbits) ? "chicken" : "rabbit";
    const species = fit(want);
    used[species] += 1;
    return species;
  });
}
function previewX(index) {
  const center = (CROWD_BAND.left + CROWD_BAND.right) / 2;
  return center + (index === 0 ? -PREVIEW_GAP : PREVIEW_GAP);
}
var CLIP_PREFIX = "pico-cr-belly";
function legStroke(width) {
  return {
    strokeWidth: width,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  };
}
function pivot(angle) {
  return {
    transformBox: "view-box",
    transformOrigin: "0 0",
    transform: `rotate(${angle}deg)`,
    transition: "transform var(--pico-cr-move) var(--pico-ease-out)"
  };
}
function Stroke({ paths, width, hollow }) {
  const rim = hollow === void 0 ? 1.8 : 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    rim > 0 && paths.map((d, index) => /* @__PURE__ */ jsx("path", { d, style: { ...legStroke(width + rim), stroke: "var(--pico-cr-floor)" } }, `halo-${index}`)),
    paths.map((d, index) => /* @__PURE__ */ jsx("path", { d, style: { ...legStroke(width), stroke: "var(--pico-cr-animal-ink)" } }, index)),
    hollow !== void 0 && paths.map((d, index) => /* @__PURE__ */ jsx("path", { d, style: { ...legStroke(width - hollow.edge * 2), stroke: hollow.fill ?? "var(--pico-cr-rabbit-limb)" } }, `meat-${index}`))
  ] });
}
var LEG_MIN_WIDTH = 2.8;
function Leg({ leg, angle, scale, detail }) {
  const hollow = leg.hollow;
  const solid = Math.max(leg.width, LEG_MIN_WIDTH / scale) - (leg.far ? 0.35 : 0);
  const width = hollow === void 0 ? solid : hollow.width;
  const shank = detail && leg.fine !== void 0 ? [...leg.shank ?? [], ...leg.fine] : leg.shank ?? [];
  return /* @__PURE__ */ jsx("svg", { x: leg.hx, y: leg.hy, width: 80, height: 80, viewBox: "0 0 80 80", overflow: "visible", children: /* @__PURE__ */ jsx("g", { className: "pico-cr-leg", style: pivot(angle), children: /* @__PURE__ */ jsx(Stroke, { paths: shank, width, hollow }) }) });
}
function AnimalView({
  species,
  x,
  y,
  height,
  raised,
  mirror = false,
  detail = false,
  revealDelayMs = 0,
  appear = true,
  clipId
}) {
  const spec = SPECIES[species];
  const scale = height / (spec.art.ground - spec.art.y0);
  const center = (spec.art.x0 + spec.art.x1) / 2;
  const pose = spec.pose[raised];
  const hop = pose.hop ?? 0;
  const offset = (appear ? 0 : -6) - hop;
  const degree = pose.lean * (mirror ? -1 : 1);
  const armX = x + (spec.pivot.x - center) * (mirror ? -scale : scale);
  const armY = y + (spec.pivot.y - spec.art.ground) * scale;
  const bodyWidth = (spec.art.x1 - spec.art.x0) * scale;
  const legs = (behind) => spec.legs.map((leg, index) => ({ leg, index })).filter(({ leg }) => leg.behind === true === behind).map(({ leg, index }) => /* @__PURE__ */ jsx(Leg, { leg, angle: index < raised ? pose.swing : -degree, scale, detail }, index));
  const move = "translate var(--pico-cr-move) var(--pico-ease-out), rotate var(--pico-cr-move) var(--pico-ease-out)";
  return /* @__PURE__ */ jsxs(
    "g",
    {
      className: `pico-cr-animal${appear ? "" : " pico-cr-animal--away"}`,
      style: { translate: `0 ${offset}px`, transitionDelay: `${revealDelayMs}ms` },
      children: [
        /* @__PURE__ */ jsx(
          "ellipse",
          {
            className: "pico-cr-shadow",
            rx: bodyWidth * 0.32,
            ry: 3.2,
            style: { translate: `${x}px ${y}px`, transition: move }
          }
        ),
        /* @__PURE__ */ jsx("g", { style: { translate: `${x}px ${y}px`, rotate: `${degree}deg`, transformOrigin: `${armX - x}px ${armY - y}px`, transition: move }, children: /* @__PURE__ */ jsxs("g", { transform: `scale(${mirror ? -scale : scale} ${scale}) translate(${-center} ${-spec.art.ground})`, children: [
          legs(true),
          /* @__PURE__ */ jsx("image", { href: spec.url, x: 0, y: 0, width: 72, height: 72, clipPath: `url(#${clipId})` }),
          species === "rabbit" && /* @__PURE__ */ jsx(RabbitFeatures, {}),
          legs(false)
        ] }) })
      ]
    }
  );
}
function Dots({ x, y, visible }) {
  return /* @__PURE__ */ jsx("g", { className: "pico-cr-dots", "data-visible": visible ? "true" : "false", children: [-12.4, 0, 12.4].map((offset) => /* @__PURE__ */ jsx("circle", { cx: x + offset, cy: y, r: 5.2 }, offset)) });
}
function WorldBoard({ world }) {
  const seats = crowdSeats(world.heads ?? PREVIEW);
  const quota = world.chickens !== null && world.rabbits !== null ? { chickens: world.chickens, rabbits: world.rabbits } : null;
  const species = world.revealed && quota !== null ? crowdSpecies(seats.length, quota.chickens, quota.rabbits) : null;
  const drawing = seats.map((seat, index) => ({ seat, index })).sort((a, b) => b.seat.y - a.seat.y);
  let arriving = 0;
  const members = drawing.map(({ seat, index }) => {
    const first = index < PREVIEW;
    const appear = first || world.revealed && species !== null;
    const x = world.revealed || !first ? seat.x : previewX(index);
    return {
      species: species?.[index] ?? (index === 0 ? "chicken" : "rabbit"),
      x,
      seat,
      appear,
      delayMs: first ? 0 : arriving++ * 70
    };
  });
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      className: "pico-cr-board",
      viewBox: `0 0 ${BOARD.width} ${BOARD.height}`,
      preserveAspectRatio: "xMidYMax meet",
      role: "img",
      "aria-label": world.heads === null || world.legs === null ? "\u7B3C\u5B50\uFF1A\u8FD8\u6CA1\u8BFB\u5230 observation" : `\u7B3C\u5B50\uFF1A${world.heads} \u4E2A\u5934\uFF0C${world.legs} \u6761\u817F${world.counted ? `\uFF0C${world.grounded} \u6761\u817F\u7740\u5730` : ""}`,
      children: [
        /* @__PURE__ */ jsx("defs", { children: Object.keys(SPECIES).map((species2) => /* @__PURE__ */ jsx("clipPath", { id: `${CLIP_PREFIX}-${species2}`, children: /* @__PURE__ */ jsx("path", { d: SPECIES[species2].belly }) }, species2)) }),
        /* @__PURE__ */ jsx("rect", { className: "pico-cr-ground", x: -4e3, y: -4e3, width: 8e3, height: 8e3 }),
        members.map(({ species: kind, x, seat, appear, delayMs }, index) => /* @__PURE__ */ jsx(
          AnimalView,
          {
            species: kind,
            x,
            y: seat.y,
            height: seat.height,
            mirror: seat.mirror,
            raised: world.raised,
            appear,
            revealDelayMs: delayMs,
            clipId: `${CLIP_PREFIX}-${kind}`
          },
          index
        )),
        /* @__PURE__ */ jsx(Dots, { x: (CROWD_BAND.left + CROWD_BAND.right) / 2, y: seats[0].y - seats[0].height * 0.5, visible: !world.revealed }),
        FOREGROUND.map((animal) => /* @__PURE__ */ jsx(
          AnimalView,
          {
            species: animal.species,
            x: animal.x,
            y: animal.y,
            height: animal.height,
            mirror: animal.species === "chicken",
            raised: world.raised,
            detail: true,
            clipId: `${CLIP_PREFIX}-${animal.species}`
          },
          animal.species
        ))
      ]
    }
  );
}
var STYLE = `
.pico-cr-world { position: relative; height: 100%; min-height: 0; --pico-cr-move: ${MOVE_MS}ms; --pico-cr-floor: color-mix(in srgb, var(--pico-surface) 52%, var(--pico-hairline)); --pico-cr-animal-ink: #111827; --pico-cr-rabbit-limb: light-dark(#ffffff, #f8fafc); --pico-cr-rabbit-coat: #3f3f3f; --pico-cr-rabbit-pink: light-dark(#e8798c, #f4a3b1); background: var(--pico-cr-floor); }
.pico-cr-board { display: block; width: 100%; height: 100%; }
.pico-cr-ground { fill: var(--pico-cr-floor); }
.pico-cr-animal { opacity: 1; transition: translate var(--pico-cr-move) var(--pico-ease-out), opacity var(--pico-cr-move) var(--pico-ease-out); }
.pico-cr-animal--away { opacity: 0; }
.pico-cr-shadow { fill: color-mix(in srgb, var(--pico-ink) 10%, transparent); }
.pico-cr-dots { fill: var(--pico-ink-soft); transition: opacity 180ms var(--pico-ease-out); }
.pico-cr-dots[data-visible="false"] { opacity: 0; }
.pico-cr-readout { position: absolute; top: 15px; left: 20px; display: flex; align-items: center; gap: 16px; margin: 0; font: 500 var(--pico-size-xs)/1 var(--pico-font-ui); color: var(--pico-ink-soft); }
.pico-cr-readout span { display: inline-flex; align-items: baseline; }
.pico-cr-readout span + span { padding-left: 16px; border-left: var(--pico-line); }
.pico-cr-readout b { margin-left: 7px; color: var(--pico-ink); font-size: var(--pico-size-md); font-weight: 700; font-variant-numeric: tabular-nums; }
.pico-cr-readout .pico-cr-grounded { opacity: 0; translate: 0 3px; border-left-color: transparent; transition: opacity var(--pico-cr-move) var(--pico-ease-out), translate var(--pico-cr-move) var(--pico-ease-out), border-color var(--pico-cr-move) var(--pico-ease-out); }
.pico-cr-readout .pico-cr-grounded[data-visible="true"] { opacity: 1; translate: 0 0; border-left-color: var(--pico-hairline); }
@media (prefers-reduced-motion: reduce) {
  .pico-cr-animal, .pico-cr-dots, .pico-cr-leg, .pico-cr-readout .pico-cr-grounded { transition: none; }
}
`;
function WorldCard({ world, moveMs = MOVE_MS }) {
  return /* @__PURE__ */ jsxs("div", { className: "pico-cr-world", style: { "--pico-cr-move": `${moveMs}ms` }, children: [
    /* @__PURE__ */ jsx("style", { children: STYLE }),
    /* @__PURE__ */ jsx(WorldBoard, { world }),
    /* @__PURE__ */ jsx("p", { className: "pico-cr-readout", children: world.heads !== null && world.legs !== null && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "\u5934",
        /* @__PURE__ */ jsx("b", { children: world.heads })
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "\u817F",
        /* @__PURE__ */ jsx("b", { children: world.legs })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "pico-cr-grounded", "data-visible": world.counted ? "true" : "false", children: [
        "\u7740\u5730",
        /* @__PURE__ */ jsx("b", { children: world.grounded })
      ] })
    ] }) })
  ] });
}
var mountOptions = {
  ...pythonOptions({ playback: { stepMs: STEP_MS, stepMsFor: paceOf } }),
  layout: layoutOptions,
  filename: "chickenrabbit.py",
  automatic: 500,
  start: [{ type: "python.run" }]
};
var starter = STARTER;
function Root(host = {}) {
  const view = usePlayground(chickenRabbit, host.source ?? STARTER, { ...mountOptions, ...host.options });
  if (!view) return /* @__PURE__ */ jsx(Fragment, {});
  const { trace, position } = view.parts.playback;
  const world = readWorld(position, trace);
  const moveMs = position === null ? REVEAL_MS : paceOf(position, trace);
  const panels = [
    { key: "world", icon: "viz", title: "\u7B3C\u5B50", flush: true, content: /* @__PURE__ */ jsx(WorldCard, { world, moveMs }) },
    { key: "debugger", icon: "debug", title: "\u8C03\u8BD5", content: view === null ? null : /* @__PURE__ */ jsx(Widget, { widget: view.parts.debugger }) },
    { key: "output", icon: "output", title: "\u7EC8\u7AEF", content: view === null ? null : /* @__PURE__ */ jsx(Widget, { widget: view.parts.terminal }) }
  ];
  return /* @__PURE__ */ jsx(
    PlaygroundShell,
    {
      name: "\u9E21\u5154\u540C\u7B3C",
      layout: view.layout,
      onEvent: view.send,
      menu: view.menu,
      toolbar: view.toolbar,
      editor: view === null ? null : /* @__PURE__ */ jsx(Widget, { widget: view.editor }),
      panels
    }
  );
}
export {
  BOARD,
  CROWD_BAND,
  DRIVER,
  EDITED,
  PRELUDE,
  Root,
  STARTER,
  WorldBoard,
  WorldCard,
  chickenRabbit,
  crowdSeats,
  crowdSpecies,
  examples,
  paceOf,
  readWorld,
  starter
};
