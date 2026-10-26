// playgrounds/data-structures/data-structures.generated.tsx
import { useId, useLayoutEffect, useRef, useState } from "../libs/react.js";
import { on, stateful } from "../pico.js";
import { python as python3 } from "../pico.js";
import { playback as playback2 } from "../pico.js";
import { PlaygroundShell, Widget } from "../pico.js";
import { usePlayground } from "../pico.js";
import { Source } from "../pico.js";

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

// playgrounds/data-structures/data-structures.generated.tsx
import { Fragment, jsx, jsxs } from "../libs/react.js";
var RESOURCE = "object-graph";
var CASES = [
  {
    id: "collections",
    label: "List / Dict / Set",
    source: `numbers = [2, 4]
alias = numbers
profile = {"name": "Ada", "scores": numbers}
tags = {"python", "trace"}

numbers.append(8)
profile["active"] = True
tags.add("debugger")
`
  },
  {
    id: "linked-list",
    label: "\u94FE\u8868\u589E\u5220\u6539 / \u53CD\u8F6C",
    source: `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

head = Node(1, Node(2, Node(3)))
head.next = Node(9, head.next)
head.next.next.value = 20
head.next = head.next.next

previous = None
current = head

while current is not None:
    next_node = current.next
    current.next = previous
    previous = current
    current = next_node

head = previous
`
  },
  {
    id: "tree",
    label: "\u4E8C\u53C9\u6811",
    source: `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

root = TreeNode(8, TreeNode(4), TreeNode(12))
root.left.left = TreeNode(2)
root.left.right = TreeNode(6)
root.right.value = 14
root.left.left = None
`
  },
  {
    id: "graph",
    label: "\u56FE",
    source: `class Vertex:
    def __init__(self, name):
        self.name = name
        self.edges = []

def connect(a, b):
    a.edges.append(b)
    b.edges.append(a)

a, b, c, d = Vertex("A"), Vertex("B"), Vertex("C"), Vertex("D")
connect(a, b)
connect(b, c)
connect(c, d)
connect(d, a)
b.edges.remove(c)
c.edges.remove(b)
`
  },
  {
    id: "objects",
    label: "\u5BF9\u8C61\u4E0E\u522B\u540D",
    source: `class Student:
    def __init__(self, name):
        self.name = name
        self.skills = []

class Team:
    def __init__(self, name, members):
        self.name = name
        self.members = members
        self.leader = members[0]

ada = Student("Ada")
linus = Student("Linus")
team = Team("Runtime", [ada, linus])
ada.skills.append("Python")
team.leader = linus
`
  }
];
var STARTER = CASES[0].source;
var SNAPSHOT_PRELUDE = `def __make_object_graph_snapshot():
    import sys
    import _pico_runtime as runtime
    log = []
    runtime.register_trace_resource("${RESOURCE}", log)
    object_ids = {}
    next_object_id = [1]

    def stable_id(value):
        address = id(value)
        if address not in object_ids:
            object_id = "o" + str(next_object_id[0])
            object_ids[address] = (object_id, value)
            next_object_id[0] += 1
        return object_ids[address][0]

    def scalar(value):
        if value is None: return {"kind": "scalar", "type": "None", "value": None}
        if isinstance(value, bool): return {"kind": "scalar", "type": "bool", "value": value}
        if isinstance(value, int): return {"kind": "scalar", "type": "int", "value": value}
        if isinstance(value, float): return {"kind": "scalar", "type": "float", "value": value}
        if isinstance(value, str): return {"kind": "scalar", "type": "str", "value": value}
        return None

    def snapshot():
        nodes = []
        seen = set()

        def encode(value):
            primitive = scalar(value)
            if primitive is not None: return primitive
            object_id = stable_id(value)
            if object_id in seen: return {"kind": "ref", "id": object_id}
            seen.add(object_id)
            node = {"id": object_id, "kind": "object", "type": type(value).__name__, "fields": []}
            nodes.append(node)
            if isinstance(value, list) or isinstance(value, tuple):
                node["kind"] = "list" if isinstance(value, list) else "tuple"
                node["items"] = [encode(item) for item in value]
                del node["fields"]
            elif isinstance(value, set):
                node["kind"] = "set"
                node["items"] = [encode(item) for item in sorted(value, key=repr)]
                del node["fields"]
            elif isinstance(value, dict):
                node["kind"] = "dict"
                node["entries"] = [{"key": encode(key), "value": encode(item)} for key, item in value.items()]
                del node["fields"]
            elif hasattr(value, "__dict__"):
                node["fields"] = [{"name": name, "value": encode(item)} for name, item in vars(value).items()]
            else:
                node["kind"] = "opaque"
                node["value"] = repr(value)
                del node["fields"]
            return {"kind": "ref", "id": object_id}

        frame = sys._getframe(1)
        encoded_roots = []
        for name, value in list(frame.f_globals.items()):
            if name.startswith("_"):
                continue
            if isinstance(value, type) or callable(value) or value.__class__.__module__ in ("builtins", "importlib"):
                if not isinstance(value, (list, dict, set, tuple, str, int, float, bool)):
                    continue
            encoded_roots.append({"name": name, "value": encode(value)})
        log.append({"line": frame.f_lineno, "roots": encoded_roots, "nodes": nodes})

    return snapshot

__pico_snapshot = __make_object_graph_snapshot()
del __make_object_graph_snapshot
`;
var BLOCK_HEADER = /^(def |class |@|if |elif |else\s*:|while |for |with |try\s*:|except|finally\s*:)/;
var SKIP_STATEMENT = /^(return|break|continue|pass)\b/;
function instrumentSource(source) {
  let insideDefinition = false;
  return source.split("\n").map((line) => {
    const trimmed = line.trim();
    const indent = line.length - line.trimStart().length;
    if (trimmed === "" || trimmed.startsWith("#")) return line;
    if (indent === 0) insideDefinition = /^(def |class |@)/.test(trimmed);
    else if (insideDefinition) return line;
    if (BLOCK_HEADER.test(trimmed) || SKIP_STATEMENT.test(trimmed)) return line;
    if (trimmed.includes("__pico_snapshot")) return line;
    return `${line}; __pico_snapshot()`;
  }).join("\n");
}
var dataStructures = stateful("data-structures", (source) => ({ source, caseId: "collections" }), [
  on("editor.changed", (state, event, { emit }) => {
    if (state.source === event.source) return;
    state.source = event.source;
    const preset = CASES.find((item) => item.source === event.source);
    if (preset !== void 0) state.caseId = preset.id;
    emit({ type: "python.clear" });
  }),
  on("data-structures.case.changed", (state, event, { emit }) => {
    const selected = CASES.find((item) => item.id === event.caseId);
    if (selected === void 0 || selected.id === state.caseId) return;
    state.caseId = selected.id;
    state.source = selected.source;
    emit({ type: "python.clear" });
  }),
  on("python.run", (state, _event, { emit }) => {
    const definition = CASES.find((item) => item.id === state.caseId) ?? CASES[0];
    emit({ type: "python.execute", source: new Source(instrumentSource(state.source), { prelude: SNAPSHOT_PRELUDE }), options: {
      trace: { events: ["call", "stmt", "return"], observe: { globals: true, locals: true } },
      timeoutMs: 5e3,
      maxTraceSteps: 1e4
    } });
  }),
  // 变量栏的放大入口就是结构图的入口：Debug 卡片始终留着，结构卡片可能被学生收起来。
  on("debugger.variables.expand", (_state, _event, { emit }) => {
    emit({ type: "layout.change", value: { open: [...PANELS] } });
  })
]);
function createCase(caseId) {
  return (bus) => {
    const selected = CASES.find((item) => item.id === caseId);
    const course = dataStructures.create(selected.source, bus);
    if (caseId !== "collections") course.receive({ type: "data-structures.case.changed", caseId });
    const player = playback2.create({}, bus);
    const execution = python3.create({}, bus);
    return () => {
      execution.dispose();
      player.dispose();
      course.dispose();
    };
  };
}
var examples = Object.fromEntries(CASES.map((item) => [item.id, {
  create: createCase(item.id),
  events: [{ type: "python.run" }]
}]));
function record(value) {
  return value !== null && value !== void 0 && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function encoded(value) {
  const item = record(value);
  if (item?.kind === "ref" && typeof item.id === "string") return { kind: "ref", id: item.id };
  if (item?.kind === "scalar" && typeof item.type === "string") return { kind: "scalar", type: item.type, value: item.value ?? null };
  return null;
}
function snapshotOf(value) {
  const item = record(value);
  if (item === null || typeof item.line !== "number" || !Array.isArray(item.roots) || !Array.isArray(item.nodes)) return null;
  const roots = item.roots.flatMap((rootValue) => {
    const root = record(rootValue);
    const value2 = encoded(root?.value);
    return typeof root?.name === "string" && value2 !== null ? [{ name: root.name, value: value2 }] : [];
  });
  const nodes = item.nodes.flatMap((nodeValue) => {
    const node = record(nodeValue);
    if (node === null || typeof node.id !== "string" || typeof node.kind !== "string" || typeof node.type !== "string") return [];
    const fields = Array.isArray(node.fields) ? node.fields.flatMap((fieldValue) => {
      const field2 = record(fieldValue);
      const value2 = encoded(field2?.value);
      return typeof field2?.name === "string" && value2 !== null ? [{ name: field2.name, value: value2 }] : [];
    }) : void 0;
    const entries = Array.isArray(node.entries) ? node.entries.flatMap((entryValue) => {
      const entry = record(entryValue);
      const key = encoded(entry?.key);
      const value2 = encoded(entry?.value);
      return key !== null && value2 !== null ? [{ key, value: value2 }] : [];
    }) : void 0;
    const items = Array.isArray(node.items) ? node.items.flatMap((itemValue) => {
      const item2 = encoded(itemValue);
      return item2 === null ? [] : [item2];
    }) : void 0;
    return [{
      id: node.id,
      kind: node.kind,
      type: node.type,
      fields,
      entries,
      items,
      value: typeof node.value === "string" ? node.value : void 0
    }];
  });
  return { line: item.line, roots, nodes };
}
function snapshotStepAt(trace, position) {
  if (trace === null || position === null) return { current: null, previous: null, first: null, ordinal: 0, total: 0 };
  const log = trace.resources[RESOURCE] ?? [];
  const ordinal = position.state.resources?.[RESOURCE] ?? 0;
  return {
    current: snapshotOf(ordinal > 0 ? log[ordinal - 1] : void 0),
    previous: snapshotOf(ordinal > 1 ? log[ordinal - 2] : void 0),
    first: snapshotOf(log[0]),
    ordinal,
    total: log.length
  };
}
function snapshotAt(trace, position) {
  const { current, previous } = snapshotStepAt(trace, position);
  return { current, previous };
}
function scalarText(value) {
  if (value.type === "str") return JSON.stringify(value.value);
  if (value.type === "None") return "None";
  if (value.type === "bool") return value.value ? "True" : "False";
  return String(value.value);
}
function encodedEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function diffSnapshots(current, previous) {
  const currentNodes = new Map(current.nodes.map((node) => [node.id, node]));
  const previousNodes = new Map((previous?.nodes ?? []).map((node) => [node.id, node]));
  const added = new Set([...currentNodes.keys()].filter((id) => !previousNodes.has(id)));
  const removed = new Set([...previousNodes.keys()].filter((id) => !currentNodes.has(id)));
  const changes = [];
  for (const [id, node] of currentNodes) {
    const before = previousNodes.get(id);
    if (before === void 0) continue;
    const currentSlots = new Map(boxSlots(node).map((slot) => [slot.key, slot.value]));
    const previousSlots = new Map(boxSlots(before).map((slot) => [slot.key, slot.value]));
    for (const slot of /* @__PURE__ */ new Set([...currentSlots.keys(), ...previousSlots.keys()])) {
      const oldValue = previousSlots.get(slot);
      const value = currentSlots.get(slot);
      if (!encodedEqual(oldValue, value)) changes.push({ ownerId: id, slot, before: oldValue, after: value });
    }
  }
  return { added, removed, changes };
}
function nodeMap(snapshot) {
  return new Map(snapshot.nodes.map((node) => [node.id, node]));
}
function field(node, name) {
  return node?.fields?.find((item) => item.name === name)?.value ?? null;
}
function refId(value) {
  return value?.kind === "ref" ? value.id : null;
}
function scalarField(node, name) {
  const value = field(node, name);
  return value?.kind === "scalar" ? scalarText(value) : null;
}
function rootRef(snapshot, name) {
  return refId(snapshot.roots.find((root) => root.name === name)?.value);
}
var TEXT = { title: 12, label: 13, value: 15, node: 20, ghost: 13, min: 12.5 };
var CHAR = 0.62;
var BOX = { padX: 13, padTop: 8, padBottom: 9, header: 18, row: 26, gap: 26 };
var COLUMN = { left: 20, nameGap: 18, run: 74, top: 24, nameStep: 26 };
var LIST = { left: 40, width: 92, height: 64, step: 132, chipWidth: 56, chipHeight: 32, top: 104, pointer: 34 };
var TREE = { radius: 27, level: 96, leaf: 104, top: 52 };
var CYCLE = { radius: 28, centerY: 156, ring: 124, nameGap: 62 };
var angleAt = (index, count) => -Math.PI / 2 + (count < 2 ? 0 : index * Math.PI * 2 / count);
var INLINE_LIMIT = 30;
var MAX_SCALE = 1.5;
var NO_CHANGE = { added: /* @__PURE__ */ new Set(), removed: /* @__PURE__ */ new Set(), changes: [] };
var textWidth = (text, px) => [...text].length * px * CHAR;
var center = (rect) => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
function border(rect, from) {
  const dx = center(rect).x - from.x;
  const dy = center(rect).y - from.y;
  const t = Math.max(0, 1 - Math.min((rect.width / 2 + 1) / Math.max(1e-3, Math.abs(dx)), (rect.height / 2 + 1) / Math.max(1e-3, Math.abs(dy))));
  return { x: from.x + dx * t, y: from.y + dy * t };
}
function exit(from, to, halfWidth, halfHeight) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const t = Math.min(halfWidth / Math.max(1e-3, Math.abs(dx)), halfHeight / Math.max(1e-3, Math.abs(dy)));
  return { x: from.x + dx * t, y: from.y + dy * t };
}
function arrow(from, to, id, tone) {
  return { id, from: border(from, center(to)), to: border(to, center(from)), tone };
}
function changeFor(diff, id, slot) {
  return diff.changes.find((change) => change.ownerId === id && change.slot === slot);
}
function reachableObjects(snapshot) {
  const nodes = nodeMap(snapshot);
  const order = [];
  const visit = (id) => {
    if (id === null || order.includes(id) || !nodes.has(id)) return;
    order.push(id);
    const node = nodes.get(id);
    for (const value of [...(node.fields ?? []).map((item) => item.value), ...(node.entries ?? []).map((entry) => entry.value), ...node.items ?? []]) visit(refId(value));
  };
  for (const root of snapshot.roots) visit(refId(root.value));
  return order;
}
function memberKey(value) {
  return value.kind === "scalar" ? `${value.type}:${scalarText(value)}` : value.id;
}
function boxSlots(node) {
  if (node.entries !== void 0) return node.entries.map((entry, index) => ({
    key: `entry:${index}:${memberKey(entry.key)}`,
    label: entry.key.kind === "scalar" ? scalarText(entry.key) : null,
    value: entry.value
  }));
  if (node.items !== void 0) return node.items.map((item, index) => ({
    key: node.kind === "set" ? `member:${memberKey(item)}` : `[${index}]`,
    label: node.kind === "set" ? null : `[${index}]`,
    value: item
  }));
  return (node.fields ?? []).map((item) => ({ key: item.name, label: item.name, value: item.value }));
}
var slotText = (value) => value?.kind === "scalar" ? scalarText(value) : null;
function inlineText(node) {
  if (node.entries !== void 0 || node.items === void 0) return null;
  const slots = boxSlots(node);
  if (!slots.every((slot) => slot.value.kind === "scalar")) return null;
  const body = slots.map((slot) => scalarText(slot.value)).join(", ");
  const bracket = node.kind === "tuple" ? "()" : node.kind === "set" ? "{}" : "[]";
  const text = `${bracket[0]}${body}${node.kind === "tuple" && slots.length === 1 ? "," : ""}${bracket[1]}`;
  return [...text].length <= INLINE_LIMIT ? text : null;
}
function ghostsOf(node, before) {
  const ghosts = /* @__PURE__ */ new Map();
  if (before === void 0) return ghosts;
  const previous = new Map(boxSlots(before).map((slot) => [slot.key, slot.value]));
  for (const slot of boxSlots(node)) {
    const old = previous.get(slot.key);
    if (slot.value.kind === "scalar" && old?.kind === "scalar" && scalarText(old) !== scalarText(slot.value)) ghosts.set(slot.key, scalarText(old));
  }
  return ghosts;
}
function boxContent(node, before) {
  const ghosts = ghostsOf(node, before);
  const inline = inlineText(node);
  if (inline !== null) return { inline, rows: [] };
  return { inline: null, rows: boxSlots(node).map((slot) => ({
    label: slot.label,
    value: slotText(slot.value),
    ghost: ghosts.get(slot.key) ?? null,
    target: refId(slot.value)
  })) };
}
function boxSize(content, title, forced) {
  const labelColumn = Math.max(0, ...content.rows.map((row) => row.label === null ? 0 : textWidth(row.label, TEXT.label) + 18));
  let width = title === null ? 0 : textWidth(title, TEXT.title);
  if (content.inline !== null) width = Math.max(width, textWidth(content.inline, title === null ? TEXT.node : TEXT.value));
  for (const row of content.rows) {
    const offset = row.label === null ? 0 : labelColumn;
    const value = row.value === null ? 24 : textWidth(row.value, TEXT.value) + (row.ghost === null ? 0 : textWidth(row.ghost, TEXT.ghost) + 16);
    width = Math.max(width, offset + value);
  }
  const line = title === null ? TEXT.node + 6 : 20;
  const rows = content.inline !== null ? 1 : content.rows.length;
  const height = title === null ? line + 8 : BOX.padTop + BOX.header + rows * BOX.row + BOX.padBottom;
  return { x: 0, y: 0, width: forced?.width ?? Math.max(92, width + BOX.padX * 2), height: forced?.height ?? height };
}
function place(id, content, title, added, x, y, options = {}) {
  const size = boxSize(content, title, options.size);
  const inlinePx = title === null ? TEXT.node : TEXT.value;
  const top = title === null ? size.height / 2 + inlinePx * 0.35 : BOX.padTop + BOX.header + 18;
  const valueColumn = Math.max(0, ...content.rows.map((row) => row.label === null ? 0 : textWidth(row.label, TEXT.label) + 18));
  return {
    id,
    x,
    y,
    width: size.width,
    height: size.height,
    title,
    inline: content.inline,
    inlinePx,
    baseline: y + top,
    rows: content.rows.map((row, index) => ({ ...row, anchor: {
      x: x + BOX.padX + (row.label === null ? 0 : valueColumn),
      y: y + BOX.padTop + BOX.header + BOX.row * index + BOX.row / 2
    } })),
    ghost: options.ghost ?? null,
    added,
    muted: options.muted === true,
    rx: options.rx ?? 8
  };
}
function nameColumn(snapshot) {
  return Math.max(TEXT.value * 4, ...snapshot.roots.map((root) => textWidth(root.name, TEXT.value)));
}
function spaced(names, step) {
  const y = /* @__PURE__ */ new Map();
  let previous = -Infinity;
  for (const index of names.map((_, order) => order).sort((left, right) => names[left].y - names[right].y)) {
    previous = Math.max(names[index].y, previous + step);
    y.set(index, previous);
  }
  return names.map((name, index) => ({ ...name, y: y.get(index) }));
}
function variableNames(snapshot, boxes, right, focus) {
  const counts = /* @__PURE__ */ new Map();
  const totals = /* @__PURE__ */ new Map();
  for (const root of snapshot.roots) {
    const target = refId(root.value);
    if (target !== null && boxes.some((box) => box.id === target)) totals.set(target, (totals.get(target) ?? 0) + 1);
  }
  const names = [];
  let loose = COLUMN.top + 14;
  for (const root of snapshot.roots) {
    const target = refId(root.value);
    const box = target === null ? void 0 : boxes.find((item) => item.id === target);
    const value = box === void 0 ? slotText(root.value) : null;
    const spread = box === void 0 ? 0 : ((counts.get(box.id) ?? 0) - ((totals.get(box.id) ?? 1) - 1) / 2) * COLUMN.nameStep;
    if (box !== void 0) counts.set(box.id, (counts.get(box.id) ?? 0) + 1);
    if (box === void 0) loose += COLUMN.nameStep;
    names.push({
      name: root.name,
      value,
      target: target ?? null,
      x: right,
      y: box === void 0 ? loose : center(box).y + spread,
      anchor: "end",
      focused: root.name === focus
    });
  }
  return spaced(names, COLUMN.nameStep);
}
function pointerNames(snapshot, boxes, focus) {
  const rects = new Map(boxes.map((box) => [box.id, box]));
  const anchored = snapshot.roots.flatMap((root, index) => {
    const rect = refId(root.value) === null ? void 0 : rects.get(refId(root.value));
    return rect === void 0 ? [] : [{ root, index, target: rect.id, x: center(rect).x }];
  }).sort((left, right) => left.x - right.x || left.index - right.index);
  const loose = snapshot.roots.filter((root) => !rects.has(refId(root.value) ?? ""));
  const span = boxes.length > 1 ? center(boxes[boxes.length - 1]).x - center(boxes[0]).x : 0;
  const names = anchored.map((item, index) => ({
    name: item.root.name,
    value: null,
    target: item.target,
    anchor: "middle",
    x: anchored.length === 1 ? item.x : boxes[0].x + span * (index + 0.5) / anchored.length,
    y: LIST.pointer,
    focused: item.root.name === focus
  }));
  let row = LIST.pointer - COLUMN.nameStep;
  for (const root of loose) {
    names.push({ name: root.name, value: slotText(root.value), target: null, anchor: "start", x: COLUMN.left, y: row, focused: root.name === focus });
    row -= COLUMN.nameStep;
  }
  return names;
}
function pointerEdges(names, rects) {
  return names.flatMap((name) => {
    const rect = name.target === null ? void 0 : rects.get(name.target);
    if (rect === void 0) return [];
    const from = name.anchor === "middle" ? exit({ x: name.x, y: name.y }, center(rect), textWidth(name.name, TEXT.value) / 2 + 5, TEXT.value * 0.6) : { x: name.x + COLUMN.nameGap, y: name.y };
    return [{ id: `pointer:${name.name}`, from, to: border(rect, from), tone: name.focused ? "focus" : "plain" }];
  });
}
function fieldEdges(box, rects) {
  return box.rows.flatMap((row) => {
    const rect = row.target === null ? void 0 : rects.get(row.target);
    return rect === void 0 ? [] : [{ id: `field:${box.id}:${row.anchor.y}`, from: row.anchor, to: border(rect, row.anchor), tone: "plain" }];
  });
}
function bounds(boxes, names, edges) {
  const points = [
    ...names.flatMap((name) => {
      const text = textWidth(name.name, TEXT.value);
      const half = text / 2;
      return [
        { x: name.anchor === "end" ? name.x - text : name.anchor === "middle" ? name.x - half : name.x, y: name.y },
        { x: name.anchor === "start" ? name.x + text + (name.value === null ? 0 : 12 + textWidth(name.value, TEXT.value)) : name.x + half + (name.anchor === "end" && name.value !== null ? 12 + textWidth(name.value, TEXT.value) : 0), y: name.y }
      ];
    }),
    ...boxes.flatMap((box) => [{ x: box.x, y: box.y }, { x: box.x + box.width, y: box.y + box.height }]),
    ...edges.flatMap((edge) => [edge.from, edge.to])
  ];
  const ys = points.map((point) => point.y);
  const top = Math.min(0, ...ys) - 16;
  return {
    width: Math.max(300, ...points.map((point) => point.x)) + 16,
    top,
    height: Math.max(150, Math.max(0, ...ys)) - top
  };
}
var COLUMN_HEIGHT = 420;
function objectGraphModel(snapshot, previous, focus) {
  const nodes = nodeMap(snapshot);
  const before = previous === null ? void 0 : nodeMap(previous);
  const nameRight = COLUMN.left + nameColumn(snapshot);
  const boxX = nameRight + COLUMN.nameGap + COLUMN.run;
  const items = reachableObjects(snapshot).map((id) => {
    const node = nodes.get(id);
    const content = boxContent(node, before?.get(id));
    return { id, content, title: node.type, added: before?.has(id) === false, size: boxSize(content, node.type) };
  });
  const stack = items.reduce((sum, item) => sum + item.size.height + BOX.gap, 0) - BOX.gap;
  const rows = Math.max(1, Math.ceil(items.length / Math.max(1, Math.ceil(stack / COLUMN_HEIGHT))));
  const stride = Math.max(0, ...items.map((item) => item.size.width)) + COLUMN.run;
  const rowTop = [COLUMN.top];
  for (let row = 1; row < rows; row += 1) {
    const tallest = Math.max(...items.filter((_, index) => index % rows === row - 1).map((item) => item.size.height));
    rowTop[row] = rowTop[row - 1] + tallest + BOX.gap;
  }
  const boxes = items.map((item, index) => place(
    item.id,
    item.content,
    item.title,
    item.added,
    boxX + Math.floor(index / rows) * stride,
    rowTop[index % rows]
  ));
  const rects = new Map(boxes.map((box) => [box.id, box]));
  const names = variableNames(snapshot, boxes, nameRight, focus);
  const edges = [...pointerEdges(names, rects), ...boxes.flatMap((box) => fieldEdges(box, rects))];
  return { ...bounds(boxes, names, edges), names, boxes, edges };
}
var isChainNode = (node) => node?.fields?.some((item) => item.name === "next") === true;
var isTreeNode = (node) => node?.fields?.some((item) => item.name === "left") === true;
var isVertex = (node) => node.fields?.some((item) => item.name === "edges") === true;
function nextIsNone(node) {
  const value = field(node, "next");
  return value?.kind === "scalar" && value.type === "None";
}
function treePoints(snapshot, offset) {
  const nodes = nodeMap(snapshot);
  const points = /* @__PURE__ */ new Map();
  let leaves = 0;
  const visit = (id, depth) => {
    if (id === null || points.has(id)) return 0;
    const node = nodes.get(id);
    if (!isTreeNode(node)) return 0;
    const children = ["left", "right"].map((slot) => refId(field(node, slot))).filter((child) => child !== null);
    const placed = children.map((child) => visit(child, depth + 1)).filter((x2) => x2 > 0);
    const x = placed.length === 0 ? offset + (leaves += 1) * TREE.leaf : Math.min(...placed) / 2 + Math.max(...placed) / 2;
    points.set(id, { id, x, y: TREE.top + depth * TREE.level, depth });
    return x;
  };
  for (const root of snapshot.roots) visit(refId(root.value), 0);
  return [...points.values()];
}
function treeLayout(snapshot) {
  return treePoints(snapshot, 0);
}
function byCreation(ids) {
  return [...ids].sort((left, right) => Number(left.slice(1)) - Number(right.slice(1)));
}
function chainOrder(snapshot) {
  const nodes = nodeMap(snapshot);
  const chain = [];
  const seen = /* @__PURE__ */ new Set();
  let id = rootRef(snapshot, "head");
  while (id !== null && isChainNode(nodes.get(id)) && !seen.has(id)) {
    chain.push(id);
    seen.add(id);
    id = refId(field(nodes.get(id), "next"));
  }
  return [...chain, ...byCreation(reachableObjects(snapshot).filter((item) => isChainNode(nodes.get(item)) && !seen.has(item)))];
}
function linkedListModel(snapshot, previous, focus) {
  const nodes = nodeMap(snapshot);
  const before = previous === null ? void 0 : nodeMap(previous);
  const diff = previous === null ? NO_CHANGE : diffSnapshots(snapshot, previous);
  const slots = [];
  for (const id of chainOrder(snapshot)) {
    slots.push({ id, none: false });
    if (nextIsNone(nodes.get(id))) slots.push({ id, none: true });
  }
  const boxes = slots.map((slot, index) => slot.none ? place(
    `none:${slot.id}`,
    { inline: "None", rows: [] },
    null,
    false,
    LIST.left + index * LIST.step,
    LIST.top + (LIST.height - LIST.chipHeight) / 2,
    { muted: true, rx: LIST.chipHeight / 2, size: { width: LIST.chipWidth, height: LIST.chipHeight } }
  ) : place(
    slot.id,
    { inline: scalarField(nodes.get(slot.id), "value") ?? "?", rows: [] },
    null,
    before?.has(slot.id) === false,
    LIST.left + index * LIST.step,
    LIST.top,
    {
      rx: 12,
      size: { width: LIST.width, height: LIST.height },
      ghost: (() => {
        const change = changeFor(diff, slot.id, "value");
        return change?.before?.kind === "scalar" ? scalarText(change.before) : null;
      })()
    }
  ));
  const rects = new Map(boxes.map((box) => [box.id, box]));
  const noneOf = new Map(boxes.flatMap((box) => box.id.startsWith("none:") ? [[box.id.slice(5), box.id]] : []));
  const edges = [];
  for (const box of boxes) {
    const node = nodes.get(box.id);
    if (node === void 0) continue;
    const change = changeFor(diff, box.id, "next");
    const target = refId(field(node, "next")) ?? noneOf.get(box.id);
    const rect = target === void 0 ? void 0 : rects.get(target);
    if (rect !== void 0) edges.push(arrow(box, rect, `next:${box.id}`, change === void 0 ? "plain" : "new"));
    const retired = refId(change?.before);
    if (change !== void 0 && retired !== null && rects.has(retired)) edges.push(arrow(box, rects.get(retired), `next:${box.id}:old`, "retired"));
  }
  const names = pointerNames(snapshot, boxes, focus);
  const all = [...pointerEdges(names, rects), ...edges];
  const size = bounds(boxes, names, all);
  return { ...size, width: Math.max(size.width, LIST.left + (slots.length - 1) * LIST.step + LIST.width + 16), names, boxes, edges: all };
}
function treeModel(snapshot, previous, focus) {
  const nodes = nodeMap(snapshot);
  const before = previous === null ? void 0 : nodeMap(previous);
  const diff = previous === null ? NO_CHANGE : diffSnapshots(snapshot, previous);
  const points = treePoints(snapshot, COLUMN.left + 34);
  const boxes = points.map((point) => {
    const change = changeFor(diff, point.id, "value");
    return place(
      point.id,
      { inline: scalarField(nodes.get(point.id), "value") ?? "?", rows: [] },
      null,
      before?.has(point.id) === false,
      point.x - TREE.radius,
      point.y - TREE.radius,
      {
        rx: TREE.radius,
        size: { width: TREE.radius * 2, height: TREE.radius * 2 },
        ghost: change?.before?.kind === "scalar" ? scalarText(change.before) : null
      }
    );
  });
  const rects = new Map(boxes.map((box) => [box.id, box]));
  const edges = points.flatMap((point) => ["left", "right"].flatMap((slot) => {
    const childId = refId(field(nodes.get(point.id), slot));
    const child = childId === null ? void 0 : rects.get(childId);
    const parent = rects.get(point.id);
    if (child === void 0) return [];
    const change = changeFor(diff, point.id, slot);
    return [arrow(parent, child, `edge:${point.id}:${slot}`, change === void 0 ? "plain" : "new")];
  }));
  const names = nearbyNames(snapshot, boxes, COLUMN.left + nameColumn(snapshot), 84, focus);
  const all = [...pointerEdges(names, rects), ...edges];
  return { ...bounds(boxes, names, all), names, boxes, edges: all };
}
function nearbyNames(snapshot, boxes, floor, gap, focus) {
  const rects = new Map(boxes.map((box) => [box.id, box]));
  const names = snapshot.roots.flatMap((root) => {
    const rect = refId(root.value) === null ? void 0 : rects.get(refId(root.value));
    return rect === void 0 ? [] : [{
      name: root.name,
      value: null,
      target: rect.id,
      anchor: "end",
      x: Math.max(floor, center(rect).x - gap),
      y: center(rect).y,
      focused: root.name === focus
    }];
  });
  return spaced(names, COLUMN.nameStep);
}
function vertexPairs(snapshot) {
  const nodes = nodeMap(snapshot);
  const pairs = /* @__PURE__ */ new Map();
  for (const vertex of snapshot.nodes.filter(isVertex)) {
    const list = nodes.get(refId(field(vertex, "edges")) ?? "");
    for (const item of list?.items ?? []) {
      if (item.kind !== "ref") continue;
      const [from, to] = [vertex.id, item.id].sort();
      pairs.set(`${from}:${to}`, [from, to]);
    }
  }
  return [...pairs.values()];
}
function graphModel(snapshot, previous, focus) {
  const nodes = nodeMap(snapshot);
  const before = previous === null ? void 0 : nodeMap(previous);
  const vertices = byCreation(snapshot.nodes.filter(isVertex).map((node) => node.id)).map((id) => nodes.get(id));
  const centerX = COLUMN.left + nameColumn(snapshot) + COLUMN.nameGap + CYCLE.ring + CYCLE.nameGap;
  const boxes = vertices.map((vertex, index) => {
    const angle = angleAt(index, vertices.length);
    const x = centerX + Math.cos(angle) * CYCLE.ring;
    const y = CYCLE.centerY + Math.sin(angle) * CYCLE.ring;
    return place(
      vertex.id,
      { inline: (scalarField(vertex, "name") ?? "?").replaceAll('"', ""), rows: [] },
      null,
      before?.has(vertex.id) === false,
      x - CYCLE.radius,
      y - CYCLE.radius,
      { rx: CYCLE.radius, size: { width: CYCLE.radius * 2, height: CYCLE.radius * 2 } }
    );
  });
  const rects = new Map(boxes.map((box) => [box.id, box]));
  const pairs = vertexPairs(snapshot);
  const previousPairs = previous === null ? [] : vertexPairs(previous);
  const edges = pairs.flatMap(([from, to]) => {
    const a = rects.get(from);
    const b = rects.get(to);
    return a === void 0 || b === void 0 ? [] : [arrow(
      a,
      b,
      `edge:${from}:${to}`,
      previousPairs.some((pair) => pair[0] === from && pair[1] === to) ? "plain" : "new"
    )];
  });
  const retired = previousPairs.filter((pair) => !pairs.some((item) => item[0] === pair[0] && item[1] === pair[1])).flatMap(([from, to]) => {
    const a = rects.get(from);
    const b = rects.get(to);
    return a === void 0 || b === void 0 ? [] : [arrow(a, b, `edge:${from}:${to}:old`, "retired")];
  });
  const names = snapshot.roots.flatMap((root, index) => {
    const rect = refId(root.value) === null ? void 0 : rects.get(refId(root.value));
    if (rect === void 0) return [];
    const angle = angleAt(vertices.findIndex((vertex) => vertex.id === rect.id), vertices.length);
    return [{
      name: root.name,
      value: null,
      target: rect.id,
      anchor: "middle",
      x: centerX + Math.cos(angle) * (CYCLE.ring + CYCLE.nameGap),
      y: CYCLE.centerY + Math.sin(angle) * (CYCLE.ring + CYCLE.nameGap),
      focused: root.name === focus
    }];
  });
  const all = [...pointerEdges(names, rects), ...edges, ...retired];
  return { ...bounds(boxes, names, all), names, boxes, edges: all };
}
function structureModel(caseId, snapshot, previous, focus) {
  if (caseId === "linked-list") return linkedListModel(snapshot, previous, focus);
  if (caseId === "tree") return treeModel(snapshot, previous, focus);
  if (caseId === "graph") return graphModel(snapshot, previous, focus);
  return objectGraphModel(snapshot, previous, focus);
}
var MARKER = { viewBox: "0 0 10 10", refX: 9.2, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto" };
var TONES = ["plain", "new", "retired", "focus"];
function ArrowDefs({ id }) {
  return /* @__PURE__ */ jsx("defs", { children: TONES.map((tone) => /* @__PURE__ */ jsx("marker", { id: `${id}-${tone}`, ...MARKER, children: /* @__PURE__ */ jsx("path", { d: "M0.5 1.2 9.5 5 0.5 8.8Z", className: `pico-ds-head pico-ds-head--${tone}` }) }, tone)) });
}
function useObjectGraph(model, sequence) {
  const host = useRef(null);
  const previous = useRef(/* @__PURE__ */ new Map());
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const root = host.current;
    if (root === null) return;
    const measure = () => {
      const box = root.getBoundingClientRect();
      if (box.width > 0 && box.height > 0) setScale(Math.min(box.width / model.width, box.height / model.height, MAX_SCALE));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [model.width, model.height]);
  useLayoutEffect(() => {
    const root = host.current?.querySelector("svg");
    if (root === null || root === void 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const current = /* @__PURE__ */ new Map();
    for (const node of root.querySelectorAll("[data-object-id]")) {
      const id = node.getAttribute("data-object-id");
      if (id !== null) current.set(id, node.getBoundingClientRect());
    }
    if (!reduced) for (const node of root.querySelectorAll("[data-object-id]")) {
      const id = node.getAttribute("data-object-id") ?? "";
      const before = previous.current.get(id);
      const after = current.get(id);
      if (before === void 0 || after === void 0) continue;
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" });
    }
    previous.current = current;
  }, [sequence]);
  return { host, scale };
}
function ObjectGraph({ model, sequence }) {
  const marker = useId();
  const { host, scale } = useObjectGraph(model, sequence);
  const fit = (px) => px * Math.max(1, TEXT.min / (TEXT.value * scale));
  return /* @__PURE__ */ jsx("div", { className: "pico-ds-canvas", ref: host, children: /* @__PURE__ */ jsxs(
    "svg",
    {
      className: "pico-ds-svg",
      viewBox: `0 ${model.top} ${model.width} ${model.height}`,
      width: model.width * scale,
      height: model.height * scale,
      role: "img",
      "aria-label": "\u5BF9\u8C61\u56FE",
      children: [
        /* @__PURE__ */ jsx(ArrowDefs, { id: marker }),
        model.boxes.map((box) => /* @__PURE__ */ jsxs("g", { "data-object-id": box.id, "data-added": String(box.added), "data-muted": String(box.muted), className: "pico-ds-box", children: [
          /* @__PURE__ */ jsx("rect", { x: box.x, y: box.y, width: box.width, height: box.height, rx: box.rx }),
          box.title !== null && /* @__PURE__ */ jsx(
            "text",
            {
              className: "pico-ds-box-title",
              x: box.x + BOX.padX,
              y: box.y + BOX.padTop + 12,
              style: { fontSize: fit(TEXT.title) },
              children: box.title
            }
          ),
          box.inline !== null && /* @__PURE__ */ jsx(
            "text",
            {
              className: "pico-ds-inline",
              x: box.title === null ? box.x + box.width / 2 : box.x + BOX.padX,
              y: box.baseline,
              textAnchor: box.title === null ? "middle" : "start",
              style: { fontSize: fit(box.inlinePx) },
              children: box.inline
            }
          ),
          box.rows.map((row, index) => /* @__PURE__ */ jsxs("g", { className: "pico-ds-row", children: [
            row.label !== null && /* @__PURE__ */ jsx("text", { className: "pico-ds-row-label", x: box.x + BOX.padX, y: row.anchor.y + 4, style: { fontSize: fit(TEXT.label) }, children: row.label }),
            row.value !== null && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("text", { className: "pico-ds-row-value", x: row.anchor.x, y: row.anchor.y + 4, style: { fontSize: fit(TEXT.value) }, children: row.value }),
              row.ghost !== null && /* @__PURE__ */ jsx(
                "text",
                {
                  className: "pico-ds-ghost",
                  x: row.anchor.x + textWidth(row.value, TEXT.value) + 16,
                  y: row.anchor.y + 4,
                  style: { fontSize: fit(TEXT.ghost) },
                  children: row.ghost
                }
              )
            ] })
          ] }, index)),
          box.ghost !== null && /* @__PURE__ */ jsx(
            "text",
            {
              className: "pico-ds-ghost",
              x: box.x + box.width / 2,
              y: box.y + box.height + 17,
              textAnchor: "middle",
              style: { fontSize: fit(TEXT.ghost) },
              children: box.ghost
            }
          )
        ] }, box.id)),
        model.edges.map((edge) => /* @__PURE__ */ jsx(
          "path",
          {
            className: "pico-ds-edge",
            "data-tone": edge.tone,
            pathLength: 1,
            d: `M ${edge.from.x} ${edge.from.y} L ${edge.to.x} ${edge.to.y}`,
            markerEnd: `url(#${marker}-${edge.tone})`
          },
          edge.id
        )),
        model.names.map((name) => /* @__PURE__ */ jsxs("g", { "data-object-id": `name:${name.name}`, className: "pico-ds-name", "data-focused": String(name.focused), children: [
          /* @__PURE__ */ jsx("text", { className: "pico-ds-name-text", x: name.x, y: name.y + 5, textAnchor: name.anchor, style: { fontSize: fit(TEXT.value) }, children: name.name }),
          name.value !== null && /* @__PURE__ */ jsx(
            "text",
            {
              className: "pico-ds-name-value",
              x: name.x + 12,
              y: name.y + 5,
              textAnchor: name.anchor,
              style: { fontSize: fit(TEXT.value) },
              children: name.value
            }
          )
        ] }, name.name))
      ]
    }
  ) });
}
function StructureView({ caseId, trace, position, focus }) {
  const step = snapshotStepAt(trace, position);
  if (step.current === null) return /* @__PURE__ */ jsx("div", { className: "pico-ds-empty", "aria-label": "\u5BF9\u8C61\u56FE" });
  return /* @__PURE__ */ jsx(ObjectGraph, { model: structureModel(caseId, step.current, step.previous, focus), sequence: step.ordinal });
}
function semanticStepDelay(position) {
  const log = position.state.resources?.[RESOURCE] ?? 0;
  const previousOrdinal = position.previous.resources?.[RESOURCE] ?? 0;
  return log !== previousOrdinal ? 1200 : 160;
}
var PANELS = ["structure", "debug"];
var mountOptions = {
  ...pythonOptions({ debugger: { variablesExpandable: true }, playback: { stepMsFor: semanticStepDelay } }),
  filename: "data-structures.py",
  layout: { open: [...PANELS], ratio: 0.38, sizes: { structure: 1.15, debug: 1 } },
  session: null
};
var starter = STARTER;
function Root(host = {}) {
  const view = usePlayground(dataStructures, host.source ?? STARTER, { ...mountOptions, ...host.options });
  if (view === null) return null;
  const result = view.parts.python.result;
  const trace = result.status === "ready" && result.value !== null ? result.value.trace : null;
  const running = result.status === "pending";
  const selected = view.parts.selection.current;
  const focus = selected?.kind === "runtime-variable" && typeof selected.path[1] === "string" ? selected.path[1] : null;
  return /* @__PURE__ */ jsxs("div", { className: "pico-ds-app", children: [
    /* @__PURE__ */ jsx("style", { children: DATA_STRUCTURES_STYLE }),
    /* @__PURE__ */ jsx(
      PlaygroundShell,
      {
        name: "Python Data Structures",
        layout: view.layout,
        onEvent: view.send,
        menu: view.menu,
        toolbar: [
          ...view.toolbar,
          { label: "\u793A\u4F8B", controls: [{
            kind: "choices",
            label: "\u6570\u636E\u7ED3\u6784",
            value: view.state.caseId,
            choices: CASES.map((item) => ({ value: item.id, label: item.label, event: { type: "data-structures.case.changed", caseId: item.id } }))
          }] },
          { controls: [{ kind: "button", icon: "play", label: running ? "\u6B63\u5728\u8FD0\u884C" : "\u8FD0\u884C", disabled: running, event: { type: "python.run" } }] }
        ],
        editor: /* @__PURE__ */ jsx(Widget, { widget: view.editor }),
        panels: [
          { key: "structure", icon: "viz", title: "\u6570\u636E\u7ED3\u6784", flush: true, content: /* @__PURE__ */ jsx(StructureView, { caseId: view.state.caseId, trace, position: view.parts.playback.position, focus }) },
          { key: "debug", icon: "debug", title: "\u8C03\u8BD5", content: /* @__PURE__ */ jsx(Widget, { widget: view.parts.debugger }) },
          { key: "output", icon: "output", title: "\u8F93\u51FA", content: /* @__PURE__ */ jsx(Widget, { widget: view.parts.terminal }) }
        ]
      }
    )
  ] });
}
var DATA_STRUCTURES_STYLE = `
  .pico-ds-app { width: 100%; height: 100%; min-width: 0; min-height: 0; }
  .pico-ds-app > .pico-page { height: 100%; }
  .pico-ds-canvas, .pico-ds-empty { display: grid; width: 100%; height: 100%; min-width: 0; min-height: 0; place-items: center; padding: var(--pico-space-3); background: var(--pico-code-bg); overflow: hidden; }
  .pico-ds-svg { display: block; max-width: 100%; max-height: 100%; overflow: visible; }

  /* \u53D8\u91CF\u540D\u4E0E\u7BAD\u5934\uFF1A\u4ECE\u540C\u4E00\u6761\u7AD6\u7EBF\u51FA\u53D1\uFF0C\u6307\u5411\u8C01\u7531\u51E0\u4F55\u51B3\u5B9A\u3002 */
  .pico-ds-name-text { fill: var(--pico-ink); font: 600 var(--pico-font-mono); }
  .pico-ds-name-value { fill: var(--pico-ink-soft); font: 500 var(--pico-font-mono); }
  .pico-ds-name[data-focused="true"] .pico-ds-name-text { fill: var(--pico-accent-deep); }

  /* \u5BF9\u8C61\u6846\uFF1A\u4E00\u4E2A\u5BF9\u8C61\u4E00\u4E2A\u6846\uFF0C\u6807\u9898\u662F\u7C7B\u578B\uFF0C\u5176\u4F59\u662F\u5185\u5BB9\u3002 */
  .pico-ds-box rect { fill: var(--pico-surface-raised); stroke: var(--pico-hairline); stroke-width: 1.2; }
  .pico-ds-box[data-added="true"] rect { animation: pico-ds-appear 280ms var(--pico-ease-out) both; transform-box: fill-box; transform-origin: center; }
  .pico-ds-box-title { fill: var(--pico-code-dim); font: 600 var(--pico-font-ui); }
  .pico-ds-inline { fill: var(--pico-ink); font: 700 var(--pico-font-mono); }
  .pico-ds-row-label { fill: var(--pico-code-dim); font: 500 var(--pico-font-mono); }
  .pico-ds-row-value { fill: var(--pico-ink); font: 500 var(--pico-font-mono); }
  .pico-ds-ghost { fill: var(--pico-hue-error-ink); font: 500 var(--pico-font-mono); text-decoration: line-through; animation: pico-ds-leave 900ms ease-out both; }
  .pico-ds-box[data-muted="true"] rect { fill: none; stroke: var(--pico-code-dim); stroke-dasharray: 3 3; }
  .pico-ds-box[data-muted="true"] .pico-ds-inline { fill: var(--pico-code-dim); font-weight: 500; }

  /* \u5F15\u7528\u7EBF\uFF1A\u76F4\u7EBF\u7BAD\u5934\uFF0C\u65E7\u7EBF\u5148\u9000\u3001\u65B0\u7EBF\u518D\u8FDE\uFF0C\u4E24\u6BB5\u4E4B\u95F4\u7559\u51FA\u65F6\u95F4\u5DEE\u3002 */
  .pico-ds-edge { fill: none; stroke: var(--pico-ink-soft); stroke-width: 1.4; stroke-linecap: round; }
  .pico-ds-edge[data-tone="new"] { stroke: var(--pico-hue-branch-strong); stroke-width: 1.8; stroke-dasharray: 1; stroke-dashoffset: 1; animation: pico-ds-draw 520ms var(--pico-ease-out) 320ms both; }
  .pico-ds-edge[data-tone="retired"] { stroke: var(--pico-hue-error-strong); stroke-dasharray: 4 3; animation: pico-ds-fade 300ms ease-out both; }
  .pico-ds-edge[data-tone="focus"] { stroke: var(--pico-accent); stroke-width: 1.8; }
  .pico-ds-head { fill: var(--pico-ink-soft); }
  .pico-ds-head--new { fill: var(--pico-hue-branch-strong); }
  .pico-ds-head--retired { fill: var(--pico-hue-error-strong); }
  .pico-ds-head--focus { fill: var(--pico-accent); }

  @keyframes pico-ds-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
  @keyframes pico-ds-fade { from { opacity: 1; } to { opacity: 0; } }
  @keyframes pico-ds-appear { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
  @keyframes pico-ds-leave { 0%, 55% { opacity: .75; } 100% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .pico-ds-edge, .pico-ds-box rect, .pico-ds-ghost { animation: none !important; }
  }
`;
export {
  CASES,
  Root,
  SNAPSHOT_PRELUDE,
  STARTER,
  dataStructures,
  diffSnapshots,
  examples,
  instrumentSource,
  semanticStepDelay,
  snapshotAt,
  starter,
  structureModel,
  treeLayout
};
