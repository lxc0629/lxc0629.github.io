// playgrounds/lean/lean.generated.tsx
import { autocompletion } from "../libs/codemirror.js";
import { StreamLanguage } from "../libs/codemirror.js";
import { event, on, stateful } from "../pico.js";
import { PlaygroundShell, Widget } from "../pico.js";
import { usePlayground } from "../pico.js";
import { lean } from "../pico.js";

// playgrounds/lean/sierpinski.lean
var sierpinski_default = "-- \u8C22\u5C14\u5BBE\u65AF\u57FA\u4E09\u89D2\u5F62\uFF1A\u6A2A\u7EB5\u5750\u6807\u7684\u4E8C\u8FDB\u5236\u4E2D\u4E0D\u80FD\u6709\u91CD\u53E0\u7684 1\u3002\n-- x \u5411\u53F3\uFF0Cy \u5411\u4E0B\uFF1Btrue \u662F\u9ED1\u8272\uFF0Cfalse \u662F\u767D\u8272\u3002\ndef f (x y : Int) : Bool :=\n  decide (1 \u2264 x \u2227 x \u2264 100 \u2227 1 \u2264 y \u2227 y \u2264 100 \u2227\n    ((x - 1).toNat &&& (y - 1).toNat) = 0)\n\n-- \u5BF9\u6240\u6709\u6574\u6570\uFF08\u5305\u62EC\u753B\u5E03\u5916\uFF09\u6210\u7ACB\uFF0C\u4E0D\u53EA\u662F\u68C0\u67E5 10,000 \u4E2A\u70B9\u3002\ntheorem transpose (x y : Int) : f x y = f y x := by\n  simp only [f, Nat.and_comm (x - 1).toNat (y - 1).toNat, and_left_comm]\n\n-- \u753B\u5E03\u5916\u59CB\u7EC8\u662F\u767D\u8272\u3002\ntheorem outside (x y : Int)\n    (h : x < 1 \u2228 100 < x \u2228 y < 1 \u2228 100 < y) :\n    f x y = false := by\n  have bounds : \xAC (1 \u2264 x \u2227 x \u2264 100 \u2227 1 \u2264 y \u2227 y \u2264 100) := by\n    omega\n  simp only [f, decide_eq_false_iff_not]\n  intro \u27E8hx, hx', hy, hy', _\u27E9\n  exact bounds \u27E8hx, hx', hy, hy'\u27E9\n\n";

// playgrounds/lean/pixels.lean
var pixels_default = `
-- Playground driver: evaluate the actual Lean function at every pixel.
#eval do
  let rows := (List.range 100).map fun row =>
    String.ofList ((List.range 100).map fun col =>
      if f (Int.ofNat (col + 1)) (Int.ofNat (row + 1)) then '1' else '0')
  IO.println ("PICO_PIXELS_BEGIN\\n" ++ String.intercalate "\\n" rows ++ "\\nPICO_PIXELS_END")
`;

