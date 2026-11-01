// session/impl/core/actions.ts
function resolveAction(actions, id, context, args, caller) {
  const action = actions.find((candidate) => candidate.id === id);
  return action === void 0 ? null : evaluate(action, context, args, caller);
}
function resolveActions(actions, context, ids, caller) {
  if (ids === void 0) return actions.map((action) => evaluate(action, context, {}, caller));
  return ids.flatMap((id) => {
    const item = resolveAction(actions, id, context, {}, caller);
    return item === null ? [] : [item];
  });
}
function evaluate(action, context, args, caller) {
  let event4;
  return Object.freeze({
    id: action.id,
    label: action.label,
    ...action.icon === void 0 ? {} : { icon: action.icon },
    enabled: argsMatch(action.args, args) && (action.when?.(context, args, caller.actor) ?? true),
    get event() {
      return event4 ??= { ...action.event(context, args, caller), actor: caller.actor };
    }
  });
}
function argsMatch(schema, args) {
  if (schema === void 0) return true;
  return Object.keys(args).every((name) => name in schema) && Object.entries(schema).every(([name, type2]) => args[name] === void 0 ? type2.optional === true : matches(type2, args[name]));
}
function matches(type2, value) {
  if (type2.enum !== void 0 && !type2.enum.some((option) => option === value)) return false;
  switch (type2.type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "integer":
      return typeof value === "number" && Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return typeof value === "object" && value !== null && !Array.isArray(value);
    case "array":
      return Array.isArray(value) && (type2.items === void 0 || value.every((item) => matches(type2.items, item)));
    case "value":
      return value !== void 0;
  }
}