// playgrounds/lean/lean.generated.tsx
import { Fragment, jsx, jsxs } from "../libs/react.js";
function leanEditorDiagnostics(source, diagnostics) {
  const lines = source.split("\n");
  let start = 0;
  const starts = lines.map((line) => {
    const offset2 = start;
    start += line.length + 1;
    return offset2;
  });
  const offset = (line, column) => {
    if (line == null || !Number.isInteger(line) || line < 1 || line > lines.length) return null;
    const characters = [...lines[line - 1]];
    const index = (column ?? 1) - 1;
    if (!Number.isInteger(index) || index < 0 || index > characters.length) return null;
    return starts[line - 1] + characters.slice(0, index).join("").length;
  };
  return diagnostics.flatMap((item) => {
    if (item.severity === "information" || item.file && item.file !== "/workspace/input.lean" && item.file !== "input.lean") return [];
    const from = offset(item.line, item.column);
    if (from === null) return [];
    const to = offset(item.endLine, item.endColumn) ?? from;
    return [{ from, to: Math.max(from, to), severity: item.severity, message: item.message }];
  });
}
var keywords = new Set("import open namespace end section variable def abbrev theorem lemma example axiom opaque inductive structure class instance where deriving private protected noncomputable unsafe partial mutual let in fun match with if then else do return for while by have show exact apply intro intros constructor cases induction simp simpa rw rfl decide omega aesop assumption contradiction calc unfold set_option true false".split(" "));
function token(stream, state) {
  if (state.commentDepth) {
    while (!stream.eol()) {
      if (stream.match("/-")) state.commentDepth++;
      else if (stream.match("-/")) {
        if (--state.commentDepth === 0) break;
      } else stream.next();
    }
    return "comment";
  }
  if (state.string) {
    while (!stream.eol()) {
      const next = stream.next();
      if (next === "\\") stream.next();
      else if (next === '"') {
        state.string = false;
        break;
      }
    }
    return "string";
  }
  if (stream.eatSpace()) return null;
  if (stream.match("--")) {
    stream.skipToEnd();
    return "comment";
  }
  if (stream.match("/-")) {
    state.commentDepth = 1;
    return token(stream, state);
  }
  if (stream.match('"')) {
    state.string = true;
    return token(stream, state);
  }
  if (stream.match(/\d[\w]*/)) return "number";
  if (stream.match(/#[\w]+/)) return "keyword";
  if (stream.match(/[\p{L}_][\p{L}\p{N}_'!]*/u)) return keywords.has(stream.current()) ? "keyword" : "variableName";
  stream.next();
  return null;
}
var symbols = { "\\forall": "\u2200", "\\exists": "\u2203", "\\to": "\u2192", "\\and": "\u2227", "\\or": "\u2228", "\\not": "\xAC", "\\le": "\u2264", "\\ge": "\u2265", "\\ne": "\u2260", "\\iff": "\u2194", "\\lambda": "\u03BB", "\\Z": "\u2124", "\\N": "\u2115" };
var leanEditor = {
  indent: "  ",
  extensions: [
    StreamLanguage.define({
      startState: () => ({ commentDepth: 0, string: false }),
      token,
      languageData: { commentTokens: { line: "--", block: { open: "/-", close: "-/" } } }
    }),
    autocompletion({ override: [(context) => {
      const match = context.matchBefore(/\\[A-Za-z]*/);
      return match && { from: match.from, options: Object.entries(symbols).map(([label, apply]) => ({ label, apply, detail: apply, type: "text" })) };
    }] })
  ]
};
var pixelgrid = stateful("pixelgrid", createPixelGrid, [
  on("pixelgrid.render", renderPixelGrid, []),
  event("pixelgrid.render", {})
], pixelGridElement);
var grids = /* @__PURE__ */ new WeakMap();
function createPixelGrid(_options, lifecycle) {
  const grid = { image: null };
  const state = { get image() {
    return grid.image;
  } };
  grids.set(state, grid);
  lifecycle.onDispose(() => {
    grid.element?.remove();
    grids.delete(state);
  });
  return state;
}
function renderPixelGrid(state, { image }) {
  if (image && (!Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width < 1 || image.height < 1 || image.width * image.height > 1e6 || image.pixels.length !== image.width * image.height || /[^01]/.test(image.pixels))) {
    throw new Error("Invalid pixel grid");
  }
  const grid = grids.get(state);
  grid.image = image && Object.freeze({ ...image });
  paint(grid);
}
function pixelGridElement(state) {
  const grid = grids.get(state);
  if (!grid.element) {
    grid.element = document.createElement("div");
    grid.element.style.cssText = "display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-width:0;min-height:0;padding:16px;box-sizing:border-box;overflow:hidden";
    grid.canvas = document.createElement("canvas");
    grid.canvas.style.cssText = "width:100%;height:100%;min-width:0;min-height:0;object-fit:contain;image-rendering:pixelated";
    grid.canvas.setAttribute("role", "img");
    grid.element.append(grid.canvas);
    paint(grid);
  }
  return grid.element;
}
function paint({ canvas, image }) {
  if (!canvas) return;
  canvas.hidden = image === null;
  if (!image) return;
  const cell = 6;
  canvas.width = image.width * cell + 1;
  canvas.height = image.height * cell + 1;
  canvas.setAttribute("aria-label", `${image.width} \xD7 ${image.height} \u9ED1\u767D\u50CF\u7D20\u753B\uFF0C\u5DE6\u4E0A\u89D2\u4E3A (1, 1)`);
  const context = canvas.getContext("2d");
  if (!context) return;
  const bitmap = context.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const border = x % cell === 0 || y % cell === 0;
      const pixel = image.pixels[Math.floor(y / cell) * image.width + Math.floor(x / cell)];
      const shade = border ? 180 : pixel === "1" ? 0 : 255;
      bitmap.data.set([shade, shade, shade, 255], (y * canvas.width + x) * 4);
    }
  }
  context.putImageData(bitmap, 0, 0);
}
function pixelImage(result) {
  if (result.exitCode !== 0) return null;
  const match = result.stdout.match(/^PICO_PIXELS_BEGIN\n([01\n]+)\nPICO_PIXELS_END$/m);
  if (!match) return null;
  const rows = match[1].split("\n");
  if (rows.length !== 100 || rows.some((row) => row.length !== 100)) return null;
  return { width: 100, height: 100, pixels: rows.join("") };
}
var leanPicture = stateful("leanPicture", (source) => ({ source, message: null }), [
  on("editor.changed", (state, event2, { emit }) => {
    state.source = event2.source;
    emit({ type: "lean.clear" });
  }, ["lean.clear"]),
  on("lean.run", (state, _event, { emit }) => {
    emit({ type: "lean.execute", source: state.source + "\n" + pixels_default });
  }, ["lean.execute"]),
  on("lean.changed", receiveResult, ["pixelgrid.render", "editor.diagnostics"])
]);
function receiveResult(state, event2, { emit }) {
  if (event2.source !== null && event2.source !== state.source + "\n" + pixels_default) return;
  const result = event2.result.status === "ready" ? event2.result.value : null;
  emit({
    type: "editor.diagnostics",
    source: state.source,
    diagnostics: result ? leanEditorDiagnostics(state.source, result.diagnostics) : []
  });
  const image = result && pixelImage(result);
  state.message = result?.exitCode === 0 && !image ? "\u6CA1\u6709\u751F\u6210\u50CF\u7D20\u3002\u8BF7\u5B9A\u4E49 f (x y : Int) : Bool\u3002" : null;
  emit({ type: "pixelgrid.render", image });
}
var layout = { ratio: 0.56, open: ["pixels", "output"], sizes: { pixels: 2, output: 1 } };
var commands = { run: { type: "lean.run" }, reset: { type: "lean.reset" }, clear: { type: "lean.clear" } };
function assemble({ bus, own, observe }) {
  const execution = own(lean.create(bus));
  const pixels = own(pixelgrid.create(bus));
  observe("lean", () => ({ ...execution.state }), ["lean.changed"]);
  observe("pixels", () => ({ ...pixels.state }), ["pixelgrid.render"]);
  return { lean: execution.state, pixels };
}
function resultText(result) {
  const output = result.stdout.replace(/^PICO_PIXELS_BEGIN\n[01\n]+\nPICO_PIXELS_END\n?/m, "").trim();
  const problems = result.diagnostics.filter((item) => item.severity !== "information").map((item) => `${item.line ? `${item.line}:${item.column ?? 1} ` : ""}${item.severity}: ${item.message}`);
  return [output, ...problems, result.stderr].filter(Boolean).join("\n\n");
}
var stages = [
  ["library", "\u52A0\u8F7D\u6807\u51C6\u5E93"],
  ["runtime", "\u52A0\u8F7D Lean \u8FD0\u884C\u65F6"],
  ["compile", "\u7F16\u8BD1 WebAssembly"],
  ["initialize", "\u521D\u59CB\u5316 Lean"],
  ["check", "\u68C0\u67E5\u5B9A\u4E49\u3001\u8BC1\u660E\u5E76\u751F\u6210\u50CF\u7D20"]
];
function LeanStatus({ state }) {
  const { result, progress } = state;
  const running = result.status === "pending";
  const checked = result.status === "ready" ? result.value : null;
  const warnings = checked?.diagnostics.some((item) => item.severity === "warning");
  const passed = checked?.exitCode === 0 && !warnings;
  const current = Math.max(0, stages.findIndex(([phase]) => phase === progress?.phase));
  const amount = progress?.completed === void 0 ? "" : progress.unit === "bytes" ? `${(progress.completed / 1048576).toFixed(1)}${progress.total === void 0 ? "" : ` / ${(progress.total / 1048576).toFixed(1)}`} MiB` : `${progress.completed}${progress.total === void 0 ? "" : ` / ${progress.total}`} \u4E2A\u6587\u4EF6`;
  return /* @__PURE__ */ jsx("div", { style: { marginBottom: 12 }, children: running ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("p", { role: "status", style: { marginBottom: 8 }, children: [
      stages[current][1],
      amount && /* @__PURE__ */ jsx("small", { style: { marginLeft: 12 }, children: amount })
    ] }),
    /* @__PURE__ */ jsx(
      "progress",
      {
        "aria-label": stages[current][1],
        max: progress?.total ?? 1,
        value: progress?.total ? progress.completed : void 0,
        style: { width: "100%", height: 6 }
      }
    )
  ] }) : passed ? /* @__PURE__ */ jsx("div", { role: "status", style: { display: "flex", alignItems: "center", gap: 16 }, children: /* @__PURE__ */ jsx("svg", { role: "img", "aria-label": "\u68C0\u67E5\u901A\u8FC7", viewBox: "0 0 64 64", width: "80", height: "80", style: { flexShrink: 0, color: "#16a34a" }, children: /* @__PURE__ */ jsx("path", { d: "M12 33 26 47 53 17", fill: "none", stroke: "currentColor", strokeWidth: "7", strokeLinecap: "round", strokeLinejoin: "round" }) }) }) : /* @__PURE__ */ jsx("p", { role: "status", children: result.status === "failed" ? String(result.error instanceof Error ? result.error.message : result.error) : checked ? checked.exitCode !== 0 ? "Lean \u68C0\u67E5\u5931\u8D25" : "\u68C0\u67E5\u5B8C\u6210\uFF0C\u6709\u8B66\u544A\uFF08\u53EF\u80FD\u5305\u542B\u672A\u5B8C\u6210\u7684\u8BC1\u660E\uFF09" : "\u70B9\u51FB\u201C\u68C0\u67E5\u5E76\u7ED8\u56FE\u201D\uFF0C\u8FD0\u884C Lean \u5B9A\u4E49\u548C\u8BC1\u660E\u3002" }) });
}
var starter = sierpinski_default;
function Root(host = {}) {
  const app = usePlayground(leanPicture, host.source ?? sierpinski_default, { filename: "sierpinski.lean", layout, commands, assemble, editor: leanEditor, ...host.options });
  if (!app) return null;
  const result = app.parts.lean.result;
  const running = result.status === "pending";
  const checked = result.status === "ready" && result.value;
  return /* @__PURE__ */ jsx(
    PlaygroundShell,
    {
      name: "Lean \xB7 \u53EF\u4EE5\u8BC1\u660E\u7684\u50CF\u7D20\u753B",
      layout: app.layout,
      onEvent: app.send,
      menu: app.menu,
      toolbar: [...app.toolbar, { controls: [
        { kind: "button", icon: "play", label: running ? "\u6B63\u5728\u68C0\u67E5" : "\u68C0\u67E5\u5E76\u7ED8\u56FE", disabled: running, event: { type: "lean.run" } },
        ...running ? [{ kind: "button", icon: "close", label: "\u53D6\u6D88", event: { type: "lean.clear" } }] : []
      ] }],
      editor: /* @__PURE__ */ jsx(Widget, { widget: app.editor }),
      panels: [
        { key: "pixels", title: "", flush: true, content: /* @__PURE__ */ jsx(Widget, { widget: app.parts.pixels }) },
        { key: "output", title: "Lean \u68C0\u67E5\u4E0E\u8F93\u51FA", content: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(LeanStatus, { state: app.parts.lean }),
          app.state.message && /* @__PURE__ */ jsx("p", { children: app.state.message }),
          /* @__PURE__ */ jsx("pre", { style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 13 }, children: checked ? resultText(checked) : "" })
        ] }) }
      ]
    }
  );
}
export {
  pixels_default as DRIVER,
  LeanStatus,
  Root,
  sierpinski_default as STARTER,
  leanEditorDiagnostics,
  leanPicture,
  pixelImage,
  pixelgrid,
  starter
};