// session/impl/core/assembly.ts
function makeFeature(name, spec) {
  const declared = Object.freeze({
    kind: "feature",
    name,
    requires: Object.freeze([...spec.requires ?? []]),
    create: spec.create ?? (() => void 0),
    actions: Object.freeze([...spec.actions ?? []]),
    views: Object.freeze([...spec.views ?? []]),
    queries: Object.freeze([...spec.queries ?? []]),
    with: (options2) => Object.freeze({ feature: declared, options: options2 })
  });
  return declared;
}
var use = (entry) => "kind" in entry ? { feature: entry, options: void 0 } : entry;
function withEnvironment(entries, hosted) {
  const plain = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
  const merged = entries.map(use);
  for (const entry of hosted.map(use)) {
    const at = merged.findIndex((candidate) => candidate.feature === entry.feature);
    if (at < 0) {
      merged.push(entry);
      continue;
    }
    const base = merged[at].options;
    merged[at] = Object.freeze({ feature: entry.feature, options: plain(base) && plain(entry.options) ? { ...base, ...entry.options } : entry.options });
  }
  return Object.freeze(merged);
}
function assembleSessionImpl(bus, entries) {
  const options2 = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const used = use(entry);
    if (options2.has(used.feature)) throw new Error(`Feature ${used.feature.name} is assembled twice`);
    options2.set(used.feature, used.options);
  }
  const order = dependencyOrder(options2);
  const values = /* @__PURE__ */ new Map();
  const cleanups = [];
  const waiting = /* @__PURE__ */ new Set();
  const stops = [];
  let open = true;
  const dispose = () => {
    const errors = [];
    if (open) {
      open = false;
      try {
        reply(bus, { type: "session.closed" });
      } catch (error) {
        errors.push(error);
      }
    }
    for (const cancel of [...waiting]) cancel();
    waiting.clear();
    for (const stop2 of stops.splice(0).reverse()) {
      try {
        stop2();
      } catch (error) {
        errors.push(error);
      }
    }
    for (const cleanup of cleanups.splice(0).reverse()) {
      try {
        cleanup();
      } catch (error) {
        errors.push(error);
      }
    }
    values.clear();
    if (errors.length > 0) throw new AggregateError(errors, "Session cleanup failed");
  };
  try {
    for (const declared of order) {
      values.set(declared, declared.create({
        bus,
        own: (instance) => {
          cleanups.push(() => instance.dispose());
          return instance;
        },
        get: (dependency) => {
          if (!declared.requires.includes(dependency)) throw new Error(`Feature ${declared.name} reads ${dependency.name} without requiring it`);
          return values.get(dependency);
        }
      }, options2.get(declared)));
    }
  } catch (error) {
    dispose();
    throw error;
  }
  const actions = order.flatMap((declared) => declared.actions);
  const queries = order.flatMap((declared) => declared.queries);
  for (const [kind, ids] of [["Action", actions.map((action) => action.id)], ["Query", queries.map((query) => query.id)]]) {
    const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
    if (duplicate === void 0) continue;
    dispose();
    throw new Error(`${kind} ${duplicate} is declared twice`);
  }
  let requests = 0;
  const invoke = (call, caller, wait2) => {
    const args = call.args ?? {};
    const item = resolveAction(actions, call.action, session, args, caller);
    const declared = actions.find((action) => action.id === call.action);
    const refusal2 = item === null ? "unknown" : item.enabled ? null : argsMatch(declared.args, args) ? "unavailable" : "invalid";
    if (refusal2 !== null) {
      bus.emit({ type: "session.invoke.failed", action: call.action, reason: refusal2 }, "session");
      return refusal2;
    }
    const settle2 = wait2 ? declared.settle?.(session, args) : void 0;
    const request = settle2 === void 0 ? void 0 : `${++requests}`;
    const outcome = settle2 === void 0 ? Promise.resolve("done") : new Promise((resolve) => {
      let finish2 = (_outcome) => {
      };
      const stopWaiting = bus.subscribe([settle2.on, ...settle2.fail ?? []], (event4) => {
        if (event4.request !== void 0 && event4.request !== request) return;
        if (event4.type !== settle2.on || settle2.failed?.(event4) === true) finish2("failed");
        else if (settle2.until?.(event4) ?? true) finish2("done");
      });
      const timer3 = setTimeout(() => finish2("timeout"), settle2.timeoutMs ?? 3e4);
      const cancel = () => {
        finish2("unavailable");
      };
      finish2 = (result) => {
        stopWaiting();
        clearTimeout(timer3);
        waiting.delete(cancel);
        resolve(result);
      };
      waiting.add(cancel);
    });
    bus.emit({ ...item.event, actor: caller.actor, ...request === void 0 ? {} : { request } }, "session");
    return outcome;
  };
  const session = Object.freeze({
    get: (declared) => {
      const key = declared;
      return values.has(key) ? values.get(key) : null;
    },
    actions: Object.freeze(actions),
    views: Object.freeze(order.flatMap((declared) => declared.views)),
    queries: Object.freeze(queries),
    query: (id, args = {}) => {
      const query = queries.find((candidate) => candidate.id === id);
      if (query === void 0) throw new Error(`Query ${id} is not declared`);
      return query.run(session, args);
    },
    invoke: (call, actor = "host") => Promise.resolve(invoke(call, { actor, process: null }, true)),
    dispose
  });
  const settled = (ticket, outcome) => {
    if (ticket === void 0) return;
    void Promise.resolve(outcome).then((result) => {
      if (open) reply(bus, { type: "session.settled", ticket, outcome: result });
    });
  };
  stops.push(listenInvoke(bus, invoke, settled));
  const descriptor = describe(session);
  stops.push(listenQuery(bus, session));
  reply(bus, { type: "session.ready", descriptor, session });
  return session;
}
var reply = (bus, message) => bus.emit(message, "session");
function listenInvoke(bus, invoke, settled) {
  return bus.subscribe(["session.invoke"], (call) => {
    const caller = { actor: call.actor ?? "student", process: call.process ?? null };
    settled(call.ticket, invoke({ action: call.action, args: call.args ?? {} }, caller, call.ticket !== void 0));
  });
}
function describe(session) {
  return Object.freeze({
    actions: Object.freeze(session.actions.map((action) => Object.freeze({
      id: action.id,
      label: action.label,
      tags: Object.freeze([...action.tags ?? []]),
      ...action.args === void 0 ? {} : { args: action.args }
    }))),
    queries: Object.freeze(session.queries.map((query) => query.id))
  });
}
function listenQuery(bus, session) {
  return bus.subscribe(["session.query.request"], (event4) => {
    if (typeof event4.ticket !== "string") return;
    if (typeof event4.id !== "string" || !session.queries.some((query) => query.id === event4.id)) {
      reply(bus, { type: "session.queried", ticket: event4.ticket, outcome: "unknown" });
      return;
    }
    try {
      const args = typeof event4.args === "object" && event4.args !== null && !Array.isArray(event4.args) ? event4.args : {};
      reply(bus, { type: "session.queried", ticket: event4.ticket, outcome: "done", value: session.query(event4.id, args) });
    } catch (error) {
      reply(bus, {
        type: "session.queried",
        ticket: event4.ticket,
        outcome: "failed",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
function dependencyOrder(assembled) {
  const order = [];
  const visiting = /* @__PURE__ */ new Set();
  const visit2 = (declared, path2) => {
    if (order.includes(declared)) return;
    if (visiting.has(declared)) throw new Error(`Feature dependency cycle: ${[...path2, declared.name].join(" \u2192 ")}`);
    if (!assembled.has(declared)) throw new Error(`Feature ${path2.at(-1)} requires ${declared.name}, which is not assembled`);
    visiting.add(declared);
    for (const dependency of declared.requires) visit2(dependency, [...path2, declared.name]);
    visiting.delete(declared);
    order.push(declared);
  };
  for (const declared of assembled.keys()) visit2(declared, []);
  return order;
}

// session/core.ts
function feature(name, spec) {
  return makeFeature(name, spec);
}
function provided(name) {
  return makeFeature(name, { create: (_scope, value) => value });
}
function assembleSession(bus, entries) {
  return assembleSessionImpl(bus, entries);
}
function withEnvironment2(entries, environment) {
  return withEnvironment(entries, environment?.features ?? []);
}
var editorHost = provided("editor");
var layoutHost = provided("layout");
var playbackHost = provided("playback");
var selectionHost = provided("selection");
function resolveAction2(actions, id, context, args = {}, actor = "student", process = null) {
  return resolveAction(actions, id, context, args, { actor, process });
}
function resolveActions3(actions, context, ids, actor = "student") {
  return resolveActions(actions, context, ids, { actor, process: null });
}
function argsMatch2(schema, args) {
  return argsMatch(schema, args);
}
function sessionView(ide, dispatch) {
  return {
    get: ide.get,
    query: ide.query,
    dispatch,
    resolve: (id, args, caller) => resolveAction2(
      ide.actions,
      id,
      ide,
      args,
      caller?.actor ?? "student",
      caller?.process ?? null
    )
  };
}

// session/impl/model/connection/connection.ts
import { createState as createState2 } from "./pico.js";

// session/api/model/playground.ts
import { createState, on, stateful } from "./pico.js";

// session/impl/model/playground/select.ts
var shownCodeImpl = (state) => state.code.lent?.code ?? state.code.mine;
var codeLockedImpl = (state) => state.code.lent !== null;
var editableImpl = (state) => state.code.presenter === null;
var codeOwnerImpl = (state) => state.code.lent === null ? "student" : ownerOf(state.processes, state.code.lent.to);
function ownerOf(active, id) {
  const kind = rootKind(active, id);
  return kind === "ai" ? "ai" : kind === "review" ? "review" : "lecture";
}
function rootKind(active, id) {
  const find = (process) => active.find((item) => item.id === process);
  let current = find(id);
  for (let parent = current?.parent; parent != null; parent = current?.parent) {
    const found = find(parent);
    if (found === void 0) break;
    current = found;
  }
  return current?.kind ?? id.split(":")[0];
}

// session/impl/model/review/validate.ts
var KINDS = ["note", "strike", "underline", "suggest", "praise"];
function isReview(value) {
  if (typeof value !== "object" || value === null) return false;
  const input = value;
  return (input.submissionId === void 0 || typeof input.submissionId === "string" && input.submissionId.length > 0) && typeof input.title === "string" && typeof input.source === "string" && Array.isArray(input.comments) && input.comments.every(isComment) && new Set(input.comments.map((comment) => comment.id)).size === input.comments.length;
}
function isComment(value) {
  if (typeof value !== "object" || value === null) return false;
  const input = value;
  return typeof input.id === "string" && typeof input.author === "string" && typeof input.text === "string" && KINDS.includes(input.kind) && isPoint(input.from) && isPoint(input.to) && typeof input.quote === "string" && input.quote.length > 0 && (input.replacement === void 0 || typeof input.replacement === "string") && (input.round === void 0 || typeof input.round === "string");
}
function isPoint(value) {
  if (typeof value !== "object" || value === null) return false;
  const { line, column } = value;
  return Number.isInteger(line) && line >= 1 && Number.isInteger(column) && column >= 1;
}
function freezeReview(review2) {
  return Object.freeze({ ...review2, comments: Object.freeze(review2.comments.map((comment) => Object.freeze({ ...comment }))) });
}

// session/impl/model/tour/state.ts
var idleTourImpl = (serial = 0) => Object.freeze({
  stops: Object.freeze([]),
  at: -1,
  process: null,
  paused: false,
  finished: false,
  actor: null,
  owner: null,
  request: null,
  call: 0,
  waiting: null,
  dwelling: null,
  serial
});
function isStops(value, last) {
  return Array.isArray(value) && value.length > 0 && value.every((stop2) => {
    if (typeof stop2 !== "object" || stop2 === null) return false;
    const { step: step2, dwell, do: calls } = stop2;
    return typeof step2 === "number" && Number.isInteger(step2) && step2 >= 1 && step2 <= last && (dwell === void 0 || typeof dwell === "number" && dwell >= 0) && (calls === void 0 || Array.isArray(calls) && calls.every((call) => typeof call?.action === "string"));
  });
}
var ACTORS = ["student", "script", "ai", "host"];
function reduceTourImpl(state, event4, processes) {
  const { tour: tour2 } = state;
  switch (event4.type) {
    case "tour.play": {
      const { stops, actor, owner, request } = event4;
      if (!isStops(stops, Number.MAX_SAFE_INTEGER) || !ACTORS.includes(actor) || owner !== null && typeof owner !== "string") return same(state);
      const cancelled = tour2.process === null ? same(state) : finish(state, processes, "tour.cancelled");
      const serial = cancelled.state.tour.serial + 1;
      const process = `tour:${serial}`;
      const started = then(cancelled, (next) => processes(next, { type: "process.start", id: process, kind: "tour", ...owner === null ? {} : { parent: owner } }));
      const playing = then(started, (next) => same(withTour(next, {
        stops: Object.freeze([...stops]),
        at: -1,
        process,
        actor,
        owner,
        request: typeof request === "string" ? request : null,
        serial
      })));
      return then(playing, (next) => visit(next, 0, processes));
    }
    case "tour.stop":
      return tour2.process === null ? same(state) : finish(state, processes, "tour.cancelled");
    case "session.settled": {
      if (tour2.waiting === null || event4.ticket !== tour2.waiting) return same(state);
      const next = withTour(state, { waiting: null });
      return next.tour.paused ? same(next) : advance(next);
    }
    case "tour.dwelt":
      if (tour2.dwelling === null || event4.ticket !== tour2.dwelling) return same(state);
      return visit(withTour(state, { dwelling: null }), tour2.at + 1, processes);
    default:
      return same(state);
  }
}
function followLectureImpl(state) {
  const { tour: tour2 } = state;
  if (tour2.process === null) return same(state);
  const paused = tour2.actor === "script" && state.lecture.paused;
  if (paused === tour2.paused) return same(state);
  if (paused) return same(withTour(state, { paused, dwelling: null }));
  const resumed = withTour(state, { paused });
  return tour2.finished || tour2.waiting !== null ? same(resumed) : advance(resumed);
}
function visit(state, index, processes) {
  const { tour: tour2 } = state;
  const process = tour2.process;
  const stop2 = tour2.stops[index];
  if (stop2 === void 0) {
    const finished2 = same(withTour(state, { finished: true }), [{ type: "tour.finished", ...requestOf(tour2) }]);
    return tour2.owner === null ? then(finished2, (next) => finish(next, processes, null)) : finished2;
  }
  const left = index > 0 ? processes(state, { type: "process.end", id: stopProcess(process, index - 1) }) : same(state);
  const entered = then(left, (next) => processes(next, { type: "process.start", id: stopProcess(process, index), kind: "tour-stop", parent: process }));
  const arrived = then(entered, (next) => same(withTour(next, { at: index, call: 0 }), [{ type: "debugger.seek", traceIndex: stop2.step }]));
  return then(arrived, (next) => next.tour.paused ? same(next) : advance(next));
}
function advance(state) {
  const { tour: tour2 } = state;
  const stop2 = tour2.stops[tour2.at];
  const calls = stop2.do ?? [];
  const serial = tour2.serial + 1;
  if (tour2.call < calls.length) {
    const { action, args } = calls[tour2.call];
    const ticket2 = `${tour2.process}#${serial}`;
    return same(withTour(state, { call: tour2.call + 1, waiting: ticket2, serial }), [{
      type: "session.invoke",
      action,
      args: args ?? {},
      actor: tour2.actor,
      process: stopProcess(tour2.process, tour2.at),
      ticket: ticket2
    }]);
  }
  const ticket = `${tour2.process}~${serial}`;
  return same(withTour(state, { dwelling: ticket, serial }), [{ type: "tour.dwell", ticket, ms: stop2.dwell ?? null }]);
}
function finish(state, processes, outcome) {
  const ended = processes(state, { type: "process.end", id: state.tour.process });
  if (ended.state.tour.process === null) return ended;
  const reset = then(ended, (next) => same(withTour(next, idleTourImpl(next.tour.serial))));
  return outcome === null ? reset : { state: reset.state, effects: [...cancelledTourImpl(state.tour), ...reset.effects] };
}
function cancelledTourImpl(tour2) {
  return tour2.process === null || tour2.finished ? [] : [{ type: "tour.cancelled", ...requestOf(tour2) }];
}
var requestOf = (tour2) => tour2.request === null ? {} : { request: tour2.request };
var stopProcess = (process, index) => `${process}/stop:${index + 1}`;
var same = (state, effects = []) => ({ state, effects });
var then = (step2, next) => {
  const after = next(step2.state);
  return { state: after.state, effects: [...step2.effects, ...after.effects] };
};
var withTour = (state, patch) => Object.freeze({ ...state, tour: Object.freeze({ ...state.tour, ...patch }) });

// session/impl/model/source/editor.ts
import { EditorState, Transaction } from "./libs/codemirror.js";
function sharedEndsImpl(before, after) {
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < before.length - prefix && suffix < after.length - prefix && before.at(-1 - suffix) === after.at(-1 - suffix)) suffix += 1;
  return { prefix, suffix };
}
var lineStart = (text2, at) => at === 0 || text2[at - 1] === "\n";
function sharedLinesImpl(before, after) {
  if (before === after) return { prefix: before.length, suffix: 0 };
  const ends = sharedEndsImpl(before, after);
  const prefix = before.lastIndexOf("\n", ends.prefix - 1) + 1;
  let suffix = ends.suffix;
  while (suffix > 0 && !(lineStart(before, before.length - suffix) && lineStart(after, after.length - suffix))) suffix -= 1;
  return { prefix, suffix };
}
var minimalWritesImpl = EditorState.transactionFilter.of((transaction) => {
  if (!transaction.docChanged || transaction.annotation(Transaction.userEvent) !== void 0) return transaction;
  let replacesAll = false;
  let pieces = 0;
  let inserted = "";
  transaction.changes.iterChanges((fromA, toA, _fromB, _toB, text2) => {
    pieces += 1;
    replacesAll = fromA === 0 && toA === transaction.startState.doc.length;
    inserted = text2.toString();
  });
  if (pieces !== 1 || !replacesAll) return transaction;
  const before = transaction.startState.doc.toString();
  const { prefix, suffix } = sharedEndsImpl(before, inserted);
  return {
    changes: { from: prefix, to: before.length - suffix, insert: inserted.slice(prefix, inserted.length - suffix) },
    effects: transaction.effects,
    scrollIntoView: transaction.scrollIntoView
  };
});

// session/impl/model/script/match.ts
function targetChunkImpl(target2, from) {
  const remainder = target2.slice(from);
  if (remainder === "") return null;
  const end = remainder.indexOf("\n");
  return end < 0 ? remainder : remainder.slice(0, end + 1);
}
function targetMatchImpl(doc, target2) {
  let prefix = 0;
  while (prefix < doc.length && prefix < target2.length && doc[prefix] === target2[prefix]) prefix += 1;
  const before = doc.slice(0, prefix);
  return Object.freeze({
    prefix,
    complete: doc === target2,
    diverged: prefix < doc.length,
    line: before.split("\n").length,
    column: prefix - before.lastIndexOf("\n")
  });
}
function nextHintImpl(doc, target2) {
  const match = targetMatchImpl(doc, target2);
  const text2 = match.complete ? null : targetChunkImpl(target2, match.prefix);
  if (text2 === null) return null;
  if (!match.diverged) return { at: match.prefix, text: text2 };
  const lineEnd = doc.indexOf("\n", match.prefix);
  const to = lineEnd < 0 ? doc.length : text2.endsWith("\n") ? lineEnd + 1 : lineEnd;
  return { at: match.prefix, to, text: text2 };
}

// session/impl/model/script/beats.ts
var ENDS = /* @__PURE__ */ new Set(["\u3002", "\uFF01", "\uFF1F", "\uFF1B", "!", "?"]);
var CLOSERS = /* @__PURE__ */ new Set(["\u201D", "\u2019", "\u300D", "\u300F", ")", "\uFF09"]);
var cache = /* @__PURE__ */ new WeakMap();
var split = /* @__PURE__ */ new Map();
function scriptBeatsImpl(say2) {
  if (typeof say2 !== "string") {
    let frozen = cache.get(say2);
    if (frozen === void 0) cache.set(say2, frozen = Object.freeze(say2.map((beat) => Object.freeze({ ...beat }))));
    return frozen;
  }
  let beats = split.get(say2);
  if (beats === void 0) split.set(say2, beats = Object.freeze(sentencesImpl(say2)));
  return beats;
}
function sentencesImpl(text2) {
  const beats = [];
  const lines = text2.split("\n");
  let paragraph = false;
  for (const line of lines) {
    if (line.trim() === "") {
      paragraph = beats.length > 0;
      continue;
    }
    const startsBlock = beats.length > 0 && (paragraph || /^\s*([-*·]|\d+\.)\s/.test(line));
    let sentence = "";
    let code2 = false;
    let first = true;
    const flush = () => {
      const said = sentence.trim();
      if (said !== "") beats.push(Object.freeze({ say: said, ...first && startsBlock ? { paragraph: true } : {} }));
      if (said !== "") first = false;
      sentence = "";
    };
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      sentence += character;
      if (character === "`") code2 = !code2;
      if (code2 || !ENDS.has(character)) continue;
      while (index + 1 < line.length && CLOSERS.has(line[index + 1])) sentence += line[++index];
      flush();
    }
    flush();
    paragraph = false;
  }
  return beats;
}
function predictionReplyImpl(predict, index) {
  const choice = predict.choices[index];
  if (choice === void 0) return null;
  if (choice.correct === true) return choice.reply ?? "\u7B54\u5BF9\u4E86\uFF01";
  const answer = predict.choices.find((item) => item.correct === true);
  const text2 = [choice.reply ?? (answer === void 0 ? "" : "\u4E0D\u5BF9\u3002"), answer === void 0 ? "" : `\u6B63\u786E\u7B54\u6848\u662F\u300C${answer.label}\u300D\u3002`].filter((part) => part !== "").join(" ");
  return text2 === "" ? null : text2;
}

// session/impl/model/script/state.ts
var idleLectureImpl = (serial = 0) => Object.freeze({
  script: null,
  process: null,
  step: 0,
  beat: 0,
  spoken: 0,
  narrating: false,
  writing: null,
  paused: false,
  done: false,
  predicting: false,
  answer: null,
  stepProcess: null,
  pc: 0,
  typewriter: null,
  waiting: null,
  timer: null,
  pending: null,
  hurry: false,
  expecting: Object.freeze([]),
  serial
});
function opsOf(script2, step2) {
  const current = script2.steps[step2];
  const beats = scriptBeatsImpl(current.say);
  return [
    ...(current.do ?? []).map((call) => ({ op: "call", call })),
    { op: "expect" },
    ...beats.flatMap((beat, index) => [
      { op: "speak", beat: index },
      { op: "pause" },
      ...(beat.do ?? []).map((call) => ({ op: "call", call })),
      ...beat.write === void 0 ? [] : [{ op: "write", code: beat.write }]
    ]),
    { op: "narrated", wrote: beats.some((beat) => beat.write !== void 0) }
  ];
}
function reduceLectureImpl(state, event4, core) {
  const lecture = state.lecture;
  switch (event4.type) {
    case "script.play": {
      const script2 = event4.script;
      if (script2?.steps?.length === void 0 || script2.steps.length === 0) return same2(state);
      const step2 = Math.min(Math.max(typeof event4.step === "number" ? event4.step : 0, 0), script2.steps.length - 1);
      const handing = typeof event4.origin === "string" ? event4.origin : null;
      return then2(lecture.process === null ? same2(state) : stop(state, core), (next) => start(next, script2, step2, handing, core));
    }
    case "script.stop":
      return stop(state, core);
    case "script.write": {
      if (lecture.paused) return same2(state);
      const ready = lecture.narrating ? state : withLecture(state, { hurry: false });
      if (lecture.writing === "student" || lecture.writing === "student-hint") {
        const goal = target(lecture);
        if (goal === null) return same2(state);
        const unhinted = lecture.writing === "student-hint" ? unhint(ready, core) : same2(ready);
        return then2(unhinted, (next) => type(withLecture(next, { writing: "typewriter" }), goal, "complete", core));
      }
      return begin(ready, "typewriter", core);
    }
    case "script.follow":
      return begin(state, "student", core);
    case "script.hint": {
      if (lecture.paused || target(lecture) === null) return same2(state);
      if (lecture.writing === "student") return hint(withLecture(state, { writing: "student-hint" }), core);
      if (lecture.writing === "student-hint") return unhint(withLecture(state, { writing: "student" }), core);
      return same2(state);
    }
    case "script.check": {
      const goal = target(lecture);
      if (lecture.paused || lecture.writing !== "student" && lecture.writing !== "student-hint" || goal === null) return same2(state);
      if (shownCodeImpl(state) === goal) return complete(state, core);
      return hint(withLecture(state, { writing: "student-hint" }), core);
    }
    case "script.next": {
      const { script: script2, step: step2, writing, paused, predicting } = lecture;
      if (script2 === null || paused || predicting || writing !== null || script2.steps[step2]?.write !== void 0 || step2 >= script2.steps.length - 1) return same2(state);
      return enter(state, { step: step2 + 1 }, core);
    }
    case "script.choose": {
      const { script: script2, step: step2, predicting, paused } = lecture;
      const index = event4.index;
      const choice = script2?.steps[step2]?.predict?.choices[index];
      if (!predicting || paused || choice === void 0) return same2(state);
      const answered2 = same2(withLecture(state, { predicting: false, answer: index }), [{
        type: "script.predicted",
        script: script2.id,
        step: step2,
        choice: index,
        ...choice.correct === void 0 ? {} : { correct: choice.correct }
      }]);
      return then2(answered2, (next) => choice.next !== void 0 ? enter(next, { step: choice.next, writing: null }, core) : proceed(next, core));
    }
    case "script.skip":
      return skip(state, core);
    case "source.hurry":
      return event4.origin === lecture.process ? skip(state, core) : same2(state);
    case "script.pause": {
      if (lecture.script === null || lecture.paused) return same2(state);
      return same2(withLecture(state, { paused: true, ...lecture.timer === null ? {} : { timer: null, pending: "fire" } }));
    }
    case "script.resume": {
      if (!lecture.paused) return same2(state);
      const resumed = withLecture(state, { paused: false, pending: null });
      return lecture.pending === "fire" ? fire(resumed, core) : lecture.pending === "run" ? run(resumed, core) : same2(resumed);
    }
    case "session.settled": {
      if (lecture.waiting === null || event4.ticket !== lecture.waiting) return same2(state);
      const settled = withLecture(state, { waiting: null, pc: lecture.pc + 1 });
      return lecture.paused ? same2(withLecture(settled, { pending: "run" })) : goto(settled, core);
    }
    case "script.waited":
      if (lecture.timer === null || event4.ticket !== lecture.timer) return same2(state);
      return fire(withLecture(state, { timer: null }), core);
    case "session.queried":
      return queried(state, event4);
    case "editor.changed":
      if (lecture.writing === "student-hint") return hint(withLecture(state, {}), core);
      return lecture.writing === "student" ? same2(withLecture(state, {})) : same2(state);
    default:
      return same2(state);
  }
}
function followCodeImpl(state, core) {
  const { lecture } = state;
  return lecture.process !== null && lecture.script?.from !== void 0 && state.code.lent === null ? stop(state, core) : same2(state);
}
function codeBeforeImpl(script2, step2) {
  for (let at = step2 - 1; at >= 0; at -= 1) {
    const current = script2.steps[at];
    const written = current.write ?? scriptBeatsImpl(current.say).findLast((beat) => beat.write !== void 0)?.write;
    if (written !== void 0) return written;
  }
  return script2.from;
}
function typingDelay(character) {
  if (character === "\n") return 320;
  if (character === ":") return 210;
  if (/[)\]}]/.test(character)) return 120;
  if (character === ",") return 85;
  if (/\s/.test(character)) return 28;
  return 42;
}
function start(state, script2, step2, handing, core) {
  const serial = state.lecture.serial + 1;
  const process = `script:${serial}`;
  const returned = handing !== null && state.code.lent?.to === handing ? core(state, { type: "source.restore", origin: handing }) : same2(state);
  let next = then2(returned, (current) => core(withLecture(current, { serial }), { type: "process.start", id: process, kind: "script" }));
  if (script2.mode === "instruction") next = then2(next, (current) => core(current, { type: "code.present", process }));
  const code2 = codeBeforeImpl(script2, step2);
  if (code2 !== void 0) next = then2(next, (current) => core(current, { type: "source.apply", origin: process, code: code2 }));
  return then2(next, (current) => enter(current, { script: script2, process, step: step2, writing: null, paused: false, done: false }, core));
}
function stop(state, core) {
  const { process, serial } = state.lecture;
  if (process === null) return same2(state);
  return core(withLecture(state, idleLectureImpl(serial)), { type: "process.end", id: process });
}
function enter(state, patch, core) {
  const previous = state.lecture.stepProcess;
  const reset = withLecture(state, {
    beat: 0,
    spoken: 0,
    narrating: true,
    predicting: false,
    answer: null,
    pc: 0,
    typewriter: null,
    waiting: null,
    timer: null,
    pending: null,
    hurry: false,
    expecting: Object.freeze([]),
    ...patch
  });
  const left = previous === null ? same2(reset) : core(reset, { type: "process.end", id: previous });
  return then2(left, (next) => {
    const { process, script: script2, step: step2 } = next.lecture;
    if (process === null || script2 === null) return same2(next);
    const declared = script2.steps[step2]?.stage;
    const serial = next.lecture.serial + 1;
    const stepProcess = `${process}/step:${serial}`;
    const entered = core(withLecture(next, { serial, stepProcess }), { type: "process.start", id: stepProcess, kind: "step", parent: process });
    const staged = declared === void 0 ? entered : { state: entered.state, effects: [{ type: "stage.enter", process, stage: declared }, ...entered.effects] };
    const calls = script2.steps[step2]?.do ?? [];
    return then2(staged, (current) => calls.length === 0 ? goto(current, core) : wait(current, { defer: true }, core));
  });
}
function goto(state, core) {
  const { lecture } = state;
  const op = opsOf(lecture.script, lecture.step)[lecture.pc];
  return run(op?.op === "speak" ? withLecture(state, { beat: op.beat, spoken: 0 }) : state, core);
}
function run(state, core) {
  const { lecture } = state;
  if (lecture.paused) return same2(withLecture(state, { pending: "run" }));
  const op = opsOf(lecture.script, lecture.step)[lecture.pc];
  switch (op?.op) {
    case "call": {
      const serial = lecture.serial + 1;
      const ticket = `${lecture.process}#${serial}`;
      return same2(withLecture(state, { serial, waiting: ticket }), [{
        type: "session.invoke",
        action: op.call.action,
        args: op.call.args ?? {},
        actor: "script",
        process: lecture.stepProcess,
        ticket
      }]);
    }
    case "expect": {
      const asked = expect(state);
      return then2(asked, (next) => goto(withLecture(next, { pc: next.lecture.pc + 1 }), core));
    }
    case "speak":
      return speak(state, op.beat, core);
    case "pause":
      return wait(state, { pace: "beat" }, core);
    case "write":
      return type(withLecture(state, { writing: "typewriter" }), op.code, "next", core);
    case "narrated":
      return narrated(state, op.wrote, core);
    default:
      return same2(state);
  }
}
function fire(state, core) {
  const { lecture } = state;
  if (lecture.typewriter !== null) return typed(state, core);
  const op = opsOf(lecture.script, lecture.step)[lecture.pc];
  if (op?.op === "speak") return speak(state, op.beat, core);
  if (op?.op === "call") return run(state, core);
  return goto(withLecture(state, { pc: lecture.pc + 1 }), core);
}
function wait(state, delay, core) {
  const { lecture } = state;
  if (lecture.paused) return same2(withLecture(state, { pending: "fire" }));
  if (lecture.hurry) return fire(state, core);
  const serial = lecture.serial + 1;
  const ticket = `${lecture.process}~${serial}`;
  return same2(withLecture(state, { serial, timer: ticket }), [{ type: "script.wait", ticket, ...delay }]);
}
function speak(state, beat, core) {
  const { lecture } = state;
  const say2 = scriptBeatsImpl(lecture.script.steps[lecture.step].say)[beat].say;
  const spoken3 = lecture.hurry ? say2.length : Math.min(say2.length, lecture.spoken + 1);
  const next = withLecture(state, { spoken: spoken3 });
  return spoken3 < say2.length ? wait(next, { pace: "char" }, core) : wait(withLecture(next, { pc: lecture.pc + 1 }), { pace: "beat" }, core);
}
function narrated(state, wrote, core) {
  const { lecture } = state;
  const step2 = lecture.script.steps[lecture.step];
  const predicting = step2.predict !== void 0 && lecture.answer === null;
  const next = withLecture(state, { narrating: false, ...predicting ? { predicting: true } : {} });
  return predicting ? same2(next) : proceed(next, core, wrote);
}
function proceed(state, core, wrote) {
  const { script: script2, step: step2 } = state.lecture;
  if (script2.steps[step2].write !== void 0) return script2.auto === true ? begin(state, "typewriter", core) : same2(state);
  const written = wrote ?? scriptBeatsImpl(script2.steps[step2].say).some((beat) => beat.write !== void 0);
  return written ? complete(state, core) : same2(state);
}
function begin(state, writer, core) {
  const { lecture } = state;
  const goal = target(lecture);
  if (goal === null || lecture.paused || lecture.narrating || lecture.predicting || lecture.writing !== null || lecture.done) return same2(state);
  const writing = withLecture(state, { writing: writer });
  return writer === "typewriter" ? type(writing, goal, "complete", core) : same2(writing);
}
function type(state, goal, after, core) {
  const { prefix, suffix } = sharedLinesImpl(shownCodeImpl(state), goal);
  const typewriter = Object.freeze({ goal, prefix, end: goal.length - suffix, written: prefix, settling: false, after });
  const started = core(withLecture(state, { typewriter }), preview(state.lecture.process, typewriter));
  return then2(started, (next) => wait(next, { ms: 260 }, core));
}
function typed(state, core) {
  const { lecture } = state;
  const typewriter = lecture.typewriter;
  if (typewriter.settling) {
    const done = withLecture(state, { typewriter: null });
    return typewriter.after === "complete" ? complete(done, core) : goto(withLecture(done, { writing: null, pc: lecture.pc + 1 }), core);
  }
  const written = lecture.hurry ? typewriter.end : Math.min(typewriter.end, typewriter.written + 1);
  if (written < typewriter.end) {
    const moved = Object.freeze({ ...typewriter, written });
    return then2(
      core(withLecture(state, { typewriter: moved }), preview(lecture.process, moved)),
      (next) => wait(next, { ms: typingDelay(typewriter.goal[written - 1] ?? "") }, core)
    );
  }
  const applied = core(withLecture(state, { typewriter: Object.freeze({ ...typewriter, written, settling: true }) }), {
    type: "source.apply",
    origin: lecture.process,
    code: typewriter.goal
  });
  return then2(applied, (next) => wait(next, { pace: "settle" }, core));
}
function preview(origin, { goal, prefix, end, written }) {
  const open = written > prefix && written < end && end < goal.length && goal[written - 1] !== "\n";
  return { type: "source.preview", origin, code: goal.slice(0, written) + (open ? "\n" : "") + goal.slice(end) };
}
function skip(state, core) {
  const { script: script2, paused, narrating, writing, timer: timer3 } = state.lecture;
  if (script2 === null || paused || !narrating && writing !== "typewriter") return same2(state);
  const hurried = withLecture(state, { hurry: true });
  return timer3 === null ? same2(hurried) : fire(withLecture(hurried, { timer: null }), core);
}
function complete(state, core) {
  const { script: script2, step: step2, writing } = state.lecture;
  if (script2 === null) return same2(state);
  const unhinted = writing === "student-hint" ? unhint(state, core) : same2(state);
  return then2(unhinted, (next) => step2 === script2.steps.length - 1 ? same2(withLecture(next, { writing: null, done: true })) : enter(next, { writing: null, step: step2 + 1 }, core));
}
function expect(state) {
  const { lecture } = state;
  const expectations = lecture.script.steps[lecture.step].expect ?? [];
  let serial = lecture.serial;
  const expecting = expectations.map((_, index) => Object.freeze({ ticket: `${lecture.process}#expect:${++serial}`, index }));
  return same2(withLecture(state, { serial, expecting: Object.freeze([...lecture.expecting, ...expecting]) }), expecting.map(({ ticket, index }) => ({
    type: "session.query.request",
    id: expectations[index].query,
    args: expectations[index].args ?? {},
    ticket
  })));
}
function queried(state, event4) {
  const { lecture } = state;
  const found = lecture.expecting.find((item) => item.ticket === event4.ticket);
  if (found === void 0) return same2(state);
  const { script: script2, step: step2 } = lecture;
  const expectation = script2.steps[step2].expect[found.index];
  const actual = valueAt(event4.outcome === "done" ? event4.value : void 0, expectation.path ?? []);
  return same2(withLecture(state, { expecting: Object.freeze(lecture.expecting.filter((item) => item !== found)) }), [{
    type: "script.expectation",
    script: script2.id,
    step: step2,
    query: expectation.query,
    ok: sameValue(actual, expectation.equals),
    expected: expectation.equals,
    actual: actual ?? null
  }]);
}
function valueAt(value, path2) {
  let current = value;
  for (const key of path2) {
    if (current === null || typeof current !== "object") return void 0;
    current = current[key];
  }
  return current;
}
function sameValue(left, right) {
  if (left === right) return true;
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object") return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) return false;
  return keys.every((key) => sameValue(left[key], right[key]));
}
function hint(state, core) {
  const { lecture } = state;
  const goal = target(lecture);
  if (goal === null || lecture.process === null) return same2(state);
  const doc = shownCodeImpl(state);
  const next = nextHintImpl(doc, goal);
  return next === null ? unhint(state, core) : core(state, { type: "hint.show", owner: lecture.process, source: doc, ...next });
}
function unhint(state, core) {
  const { process } = state.lecture;
  return process === null ? same2(state) : core(state, { type: "hint.clear", owner: process });
}
var target = (lecture) => lecture.script?.steps[lecture.step]?.write ?? null;
var same2 = (state, effects = []) => ({ state, effects });
var then2 = (step2, next) => {
  const after = next(step2.state);
  return { state: after.state, effects: [...step2.effects, ...after.effects] };
};
var withLecture = (state, patch) => Object.freeze({ ...state, lecture: Object.freeze({ ...state.lecture, ...patch }) });

// session/impl/model/ai/state.ts
var AI_PANEL = "ai";
var WRITTEN = "\u6211\u5199\u597D\u4E86\uFF0C\u5E2E\u6211\u770B\u770B\u3002";
var EMPTY = { composing: true, pending: false, progress: null, draft: null, quote: null, messages: Object.freeze([]), dock: Object.freeze([]) };
var idleChatImpl = () => Object.freeze({
  open: false,
  process: null,
  ...EMPTY,
  prompts: Object.freeze([]),
  history: Object.freeze([]),
  request: null,
  locating: null,
  carry: false,
  practice: null,
  agentDock: false,
  nextMessage: 0,
  nextConversation: 0,
  serial: 0
});
function reduceChatImpl(state, event4, core) {
  const { chat } = state;
  switch (event4.type) {
    case "ai.hydrate": {
      const history = event4.history;
      return same3(withChat(state, {
        prompts: Object.freeze([...event4.prompts]),
        history: Object.freeze([...history]),
        nextMessage: Math.max(0, ...history.flatMap((conversation) => conversation.messages.map((message) => message.id))),
        nextConversation: Math.max(0, ...history.map((conversation) => conversation.id))
      }));
    }
    case "ai.open":
      return chat.open ? same3(state) : enter2(state, core);
    case "ai.close":
      return chat.open ? then3(archive(state, core), (next) => same3(withChat(next, { open: false }))) : same3(state);
    case "ai.renew":
      return then3(archive(state, core), (next) => enter2(next, core));
    case "ai.compose":
      return chat.composing ? same3(state) : same3(withChat(state, { composing: true }));
    case "ai.ask": {
      const text2 = typeof event4.text === "string" ? event4.text.trim() : "";
      const { quote } = chat;
      if (text2 === "" && quote === null || chat.pending) return same3(state);
      const context = event4.context ?? null;
      const request = text2 === "" && quote !== null ? { kind: "explain", text: quote.text, quote, context } : { kind: "question", text: text2, quote, context };
      const opened = chat.open ? same3(state) : enter2(state, core);
      return then3(opened, (next) => ask(next, request, { text: text2 === "" ? "\u89E3\u91CA\u4E00\u4E0B" : text2, ...quote === null ? {} : { quote } }));
    }
    case "ai.quote": {
      const opened = chat.open ? same3(state) : enter2(state, core);
      return then3(opened, (next) => same3(withChat(next, { quote: event4.quote, composing: true })));
    }
    case "ai.unquote":
      return chat.quote === null ? same3(state) : same3(withChat(state, { quote: null }));
    case "ai.say":
      return same3(say(state, event4.reply));
    case "ai.dock":
      return same3(withChat(state, { dock: Object.freeze([...event4.actions]) }));
    case "ai.locate":
      return same3(withChat(state, { locating: event4.target }), [{ type: "navigate.locate", target: event4.target }]);
    case "navigate.located":
      if (chat.locating === null || chat.locating !== event4.target) return same3(state);
      return same3(say(withChat(state, { locating: null }), {
        text: `\u5DF2\u7ECF\u5B9A\u4F4D\u5230\u7B2C ${event4.traceIndex} \u4E2A Trace \u4F4D\u7F6E\u3002AI \u4F1A\u7559\u5728\u8FD9\u91CC\uFF0C\u4F60\u53EF\u4EE5\u7EE7\u7EED\u8FFD\u95EE\u8FD9\u4E00\u5904\u53D1\u751F\u4E86\u4EC0\u4E48\u3002`
      }));
    case "navigate.failed":
      if (chat.locating === null || chat.locating !== event4.target) return same3(state);
      return same3(say(withChat(state, { locating: null }), { text: FAILURES[event4.reason] }));
    case "ai.progress":
      if (!chat.pending || event4.ticket !== chat.request || chat.progress === event4.text) return same3(state);
      return same3(withChat(state, { progress: event4.text }));
    case "ai.drafted":
      if (!chat.pending || event4.ticket !== chat.request || chat.draft === event4.text) return same3(state);
      return same3(withChat(state, { draft: event4.text }));
    case "ai.answered":
      return event4.ticket === chat.request ? answered(state, event4) : same3(state);
    case "ai.carry":
      return same3(withChat(state, { carry: event4.carry === true }));
    default:
      return same3(state);
  }
}
var FAILURES = {
  "no-run": "\u7A0B\u5E8F\u8FD8\u6CA1\u6709\u53EF\u7528\u7684\u8FD0\u884C\u7ED3\u679C\u3002\u7B49\u8FD9\u6B21\u8FD0\u884C\u7ED3\u675F\u540E\u518D\u5B9A\u4F4D\u3002",
  stale: "\u8FD9\u4E2A\u9009\u62E9\u5C5E\u4E8E\u4FEE\u6539\u4E4B\u524D\u7684\u4EE3\u7801\u6216\u4E0A\u4E00\u6B21\u8FD0\u884C\u3002\u8BF7\u91CD\u65B0\u9009\u4E2D\u540E\u518D\u5B9A\u4F4D\u3002",
  "no-match": "\u672C\u6B21\u8FD0\u884C\u4E2D\u6CA1\u6709\u6267\u884C\u5230\u8FD9\u91CC\u3002\u53EF\u4EE5\u6362\u4E00\u4E2A\u7528\u4F8B\uFF0C\u6216\u9009\u4E2D\u4F1A\u88AB\u6267\u884C\u7684\u8BED\u53E5\u3002",
  unsupported: "\u8FD9\u4E2A\u5BF9\u8C61\u8FD8\u6CA1\u6709\u5230\u6267\u884C\u4F4D\u7F6E\u7684\u53EF\u9760\u6620\u5C04\u3002\u8BF7\u6539\u4E3A\u5728 Editor \u9009\u4E2D\u8BED\u53E5\uFF0C\u6216\u5728 Variables \u9009\u4E2D\u53D8\u91CF\u3002"
};
function enter2(state, core) {
  const serial = state.chat.serial + 1;
  const process = `ai:${serial}`;
  const started = core(withChat(state, { serial, open: true, process }), { type: "process.start", id: process, kind: "ai" });
  return { state: started.state, effects: [...started.effects, { type: "stage.enter", process, stage: { panels: [AI_PANEL], pinned: [AI_PANEL] } }] };
}
function ask(state, request, said) {
  const { chat } = state;
  const grading = request.text === WRITTEN && chat.practice !== null;
  const attempt = !grading || request.context === null ? {} : { quote: { text: request.context.source, lines: null, moment: null } };
  const serial = chat.serial + 1;
  const ticket = `ai:request:${serial}`;
  const asked = append(withChat(state, {
    serial,
    request: ticket,
    pending: true,
    composing: false,
    quote: null,
    ...chat.agentDock ? { agentDock: false, dock: Object.freeze([]) } : {}
  }), { role: "user", ...said, ...attempt });
  return same3(asked, [{ type: "ai.requested", ticket, request, grading }]);
}
function answered(state, end) {
  const settled = withChat(state, { request: null, pending: false, progress: null, draft: null });
  if (end.reply === null) return same3(settled);
  let next = append(settled, { role: "assistant", ...end.reply });
  const effects = [];
  const assignment = state.chat.practice;
  if (end.graded !== void 0 && assignment !== null) {
    next = withChat(next, { practice: null });
    const concepts = end.grade?.concepts ?? assignment.concepts;
    effects.push({
      type: "ai.practice",
      stage: "graded",
      task: assignment.task,
      source: end.graded.source,
      feedback: end.reply.text,
      ...end.grade === void 0 ? {} : { verdict: end.grade.verdict },
      ...concepts === void 0 ? {} : { concepts }
    });
  }
  if (end.practice !== void 0) {
    next = withChat(next, { practice: Object.freeze({ ...end.practice }) });
    effects.push({ type: "ai.practice", stage: "assigned", task: end.practice.task, ...end.practice.concepts === void 0 ? {} : { concepts: end.practice.concepts } });
  }
  if (end.dock !== void 0 && end.dock.length > 0) next = withChat(next, { agentDock: true, dock: Object.freeze([...end.dock]) });
  return same3(next, effects);
}
function archive(state, core) {
  const { chat } = state;
  const { carry, messages, history, draft } = chat;
  let { nextMessage, nextConversation } = chat;
  const kept = !carry ? [] : draft === null || draft.trim() === "" ? messages : [...messages, Object.freeze({ id: ++nextMessage, role: "assistant", text: draft })];
  const archived = carry || messages.length === 0 ? history : [Object.freeze({ id: ++nextConversation, title: conversationTitleImpl(messages), messages }), ...history];
  const next = withChat(state, {
    ...EMPTY,
    process: null,
    messages: Object.freeze(kept),
    history: Object.freeze(archived),
    request: null,
    locating: null,
    carry: false,
    practice: null,
    agentDock: false,
    nextMessage,
    nextConversation
  });
  const effects = [{ type: "ai.archived", carry }];
  if (chat.process === null) return same3(next, effects);
  const ended = core(next, { type: "process.end", id: chat.process });
  return { state: ended.state, effects: [...effects, ...ended.effects] };
}
function conversationTitleImpl(messages) {
  const first = messages.find((message) => message.role === "user")?.text ?? messages.find((message) => message.role === "assistant")?.title ?? "AI \u5BF9\u8BDD";
  return first.length > 28 ? `${first.slice(0, 28)}\u2026` : first;
}
function say(state, reply2) {
  return append(withChat(state, { draft: null }), { role: "assistant", ...reply2 });
}
function append(state, message) {
  const id = state.chat.nextMessage + 1;
  return withChat(state, { nextMessage: id, messages: Object.freeze([...state.chat.messages, Object.freeze({ ...message, id })]) });
}
var same3 = (state, effects = []) => ({ state, effects });
var then3 = (step2, next) => {
  const after = next(step2.state);
  return { state: after.state, effects: [...step2.effects, ...after.effects] };
};
var withChat = (state, patch) => Object.freeze({ ...state, chat: Object.freeze({ ...state.chat, ...patch }) });

// session/impl/model/ai-script/tell.ts
var STEP_ACTIONS = [
  { action: "script.resume", label: "\u7EE7\u7EED\u8BB2\u89E3" },
  { action: "script.skip", label: "\u8DF3\u8FC7" },
  { action: "script.write", label: "\u5199\u8FD9\u4E00\u6BB5" },
  { action: "script.follow", label: "\u81EA\u5DF1\u5199" },
  { action: "script.check", label: "\u68C0\u67E5\u5E76\u7EE7\u7EED" },
  { action: "script.hint", label: "\u7ED9\u6211\u63D0\u793A" },
  { action: "script.next", label: "\u7EE7\u7EED" },
  { action: "script.pause", label: "\u6682\u505C\u8BB2\u89E3" }
];
var STOP = { action: "script.stop", label: "\u7ED3\u675F\u8BB2\u89E3" };
var idleTellingImpl = () => Object.freeze({
  venue: null,
  script: null,
  step: -1,
  paused: false,
  asked: false,
  answered: null,
  handedOver: false,
  docked: ""
});
function followTellingImpl(before, step2, event4) {
  const { state } = step2;
  const told = state.telling;
  if (event4.type === "telling.bind") {
    const venue = event4.venue === "chat" || event4.venue === "rail" ? event4.venue : null;
    return { state: withTelling(state, { ...idleTellingImpl(), venue, script: state.lecture.script, paused: state.lecture.paused }), effects: step2.effects };
  }
  if (told.venue === null) return step2;
  const narrate = told.venue === "chat";
  const { lecture, chat } = state;
  const said = [];
  let next = told;
  const patch = (changes) => {
    next = Object.freeze({ ...next, ...changes });
  };
  const dock = (actions) => {
    const key = JSON.stringify(actions);
    if (key === next.docked) return;
    patch({ docked: key });
    said.push({ type: "ai.dock", actions });
  };
  if (event4.type === "ai.ask" && lecture.script !== null && !lecture.paused) said.push({ type: "script.pause" });
  if (narrate && step2.effects.some((effect) => effect.type === "ai.archived")) {
    patch({ script: null });
    if (lecture.script !== null) said.push({ type: "script.stop" });
  }
  if (before.lecture !== lecture) {
    const current = lecture.script;
    if (current === null) {
      if (next.script !== null && narrate) dock([]);
      if (next.script !== null && next.handedOver) said.push({ type: "ai.open" });
      patch({ script: null, handedOver: false });
    } else {
      const started = current !== next.script;
      const moved = started || lecture.step !== next.step;
      const resumed = next.paused && !lecture.paused;
      if (narrate && moved) {
        if (!chat.open) said.push({ type: "ai.open" });
        const { title } = current.steps[lecture.step];
        const text2 = scriptBeatsImpl(current.steps[lecture.step].say).map((beat, index) => `${index > 0 && beat.paragraph === true ? "\n\n" : ""}${beat.say}`).join("");
        said.push({ type: "ai.say", reply: { ...title === void 0 ? {} : { title }, text: text2 } });
      }
      if (!narrate && (started || resumed) && chat.open) said.push({ type: "ai.close" });
      if (!narrate && started) patch({ handedOver: chat.messages.length > 0 });
      if (moved) patch({ asked: false, answered: null });
      patch({ script: current, step: lecture.step, paused: lecture.paused });
      if (narrate) {
        const { predict, offer } = current.steps[lecture.step];
        if (predict !== void 0 && lecture.predicting && !next.asked) {
          patch({ asked: true });
          said.push({ type: "ai.say", reply: { text: predict.question } });
        }
        if (predict !== void 0 && lecture.answer !== null && lecture.answer !== next.answered) {
          patch({ answered: lecture.answer });
          const reply2 = predictionReplyImpl(predict, lecture.answer);
          if (reply2 !== null) said.push({ type: "ai.say", reply: { text: reply2 } });
        }
        const choices = predict !== void 0 && lecture.predicting ? predict.choices.map((choice, index) => ({ action: "script.choose", label: choice.label, args: { index } })) : [];
        const offers = (offer ?? []).map(({ action, args, label }) => ({ action, label, ...args === void 0 ? {} : { args } }));
        dock([...choices, ...STEP_ACTIONS, ...offers, STOP]);
      }
    }
  }
  return next === told && said.length === 0 ? step2 : { state: withTelling(state, next), effects: [...step2.effects, ...said] };
}
var withTelling = (state, telling) => Object.freeze({ ...state, telling });

// session/impl/model/navigate/state.ts
import { sourceOccurrences, variableTimeline } from "./pico.js";
var options = /* @__PURE__ */ new WeakMap();
var pending = /* @__PURE__ */ new WeakMap();
function createNavigate(value) {
  const state = {};
  options.set(state, value);
  return state;
}
function focus(state, event4, { emit }) {
  emit({ type: "stage.reveal", keys: [options.get(state).panel] });
  emit({ type: "debugger.variable", name: event4.name });
}
function locate(state, event4, { emit }) {
  const request = event4.request === void 0 ? {} : { request: event4.request };
  const { editor: editor2, playback, panel } = options.get(state);
  const target2 = event4.target;
  const result = executions(target2, editor2.source, playback.trace);
  if (typeof result === "string") {
    emit({ type: "navigate.failed", target: target2, reason: result, ...request });
    return;
  }
  const current = playback.position?.traceIndex ?? 0;
  const traceIndex = event4.occurrence === void 0 ? result.find((index) => index >= current) ?? result[0] : result[event4.occurrence - 1];
  if (traceIndex === void 0) {
    emit({ type: "navigate.failed", target: target2, reason: "no-match", ...request });
    return;
  }
  emit({ type: "stage.reveal", keys: [panel] });
  emit({ type: "selection.select", selection: target2 });
  emit({ type: "debugger.seek", traceIndex });
  emit({ type: "navigate.located", target: target2, traceIndex, ...request });
  pending.set(state, { target: target2, traceIndex });
}
function settle(state, event4, { emit }) {
  const located = pending.get(state);
  if (located === void 0 || event4.current !== located.target) return;
  pending.delete(state);
  emit({ type: "debugger.seek", traceIndex: located.traceIndex });
}
function executions(target2, source2, run2) {
  if (target2.kind === "world-object") return "unsupported";
  if (run2 === null) return "no-run";
  if (target2.kind === "source" ? target2.source !== source2 : target2.run !== run2) return "stale";
  const points = target2.kind === "source" ? sourceOccurrences(run2, target2).map((point) => point.traceIndex) : target2.kind === "runtime-variable" ? variableTimeline(target2).map((point) => point.traceIndex) : [target2.traceIndex];
  return points.length === 0 ? "no-match" : points;
}
function lineSelectionImpl(source2, line) {
  const lines = source2.split("\n");
  if (!Number.isInteger(line) || line < 1 || line > lines.length) return null;
  const start2 = lines.slice(0, line - 1).reduce((offset, text3) => offset + text3.length + 1, 0);
  const text2 = lines[line - 1];
  const indent = text2.length - text2.trimStart().length;
  if (text2.trim() === "") return null;
  return { kind: "source", source: source2, from: start2 + indent, to: start2 + text2.trimEnd().length };
}

// session/impl/model/annotation/state.ts
var ANNOTATION_BUDGET = Object.freeze({ mark: 3, note: 2, link: 1 });
var NOTE_LIMIT = 40;
function annotationFailure(state, event4) {
  return event4.owner === null ? "no-owner" : overBudget(state, event4.kind) ? "budget" : tooLong(event4.text) ? "too-long" : null;
}
function overBudget(state, kind) {
  return state.items.filter((item) => item.kind === kind).length >= ANNOTATION_BUDGET[kind];
}
function tooLong(text2) {
  return typeof text2 === "string" && [...text2].length > NOTE_LIMIT;
}
function readKind(kind) {
  return kind === "mark" || kind === "note" || kind === "link" ? kind : null;
}
function anchorHost({ get }) {
  return { source: get(editorHost)?.source ?? "", trace: get(playbackHost)?.trace ?? null };
}
function bindAnchor(host, ref) {
  if (typeof ref !== "object" || ref === null || Array.isArray(ref)) return null;
  const { line, text: text2, object: object2, variable, step: step2, output } = ref;
  const run2 = host.trace;
  if (typeof object2 === "string") return run2 === null ? null : Object.freeze({ kind: "world-object", run: run2, objectId: object2 });
  if (typeof variable === "string") return run2 === null || variable === "" ? null : Object.freeze({ kind: "runtime-variable", run: run2, path: Object.freeze(["variables", variable]) });
  if (typeof step2 === "number") {
    return run2 === null || !Number.isInteger(step2) || step2 < 1 || step2 > run2.steps.length + 1 ? null : Object.freeze({ kind: "trace-step", run: run2, traceIndex: step2 });
  }
  if (typeof output === "number") return run2 === null || !Number.isInteger(output) || output < 1 ? null : Object.freeze({ kind: "output-line", run: run2, line: output });
  if (typeof line !== "number") return null;
  const source2 = host.source;
  const whole = lineSelectionImpl(source2, line);
  if (whole?.kind !== "source" || text2 === void 0) return whole?.kind === "source" ? whole : null;
  if (typeof text2 !== "string" || text2 === "") return null;
  const at = source2.slice(whole.from, whole.to).indexOf(text2);
  return at < 0 ? null : Object.freeze({ kind: "source", source: source2, from: whole.from + at, to: whole.from + at + text2.length });
}
function refusal(host, args, state) {
  const kind = readKind(args.kind);
  if (kind === null || bindAnchor(host, args.at) === null) return "invalid";
  if (kind === "link" ? bindAnchor(host, args.to) === null : args.to !== void 0) return "invalid";
  if (args.text !== void 0 && typeof args.text !== "string" || kind === "note" && typeof args.text !== "string") return "invalid";
  if (tooLong(args.text)) return "too-long";
  return state === null ? "no-state" : overBudget(state, kind) ? "budget" : null;
}
function annotationAddEvent(host, args, owner, marks) {
  const failure2 = refusal(host, args, marks);
  if (failure2 !== null) return { type: "annotation.failed", reason: failure2 };
  const { at, to, text: text2 } = args;
  return {
    type: "annotation.add",
    owner,
    kind: readKind(args.kind),
    anchor: bindAnchor(host, at),
    ...to === void 0 ? {} : { to: bindAnchor(host, to) },
    ...typeof text2 === "string" ? { text: text2 } : {}
  };
}
function registerResolverImpl(registry2, resolver) {
  registry2.resolvers.add(resolver);
  return () => {
    registry2.resolvers.delete(resolver);
  };
}
function locateImpl(registry2, anchor) {
  for (const resolver of registry2.resolvers) if (resolver.accepts(anchor)) return resolver.locate(anchor);
  return null;
}
function revealImpl(registry2, anchor) {
  for (const resolver of registry2.resolvers) if (resolver.accepts(anchor)) resolver.reveal?.(anchor);
}

// session/impl/model/playground/allowed.ts
function eventActor(event4) {
  const { actor } = event4;
  return actor === "script" || actor === "ai" || actor === "host" ? actor : "student";
}
var BORROWS = /* @__PURE__ */ new Set(["source.apply", "source.preview"]);
var STUDENT_WRITES = /* @__PURE__ */ new Set(["editor.changed", "script.follow", "script.hint", "script.check"]);
function allowed(state, event4, actor) {
  if (actor === "student" && STUDENT_WRITES.has(event4.type) && state.code.presenter !== null) return "presenting";
  if (BORROWS.has(event4.type) && actor !== "script" && actor !== "ai") return "borrowers-only";
  if (event4.type === "source.restore" && actor === "student") return "borrowers-only";
  if (event4.type === "source.replace" && actor !== "host") return "host-only";
  if (event4.type === "source.replace" && state.code.lent !== null) return "locked";
  if ((event4.type === "source.apply" || event4.type === "source.preview") && state.code.lent !== null && state.code.lent.to !== event4.origin) return "busy";
  if (event4.type === "review.show" && state.code.lent !== null && state.code.lent.to !== state.review.process) return "busy";
  if (event4.type === "annotation.add") {
    if (typeof event4.owner !== "string") return "no-owner";
    const failure2 = annotationFailure(state.marks, event4);
    if (failure2 !== null) return failure2;
  }
  return null;
}
function refused(event4, reason) {
  if (event4.type === "source.apply" || event4.type === "source.preview") return [{ type: "source.failed", reason }];
  if (event4.type === "review.show") return [{ type: "review.failed", reason }];
  if (event4.type === "annotation.add") return [{ type: "annotation.failed", reason }];
  return [];
}

// session/impl/model/playground/reduce.ts
function initialPlayground(mine) {
  return Object.freeze({
    processes: Object.freeze([]),
    code: Object.freeze({ mine, revision: 0, lent: null, typing: null, presenter: null }),
    review: Object.freeze({ review: null, latest: null, process: null, serial: 0 }),
    lecture: idleLectureImpl(),
    marks: Object.freeze({ items: Object.freeze([]) }),
    markSerial: 0,
    hint: Object.freeze({ current: null }),
    tour: idleTourImpl(),
    chat: idleChatImpl(),
    telling: idleTellingImpl()
  });
}
function reducePlayground(state, event4) {
  const reduced = followTellingImpl(state, fold([
    reduceProcesses,
    reduceCode,
    reduceReview,
    reduceLecture,
    reduceAnnotations,
    reduceHint,
    reduceTour,
    reduceChat,
    (next) => followCodeImpl(next, coreAs("script")),
    followLectureImpl
  ], state, event4), event4);
  if (reduced.state === state) return reduced;
  return { state: reduced.state, effects: [...reduced.effects, ...notices(state, reduced.state), { type: "playground.changed" }] };
}
var coreAs = (actor) => (state, event4) => reduceCore(state, event4, actor);
function reduceCore(state, event4, actor) {
  const refusal2 = allowed(state, event4, actor);
  if (refusal2 !== null) return unchanged(state, refused(event4, refusal2));
  return fold([reduceProcesses, reduceCode, reduceReview, reduceAnnotations, reduceHint], state, event4);
}
function fold(reducers, state, event4) {
  return reducers.reduce((step2, reduce) => {
    const next = reduce(step2.state, event4);
    return { state: next.state, effects: [...step2.effects, ...next.effects] };
  }, { state, effects: [] });
}
function reduceLecture(state, event4) {
  return reduceLectureImpl(state, event4, coreAs("script"));
}
function reduceAnnotations(state, event4) {
  const replace2 = (items, serial = state.markSerial) => {
    const marks = Object.freeze({ items: Object.freeze(items) });
    return { state: Object.freeze({ ...state, marks, markSerial: serial }), effects: [{ type: "annotation.changed", items: marks.items }] };
  };
  if (event4.type === "annotation.add") {
    const addition = event4;
    const serial = state.markSerial + 1;
    const item = Object.freeze({
      id: `${addition.owner}#${serial}`,
      owner: addition.owner,
      kind: addition.kind,
      anchor: addition.anchor,
      ...addition.to === void 0 ? {} : { to: addition.to },
      ...addition.text === void 0 ? {} : { text: addition.text }
    });
    return replace2([...state.marks.items, item], serial);
  }
  const owner = event4.type === "annotation.clear" ? event4.owner : null;
  if (typeof owner !== "string" || !state.marks.items.some((item) => item.owner === owner)) return unchanged(state);
  return replace2(state.marks.items.filter((item) => item.owner !== owner));
}
function reduceHint(state, event4) {
  const replace2 = (current) => {
    const hint2 = Object.freeze({ current });
    return { state: Object.freeze({ ...state, hint: hint2 }), effects: [{ type: "hint.changed", current }] };
  };
  if (event4.type === "hint.show") {
    const { owner, source: source2, at, to, text: text2 } = event4;
    if (typeof owner !== "string" || typeof source2 !== "string" || typeof text2 !== "string" || !Number.isInteger(at) || at < 0 || at > source2.length || to !== void 0 && (!Number.isInteger(to) || to < at || to > source2.length)) return unchanged(state);
    return replace2(Object.freeze({ owner, source: source2, at, ...to === void 0 ? {} : { to }, text: text2 }));
  }
  if (event4.type !== "hint.clear" || state.hint.current?.owner !== event4.owner) return unchanged(state);
  return replace2(null);
}
function reduceTour(state, event4) {
  return reduceTourImpl(state, event4, reduceProcesses);
}
function reduceChat(state, event4) {
  return reduceChatImpl(state, event4, coreAs("ai"));
}
function reduceProcesses(state, event4) {
  const active = state.processes;
  const changed = (next, effects = []) => {
    const updated = Object.freeze({ ...state, processes: Object.freeze(next) });
    return { state: updated, effects };
  };
  switch (event4.type) {
    case "process.start": {
      const parent = typeof event4.parent === "string" ? event4.parent : null;
      if (typeof event4.id !== "string" || typeof event4.kind !== "string" || active.some((item) => item.id === event4.id) || parent !== null && !active.some((item) => item.id === parent)) return unchanged(state);
      return changed([...active, Object.freeze({ id: event4.id, kind: event4.kind, parent })]);
    }
    case "process.end": {
      if (!active.some((item) => item.id === event4.id)) return unchanged(state);
      const ending = /* @__PURE__ */ new Set();
      const collect = (id) => {
        ending.add(id);
        for (const child of active) if (child.parent === id) collect(child.id);
      };
      collect(event4.id);
      const ended = active.filter((item) => ending.has(item.id)).reverse();
      const remaining = changed(active.filter((item) => !ending.has(item.id)));
      return ended.reduce((step2, item) => {
        const released = release(step2.state, item.id);
        return { state: released.state, effects: [...step2.effects, ...released.effects, { type: "process.ended", id: item.id, kind: item.kind }] };
      }, remaining);
    }
    default:
      return unchanged(state);
  }
}
function notices(before, after) {
  const locked = after.code.lent !== null;
  const draft = before.code.revision === after.code.revision && before.code.lent !== null === locked ? [] : [{ type: "source.draft.changed", revision: after.code.revision, source: after.code.mine, locked }];
  const review2 = before.review.review === after.review.review ? [] : [{ type: "review.changed", review: after.review.review }];
  const lecture = before.lecture === after.lecture ? [] : [{ type: "script.changed", ...after.lecture }];
  const tour2 = before.tour === after.tour ? [] : [{ type: "tour.changed", ...after.tour }];
  const chat = before.chat === after.chat ? [] : [{ type: "ai.changed", ...after.chat }];
  return [...draft, ...review2, ...lecture, ...tour2, ...chat];
}
var unchanged = (state, effects = []) => ({ state, effects });
var withCode = (state, patch) => Object.freeze({ ...state, code: Object.freeze({ ...state.code, ...patch }) });
var write = (code2) => [{ type: "editor.render", source: code2 }, { type: "editor.changed", source: code2 }];
var sourceChanged = (code2) => ({
  type: "source.changed",
  base: code2.lent === null ? null : { code: code2.mine, origin: code2.lent.to }
});
function lend(state, to, code2) {
  const next = withCode(state, { lent: Object.freeze({ to, code: code2 }), typing: null });
  return { state: next, effects: [sourceChanged(next.code), ...write(code2)] };
}
function release(state, process) {
  const { code: code2 } = state;
  const returned = code2.lent?.to === process;
  const patch = {
    ...returned ? { lent: null, typing: null } : code2.typing?.origin === process ? { typing: null } : {},
    ...code2.presenter === process ? { presenter: null } : {}
  };
  let next = Object.keys(patch).length === 0 ? state : withCode(state, patch);
  const effects = returned ? [...write(code2.mine), sourceChanged(next.code)] : next.code.typing !== code2.typing ? [sourceChanged(next.code)] : [];
  const items = state.marks.items.filter((item) => item.owner !== process);
  if (items.length !== state.marks.items.length) {
    const marks = Object.freeze({ items: Object.freeze(items) });
    next = Object.freeze({ ...next, marks });
    effects.push({ type: "annotation.changed", items: marks.items });
  }
  if (state.hint.current?.owner === process) {
    next = Object.freeze({ ...next, hint: Object.freeze({ current: null }) });
    effects.push({ type: "hint.changed", current: null });
  }
  if (state.tour.process === process) {
    next = Object.freeze({ ...next, tour: idleTourImpl(state.tour.serial) });
    effects.push(...cancelledTourImpl(state.tour));
  }
  if (state.review.process === process) {
    next = Object.freeze({ ...next, review: Object.freeze({ ...state.review, review: null, process: null }) });
  }
  return { state: next, effects };
}
function reduceCode(state, event4) {
  const { code: code2 } = state;
  switch (event4.type) {
    case "editor.changed": {
      const text2 = event4.source;
      if (typeof text2 !== "string" || text2 === shownCodeImpl(state)) return unchanged(state);
      return unchanged(withCode(state, code2.lent === null ? { mine: text2, revision: code2.revision + 1 } : { lent: Object.freeze({ ...code2.lent, code: text2 }) }));
    }
    case "source.apply":
      if (typeof event4.origin !== "string" || typeof event4.code !== "string") return unchanged(state);
      return lend(state, event4.origin, event4.code);
    case "source.preview": {
      if (typeof event4.origin !== "string" || typeof event4.code !== "string") return unchanged(state);
      const next = withCode(state, {
        lent: code2.lent ?? Object.freeze({ to: event4.origin, code: code2.mine }),
        typing: Object.freeze({ origin: event4.origin, code: event4.code })
      });
      return { state: next, effects: [sourceChanged(next.code)] };
    }
    case "source.restore":
      if (code2.lent === null || event4.origin !== void 0 && event4.origin !== code2.lent.to) return unchanged(state);
      return release(state, code2.lent.to);
    case "source.replace":
      if (typeof event4.source !== "string") return unchanged(state);
      return { state: withCode(state, { mine: event4.source, revision: event4.source === code2.mine ? code2.revision : code2.revision + 1 }), effects: write(event4.source) };
    case "code.present":
      return typeof event4.process !== "string" || code2.presenter === event4.process ? unchanged(state) : unchanged(withCode(state, { presenter: event4.process }));
    default:
      return unchanged(state);
  }
}
function reduceReview(state, event4) {
  const slice = state.review;
  const close = () => {
    if (slice.process === null) return unchanged(state);
    const released = release(state, slice.process);
    const processes = Object.freeze(released.state.processes.filter((item) => item.id !== slice.process));
    return { state: Object.freeze({ ...released.state, processes }), effects: [...released.effects, { type: "process.ended", id: slice.process, kind: "review" }] };
  };
  switch (event4.type) {
    case "review.attach": {
      if (!isReview(event4.review)) return unchanged(state);
      const frozen = freezeReview(event4.review);
      return unchanged(
        Object.freeze({ ...state, review: Object.freeze({ ...slice, latest: frozen }) }),
        [{ type: "review.attached", review: frozen }]
      );
    }
    case "review.show": {
      if (!isReview(event4.review)) return unchanged(state);
      const closed = close();
      const process = `review:${state.review.serial + 1}`;
      const shown2 = freezeReview(event4.review);
      const lent = lend(withCode(closed.state, { presenter: process }), process, shown2.source);
      const review2 = Object.freeze({ ...slice, review: shown2, process, serial: state.review.serial + 1 });
      const processes = Object.freeze([...lent.state.processes, Object.freeze({ id: process, kind: "review", parent: null })]);
      return { state: Object.freeze({ ...lent.state, review: review2, processes }), effects: [...closed.effects, ...lent.effects] };
    }
    case "review.close":
      return close();
    case "process.start":
      return event4.kind === "script" ? close() : unchanged(state);
    default:
      return unchanged(state);
  }
}

// session/impl/model/playground/lock.ts
import { EditorState as EditorState2, Transaction as Transaction2 } from "./libs/codemirror.js";
function editLockImpl(editable2) {
  return EditorState2.changeFilter.of((transaction) => editable2() || transaction.annotation(Transaction2.userEvent) === void 0);
}

// session/api/model/playground.ts
var shownCode = (state) => shownCodeImpl(state);
var codeLocked = (state) => codeLockedImpl(state);
var editable = (state) => editableImpl(state);
var codeOwner = (state) => codeOwnerImpl(state);
var INPUTS = [
  "process.start",
  "process.end",
  "editor.changed",
  "source.apply",
  "source.preview",
  "source.restore",
  "source.replace",
  "code.present",
  "review.attach",
  "review.show",
  "review.close",
  "script.play",
  "script.stop",
  "script.write",
  "script.follow",
  "script.hint",
  "script.check",
  "script.next",
  "script.choose",
  "script.skip",
  "source.hurry",
  "script.pause",
  "script.resume",
  "script.waited",
  "session.queried",
  "annotation.add",
  "annotation.clear",
  "hint.show",
  "hint.clear",
  "tour.play",
  "tour.stop",
  "tour.dwelt",
  "session.settled",
  "ai.hydrate",
  "ai.open",
  "ai.close",
  "ai.renew",
  "ai.compose",
  "ai.ask",
  "ai.quote",
  "ai.unquote",
  "ai.say",
  "ai.dock",
  "ai.locate",
  "navigate.located",
  "navigate.failed",
  "ai.progress",
  "ai.drafted",
  "ai.answered",
  "ai.carry",
  "telling.bind"
];
var EFFECTS = [
  "playground.changed",
  "process.ended",
  "editor.render",
  "editor.changed",
  "source.changed",
  "source.failed",
  "source.draft.changed",
  "review.attached",
  "review.changed",
  "review.failed",
  "script.changed",
  "script.predicted",
  "script.expectation",
  "script.wait",
  "session.query.request",
  "stage.enter",
  "annotation.changed",
  "annotation.failed",
  "hint.changed",
  "tour.changed",
  "tour.finished",
  "tour.cancelled",
  "tour.dwell",
  "debugger.seek",
  "session.invoke",
  "ai.changed",
  "ai.requested",
  "ai.archived",
  "ai.practice",
  "navigate.locate",
  "ai.open",
  "ai.close",
  "ai.say",
  "ai.dock",
  "script.pause",
  "script.stop"
];
function step(store, event4, { emit }) {
  const state = store.getSnapshot();
  const refusal2 = allowed(state, event4, eventActor(event4));
  if (refusal2 !== null) {
    for (const effect of refused(event4, refusal2)) emit(effect);
    return;
  }
  const next = reducePlayground(state, event4);
  store.set(next.state);
  for (const effect of next.effects) emit(effect);
}
var loop = stateful("playground", (mine) => createState(initialPlayground(mine)), INPUTS.map((type2) => on(type2, step, EFFECTS)));
var playground = feature("playground", {
  requires: [editorHost],
  create: ({ bus, get, own }) => {
    const instance = own(loop.create(get(editorHost).source, bus));
    const { getSnapshot, subscribe } = instance.state;
    return Object.freeze({ getSnapshot, subscribe });
  },
  views: [{ slot: "editor-extension", extension: ({ get }) => {
    const state = get(playground);
    return state === null ? [] : editLockImpl(() => editableImpl(state.getSnapshot()));
  } }]
});

// session/api/model/source.ts
function sharedEnds(before, after) {
  return sharedLinesImpl(before, after);
}
var sourceDraft = (state) => {
  if (state === null) return null;
  return { revision: state.code.revision, source: state.code.mine, locked: codeLocked(state) };
};
var code = ({ get }) => get(playground)?.getSnapshot() ?? null;
var source = feature("source", {
  requires: [playground],
  queries: [{
    id: "source.draft",
    run: (context) => sourceDraft(code(context))
  }],
  actions: [{
    id: "source.replace",
    label: "\u66FF\u6362\u5B66\u751F\u4EE3\u7801",
    args: { source: { type: "string" } },
    when: (context, _args, actor) => {
      const state = code(context);
      return state !== null && allowed(state, { type: "source.replace" }, actor) === null;
    },
    event: (_context, { source: replacement }) => ({ type: "source.replace", source: replacement })
  }, {
    id: "source.explain",
    label: "\u5728\u4E34\u65F6\u4EE3\u7801\u4E2D\u8BB2\u89E3",
    tags: ["edit"],
    args: { source: { type: "string" } },
    when: (context, { source: demo }, actor) => {
      const lent = code(context)?.code.lent;
      return actor === "ai" && typeof demo === "string" && demo.length <= 5e4 && lent !== void 0 && (lent === null || lent.to.startsWith("ai:"));
    },
    event: (_context, { source: demo }, caller) => caller.process === null ? { type: "source.failed", reason: "busy" } : { type: "source.apply", origin: caller.process, code: demo }
  }, {
    id: "source.restore",
    label: "\u6062\u590D\u6211\u7684\u4EE3\u7801",
    tags: ["edit"],
    when: (context, _args, actor) => actor === "ai" && (code(context)?.code.lent ?? null) !== null,
    event: (_context, _args, caller) => caller.process === null ? { type: "source.failed", reason: "busy" } : { type: "source.restore", origin: caller.process }
  }],
  views: [{ slot: "editor-extension", extension: () => minimalWritesImpl }]
});

// session/api/model/review.ts
var reviewStatus = (state) => {
  const current = state?.review ?? null;
  return { open: current !== null, submissionId: current?.submissionId ?? null, title: current?.title ?? null, count: current?.comments.length ?? 0 };
};
var reviewLatest = (state) => {
  const latest = state?.latest ?? null;
  return latest === null ? null : {
    title: latest.title,
    comments: latest.comments.map((comment) => ({ kind: comment.kind, text: comment.text, line: comment.from.line }))
  };
};
var shown = (get) => get(playground)?.getSnapshot().review ?? null;
var review = feature("review", {
  requires: [playground],
  actions: [
    {
      id: "review.attach",
      label: "\u9644\u4E0A\u8001\u5E08\u7684\u6279\u6CE8",
      args: { review: { type: "object" } },
      when: (_context, args) => isReview(args.review),
      event: (_context, args) => ({ type: "review.attach", review: args.review })
    },
    {
      id: "review.show",
      label: "\u770B\u8001\u5E08\u7684\u6279\u6CE8",
      args: { review: { type: "object" } },
      when: (_context, args) => isReview(args.review),
      event: (_context, args) => ({ type: "review.show", review: args.review })
    },
    { id: "review.close", label: "\u56DE\u5230\u6211\u7684\u4EE3\u7801", when: ({ get }) => shown(get)?.review != null, event: () => ({ type: "review.close" }) }
  ],
  queries: [
    { id: "review.status", run: ({ get }) => reviewStatus(shown(get)) },
    { id: "review.latest", run: ({ get }) => reviewLatest(shown(get)) }
  ]
});

// session/impl/model/stage/shape.ts
function isStage(value) {
  if (typeof value !== "object" || value === null) return false;
  const { panels, focus: focus2, code: code2, pinned, arrange, sizes } = value;
  const keys = (list) => Array.isArray(list) && list.every((key) => typeof key === "string");
  return keys(panels) && (focus2 === void 0 || typeof focus2 === "string") && (code2 === void 0 || code2 === "narrow" || code2 === "normal" || code2 === "wide") && (pinned === void 0 || keys(pinned)) && (arrange === void 0 || isArea(arrange, /* @__PURE__ */ new Set())) && (sizes === void 0 || typeof sizes === "object" && sizes !== null && Object.values(sizes).every((size) => typeof size === "number" && size > 0));
}
function isArea(node, slots) {
  if (typeof node !== "object" || node === null) return false;
  const { slot, split: split2, children } = node;
  if (typeof slot === "string") {
    if (slot === "" || slots.has(slot)) return false;
    slots.add(slot);
    return true;
  }
  return (split2 === "row" || split2 === "column") && Array.isArray(children) && children.length > 0 && children.every((child) => isArea(child, slots));
}

// session/impl/model/script/validate.ts
var SCRIPT_KEYS = ["id", "title", "from", "mode", "auto", "steps"];
var STEP_KEYS = ["title", "concepts", "say", "do", "write", "stage", "offer", "expect", "predict"];
var EXPECT_KEYS = ["query", "args", "path", "equals"];
var PREDICT_KEYS = ["question", "choices"];
var CHOICE_KEYS = ["label", "correct", "reply", "next"];
var BEAT_KEYS = ["say", "paragraph", "do", "write"];
function validateScriptImpl(value, descriptor) {
  const problems = [];
  const fail = (path2, message) => {
    problems.push(Object.freeze({ path: path2, message }));
  };
  const string = (fields, key, path2, required = false) => {
    if (fields[key] === void 0 ? required : typeof fields[key] !== "string") fail(`${path2}${key}`, required ? "\u5E94\u4E3A\u5B57\u7B26\u4E32\uFF0C\u5FC5\u586B" : "\u5E94\u4E3A\u5B57\u7B26\u4E32");
  };
  const known = (fields, keys, path2) => {
    for (const key of Object.keys(fields)) if (!keys.includes(key)) fail(`${path2}${key}`, "\u8BB2\u7A3F\u6CA1\u6709\u8FD9\u4E2A\u5B57\u6BB5");
  };
  const call = (item, path2, labelled) => {
    if (!isObject(item) || typeof item.action !== "string") return fail(path2, labelled ? "\u5E94\u4E3A { action, args?, label }" : "\u5E94\u4E3A { action, args? }");
    if (labelled) string(item, "label", `${path2}.`, true);
    if (item.args !== void 0 && !isObject(item.args)) return fail(`${path2}.args`, "\u5E94\u4E3A\u5BF9\u8C61");
    const declared = descriptor.actions.find((action) => action.id === item.action);
    if (declared === void 0) return fail(`${path2}.action`, `\u4F1A\u8BDD\u6CA1\u6709 Action ${item.action}`);
    if (!argsMatch2(declared.args, item.args ?? {})) fail(`${path2}.args`, `\u4E0E ${item.action} \u7684\u53C2\u6570\u5F62\u72B6\u4E0D\u7B26`);
  };
  const calls = (list, path2, labelled = false) => {
    if (list === void 0) return;
    if (!Array.isArray(list)) return fail(path2, "\u5E94\u4E3A\u5217\u8868");
    list.forEach((item, index) => call(item, `${path2}[${index}]`, labelled));
  };
  if (!isObject(value)) return [Object.freeze({ path: "", message: "\u8BB2\u7A3F\u5E94\u4E3A\u5BF9\u8C61" })];
  known(value, SCRIPT_KEYS, "");
  string(value, "id", "", true);
  string(value, "title", "", true);
  string(value, "from", "");
  if (value.mode !== void 0 && value.mode !== "instruction") fail("mode", '\u53EA\u80FD\u662F "instruction"');
  if (value.auto !== void 0 && typeof value.auto !== "boolean") fail("auto", "\u5E94\u4E3A\u5E03\u5C14\u503C");
  if (!Array.isArray(value.steps) || value.steps.length === 0) {
    fail("steps", "\u5E94\u4E3A\u975E\u7A7A\u5217\u8868");
    return problems;
  }
  value.steps.forEach((step2, index) => {
    const path2 = `steps[${index}]`;
    if (!isObject(step2)) return fail(path2, "\u5E94\u4E3A\u5BF9\u8C61");
    known(step2, STEP_KEYS, `${path2}.`);
    string(step2, "title", `${path2}.`);
    if (step2.concepts !== void 0 && (!Array.isArray(step2.concepts) || !step2.concepts.every((concept) => typeof concept === "string"))) {
      fail(`${path2}.concepts`, "\u5E94\u4E3A\u5B57\u7B26\u4E32\u5217\u8868");
    }
    string(step2, "write", `${path2}.`);
    if (Array.isArray(step2.say)) {
      step2.say.forEach((beat, at) => {
        const where = `${path2}.say[${at}]`;
        if (!isObject(beat)) return fail(where, "\u5E94\u4E3A { say, do?, write? }");
        known(beat, BEAT_KEYS, `${where}.`);
        string(beat, "say", `${where}.`, true);
        string(beat, "write", `${where}.`);
        if (beat.paragraph !== void 0 && typeof beat.paragraph !== "boolean") fail(`${where}.paragraph`, "\u5E94\u4E3A\u5E03\u5C14\u503C");
        calls(beat.do, `${where}.do`);
      });
    } else if (typeof step2.say !== "string") {
      fail(`${path2}.say`, "\u5E94\u4E3A\u5B57\u7B26\u4E32\u6216\u53E5\u5B50\u5217\u8868\uFF0C\u5FC5\u586B");
    }
    calls(step2.do, `${path2}.do`);
    calls(step2.offer, `${path2}.offer`, true);
    if (step2.stage !== void 0 && !isStage(step2.stage)) fail(`${path2}.stage`, "\u4E0D\u662F\u5408\u6CD5\u7684\u821E\u53F0");
    if (step2.expect !== void 0) {
      if (!Array.isArray(step2.expect)) fail(`${path2}.expect`, "\u5E94\u4E3A\u5217\u8868");
      else step2.expect.forEach((item, at) => {
        const where = `${path2}.expect[${at}]`;
        if (!isObject(item)) return fail(where, "\u5E94\u4E3A { query, args?, path?, equals }");
        known(item, EXPECT_KEYS, `${where}.`);
        if (typeof item.query !== "string") fail(`${where}.query`, "\u5E94\u4E3A\u5B57\u7B26\u4E32\uFF0C\u5FC5\u586B");
        else if (!descriptor.queries.includes(item.query)) fail(`${where}.query`, `\u4F1A\u8BDD\u6CA1\u6709 Query ${item.query}`);
        if (item.args !== void 0 && !isObject(item.args)) fail(`${where}.args`, "\u5E94\u4E3A\u5BF9\u8C61");
        if (item.path !== void 0 && (!Array.isArray(item.path) || !item.path.every((key) => typeof key === "string" || typeof key === "number"))) {
          fail(`${where}.path`, "\u5E94\u4E3A\u5B57\u7B26\u4E32\u6216\u6570\u5B57\u7684\u5217\u8868");
        }
        if (!("equals" in item)) fail(`${where}.equals`, "\u5FC5\u586B");
      });
    }
    if (step2.predict !== void 0) {
      const where = `${path2}.predict`;
      if (!isObject(step2.predict)) fail(where, "\u5E94\u4E3A { question, choices }");
      else {
        known(step2.predict, PREDICT_KEYS, `${where}.`);
        string(step2.predict, "question", `${where}.`, true);
        const choices = step2.predict.choices;
        if (!Array.isArray(choices) || choices.length < 2 || choices.length > 6) fail(`${where}.choices`, "\u5E94\u4E3A 2 \u5230 6 \u4E2A\u9009\u9879");
        else choices.forEach((choice, at) => {
          const item = `${where}.choices[${at}]`;
          if (!isObject(choice)) return fail(item, "\u5E94\u4E3A { label, correct?, reply?, next? }");
          known(choice, CHOICE_KEYS, `${item}.`);
          string(choice, "label", `${item}.`, true);
          string(choice, "reply", `${item}.`);
          if (choice.correct !== void 0 && typeof choice.correct !== "boolean") fail(`${item}.correct`, "\u5E94\u4E3A\u5E03\u5C14\u503C");
          if (choice.next !== void 0 && !(Number.isInteger(choice.next) && choice.next >= 0 && choice.next < value.steps.length)) {
            fail(`${item}.next`, "\u4E0D\u662F\u8BB2\u7A3F\u91CC\u7684\u6B65\u9AA4");
          }
        });
      }
    }
  });
  return problems;
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// session/api/model/script.ts
var scriptCursor = (state) => {
  const current = state?.script ?? null;
  return current === null ? null : {
    id: current.id,
    title: current.title,
    step: state.step,
    steps: current.steps.length,
    beat: state.beat,
    narrating: state.narrating,
    writing: state.writing,
    paused: state.paused,
    done: state.done,
    predicting: state.predicting
  };
};
function isReadyToWrite(state) {
  return state?.script != null && !state.paused && !state.narrating && !state.predicting && state.writing === null && !state.done && state.script.steps[state.step]?.write !== void 0;
}
function isStudentWriting(state) {
  return state?.paused === false && (state.writing === "student" || state.writing === "student-hint");
}
function canAskAiToWrite(state) {
  return isReadyToWrite(state) || isStudentWriting(state);
}
function scriptBeats(step2) {
  return scriptBeatsImpl(step2.say);
}
function predictionReply(predict, index) {
  return predictionReplyImpl(predict, index);
}
function targetMatch(source2, target2) {
  return targetMatchImpl(source2, target2);
}
function validateScript(value, descriptor) {
  return validateScriptImpl(value, descriptor);
}
function validStep(script2, step2) {
  return step2 === void 0 || typeof step2 === "number" && Number.isInteger(step2) && step2 >= 0 && step2 < script2.steps.length;
}
var PACE = Object.freeze({ char: 40, beat: 600, settle: 900 });
var timer = {
  delay: (ms, run2) => {
    const handle = setTimeout(run2, ms);
    return () => clearTimeout(handle);
  }
};
var lectureOf = (get) => get(playground)?.getSnapshot().lecture ?? null;
function mayWrite({ get }, actor, type2) {
  const state = get(playground)?.getSnapshot();
  return state === void 0 || allowed(state, { type: type2 }, actor) === null;
}
var script = feature("script", {
  requires: [editorHost, playground, source],
  create: ({ bus, get, own }, options2) => {
    const pace = Object.freeze({ ...PACE, ...options2?.pace });
    const scheduler = options2?.scheduler ?? timer;
    const pending2 = /* @__PURE__ */ new Set();
    const stop2 = bus.subscribe(["script.wait", "script.expectation"], (event4) => {
      if (event4.type === "script.expectation") {
        if (event4.ok === false) console.warn("\u8BB2\u7A3F\u7684\u65AD\u8A00\u6CA1\u6709\u6210\u7ACB", event4);
        return;
      }
      if (event4.defer === true) {
        queueMicrotask(() => bus.emit({ type: "script.waited", ticket: event4.ticket }, "script"));
        return;
      }
      const cancel = scheduler.delay(event4.pace === void 0 ? event4.ms ?? 0 : pace[event4.pace], () => {
        pending2.delete(cancel);
        bus.emit({ type: "script.waited", ticket: event4.ticket }, "script");
      });
      pending2.add(cancel);
    });
    own({ dispose: () => {
      stop2();
      for (const cancel of pending2) cancel();
    } });
  },
  actions: [
    {
      id: "script.play",
      label: "\u5F00\u59CB\u8BB2\u89E3",
      args: { script: { type: "object" }, step: { type: "integer", optional: true, description: "\u4ECE\u7B2C\u51E0\u6B65\u8BB2\u8D77\uFF0C\u4ECE 0 \u5F00\u59CB" } },
      when: (_context, { script: value, step: step2 }) => isScript(value) && validStep(value, step2),
      event: (_context, { script: value, step: step2 }) => ({ type: "script.play", script: value, ...typeof step2 === "number" ? { step: step2 } : {} })
    },
    { id: "script.follow", label: "\u81EA\u5DF1\u5199", tags: ["edit"], when: (context, _args, actor) => mayWrite(context, actor, "script.follow") && isReadyToWrite(lectureOf(context.get)), event: () => ({ type: "script.follow" }) },
    { id: "script.hint", label: "\u7ED9\u6211\u63D0\u793A", tags: ["edit"], when: (context, _args, actor) => mayWrite(context, actor, "script.hint") && isStudentWriting(lectureOf(context.get)), event: () => ({ type: "script.hint" }) },
    { id: "script.check", label: "\u68C0\u67E5\u5E76\u7EE7\u7EED", tags: ["edit"], when: (context, _args, actor) => mayWrite(context, actor, "script.check") && isStudentWriting(lectureOf(context.get)), event: () => ({ type: "script.check" }) },
    { id: "script.write", label: "AI \u6765\u5199", when: ({ get }) => canAskAiToWrite(lectureOf(get)), event: () => ({ type: "script.write" }) },
    { id: "script.next", label: "\u7EE7\u7EED", when: ({ get }) => {
      const state = lectureOf(get);
      return state?.script != null && !state.paused && !state.predicting && state.writing === null && state.script.steps[state.step]?.write === void 0 && state.step < state.script.steps.length - 1;
    }, event: () => ({ type: "script.next" }) },
    { id: "script.choose", label: "\u56DE\u7B54", args: { index: { type: "integer" } }, when: ({ get }, { index }) => {
      const state = lectureOf(get);
      const choices = state?.script?.steps[state.step]?.predict?.choices ?? [];
      return state?.predicting === true && !state.paused && typeof index === "number" && index >= 0 && index < choices.length;
    }, event: (_context, { index }) => ({ type: "script.choose", index }) },
    { id: "script.pause", label: "\u6682\u505C\u8BB2\u89E3", when: ({ get }) => {
      const state = lectureOf(get);
      return state?.script != null && !state.paused;
    }, event: () => ({ type: "script.pause" }) },
    { id: "script.skip", label: "\u8DF3\u8FC7", when: ({ get }) => {
      const state = lectureOf(get);
      return state?.script != null && !state.paused && (state.narrating || state.writing === "typewriter");
    }, event: () => ({ type: "script.skip" }) },
    { id: "script.resume", label: "\u7EE7\u7EED\u8BB2\u89E3", when: ({ get }) => lectureOf(get)?.paused === true, event: () => ({ type: "script.resume" }) },
    { id: "script.stop", label: "\u7ED3\u675F\u8BB2\u89E3", when: ({ get }) => lectureOf(get)?.script != null, event: () => ({ type: "script.stop" }) }
  ],
  queries: [{ id: "script.cursor", run: ({ get }) => scriptCursor(lectureOf(get)) }]
});
function isScript(value) {
  return typeof value === "object" && value !== null && Array.isArray(value.steps) && value.steps.length > 0;
}

// session/impl/model/connection/connection.ts
var OPENING = Object.freeze({ status: "opening" });
var CLOSED = Object.freeze({ status: "closed" });
var NONE = Object.freeze([]);
function connectSessionImpl(bus, identity) {
  const status = createState2(OPENING);
  const evidence = /* @__PURE__ */ new Set();
  const projections = [];
  let session = null;
  let stopState = () => {
  };
  let disposed = false;
  const state = () => session?.get(playground)?.getSnapshot() ?? null;
  const refresh = () => {
    for (const project2 of projections) project2();
  };
  const project = (inputs, read, empty) => {
    const projected = createState2(empty);
    let seen = JSON.stringify(empty);
    let last = null;
    projections.push(() => {
      const current = session === null ? null : inputs();
      if (current !== null && last !== null && current.length === last.length && current.every((item, index) => Object.is(item, last[index]))) return;
      last = current;
      const next = current === null ? empty : read();
      const key = JSON.stringify(next);
      if (key === seen) return;
      seen = key;
      projected.set(next === null || typeof next !== "object" ? next : Object.freeze(next));
    });
    return Object.freeze({ getSnapshot: projected.getSnapshot, subscribe: projected.subscribe });
  };
  const draft = project(() => [state()?.code.mine, state()?.code.revision, state()?.code.lent === null], () => {
    const current = state();
    return current === null ? null : Object.freeze(sourceDraft(current));
  }, null);
  const review2 = project(() => [state()?.review.review], () => state() === null ? null : reviewStatus(state().review), null);
  const latestReview = project(() => [state()?.review.latest], () => state() === null ? null : reviewLatest(state().review), null);
  const lecture = project(() => [state()?.lecture], () => scriptCursor(state()?.lecture ?? null), null);
  const lectures = project(() => [session], () => library(session), NONE);
  const commands = project(() => [/* @__PURE__ */ Symbol()], () => available(session), NONE);
  let pending2 = false;
  const stops = [
    bus.subscribe(["session.ready"], (event4) => {
      if (disposed || status.getSnapshot().status === "closed") return;
      session = event4.session;
      stopState = session.get(playground)?.subscribe(refresh) ?? (() => {
      });
      status.set(Object.freeze({ status: "ready", descriptor: event4.descriptor }));
      refresh();
    }),
    bus.subscribe(["session.closed"], close),
    bus.subscribe(["session.evidence"], (event4) => {
      if (event4.payload !== void 0) for (const listener of [...evidence]) listener(event4.payload);
    }),
    bus.subscribeAll(() => {
      if (pending2 || session === null) return;
      pending2 = true;
      queueMicrotask(() => {
        pending2 = false;
        refresh();
      });
    })
  ];
  const waiting = /* @__PURE__ */ new Set();
  function close() {
    for (const settle2 of [...waiting]) settle2("unavailable");
    session = null;
    stopState();
    stopState = () => {
    };
    status.set(CLOSED);
    refresh();
  }
  const invoke = (call, actor = "host") => {
    if (disposed) return Promise.reject(new Error("Session connection is disposed"));
    if (session === null) return Promise.reject(new Error(status.getSnapshot().status === "closed" ? "Session is closed" : "Session is not ready"));
    const invoked = session.invoke(call, actor);
    return new Promise((resolve, reject) => {
      const settle2 = (outcome) => {
        waiting.delete(settle2);
        resolve(outcome);
        refresh();
      };
      waiting.add(settle2);
      invoked.then(settle2, (error) => {
        waiting.delete(settle2);
        reject(error);
      });
    });
  };
  return Object.freeze({
    identity: Object.freeze({ ...identity }),
    state: Object.freeze({ getSnapshot: status.getSnapshot, subscribe: status.subscribe }),
    draft,
    replaceSource: (source2) => invoke({ action: "source.replace", args: { source: source2 } }),
    review: review2,
    latestReview,
    attachReview: (value) => invoke({ action: "review.attach", args: { review: value } }),
    showReview: (value) => invoke({ action: "review.show", args: { review: value } }),
    closeReview: () => invoke({ action: "review.close" }),
    lecture,
    lectures,
    instruct: () => invoke({ action: "script.instruct" }),
    openLecture: (id, step2) => invoke({ action: "script.open", args: { id, ...typeof step2 === "number" ? { step: step2 } : {} } }),
    pauseLecture: () => invoke({ action: "script.pause" }),
    askAi: (text2) => invoke({ action: "ai.question", args: { text: text2 } }),
    commands,
    executeCommand: (action) => invoke({ action }, "student"),
    runCode: () => invoke({ action: "code.run" }),
    evidence: (listener) => {
      evidence.add(listener);
      return () => {
        evidence.delete(listener);
      };
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      for (const stop2 of stops) stop2();
      evidence.clear();
      close();
    }
  });
}
function available(session) {
  const enabled = new Set(resolveActions3(session.actions, session).filter((item) => item.enabled).map((item) => item.id));
  return session.actions.filter((action) => enabled.has(action.id) && Object.values(action.args ?? {}).every((arg) => arg.optional === true)).map((action) => Object.freeze({ id: action.id, label: action.label, tags: Object.freeze([...action.tags ?? []]) }));
}
function library(session) {
  if (!session.queries.some((query) => query.id === "script.library")) return NONE;
  const items = session.query("script.library");
  return Array.isArray(items) ? items.map((item) => Object.freeze({ id: String(item.id), title: String(item.title) })) : NONE;
}

// session/protocol.ts
function connectSession(bus, identity) {
  return connectSessionImpl(bus, identity);
}

// session/impl/model/ai/agent.ts
var MAX_STEPS = 12;
var MAX_RESULT = 6e3;
var HIDDEN = /^(ai\.|selection\.ask$|script\.(play|instruct|open)$|source\.(replace|explain|restore)$|annotation\.(clear|show)$|terminal\.highlight$)/;
var VERDICT_TITLE = { pass: "\u901A\u8FC7\u4E86", partial: "\u90E8\u5206\u901A\u8FC7", fail: "\u8FD8\u6CA1\u901A\u8FC7" };
async function runAgentImpl(port, bridge, transcript, request, signal, grading = false) {
  const descriptor = await bridge.describe();
  const tools = toolsOf(descriptor, grading);
  transcript.push({ role: "user", content: await userContent(request, bridge) });
  for (let step2 = 0; step2 < MAX_STEPS; step2 += 1) {
    bridge.progress(step2 === 0 ? "\u6B63\u5728\u60F3" : "\u6B63\u5728\u6574\u7406");
    const turn = await port.step({ messages: transcript, tools }, signal, (text2) => bridge.draft(text2));
    if (signal.aborted) return null;
    transcript.push({
      role: "assistant",
      content: turn.content,
      ...turn.calls.length === 0 ? {} : { calls: turn.calls },
      ...turn.reasoning === void 0 ? {} : { reasoning: turn.reasoning }
    });
    if (turn.calls.length === 0) {
      if (turn.content.trim() !== "") return { reply: { text: turn.content }, dock: [] };
      console.warn("\u8BFE\u7A0B agent \u6CA1\u6709\u7ED9\u51FA\u56DE\u7B54", { step: step2, reasoning: turn.reasoning?.slice(0, 300) ?? null });
      return { reply: { text: "\u6211\u6CA1\u60F3\u597D\u600E\u4E48\u56DE\u7B54\uFF0C\u6362\u4E2A\u8BF4\u6CD5\u518D\u95EE\u6211\u4E00\u6B21\uFF1F" }, dock: [] };
    }
    if (turn.content.trim() !== "") bridge.say({ text: turn.content });
    else bridge.draft(null);
    let end;
    for (const call of turn.calls) {
      const live = end === void 0 && !signal.aborted;
      if (live) bridge.progress(doing(call, descriptor));
      const outcome = live ? await execute(call, descriptor, bridge, grading) : { result: { skipped: "\u8FD9\u4E00\u8F6E\u5DF2\u7ECF\u7ED3\u675F" } };
      transcript.push({ role: "tool", call: call.id, content: clip(JSON.stringify(outcome.result)) });
      end ??= outcome.end;
    }
    if (signal.aborted) return null;
    if (end === "yield") return null;
    if (end !== void 0) return end;
  }
  return { reply: { text: "\u8FD9\u4E00\u8F6E\u505A\u7684\u4E8B\u6709\u70B9\u591A\uFF0C\u6211\u5148\u505C\u5728\u8FD9\u91CC\u3002\u4F60\u53EF\u4EE5\u63A5\u7740\u95EE\u6211\u3002" }, dock: [] };
}
var READING = {
  "python.result": "\u6B63\u5728\u770B\u8FD0\u884C\u7ED3\u679C",
  "review.latest": "\u6B63\u5728\u770B\u8001\u5E08\u7684\u6279\u6CE8",
  "script.outline": "\u6B63\u5728\u770B\u8BFE\u7A0B\u8BB2\u7A3F",
  "session.context": "\u6B63\u5728\u770B\u4EE3\u7801",
  "source.draft": "\u6B63\u5728\u770B\u4F60\u7684\u4EE3\u7801",
  "trace.frames": "\u6B63\u5728\u770B\u53D8\u91CF",
  "trace.changes": "\u6B63\u5728\u770B\u53D8\u91CF\u7684\u53D8\u5316",
  "trace.output": "\u6B63\u5728\u770B\u8F93\u51FA",
  "trace.occurrences": "\u6B63\u5728\u770B\u6267\u884C\u8FC7\u7A0B",
  "trace.position": "\u6B63\u5728\u770B\u6267\u884C\u8FC7\u7A0B"
};
function doing(call, descriptor) {
  let input = {};
  try {
    input = JSON.parse(call.arguments || "{}");
  } catch {
  }
  const args = typeof input.args === "object" && input.args !== null ? input.args : {};
  switch (call.name) {
    case "read":
      return READING[String(input.query)] ?? "\u6B63\u5728\u67E5\u770B";
    case "teach":
      return "\u6B63\u5728\u51C6\u5907\u8BB2\u89E3";
    case "ask_to_write":
      return "\u6B63\u5728\u51FA\u9898";
    case "grade":
      return "\u6B63\u5728\u6279\u6539";
    case "act": {
      const action = descriptor.actions.find((item) => item.id === input.action);
      if (action?.tags.includes("run")) return "\u6B63\u5728\u8FD0\u884C\u4EE3\u7801";
      const at = typeof args.at === "object" && args.at !== null ? args.at : {};
      if (typeof at.line === "number") return `\u6B63\u5728\u770B\u7B2C ${at.line} \u884C`;
      if (typeof args.line === "number") return `\u6B63\u5728\u770B\u7B2C ${args.line} \u884C`;
      return action === void 0 ? "\u6B63\u5728\u64CD\u4F5C" : `\u6B63\u5728${action.label}`;
    }
    case "submit": {
      const { event: event4 } = input;
      if (event4 === "annotation.add") {
        const at = typeof input.at === "object" && input.at !== null ? input.at : {};
        if (typeof at.line === "number") return `\u6B63\u5728\u770B\u7B2C ${at.line} \u884C`;
        return "\u6B63\u5728\u6807\u6CE8";
      }
      if (event4 === "annotation.clear") return "\u6B63\u5728\u6E05\u9664\u6807\u6CE8";
      if (event4 === "source.apply" || event4 === "source.preview") return "\u6B63\u5728\u5199\u4E34\u65F6\u4EE3\u7801";
      if (event4 === "source.restore") return "\u6B63\u5728\u6062\u590D\u4F60\u7684\u4EE3\u7801";
      return "\u6B63\u5728\u64CD\u4F5C";
    }
    default:
      return "\u6B63\u5728\u60F3";
  }
}
async function execute(call, descriptor, bridge, grading) {
  let input;
  try {
    const parsed = JSON.parse(call.arguments || "{}");
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new TypeError();
    input = parsed;
  } catch {
    return { result: { error: "arguments \u5FC5\u987B\u662F JSON \u5BF9\u8C61" } };
  }
  const args = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
  switch (call.name) {
    case "read": {
      if (typeof input.query !== "string" || !descriptor.queries.includes(input.query)) return { result: { error: "\u6CA1\u6709\u8FD9\u4E2A query" } };
      return { result: await bridge.query(input.query, args(input.args)) };
    }
    case "act": {
      const action = descriptor.actions.find((item) => item.id === input.action && !HIDDEN.test(item.id));
      if (action === void 0) return { result: { error: "\u6CA1\u6709\u8FD9\u4E2A\u52A8\u4F5C" } };
      const outcome = await bridge.invoke(action.id, args(input.args));
      if (outcome === "done" && action.tags.includes("run") && descriptor.queries.includes("python.result")) {
        return { result: { outcome, result: (await bridge.query("python.result", {})).value ?? null } };
      }
      return { result: { outcome } };
    }
    case "submit": {
      const { event: event4, code: code2, kind, at, to, text: text2 } = input;
      if (event4 !== "source.apply" && event4 !== "source.restore" && event4 !== "source.preview" && event4 !== "annotation.clear" && event4 !== "annotation.add") {
        return { result: { error: "event \u5FC5\u987B\u662F source.apply\u3001source.restore\u3001source.preview\u3001annotation.clear \u6216 annotation.add" } };
      }
      if ((event4 === "source.apply" || event4 === "source.preview") && typeof code2 !== "string") return { result: { error: "code \u5FC5\u987B\u662F\u5B8C\u6574\u4EE3\u7801" } };
      if (event4 === "annotation.add" && kind !== "mark" && kind !== "note" && kind !== "link") return { result: { error: "kind \u5FC5\u987B\u662F mark\u3001note \u6216 link" } };
      bridge.submit(event4 === "source.restore" ? { type: "source.restore" } : event4 === "annotation.clear" ? { type: "annotation.clear" } : event4 === "source.apply" || event4 === "source.preview" ? { type: event4, code: code2 } : { type: "annotation.add", kind, at, ...to === void 0 ? {} : { to }, ...typeof text2 === "string" ? { text: text2 } : {} });
      return { result: { outcome: "done" } };
    }
    case "teach": {
      const script2 = typeof input.script === "object" && input.script !== null ? input.script : null;
      const problems = validateScript(script2, descriptor);
      if (problems.length > 0) return { result: { error: "\u8BB2\u7A3F\u4E0D\u5408\u6CD5\uFF0C\u6539\u6B63\u540E\u518D\u8BD5", problems: problems.slice(0, 8) } };
      bridge.submit({ type: "script.play", script: script2 });
      const started = await bridge.query("script.cursor", {});
      if (started.outcome === "done" && started.value === null) return { result: { error: "\u8BB2\u7A3F\u6CA1\u6709\u5F00\u59CB\uFF0C\u8BF7\u76F4\u63A5\u56DE\u7B54\u5B66\u751F\uFF0C\u6216\u6362\u4E00\u4EFD\u8BB2\u7A3F" } };
      return { result: { outcome: "done" }, end: "yield" };
    }
    case "ask_to_write": {
      if (typeof input.task !== "string" || input.task.trim() === "") return { result: { error: "task \u5FC5\u987B\u662F\u7ED9\u5B66\u751F\u770B\u7684\u4EFB\u52A1\u8BF4\u660E" } };
      const concepts = stringList(input.concepts);
      if (concepts === null) return { result: { error: "concepts \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u5217\u8868" } };
      if (typeof input.starter === "string") bridge.submit({ type: "source.apply", code: input.starter });
      return {
        result: { outcome: "\u5DF2\u8BF7\u5B66\u751F\u52A8\u624B\uFF1B\u5199\u597D\u540E\u5B66\u751F\u4F1A\u53D1\u6765\u6D88\u606F" },
        end: {
          reply: { title: "\u52A8\u624B\u8BD5\u8BD5", text: input.task },
          practice: { task: input.task, ...concepts === void 0 ? {} : { concepts } },
          dock: [{ action: "ai.reply", label: "\u5199\u597D\u4E86\uFF0C\u5E2E\u6211\u770B\u770B", args: { text: WRITTEN } }]
        }
      };
    }
    case "grade": {
      if (!grading) return { result: { error: "\u5B66\u751F\u8FD8\u6CA1\u6709\u4EA4\u56DE\u7EC3\u4E60" } };
      if (input.verdict !== "pass" && input.verdict !== "partial" && input.verdict !== "fail") {
        return { result: { error: "verdict \u5FC5\u987B\u662F pass\u3001partial \u6216 fail" } };
      }
      if (typeof input.text !== "string" || input.text.trim() === "") return { result: { error: "text \u5FC5\u987B\u662F\u7ED9\u5B66\u751F\u770B\u7684\u6279\u6539\u53CD\u9988" } };
      const concepts = stringList(input.concepts);
      if (concepts === null) return { result: { error: "concepts \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u5217\u8868" } };
      return {
        result: { outcome: "\u6279\u6539\u5B8C\u6210" },
        end: {
          reply: { title: VERDICT_TITLE[input.verdict], text: input.text },
          dock: [],
          grade: { verdict: input.verdict, ...concepts === void 0 ? {} : { concepts } }
        }
      };
    }
    default:
      return { result: { error: `\u6CA1\u6709\u5DE5\u5177 ${call.name}` } };
  }
}
async function userContent(request, bridge) {
  const parts = [request.kind === "explain" ? "\u5B66\u751F\uFF1A\u8BF7\u89E3\u91CA\u6211\u9009\u4E2D\u7684\u5185\u5BB9\u3002" : `\u5B66\u751F\uFF1A${request.text}`];
  const { quote } = request;
  if (quote !== null) parts.push(`\u9009\u4E2D${quote.lines === null ? "" : `\uFF08\u7B2C ${quote.lines[0]}\u2013${quote.lines[1]} \u884C\uFF09`}\uFF1A
${quote.text}`);
  const read = await bridge.query("playground.snapshot", {});
  if (read.outcome !== "done" || read.value == null) return parts.join("\n\n");
  const { code: code2, chat: _chat, ...rest } = read.value;
  parts.push(`\u7F16\u8F91\u5668\u91CC\u7684\u4EE3\u7801\uFF1A
${code2.shown.split("\n").slice(0, 400).map((line, index) => `${index + 1}| ${line}`).join("\n")}`);
  const state = {
    code: { owner: code2.owner, editable: code2.editable, ...code2.mine === code2.shown ? {} : { mine: code2.mine } },
    ...rest,
    run: rest.run === null ? null : { ...rest.run, stdout: rest.run.stdout.slice(-500) }
  };
  parts.push(`\u6B64\u523B\u7684 Playground \u5FEB\u7167\uFF1A${clip(JSON.stringify(state), 4e3)}`);
  return parts.join("\n\n");
}
function toolsOf(descriptor, grading) {
  const actions = descriptor.actions.filter((action) => !HIDDEN.test(action.id));
  const tools = [{
    name: "read",
    description: [
      "\u8BFB\u53D6\u4F1A\u8BDD\u91CC\u7684\u4E8B\u5B9E\uFF0C\u7ED3\u679C\u662F JSON\u3002\u5E38\u7528\u7684\u6709\uFF1A",
      "python.result\uFF1A\u6700\u8FD1\u4E00\u6B21\u8FD0\u884C\u7684\u72B6\u6001\u3001\u8FD4\u56DE\u7801\u3001\u9519\u8BEF\uFF08\u542B\u884C\u53F7\uFF09\u4E0E\u8F93\u51FA\u672B\u5C3E\uFF1B",
      "playground.snapshot\uFF1A\u6B64\u523B\u7684\u5168\u90E8\u72B6\u6001\uFF08\u4EE3\u7801\u5F52\u8C01\u3001\u8FD0\u884C\u3001\u8BB2\u7A3F\u3001\u6279\u6CE8\u3001\u6807\u6CE8\u3001\u5E03\u5C40\uFF09\uFF0C\u6BCF\u6B21\u63D0\u95EE\u90FD\u4F1A\u9644\u4E0A\uFF1B",
      "session.context\uFF1A\u5F53\u524D\u4EE3\u7801\u3001\u8FD0\u884C\u603B\u6B65\u6570\u3001\u8C03\u8BD5\u5668\u4F4D\u7F6E\u4E0E\u5B66\u751F\u7684\u9009\u62E9\uFF1Bsource.draft\uFF1A\u5B66\u751F\u81EA\u5DF1\u7684\u4EE3\u7801\uFF08\u4E0D\u542B\u4F60\u7684\u4E34\u65F6\u4EE3\u7801\uFF09\uFF1B",
      "trace.position\uFF1Btrace.frames {step?}\uFF1A\u8C03\u7528\u6808\u4E0E\u5C40\u90E8\u53D8\u91CF\uFF1Btrace.changes {name}\uFF1A\u67D0\u4E2A\u53D8\u91CF\u6BCF\u6B21\u7684\u53D8\u5316\uFF1B",
      "trace.output {step?}\uFF1A\u5230\u67D0\u6B65\u4E3A\u6B62\u7684\u8F93\u51FA\uFF1Btrace.occurrences {line}\uFF1A\u67D0\u884C\u6BCF\u6B21\u6267\u884C\u5728\u7B2C\u51E0\u6B65\uFF1Bscript.cursor\uFF1A\u6B63\u5728\u64AD\u653E\u7684\u8BB2\u7A3F\uFF1B",
      "review.latest\uFF1A\u6700\u8FD1\u4E00\u6B21\u63D0\u4EA4\u4E0A\u8001\u5E08\u7684\u6279\u6CE8\u539F\u6587\u3001\u7C7B\u578B\u4E0E\u6240\u5728\u884C\uFF1B",
      "script.outline {id?}\uFF1A\u8BFE\u7A0B\u8BB2\u7A3F\u6BCF\u4E00\u6B65\u7684\u6807\u9898\u3001\u8BB2\u89E3\u3001\u662F\u5426\u5199\u4EE3\u7801\u4E0E\u9884\u6D4B\u9898\uFF1B\u7701\u7565 id \u8BFB\u53D6\u5168\u90E8\u8BB2\u7A3F\u3002",
      "\u5176\u4F59\u662F\u8FD9\u95E8\u8BFE\u81EA\u5DF1\u7684\u67E5\u8BE2\u3002"
    ].join("\n"),
    parameters: object({ query: { type: "string", enum: descriptor.queries }, args: { type: "object", description: "\u67E5\u8BE2\u53C2\u6570\uFF0C\u6CA1\u6709\u65F6\u7701\u7565" } }, ["query"])
  }, {
    name: "act",
    description: [
      "\u4EE5 AI \u8EAB\u4EFD\u8C03\u7528 IDE \u7684\u4E00\u4E2A\u52A8\u4F5C\u3002\u8FD4\u56DE outcome\uFF1Adone \u5B8C\u6210\uFF1Bunavailable \u6B64\u523B\u4E0D\u53EF\u7528\uFF1Binvalid \u53C2\u6570\u4E0D\u5BF9\uFF1Bfailed\u3001timeout \u6CA1\u6709\u5B8C\u6210\u3002",
      "\u8FD0\u884C\u7C7B\u52A8\u4F5C\u5B8C\u6210\u540E\u4F1A\u9644\u4E0A python.result\u3002",
      "annotation.show \u7684 at\uFF08\u4EE5\u53CA link \u7684 to\uFF09\u662F\u951A\u70B9\uFF1A{line, text?} \u6E90\u7801\u884C\uFF08text \u5FC5\u987B\u662F\u8FD9\u4E00\u884C\u91CC\u7684\u539F\u6587\u7247\u6BB5\uFF09\u3001{variable}\u3001{step}\u3001{output}\uFF08\u8F93\u51FA\u884C\u53F7\uFF09\uFF1B",
      "kind \u662F mark\uFF08\u6846\uFF09\u3001note\uFF08\u77ED\u6279\u6CE8\uFF0Ctext 40 \u5B57\u4EE5\u5185\uFF09\u6216 link\uFF08\u4E24\u4E2A\u951A\u70B9\u4E4B\u95F4\u7684\u7BAD\u5934\uFF09\uFF1B\u540C\u65F6\u6700\u591A 3 \u4E2A mark\u30012 \u4E2A note\u30011 \u4E2A link\uFF0C\u6362\u8BDD\u9898\u524D\u5148 annotation.clear\u3002",
      "\u53EF\u7528\u52A8\u4F5C\uFF1A",
      ...actions.map(describeAction)
    ].join("\n"),
    parameters: object({ action: { type: "string", enum: actions.map((action) => action.id) }, args: { type: "object", description: "\u52A8\u4F5C\u53C2\u6570\uFF0C\u6CA1\u6709\u65F6\u7701\u7565" } }, ["action"])
  }, {
    name: "submit",
    description: [
      "\u4EE5 AI \u8EAB\u4EFD\u76F4\u63A5\u6539\u4F1A\u8BDD\uFF0C\u4E0D\u7ECF\u52A8\u4F5C\uFF1A",
      "source.apply {code}\uFF1A\u628A\u8FD9\u6BB5\u5B8C\u6574\u4EE3\u7801\u501F\u8FDB\u7F16\u8F91\u5668\u6F14\u793A\uFF0C\u5BF9\u8BDD\u7ED3\u675F\u4F1A\u6062\u590D\u5B66\u751F\u4EE3\u7801\uFF1B",
      "source.preview {code}\uFF1A\u9010\u5B57\u9884\u89C8\u8FD9\u6BB5\u4EE3\u7801\uFF1Bsource.restore\uFF1A\u7ACB\u5373\u6062\u590D\u5B66\u751F\u4EE3\u7801\uFF1B",
      "annotation.clear\uFF1A\u6E05\u9664\u4F60\u8FD9\u6B21\u753B\u7684\u6807\u6CE8\uFF1B",
      "annotation.add {kind, at, text?}\uFF1A\u753B\u6807\u6CE8\u3002kind \u662F mark\uFF08\u6846\uFF09\u3001note\uFF08\u77ED\u6279\u6CE8\uFF09\u3001link\uFF08\u4E24\u4E2A\u951A\u70B9\u4E4B\u95F4\u7684\u7BAD\u5934\uFF09\uFF1Bat \u4E0E link \u7684 to \u662F\u951A\u70B9 {line, text?}\uFF08text \u662F\u8BE5\u884C\u539F\u6587\u7247\u6BB5\uFF09\u3001{variable}\u3001{step}\u3001{output}\uFF1Bnote \u4E0E link \u8981\u5E26 text\uFF0C40 \u5B57\u4EE5\u5185\u3002"
    ].join("\n"),
    parameters: object({
      event: { type: "string", enum: ["source.apply", "source.restore", "source.preview", "annotation.clear", "annotation.add"] },
      code: { type: "string", optional: true, description: "source.apply / source.preview \u65F6\u7684\u5B8C\u6574\u4EE3\u7801" },
      kind: { type: "string", enum: ["mark", "note", "link"], optional: true },
      at: { type: "object", optional: true, description: "\u6807\u6CE8\u7684\u951A\u70B9" },
      to: { type: "object", optional: true, description: "link \u7684\u7EC8\u70B9" },
      text: { type: "string", optional: true, description: "note / link \u7684\u4E00\u884C\u8BF4\u660E" }
    }, ["event"])
  }, {
    name: "teach",
    description: [
      "\u64AD\u653E\u4E00\u4EFD\u4F60\u5199\u7684\u8BB2\u7A3F\uFF08\u8BB2\u89E3\u6A21\u5F0F\uFF09\uFF1A\u6BCF\u6B65\u9010\u53E5\u8BB2\u51FA\uFF0C\u8BB2\u5230\u67D0\u53E5\u65F6\u53EF\u4EE5\u8C03\u7528\u52A8\u4F5C\uFF0C\u5E76\u628A\u4EE3\u7801\u9010\u5B57\u5199\u8FDB\u7F16\u8F91\u5668\u3002\u8BB2\u7A3F\u5F00\u59CB\u64AD\u653E\u540E\u8FD9\u4E00\u8F6E\u5C31\u7ED3\u675F\uFF0C\u5B66\u751F\u770B\u5B8C\u4F1A\u7EE7\u7EED\u95EE\u4F60\u3002",
      'script\uFF1A{"id":"\u77ED id","title":"\u6807\u9898","auto":true,"from":"\u5F00\u59CB\u65F6\u7F16\u8F91\u5668\u91CC\u7684\u5B8C\u6574\u4EE3\u7801\uFF08\u53EF\u7701\u7565\uFF0C\u7701\u7565\u5219\u4ECE\u5F53\u524D\u4EE3\u7801\u8BB2\u8D77\uFF09",',
      '"steps":[{"title":"\u53EF\u7701\u7565","say":"\u8FD9\u4E00\u6B65\u8981\u8BB2\u7684\u8BDD\uFF0CMarkdown\uFF0C\u53EF\u4EE5\u591A\u53E5","do":[{"action":"\u52A8\u4F5C id","args":{}}],"write":"\u8FD9\u4E00\u6B65\u8BB2\u5B8C\u540E\u7F16\u8F91\u5668\u91CC\u7684\u5B8C\u6574\u4EE3\u7801"}]}',
      'say \u4E5F\u53EF\u4EE5\u662F\u53E5\u5B50\u5217\u8868 [{"say":"\u4E00\u53E5\u8BDD","do":[...],"write":"\u5199\u5B8C\u8FD9\u53E5\u540E\u7684\u5B8C\u6574\u4EE3\u7801"}]\uFF0C\u8BA9\u67D0\u53E5\u8BDD\u4E0E\u52A8\u4F5C\u6216\u4EE3\u7801\u540C\u65F6\u51FA\u73B0\u3002',
      "write \u6C38\u8FDC\u662F\u5B8C\u6574\u4EE3\u7801\u800C\u4E0D\u662F\u589E\u91CF\uFF1Bauto \u4E3A true \u65F6\u4EE3\u7801\u81EA\u52A8\u5199\u51FA\uFF0C\u7701\u7565\u65F6\u6BCF\u4E00\u6B65\u7531\u5B66\u751F\u9009\u62E9\u81EA\u5DF1\u5199\u8FD8\u662F\u770B\u4F60\u5199\u30023 \u5230 6 \u6B65\u4E3A\u5B9C\uFF0C\u8BB2\u7A3F\u7ED3\u675F\u540E\u5B66\u751F\u7684\u4EE3\u7801\u4F1A\u6062\u590D\u3002",
      '\u60F3\u8BA9\u5B66\u751F\u5148\u731C\u518D\u770B\u7ED3\u679C\u65F6\uFF0C\u5728\u90A3\u4E00\u6B65\u52A0 "predict":{"question":"\u8FD0\u884C\u540E\u4F1A\u6253\u5370\u51E0\u884C\uFF1F","choices":[{"label":"3 \u884C","correct":true,"reply":"\u5BF9\uFF0Crange(3) \u662F 0\u30011\u30012"},{"label":"4 \u884C","reply":"\u518D\u770B\u770B range \u505C\u5728\u54EA"}]}\uFF0C\u8BB2\u5B8C\u8FD9\u4E00\u6B65\u5B66\u751F\u9009\u4E86\u624D\u7EE7\u7EED\uFF1B\u6807\u51FA\u552F\u4E00\u7684 correct\uFF0C\u6BCF\u4E2A\u9009\u9879\u90FD\u5199 reply \u89E3\u91CA\u4E3A\u4EC0\u4E48\u5BF9\u6216\u9519\uFF1B\u9009\u9879\u53EF\u52A0 "next": \u6B65\u53F7 \u8DF3\u5230\u522B\u7684\u6B65\u9AA4\u3002'
    ].join("\n"),
    parameters: object({ script: { type: "object" } }, ["script"])
  }, {
    name: "ask_to_write",
    description: [
      "\u8BF7\u5B66\u751F\u81EA\u5DF1\u5199\u4EE3\u7801\u3002task \u662F\u7ED9\u5B66\u751F\u770B\u7684\u4EFB\u52A1\u8BF4\u660E\uFF0C\u8981\u5177\u4F53\u3001\u51E0\u5206\u949F\u80FD\u5B8C\u6210\uFF1Bstarter \u53EF\u9009\uFF0C\u4F5C\u4E3A\u4E34\u65F6\u4EE3\u7801\u653E\u8FDB\u7F16\u8F91\u5668\u8BA9\u5B66\u751F\u5728\u4E0A\u9762\u5199\uFF08\u4E0D\u5F71\u54CD\u5B66\u751F\u539F\u6765\u7684\u4EE3\u7801\uFF09\u3002",
      "\u8C03\u7528\u540E\u8FD9\u4E00\u8F6E\u7ED3\u675F\u3002\u5B66\u751F\u5199\u597D\u540E\u4F1A\u53D1\u6765\u300C" + WRITTEN + "\u300D\uFF0C\u4F60\u518D\u8FD0\u884C\u3001\u8BFB\u7ED3\u679C\u3001\u7528\u6807\u6CE8\u6307\u51FA\u5177\u4F53\u7684\u884C\uFF0C\u7136\u540E\u8BC4\u4EF7\u3002"
    ].join("\n"),
    parameters: object({
      task: { type: "string" },
      starter: { type: "string" },
      concepts: { type: "array", items: { type: "string" }, description: "\u8FD9\u9053\u7EC3\u4E60\u8BAD\u7EC3\u7684\u6982\u5FF5 id" }
    }, ["task"])
  }];
  if (grading) tools.push({
    name: "grade",
    description: "\u7ED9\u5B66\u751F\u521A\u4EA4\u56DE\u7684\u7EC3\u4E60\u4E0B\u7ED3\u6784\u5316\u7ED3\u8BBA\u5E76\u7ED3\u675F\u672C\u8F6E\u3002text \u662F\u7B80\u77ED\u3001\u5177\u4F53\u7684\u53CD\u9988\uFF1Bconcepts \u662F\u672C\u6B21\u5B9E\u9645\u68C0\u67E5\u7684\u6982\u5FF5 id\u3002",
    parameters: object({
      verdict: { type: "string", enum: ["pass", "partial", "fail"] },
      concepts: { type: "array", items: { type: "string" } },
      text: { type: "string" }
    }, ["verdict", "text"])
  });
  return tools;
}
function stringList(value) {
  if (value === void 0) return void 0;
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? Object.freeze([...value]) : null;
}
function describeAction(action) {
  const args = Object.entries(action.args ?? {}).map(([name, type2]) => `${name}${type2.optional === true ? "?" : ""}: ${typeName(type2)}`);
  return `- ${action.id}${args.length === 0 ? "" : ` {${args.join(", ")}}`}\uFF1A${action.label}`;
}
function typeName(type2) {
  const base = type2.enum !== void 0 ? type2.enum.map((value) => JSON.stringify(value)).join("|") : type2.type;
  return type2.description === void 0 ? base : `${base}\uFF08${type2.description}\uFF09`;
}
function object(properties, required) {
  return { type: "object", properties, required };
}
function clip(text2, limit = MAX_RESULT) {
  return text2.length <= limit ? text2 : `${text2.slice(0, limit)}\u2026\uFF08\u5DF2\u622A\u65AD\uFF09`;
}

// session/impl/model/ai/conversation.ts
var MEMORY = 20;
var TRANSCRIPT_MEMORY = 40;
var STORED_TOOL_RESULT = 2e3;
function startConversationImpl(bus, options2, host) {
  let transcript = [...recentTranscript(options2.memory?.loadTranscript() ?? [])];
  let current = null;
  let descriptor = null;
  const replies = /* @__PURE__ */ new Map();
  let tickets = 0;
  const chat = () => host.playground.getSnapshot().chat;
  let saved = { messages: chat().messages, history: chat().history };
  const answer = (ticket, end) => {
    if (current?.ticket !== ticket) return;
    current = null;
    bus.emit({ type: "ai.answered", ticket, ...end }, "ai");
  };
  const ask2 = (ticket, request, grading) => {
    const controller = new AbortController();
    current = { ticket, controller };
    const fail = (error) => {
      if (controller.signal.aborted) return;
      console.warn("\u8BFE\u7A0B AI \u6CA1\u6709\u56DE\u7B54", error);
      answer(ticket, { reply: { title: "AI \u6682\u65F6\u6CA1\u6709\u56DE\u7B54", text: "AI \u73B0\u5728\u8FDE\u4E0D\u4E0A\uFF0C\u8FC7\u4E00\u4F1A\u513F\u518D\u95EE\u4E00\u6B21\u3002" } });
    };
    const agent = options2.agent;
    if (agent === void 0) {
      fallback(options2, request, controller).then((reply2) => answer(ticket, { reply: reply2 }), fail);
      return;
    }
    const before = transcript.length;
    runAgentImpl(agent, bridge(ticket), transcript, request, controller.signal, grading).then((end) => {
      if (current?.ticket !== ticket) return;
      rememberTranscript();
      answer(ticket, end === null ? { reply: null } : {
        reply: end.reply,
        dock: end.dock,
        ...end.practice === void 0 ? {} : { practice: end.practice },
        ...end.grade === void 0 ? {} : { grade: end.grade },
        ...grading ? { graded: { source: request.context?.source ?? null } } : {}
      });
    }, (error) => {
      if (controller.signal.aborted) return;
      console.warn("\u8BFE\u7A0B agent \u5931\u8D25\uFF0C\u6539\u7528\u4E00\u95EE\u4E00\u7B54", error);
      transcript.length = before;
      fallback(options2, request, controller).then((reply2) => answer(ticket, { reply: reply2 }), fail);
    });
  };
  const bridge = (ticket) => {
    const request = (event4, read) => {
      const asked = `ai:agent:${++tickets}`;
      return new Promise((resolve) => {
        replies.set(asked, (reply2) => resolve(read(reply2)));
        bus.emit({ ...event4, ticket: asked }, "ai");
      });
    };
    const carrying = (carry, run2) => {
      if (carry) bus.emit({ type: "ai.carry", carry: true }, "ai");
      try {
        return run2();
      } finally {
        if (carry) bus.emit({ type: "ai.carry", carry: false }, "ai");
      }
    };
    return {
      describe: () => Promise.resolve(descriptor ?? { actions: [], queries: [] }),
      query: (id, args) => request({ type: "session.query.request", id, args }, (reply2) => ({
        outcome: reply2.outcome ?? "failed",
        ...reply2.value === void 0 ? {} : { value: reply2.value },
        ...reply2.message === void 0 ? {} : { message: reply2.message }
      })),
      invoke: async (action, args) => {
        const process = chat().process;
        const carry = action === "script.play";
        if (carry) bus.emit({ type: "ai.carry", carry: true }, "ai");
        try {
          return await request(
            { type: "session.invoke", action, args, actor: "ai", ...process === null ? {} : { process } },
            (reply2) => reply2.outcome ?? "failed"
          );
        } finally {
          if (carry) bus.emit({ type: "ai.carry", carry: false }, "ai");
        }
      },
      submit: (event4) => {
        const process = chat().process;
        if (process === null) return;
        const bound = event4.type === "annotation.clear" ? { ...event4, owner: process } : event4.type === "script.play" ? { ...event4, origin: process } : event4.type === "source.apply" || event4.type === "source.restore" || event4.type === "source.preview" ? { ...event4, origin: process } : event4.type === "annotation.add" ? annotationAddEvent(
          { source: host.editor.source, trace: host.playback.trace },
          { kind: event4.kind, at: event4.at, ...event4.to === void 0 ? {} : { to: event4.to }, ...event4.text === void 0 ? {} : { text: event4.text } },
          process,
          host.playground.getSnapshot().marks
        ) : event4;
        carrying(event4.type === "script.play", () => bus.emit({ ...bound, actor: "ai" }, "ai"));
      },
      say: (reply2) => bus.emit({ type: "ai.say", reply: reply2 }, "ai"),
      progress: (text2) => bus.emit({ type: "ai.progress", ticket, text: text2 }, "ai"),
      draft: (text2) => bus.emit({ type: "ai.drafted", ticket, text: text2 }, "ai")
    };
  };
  const remember = () => {
    const { messages, history, nextConversation } = chat();
    if (messages === saved.messages && history === saved.history) return;
    saved = { messages, history };
    const ongoing = messages.length === 0 ? [] : [{ id: nextConversation + 1, title: conversationTitleImpl(messages), messages }];
    options2.memory?.save([...ongoing, ...history].slice(0, MEMORY));
  };
  const rememberTranscript = () => {
    options2.memory?.saveTranscript(recentTranscript(transcript).map((message) => message.role === "tool" ? { ...message, content: clipStored(message.content) } : message));
  };
  const stops = [
    bus.subscribe(["session.ready"], (event4) => {
      if (event4.descriptor) descriptor = event4.descriptor;
    }),
    bus.subscribe(["ai.requested"], (event4) => {
      ask2(event4.ticket, event4.request, event4.grading);
    }),
    bus.subscribe(["ai.archived"], (event4) => {
      current?.controller.abort();
      current = null;
      if (!event4.carry) transcript = [];
      rememberTranscript();
    }),
    bus.subscribe(["session.settled", "session.queried"], (event4) => {
      const waiting = replies.get(event4.ticket);
      if (waiting === void 0) return;
      replies.delete(event4.ticket);
      waiting(event4);
    }),
    bus.subscribe(["ai.changed"], remember)
  ];
  bus.emit({ type: "ai.hydrate", prompts: options2.prompts ?? [], history: options2.memory?.load().slice(0, MEMORY) ?? [] }, "ai");
  saved = { messages: chat().messages, history: chat().history };
  return {
    dispose: () => {
      current?.controller.abort();
      current = null;
      for (const stop2 of stops) stop2();
    }
  };
}
function fallback(options2, request, controller) {
  const { remote, port: offline } = options2;
  return remote === void 0 ? offline?.ask(request, controller.signal) ?? Promise.reject(new Error("AI \u7AEF\u53E3\u6CA1\u6709\u914D\u7F6E")) : remote.ask(request, controller.signal).catch((error) => {
    if (controller.signal.aborted || offline === void 0) throw error;
    console.warn("\u8BFE\u7A0B AI \u5931\u8D25\uFF0C\u6539\u7528\u79BB\u7EBF\u56DE\u7B54", error);
    return offline.ask(request, controller.signal);
  });
}
function recentTranscript(messages) {
  const from = Math.max(0, messages.length - TRANSCRIPT_MEMORY);
  const first = messages.findIndex((message, index) => index >= from && message.role === "user");
  return first === -1 ? [] : messages.slice(first, first + TRANSCRIPT_MEMORY);
}
function clipStored(content) {
  return content.length <= STORED_TOOL_RESULT ? content : `${content.slice(0, STORED_TOOL_RESULT)}\u2026\uFF08\u5DF2\u622A\u65AD\uFF09`;
}

// session/impl/model/ai/quote.ts
import { sourceOccurrences as sourceOccurrences2 } from "./pico.js";
function quotableImpl(selection) {
  return selection !== null && (selection.kind !== "source" || selection.source.slice(selection.from, selection.to).trim() !== "");
}
function quoteFocusImpl(selection, playback) {
  if (selection === null) return null;
  const run2 = playback?.trace ?? null, position = playback?.position ?? null;
  const moment = run2 === null || position === null ? null : Object.freeze({
    step: position.traceIndex,
    steps: run2.steps.length + 1,
    line: position.state.line,
    occurrence: selection.kind === "source" ? occurrence(sourceOccurrences2(run2, selection), position.traceIndex) : null,
    frames: position.state.frames ?? [],
    globals: position.state.globals ?? {},
    stdout: position.state.stdout ?? ""
  });
  switch (selection.kind) {
    case "source": {
      const text2 = selection.source.slice(selection.from, selection.to).trim();
      if (text2 === "") return null;
      const lineAt = (offset) => selection.source.slice(0, offset).split("\n").length;
      return Object.freeze({ text: text2, lines: Object.freeze([lineAt(selection.from), lineAt(Math.max(selection.from, selection.to - 1))]), moment });
    }
    case "runtime-variable":
    case "runtime-value":
      return Object.freeze({ text: String(selection.path.at(-1)), lines: null, moment });
    case "world-object":
      return Object.freeze({ text: selection.objectId, lines: null, moment });
  }
}
function aiContextImpl(editor2, playback) {
  if (editor2 === null) return null;
  const position = playback?.position ?? null;
  const run2 = playback?.trace ?? null;
  const moment = position === null || run2 === null ? null : Object.freeze({
    step: position.traceIndex,
    steps: run2.steps.length + 1,
    line: position.state.line,
    occurrence: null,
    frames: position.state.frames ?? [],
    globals: position.state.globals ?? {},
    stdout: position.state.stdout ?? ""
  });
  return Object.freeze({ source: editor2.source, moment });
}
function occurrence(points, step2) {
  const ordinal = points.find((point) => point.traceIndex === step2)?.ordinal;
  return ordinal === void 0 ? null : Object.freeze({ ordinal, count: points.length });
}

// session/api/model/ai.ts
var chatOf = (get) => get(playground)?.getSnapshot().chat ?? null;
var aiContext = (editor2, playback) => aiContextImpl(editor2, playback);
var ai = feature("ai", {
  /** 对话是一个过程：它的舞台与改写都靠过程结束来释放；editor/playback 供 submit 绑定标注锚点。 */
  requires: [playground, editorHost, playbackHost],
  create: ({ bus, get, own }, options2) => {
    own(startConversationImpl(bus, options2, { playground: get(playground), editor: get(editorHost), playback: get(playbackHost) }));
  },
  actions: [
    { id: "ai.toggle", label: "AI", icon: "hint", event: ({ get }) => ({ type: chatOf(get)?.open === true ? "ai.close" : "ai.open" }) },
    { id: "ai.compose", label: "\u7EE7\u7EED\u8FFD\u95EE", event: () => ({ type: "ai.compose" }) },
    /** 宿主替学生提问（如全局 AI 转来的问题）：AI 没打开时先打开。 */
    {
      id: "ai.question",
      label: "\u95EE AI",
      args: { text: { type: "string" } },
      when: ({ get }, { text: text2 }) => typeof text2 === "string" && text2.trim() !== "" && chatOf(get)?.pending === false,
      event: ({ query }, { text: text2 }) => ({ type: "ai.ask", text: text2, context: query("ai.context") })
    },
    {
      id: "ai.reply",
      label: "\u56DE\u590D",
      args: { text: { type: "string" } },
      when: ({ get }) => chatOf(get)?.open === true && chatOf(get)?.pending === false,
      event: ({ query }, { text: text2 }) => ({ type: "ai.ask", text: text2, context: query("ai.context") })
    },
    {
      id: "selection.ask",
      label: "\u95EE AI",
      when: ({ get }) => quotableImpl(get(selectionHost)?.current ?? null),
      event: ({ get }) => ({ type: "ai.quote", quote: quoteFocusImpl(get(selectionHost)?.current ?? null, get(playbackHost)) })
    }
  ],
  queries: [{
    id: "ai.context",
    run: ({ get }) => aiContext(get(editorHost), get(playbackHost))
  }]
});

// session/api/model/ai-script.ts
var aiScript = feature("ai-script", {
  requires: [ai, script],
  create: ({ bus, own }, options2) => {
    bus.emit({ type: "telling.bind", venue: options2?.narrate ?? true ? "chat" : "rail" }, "ai-script");
    own({ dispose: () => bus.emit({ type: "telling.bind", venue: null }, "ai-script") });
  }
});

// session/api/model/annotation.ts
var registries = /* @__PURE__ */ new WeakMap();
var registry = (state) => {
  let found = registries.get(state);
  if (found === void 0) registries.set(state, found = { resolvers: /* @__PURE__ */ new Set() });
  return found;
};
function registerAnchorResolver(state, resolver) {
  return registerResolverImpl(registry(state), resolver);
}
function locateAnchor(state, anchor) {
  return locateImpl(registry(state), anchor);
}
var marksOf = (context) => context.get(playground)?.getSnapshot().marks ?? null;
var annotations = feature("annotations", {
  requires: [editorHost, playbackHost, playground],
  create: ({ bus, get, own }) => {
    const loop2 = get(playground);
    const resolvers = registry(loop2);
    own({ dispose: bus.subscribe(["annotation.reveal"], (event4) => revealImpl(resolvers, event4.anchor)) });
  },
  actions: [{
    id: "annotation.show",
    label: "\u6807\u6CE8",
    tags: ["present"],
    args: {
      kind: { type: "string", enum: ["mark", "note", "link"] },
      at: { type: "object", description: "AnchorRef" },
      to: { type: "object", optional: true, description: "link \u7684\u7EC8\u70B9" },
      text: { type: "string", optional: true }
    },
    when: (context, args) => {
      const marks = marksOf(context);
      return marks !== null && refusal(anchorHost(context), args, marks) === null;
    },
    event: (context, args, caller) => annotationAddEvent(anchorHost(context), args, caller.process, marksOf(context))
  }, {
    /** 框出终端的第几行输出（从 1 开始）；就是 at 为 { output } 的 mark。 */
    id: "terminal.highlight",
    label: "\u6846\u51FA\u8FD9\u884C\u8F93\u51FA",
    tags: ["present"],
    args: { line: { type: "integer" } },
    when: (context, { line }) => {
      const marks = marksOf(context);
      return marks !== null && refusal(anchorHost(context), { kind: "mark", at: { output: line } }, marks) === null;
    },
    event: (context, { line }, caller) => annotationAddEvent(anchorHost(context), { kind: "mark", at: { output: line } }, caller.process, marksOf(context))
  }, {
    id: "annotation.clear",
    label: "\u6E05\u9664\u6807\u6CE8",
    tags: ["present"],
    event: (_context, _args, caller) => caller.process === null ? { type: "annotation.failed", reason: "no-owner" } : { type: "annotation.clear", owner: caller.process }
  }, {
    id: "anchor.reveal",
    label: "\u6EDA\u52A8\u5230\u8FD9\u91CC",
    tags: ["present"],
    args: { at: { type: "object" } },
    when: (context, { at }) => bindAnchor(anchorHost(context), at) !== null,
    event: (context, { at }) => ({ type: "annotation.reveal", anchor: bindAnchor(anchorHost(context), at) })
  }]
});

// session/api/model/context.ts
import { event, on as on2, stateful as stateful2 } from "./pico.js";

// session/impl/model/context/state.ts
var cursors = /* @__PURE__ */ new WeakMap();
function createContext(options2, _lifecycle) {
  const cursor = {
    sourceRevision: 0,
    runRevision: 0,
    source: options2.editor.source,
    run: options2.playback.trace
  };
  const state = Object.freeze({
    get sourceRevision() {
      return cursor.sourceRevision;
    },
    get runRevision() {
      return cursor.runRevision;
    }
  });
  cursors.set(state, cursor);
  return state;
}
function observeSource(state, event4, { emit }) {
  const cursor = cursors.get(state);
  if (cursor.source === event4.source) return;
  cursor.source = event4.source;
  cursor.sourceRevision += 1;
  emit({ type: "session.context.changed" });
}
function observePlayback(state, event4, { emit }) {
  const cursor = cursors.get(state);
  if (cursor.run !== event4.trace) {
    cursor.run = event4.trace;
    cursor.runRevision += 1;
  }
  emit({ type: "session.context.changed" });
}
function observeSelection(_state, _event, { emit }) {
  emit({ type: "session.context.changed" });
}
function snapshotImpl(revisions, editor2, playback, selection) {
  const run2 = playback.trace;
  const position = playback.position;
  return Object.freeze({
    source: Object.freeze({ revision: revisions.sourceRevision, text: editor2.source }),
    run: run2 === null ? null : Object.freeze({ revision: revisions.runRevision, steps: run2.steps.length + 1 }),
    position: position === null ? null : Object.freeze({ step: position.traceIndex, line: position.state.line }),
    selection: encodeReferenceImpl(selection, revisions, editor2.source, run2)
  });
}
function encodeReferenceImpl(selection, revisions, source2, run2) {
  if (selection === null) return null;
  if (selection.kind === "source") {
    return selection.source !== source2 ? null : Object.freeze({
      kind: selection.kind,
      source: revisions.sourceRevision,
      from: selection.from,
      to: selection.to
    });
  }
  if (selection.run !== run2) return null;
  if (selection.kind === "runtime-value") return Object.freeze({
    kind: selection.kind,
    run: revisions.runRevision,
    step: selection.traceIndex,
    path: Object.freeze([...selection.path])
  });
  if (selection.kind === "runtime-variable") return Object.freeze({
    kind: selection.kind,
    run: revisions.runRevision,
    path: Object.freeze([...selection.path])
  });
  return Object.freeze({ kind: selection.kind, run: revisions.runRevision, object: selection.objectId });
}
function decodeReferenceImpl(reference, revisions, editor2, playback) {
  if (reference.kind === "source") {
    return reference.source !== revisions.sourceRevision || reference.from > editor2.source.length || reference.to > editor2.source.length ? null : Object.freeze({ kind: "source", source: editor2.source, from: reference.from, to: reference.to });
  }
  const run2 = playback.trace;
  if (run2 === null || reference.run !== revisions.runRevision) return null;
  if (reference.kind === "runtime-value") {
    if (reference.step < 0 || reference.step > run2.steps.length + 1) return null;
    return Object.freeze({ kind: reference.kind, run: run2, traceIndex: reference.step, path: Object.freeze([...reference.path]) });
  }
  if (reference.kind === "runtime-variable") {
    return Object.freeze({ kind: reference.kind, run: run2, path: Object.freeze([...reference.path]) });
  }
  return Object.freeze({ kind: reference.kind, run: run2, objectId: reference.object });
}
function isSessionReference(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const input = value;
  if (input.kind === "source") return revision(input.source) && integer(input.from) && integer(input.to) && Number(input.from) >= 0 && Number(input.to) >= Number(input.from);
  if (input.kind === "runtime-value") return revision(input.run) && integer(input.step) && Number(input.step) >= 0 && path(input.path);
  if (input.kind === "runtime-variable") return revision(input.run) && path(input.path);
  return input.kind === "world-object" && revision(input.run) && typeof input.object === "string";
}
var integer = (value) => typeof value === "number" && Number.isInteger(value);
var revision = (value) => integer(value) && Number(value) >= 0;
var path = (value) => Array.isArray(value) && value.every((item) => typeof item === "string" || typeof item === "number" && Number.isInteger(item));

// session/api/model/context.ts
var component = stateful2("session-context", createContext, [
  on2("editor.changed", observeSource, ["session.context.changed"]),
  event("editor.changed", {}),
  on2("playback.changed", observePlayback, ["session.context.changed"]),
  event("playback.changed", {}),
  on2("selection.changed", observeSelection, ["session.context.changed"]),
  event("selection.changed", {}),
  /** Snapshot 失效信号；内容按需经 session.context Query 读取。 */
  event("session.context.changed", {})
]);
var sessionContext = feature("session-context", {
  requires: [editorHost, playbackHost, selectionHost],
  create: ({ bus, get, own }) => own(component.create({
    editor: get(editorHost),
    playback: get(playbackHost)
  }, bus)).state,
  queries: [{
    id: "session.context",
    run: ({ get }) => sessionContextSnapshot(
      get(sessionContext),
      get(editorHost),
      get(playbackHost),
      get(selectionHost)?.current ?? null
    )
  }],
  actions: [{
    id: "selection.restore",
    label: "\u6062\u590D\u5F15\u7528",
    tags: ["navigate"],
    args: { reference: { type: "object" } },
    when: ({ get }, { reference }) => canRestoreReference(
      reference,
      get(sessionContext),
      get(editorHost),
      get(playbackHost)
    ),
    event: ({ get }, { reference }) => ({
      type: "selection.select",
      selection: decodeReferenceImpl(reference, get(sessionContext), get(editorHost), get(playbackHost))
    })
  }]
});
function sessionContextSnapshot(revisions, editor2, playback, selection) {
  return snapshotImpl(revisions, editor2, playback, selection);
}
function canRestoreReference(reference, revisions, editor2, playback) {
  return isSessionReference(reference) && decodeReferenceImpl(reference, revisions, editor2, playback) !== null;
}
function encodeSessionReference(selection, revisions, source2, run2) {
  return encodeReferenceImpl(selection, revisions, source2, run2);
}
function decodeSessionReference(reference, revisions, source2, run2) {
  return decodeReferenceImpl(reference, revisions, { source: source2 }, { trace: run2 });
}

// session/impl/model/evidence/observe.ts
function observeSessionEvidence(bus, lecture) {
  let cursor = null;
  let running = false;
  const record = (payload) => bus.emit({ type: "session.evidence", payload }, "session-evidence");
  const stops = [
    bus.subscribe(["script.changed"], () => {
      const state = lecture();
      const current = state.script;
      if (current === null || state.process === null) {
        cursor = null;
        return;
      }
      const next = `${state.process}:${state.step}`;
      if (next === cursor) return;
      cursor = next;
      record({
        schema: "session.activity",
        version: 1,
        data: {
          kind: "script.step",
          script: current.id,
          step: state.step,
          title: current.steps[state.step]?.title ?? null,
          concepts: current.steps[state.step]?.concepts ?? []
        }
      });
    }),
    bus.subscribe(["python.changed"], ({ result }) => {
      if (result.status === "pending") {
        running = true;
        return;
      }
      if (!running) return;
      running = false;
      record({ schema: "session.activity", version: 1, data: { kind: "run.finished", ...finished(result) } });
    }),
    bus.subscribe(["script.predicted"], ({ type: _, ...predicted }) => {
      const { script: script2 } = lecture();
      const concepts = script2?.id === predicted.script ? script2.steps[predicted.step]?.concepts ?? [] : [];
      record({ schema: "session.activity", version: 1, data: { kind: "script.prediction", ...predicted, concepts } });
    }),
    bus.subscribe(["ai.practice"], ({ type: _, ...practice }) => {
      record({ schema: "session.activity", version: 1, data: { kind: "ai.practice", ...practice } });
    }),
    bus.subscribe(["ai.ask"], (event4) => {
      const { script: script2, step: step2 } = lecture();
      record({
        schema: "session.activity",
        version: 1,
        data: {
          kind: "ai.question",
          text: event4.text,
          script: script2 === null ? null : { id: script2.id, step: step2 }
        }
      });
    })
  ];
  return { dispose: () => {
    for (const stop2 of stops) stop2();
  } };
}
function finished(result) {
  if (result.status === "failed") return { status: "failed", error: null };
  const run2 = result.value;
  if (run2 === null) return { status: "failed", error: null };
  if (run2.waiting !== null) return { status: "waiting", error: null };
  if (run2.error === null) return { status: run2.returncode === 0 ? "ok" : "error", returncode: run2.returncode, error: null };
  const last = run2.error.message.trim().split("\n").at(-1) ?? "";
  return {
    status: "error",
    returncode: run2.returncode,
    error: { type: /^(\w+)(?::|$)/.exec(last)?.[1] ?? null, line: run2.error.line, message: last.slice(0, 300) }
  };
}

// session/api/model/evidence.ts
var sessionEvidence = feature("session-evidence", {
  requires: [script, playground],
  create: ({ bus, get, own }) => {
    own(observeSessionEvidence(bus, () => get(playground).getSnapshot().lecture));
  }
});

// session/api/model/execution.ts
var execution = feature("execution", {
  create: (_scope, options2) => options2,
  actions: [{
    id: "code.run",
    label: "\u8FD0\u884C",
    icon: "play",
    tags: ["run"],
    when: ({ get }) => get(execution) !== null,
    event: ({ get }) => get(execution)?.run ?? { type: "execution.missing" },
    settle: ({ get }) => get(execution)?.settle
  }]
});

// session/api/model/navigate.ts
import { event as event2, on as on3, stateful as stateful3 } from "./pico.js";
var component2 = stateful3("navigate", createNavigate, [
  on3("navigate.locate", locate, ["stage.reveal", "selection.select", "debugger.seek", "navigate.located", "navigate.failed"]),
  /** occurrence（1-based）指定第几次相关执行；没有这么多次时为 no-match。 */
  event2("navigate.locate", {}),
  event2("navigate.located", {}),
  on3("navigate.focus", focus, ["stage.reveal", "debugger.variable"]),
  event2("navigate.focus", {}),
  on3("selection.changed", settle, ["debugger.seek"]),
  event2("selection.changed", {}),
  event2("navigate.failed", {})
]);
var LOCATED = { on: "navigate.located", fail: ["navigate.failed"] };
var navigate = feature("navigate", {
  requires: [editorHost, playbackHost, selectionHost],
  create: ({ bus, get, own }, options2) => own(component2.create({
    editor: get(editorHost),
    playback: get(playbackHost),
    panel: options2.debuggerPanel
  }, bus)).state,
  actions: [{
    id: "selection.locate",
    label: "\u5B9A\u4F4D\u6267\u884C",
    tags: ["navigate"],
    settle: () => LOCATED,
    when: ({ get }) => canLocateSelection(get(playbackHost), get(selectionHost)?.current ?? null),
    event: ({ get }) => ({ type: "navigate.locate", target: get(selectionHost)?.current ?? null })
  }, {
    id: "trace.seek",
    label: "\u8DF3\u5230\u8FD9\u4E00\u6B65",
    tags: ["navigate"],
    args: { step: { type: "integer", description: "Trace \u6B65\u53F7" } },
    when: ({ get }, { step: step2 }) => canSeekTrace(get(playbackHost), step2),
    event: (_context, { step: step2 }) => ({ type: "debugger.seek", traceIndex: step2 })
  }, {
    id: "code.locate",
    label: "\u5B9A\u4F4D\u8FD9\u4E00\u884C",
    tags: ["navigate"],
    args: { line: { type: "integer" }, occurrence: { type: "integer", optional: true, description: "\u7B2C\u51E0\u6B21\u6267\u884C\uFF0C\u4ECE 1 \u5F00\u59CB" } },
    settle: () => LOCATED,
    when: ({ get }, { line, occurrence: occurrence2 }) => canLocateCode(get(playbackHost), get(editorHost)?.source ?? "", line, occurrence2),
    event: ({ get }, { line, occurrence: occurrence2 }) => ({
      type: "navigate.locate",
      target: lineSelection(get(editorHost)?.source ?? "", Number(line)),
      ...typeof occurrence2 === "number" ? { occurrence: occurrence2 } : {}
    })
  }, {
    /** 打开调试面板并在变量栏选中这个变量；行尾变量与结构图随选择高亮。 */
    id: "debugger.focus",
    label: "\u770B\u8FD9\u4E2A\u53D8\u91CF",
    tags: ["navigate"],
    args: { name: { type: "string" } },
    when: ({ get }, { name }) => canFocusDebugger(get(playbackHost), name),
    event: (_context, { name }) => ({ type: "navigate.focus", name })
  }, {
    /** 选中这次运行里的一个 World 对象（id 由课程约定，如 disk:3）。 */
    id: "world.select",
    label: "\u6307\u51FA\u8FD9\u4E2A\u5BF9\u8C61",
    tags: ["navigate"],
    args: { objectId: { type: "string" } },
    when: ({ get }, { objectId }) => canSelectWorld(get(playbackHost), objectId),
    event: ({ get }, { objectId }) => ({
      type: "selection.select",
      selection: { kind: "world-object", run: get(playbackHost).trace, objectId }
    })
  }]
});
function canLocateSelection(playback, selected) {
  return playback?.trace != null && selected !== null && selected.kind !== "world-object";
}
function canSeekTrace(playback, step2) {
  const run2 = playback?.trace ?? null;
  return run2 !== null && typeof step2 === "number" && Number.isInteger(step2) && step2 >= 1 && step2 <= run2.steps.length + 1;
}
function canLocateCode(playback, source2, line, occurrence2) {
  return playback?.trace != null && typeof line === "number" && lineSelection(source2, line) !== null && (occurrence2 === void 0 || typeof occurrence2 === "number" && Number.isInteger(occurrence2) && occurrence2 >= 1);
}
function canFocusDebugger(playback, name) {
  return playback?.trace != null && typeof name === "string" && name !== "";
}
function canSelectWorld(playback, objectId) {
  return playback?.trace != null && typeof objectId === "string" && objectId !== "";
}
function lineSelection(source2, line) {
  return lineSelectionImpl(source2, line);
}

// session/impl/model/playground/project.ts
var MESSAGES = 12;
function playgroundSnapshotImpl(hosts) {
  const { code: code2, lecture: told, chat: conversation } = hosts.state;
  const owner = (process) => ownerOf(hosts.state.processes, process);
  const lecture = told.script;
  const step2 = lecture?.steps[told.step];
  const shownReview = hosts.state.review.review;
  const position = hosts.playback?.position ?? null;
  const trace = hosts.playback?.trace ?? null;
  return {
    code: {
      shown: shownCodeImpl(hosts.state),
      mine: code2.mine,
      owner: code2.lent === null ? "student" : owner(code2.lent.to),
      editable: editableImpl(hosts.state)
    },
    run: trace === null ? null : {
      steps: trace.steps.length + 1,
      at: position === null ? null : { step: position.traceIndex, line: position.state.line },
      globals: position?.state.globals ?? {},
      stdout: (position?.state ?? trace.at(trace.steps.length + 1)).stdout ?? ""
    },
    lecture: lecture === null || step2 === void 0 ? null : {
      title: lecture.title,
      step: told.step,
      steps: lecture.steps.length,
      stepTitle: step2.title ?? null,
      paused: told.paused,
      done: told.done,
      waiting: told.predicting && step2.predict !== void 0 ? { kind: "predict", question: step2.predict.question, choices: step2.predict.choices.map((choice) => choice.label) } : told.writing === "student" || told.writing === "student-hint" ? { kind: "write" } : null
    },
    chat: {
      open: conversation.open,
      pending: conversation.pending,
      messages: conversation.messages.slice(-MESSAGES).map((message) => ({
        role: message.role === "user" ? "student" : "ai",
        ...message.title === void 0 ? {} : { title: message.title },
        text: message.text
      }))
    },
    review: shownReview === null ? null : {
      title: shownReview.title,
      comments: shownReview.comments.map((comment) => ({
        kind: comment.kind,
        line: comment.from.line,
        quote: comment.quote,
        text: comment.text,
        ...comment.replacement === void 0 ? {} : { replacement: comment.replacement }
      }))
    },
    marks: hosts.state.marks.items.map((item) => ({
      kind: item.kind,
      owner: owner(item.owner),
      at: anchorOf(item.anchor),
      ...item.to === void 0 ? {} : { to: anchorOf(item.to) },
      ...item.text === void 0 ? {} : { text: item.text }
    })),
    layout: { open: hosts.layout?.getSnapshot().open ?? null }
  };
}
function anchorOf(anchor) {
  switch (anchor.kind) {
    case "source":
      return { line: anchor.source.slice(0, anchor.from).split("\n").length };
    case "world-object":
      return { object: anchor.objectId };
    case "runtime-variable":
      return { variable: anchor.path.join(".") };
    case "trace-step":
      return { step: anchor.traceIndex };
    case "output-line":
      return { output: anchor.line };
  }
}

// session/api/model/snapshot.ts
var playgroundSnapshot = feature("playground-snapshot", {
  queries: [{
    id: "playground.snapshot",
    run: (context) => {
      const state = context.get(playground);
      return state === null ? null : projectPlaygroundSnapshot({
        playback: context.get(playbackHost),
        layout: context.get(layoutHost),
        state: state.getSnapshot()
      });
    }
  }]
});
var projectPlaygroundSnapshot = (hosts) => playgroundSnapshotImpl(hosts);

// session/api/model/tour.ts
var DWELL = 1800;
var timer2 = {
  delay: (ms, run2) => {
    const handle = setTimeout(run2, ms);
    return () => clearTimeout(handle);
  }
};
var tour = feature("tour", {
  requires: [playground, playbackHost],
  create: ({ bus, own }, options2) => {
    const scheduler = options2?.scheduler ?? timer2;
    const pending2 = /* @__PURE__ */ new Set();
    const stop2 = bus.subscribe(["tour.dwell"], (event4) => {
      const cancel = scheduler.delay(event4.ms ?? options2?.dwell ?? DWELL, () => {
        pending2.delete(cancel);
        bus.emit({ type: "tour.dwelt", ticket: event4.ticket }, "tour");
      });
      pending2.add(cancel);
    });
    own({ dispose: () => {
      stop2();
      for (const cancel of pending2) cancel();
    } });
  },
  actions: [{
    id: "trace.tour",
    label: "\u8D70\u4E00\u904D",
    tags: ["navigate", "present"],
    args: { stops: { type: "array", items: { type: "object" } } },
    when: ({ get }, { stops }) => canPlayTour(get(playbackHost), stops),
    event: (_context, { stops }, caller) => ({ type: "tour.play", stops, actor: caller.actor, owner: caller.process }),
    settle: () => ({ on: "tour.finished", fail: ["tour.cancelled"], timeoutMs: 12e4 })
  }]
});
function canPlayTour(playback, stops) {
  const run2 = playback?.trace ?? null;
  return run2 !== null && isStops(stops, run2.steps.length + 1);
}

// session/impl/model/trace/queries.ts
import { sourceOccurrences as sourceOccurrences3, variableTimeline as variableTimeline2 } from "./pico.js";
function tracePosition(playback) {
  const position = playback?.position ?? null;
  return position === null ? null : Object.freeze({ step: position.traceIndex, line: position.state.line });
}
function traceOccurrences(run2, source2, line) {
  const target2 = typeof line === "number" ? lineSelectionImpl(source2, line) : null;
  if (run2 === null || target2?.kind !== "source") return Object.freeze([]);
  return Object.freeze(sourceOccurrences3(run2, target2).map((point) => Object.freeze({ ordinal: point.ordinal, step: point.traceIndex })));
}
function traceFrames(playback, step2) {
  const at = stepOf(playback, step2);
  return at === null ? null : Object.freeze((at.run.at(at.step).frames ?? []).map((frame) => Object.freeze({
    name: frame.name,
    locals: frame.locals
  })));
}
function traceChanges(run2, name) {
  if (run2 === null || typeof name !== "string") return Object.freeze([]);
  return Object.freeze(variableTimeline2({ kind: "runtime-variable", run: run2, path: ["variables", name] }).map((point) => Object.freeze({
    step: point.traceIndex,
    line: point.line,
    change: point.change,
    value: point.value ?? null
  })));
}
function traceOutput(playback, step2) {
  const at = stepOf(playback, step2);
  if (at === null) return Object.freeze([]);
  const steps = outputSteps(at.run);
  return Object.freeze(outputLines(at.run.at(at.step).stdout ?? "").map((text2, index) => Object.freeze({ text: text2, step: steps[index] ?? at.step })));
}
var positionQuery = {
  id: "trace.position",
  run: ({ get }) => tracePosition(get(playbackHost))
};
var occurrencesQuery = {
  id: "trace.occurrences",
  run: ({ get }, { line }) => traceOccurrences(get(playbackHost)?.trace ?? null, get(editorHost)?.source ?? "", Number(line))
};
var framesQuery = {
  id: "trace.frames",
  run: ({ get }, args) => traceFrames(get(playbackHost), typeof args?.step === "number" ? args.step : void 0)
};
var changesQuery = {
  id: "trace.changes",
  run: ({ get }, { name }) => traceChanges(get(playbackHost)?.trace ?? null, typeof name === "string" ? name : "")
};
var outputQuery = {
  id: "trace.output",
  run: ({ get }, args) => traceOutput(get(playbackHost), typeof args?.step === "number" ? args.step : void 0)
};
function outputSteps(run2) {
  const cached = printed.get(run2);
  if (cached !== void 0) return cached;
  const steps = [];
  run2.steps.forEach((step2, index) => {
    if (!step2.changes.some((change) => change.path[0] === "stdout")) return;
    const count = outputLines(run2.at(index + 1).stdout ?? "").length;
    while (steps.length < count) steps.push(index + 1);
  });
  printed.set(run2, steps);
  return steps;
}
var printed = /* @__PURE__ */ new WeakMap();
function outputLines(stdout) {
  const lines = stdout.split("\n");
  return lines.at(-1) === "" ? lines.slice(0, -1) : lines;
}
function stepOf(playback, step2) {
  const run2 = playback?.trace ?? null;
  if (run2 === null) return null;
  const at = typeof step2 === "number" ? step2 : playback?.position?.traceIndex ?? run2.steps.length + 1;
  return Number.isInteger(at) && at >= 0 && at <= run2.steps.length + 1 ? { run: run2, step: at } : null;
}

// session/api/model/trace.ts
var traceQueries = feature("trace-queries", {
  requires: [editorHost, playbackHost],
  queries: [positionQuery, occurrencesQuery, framesQuery, changesQuery, outputQuery]
});

// session/impl/ui/shell/hook.ts
import { createContext as createContext2, useContext, useEffect, useRef, useState } from "./libs/react.js";
var SessionEnvironmentContext = createContext2(null);
function useSessionImpl(view, config) {
  const environment = useContext(SessionEnvironmentContext);
  const [session, setSession] = useState(null);
  const latest = useRef(view);
  latest.current = view;
  const bus = view?.bus;
  useEffect(() => {
    const session2 = latest.current;
    if (bus === void 0 || session2 === null) return;
    const assembled = assembleSession(bus, [
      editorHost.with(session2.editor.state),
      layoutHost.with(session2.layout),
      ...config.provide?.(session2) ?? [],
      ...withEnvironment2(config.features, environment)
    ]);
    const base = config.editorExtensions ?? [];
    const extensions = assembled.views.flatMap((view2) => view2.slot === "editor-extension" ? [view2.extension(assembled)] : []);
    if (extensions.length > 0) bus.emit({ type: "editor.reconfig", options: { extensions: [base, ...extensions] } }, "session");
    setSession(assembled);
    return () => {
      setSession(null);
      if (extensions.length > 0) bus.emit({ type: "editor.reconfig", options: { extensions: base } }, "session");
      assembled.dispose();
    };
  }, [bus, config, environment]);
  return session;
}

// session/impl/ui/shell/shell.tsx
import { Fragment, useMemo, useRef as useRef2 } from "./libs/react.js";
import { PlaygroundShell, Widget } from "./pico.js";

// session/impl/ui/shell/shell.css
var shell_default = ".pico-session { position: relative; width: 100%; height: 100%; min-width: 0; min-height: 0; }\n.pico-session > .pico-page { height: 100%; }\n.pico-session-editor { position: relative; display: flex; flex: 1; min-width: 0; min-height: 0; container: pico-editor / inline-size; }\n.pico-session-editor > * { flex: 1; min-width: 0; min-height: 0; }\n/* \u7F16\u8F91\u5668\u5916\u591A\u4E86\u4E00\u5C42\u6D6E\u5C42\u5BB9\u5668\uFF1A\u8BA9\u7F16\u8F91\u5361\u7247\u7167\u5E38\u6491\u6EE1\u6574\u5217\uFF0C\u800C\u4E0D\u662F\u53EA\u6709\u5185\u5BB9\u90A3\u4E48\u9AD8\u3002 */\n.pico-session-editor > .pico-widget > .pico-card { flex: 1 1 0; min-width: 0; min-height: 0; }\n/* \u8986\u76D6\u6574\u4E2A\u4F1A\u8BDD\u754C\u9762\u7684\u4E00\u5C42\uFF1A\u53EA\u753B\uFF0C\u4E0D\u62E6\u622A\u6307\u9488\uFF1B\u9700\u8981\u70B9\u51FB\u7684\u5143\u7D20\u81EA\u5DF1\u6253\u5F00 pointer-events\u3002 */\n.pico-session-overlay { position: absolute; inset: 0; z-index: 30; pointer-events: none; overflow: hidden; }\n/* \u4E16\u754C\u5BB9\u5668\u662F flex \u5217\uFF1A\u8BFE\u7A0B\u753B\u5E03\uFF08.pico-scene\uFF09\u9760 flex:1 \u62FF\u786E\u5B9A\u9AD8\u5EA6\uFF0C\n   \u5426\u5219\u5B83\u6309\u5185\u5BB9\u7B97\u9AD8\uFF0C\u753B\u51FA\u6765\u7684\u56FE\u53EA\u6309\u5BBD\u5EA6\u5B9A\u957F\uFF0C\u4F1A\u6EA2\u51FA\u4E16\u754C\u5361\u7247\u3002 */\n.pico-session-world { display: flex; flex-direction: column; min-width: 0; min-height: 0; }\n";

// session/impl/ui/shell/shell.tsx
import { jsx, jsxs } from "./libs/react.js";
function dockedLayout(raw, panels, docked) {
  const open = raw.open ?? panels.map((panel) => panel.key);
  const visible2 = panels.map((panel) => panel.key).filter((key) => open.includes(key));
  const leading = visible2.filter((key) => docked.has(key));
  if (leading.length === 0) return raw;
  const others = visible2.filter((key) => !docked.has(key));
  const main = raw.tree !== null ? raw.tree : others.length === 0 ? { slot: "editor" } : others.length === 1 ? { split: "column", key: "session:main", children: [{ slot: "editor" }, { slot: others[0] }] } : { split: "row", key: "session:main", children: [{ slot: "editor" }, { split: "column", key: "session:panels", children: others.map((slot) => ({ slot })) }] };
  const sizes = Object.fromEntries(leading.map((key) => [key, docked.get(key)]));
  return { ...raw, tree: { split: "row", key: "session:dock", children: [...leading.map((slot) => ({ slot })), main] }, sizes: { ...sizes, ...raw.sizes } };
}
function SessionShellImpl({ name, view, session }) {
  const context = sessionView(session, (event4) => view.send(event4, "session"));
  const toolbar = [...view.toolbar];
  const panels = [];
  const docked = /* @__PURE__ */ new Map();
  const overlays = [];
  const layers = [];
  for (const contributed of session.views) {
    if (contributed.slot === "toolbar") {
      const controls = contributed.controls(context);
      if (controls.length > 0) toolbar.push({ label: contributed.label, controls });
    } else if (contributed.slot === "panel") {
      if (contributed.when?.(session) === false) continue;
      panels.push({ key: contributed.key, title: contributed.title, icon: contributed.icon, flush: contributed.flush, content: contributed.render(context) });
      if (contributed.dock === "start") docked.set(contributed.key, contributed.dockSize ?? 0.35);
    } else if (contributed.slot === "editor-overlay") {
      overlays.push(/* @__PURE__ */ jsx(Fragment, { children: contributed.render(context) }, contributed.key));
    } else if (contributed.slot === "overlay") {
      layers.push(/* @__PURE__ */ jsx(Fragment, { children: contributed.render(context) }, contributed.key));
    }
  }
  const keysRef = useRef2({ panels: [], docked: /* @__PURE__ */ new Map() });
  keysRef.current = { panels, docked };
  const layout = useMemo(() => {
    let lastRaw = null;
    let lastKeys = "";
    let cached = null;
    return {
      subscribe: view.layout.subscribe,
      getSnapshot: () => {
        const raw = view.layout.getSnapshot();
        const keys = keysRef.current.panels.map((panel) => `${panel.key}${keysRef.current.docked.has(panel.key) ? "!" : ""}`).join(",");
        if (raw !== lastRaw || keys !== lastKeys || cached === null) {
          lastRaw = raw;
          lastKeys = keys;
          cached = dockedLayout(raw, keysRef.current.panels, keysRef.current.docked);
        }
        return cached;
      }
    };
  }, [view.layout]);
  return /* @__PURE__ */ jsxs("div", { className: "pico-session", children: [
    /* @__PURE__ */ jsx("style", { children: shell_default }),
    /* @__PURE__ */ jsx(
      PlaygroundShell,
      {
        name,
        layout,
        menu: view.menu,
        onEvent: context.dispatch,
        toolbar,
        panels,
        editor: /* @__PURE__ */ jsxs("div", { className: "pico-session-editor", children: [
          /* @__PURE__ */ jsx(Widget, { widget: view.editor }),
          overlays
        ] })
      }
    ),
    layers.length > 0 && /* @__PURE__ */ jsx("div", { className: "pico-session-overlay", children: layers })
  ] });
}

// session/impl/ui/shell/page.tsx
import { usePlayground } from "./pico.js";
import { jsx as jsx2 } from "./libs/react.js";
function SessionPageImpl({ course, host = {} }) {
  const view = usePlayground(course.component, host.source ?? course.starter, { ...course.playground, ...host.options });
  const session = useSessionImpl(view, course.session);
  if (view === null || session === null) return null;
  return /* @__PURE__ */ jsx2(SessionShellImpl, { name: course.name, view, session });
}

// session/api/ui/shell.ts
var SessionEnvironmentProvider = SessionEnvironmentContext.Provider;
var useSession = useSessionImpl;
var SessionShell = SessionShellImpl;
function toolbarButton(item, pressed) {
  if (item.icon === void 0) throw new Error(`Action ${item.id} has no toolbar icon`);
  return { kind: "button", icon: item.icon, label: item.label, pressed, disabled: !item.enabled, event: item.event };
}
function SessionPage(props) {
  return SessionPageImpl(props);
}

// session/impl/ui/ai/card.tsx
import { useEffect as useEffect2, useId, useRef as useRef3, useState as useState2 } from "./libs/react.js";

// session/impl/ui/markdown.tsx
import { Fragment as Fragment2, jsx as jsx3 } from "./libs/react.js";
var ITEM = /^\s*(?:[-*+]|(\d+)[.)])\s+(.*)$/;
var ESCAPES = { n: "\n", t: "	", r: "\r", '"': '"', "\\": "\\" };
function unescapeInline(text2) {
  return text2.replace(/\\([nrt"\\])/g, (_match, code2) => ESCAPES[code2]);
}
function unescape(text2) {
  const lines = text2.replace(/\r\n?/g, "\n").split("\n");
  let inCode = false;
  for (let at = 0; at < lines.length; at += 1) {
    if (/^\s*```/.test(lines[at])) {
      inCode = !inCode;
    } else if (!inCode) {
      lines[at] = unescapeInline(lines[at]);
    }
  }
  return lines.join("\n");
}
function blocksImpl(text2) {
  const blocks = [];
  const lines = unescape(text2).split("\n");
  for (let at = 0; at < lines.length; ) {
    const line = lines[at];
    if (/^\s*```/.test(line)) {
      const body = [];
      at += 1;
      while (at < lines.length && !/^\s*```/.test(lines[at])) body.push(lines[at++]);
      at += 1;
      blocks.push({ kind: "code", text: body.join("\n") });
    } else if (line.trim() === "") {
      at += 1;
    } else if (/^#{1,6}\s/.test(line)) {
      blocks.push({ kind: "heading", text: line.replace(/^#{1,6}\s+/, "") });
      at += 1;
    } else if (ITEM.test(line)) {
      const ordered = ITEM.exec(line)[1] !== void 0;
      const items = [];
      while (at < lines.length && ITEM.test(lines[at]) && ITEM.exec(lines[at])[1] !== void 0 === ordered) items.push(ITEM.exec(lines[at++])[2]);
      blocks.push({ kind: "list", ordered, items });
    } else {
      const body = [];
      while (at < lines.length && lines[at].trim() !== "" && !/^\s*```/.test(lines[at]) && !/^#{1,6}\s/.test(lines[at]) && !ITEM.test(lines[at])) body.push(lines[at++]);
      blocks.push({ kind: "paragraph", lines: body });
    }
  }
  return blocks;
}
function inlineImpl(text2) {
  return text2.split(/(`[^`\n]*`?|\*\*[^*\n]*(?:\*\*)?|\*[^*\s][^*\n]*\*)/g).map((part, index) => {
    if (part.startsWith("`") && part.length > 1) {
      return /* @__PURE__ */ jsx3("code", { children: part.length > 1 && part.endsWith("`") && part.length > 2 ? part.slice(1, -1) : part.slice(1) }, index);
    }
    if (part.startsWith("**") && part.length > 2) {
      return /* @__PURE__ */ jsx3("strong", { children: part.endsWith("**") && part.length > 3 ? part.slice(2, -2) : part.slice(2) }, index);
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return /* @__PURE__ */ jsx3("em", { children: part.slice(1, -1) }, index);
    return part;
  });
}
function inlineMarkdownImpl(text2) {
  return /* @__PURE__ */ jsx3(Fragment2, { children: inlineImpl(text2) });
}
function markdownImpl(text2) {
  return /* @__PURE__ */ jsx3(Fragment2, { children: blocksImpl(text2).map((block, index) => {
    switch (block.kind) {
      case "code":
        return /* @__PURE__ */ jsx3("pre", { children: /* @__PURE__ */ jsx3("code", { children: block.text }) }, index);
      case "heading":
        return /* @__PURE__ */ jsx3("p", { children: /* @__PURE__ */ jsx3("strong", { children: inlineImpl(block.text) }) }, index);
      case "list": {
        const items = block.items.map((item, at) => /* @__PURE__ */ jsx3("li", { children: inlineImpl(item) }, at));
        return block.ordered ? /* @__PURE__ */ jsx3("ol", { children: items }, index) : /* @__PURE__ */ jsx3("ul", { children: items }, index);
      }
      case "paragraph":
        return /* @__PURE__ */ jsx3("p", { children: block.lines.flatMap((line, at) => at === 0 ? inlineImpl(line) : [/* @__PURE__ */ jsx3("br", {}, `br${at}`), ...inlineImpl(line)]) }, index);
    }
  }) });
}

// session/impl/ui/ai/card.css
var card_default = '.pico-ai {\n  display: flex; width: 100%; height: 100%; min-width: 0; min-height: 0;\n  flex-direction: column; background: var(--pico-surface-raised);\n}\n.pico-ai-head { display: flex; align-items: center; gap: var(--pico-space-3); min-height: 56px; padding: var(--pico-space-2) var(--pico-space-4); border-bottom: var(--pico-line); background: var(--pico-surface-raised); }\n.pico-ai-mark { display: grid; place-items: center; flex: 0 0 auto; background: var(--pico-accent-wash); color: var(--pico-accent-deep); font: 700 var(--pico-size-xs)/1 var(--pico-font-ui); letter-spacing: -0.01em; }\n.pico-ai-mark { width: 32px; height: 32px; border-radius: 10px; }\n.pico-ai-title { display: grid; min-width: 0; gap: 2px; }\n.pico-ai-title strong { overflow: hidden; color: var(--pico-ink); font: 650 var(--pico-size-sm)/1.2 var(--pico-font-ui); text-overflow: ellipsis; white-space: nowrap; }\n.pico-ai-title small { overflow: hidden; color: var(--pico-ink-soft); font: 400 var(--pico-size-xs)/1.25 var(--pico-font-ui); text-overflow: ellipsis; white-space: nowrap; }\n.pico-ai-tools { display: flex; align-items: center; gap: var(--pico-space-1); margin-left: auto; }\n.pico-ai .pico-ai-new { min-height: 32px; padding: 0 var(--pico-space-2); border: 0; border-radius: 8px; background: transparent; color: var(--pico-ink-soft); font: 600 var(--pico-size-xs)/1 var(--pico-font-ui); cursor: pointer; }\n.pico-ai .pico-ai-new:hover { background: var(--pico-accent-wash); color: var(--pico-accent-deep); }\n.pico-ai-history-button { display: inline-grid; place-items: center; flex: 0 0 auto; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 8px; background: transparent; color: var(--pico-ink-soft); font: 600 var(--pico-size-xs)/1 var(--pico-font-ui); cursor: pointer; }\n.pico-ai-history-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }\n.pico-ai-history-button:hover:not(:disabled), .pico-ai-history-button[aria-pressed="true"] { background: var(--pico-accent-wash); color: var(--pico-accent-deep); }\n\n.pico-ai-log { display: flex; flex: 1 1 auto; min-height: 0; flex-direction: column; gap: var(--pico-space-5); padding: var(--pico-space-5) var(--pico-space-4); overflow: auto; color: var(--pico-ink); font: 400 var(--pico-size-code)/1.65 var(--pico-font-text); scrollbar-color: var(--pico-hairline) transparent; user-select: text; -webkit-user-select: text; }\n.pico-ai-empty { display: grid; align-content: start; gap: var(--pico-space-2); max-width: 64ch; }\n.pico-ai-empty h2 { margin: 0; color: var(--pico-ink); font: 650 var(--pico-size-md)/1.35 var(--pico-font-ui); letter-spacing: -0.01em; }\n.pico-ai-empty > p { margin: 0; color: var(--pico-ink-soft); }\n.pico-ai-prompts { display: grid; margin-top: var(--pico-space-3); border-block: var(--pico-line); }\n.pico-ai .pico-ai-prompts button { min-height: 44px; padding: var(--pico-space-2) 2px; border: 0; border-bottom: var(--pico-line); border-radius: 0; background: transparent; color: var(--pico-ink); font: 500 var(--pico-size-sm)/1.35 var(--pico-font-text); text-align: left; cursor: pointer; transition: color var(--pico-duration-fast), background var(--pico-duration-fast), padding var(--pico-duration-fast); }\n.pico-ai .pico-ai-prompts button:last-child { border-bottom: 0; }\n.pico-ai .pico-ai-prompts button:hover { padding-inline: var(--pico-space-2); background: var(--pico-accent-wash); color: var(--pico-accent-deep); }\n.pico-ai-history { display: grid; align-content: start; gap: var(--pico-space-2); }\n.pico-ai-history details { border-bottom: var(--pico-line); }\n.pico-ai-history summary { padding: var(--pico-space-2) 0; color: var(--pico-ink); font: 600 var(--pico-size-sm)/1.4 var(--pico-font-ui); cursor: pointer; }\n.pico-ai-history-messages { display: grid; gap: var(--pico-space-2); padding: 0 0 var(--pico-space-3); }\n.pico-ai-history-messages p { display: grid; gap: 2px; margin: 0; color: var(--pico-ink-soft); }\n.pico-ai-history-messages p[data-role="user"] { color: var(--pico-ink); }\n.pico-ai-history-messages strong { color: var(--pico-ink); font: 650 var(--pico-size-sm)/1.4 var(--pico-font-ui); }\n.pico-ai-note { min-width: 0; }\n.pico-ai-response { display: grid; gap: var(--pico-space-2); min-width: 0; }\n.pico-ai-response h2 { margin: 1px 0 0; color: var(--pico-ink); font: 650 var(--pico-size-sm)/1.4 var(--pico-font-ui); letter-spacing: -0.01em; }\n.pico-ai-response p { max-width: 64ch; margin: 0; color: var(--pico-ink-soft); white-space: pre-line; }\n.pico-ai-response :is(ul, ol) { max-width: 64ch; margin: 0; padding-left: 1.4em; color: var(--pico-ink-soft); }\n.pico-ai-response li + li { margin-top: 2px; }\n.pico-ai-response pre { max-width: 100%; margin: 0; padding: var(--pico-space-2); overflow-x: auto; border-radius: 6px; background: var(--pico-accent-wash); }\n.pico-ai-response pre code { padding: 0; background: none; white-space: pre; }\n.pico-ai-response strong { color: var(--pico-ink); font-weight: 650; }\n.pico-ai-response code { padding: 0 4px; border-radius: 4px; background: var(--pico-accent-wash); color: var(--pico-ink); font: 500 .92em/1.4 var(--pico-font-mono); }\n.pico-ai-said { display: grid; gap: var(--pico-space-2); align-self: flex-end; max-width: 84%; padding: 9px var(--pico-space-3); border-radius: 12px 12px 4px 12px; background: var(--pico-accent-wash); color: var(--pico-ink); }\n.pico-ai-said > p { margin: 0; }\n.pico-ai-quote { display: flex; align-items: flex-start; gap: var(--pico-space-2); min-width: 0; margin: 0; padding-left: var(--pico-space-2); border-left: 2px solid var(--pico-accent); }\n.pico-ai-quote code { overflow: hidden; flex: 1 1 auto; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; color: var(--pico-ink); font: 400 var(--pico-size-xs)/1.5 var(--pico-font-mono); white-space: pre-wrap; }\n.pico-ai-quote figcaption { flex: 0 0 auto; color: var(--pico-ink-soft); font: 600 var(--pico-size-xs)/1.5 var(--pico-font-ui); font-variant-numeric: tabular-nums; }\n.pico-ai-quoted { display: flex; align-items: flex-start; gap: var(--pico-space-2); margin: 0; }\n.pico-ai-quoted .pico-ai-quote { flex: 1 1 auto; }\n.pico-ai .pico-ai-quoted button { flex: 0 0 auto; width: 26px; height: 26px; padding: 0; border: 0; border-radius: 7px; background: transparent; color: var(--pico-ink-soft); font: 500 var(--pico-size-sm)/1 var(--pico-font-ui); cursor: pointer; }\n.pico-ai .pico-ai-quoted button:hover { background: var(--pico-accent-wash); color: var(--pico-accent-deep); }\n\n.pico-ai .pico-ai-cta { justify-self: start; min-height: 36px; margin-top: var(--pico-space-1); padding: 0 var(--pico-space-3); border: 1px solid color-mix(in srgb, var(--pico-accent) 55%, var(--pico-hairline)); border-radius: 9px; background: var(--pico-accent-wash); color: var(--pico-accent-deep); font: 650 var(--pico-size-sm)/1 var(--pico-font-ui); cursor: pointer; transition: background var(--pico-duration-fast), border-color var(--pico-duration-fast); }\n.pico-ai .pico-ai-cta:hover:not(:disabled) { border-color: var(--pico-accent); background: color-mix(in srgb, var(--pico-accent) 18%, transparent); }\n.pico-ai .pico-ai-cta:disabled { opacity: .55; cursor: progress; }\n.pico-ai-options { display: grid; gap: var(--pico-space-1); margin-top: var(--pico-space-2); }\n.pico-ai-options > span { color: var(--pico-ink-soft); font: 600 var(--pico-size-xs)/1.3 var(--pico-font-ui); }\n.pico-ai-chips { display: flex; flex-wrap: wrap; gap: var(--pico-space-1); }\n.pico-ai .pico-ai-chip { min-height: 32px; padding: 0 var(--pico-space-2); border: 0; border-radius: 8px; background: transparent; color: var(--pico-accent-deep); font: 600 var(--pico-size-xs)/1.2 var(--pico-font-ui); cursor: pointer; transition: color var(--pico-duration-fast), background var(--pico-duration-fast); }\n.pico-ai .pico-ai-chip:hover:not(:disabled) { background: var(--pico-accent-wash); }\n.pico-ai .pico-ai-chip:disabled { opacity: .45; cursor: not-allowed; }\n\n.pico-ai-thinking { display: flex; align-items: center; gap: var(--pico-space-2); color: var(--pico-ink-soft); font: 500 var(--pico-size-xs)/1.4 var(--pico-font-ui); }\n.pico-ai-thinking span { width: 6px; height: 6px; border-radius: 50%; background: var(--pico-accent); }\n.pico-ai-dock { display: flex; flex-wrap: wrap; gap: var(--pico-space-2); }\n.pico-ai .pico-ai-dock button { min-height: 34px; padding: 0 var(--pico-space-3); border: var(--pico-line); border-radius: 9px; background: var(--pico-surface); color: var(--pico-ink); font: 600 var(--pico-size-sm)/1 var(--pico-font-ui); cursor: pointer; transition: border-color var(--pico-duration-fast), background var(--pico-duration-fast); }\n.pico-ai .pico-ai-dock button:hover { border-color: var(--pico-accent); background: var(--pico-accent-wash); }\n.pico-ai .pico-ai-dock button[data-primary="true"] { border-color: color-mix(in srgb, var(--pico-accent) 55%, var(--pico-hairline)); background: var(--pico-accent-wash); color: var(--pico-accent-deep); }\n.pico-ai-composer { display: grid; gap: var(--pico-space-2); padding: var(--pico-space-2) var(--pico-space-3) var(--pico-space-3); border-top: var(--pico-line); background: var(--pico-surface-raised); }\n.pico-ai-compose { display: flex; align-items: flex-end; gap: var(--pico-space-2); padding: 5px; border: var(--pico-line); border-radius: 12px; background: var(--pico-surface); transition: border-color var(--pico-duration-fast), box-shadow var(--pico-duration-fast); }\n.pico-ai-compose:focus-within { border-color: var(--pico-accent); box-shadow: 0 0 0 3px var(--pico-accent-wash); }\n.pico-ai-compose label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\n.pico-ai .pico-ai-compose textarea { field-sizing: content; flex: 1 1 auto; min-width: 0; min-height: 38px; max-height: 132px; padding: 8px 9px; border: 0; outline: 0; background: transparent; color: var(--pico-ink); font: 400 var(--pico-size-code)/1.5 var(--pico-font-text); resize: none; }\n.pico-ai .pico-ai-compose textarea::placeholder { color: var(--pico-code-dim); }\n.pico-ai .pico-ai-send { display: grid; place-items: center; flex: 0 0 auto; width: 38px; height: 38px; padding: 0; border: 0; border-radius: 10px; background: var(--pico-accent); color: var(--pico-on-accent); cursor: pointer; transition: background var(--pico-duration-fast), transform var(--pico-duration-fast); }\n.pico-ai .pico-ai-send svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }\n.pico-ai .pico-ai-send:hover:not(:disabled) { background: var(--pico-accent-deep); transform: translateY(-1px); }\n.pico-ai .pico-ai-send:active:not(:disabled) { transform: translateY(0); }\n.pico-ai .pico-ai-send:disabled { background: var(--pico-hairline); color: var(--pico-ink-soft); cursor: not-allowed; }\n\n@media (max-width: 760px) {\n  .pico-ai-log { padding: var(--pico-space-3); }\n  .pico-ai-title small { display: none; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .pico-ai .pico-ai-send:hover:not(:disabled) { transform: none; }\n}\n';

// session/impl/ui/ai/card.tsx
import { Fragment as Fragment3, jsx as jsx4, jsxs as jsxs2 } from "./libs/react.js";
function aiCardPanel(view) {
  const state = chatOf(view.get);
  return state === null ? null : /* @__PURE__ */ jsx4(
    AiCardImpl,
    {
      state,
      resolve: view.resolve,
      getContext: () => aiContext(view.get(editorHost), view.get(playbackHost)),
      onEvent: view.dispatch
    }
  );
}
function AiCardImpl({ state, resolve, getContext, onEvent }) {
  const inputId = useId();
  const log = useRef3(null);
  const input = useRef3(null);
  const [draft, setDraft2] = useState2("");
  const [historyOpen, setHistoryOpen] = useState2(false);
  const chatting = !historyOpen;
  const sendable = (text2) => !state.pending && (text2.trim() !== "" || state.quote !== null);
  const ask2 = (text2) => {
    if (!sendable(text2)) return;
    onEvent({ type: "ai.ask", text: text2, context: getContext() });
    setDraft2("");
  };
  const submit = (event4) => {
    event4.preventDefault();
    ask2(draft);
  };
  useEffect2(() => {
    const element = log.current;
    if (element !== null) element.scrollTop = element.scrollHeight;
  }, [historyOpen, state.messages.length]);
  useEffect2(() => {
    if (chatting && state.composing) input.current?.focus();
  }, [chatting, state.composing]);
  const lastAssistant = state.messages.findLast((message) => message.role === "assistant")?.id;
  const caller = { actor: "ai", process: state.process };
  const buttons = (refs) => (refs ?? []).flatMap((ref) => {
    const item = resolve(ref.action, ref.args, caller);
    return item === null ? [] : [{ ref, label: ref.label, item }];
  });
  const invoke = (ref) => onEvent({
    type: "session.invoke",
    action: ref.action,
    args: ref.args ?? {},
    actor: "ai",
    process: state.process
  });
  const dock = buttons(state.dock).filter((button) => button.item.enabled);
  return /* @__PURE__ */ jsxs2("section", { className: "pico-ai", "aria-label": "AI", children: [
    /* @__PURE__ */ jsx4("style", { children: card_default }),
    /* @__PURE__ */ jsxs2("header", { className: "pico-ai-head", children: [
      /* @__PURE__ */ jsx4("span", { className: "pico-ai-mark", "aria-hidden": "true", children: "AI" }),
      /* @__PURE__ */ jsxs2("span", { className: "pico-ai-title", children: [
        /* @__PURE__ */ jsx4("strong", { children: historyOpen ? "\u5386\u53F2\u5BF9\u8BDD" : "\u5B66\u4E60\u52A9\u624B" }),
        /* @__PURE__ */ jsx4("small", { children: historyOpen ? `${state.history.length} \u6B21\u8BB0\u5F55` : state.pending ? "\u6B63\u5728\u56DE\u7B54" : "\u7ED3\u5408\u4EE3\u7801\u548C\u5F53\u524D\u6267\u884C" })
      ] }),
      /* @__PURE__ */ jsxs2("span", { className: "pico-ai-tools", children: [
        chatting && state.messages.length > 0 && /* @__PURE__ */ jsx4(
          "button",
          {
            type: "button",
            className: "pico-ai-new",
            onClick: () => onEvent({ type: "ai.renew" }),
            children: "\u65B0\u95EE\u9898"
          }
        ),
        state.history.length > 0 && /* @__PURE__ */ jsx4(
          "button",
          {
            type: "button",
            className: "pico-ai-history-button",
            "aria-label": "\u5386\u53F2\u5BF9\u8BDD",
            title: "\u5386\u53F2\u5BF9\u8BDD",
            "aria-pressed": historyOpen,
            onClick: () => setHistoryOpen((open) => !open),
            children: /* @__PURE__ */ jsxs2("svg", { viewBox: "0 0 18 18", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsx4("path", { d: "M4.2 5.5A6 6 0 1 1 3 9" }),
              /* @__PURE__ */ jsx4("path", { d: "M2.5 3.5v3h3M9 5.5V9l2.2 1.4" })
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx4("div", { ref: log, className: "pico-ai-log", role: "log", "aria-live": "polite", "aria-busy": state.pending, children: historyOpen ? /* @__PURE__ */ jsx4("div", { className: "pico-ai-history", children: state.history.map((conversation, index) => /* @__PURE__ */ jsxs2("details", { open: index === 0, children: [
      /* @__PURE__ */ jsx4("summary", { children: conversation.title }),
      /* @__PURE__ */ jsx4("div", { className: "pico-ai-history-messages", children: conversation.messages.map((message) => /* @__PURE__ */ jsxs2("p", { "data-role": message.role, children: [
        message.title !== void 0 && /* @__PURE__ */ jsx4("strong", { children: message.title }),
        message.text
      ] }, message.id)) })
    ] }, conversation.id)) }) : /* @__PURE__ */ jsxs2(Fragment3, { children: [
      state.messages.length === 0 && /* @__PURE__ */ jsxs2("div", { className: "pico-ai-empty", children: [
        /* @__PURE__ */ jsx4("h2", { children: "\u6709\u95EE\u9898\u968F\u65F6\u95EE\u6211" }),
        /* @__PURE__ */ jsx4("p", { children: "\u9009\u4E2D\u4E00\u6BB5\u4EE3\u7801\u3001\u4E00\u4E2A\u53D8\u91CF\u6216\u8FD0\u884C\u4E2D\u7684\u67D0\u4E00\u6B65\uFF0C\u95EE\u5B83\u5728\u505A\u4EC0\u4E48\uFF1B\u4E5F\u53EF\u4EE5\u76F4\u63A5\u5728\u4E0B\u9762\u8F93\u5165\u3002" }),
        state.prompts.length > 0 && /* @__PURE__ */ jsx4("div", { className: "pico-ai-prompts", "aria-label": "\u63D0\u95EE\u793A\u4F8B", children: state.prompts.map((prompt) => typeof prompt === "string" ? /* @__PURE__ */ jsx4("button", { type: "button", onClick: () => ask2(prompt), children: prompt }, prompt) : buttons([prompt]).map(({ ref, label, item }) => /* @__PURE__ */ jsx4(
          "button",
          {
            type: "button",
            disabled: !item.enabled,
            onClick: () => invoke(ref),
            children: label
          },
          label
        ))) })
      ] }),
      state.messages.map((message) => {
        if (message.role === "user") return /* @__PURE__ */ jsxs2("div", { className: "pico-ai-said", children: [
          message.quote !== void 0 && /* @__PURE__ */ jsx4(Quote, { quote: message.quote }),
          /* @__PURE__ */ jsx4("p", { children: message.text })
        ] }, message.id);
        const latest = message.id === lastAssistant;
        const primary = latest ? buttons(message.primary === void 0 ? [] : [message.primary])[0] : void 0;
        const chips = latest ? buttons(message.actions) : [];
        return /* @__PURE__ */ jsx4("article", { className: "pico-ai-note", children: /* @__PURE__ */ jsxs2("div", { className: "pico-ai-response", children: [
          message.title !== void 0 && /* @__PURE__ */ jsx4("h2", { children: message.title }),
          markdownImpl(message.text),
          primary !== void 0 && /* @__PURE__ */ jsx4(
            "button",
            {
              type: "button",
              className: "pico-ai-cta",
              disabled: !primary.item.enabled,
              onClick: () => invoke(primary.ref),
              children: primary.label
            }
          ),
          chips.length > 0 && /* @__PURE__ */ jsxs2("div", { className: "pico-ai-options", children: [
            /* @__PURE__ */ jsx4("span", { children: "\u63A5\u4E0B\u6765" }),
            /* @__PURE__ */ jsx4("div", { className: "pico-ai-chips", children: chips.map((chip, index) => /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                className: "pico-ai-chip",
                disabled: !chip.item.enabled,
                onClick: () => invoke(chip.ref),
                children: chip.label
              },
              `${chip.item.id}:${index}`
            )) })
          ] })
        ] }) }, message.id);
      }),
      state.pending && state.draft !== null && state.draft.trim() !== "" && /* @__PURE__ */ jsx4("article", { className: "pico-ai-note", "data-streaming": "true", children: /* @__PURE__ */ jsx4("div", { className: "pico-ai-response", children: markdownImpl(state.draft) }) }),
      state.pending && (state.draft === null || state.draft.trim() === "") && /* @__PURE__ */ jsxs2("div", { className: "pico-ai-thinking", role: "status", children: [
        /* @__PURE__ */ jsx4("span", { "aria-hidden": "true" }),
        state.progress ?? "\u6B63\u5728\u6574\u7406\u8FD9\u4E00\u523B",
        "\u2026"
      ] })
    ] }) }),
    chatting && /* @__PURE__ */ jsxs2("footer", { className: "pico-ai-composer", children: [
      dock.length > 0 && /* @__PURE__ */ jsx4("div", { className: "pico-ai-dock", children: dock.map(({ ref, label, item }, index) => /* @__PURE__ */ jsx4(
        "button",
        {
          type: "button",
          "data-primary": index === 0,
          onClick: () => invoke(ref),
          children: label
        },
        `${item.id}:${label}`
      )) }),
      state.quote !== null && /* @__PURE__ */ jsxs2("div", { className: "pico-ai-quoted", children: [
        /* @__PURE__ */ jsx4(Quote, { quote: state.quote }),
        /* @__PURE__ */ jsx4("button", { type: "button", "aria-label": "\u79FB\u9664\u5F15\u7528", title: "\u79FB\u9664\u5F15\u7528", onClick: () => onEvent({ type: "ai.unquote" }), children: "\xD7" })
      ] }),
      /* @__PURE__ */ jsxs2("form", { className: "pico-ai-compose", onSubmit: submit, children: [
        /* @__PURE__ */ jsx4("label", { htmlFor: inputId, children: "\u5411 AI \u63D0\u95EE" }),
        /* @__PURE__ */ jsx4(
          "textarea",
          {
            id: inputId,
            ref: input,
            rows: 1,
            value: draft,
            disabled: state.pending,
            placeholder: state.pending ? "\u6B63\u5728\u56DE\u7B54\u2026" : state.quote !== null ? "\u95EE\u8FD9\u4E00\u523B\uFF0C\u6216\u76F4\u63A5\u53D1\u9001" : state.messages.length > 0 ? "\u7EE7\u7EED\u8FFD\u95EE" : "\u95EE AI",
            onChange: (event4) => setDraft2(event4.currentTarget.value),
            onKeyDown: (event4) => {
              if (event4.key === "Enter" && !event4.shiftKey) {
                event4.preventDefault();
                ask2(draft);
              }
            }
          }
        ),
        /* @__PURE__ */ jsx4("button", { type: "submit", className: "pico-ai-send", "aria-label": "\u53D1\u9001\u95EE\u9898", title: "\u53D1\u9001\uFF08Enter\uFF09", disabled: !sendable(draft), children: /* @__PURE__ */ jsxs2("svg", { viewBox: "0 0 18 18", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx4("path", { d: "m3 9 11-5-3.4 10-2-4.1L3 9Z" }),
          /* @__PURE__ */ jsx4("path", { d: "m8.6 9.9 5.4-5.9" })
        ] }) })
      ] })
    ] })
  ] });
}
function Quote({ quote }) {
  return /* @__PURE__ */ jsxs2("figure", { className: "pico-ai-quote", children: [
    /* @__PURE__ */ jsx4("code", { children: quote.text }),
    quote.moment !== null && /* @__PURE__ */ jsxs2("figcaption", { children: [
      "\u7B2C ",
      quote.moment.step,
      " \u6B65"
    ] })
  ] });
}

// session/impl/ui/ai/bar.css
var bar_default = ".pico-session-selection-bar {\n  position: absolute; z-index: 8; right: var(--pico-space-4); bottom: var(--pico-space-4);\n  display: flex; align-items: center; gap: 2px; max-width: min(22rem, calc(100% - 2 * var(--pico-space-4)));\n  padding: 3px; border: var(--pico-line); border-radius: 10px;\n  background: var(--pico-surface-raised); box-shadow: var(--pico-shadow-float);\n  font: 600 var(--pico-size-xs)/1 var(--pico-font-ui);\n  animation: pico-session-bar-in var(--pico-duration-fast) var(--pico-ease-out) both;\n}\n.pico-session-selection-bar button {\n  min-height: 30px; padding: 0 10px; border: 0; border-radius: 7px;\n  background: transparent; color: var(--pico-accent-deep); font: inherit; cursor: pointer;\n  transition: background var(--pico-duration-fast), color var(--pico-duration-fast);\n}\n.pico-session-selection-bar button:hover { background: var(--pico-accent-wash); }\n.pico-session-selection-bar button:focus-visible { outline: 2px solid var(--pico-accent); outline-offset: 1px; }\n\n/* \u7F16\u8F91\u5668\u88AB\u6324\u7A84\u65F6\uFF08\u8BB2\u89E3\u65F6 AI \u4E0E\u8BB2\u7A3F\u5360\u4E86\u5DE6\u4FA7\uFF09\uFF0C\u6D6E\u6761\u8DDF\u7740\u53D8\u5C0F\u3001\u8D34\u8FD1\u89D2\u843D\uFF0C\u4E0D\u538B\u4F4F\u4EE3\u7801\u3002 */\n@container pico-editor (max-width: 560px) {\n  .pico-session-selection-bar { right: var(--pico-space-3); bottom: var(--pico-space-3); padding: 2px; border-radius: 8px; box-shadow: none; }\n  .pico-session-selection-bar button { min-height: 24px; padding: 0 8px; border-radius: 6px; font-size: 11px; }\n}\n\n@keyframes pico-session-bar-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }\n@media (prefers-reduced-motion: reduce) { .pico-session-selection-bar { animation: none; } }\n";

// session/impl/ui/ai/bar.tsx
import { jsx as jsx5, jsxs as jsxs3 } from "./libs/react.js";
var ACTIONS = ["selection.ask"];
function selectionBarOverlay(view) {
  const items = ACTIONS.flatMap((id) => {
    const item = view.resolve(id);
    return item?.enabled === true ? [item] : [];
  });
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxs3("div", { className: "pico-session-selection-bar", role: "toolbar", "aria-label": "\u9009\u533A", children: [
    /* @__PURE__ */ jsx5("style", { children: bar_default }),
    items.map((item) => /* @__PURE__ */ jsx5("button", { type: "button", onClick: () => view.dispatch(item.event), children: item.label }, item.id))
  ] });
}

// session/api/ui/ai.ts
var aiViews = feature("ai.views", {
  requires: [ai],
  views: [
    { slot: "toolbar", label: "AI", controls: (view) => {
      const item = view.resolve("ai.toggle");
      return item === null ? [] : [toolbarButton(item, chatOf(view.get)?.open)];
    } },
    { slot: "panel", key: AI_PANEL, title: "AI", flush: true, dock: "start", dockSize: 2 / 3, when: ({ get }) => chatOf(get)?.open === true, render: aiCardPanel },
    { slot: "editor-overlay", key: "selection-ask", render: selectionBarOverlay }
  ]
});

// session/impl/ui/annotation/editor.ts
import { EditorView, ViewPlugin } from "./libs/codemirror.js";
var NOTE_MIN_ROOM = 145;
function editorResolverImpl(register) {
  return ViewPlugin.define((view) => {
    const resolver = {
      accepts: (anchor) => anchor.kind === "source" && anchor.source === view.state.doc.toString(),
      locate: (anchor) => {
        if (anchor.kind !== "source") return null;
        const doc = view.state.doc;
        let from = anchor.from;
        while (from < anchor.to && /[ \t]/.test(doc.sliceString(from, from + 1))) from += 1;
        const content = view.contentDOM.getBoundingClientRect();
        const clip2 = view.scrollDOM.getBoundingClientRect();
        const blockTop = view.documentTop + view.lineBlockAt(from).top;
        const blockBottom = view.documentTop + view.lineBlockAt(anchor.to).bottom;
        const oneLine = doc.lineAt(from).number === doc.lineAt(anchor.to).number;
        const start2 = oneLine ? view.coordsAtPos(from, 1) : null;
        const end = oneLine ? view.coordsAtPos(anchor.to, -1) : null;
        const top = start2 !== null && end !== null ? Math.min(start2.top, end.top) : blockTop;
        const bottom = start2 !== null && end !== null ? Math.max(start2.bottom, end.bottom) : blockBottom;
        const left = start2?.left ?? content.left;
        const right = end?.left ?? content.right;
        const rect = new DOMRect(left, top, Math.max(right - left, 4), Math.max(bottom - top, 4));
        const lineRight = (ln) => {
          const line = doc.line(ln);
          const trimmed = line.text.trimEnd();
          if (trimmed.length === 0) return content.left;
          const endPos = line.from + trimmed.length;
          const coord = view.coordsAtPos(endPos, -1);
          const charRight = coord !== null ? Math.max(coord.left, coord.right) : content.left + trimmed.length * 8.4;
          const block = view.lineBlockAt(line.from);
          const lineTop = view.documentTop + block.top;
          const lineBottom = view.documentTop + block.bottom;
          let widgetRight = 0;
          for (const el of view.dom.querySelectorAll(".pico-live-vars")) {
            const r = el.getBoundingClientRect();
            const cy = (r.top + r.bottom) / 2;
            if (cy >= lineTop - 2 && cy <= lineBottom + 2) widgetRight = Math.max(widgetRight, r.right);
          }
          return Math.max(charRight, widgetRight);
        };
        const lineCenterY = (ln) => {
          const block = view.lineBlockAt(doc.line(ln).from);
          return view.documentTop + (block.top + block.bottom) / 2;
        };
        const targetLine = doc.lineAt(anchor.to).number;
        const sameLineLeft = Math.max(right, lineRight(targetLine)) + 12;
        if (clip2.right - sameLineLeft >= NOTE_MIN_ROOM) {
          return { rect, clip: clip2, note: { left: sameLineLeft, top: (top + bottom) / 2, side: "right" } };
        }
        for (let delta = 1; delta <= doc.lines; delta += 1) {
          for (const ln of [targetLine - delta, targetLine + delta]) {
            if (ln < 1 || ln > doc.lines) continue;
            const cy = lineCenterY(ln);
            if (cy < clip2.top + 16 || cy > clip2.bottom - 16) continue;
            const bandRight = Math.max(
              lineRight(ln),
              ln > 1 ? lineRight(ln - 1) : 0,
              ln < doc.lines ? lineRight(ln + 1) : 0
            ) + 14;
            if (clip2.right - bandRight >= NOTE_MIN_ROOM) {
              return { rect, clip: clip2, note: { left: bandRight, top: cy, side: "right" } };
            }
          }
        }
        const docBottom = view.documentTop + view.lineBlockAt(doc.length).bottom + 10;
        return {
          rect,
          clip: clip2,
          note: { left: Math.max(content.left + 8, clip2.left + 12), top: Math.min(docBottom, clip2.bottom - 32), side: "below" }
        };
      },
      reveal: (anchor) => {
        if (anchor.kind === "source") view.dispatch({ effects: EditorView.scrollIntoView(anchor.from, { y: "center" }) });
      }
    };
    return { destroy: register(resolver) };
  });
}

// session/impl/ui/annotation/layer.tsx
import { Fragment as Fragment4, useEffect as useEffect3, useId as useId2, useRef as useRef4, useState as useState3 } from "./libs/react.js";

// session/impl/ui/annotation/layer.css
var layer_default = '.pico-annotations { position: absolute; inset: 0; pointer-events: none; }\n.pico-annotations-text { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); margin: 0; padding: 0; }\n.pico-annotation-mark { position: absolute; box-sizing: border-box; border: 2px solid var(--pico-accent); border-radius: 5px; box-shadow: 0 0 0 3px var(--pico-accent-wash); transition: left var(--pico-duration-fast), top var(--pico-duration-fast), width var(--pico-duration-fast), height var(--pico-duration-fast); }\n.pico-annotation-note { position: absolute; max-width: 240px; padding: 5px 9px; border-radius: 8px; background: var(--pico-accent-deep); color: var(--pico-on-accent, #fff); box-shadow: var(--pico-shadow-float); font: 550 var(--pico-size-xs)/1.45 var(--pico-font-ui); white-space: normal; }\n.pico-annotation-note[data-side="right"] { transform: translateY(-50%); }\n.pico-annotation-note[data-side="link"] { transform: translate(-50%, -50%); }\n.pico-annotation-links { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }\n.pico-annotation-links path { fill: none; stroke: var(--pico-accent-deep); stroke-width: 2; stroke-dasharray: 6 5; stroke-linecap: round; }\n.pico-annotation-links marker path { fill: var(--pico-accent-deep); stroke: none; }\n.pico-annotation-edge { position: absolute; width: 24px; height: 22px; padding: 0; border: 0; border-radius: 6px; background: var(--pico-accent-deep); color: var(--pico-on-accent, #fff); font: 700 12px/22px var(--pico-font-ui); cursor: pointer; pointer-events: auto; box-shadow: var(--pico-shadow-float); }\n@media (prefers-reduced-motion: reduce) { .pico-annotation-mark { transition: none; } }\n';

// session/impl/ui/annotation/layer.tsx
import { jsx as jsx6, jsxs as jsxs4 } from "./libs/react.js";
var NOTE_ROOM = 220;
function layoutAnnotationsImpl(items, locate2, base) {
  const shapes = [];
  const edged = /* @__PURE__ */ new Set();
  const place = (item, anchor) => {
    const found = locate2(anchor);
    if (found === null) return null;
    const { rect, clip: clip2, note } = found;
    if (rect.bottom > clip2.top && rect.top < clip2.bottom && rect.right > clip2.left && rect.left < clip2.right) {
      const left = Math.max(rect.left, clip2.left);
      const top = Math.max(rect.top, clip2.top);
      const right = Math.min(rect.right, clip2.right);
      const bottom = Math.min(rect.bottom, clip2.bottom);
      return {
        box: { x: left - base.left, y: top - base.top, w: Math.max(4, right - left), h: Math.max(4, bottom - top) },
        rightLimit: Math.min(base.width, clip2.right - base.left),
        ...note === void 0 ? {} : { note }
      };
    }
    if (!edged.has(anchor)) {
      edged.add(anchor);
      const up = rect.bottom <= clip2.top;
      const x = Math.min(Math.max(rect.left, clip2.left + 4), clip2.right - 28) - base.left;
      shapes.push({ type: "edge", id: `${item.id}:${shapes.length}`, at: { x, y: (up ? clip2.top + 4 : clip2.bottom - 26) - base.top }, direction: up ? "up" : "down", anchor });
    }
    return null;
  };
  for (const item of items) {
    const placed = place(item, item.anchor);
    if (item.kind === "link") {
      const end = item.to === void 0 ? null : place(item, item.to);
      if (placed !== null && end !== null) shapes.push({ type: "link", id: item.id, ...linkEnds(placed.box, end.box), text: item.text ?? null });
    } else if (placed !== null) {
      const { box, rightLimit, note } = placed;
      if (item.kind === "mark") {
        shapes.push({ type: "mark", id: item.id, box });
      } else if (note !== void 0) {
        const at = { x: note.left - base.left, y: note.top - base.top };
        const maxWidth = Math.max(120, rightLimit - at.x - 8);
        shapes.push({ type: "note", id: item.id, box, text: item.text ?? "", side: note.side, at, maxWidth });
      } else {
        shapes.push({ type: "note", id: item.id, box, text: item.text ?? "", side: rightLimit - (box.x + box.w) >= NOTE_ROOM ? "right" : "below" });
      }
    }
  }
  return shapes;
}
function linkEnds(a, b) {
  const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
  if (Math.abs(bx - ax) >= Math.abs(by - ay)) {
    const right = bx > ax;
    return { from: { x: right ? a.x + a.w : a.x, y: ay }, to: { x: right ? b.x : b.x + b.w, y: by } };
  }
  const down = by > ay;
  return { from: { x: ax, y: down ? a.y + a.h : a.y }, to: { x: bx, y: down ? b.y : b.y + b.h } };
}
function curve(from, to) {
  const horizontal = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
  const bend = horizontal ? (to.x - from.x) / 2 : (to.y - from.y) / 2;
  return horizontal ? `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}` : `M ${from.x} ${from.y} C ${from.x} ${from.y + bend}, ${to.x} ${to.y - bend}, ${to.x} ${to.y}`;
}
function annotationLayerOverlay(state, locate2, dispatch) {
  return /* @__PURE__ */ jsx6(AnnotationLayer, { items: state.items, locate: locate2, dispatch });
}
function AnnotationLayer({ items, locate: locate2, dispatch }) {
  const root = useRef4(null);
  const arrow = useId2();
  const [shapes, setShapes] = useState3([]);
  useEffect3(() => {
    if (items.length === 0) {
      setShapes([]);
      return;
    }
    let frame = 0;
    let last = "";
    const measure = () => {
      const element = root.current;
      if (element !== null) {
        const next = layoutAnnotationsImpl(items, locate2, element.getBoundingClientRect());
        const key = JSON.stringify(next, (name, value) => name === "anchor" ? void 0 : value);
        if (key !== last) {
          last = key;
          setShapes(next);
        }
      }
      frame = requestAnimationFrame(measure);
    };
    measure();
    return () => cancelAnimationFrame(frame);
  }, [items, locate2]);
  const links = shapes.filter((shape) => shape.type === "link");
  const shiftedNotes = shapes.filter((shape) => shape.type === "note" && shape.at !== void 0 && Math.abs(shape.at.y - (shape.box.y + shape.box.h / 2)) > shape.box.h);
  return /* @__PURE__ */ jsxs4("div", { ref: root, className: "pico-annotations", children: [
    /* @__PURE__ */ jsx6("style", { children: layer_default }),
    /* @__PURE__ */ jsx6("ul", { className: "pico-annotations-text", "aria-live": "polite", children: items.filter((item) => item.text !== void 0).map((item) => /* @__PURE__ */ jsx6("li", { children: item.text }, item.id)) }),
    links.length + shiftedNotes.length > 0 && /* @__PURE__ */ jsxs4("svg", { className: "pico-annotation-links", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx6("defs", { children: /* @__PURE__ */ jsx6("marker", { id: arrow, viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse", children: /* @__PURE__ */ jsx6("path", { d: "M0 0L10 5L0 10z" }) }) }),
      links.map((link) => /* @__PURE__ */ jsx6("path", { d: curve(link.from, link.to), markerEnd: `url(#${arrow})` }, link.id)),
      shiftedNotes.map((note) => /* @__PURE__ */ jsx6("path", { d: curve({ x: note.box.x + note.box.w, y: note.box.y + note.box.h / 2 }, { x: note.at.x - 4, y: note.at.y }) }, `${note.id}:leader`))
    ] }),
    shapes.map((shape) => {
      if (shape.type === "mark") return /* @__PURE__ */ jsx6(
        "div",
        {
          className: "pico-annotation-mark",
          style: { left: shape.box.x - 3, top: shape.box.y - 2, width: shape.box.w + 6, height: shape.box.h + 4 }
        },
        shape.id
      );
      if (shape.type === "note") {
        const position = shape.at !== void 0 ? { left: shape.at.x, top: shape.at.y, ...shape.maxWidth === void 0 ? {} : { maxWidth: shape.maxWidth } } : shape.side === "right" ? { left: shape.box.x + shape.box.w + 10, top: shape.box.y + shape.box.h / 2 } : { left: shape.box.x, top: shape.box.y + shape.box.h + 8 };
        return /* @__PURE__ */ jsxs4(Fragment4, { children: [
          shape.at !== void 0 && /* @__PURE__ */ jsx6(
            "div",
            {
              className: "pico-annotation-mark",
              style: { left: shape.box.x - 3, top: shape.box.y - 2, width: shape.box.w + 6, height: shape.box.h + 4 }
            }
          ),
          /* @__PURE__ */ jsx6("div", { className: "pico-annotation-note", "data-side": shape.side, "aria-hidden": "true", style: position, children: shape.text })
        ] }, shape.id);
      }
      if (shape.type === "link") return shape.text === null ? null : /* @__PURE__ */ jsx6(
        "div",
        {
          className: "pico-annotation-note",
          "data-side": "link",
          "aria-hidden": "true",
          style: { left: (shape.from.x + shape.to.x) / 2, top: (shape.from.y + shape.to.y) / 2 },
          children: shape.text
        },
        shape.id
      );
      return /* @__PURE__ */ jsx6(
        "button",
        {
          type: "button",
          className: "pico-annotation-edge",
          "data-direction": shape.direction,
          style: { left: shape.at.x, top: shape.at.y },
          "aria-label": shape.direction === "up" ? "\u6807\u6CE8\u5728\u4E0A\u65B9\uFF0C\u6EDA\u52A8\u8FC7\u53BB" : "\u6807\u6CE8\u5728\u4E0B\u65B9\uFF0C\u6EDA\u52A8\u8FC7\u53BB",
          onClick: () => dispatch({ type: "annotation.reveal", anchor: shape.anchor }),
          children: shape.direction === "up" ? "\u2191" : "\u2193"
        },
        shape.id
      );
    })
  ] });
}

// session/impl/ui/annotation/parts.ts
import { debuggerAnchorRect } from "./pico.js";
import { terminalLineRect } from "./pico.js";
function partResolver(part, accepts, rect) {
  return {
    accepts,
    locate: (anchor) => {
      const element = part.element;
      if (element === null || !element.isConnected) return null;
      const found = rect(element, anchor);
      return found === null ? null : { rect: found, clip: element.getBoundingClientRect() };
    }
  };
}
function debuggerResolverImpl(part, run2) {
  return partResolver(
    part,
    (anchor) => (anchor.kind === "runtime-variable" || anchor.kind === "trace-step") && anchor.run === run2(),
    (element, anchor) => anchor.kind === "trace-step" ? debuggerAnchorRect(element, { kind: "trace-step", traceIndex: anchor.traceIndex }) : anchor.kind === "runtime-variable" ? debuggerAnchorRect(element, { kind: "variable", name: String(anchor.path.at(-1)) }) : null
  );
}
function terminalResolverImpl(part, run2) {
  return partResolver(
    part,
    (anchor) => anchor.kind === "output-line" && anchor.run === run2(),
    (element, anchor) => anchor.kind === "output-line" ? terminalLineRect(element, anchor.line) : null
  );
}

// session/api/ui/annotation.ts
function debuggerAnchors(part, run2) {
  return debuggerResolverImpl(part, run2);
}
function terminalAnchors(part, run2) {
  return terminalResolverImpl(part, run2);
}
var locators = /* @__PURE__ */ new WeakMap();
var locator = (state) => {
  let locate2 = locators.get(state);
  if (locate2 === void 0) locators.set(state, locate2 = (anchor) => locateAnchor(state, anchor));
  return locate2;
};
var annotationViews = feature("annotation.views", {
  requires: [annotations, playground],
  views: [
    { slot: "editor-extension", extension: ({ get }) => {
      const state = get(playground);
      return state === null ? [] : editorResolverImpl((resolver) => registerAnchorResolver(state, resolver));
    } },
    { slot: "overlay", key: "annotations", render: (view) => {
      const state = view.get(playground);
      return state === null ? null : annotationLayerOverlay(state.getSnapshot().marks, locator(state), view.dispatch);
    } }
  ]
});

// session/impl/ui/hint/editor.ts
import { Prec, StateEffect, StateField } from "./libs/codemirror.js";
import { Decoration, EditorView as EditorView2, ViewPlugin as ViewPlugin2, WidgetType, keymap } from "./libs/codemirror.js";

// session/impl/ui/editor.ts
function deferredDispatch(views, effect) {
  let pending2 = false;
  let latest;
  return (value) => {
    latest = value;
    if (pending2) return;
    pending2 = true;
    queueMicrotask(() => {
      pending2 = false;
      for (const view of views()) view.dispatch({ effects: effect(latest) });
    });
  };
}

// session/impl/ui/hint/editor.ts
var setHint = StateEffect.define();
function visible(state, hint2) {
  return hint2 !== null && state.doc.toString() === hint2.source ? hint2 : null;
}
function acceptHintImpl(hint2) {
  return {
    changes: { from: hint2.at, to: hint2.to ?? hint2.at, insert: hint2.text },
    selection: { anchor: hint2.at + hint2.text.length },
    userEvent: "input.complete"
  };
}
function accept(view, hint2) {
  view.dispatch(acceptHintImpl(hint2));
  view.focus();
}
var HintCard = class extends WidgetType {
  constructor(hint2, column) {
    super();
    this.hint = hint2;
    this.column = column;
  }
  hint;
  column;
  eq(other) {
    return other.hint === this.hint;
  }
  toDOM(view) {
    const card = document.createElement("div");
    card.className = "pico-hint";
    card.style.marginLeft = `${this.column}ch`;
    const label = document.createElement("span");
    label.className = "pico-hint-label";
    label.textContent = this.hint.to === void 0 ? "\u63D0\u793A" : "\u63D0\u793A \xB7 \u66FF\u6362\u6CE2\u6D6A\u7EBF\u90E8\u5206";
    const code2 = document.createElement("code");
    code2.className = "pico-hint-code";
    code2.textContent = this.hint.text;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pico-hint-accept";
    button.textContent = "\u63A5\u53D7 \xB7 Tab";
    button.addEventListener("mousedown", (event4) => event4.preventDefault());
    button.addEventListener("click", () => accept(view, this.hint));
    card.append(label, code2, button);
    return card;
  }
  ignoreEvent() {
    return true;
  }
};
var Caret = class extends WidgetType {
  eq() {
    return true;
  }
  toDOM() {
    const element = document.createElement("span");
    element.className = "pico-hint-caret";
    element.setAttribute("aria-hidden", "true");
    return element;
  }
};
function hintDecorations(state, hint2) {
  if (hint2 === null) return Decoration.none;
  const line = state.doc.lineAt(hint2.at);
  const decorations2 = [Decoration.widget({ widget: new Caret(), side: -1 }).range(hint2.at)];
  if (hint2.to !== void 0 && hint2.to > hint2.at) decorations2.push(Decoration.mark({ class: "pico-hint-replace" }).range(hint2.at, hint2.to));
  decorations2.push(Decoration.widget({ widget: new HintCard(hint2, hint2.at - line.from), block: true, side: 1 }).range(line.to));
  return Decoration.set(decorations2, true);
}
function hintEditorImpl() {
  const views = /* @__PURE__ */ new Set();
  let hint2 = null;
  const field = StateField.define({
    create: () => hint2,
    update: (value, transaction) => transaction.effects.reduce((current, effect) => effect.is(setHint) ? effect.value : current, value),
    provide: (self) => EditorView2.decorations.compute([self, "doc"], (state) => hintDecorations(state, visible(state, state.field(self))))
  });
  const take = (view) => {
    const current = visible(view.state, view.state.field(field));
    if (current === null) return false;
    accept(view, current);
    return true;
  };
  const dispatch = deferredDispatch(() => views, (next) => setHint.of(next));
  const extension = [
    field,
    ViewPlugin2.define((view) => {
      views.add(view);
      return { destroy: () => {
        views.delete(view);
      } };
    }),
    Prec.high(keymap.of([{ key: "Tab", run: take }])),
    EditorView2.baseTheme({
      ".pico-hint-caret": { display: "inline-block", width: "2px", height: "1.15em", marginRight: "-2px", verticalAlign: "text-bottom", background: "var(--pico-accent)" },
      ".pico-hint-replace": { textDecoration: "underline wavy var(--pico-hue-error-strong)", textUnderlineOffset: "3px" },
      ".pico-hint": {
        display: "flex",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: "8px",
        width: "fit-content",
        maxWidth: "100%",
        margin: "2px 0 6px",
        padding: "4px 8px",
        border: "1px dashed color-mix(in srgb, var(--pico-accent) 55%, transparent)",
        borderRadius: "6px",
        background: "var(--pico-surface-raised)",
        fontFamily: "var(--pico-font-ui)"
      },
      ".pico-hint-label": { color: "var(--pico-accent-deep)", fontSize: "var(--pico-size-xs)", fontWeight: "650" },
      ".pico-hint-code": { whiteSpace: "pre", color: "var(--pico-ink-soft)", fontFamily: "var(--pico-font-mono)" },
      ".pico-hint-accept": {
        border: "0",
        borderRadius: "5px",
        padding: "1px 6px",
        background: "var(--pico-accent-wash)",
        color: "var(--pico-accent-deep)",
        fontSize: "var(--pico-size-xs)",
        cursor: "pointer"
      }
    })
  ];
  return Object.freeze({
    extension,
    show: (next) => {
      if (next === hint2) return;
      hint2 = next;
      dispatch(next);
    },
    dispose: () => {
      hint2 = null;
      views.clear();
    }
  });
}

// session/api/ui/hint.ts
var editors = /* @__PURE__ */ new WeakMap();
var hintViews = feature("hint.views", {
  requires: [playground],
  create: ({ bus, get, own }) => {
    const state = {};
    const editor2 = own(hintEditorImpl());
    editors.set(state, editor2);
    own({ dispose: bus.subscribe(["hint.changed"], () => editor2.show(get(playground).getSnapshot().hint.current)) });
    return state;
  },
  views: [{ slot: "editor-extension", extension: ({ get }) => {
    const state = get(hintViews);
    return state === null ? [] : editors.get(state)?.extension ?? [];
  } }]
});

// session/impl/ui/live-variables/extension.ts
import { RangeSet, StateEffect as StateEffect2, StateField as StateField2 } from "./libs/codemirror.js";
import { Decoration as Decoration2, EditorView as EditorView3, GutterMarker, ViewPlugin as ViewPlugin3, WidgetType as WidgetType2, keymap as keymap2, lineNumberMarkers, lineNumbers } from "./libs/codemirror.js";
import { variablesAt } from "./pico.js";
function selectedLine(source2, selection) {
  if (selection?.kind !== "source" || selection.source !== source2) return null;
  const from = Math.max(0, Math.min(source2.length, selection.from));
  const start2 = source2.lastIndexOf("\n", Math.max(0, from - 1)) + 1;
  const newline = source2.indexOf("\n", start2);
  const end = newline < 0 ? source2.length : newline;
  if (selection.from !== start2 || selection.to !== end) return null;
  return { line: source2.slice(0, start2).split("\n").length };
}
function liveVariablesModel(source2, selection, playback) {
  const selected = selectedLine(source2, selection);
  if (selected === null || playback.trace === null || playback.position === null) return null;
  const active = playback.position.event === "stmt" && playback.position.state.line === selected.line;
  return Object.freeze({ line: selected.line, variables: active ? variablesAt(playback.position) : Object.freeze([]) });
}
function liveLineIntent(source2, from, to, current) {
  const target2 = Object.freeze({ kind: "source", source: source2, from, to });
  return current?.kind === "source" && current.source === source2 && current.from === from && current.to === to ? { type: "selection.clear" } : { type: "navigate.locate", target: target2 };
}
var setModel = StateEffect2.define();
var ActiveLineMarker = class extends GutterMarker {
  elementClass = "pico-live-line-number";
};
var activeLineMarker = new ActiveLineMarker();
var VariablesWidget = class extends WidgetType2 {
  constructor(variables) {
    super();
    this.variables = variables;
  }
  variables;
  eq(other) {
    return this.variables.length === other.variables.length && this.variables.every((item, index) => {
      const right = other.variables[index];
      return right !== void 0 && item.name === right.name && item.text === right.text && item.change === right.change;
    });
  }
  toDOM() {
    const element = document.createElement("span");
    element.className = "pico-live-variables";
    element.setAttribute("aria-hidden", "true");
    for (const variable of this.variables) {
      const item = document.createElement("span");
      item.className = "pico-live-variable";
      if (variable.change !== null) item.dataset.change = variable.change;
      item.textContent = `${variable.name} = ${variable.text}`;
      element.append(item);
    }
    return element;
  }
};
function createLiveVariables() {
  const views = /* @__PURE__ */ new Set();
  let activate = (_line) => {
  };
  let model = null;
  const field = StateField2.define({
    create: () => model,
    update: (value, transaction) => {
      if (transaction.docChanged) return null;
      return transaction.effects.reduce((current, effect) => effect.is(setModel) ? effect.value : current, value);
    },
    provide: (self) => [
      EditorView3.decorations.compute([self], (state) => {
        const model2 = state.field(self);
        if (model2 === null || model2.variables.length === 0 || model2.line > state.doc.lines) return Decoration2.none;
        const line = state.doc.line(model2.line);
        return Decoration2.set([Decoration2.widget({ widget: new VariablesWidget(model2.variables), side: 1 }).range(line.to)]);
      }),
      lineNumberMarkers.compute([self], (state) => {
        const model2 = state.field(self);
        return model2 === null || model2.line > state.doc.lines ? RangeSet.empty : RangeSet.of([activeLineMarker.range(state.doc.line(model2.line).from)]);
      })
    ]
  });
  const choose = (view, from) => {
    const line = view.state.doc.lineAt(from);
    activate({ source: view.state.doc.toString(), from: line.from, to: line.to });
    return true;
  };
  const extension = [
    field,
    ViewPlugin3.define((view) => ({ destroy: controller.mount(view) })),
    lineNumbers({ domEventHandlers: {
      mousedown(view, line, event4) {
        if (event4.button !== 0) return false;
        event4.preventDefault();
        return choose(view, line.from);
      }
    } }),
    keymap2.of([{ key: "F9", run: (view) => choose(view, view.state.selection.main.head) }]),
    EditorView3.baseTheme({
      ".cm-lineNumbers .cm-gutterElement": { cursor: "pointer" },
      ".cm-lineNumbers .cm-gutterElement:hover": { color: "var(--pico-code-ink)" },
      ".cm-lineNumbers .pico-live-line-number": { color: "var(--pico-accent-deep)", fontWeight: "700" },
      ".pico-live-variables": {
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "0 2ch",
        maxWidth: "min(72ch, 70%)",
        marginInlineStart: "3ch",
        color: "var(--pico-code-dim)",
        whiteSpace: "normal",
        pointerEvents: "none"
      },
      // 变量多时换行、长值在项内折行：完整的名字与值始终可见，不再被压成“名字…”。
      ".pico-live-variable": { flex: "0 1 auto", minWidth: "0", maxWidth: "100%", overflowWrap: "anywhere" },
      ".pico-live-variable[data-change=removed]": { opacity: "0.55", textDecoration: "line-through" }
    })
  ];
  const showLater = deferredDispatch(() => views, (next) => setModel.of(next));
  const controller = {
    extension,
    activate: (handler) => {
      activate = handler;
    },
    mount: (view) => {
      views.add(view);
      return () => {
        views.delete(view);
      };
    },
    show: (next) => {
      model = next;
      showLater(next);
    },
    dispose: () => {
      model = null;
      for (const view of views) view.dispatch({ effects: setModel.of(null) });
      views.clear();
      activate = () => {
      };
    }
  };
  return controller;
}

// session/api/ui/live-variables.ts
var controllers = /* @__PURE__ */ new WeakMap();
var liveVariables = feature("live-variables", {
  requires: [editorHost, playbackHost, selectionHost, navigate],
  create: ({ bus, get, own }) => {
    const state = {};
    const controller = own(createLiveVariables());
    controllers.set(state, controller);
    const refresh = () => controller.show(liveVariablesModel(
      get(editorHost).source,
      get(selectionHost).current,
      get(playbackHost)
    ));
    own({ dispose: bus.subscribe(["selection.changed", "playback.changed"], refresh) });
    controller.activate((line) => bus.emit(liveLineIntent(
      line.source,
      line.from,
      line.to,
      get(selectionHost).current
    ), "live-variables"));
    refresh();
    return state;
  },
  views: [{
    slot: "editor-extension",
    extension: ({ get }) => {
      const state = get(liveVariables);
      return state === null ? [] : controllers.get(state)?.extension ?? [];
    }
  }]
});

// session/api/ui/markdown.ts
function Markdown({ text: text2 }) {
  return markdownImpl(text2);
}
function InlineMarkdown({ text: text2 }) {
  return inlineMarkdownImpl(text2);
}

// session/impl/ui/review/editor.ts
import { StateEffect as StateEffect3, StateField as StateField3 } from "./libs/codemirror.js";
import { Decoration as Decoration3, EditorView as EditorView4, ViewPlugin as ViewPlugin4, WidgetType as WidgetType3 } from "./libs/codemirror.js";
var LABEL = { note: "\u6279\u6CE8", strike: "\u5212\u6389", underline: "\u7559\u610F", suggest: "\u5EFA\u8BAE\u6539\u6210", praise: "\u5F88\u597D" };
var setReview = StateEffect3.define();
function locateReviewImpl(doc, comment, number) {
  const text2 = doc.toString();
  const line = doc.line(Math.min(Math.max(comment.from.line, 1), doc.lines));
  const expected = Math.min(line.from + comment.from.column - 1, line.to);
  let best = -1;
  for (let at = text2.indexOf(comment.quote); at !== -1; at = text2.indexOf(comment.quote, at + 1)) {
    if (best === -1 || Math.abs(at - expected) < Math.abs(best - expected)) best = at;
  }
  return best === -1 ? null : { comment, number, from: best, to: best + comment.quote.length };
}
function badge(number, kind) {
  const element = document.createElement("span");
  element.className = "pico-review-badge";
  element.dataset.kind = kind;
  element.textContent = String(number);
  element.setAttribute("aria-hidden", "true");
  return element;
}
var Badge = class extends WidgetType3 {
  constructor(number, kind) {
    super();
    this.number = number;
    this.kind = kind;
  }
  number;
  kind;
  eq(other) {
    return other.number === this.number && other.kind === this.kind;
  }
  toDOM() {
    return badge(this.number, this.kind);
  }
};
var Banner = class extends WidgetType3 {
  constructor(review2, placed, back) {
    super();
    this.review = review2;
    this.placed = placed;
    this.back = back;
  }
  review;
  placed;
  back;
  eq(other) {
    return other.review === this.review && other.placed === this.placed;
  }
  toDOM() {
    const banner = document.createElement("div");
    banner.className = "pico-review-banner";
    const text2 = document.createElement("span");
    const missing = this.review.comments.length - this.placed;
    const rounds = new Set(this.review.comments.flatMap((comment) => comment.round ?? [])).size;
    text2.textContent = `\u6B63\u5728\u770B${this.review.title}\u7684\u4EE3\u7801 \xB7 \u8001\u5E08\u6279\u4E86 ${this.review.comments.length} \u5904${rounds > 1 ? `\uFF0C\u5206 ${rounds} \u8F6E` : ""}${missing > 0 ? `\uFF08${missing} \u5904\u6CA1\u5BF9\u4E0A\u4EE3\u7801\uFF09` : ""}`;
    const back = document.createElement("button");
    back.type = "button";
    back.textContent = "\u56DE\u5230\u6211\u7684\u4EE3\u7801";
    back.addEventListener("mousedown", (event4) => event4.preventDefault());
    back.addEventListener("click", this.back);
    banner.append(text2, back);
    return banner;
  }
  ignoreEvent() {
    return true;
  }
};
var Cards = class extends WidgetType3 {
  constructor(spans, column) {
    super();
    this.spans = spans;
    this.column = column;
  }
  spans;
  column;
  eq(other) {
    return other.column === this.column && other.spans.length === this.spans.length && other.spans.every((span, index) => span.comment.id === this.spans[index].comment.id);
  }
  toDOM() {
    const stack = document.createElement("div");
    stack.className = "pico-review-stack";
    stack.style.marginLeft = `min(${Math.min(this.column, 12)}ch, 15cqi)`;
    for (const { comment, number } of this.spans) {
      const card = document.createElement("div");
      card.className = "pico-review-card";
      card.dataset.kind = comment.kind;
      const head = document.createElement("div");
      head.className = "pico-review-head";
      const label = document.createElement("strong");
      label.textContent = LABEL[comment.kind];
      const author = document.createElement("span");
      author.className = "pico-review-author";
      author.textContent = comment.round === void 0 ? comment.author : `${comment.author} \xB7 ${comment.round}`;
      head.append(badge(number, comment.kind), label, author);
      const text2 = document.createElement("p");
      text2.textContent = comment.text;
      card.append(head, text2);
      if (comment.kind === "suggest" && comment.replacement !== void 0) {
        const code2 = document.createElement("code");
        code2.className = "pico-review-code";
        code2.textContent = comment.replacement;
        card.append(code2);
      }
      stack.append(card);
    }
    return stack;
  }
};
function decorations(state, review2, back) {
  if (review2 === null) return Decoration3.none;
  const spans = review2.comments.flatMap((comment, index) => locateReviewImpl(state.doc, comment, index + 1) ?? []);
  const ranges = [Decoration3.widget({ widget: new Banner(review2, spans.length, back), block: true, side: -1 }).range(0)];
  const byLine = /* @__PURE__ */ new Map();
  for (const span of spans) {
    ranges.push(Decoration3.mark({ class: `pico-review-mark pico-review-${span.comment.kind}` }).range(span.from, span.to));
    ranges.push(Decoration3.widget({ widget: new Badge(span.number, span.comment.kind), side: 1 }).range(span.to));
    const line = state.doc.lineAt(span.to).number;
    byLine.set(line, [...byLine.get(line) ?? [], span]);
  }
  for (const [number, list] of byLine) {
    const line = state.doc.line(number);
    ranges.push(Decoration3.widget({ widget: new Cards(list, /^\s*/.exec(line.text)[0].length), block: true, side: 1 }).range(line.to));
  }
  return Decoration3.set(ranges, true);
}
function reviewEditorImpl(back) {
  const views = /* @__PURE__ */ new Set();
  let current = null;
  const field = StateField3.define({
    create: () => current,
    update: (value, transaction) => transaction.effects.reduce((review2, effect) => effect.is(setReview) ? effect.value : review2, value),
    provide: (self) => EditorView4.decorations.compute([self, "doc"], (state) => decorations(state, state.field(self), back))
  });
  const dispatch = deferredDispatch(() => views, (next) => setReview.of(next));
  const extension = [
    field,
    ViewPlugin4.define((view) => {
      views.add(view);
      return { destroy: () => {
        views.delete(view);
      } };
    }),
    EditorView4.baseTheme({
      ".pico-review-banner": {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        maxWidth: "56ch",
        margin: "0 0 10px",
        padding: "6px 10px",
        borderRadius: "8px",
        background: "var(--pico-hue-loop-bg)",
        color: "var(--pico-hue-loop-ink)",
        font: "600 var(--pico-size-2xs)/1.5 var(--pico-font-ui)",
        whiteSpace: "normal"
      },
      ".pico-review-banner button": {
        marginLeft: "auto",
        border: "0",
        borderRadius: "6px",
        padding: "3px 10px",
        cursor: "pointer",
        background: "var(--pico-surface-raised)",
        color: "var(--pico-ink)",
        font: "600 var(--pico-size-2xs)/1.5 var(--pico-font-ui)",
        boxShadow: "var(--pico-shadow)"
      },
      ".pico-review-mark": { borderRadius: "3px", padding: "1px 0" },
      ".pico-review-note": { background: "var(--pico-hue-loop-bg)", boxShadow: "inset 0 -2px 0 var(--pico-hue-loop-strong)" },
      ".pico-review-strike, .pico-review-suggest": {
        background: "color-mix(in srgb, var(--pico-hue-error-bg) 70%, transparent)",
        textDecoration: "line-through 2px var(--pico-hue-error-strong)"
      },
      ".pico-review-underline": { textDecoration: "underline wavy var(--pico-hue-error-strong)", textUnderlineOffset: "4px" },
      ".pico-review-praise": { background: "var(--pico-hue-branch-bg)", boxShadow: "inset 0 -2px 0 var(--pico-hue-branch-strong)" },
      ".pico-review-badge": {
        display: "inline-grid",
        placeItems: "center",
        minWidth: "16px",
        height: "16px",
        marginLeft: "3px",
        padding: "0 4px",
        borderRadius: "99px",
        background: "var(--pico-hue-error-strong)",
        color: "var(--pico-on-accent)",
        font: "700 10px/1 var(--pico-font-ui)",
        verticalAlign: "1px"
      },
      ".pico-review-badge[data-kind='note']": { background: "var(--pico-hue-loop-strong)" },
      ".pico-review-badge[data-kind='praise']": { background: "var(--pico-hue-branch-strong)" },
      // CodeMirror 按内容的最大宽度撑开文档，百分比上限在那里不起作用；按编辑器容器的宽度（cqi）收窄，扣掉行号栏与缩进。
      ".pico-review-stack": { display: "flex", flexDirection: "column", gap: "6px", width: "fit-content", maxWidth: "min(42ch, calc(85cqi - 6ch))", minWidth: "16ch", margin: "4px 0 8px" },
      ".pico-review-card": {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "7px 10px 8px",
        border: "1px solid var(--pico-hairline)",
        borderLeft: "3px solid var(--pico-hue-error-strong)",
        borderRadius: "4px 8px 8px 4px",
        background: "var(--pico-surface-raised)",
        boxShadow: "var(--pico-shadow)",
        fontFamily: "var(--pico-font-ui)",
        whiteSpace: "normal"
      },
      ".pico-review-card[data-kind='note']": { borderLeftColor: "var(--pico-hue-loop-strong)" },
      ".pico-review-card[data-kind='praise']": { borderLeftColor: "var(--pico-hue-branch-strong)" },
      ".pico-review-head": { display: "flex", alignItems: "center", gap: "6px", font: "600 var(--pico-size-2xs)/1.3 var(--pico-font-ui)", color: "var(--pico-ink)" },
      ".pico-review-head .pico-review-badge": { marginLeft: "0" },
      ".pico-review-author": { marginLeft: "auto", color: "var(--pico-ink-soft)", fontWeight: "500" },
      ".pico-review-card p": { margin: "0", color: "var(--pico-ink)", font: "var(--pico-size-xs)/1.5 var(--pico-font-text)" },
      ".pico-review-code": {
        alignSelf: "flex-start",
        maxWidth: "100%",
        overflowX: "auto",
        padding: "2px 8px",
        borderRadius: "5px",
        whiteSpace: "pre",
        background: "var(--pico-hue-branch-bg)",
        color: "var(--pico-hue-branch-ink)",
        font: "var(--pico-size-xs)/1.5 var(--pico-font-mono)"
      }
    })
  ];
  return Object.freeze({
    extension,
    show: (next) => {
      if (next === current) return;
      current = next;
      dispatch(next);
    },
    dispose: () => {
      views.clear();
    }
  });
}

// session/api/ui/review.ts
var editors2 = /* @__PURE__ */ new WeakMap();
var reviewViews = feature("review.views", {
  requires: [playground],
  create: ({ bus, get, own }) => {
    const state = {};
    const editor2 = own(reviewEditorImpl(() => bus.emit({ type: "review.close" }, "review")));
    editors2.set(state, editor2);
    const slices = get(playground);
    own({ dispose: slices.subscribe(() => editor2.show(slices.getSnapshot().review.review)) });
    editor2.show(slices.getSnapshot().review.review);
    return state;
  },
  views: [{ slot: "editor-extension", extension: ({ get }) => {
    const state = get(reviewViews);
    return state === null ? [] : editors2.get(state)?.extension ?? [];
  } }]
});

// session/api/ui/stage.ts
import { event as event3, on as on4, stateful as stateful4 } from "./pico.js";

// session/impl/ui/stage/state.ts
var layouts = /* @__PURE__ */ new WeakMap();
var WIDTH = { narrow: 0.34, normal: 0.43, wide: 0.6 };
var AREA = { narrow: 0.5, normal: 0.8, wide: 1.4 };
var FOCUS = 2.5;
function createStages(options2) {
  const state = { frames: Object.freeze([]) };
  layouts.set(state, options2.layout);
  return state;
}
function enterStage(state, event4, { emit }) {
  if (!isStage(event4.stage)) return;
  const at = state.frames.findIndex((frame2) => frame2.process === event4.process);
  const frame = Object.freeze({
    process: event4.process,
    stage: event4.stage,
    restore: at < 0 ? layouts.get(state).getSnapshot() : state.frames[at].restore
  });
  replace(state, at < 0 ? [...state.frames, frame] : state.frames.map((old, index) => index === at ? frame : old), emit);
  if (state.frames.at(-1) === frame) emit({ type: "layout.change", value: compile(state.frames) });
}
function endedStage(state, event4, { emit }) {
  const at = state.frames.findIndex((frame) => frame.process === event4.id);
  if (at < 0) return;
  const removed = state.frames[at];
  const top = at === state.frames.length - 1;
  const frames = state.frames.filter((_, index) => index !== at).map((frame, index) => index === at ? Object.freeze({ ...frame, restore: removed.restore }) : frame);
  replace(state, frames, emit);
  if (top) {
    const { open, ratio, sizes, tree } = removed.restore;
    emit({ type: "layout.change", value: { open, ratio, sizes, tree } });
  }
}
function revealStage(state, event4, { emit }) {
  const open = layouts.get(state).getSnapshot().open;
  if (open === null) return;
  const missing = event4.keys.filter((key) => !open.includes(key));
  if (missing.length > 0) emit({ type: "layout.change", value: { open: [...open, ...missing] } });
}
function compile(frames) {
  const top = frames.at(-1).stage;
  const pinned = frames.flatMap((frame) => frame === frames.at(-1) ? [] : frame.stage.pinned ?? []);
  const open = [.../* @__PURE__ */ new Set([...pinned, ...top.pinned ?? [], ...top.panels])];
  const sizes = top.focus !== void 0 && open.includes(top.focus) ? { [top.focus]: FOCUS } : {};
  if (top.arrange === void 0) return { open, sizes: { ...sizes, ...top.sizes }, tree: null, ...top.code === void 0 ? {} : { ratio: WIDTH[top.code] } };
  if (top.code !== void 0) sizes.editor = AREA[top.code];
  return { open, sizes: { ...sizes, ...top.sizes }, tree: top.arrange };
}
function replace(state, frames, emit) {
  state.frames = Object.freeze(frames);
  emit({ type: "stage.changed", frames: state.frames });
}

// session/api/ui/stage.ts
var component3 = stateful4("stage", createStages, [
  /** 同一过程再次进入时替换它的舞台，保留它进入前的布局。 */
  on4("stage.enter", enterStage, ["layout.change", "stage.changed"]),
  event3("stage.enter", {}),
  /** 在当前布局追加卡片，不改变栈；全部已打开时忽略。 */
  on4("stage.reveal", revealStage, ["layout.change"]),
  event3("stage.reveal", {}),
  on4("process.ended", endedStage, ["layout.change", "stage.changed"]),
  event3("process.ended", {}),
  event3("stage.changed", {})
]);
var stage = feature("stage", {
  requires: [layoutHost],
  create: ({ bus, get, own }) => own(component3.create({ layout: get(layoutHost) }, bus)).state,
  actions: [{
    id: "panel.open",
    label: "\u6253\u5F00\u9762\u677F",
    tags: ["present"],
    args: { panels: { type: "array", items: { type: "string" }, description: "\u9762\u677F key\uFF1Aviz\uFF08\u8BFE\u7A0B World\uFF09\u3001debug\uFF08Debugger\uFF09\u3001output\uFF08Terminal\uFF09" } },
    when: (_context, { panels }) => Array.isArray(panels) && panels.every((key) => typeof key === "string"),
    event: (_context, { panels }) => ({ type: "stage.reveal", keys: panels })
  }, {
    id: "panel.set",
    label: "\u53EA\u663E\u793A\u8FD9\u4E9B\u9762\u677F",
    tags: ["present"],
    args: { panels: { type: "array", items: { type: "string" }, description: "\u9762\u677F key\uFF1Aviz\uFF08\u8BFE\u7A0B World\uFF09\u3001debug\uFF08Debugger\uFF09\u3001output\uFF08Terminal\uFF09\uFF1B\u7701\u7565\u7684\u8BFE\u7A0B\u9762\u677F\u4F1A\u9690\u85CF" } },
    when: (_context, _args, actor) => actor === "ai",
    event: (context, { panels }, caller) => {
      const process = caller.process ?? "";
      const current = context.get(stage)?.frames.find((frame) => frame.process === process)?.stage;
      return { type: "stage.enter", process, stage: { ...current, panels } };
    }
  }]
});

// session/impl/ui/script/card.css
var card_default2 = '.pico-script { display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0; background: var(--pico-surface-raised); }\n.pico-script > header { display: flex; align-items: center; gap: var(--pico-space-3); min-height: 48px; padding: 0 var(--pico-space-4); border-bottom: var(--pico-line); }\n.pico-script > header strong { color: var(--pico-ink); font: 650 var(--pico-size-sm)/1.2 var(--pico-font-ui); }\n.pico-script-steps { display: flex; align-items: center; gap: 4px; margin: 0; padding: 0; list-style: none; }\n.pico-script-steps li { width: 6px; height: 6px; border-radius: 3px; background: var(--pico-hairline); transition: width var(--pico-duration-move) var(--pico-ease-out), background var(--pico-duration-fast); }\n.pico-script-steps li[data-state="done"] { background: var(--pico-accent); }\n.pico-script-steps li[data-state="current"] { width: 18px; background: var(--pico-accent); }\n.pico-script > header button { width: 28px; height: 28px; margin-left: auto; padding: 0; border: 0; border-radius: 7px; background: transparent; color: var(--pico-ink-soft); font: 500 var(--pico-size-sm)/1 var(--pico-font-ui); cursor: pointer; }\n.pico-script > header button:hover { background: var(--pico-accent-wash); color: var(--pico-accent-deep); }\n.pico-script > article { flex: 1 1 auto; min-height: 0; overflow: auto; padding: var(--pico-space-4); color: var(--pico-ink-soft); font: 400 var(--pico-size-code)/1.75 var(--pico-font-text); user-select: text; -webkit-user-select: text; }\n.pico-script > article h2 { margin: 0 0 var(--pico-space-3); color: var(--pico-ink); font: 650 var(--pico-size-md)/1.35 var(--pico-font-ui); }\n.pico-script > article p { max-width: 64ch; margin: 0; }\n.pico-script-guidance { margin-top: var(--pico-space-3) !important; color: var(--pico-ink); font: 500 var(--pico-size-xs)/1.5 var(--pico-font-ui); }\n.pico-script-guidance kbd { padding: 1px 6px; border: var(--pico-line); border-radius: 5px; background: var(--pico-surface); font: 600 var(--pico-size-xs)/1.4 var(--pico-font-mono); }\n.pico-script > footer { display: flex; flex-wrap: wrap; gap: var(--pico-space-2); padding: var(--pico-space-3) var(--pico-space-4); border-top: var(--pico-line); }\n.pico-script > footer button { min-height: 36px; padding: 0 var(--pico-space-3); border: var(--pico-line); border-radius: 9px; background: var(--pico-surface); color: var(--pico-ink); font: 600 var(--pico-size-sm)/1 var(--pico-font-ui); cursor: pointer; transition: border-color var(--pico-duration-fast), background var(--pico-duration-fast); }\n.pico-script > footer button:hover { border-color: var(--pico-accent); background: var(--pico-accent-wash); }\n.pico-script > footer button[data-primary="true"] { border-color: color-mix(in srgb, var(--pico-accent) 55%, var(--pico-hairline)); background: var(--pico-accent-wash); color: var(--pico-accent-deep); }\n.pico-script-say p + p { margin-top: var(--pico-space-3); }\n.pico-script-say code { padding: 1px 5px; border-radius: 4px; background: color-mix(in srgb, var(--pico-ink) 7%, var(--pico-surface)); color: var(--pico-ink); font: 550 0.92em/1.35 var(--pico-font-mono); }\n.pico-script-say strong { color: var(--pico-ink); font-weight: 650; }\n.pico-script-say span { border-radius: 4px; transition: background var(--pico-duration-fast), color var(--pico-duration-fast); }\n.pico-script-say span[data-current="true"] { background: var(--pico-accent-wash); color: var(--pico-ink); box-shadow: 0 0 0 2px var(--pico-accent-wash); }\n.pico-script-say span[data-writing="true"] { background: color-mix(in srgb, var(--pico-accent) 18%, var(--pico-surface)); color: var(--pico-ink); box-shadow: 0 0 0 2px color-mix(in srgb, var(--pico-accent) 18%, var(--pico-surface)); }\n.pico-script-predict { display: grid; gap: var(--pico-space-2); margin-top: var(--pico-space-4); padding: var(--pico-space-3); border: var(--pico-line); border-radius: 10px; background: var(--pico-surface); }\n.pico-script-predict > p { color: var(--pico-ink); font: 600 var(--pico-size-sm)/1.5 var(--pico-font-ui); }\n.pico-script-predict > div { display: flex; flex-wrap: wrap; gap: var(--pico-space-2); }\n.pico-script-predict button { min-height: 34px; padding: 0 var(--pico-space-3); border: var(--pico-line); border-radius: 9px; background: var(--pico-surface-raised); color: var(--pico-ink); font: 550 var(--pico-size-sm)/1 var(--pico-font-ui); cursor: pointer; }\n.pico-script-predict button:not(:disabled):hover { border-color: var(--pico-accent); background: var(--pico-accent-wash); }\n.pico-script-predict button:disabled { cursor: default; opacity: .7; }\n.pico-script-predict button[data-chosen="true"] { opacity: 1; border-color: var(--pico-accent); background: var(--pico-accent-wash); color: var(--pico-accent-deep); }\n.pico-script-predict button[data-correct="true"] { opacity: 1; border-color: color-mix(in srgb, var(--pico-success, #15803d) 60%, var(--pico-hairline)); }\n.pico-script-predict button[data-correct="false"] { border-color: color-mix(in srgb, var(--pico-danger, #c2410c) 60%, var(--pico-hairline)); }\n.pico-script-predict code { padding: 1px 5px; border-radius: 4px; background: color-mix(in srgb, var(--pico-ink) 7%, var(--pico-surface)); font: 550 0.92em/1.35 var(--pico-font-mono); }\n.pico-script-reply { color: var(--pico-ink-soft); font: 400 var(--pico-size-sm)/1.6 var(--pico-font-text); }\n';

// session/impl/ui/script/card.tsx
import { Fragment as Fragment5, jsx as jsx7, jsxs as jsxs5 } from "./libs/react.js";
var SCRIPT_PANEL = "script";
var SCRIPT_RAIL_PANEL = "explanation";
function presentScript(bus) {
  let playing = false;
  const stop2 = bus.subscribe(["script.changed"], (next) => {
    if (next.script !== null && !playing) bus.emit({ type: "stage.reveal", keys: [SCRIPT_PANEL] }, "script");
    playing = next.script !== null;
  });
  return { dispose: stop2 };
}
function presentScriptRail(bus, lecture) {
  let disposed = false;
  const stop2 = bus.subscribe(["script.changed"], () => {
    queueMicrotask(() => {
      if (!disposed && lecture().script !== null) bus.emit({ type: "stage.reveal", keys: [SCRIPT_RAIL_PANEL] }, "script-rail");
    });
  });
  return { dispose: () => {
    disposed = true;
    stop2();
  } };
}
function scriptChoices(state, library3) {
  return library3.length === 0 ? [] : [{
    kind: "choices",
    label: "\u8BB2\u89E3",
    value: state?.script?.id ?? "",
    choices: library3.map((item) => ({ value: item.id, label: item.title, event: { type: "script.play", script: item } }))
  }];
}
function instructionEntry(state, library3) {
  if (library3.length !== 1) return scriptChoices(state, library3);
  const playing = state?.script != null;
  return [{
    kind: "choices",
    label: "\u8BB2\u89E3",
    value: playing ? library3[0].id : "",
    choices: [{
      value: library3[0].id,
      label: "\u8BB2\u89E3\u6A21\u5F0F",
      title: library3[0].title,
      event: playing ? { type: "script.stop" } : { type: "script.play", script: library3[0] }
    }]
  }];
}
function instructionToggle(state, library3) {
  if (library3.length === 0) return null;
  return state?.script != null ? { type: "script.stop" } : { type: "script.play", script: library3[0] };
}
function spoken(state) {
  const beats = scriptBeats(state.script.steps[state.step]).slice(0, state.beat + 1);
  const paragraphs = [];
  beats.forEach((beat, index) => {
    const text2 = index < state.beat ? beat.say : beat.say.slice(0, state.spoken);
    if (index === 0 || beat.paragraph === true) paragraphs.push([]);
    const active = index === state.beat;
    paragraphs.at(-1).push({
      text: text2,
      current: active && (state.narrating || state.writing === "typewriter"),
      writing: active && state.writing === "typewriter"
    });
  });
  return paragraphs;
}
function scriptCardPanel(view) {
  const state = lectureOf(view.get);
  if (state === null || state.script === null) return null;
  const step2 = state.script.steps[state.step];
  const enabled = (item) => item?.enabled === true;
  const stop2 = view.resolve("script.stop");
  const skip2 = view.resolve("script.skip");
  const student = state.writing === "student" || state.writing === "student-hint";
  const target2 = step2.write;
  const match = student && target2 !== void 0 ? targetMatch(view.get(editorHost).source, target2) : null;
  const touring = view.get(playground)?.getSnapshot().tour.process != null;
  const advance2 = (state.paused ? ["script.resume"] : state.writing === "typewriter" || state.narrating && !touring ? ["script.skip"] : target2 === void 0 ? ["script.next"] : state.writing === null ? ["script.follow", "script.write"] : student ? ["script.check", "script.hint", "script.write"] : []).map((id) => view.resolve(id)).filter(enabled);
  if (advance2.length === 0 && state.writing === null && enabled(stop2)) advance2.push(stop2);
  const offers = (step2.offer ?? []).flatMap((choice) => {
    const item = view.resolve(choice.action, choice.args);
    return enabled(item) ? [{ ...item, label: choice.label }] : [];
  });
  return /* @__PURE__ */ jsxs5("section", { className: "pico-script", "aria-label": state.script.title, children: [
    /* @__PURE__ */ jsx7("style", { children: card_default2 }),
    /* @__PURE__ */ jsxs5("header", { children: [
      /* @__PURE__ */ jsx7("strong", { children: state.script.title }),
      /* @__PURE__ */ jsx7("ol", { className: "pico-script-steps", "aria-label": `\u7B2C ${state.step + 1} \u6B65\uFF0C\u5171 ${state.script.steps.length} \u6B65`, children: state.script.steps.map((_, index) => /* @__PURE__ */ jsx7("li", { "data-state": index < state.step ? "done" : index === state.step ? "current" : "next" }, index)) }),
      enabled(stop2) && /* @__PURE__ */ jsx7("button", { type: "button", "aria-label": stop2.label, title: stop2.label, onClick: () => view.dispatch(stop2.event), children: "\xD7" })
    ] }),
    /* @__PURE__ */ jsxs5("article", { onClick: () => {
      if (enabled(skip2)) view.dispatch(skip2.event);
    }, children: [
      step2.title !== void 0 && /* @__PURE__ */ jsx7("h2", { children: step2.title }),
      /* @__PURE__ */ jsx7("div", { className: "pico-script-say", children: spoken(state).map((paragraph, index) => /* @__PURE__ */ jsx7("p", { children: paragraph.map((beat, at) => /* @__PURE__ */ jsx7("span", { "data-current": beat.current, "data-writing": beat.writing, children: inlineMarkdownImpl(beat.text) }, at)) }, index)) }),
      step2.predict !== void 0 && !state.narrating && /* @__PURE__ */ jsx7(Prediction, { view, state }),
      student && /* @__PURE__ */ jsx7("p", { className: "pico-script-guidance", role: "status", children: match?.complete ? "\u4EE3\u7801\u5DF2\u7ECF\u5339\u914D\uFF0C\u53EF\u4EE5\u68C0\u67E5\u5E76\u7EE7\u7EED\u3002" : state.writing === "student" ? "\u5148\u6309\u81EA\u5DF1\u7684\u60F3\u6CD5\u5199\uFF0C\u9700\u8981\u65F6\u518D\u770B\u4E00\u5C0F\u6BB5\u63D0\u793A\u3002" : match?.diverged ? `\u7B2C ${match.line} \u884C\u7B2C ${match.column} \u4E2A\u5B57\u7B26\u5F00\u59CB\u4E0D\u4E00\u81F4\uFF1BEditor \u5DF2\u6807\u51FA\u5E76\u6062\u590D\u8FD9\u4E00\u6BB5\u63D0\u793A\u3002` : /* @__PURE__ */ jsxs5(Fragment5, { children: [
        /* @__PURE__ */ jsx7("kbd", { children: "Tab" }),
        " \u63A5\u53D7\u5F53\u524D\u63D0\u793A\uFF1B\u63D0\u793A\u53EA\u663E\u793A\u4E00\u5C0F\u6BB5\u3002"
      ] }) })
    ] }),
    advance2.length + offers.length > 0 && /* @__PURE__ */ jsxs5("footer", { children: [
      advance2.map((item, index) => /* @__PURE__ */ jsx7(
        "button",
        {
          type: "button",
          "data-primary": index === 0,
          onClick: () => view.dispatch(item.event),
          children: item.id === "script.hint" && state.writing === "student-hint" ? "\u9690\u85CF\u63D0\u793A" : item.label
        },
        item.id
      )),
      offers.map((item) => /* @__PURE__ */ jsx7("button", { type: "button", onClick: () => view.dispatch(item.event), children: item.label }, `${item.id}:${item.label}`))
    ] })
  ] });
}
function Prediction({ view, state }) {
  const predict = state.script.steps[state.step].predict;
  const reply2 = state.answer === null ? null : predictionReply(predict, state.answer);
  return /* @__PURE__ */ jsxs5("div", { className: "pico-script-predict", role: "group", "aria-label": predict.question, children: [
    /* @__PURE__ */ jsx7("p", { children: inlineMarkdownImpl(predict.question) }),
    /* @__PURE__ */ jsx7("div", { children: predict.choices.map((choice, index) => {
      const item = view.resolve("script.choose", { index });
      return /* @__PURE__ */ jsx7(
        "button",
        {
          type: "button",
          disabled: item?.enabled !== true,
          "data-chosen": state.answer === index,
          "data-correct": state.answer === null ? void 0 : choice.correct === true || (state.answer === index ? false : void 0),
          onClick: () => {
            if (item?.enabled === true) view.dispatch(item.event);
          },
          children: inlineMarkdownImpl(choice.label)
        },
        index
      );
    }) }),
    reply2 !== null && /* @__PURE__ */ jsx7("p", { className: "pico-script-reply", role: "status", children: inlineMarkdownImpl(reply2) })
  ] });
}

// session/api/ui/script-rail.ts
var instructionHost = provided("instruction-host");
var scriptRail = feature("script-rail", {
  requires: [script, stage, playground],
  create: ({ bus, get, own }, options2) => {
    own(presentScriptRail(bus, () => get(playground).getSnapshot().lecture));
    return options2?.library ?? [];
  },
  actions: [{
    id: "script.instruct",
    label: "\u8BB2\u89E3\u6A21\u5F0F",
    when: ({ get }) => instructionToggle(lectureOf(get), library2(get)) !== null,
    event: ({ get }) => instructionToggle(lectureOf(get), library2(get))
  }, {
    /** 播放课程自带的一份讲稿，可以从中间某一步讲起；宿主据此“从上次讲到的地方继续”。 */
    id: "script.open",
    label: "\u6253\u5F00\u8BB2\u89E3",
    args: { id: { type: "string" }, step: { type: "integer", optional: true } },
    when: ({ get }, { id, step: step2 }) => {
      const found = library2(get).find((item) => item.id === id);
      return found !== void 0 && validStep(found, step2);
    },
    event: ({ get }, { id, step: step2 }) => ({
      type: "script.play",
      script: library2(get).find((item) => item.id === id),
      ...typeof step2 === "number" ? { step: step2 } : {}
    })
  }],
  queries: [
    { id: "script.library", run: ({ get }) => scriptLibrarySummary(library2(get)) },
    { id: "script.outline", run: ({ get }, { id }) => scriptOutline(library2(get), typeof id === "string" ? id : void 0) }
  ],
  views: [{ slot: "toolbar", label: "\u8BB2\u89E3", controls: ({ get }) => get(instructionHost) === true ? [] : instructionEntry(lectureOf(get), library2(get)) }, {
    slot: "panel",
    key: SCRIPT_RAIL_PANEL,
    title: "\u8BB2\u89E3",
    flush: true,
    dock: "start",
    dockSize: 0.35,
    when: ({ get }) => lectureOf(get)?.script != null,
    render: scriptCardPanel
  }]
});
function scriptLibrarySummary(library3) {
  return Object.freeze(library3.map((item) => Object.freeze({ id: item.id, title: item.title })));
}
function scriptOutline(library3, id) {
  if (typeof id === "string") {
    const found = library3.find((item) => item.id === id);
    return found === void 0 ? null : outline(found);
  }
  return Object.freeze(library3.map(outline));
}
function outline(item) {
  return Object.freeze({
    id: item.id,
    title: item.title,
    steps: Object.freeze(item.steps.map((step2) => Object.freeze({
      title: step2.title ?? null,
      say: spoken2(step2).slice(0, 300),
      writes: step2.write !== void 0,
      prediction: step2.predict?.question ?? null
    })))
  });
}
function spoken2(step2) {
  return scriptBeats(step2).map((beat) => beat.say).join("").trim();
}
var library2 = (get) => get(scriptRail) ?? [];

// session/api/ui/script.ts
var scriptViews = feature("script.views", {
  requires: [script],
  create: ({ bus, own }, options2) => {
    own(presentScript(bus));
    return options2?.library ?? [];
  },
  views: [
    { slot: "toolbar", label: "\u8BB2\u89E3", controls: ({ get }) => scriptChoices(lectureOf(get), get(scriptViews) ?? []) },
    { slot: "panel", key: SCRIPT_PANEL, title: "\u8BB2\u89E3", flush: true, when: ({ get }) => lectureOf(get)?.script != null, render: scriptCardPanel }
  ]
});

// session/impl/ui/source/draft.ts
import { StateEffect as StateEffect4, StateField as StateField4 } from "./libs/codemirror.js";
import { Decoration as Decoration4, EditorView as EditorView5, ViewPlugin as ViewPlugin5, WidgetType as WidgetType4 } from "./libs/codemirror.js";
var setDraft = StateEffect4.define();
var DraftText = class extends WidgetType4 {
  constructor(text2) {
    super();
    this.text = text2;
  }
  text;
  eq(other) {
    return other.text === this.text;
  }
  toDOM() {
    const element = document.createElement("span");
    element.className = "pico-draft-insert";
    element.setAttribute("aria-label", "\u6B63\u5728\u5199\u5165\u7684\u4EE3\u7801");
    element.textContent = this.text;
    return element;
  }
  ignoreEvent() {
    return true;
  }
};
function draftDecorations(state, draft) {
  if (draft === null) return Decoration4.none;
  const doc = state.doc.toString();
  if (doc === draft.code) return Decoration4.none;
  const { prefix, suffix } = sharedEnds(doc, draft.code);
  const removedTo = doc.length - suffix;
  const decorations2 = [];
  if (removedTo > prefix) decorations2.push(Decoration4.mark({ class: "pico-draft-delete" }).range(prefix, removedTo));
  const rawInsert = draft.code.slice(prefix, draft.code.length - suffix);
  const insert = removedTo > prefix && doc[removedTo - 1] !== "\n" && !rawInsert.startsWith("\n") ? `
${rawInsert}` : rawInsert;
  decorations2.push(Decoration4.widget({ widget: new DraftText(insert), side: -1 }).range(removedTo));
  return Decoration4.set(decorations2, true);
}
function draftEditorImpl(onSkip) {
  const views = /* @__PURE__ */ new Set();
  let draft = null;
  const field = StateField4.define({
    create: () => draft,
    update: (value, transaction) => transaction.effects.reduce((current, effect) => effect.is(setDraft) ? effect.value : current, value),
    provide: (self) => EditorView5.decorations.compute([self, "doc"], (state) => draftDecorations(state, state.field(self)))
  });
  const dispatch = deferredDispatch(() => views, (next) => setDraft.of(next));
  const extension = [
    field,
    ViewPlugin5.define((view) => {
      views.add(view);
      return { destroy: () => {
        views.delete(view);
      } };
    }),
    EditorView5.domEventHandlers({
      mousedown: () => {
        if (draft !== null) onSkip?.();
        return false;
      }
    }),
    EditorView5.baseTheme({
      ".pico-draft-insert": {
        whiteSpace: "pre-wrap",
        borderRadius: "3px",
        color: "var(--pico-ink)",
        background: "color-mix(in srgb, var(--pico-accent) 14%, transparent)",
        boxShadow: "0 0 0 1px color-mix(in srgb, var(--pico-accent) 30%, transparent)"
      },
      ".pico-draft-insert::after": {
        content: "''",
        display: "inline-block",
        width: "2px",
        height: "1.1em",
        marginLeft: "1px",
        verticalAlign: "text-bottom",
        background: "var(--pico-accent)"
      },
      ".pico-draft-delete": { textDecoration: "line-through", opacity: "0.5" }
    })
  ];
  return Object.freeze({
    extension,
    show: (next) => {
      if (next === draft) return;
      draft = next;
      dispatch(next);
    },
    dispose: () => {
      draft = null;
      views.clear();
    }
  });
}

// session/api/ui/source.ts
var editors3 = /* @__PURE__ */ new WeakMap();
var draftViews = feature("source.views", {
  requires: [playground],
  create: ({ bus, get, own }) => {
    const state = {};
    const editor2 = own(draftEditorImpl(() => {
      const origin = get(playground).getSnapshot().code.typing?.origin;
      if (origin !== void 0) bus.emit({ type: "source.hurry", origin }, "source.views");
    }));
    editors3.set(state, editor2);
    own({ dispose: bus.subscribe(["source.changed"], () => editor2.show(get(playground).getSnapshot().code.typing)) });
    return state;
  },
  views: [{ slot: "editor-extension", extension: ({ get }) => {
    const state = get(draftViews);
    return state === null ? [] : editors3.get(state)?.extension ?? [];
  } }]
});

// session/api/ui/world.ts
import { createElement } from "./libs/react.js";

// session/impl/ui/world/anchors.ts
function worldResolverImpl(root, run2) {
  return {
    accepts: (anchor) => anchor.kind === "world-object" && anchor.run === run2(),
    locate: (anchor) => {
      const element = root.element;
      if (anchor.kind !== "world-object" || element === null || !element.isConnected) return null;
      const found = element.querySelector(`[data-anchor="${CSS.escape(anchor.objectId)}"]`);
      return found === null ? null : { rect: found.getBoundingClientRect(), clip: element.getBoundingClientRect() };
    }
  };
}

// session/api/ui/world.ts
var WORLD_PANEL = "viz";
function worldPanel(options2) {
  const world = feature("world.views", {
    requires: [playbackHost, annotations, playground],
    create: ({ get, own }) => {
      const root = { element: null };
      const playing = get(playbackHost);
      own({ dispose: registerAnchorResolver(get(playground), worldResolverImpl(root, () => playing.trace)) });
      return root;
    },
    views: [{
      slot: "panel",
      key: WORLD_PANEL,
      icon: "viz",
      title: options2.title,
      flush: true,
      render: (view) => {
        const root = view.get(world);
        return createElement("div", {
          className: "pico-session-world",
          style: { width: "100%", height: "100%" },
          ref: (element) => {
            if (root !== null) root.element = element;
          }
        }, options2.render(view));
      }
    }]
  });
  return world;
}

// session/mock/ai.ts
function mockAiPort(answer, options2 = {}) {
  return Object.freeze({
    ask: (request, signal) => new Promise((resolve, reject) => {
      const respond = () => {
        signal.removeEventListener("abort", cancel);
        try {
          resolve(answer(request));
        } catch (error) {
          reject(error);
        }
      };
      const delay = typeof options2.delayMs === "function" ? options2.delayMs(request) : options2.delayMs ?? 0;
      const timer3 = setTimeout(respond, delay);
      const cancel = () => {
        clearTimeout(timer3);
        reject(signal.reason);
      };
      if (signal.aborted) cancel();
      else signal.addEventListener("abort", cancel, { once: true });
    })
  });
}
function momentSentence(moment) {
  const frame = moment.frames.at(-1);
  const call = frame === void 0 || frame.name === "<module>" ? "\u5728\u6A21\u5757\u9876\u5C42" : `\u5728 ${frame.name}(${Object.entries(frame.locals).map(([name, value]) => `${name}=${JSON.stringify(value)}`).join(", ")}) \u8FD9\u4E00\u5C42`;
  const nth = moment.occurrence === null ? "" : `\uFF0C\u8FD9\u662F\u8FD9\u53E5\u7684\u7B2C ${moment.occurrence.ordinal} / ${moment.occurrence.count} \u6B21\u6267\u884C`;
  return `\u7B2C ${moment.step} \u6B65${call}${nth}\u3002`;
}

// session/mock/course.ts
import { editor } from "./pico.js";
function mountMinimalCourse(bus, source2, features = []) {
  const editing = editor.create(bus);
  bus.emit({ type: "editor.render", source: source2 }, "course");
  bus.emit({ type: "editor.changed", source: source2 }, "editor");
  const session = assembleSession(bus, [editorHost.with(editing.state), playground, source, ...features]);
  return {
    session,
    dispose: () => {
      session.dispose();
      editing.dispose();
    }
  };
}

// session/mock/scheduler.ts
function manualScheduler() {
  let now = 0;
  let next = 0;
  const tasks = /* @__PURE__ */ new Map();
  const due = (until) => [...tasks].filter(([, task]) => task.at <= until).sort(([a, x], [b, y]) => x.at - y.at || a - b)[0];
  const runUntil = (until) => {
    for (let task = due(until); task !== void 0; task = due(until)) {
      tasks.delete(task[0]);
      now = task[1].at;
      task[1].run();
    }
    if (Number.isFinite(until)) now = Math.max(now, until);
  };
  return {
    delay: (ms, run2) => {
      const id = next++;
      tasks.set(id, { at: now + ms, run: run2 });
      return () => {
        tasks.delete(id);
      };
    },
    advance: (ms) => runUntil(now + ms),
    flush: () => runUntil(Infinity)
  };
}

// session/impl/remote-ai/http.ts
var DEFAULT_MAX_RESPONSE_BYTES = 64 * 1024;
var DEFAULT_TIMEOUT_MS = 6e4;
var DEFAULT_AGENT_TIMEOUT_MS = 15e4;
function originOf(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:" || url.username !== "" || url.password !== "" || url.search !== "" || url.hash !== "" || url.pathname !== "/" && url.pathname !== "") {
    throw new TypeError("baseUrl must be an HTTP origin");
  }
  return url.origin;
}
async function jsonOf(response, maximum) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maximum) throw new Error("Course AI reply is too large");
  const reader = response.body?.getReader();
  if (reader === void 0) throw new Error("Course AI reply is empty");
  const chunks = [];
  let size = 0;
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel().catch(() => void 0);
        throw new Error("Course AI reply is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (cause) {
    throw new Error("Course AI reply is invalid JSON", { cause });
  }
}
async function failure(response, what) {
  const detail = await response.text().then((body) => body.trim().slice(0, 300), () => "");
  return new Error(`${what} failed with HTTP ${response.status}${detail === "" ? "" : `: ${detail}`}`);
}
async function timed(what, timeoutMs, signal, run2) {
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    return await run2(AbortSignal.any([signal, timeout]));
  } catch (error) {
    if (timeout.aborted && !signal.aborted) throw new Error(`${what} timed out after ${timeoutMs} ms`, { cause: error });
    throw error;
  }
}
function timeoutOf(options2, fallback2) {
  const timeout = options2.timeoutMs ?? fallback2;
  if (!Number.isInteger(timeout) || timeout < 1) throw new TypeError("timeoutMs must be a positive integer");
  return timeout;
}
function text(value, path2) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${path2} must be a non-empty string`);
  return value;
}
function actionOf(value, path2) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new TypeError(`${path2} must be an object`);
  const input = value;
  if (!Object.keys(input).every((key) => ["action", "label", "args"].includes(key))) throw new TypeError(`${path2} has unknown fields`);
  const args = input["args"];
  if (args !== void 0 && (typeof args !== "object" || args === null || Array.isArray(args))) {
    throw new TypeError(`${path2}.args must be an object`);
  }
  return Object.freeze({
    action: text(input["action"], `${path2}.action`),
    label: text(input["label"], `${path2}.label`),
    ...args === void 0 ? {} : { args: Object.freeze({ ...args }) }
  });
}
function replyOf(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new TypeError("AI reply must be an object");
  const input = value;
  if (!Object.keys(input).every((key) => ["title", "text", "primary", "actions"].includes(key))) {
    throw new TypeError("AI reply has unknown fields");
  }
  const title = input["title"];
  if (title !== void 0 && typeof title !== "string") throw new TypeError("AI reply title must be a string");
  const actions = input["actions"];
  if (actions !== void 0 && !Array.isArray(actions)) throw new TypeError("AI reply actions must be an array");
  return Object.freeze({
    ...title === void 0 ? {} : { title },
    text: text(input["text"], "AI reply text"),
    ...input["primary"] === void 0 ? {} : { primary: actionOf(input["primary"], "AI reply primary") },
    ...actions === void 0 ? {} : { actions: Object.freeze(actions.map((item, index) => actionOf(item, `AI reply actions[${index}]`))) }
  });
}
function createHttpCourseAi(options2) {
  const origin = originOf(options2.baseUrl);
  if (typeof options2.fetch !== "function") throw new TypeError("fetch must be a function");
  const { fetch } = options2;
  if (!options2.playgroundId || !options2.versionId) throw new TypeError("playgroundId and versionId must be non-empty");
  const maximum = options2.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
  if (!Number.isInteger(maximum) || maximum < 1) throw new TypeError("maxResponseBytes must be a positive integer");
  const timeout = timeoutOf(options2, DEFAULT_TIMEOUT_MS);
  const headers = Object.freeze({ "content-type": "application/json", ...options2.headers });
  return Object.freeze({
    ask: (request, signal) => timed("Course AI request", timeout, signal, async (signal2) => {
      const response = await fetch(`${origin}/api/v1/ai/course`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          playgroundId: options2.playgroundId,
          versionId: options2.versionId,
          request
        }),
        signal: signal2
      });
      if (!response.ok) throw await failure(response, "Course AI request");
      return replyOf(await jsonOf(response, maximum));
    })
  });
}
function turnOf(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new TypeError("agent turn must be an object");
  const input = value;
  if (typeof input["content"] !== "string" || !Array.isArray(input["calls"])) throw new TypeError("agent turn has invalid fields");
  const calls = input["calls"].map((item, index) => {
    const call = typeof item === "object" && item !== null ? item : {};
    if (typeof call["id"] !== "string" || typeof call["name"] !== "string" || typeof call["arguments"] !== "string") {
      throw new TypeError(`agent turn calls[${index}] is invalid`);
    }
    return Object.freeze({ id: call["id"], name: call["name"], arguments: call["arguments"] });
  });
  const reasoning = input["reasoning"];
  return Object.freeze({
    content: input["content"],
    calls: Object.freeze(calls),
    ...typeof reasoning === "string" && reasoning !== "" ? { reasoning } : {}
  });
}
async function streamedTurn(response, maximum, onText, path2) {
  const reader = response.body?.getReader();
  if (reader === void 0) throw new Error(`AI agent stream ${path2} is empty`);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let buffered = "";
  let said = "";
  let size = 0;
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (!done) {
        size += value.byteLength;
        if (size > maximum) throw new Error(`AI agent stream ${path2} is too large`);
      }
      buffered += done ? decoder.decode() : decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = done ? "" : lines.pop();
      for (const line of lines) {
        if (line.trim() === "") continue;
        let entry;
        try {
          entry = JSON.parse(line);
        } catch (cause) {
          throw new Error(`AI agent stream ${path2} has an invalid line`, { cause });
        }
        if (typeof entry.text === "string") {
          said += entry.text;
          onText(said);
        } else if (entry.turn !== void 0) {
          return turnOf(entry.turn);
        } else if (entry.error !== void 0) {
          throw new Error(`AI agent stream ${path2} failed: ${String(entry.error.message)}`);
        }
      }
      if (done) throw new Error(`AI agent stream ${path2} ended without a turn`);
    }
  } finally {
    await reader.cancel().catch(() => void 0);
  }
}
function createHttpCourseAgent(options2) {
  if (!options2.playgroundId || !options2.versionId) throw new TypeError("playgroundId and versionId must be non-empty");
  return httpAgent(options2, "/api/v1/ai/agent", { playgroundId: options2.playgroundId, versionId: options2.versionId });
}
function createHttpTutorAgent(options2) {
  return httpAgent(options2, "/api/v1/ai/tutor", {});
}
function httpAgent(options2, path2, fields) {
  const origin = originOf(options2.baseUrl);
  if (typeof options2.fetch !== "function") throw new TypeError("fetch must be a function");
  const { fetch } = options2;
  const maximum = options2.maxResponseBytes ?? 1024 * 1024;
  const timeout = timeoutOf(options2, DEFAULT_AGENT_TIMEOUT_MS);
  const headers = Object.freeze({ "content-type": "application/json", ...options2.headers });
  return Object.freeze({
    step: (request, signal, onText) => timed(`AI agent request ${path2}`, timeout, signal, async (signal2) => {
      const body = JSON.stringify({ ...fields, ...request });
      if (onText === void 0) {
        const response2 = await fetch(`${origin}${path2}`, { method: "POST", headers, body, signal: signal2 });
        if (!response2.ok) throw await failure(response2, `AI agent request ${path2}`);
        return turnOf(await jsonOf(response2, maximum));
      }
      const response = await fetch(`${origin}${path2}`, { method: "POST", headers: { ...headers, accept: "application/x-ndjson" }, body, signal: signal2 });
      if (!response.ok) throw await failure(response, `AI agent request ${path2}`);
      return streamedTurn(response, maximum, onText, path2);
    })
  });
}
export {
  AI_PANEL,
  ANNOTATION_BUDGET,
  InlineMarkdown,
  Markdown,
  NOTE_LIMIT,
  SCRIPT_RAIL_PANEL,
  SessionEnvironmentProvider,
  SessionPage,
  SessionShell,
  WORLD_PANEL,
  ai,
  aiContext,
  aiScript,
  aiViews,
  allowed,
  annotationViews,
  annotations,
  argsMatch2 as argsMatch,
  assembleSession,
  canAskAiToWrite,
  canFocusDebugger,
  canLocateCode,
  canLocateSelection,
  canPlayTour,
  canRestoreReference,
  canSeekTrace,
  canSelectWorld,
  chatOf,
  codeLocked,
  codeOwner,
  connectSession,
  createHttpCourseAgent,
  createHttpCourseAi,
  createHttpTutorAgent,
  debuggerAnchors,
  decodeSessionReference,
  draftViews,
  editable,
  editorHost,
  encodeSessionReference,
  eventActor,
  execution,
  feature,
  hintViews,
  instructionHost,
  isReadyToWrite,
  isSessionReference,
  isStage,
  isStops,
  isStudentWriting,
  layoutHost,
  lectureOf,
  lineSelection,
  liveVariables,
  locateAnchor,
  manualScheduler,
  mockAiPort,
  momentSentence,
  mountMinimalCourse,
  navigate,
  playbackHost,
  playground,
  playgroundSnapshot,
  predictionReply,
  projectPlaygroundSnapshot,
  provided,
  registerAnchorResolver,
  resolveAction2 as resolveAction,
  resolveActions3 as resolveActions,
  review,
  reviewLatest,
  reviewStatus,
  reviewViews,
  script,
  scriptBeats,
  scriptCursor,
  scriptLibrarySummary,
  scriptOutline,
  scriptRail,
  scriptViews,
  selectionHost,
  sessionContext,
  sessionContextSnapshot,
  sessionEvidence,
  sessionView,
  sharedEnds,
  shownCode,
  source,
  sourceDraft,
  stage,
  targetMatch,
  terminalAnchors,
  toolbarButton,
  tour,
  traceChanges,
  traceFrames,
  traceOccurrences,
  traceOutput,
  tracePosition,
  traceQueries,
  useSession,
  validStep,
  validateScript,
  withEnvironment2 as withEnvironment,
  worldPanel
};
