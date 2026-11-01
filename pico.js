var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@xterm/xterm/css/xterm.css
var require_xterm = __commonJS({
  "node_modules/@xterm/xterm/css/xterm.css"(exports, module) {
    module.exports = `/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * https://github.com/chjj/term.js
 * @license MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 *   The original design remains. The terminal itself
 *   has been extended to include xterm CSI codes, among
 *   other features.
 */

/**
 *  Default styles for xterm.js
 */

.xterm {
    cursor: text;
    position: relative;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
}

.xterm.focus,
.xterm:focus {
    outline: none;
}

.xterm .xterm-helpers {
    position: absolute;
    top: 0;
    /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
    z-index: 5;
}

.xterm .xterm-helper-textarea {
    padding: 0;
    border: 0;
    margin: 0;
    /* Move textarea out of the screen to the far left, so that the cursor is not visible */
    position: absolute;
    opacity: 0;
    left: -9999em;
    top: 0;
    width: 0;
    height: 0;
    z-index: -5;
    /** Prevent wrapping so the IME appears against the textarea at the correct position */
    white-space: nowrap;
    overflow: hidden;
    resize: none;
}

.xterm .composition-view {
    /* TODO: Composition position got messed up somewhere */
    background: #000;
    color: #FFF;
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
}

.xterm .composition-view.active {
    display: block;
}

.xterm .xterm-viewport {
    /* On OS X this is required in order for the scroll bar to appear fully opaque */
    background-color: #000;
    overflow-y: scroll;
    cursor: default;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
}

.xterm .xterm-screen {
    position: relative;
}

.xterm .xterm-screen canvas {
    position: absolute;
    left: 0;
    top: 0;
}

.xterm-char-measure-element {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: 0;
    left: -9999em;
    line-height: normal;
}

.xterm.enable-mouse-events {
    /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
    cursor: default;
}

.xterm.xterm-cursor-pointer,
.xterm .xterm-cursor-pointer {
    cursor: pointer;
}

.xterm.column-select.focus {
    /* Column selection mode */
    cursor: crosshair;
}

.xterm .xterm-accessibility:not(.debug),
.xterm .xterm-message {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
    color: transparent;
    pointer-events: none;
}

.xterm .xterm-accessibility-tree:not(.debug) *::selection {
  color: transparent;
}

.xterm .xterm-accessibility-tree {
  font-family: monospace;
  user-select: text;
  white-space: pre;
}

.xterm .xterm-accessibility-tree > div {
  transform-origin: left;
  width: fit-content;
}

.xterm .live-region {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.xterm-dim {
    /* Dim should not apply to background, so the opacity of the foreground color is applied
     * explicitly in the generated class and reset to 1 here */
    opacity: 1 !important;
}

.xterm-underline-1 { text-decoration: underline; }
.xterm-underline-2 { text-decoration: double underline; }
.xterm-underline-3 { text-decoration: wavy underline; }
.xterm-underline-4 { text-decoration: dotted underline; }
.xterm-underline-5 { text-decoration: dashed underline; }

.xterm-overline {
    text-decoration: overline;
}

.xterm-overline.xterm-underline-1 { text-decoration: overline underline; }
.xterm-overline.xterm-underline-2 { text-decoration: overline double underline; }
.xterm-overline.xterm-underline-3 { text-decoration: overline wavy underline; }
.xterm-overline.xterm-underline-4 { text-decoration: overline dotted underline; }
.xterm-overline.xterm-underline-5 { text-decoration: overline dashed underline; }

.xterm-strikethrough {
    text-decoration: line-through;
}

.xterm-screen .xterm-decoration-container .xterm-decoration {
	z-index: 6;
	position: absolute;
}

.xterm-screen .xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer {
	z-index: 7;
}

.xterm-decoration-overview-ruler {
    z-index: 8;
    position: absolute;
    top: 0;
    right: 0;
    pointer-events: none;
}

.xterm-decoration-top {
    z-index: 2;
    position: relative;
}



/* Derived from vs/base/browser/ui/scrollbar/media/scrollbar.css */

/* xterm.js customization: Override xterm's cursor style */
.xterm .xterm-scrollable-element > .scrollbar {
    cursor: default;
}

/* Arrows */
.xterm .xterm-scrollable-element > .scrollbar > .scra {
	cursor: pointer;
	font-size: 11px !important;
}

.xterm .xterm-scrollable-element > .visible {
	opacity: 1;

	/* Background rule added for IE9 - to allow clicks on dom node */
	background:rgba(0,0,0,0);

	transition: opacity 100ms linear;
	/* In front of peek view */
	z-index: 11;
}
.xterm .xterm-scrollable-element > .invisible {
	opacity: 0;
	pointer-events: none;
}
.xterm .xterm-scrollable-element > .invisible.fade {
	transition: opacity 800ms linear;
}

/* Scrollable Content Inset Shadow */
.xterm .xterm-scrollable-element > .shadow {
	position: absolute;
	display: none;
}
.xterm .xterm-scrollable-element > .shadow.top {
	display: block;
	top: 0;
	left: 3px;
	height: 3px;
	width: 100%;
	box-shadow: var(--vscode-scrollbar-shadow, #000) 0 6px 6px -6px inset;
}
.xterm .xterm-scrollable-element > .shadow.left {
	display: block;
	top: 3px;
	left: 0;
	height: 100%;
	width: 3px;
	box-shadow: var(--vscode-scrollbar-shadow, #000) 6px 0 6px -6px inset;
}
.xterm .xterm-scrollable-element > .shadow.top-left-corner {
	display: block;
	top: 0;
	left: 0;
	height: 3px;
	width: 3px;
}
.xterm .xterm-scrollable-element > .shadow.top.left {
	box-shadow: var(--vscode-scrollbar-shadow, #000) 6px 0 6px -6px inset;
}
`;
  }
});

// src/impl/core/state.ts
function createStateImpl(initial) {
  let value = initial;
  const listeners = /* @__PURE__ */ new Set();
  const set = (next) => {
    if (Object.is(value, next)) return;
    value = next;
    for (const listener of [...listeners]) listener();
  };
  return {
    getSnapshot: () => value,
    set,
    update: (compute) => set(compute(value)),
    subscribe: (listener) => {
      const notify = () => listener();
      listeners.add(notify);
      return () => {
        listeners.delete(notify);
      };
    }
  };
}

// src/impl/core/derivation.ts
function makeDerivation(name, compute) {
  return Object.freeze({ kind: "derivation", name, compute });
}

// src/impl/event-bus.ts
var EventBusImpl = class {
  listeners = /* @__PURE__ */ new Set();
  queue = [];
  delivering = false;
  disposed = false;
  subscribe(types, receive, name) {
    if (this.disposed) return () => {
    };
    if (name !== void 0 && [...this.listeners].some((listener) => listener.name === name)) throw new Error(`Duplicate recipient ${name}`);
    const subscription = { name, types: new Set(types), receive };
    this.listeners.add(subscription);
    return () => {
      this.listeners.delete(subscription);
    };
  }
  subscribeAll(receive) {
    if (this.disposed) return () => {
    };
    const subscription = { types: null, receive };
    this.listeners.add(subscription);
    return () => {
      this.listeners.delete(subscription);
    };
  }
  emit(event2, source) {
    this.deliver(event2, source);
  }
  send(name, event2, source) {
    if (this.disposed) return;
    const recipient = [...this.listeners].find((listener) => listener.name === name);
    if (!recipient) throw new Error(`Unknown recipient ${name}`);
    if (!recipient.types?.has(event2.type)) throw new Error(`${name} received undeclared event ${event2.type}`);
    this.deliver(event2, source, recipient);
  }
  deliver(event2, source, target) {
    if (this.disposed) return;
    this.queue.push({ event: Object.freeze({ ...event2 }), source, target });
    if (this.delivering) return;
    this.delivering = true;
    try {
      while (this.queue.length && !this.disposed) {
        const occurrence = this.queue.shift();
        for (const subscription of [...this.listeners]) {
          if (this.disposed) break;
          const addressed = occurrence.target === void 0 || subscription.types === null || subscription === occurrence.target;
          const accepts = subscription.types === null || subscription.types.has(occurrence.event.type);
          if (this.listeners.has(subscription) && addressed && accepts) {
            subscription.receive(occurrence.event, occurrence.source);
          }
        }
      }
    } catch (error2) {
      this.queue.length = 0;
      throw error2;
    } finally {
      this.delivering = false;
    }
  }
  port(contract) {
    const name = contract.name;
    const emits = contract.emits === void 0 ? null : new Set(contract.emits);
    return Object.freeze({ emit: (event2) => {
      if (this.disposed) return;
      if (emits && !emits.has(event2.type)) throw new Error(`${name} emitted undeclared event ${event2.type}`);
      this.emit(event2, name);
    } });
  }
  dispose() {
    this.disposed = true;
    this.listeners.clear();
    this.queue.length = 0;
  }
};

// src/impl/core/stateful.ts
var implementations = /* @__PURE__ */ new WeakMap();
function makeEvent(type, _payload) {
  return Object.freeze({ kind: "event", type });
}
function makeHandler(type, handle, emits) {
  const handler = Object.freeze({ kind: "handler", type, emits: emits === void 0 ? void 0 : Object.freeze([...emits]) });
  implementations.set(handler, handle);
  return handler;
}
function makeStateful(name, initialize, declarations, element) {
  const handlers = Object.freeze(declarations.filter((item) => item.kind !== "event"));
  const events = Object.freeze(declarations.filter((item) => item.kind === "event"));
  const names = /* @__PURE__ */ new Set();
  for (const event2 of events) {
    if (names.has(event2.type)) throw new Error(`${name} declares duplicate event ${event2.type}`);
    names.add(event2.type);
  }
  const table = /* @__PURE__ */ new Map();
  for (const handler of handlers) {
    if (table.has(handler.type)) throw new Error(`${name} declares duplicate handler ${handler.type}`);
    const implementation = implementations.get(handler);
    if (!implementation) throw new Error(`${name} requires handlers declared with on()`);
    table.set(handler.type, handler);
  }
  return Object.freeze({
    kind: "stateful",
    name,
    handlers,
    events,
    create(...args) {
      let count = args.length;
      while (count > 1 && args[count - 1] === void 0) count--;
      const named = typeof args[count - 1] === "string";
      const instanceName = named ? args[count - 1] : name;
      count -= Number(named);
      const options = count === 1 ? void 0 : args[0];
      const bus = args[count - 1];
      let disposed = false;
      let initialized = false;
      let state2;
      const cleanups = [];
      const pending2 = [];
      const onDispose = (cleanup) => {
        if (disposed) cleanup();
        else cleanups.push(cleanup);
      };
      const contexts = new Map(handlers.map((handler) => {
        const port = bus.port({ name: instanceName, emits: handler.emits });
        return [handler, Object.freeze({ source: instanceName, emit: (event2) => {
          if (!disposed) port.emit(event2);
        }, onDispose })];
      }));
      const receive = (event2, source = instanceName) => {
        if (disposed) return;
        const handler = table.get(event2.type);
        if (!handler) throw new Error(`${name} received undeclared event ${event2.type}`);
        if (!initialized) {
          pending2.push(event2);
          return;
        }
        implementations.get(handler)(state2, event2, Object.freeze({ ...contexts.get(handler), source }));
      };
      const dispose = () => {
        if (disposed) return;
        disposed = true;
        pending2.length = 0;
        const errors = [];
        for (const cleanup of cleanups.reverse()) {
          try {
            cleanup();
          } catch (error2) {
            errors.push(error2);
          }
        }
        cleanups.length = 0;
        if (errors.length) throw new AggregateError(errors, `${name} cleanup failed`);
      };
      try {
        state2 = initialize(options, { dispatch: receive, onDispose });
        initialized = true;
        cleanups.push(bus.subscribe([...table.keys()], (event2, source) => receive(event2, source), instanceName));
        for (const event2 of pending2.splice(0)) receive(event2);
        return Object.freeze({ state: state2, get element() {
          return element ? element(state2) : null;
        }, receive, dispose });
      } catch (error2) {
        try {
          dispose();
        } catch (cleanupError) {
          throw new AggregateError([error2, cleanupError], `${name} initialization failed`);
        }
        throw error2;
      }
    }
  });
}

// src/core.ts
function derivation(name, compute) {
  return makeDerivation(name, compute);
}
function stateful(name, create, declarations, element) {
  return makeStateful(name, create, declarations, element);
}
function event(type, payload2) {
  return makeEvent(type, payload2);
}
function on(type, handle, emits) {
  return makeHandler(type, handle, emits);
}
function createState(initial) {
  return createStateImpl(initial);
}
var EventBus = class {
  implementation = new EventBusImpl();
  subscribe(types, receive, name) {
    return this.implementation.subscribe(types, receive, name);
  }
  subscribeAll(receive) {
    return this.implementation.subscribeAll(receive);
  }
  emit(event2, source = "external") {
    this.implementation.emit(event2, source);
  }
  /** 定向投递；subscribeAll 仍可观察。 */
  send(name, event2, source = "external") {
    this.implementation.send(name, event2, source);
  }
  port(contract) {
    return this.implementation.port(contract);
  }
  dispose() {
    this.implementation.dispose();
  }
};

// src/impl/source.ts
function initializeSource(target, code, options) {
  Object.assign(target, {
    code,
    prelude: options?.prelude ?? "",
    driver: options?.driver ?? "",
    files: Object.freeze({ ...options?.files })
  });
  Object.freeze(target);
}

// src/python.ts
var PySource = class {
  /** 写入 source.py；诊断和 trace 行号以此为准。 */
  code;
  /** 源码执行前的 Python 代码，默认空字符串。 */
  prelude;
  /** 源码正常执行后的 Python 代码，默认空字符串。 */
  driver;
  /** 默认空文件表。 */
  files;
  constructor(code, options) {
    initializeSource(this, code, options);
  }
};

// src/impl/trace/index.ts
function initializeTrace(target, fields) {
  Object.assign(target, {
    initialState: immutableCopy(fields.initialState),
    steps: immutableCopy(fields.steps),
    finalState: immutableCopy(fields.finalState),
    resources: immutableCopy(fields.resources ?? {})
  });
}
function clone(value) {
  return structuredClone(value);
}
function immutableCopy(value) {
  return deepFreeze(clone(value));
}
function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child2 of Object.values(value)) deepFreeze(child2);
  }
  return value;
}
function arrayIndex(array, key) {
  if (!Number.isInteger(key)) throw new TypeError("\u6570\u7EC4\u8DEF\u5F84\u5FC5\u987B\u4F7F\u7528\u6574\u6570\u7D22\u5F15");
  const index = key === -1 ? array.length - 1 : key;
  if (typeof index !== "number" || index < 0 || index >= array.length) {
    throw new RangeError(`\u6570\u7EC4\u8DEF\u5F84\u8D8A\u754C: ${String(key)}`);
  }
  return index;
}
function child(container, segment) {
  if (Array.isArray(container)) return container[arrayIndex(container, segment)];
  if (container !== null && typeof container === "object" && typeof segment === "string") {
    if (!Object.hasOwn(container, segment)) throw new Error(`\u72B6\u6001\u8DEF\u5F84\u4E0D\u5B58\u5728: ${segment}`);
    return container[segment];
  }
  throw new TypeError("\u72B6\u6001\u8DEF\u5F84\u4E0E\u76EE\u6807\u6570\u636E\u7C7B\u578B\u4E0D\u5339\u914D");
}
function valueAt(root, path) {
  let value = root;
  for (const segment of path) value = child(value, segment);
  return value;
}
function parentAt(root, path) {
  if (path.length === 0) throw new Error("StateChange path \u4E0D\u80FD\u4E3A\u7A7A");
  return { parent: valueAt(root, path.slice(0, -1)), key: path[path.length - 1] };
}
function put(root, path, value) {
  const { parent, key } = parentAt(root, path);
  if (Array.isArray(parent)) {
    parent[arrayIndex(parent, key)] = clone(value);
    return;
  }
  if (parent !== null && typeof parent === "object" && typeof key === "string") {
    Object.defineProperty(parent, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: clone(value)
    });
    return;
  }
  throw new TypeError("put path \u4E0E\u76EE\u6807\u6570\u636E\u7C7B\u578B\u4E0D\u5339\u914D");
}
function append(root, path, value) {
  const target = valueAt(root, path);
  if (Array.isArray(target)) {
    target.push(clone(value));
    return;
  }
  if (typeof target === "string" && typeof value === "string") {
    put(root, path, target + value);
    return;
  }
  throw new TypeError("append \u53EA\u652F\u6301\u5B57\u7B26\u4E32\u62FC\u63A5\u6216\u6570\u7EC4\u672B\u5C3E\u8FFD\u52A0");
}
function remove(root, path) {
  const { parent, key } = parentAt(root, path);
  if (Array.isArray(parent)) {
    const index = arrayIndex(parent, key);
    if (index !== parent.length - 1) throw new Error("\u6570\u7EC4\u53EA\u5141\u8BB8\u5220\u9664\u672B\u5C3E\u5143\u7D20");
    parent.pop();
    return;
  }
  if (parent !== null && typeof parent === "object" && typeof key === "string") {
    if (!Object.hasOwn(parent, key)) throw new Error(`\u72B6\u6001\u8DEF\u5F84\u4E0D\u5B58\u5728: ${key}`);
    delete parent[key];
    return;
  }
  throw new TypeError("remove path \u4E0E\u76EE\u6807\u6570\u636E\u7C7B\u578B\u4E0D\u5339\u914D");
}
function apply(root, change2) {
  if (change2.op === "append") append(root, change2.path, change2.value);
  else if (change2.op === "remove") remove(root, change2.path);
  else put(root, change2.path, change2.value);
}
function stateAtImpl(trace2, traceIndex) {
  const finalIndex = trace2.steps.length + 1;
  if (!Number.isInteger(traceIndex) || traceIndex < 0 || traceIndex > finalIndex) {
    throw new RangeError(`traceIndex \u5FC5\u987B\u5728 0..${finalIndex} \u5185`);
  }
  if (traceIndex === finalIndex) return deepFreeze(clone(trace2.finalState));
  const state2 = clone(trace2.initialState);
  for (let i = 0; i < traceIndex; i += 1) {
    for (const change2 of trace2.steps[i].changes) apply(state2, change2);
  }
  return deepFreeze(state2);
}
function positionAtImpl(trace2, traceIndex) {
  const finalIndex = trace2.steps.length + 1;
  if (!Number.isInteger(traceIndex) || traceIndex < 1 || traceIndex > finalIndex) {
    throw new RangeError(`traceIndex \u5FC5\u987B\u5728 1..${finalIndex} \u5185`);
  }
  const atEnd = traceIndex === finalIndex;
  return Object.freeze({
    traceIndex,
    atEnd,
    event: atEnd ? null : trace2.steps[traceIndex - 1].event,
    state: trace2.at(traceIndex),
    previous: trace2.at(traceIndex - 1)
  });
}

// src/types.ts
var Trace = class {
  initialState;
  steps;
  finalState;
  /** 资源名 → 追加式日志；TraceState.resources 保存各日志的游标。 */
  resources;
  constructor(fields) {
    initializeTrace(this, fields);
  }
  /**
   * 整数范围 0..steps.length + 1；0 为 initialState，最后一个位置为 finalState。
   * 位置 i（1..steps.length）为应用 steps[i - 1] 后的状态。
   */
  at(traceIndex) {
    return stateAtImpl(this, traceIndex);
  }
  /** 整数范围 1..steps.length + 1；最后一个位置为终点。 */
  position(traceIndex) {
    return positionAtImpl(this, traceIndex);
  }
};

// src/impl/evaluation/index.ts
var Evaluation = class {
  constructor(evaluator) {
    this.evaluator = evaluator;
    const snapshots = this.snapshots;
    this.state = Object.freeze({
      get request() {
        return snapshots.getSnapshot().request;
      },
      get result() {
        return snapshots.getSnapshot().result;
      },
      get progress() {
        return snapshots.getSnapshot().progress;
      }
    });
  }
  evaluator;
  snapshots = createState(this.empty());
  controller = null;
  disposed = false;
  state;
  subscribe = this.snapshots.subscribe;
  execute(request) {
    if (this.disposed) return;
    const previous = this.controller;
    const controller = new AbortController();
    this.controller = controller;
    const active2 = () => !this.disposed && this.controller === controller && !controller.signal.aborted;
    previous?.abort();
    if (!active2()) return;
    this.publish({ request, result: { status: "pending" }, progress: null });
    if (!active2()) return;
    const finish = (result2) => {
      if (!active2()) return;
      this.controller = null;
      this.publish({ ...this.state, result: result2 });
    };
    try {
      const result2 = this.evaluator.compute({ request, report: (progress) => {
        if (active2()) this.publish({ ...this.state, progress });
      } }, { signal: controller.signal });
      void Promise.resolve(result2).then(
        (value) => finish({ status: "ready", value }),
        (error2) => finish({ status: "failed", error: error2 })
      );
    } catch (error2) {
      finish({ status: "failed", error: error2 });
    }
  }
  clear() {
    if (this.disposed) return;
    const previous = this.controller;
    this.controller = null;
    this.publish(this.empty());
    previous?.abort();
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const previous = this.controller;
    this.controller = null;
    previous?.abort();
  }
  empty() {
    return Object.freeze({ request: null, result: Object.freeze({ status: "ready", value: null }), progress: null });
  }
  publish(snapshot2) {
    this.snapshots.set(Object.freeze({ ...snapshot2, result: Object.freeze(snapshot2.result) }));
  }
};
function evaluationHandlers(evaluator) {
  const instances2 = /* @__PURE__ */ new WeakMap();
  const connected2 = /* @__PURE__ */ new WeakSet();
  return {
    create(_options, lifecycle) {
      const instance = new Evaluation(evaluator);
      instances2.set(instance.state, instance);
      lifecycle.onDispose(() => instance.dispose());
      lifecycle.dispatch({ type: "evaluation.init" });
      return instance.state;
    },
    init(state2, _event, { emit, onDispose }) {
      if (connected2.has(state2)) return;
      connected2.add(state2);
      const publish3 = () => emit({ type: "evaluation.changed", ...state2 });
      onDispose(instances2.get(state2).subscribe(publish3));
      publish3();
    },
    execute(state2, event2) {
      instances2.get(state2).execute(event2.request);
    },
    clear(state2) {
      instances2.get(state2).clear();
    }
  };
}

// src/api/model/evaluation.ts
function evaluation(evaluator) {
  const handlers = evaluationHandlers(evaluator);
  return stateful("evaluation", handlers.create, [
    on("evaluation.init", handlers.init, ["evaluation.changed"]),
    on("evaluation.execute", handlers.execute, []),
    on("evaluation.clear", handlers.clear, []),
    event("evaluation.init", {}),
    event("evaluation.execute", {}),
    event("evaluation.clear", {}),
    event("evaluation.changed", {})
  ]);
}

// src/impl/lean/index.ts
var evaluations = /* @__PURE__ */ new WeakMap();
var connected = /* @__PURE__ */ new WeakSet();
function createLean(options = {}, lifecycle) {
  const evaluation2 = new Evaluation(derivation("lean evaluation", ({ request, report }, context) => (options.runner ?? leanRunner).compute({ ...request, onProgress: (progress) => report(Object.freeze({ ...progress })) }, context)));
  const state2 = Object.freeze({
    get source() {
      return evaluation2.state.request?.source ?? null;
    },
    get result() {
      return evaluation2.state.result;
    },
    get progress() {
      return evaluation2.state.progress;
    }
  });
  evaluations.set(state2, evaluation2);
  lifecycle.onDispose(() => evaluation2.dispose());
  lifecycle.dispatch({ type: "lean.init" });
  return state2;
}
function initLean(state2, _event, { emit, onDispose }) {
  if (connected.has(state2)) return;
  connected.add(state2);
  onDispose(evaluations.get(state2).subscribe(() => emit({ type: "lean.changed", ...state2 })));
}
function executeLean(state2, { type: _type, ...request }) {
  evaluations.get(state2).execute(request);
}
function clearLean(state2) {
  evaluations.get(state2).clear();
}

// assets/lean/runtime.json
var runtime_default = {
  version: "62b6a2291302d4bbeace37642a066b7510d0145c-dlsym1-compact1",
  upstream: "https://lean.cau.li/lean-wasm",
  sha256: {
    "lean.js": "63aa7b004435f3d90cf19d7c3b3e3284726701ea06da8bc70b015125e1a38b24",
    "lean.wasm": "08d3ae8ee5dec8bae165ad5102e604eca016d74d2303e0b5748690df679a764e",
    "core-layer.json": "ff5146fffcaf09db2693c57842fe9828213d70c715418571f5330e2063647910",
    "core-lib/artifacts-000.pack": "69822644e0f084c38262d2984f9fdbf21d00f402f8b3cb695d8608bae3a1c96f",
    "core-lib/artifacts-001.pack": "19cf2b5f4b9bd30331e6f874ad9dc04d63eb2eb2983de7711194d458862b6ae6",
    "core-lib/artifacts-002.pack": "4937966f81105b48c306a05d76937a3823a2ccfe8fa4fc657d4c261bec21bbf1",
    "core-lib/artifacts-003.pack": "6b2ea32efe4b89a6049c50507054c8ecb472a084f81029151d3ab14cf8a5cf2c",
    "core-lib/artifacts-004.pack": "49be717d1cc641abaa5688bd1a72a771548f2af9c27e0132f7886d04e4c8d4c6"
  }
};

// src/impl/lean/worker.ts
function leanWorker() {
  const scope = globalThis;
  scope.onmessage = async ({ data: { source, assetBase } }) => {
    const send = (type, data) => scope.postMessage({ type, data });
    const progress = (value) => send("progress", value);
    const readBytes = async (name, report) => {
      const response = await fetch(new URL(name, assetBase));
      if (!response.ok || !response.body) throw new Error(`Lean ${name}: HTTP ${response.status}`);
      const size = response.headers.has("content-encoding") ? 0 : Number(response.headers.get("content-length"));
      const total = size > 0 ? size : void 0;
      const reader = response.body.getReader();
      const chunks = [];
      let loaded = 0, lastReport = 0;
      report(0, total);
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (performance.now() - lastReport >= 100) {
          report(loaded, total);
          lastReport = performance.now();
        }
      }
      report(loaded, loaded);
      return new Uint8Array(await new Blob(chunks).arrayBuffer());
    };
    try {
      progress({ phase: "library", completed: 0, unit: "bytes" });
      const response = await fetch(new URL("core-layer.json", assetBase));
      if (!response.ok) throw new Error(`Lean library: HTTP ${response.status}`);
      const manifest = await response.json();
      const files = [];
      const libraryBytes = manifest.packs.reduce((sum, pack) => sum + pack.compressedBytes, 0);
      let loadedBytes = 0;
      for (const pack of manifest.packs) {
        const compressed = await readBytes(`core-lib/${pack.file}`, (loaded) => {
          progress({ phase: "library", completed: loadedBytes + loaded, total: libraryBytes, unit: "bytes" });
        });
        loadedBytes += compressed.length;
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
        const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
        if (bytes.length !== pack.bytes) throw new Error(`Invalid Lean library pack: ${pack.file}`);
        for (const entry of pack.entries) files.push({ path: entry.path, data: bytes.subarray(entry.offset, entry.offset + entry.bytes) });
      }
      const binary = await readBytes("lean.wasm", (completed, total) => progress({ phase: "runtime", completed, total, unit: "bytes" }));
      const binaryUrl = URL.createObjectURL(new Blob([binary], { type: "application/wasm" }));
      progress({ phase: "compile" });
      Object.assign(scope, { Module: {
        noInitialRun: true,
        locateFile: (name) => name.endsWith(".wasm") ? binaryUrl : new URL(name, assetBase).href,
        mainScriptUrlOrBlob: new URL("lean.js", assetBase).href,
        print: (text) => send("stdout", text),
        printErr: (text) => send("stderr", text),
        onAbort: (message) => send("error", message),
        preRun: [() => {
          progress({ phase: "initialize", completed: 0, total: files.length, unit: "files" });
          const { FS, ENV } = scope.Module;
          ENV.LEAN_PATH = "/lib/lean";
          FS.mkdirTree("/lib/lean");
          FS.mkdirTree("/workspace");
          FS.mkdirTree("/bin");
          for (const [index, file] of files.entries()) {
            const path = `/lib/lean/${file.path}`;
            FS.mkdirTree(path.slice(0, path.lastIndexOf("/")));
            FS.writeFile(path, file.data);
            if ((index + 1) % 100 === 0 || index + 1 === files.length) {
              progress({ phase: "initialize", completed: index + 1, total: files.length, unit: "files" });
            }
          }
          files.length = 0;
          FS.writeFile("/workspace/input.lean", source);
          FS.chdir("/workspace");
        }],
        onRuntimeInitialized: () => {
          URL.revokeObjectURL(binaryUrl);
          progress({ phase: "check" });
          try {
            send("done", scope.Module.callMain(["--json", "/workspace/input.lean"]));
          } catch (error2) {
            if (error2 && typeof error2 === "object" && "status" in error2) send("done", error2.status);
            else send("error", String(error2));
          }
        }
      } });
      scope.importScripts(new URL("lean.js", assetBase).href);
    } catch (error2) {
      send("error", String(error2));
    }
  };
}

// src/impl/lean/runner.ts
function readLeanResult(result2) {
  const diagnostics = [];
  const output = [];
  for (const line of result2.stdout.split("\n")) {
    let value;
    try {
      value = JSON.parse(line);
    } catch {
      continue;
    }
    if (!value || typeof value !== "object" || !["information", "warning", "error"].includes(value.severity) || typeof value.data !== "string") {
      continue;
    }
    diagnostics.push({
      severity: value.severity,
      message: value.data,
      file: typeof value.fileName === "string" ? value.fileName : void 0,
      line: Number.isInteger(value.pos?.line) ? value.pos.line : null,
      column: Number.isInteger(value.pos?.column) ? value.pos.column + 1 : null,
      endLine: Number.isInteger(value.endPos?.line) ? value.endPos.line : void 0,
      endColumn: Number.isInteger(value.endPos?.column) ? value.endPos.column + 1 : void 0
    });
    if (value.severity === "information") output.push(value.data);
  }
  return {
    ...result2,
    stdout: output.join("\n"),
    diagnostics,
    stderr: result2.stderr.split("\n").filter((line) => !line.startsWith("[DEBUG:")).join("\n").trim(),
    exitCode: diagnostics.some((item) => item.severity === "error") ? 1 : result2.exitCode
  };
}
async function runLean(request, context) {
  if (!globalThis.crossOriginIsolated) {
    throw new Error("Lean \u9700\u8981\u8DE8\u6E90\u9694\u79BB\uFF1A\u8BF7\u4F7F\u7528 npm run dev\uFF0C\u6216\u4E3A\u9759\u6001\u7AD9\u70B9\u542F\u7528 COOP/COEP \u54CD\u5E94\u5934\u3002");
  }
  const signal = context?.signal;
  signal?.throwIfAborted();
  const url = URL.createObjectURL(new Blob([`(${leanWorker.toString()})()`], { type: "text/javascript" }));
  let worker;
  try {
    worker = new Worker(url);
    const active2 = worker;
    return await new Promise((resolve, reject) => {
      let stdout = "", stderr = "";
      let settled = false;
      const finish = (error2, exitCode = 0) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
        active2.terminate();
        if (error2) reject(error2);
        else resolve(readLeanResult({ stdout, stderr, exitCode }));
      };
      const abort = () => finish(signal?.reason ?? new Error("Lean cancelled"));
      const timer = setTimeout(() => finish(new Error("Lean \u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5\u3002")), request.timeoutMs ?? 18e4);
      signal?.addEventListener("abort", abort, { once: true });
      active2.onerror = (event2) => finish(new Error(event2.message));
      active2.onmessage = ({ data }) => {
        if (settled) return;
        if (data.type === "stdout") stdout += data.data + "\n";
        else if (data.type === "stderr") stderr += data.data + "\n";
        else if (data.type === "done") finish(void 0, Number(data.data) || 0);
        else if (data.type === "error") finish(new Error(data.data));
        else if (data.type === "progress") request.onProgress?.(data.data);
      };
      try {
        const base = request.assetBase ?? new URL(`./lean-wasm/${runtime_default.version}/`, import.meta.url).href;
        active2.postMessage({ source: request.source, assetBase: base.replace(/\/?$/, "/") });
      } catch (error2) {
        finish(error2);
      }
    });
  } finally {
    worker?.terminate();
    URL.revokeObjectURL(url);
  }
}

// src/api/model/lean.ts
var leanRunner = derivation("leanRunner", runLean);
var lean = stateful("lean", createLean, [
  on("lean.init", initLean, ["lean.changed"]),
  event("lean.init", {}),
  on("lean.execute", executeLean, []),
  event("lean.execute", {}),
  on("lean.clear", clearLean, []),
  event("lean.clear", {}),
  event("lean.run", {}),
  event("lean.reset", {}),
  event("lean.changed", {})
]);

// src/impl/learning-analysis/index.ts
var MAX_RESULT_BYTES = 256 * 1024;
var MAX_BASIS_WINDOWS = 64;
var MAX_RESULT_JSON_DEPTH = 32;
var MAX_RESULT_JSON_VALUES = 4096;
var MAX_ASSESSMENT_ITEMS = 8;
var MAX_ASSESSMENT_TEXT_LENGTH = 1024;
function object(value, label) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value;
}
function exact(value, fields, label) {
  const keys = Object.keys(value);
  if (keys.length !== fields.length || fields.some((field) => !(field in value))) {
    throw new TypeError(`${label} shape is invalid`);
  }
}
function string(value, label) {
  if (typeof value !== "string" || value.length === 0) throw new TypeError(`${label} must be a non-empty string`);
  return value;
}
function integer(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new TypeError(`${label} must be a positive integer`);
  return value;
}
function oneOf(value, values, label) {
  if (typeof value !== "string" || !values.includes(value)) throw new TypeError(`${label} is invalid`);
  return value;
}
function json(value, label, state2 = { seen: /* @__PURE__ */ new Set(), limited: false, values: 0 }, depth = 0) {
  if (state2.limited && depth > MAX_RESULT_JSON_DEPTH) {
    throw new TypeError(`${label} exceeds the maximum JSON depth`);
  }
  state2.values += 1;
  if (state2.limited && state2.values > MAX_RESULT_JSON_VALUES) {
    throw new TypeError(`${label} exceeds the maximum JSON value count`);
  }
  if (value === null || typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${label} must contain only finite numbers`);
    return value;
  }
  if (typeof value !== "object") throw new TypeError(`${label} must be a JSON value`);
  if (state2.seen.has(value)) throw new TypeError(`${label} must be an acyclic JSON value`);
  state2.seen.add(value);
  try {
    if (Array.isArray(value)) {
      return Object.freeze(value.map((item, index) => json(item, `${label}[${index}]`, state2, depth + 1)));
    }
    if (Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError(`${label} must contain only JSON objects`);
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, json(item, `${label}.${key}`, state2, depth + 1)])));
  } finally {
    state2.seen.delete(value);
  }
}
function boundedResult(value) {
  let encoded;
  try {
    encoded = JSON.stringify(value);
  } catch {
    return;
  }
  if (encoded !== void 0 && new TextEncoder().encode(encoded).byteLength > MAX_RESULT_BYTES) {
    throw new TypeError(`Result exceeds ${MAX_RESULT_BYTES} bytes`);
  }
}
function position(value, label) {
  const input = object(value, label);
  exact(input, ["logId", "recordId"], label);
  return Object.freeze({
    logId: string(input["logId"], `${label}.logId`),
    recordId: string(input["recordId"], `${label}.recordId`)
  });
}
function payload(value, label, limited = false) {
  const input = object(value, label);
  exact(input, ["schema", "version", "data"], label);
  return Object.freeze({
    schema: string(input["schema"], `${label}.schema`),
    version: integer(input["version"], `${label}.version`),
    data: json(input["data"], `${label}.data`, { seen: /* @__PURE__ */ new Set(), limited, values: 0 })
  });
}
function window2(value, label) {
  const input = object(value, label);
  exact(input, ["after", "through"], label);
  const after = input["after"] === null ? null : position(input["after"], `${label}.after`);
  const through = position(input["through"], `${label}.through`);
  if (after !== null && after.logId !== through.logId) throw new TypeError(`${label} spans different Logs`);
  return Object.freeze({ after, through });
}
function basis(value) {
  const input = object(value, "basis");
  exact(input, ["evidence"], "basis");
  if (!Array.isArray(input["evidence"])) throw new TypeError("basis.evidence must be an array");
  if (input["evidence"].length > MAX_BASIS_WINDOWS) {
    throw new TypeError(`basis.evidence must contain at most ${MAX_BASIS_WINDOWS} windows`);
  }
  return Object.freeze({
    evidence: Object.freeze(input["evidence"].map((item, index) => window2(item, `basis.evidence[${index}]`)))
  });
}
function analysis(value) {
  const input = object(value, "analysis");
  exact(input, ["key", "revision"], "analysis");
  return Object.freeze({
    key: string(input["key"], "analysis.key"),
    revision: string(input["revision"], "analysis.revision")
  });
}
function subject(value) {
  const input = object(value, "subject");
  const fields = input["exerciseKey"] === void 0 ? ["playgroundId", "versionId"] : ["playgroundId", "versionId", "exerciseKey"];
  exact(input, fields, "subject");
  return Object.freeze({
    playgroundId: string(input["playgroundId"], "subject.playgroundId"),
    versionId: string(input["versionId"], "subject.versionId"),
    ...input["exerciseKey"] === void 0 ? {} : { exerciseKey: string(input["exerciseKey"], "subject.exerciseKey") }
  });
}
function decodeLearningEvidenceData(value) {
  const input = object(value, "Evidence");
  const { recordedAt: _recordedAt, ...required } = input;
  exact(required, ["version", "type", "source", "subject", "payload"], "Evidence");
  if (input["version"] !== 1 || input["type"] !== "learning.evidence.recorded") {
    throw new TypeError("Evidence version or type is invalid");
  }
  const source = object(input["source"], "Evidence.source");
  exact(source, ["session", "sequence"], "Evidence.source");
  const recordedAt = input["recordedAt"];
  if (recordedAt !== void 0 && (typeof recordedAt !== "string" || Number.isNaN(Date.parse(recordedAt)))) {
    throw new TypeError("Evidence.recordedAt must be an ISO time");
  }
  return Object.freeze({
    version: 1,
    type: "learning.evidence.recorded",
    ...recordedAt === void 0 ? {} : { recordedAt },
    source: Object.freeze({
      session: string(source["session"], "Evidence.source.session"),
      sequence: integer(source["sequence"], "Evidence.source.sequence")
    }),
    subject: subject(input["subject"]),
    payload: payload(input["payload"], "Evidence.payload")
  });
}
function decodeLearningResultData(value) {
  boundedResult(value);
  const input = object(value, "Result");
  if (input["version"] !== 1) throw new TypeError("Result version is invalid");
  const common = {
    version: 1,
    jobKey: string(input["jobKey"], "Result.jobKey"),
    subject: subject(input["subject"]),
    analysis: analysis(input["analysis"]),
    basis: basis(input["basis"])
  };
  if (input["type"] === "learning.analysis.completed") {
    exact(input, ["version", "type", "jobKey", "subject", "analysis", "basis", "output"], "Result");
    return Object.freeze({
      ...common,
      type: "learning.analysis.completed",
      output: payload(input["output"], "Result.output", true)
    });
  }
  if (input["type"] === "learning.analysis.failed") {
    exact(input, ["version", "type", "jobKey", "subject", "analysis", "basis", "error"], "Result");
    const error2 = object(input["error"], "Result.error");
    exact(error2, ["code", "message"], "Result.error");
    return Object.freeze({
      ...common,
      type: "learning.analysis.failed",
      error: Object.freeze({
        code: string(error2["code"], "Result.error.code"),
        message: string(error2["message"], "Result.error.message")
      })
    });
  }
  throw new TypeError("Result type is invalid");
}
function topic(value, label) {
  const input = object(value, label);
  exact(input, ["key", "label"], label);
  return Object.freeze({
    key: assessmentText(input["key"], `${label}.key`),
    label: assessmentText(input["label"], `${label}.label`)
  });
}
function assessmentText(value, label) {
  const text = string(value, label);
  if ([...text].length > MAX_ASSESSMENT_TEXT_LENGTH) {
    throw new TypeError(`${label} must contain at most ${MAX_ASSESSMENT_TEXT_LENGTH} characters`);
  }
  return text;
}
function assessmentItems(value, label) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`);
  if (value.length > MAX_ASSESSMENT_ITEMS) {
    throw new TypeError(`${label} must contain at most ${MAX_ASSESSMENT_ITEMS} items`);
  }
  return value;
}
var FINDING_KINDS = [
  "strength",
  "difficulty",
  "misconception",
  "strategy",
  "progress",
  "uncertain"
];
function finding(value, index) {
  const label = `assessment.findings[${index}]`;
  const input = object(value, label);
  exact(input, ["kind", "topic", "claim", "confidence"], label);
  return Object.freeze({
    kind: oneOf(input["kind"], FINDING_KINDS, `${label}.kind`),
    topic: topic(input["topic"], `${label}.topic`),
    claim: assessmentText(input["claim"], `${label}.claim`),
    confidence: oneOf(input["confidence"], ["low", "medium", "high"], `${label}.confidence`)
  });
}
function recommendation(value, index) {
  const label = `assessment.recommendations[${index}]`;
  const input = object(value, label);
  exact(input, ["action", "topic", "priority", "rationale"], label);
  return Object.freeze({
    action: oneOf(input["action"], ["explain", "practice", "review", "challenge"], `${label}.action`),
    topic: topic(input["topic"], `${label}.topic`),
    priority: oneOf(input["priority"], ["now", "soon", "later"], `${label}.priority`),
    rationale: assessmentText(input["rationale"], `${label}.rationale`)
  });
}
function decodeLearningAssessment(value) {
  const input = payload(value, "assessment payload", true);
  if (input.schema !== "learning.assessment" || input.version !== 1) {
    throw new TypeError("assessment schema or version is invalid");
  }
  const data = object(input.data, "assessment");
  exact(data, ["summary", "findings", "recommendations", "limitations"], "assessment");
  const findings = assessmentItems(data["findings"], "assessment.findings");
  const recommendations = assessmentItems(data["recommendations"], "assessment.recommendations");
  const limitations = assessmentItems(data["limitations"], "assessment.limitations");
  return Object.freeze({
    summary: assessmentText(data["summary"], "assessment.summary"),
    findings: Object.freeze(findings.map(finding)),
    recommendations: Object.freeze(recommendations.map(recommendation)),
    limitations: Object.freeze(limitations.map((item, index) => assessmentText(item, `assessment.limitations[${index}]`)))
  });
}

// src/api/model/learning-analysis.ts
function decodeLearningEvidenceData2(value) {
  return decodeLearningEvidenceData(value);
}
function decodeLearningResultData2(value) {
  return decodeLearningResultData(value);
}
function decodeLearningAssessment2(payload2) {
  return decodeLearningAssessment(payload2);
}

// src/impl/log/index.ts
var logs = /* @__PURE__ */ new WeakMap();
function freeze(value) {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function capture(value) {
  return freeze(JSON.parse(JSON.stringify(value, (_key, value2) => {
    if (value2 === void 0) return null;
    if (typeof value2 === "bigint" || typeof value2 === "number" && !Number.isFinite(value2)) return String(value2);
    if (typeof value2 === "function" || typeof value2 === "symbol") throw new TypeError("Unsupported log value");
    if (value2 instanceof Error) return { name: value2.name, message: value2.message, stack: value2.stack };
    return value2;
  })));
}
function createLog(options = {}, lifecycle) {
  const records = [];
  const state2 = createState(null);
  const session = options.session ?? crypto.randomUUID();
  if (!session) throw new Error("Log session must not be empty");
  const result2 = Object.freeze({
    get session() {
      return logs.get(result2).session;
    },
    getSnapshot: state2.getSnapshot,
    subscribe: state2.subscribe,
    read(after = 0) {
      if (!Number.isSafeInteger(after) || after < 0) throw new RangeError("Invalid log cursor");
      return Object.freeze(records.slice(after));
    }
  });
  logs.set(result2, { session, records, state: state2, context: Object.freeze({ ...options.context }), now: options.now ?? Date.now, pending: /* @__PURE__ */ new Map(), timer: null, deadline: 0, emit: () => {
  }, disposed: false, initialized: false });
  lifecycle.onDispose(() => {
    try {
      flushLog(result2);
    } finally {
      logs.get(result2).disposed = true;
    }
  });
  return result2;
}
function timeOf(log2) {
  const time = logs.get(log2).now();
  if (!Number.isFinite(time) || time < 0) throw new RangeError("Invalid log time");
  return time;
}
function append2(log2, value) {
  const { records, state: state2, context, emit } = logs.get(log2);
  const record = Object.freeze({
    version: 1,
    session: log2.session,
    context,
    sequence: records.length + 1,
    ...value
  });
  records.push(record);
  state2.set(record);
  emit({ type: "log.appended", record });
}
function initLog(log2, _event, { emit }) {
  const local = logs.get(log2);
  if (local.initialized) return;
  local.initialized = true;
  local.emit = emit;
}
function recordLog(log2, event2) {
  if (event2.kind === "initial") {
    const data = capture(event2.data), time2 = timeOf(log2);
    flushLog(log2);
    append2(log2, { time: time2, source: event2.source, kind: event2.kind, data });
    return;
  }
  const changes = event2.changes.map((change2) => ({
    path: Object.freeze([...change2.path]),
    before: capture(change2.before),
    after: capture(change2.after)
  }));
  const time = timeOf(log2), local = logs.get(log2);
  if (local.timer !== null && performance.now() >= local.deadline) flushLog(log2);
  const key = JSON.stringify([event2.source, event2.operation]);
  const pending2 = local.pending.get(key) ?? { source: event2.source, operation: event2.operation, time, changes: /* @__PURE__ */ new Map() };
  pending2.time = time;
  for (const change2 of changes) {
    const path = JSON.stringify(change2.path), previous = pending2.changes.get(path);
    pending2.changes.set(path, { ...change2, before: previous ? previous.before : change2.before });
  }
  local.pending.delete(key);
  local.pending.set(key, pending2);
  if (local.timer === null) {
    local.deadline = performance.now() + 1e3;
    local.timer = setTimeout(() => flushLog(log2), 1e3);
  }
}
function flushLog(log2) {
  const local = logs.get(log2);
  if (local.disposed) return;
  if (local.timer !== null) clearTimeout(local.timer);
  local.timer = null;
  const pending2 = [...local.pending.values()];
  local.pending.clear();
  const errors = [];
  for (const item of pending2) {
    try {
      append2(log2, {
        source: item.source,
        operation: item.operation,
        time: item.time,
        kind: "change",
        data: freeze({ changes: [...item.changes.values()] })
      });
    } catch (error2) {
      errors.push(error2);
    }
  }
  if (errors.length) throw new AggregateError(errors, "Log subscribers failed during flush");
}
function reconfigLog(log2, event2) {
  const local = logs.get(log2);
  const options = event2.options;
  if (options.session !== void 0 && !options.session) throw new Error("Log session must not be empty");
  if (options.session !== void 0 && options.session !== local.session && (local.records.length || local.pending.size)) throw new Error("Cannot change an active log session");
  flushLog(log2);
  if (options.session !== void 0) local.session = options.session;
  if (options.context !== void 0) local.context = Object.freeze({ ...options.context });
  if (options.now !== void 0) local.now = options.now;
}

// src/api/model/log.ts
var log = stateful("log", createLog, [
  on("log.reconfig", reconfigLog, ["log.appended"]),
  event("log.reconfig", {}),
  on("log.init", initLog, ["log.appended"]),
  on("log.record", recordLog, ["log.appended"]),
  on("log.flush", flushLog, ["log.appended"]),
  event("log.init", {}),
  event("log.record", {}),
  event("log.flush", {}),
  event("log.appended", {})
]);

// src/impl/python-runtime.ts
import { loadPyodide } from "./libs/pyodide.js";

// src/impl/runner/pyodideBases.ts
function pyodideBases(scope) {
  if (Array.isArray(scope.__PICO_PYODIDE_BASES__)) {
    return scope.__PICO_PYODIDE_BASES__.filter(
      (base) => typeof base === "string" && base.length > 0
    );
  }
  const single = scope.__PICO_PYODIDE_BASE__;
  return typeof single === "string" && single.length > 0 ? [single] : [];
}
var SOURCE_TIMEOUT_MS = 2e4;
async function loadFirstPyodide(bases, load, timeoutMs = SOURCE_TIMEOUT_MS) {
  if (bases.length === 0) return await load(void 0);
  let last;
  for (const [index, base] of bases.entries()) {
    let timer;
    try {
      const work = load(base);
      if (index === bases.length - 1) return await work;
      return await Promise.race([
        work,
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`${timeoutMs} ms \u5185\u6CA1\u6709\u4ECE ${base} \u52A0\u8F7D\u5B8C`)),
            timeoutMs
          );
        })
      ]);
    } catch (error2) {
      console.warn(`Pyodide \u4ECE ${base} \u52A0\u8F7D\u5931\u8D25\uFF0C\u6539\u7528\u4E0B\u4E00\u4E2A\u6765\u6E90`, error2);
      last = error2;
    } finally {
      clearTimeout(timer);
    }
  }
  throw last;
}

// src/impl/python-runtime.ts
var pending;
function pythonRuntime() {
  pending ??= loadFirstPyodide(
    pyodideBases(globalThis),
    (base) => base === void 0 ? loadPyodide() : loadPyodide({ indexURL: base })
  ).catch((error2) => {
    pending = void 0;
    throw error2;
  });
  return pending;
}
async function preloadPython() {
  await pythonRuntime();
}

// src/impl/analyzer/syntax.ts
import { pythonLanguage } from "./libs/codemirror.js";
function children(node2) {
  const result2 = [];
  for (let child2 = node2.firstChild; child2 !== null; child2 = child2.nextSibling) result2.push(child2);
  return result2;
}
function lineStarts(source) {
  const starts = [0];
  for (let i = 0; i < source.length; i += 1) {
    if (source.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}
function lineOf(starts, offset) {
  let low = 0;
  let high = starts.length;
  while (low + 1 < high) {
    const middle = low + high >> 1;
    if (starts[middle] <= offset) low = middle;
    else high = middle;
  }
  return low + 1;
}
function syntaxErrorsOf(source, tree, starts) {
  const findings = [];
  const visit = (node2) => {
    if (node2.name === "\u26A0") {
      const snippet = source.slice(node2.from, Math.min(node2.to, node2.from + 12)).trim();
      findings.push({
        kind: "line",
        message: snippet === "" ? "\u8FD9\u91CC\u6709\u8BED\u6CD5\u9519\u8BEF" : `\u8BED\u6CD5\u9519\u8BEF\uFF1A${snippet}\u2026`,
        line: lineOf(starts, node2.from)
      });
      return;
    }
    for (const child2 of children(node2)) visit(child2);
  };
  visit(tree);
  return Object.freeze(findings);
}
function controlFlowOf(tree, starts) {
  const lineAt = (offset) => lineOf(starts, offset);
  function structuresWithin(node2) {
    const structures = [];
    for (const child2 of children(node2)) {
      if (child2.name === "ForStatement" || child2.name === "WhileStatement") {
        const body = children(child2).find((part) => part.name === "Body");
        if (body === void 0) continue;
        const loop = Object.freeze({
          kind: "loop",
          line: lineAt(child2.from),
          endLine: lineAt(Math.max(body.from, body.to - 1)),
          body: structuresWithin(body)
        });
        structures.push(loop);
      } else if (child2.name === "IfStatement") {
        const parts = children(child2);
        const arms = [];
        let armStart = child2;
        for (const part of parts) {
          if (part.name === "if" || part.name === "elif" || part.name === "else") armStart = part;
          if (part.name !== "Body") continue;
          arms.push(Object.freeze({
            index: arms.length,
            line: lineAt(armStart.from),
            endLine: lineAt(Math.max(part.from, part.to - 1)),
            body: structuresWithin(part)
          }));
        }
        const branch = Object.freeze({ kind: "branch", line: lineAt(child2.from), arms: Object.freeze(arms) });
        structures.push(branch);
      } else {
        structures.push(...structuresWithin(child2));
      }
    }
    return Object.freeze(structures);
  }
  return structuresWithin(tree);
}
function analyzeSyntax({ code: source }) {
  const tree = pythonLanguage.parser.parse(source).topNode;
  const starts = lineStarts(source);
  const syntaxErrors = syntaxErrorsOf(source, tree, starts);
  return Object.freeze({
    syntaxErrors,
    controlFlow: syntaxErrors.length === 0 ? controlFlowOf(tree, starts) : Object.freeze([])
  });
}

// src/impl/linker/runtime.py
var runtime_default2 = 'import builtins\nimport contextlib\nimport io\nimport json\nimport os\nimport sys\nimport time\nimport traceback\n\n\n_TRACE_RESOURCES = {}\n\n\ndef register_trace_resource(name, records):\n    """Register a live append-only sequence; snapshots store only its length."""\n    key, suffix = name, 1\n    while key in _TRACE_RESOURCES:\n        key = f"{name}:{suffix}"\n        suffix += 1\n    _TRACE_RESOURCES[key] = records\n    return key\n\n\nclass _PicoProgramFinished(BaseException):\n    """Successful terminal operation, separate from user errors and resource limits."""\n\n\ndef finish():\n    raise _PicoProgramFinished()\n\n\n# JSON \u8FB9\u754C\u5916\u7684\u503C\u76F4\u63A5\u8DF3\u8FC7\uFF08\u51FD\u6570\u3001set\u3001nan\u2026\u2026\u4E0D\u51FA\u73B0\u5728\u53D8\u91CF\u9762\u677F\uFF09\uFF0C\u9519\u8BEF\u4E0D\u4F20\u64AD\u5230 RunResult\u3002\n# JS \u5B89\u5168\u6574\u6570\uFF08\xB12^53-1\uFF09\u4E4B\u5916\u7684 int \u4F1A\u88AB JSON.parse \u6EA2\u51FA\u6216\u4E22\u7CBE\u5EA6\uFF0C\u540C\u6837\u6309\u4E0D\u53EF\u5E8F\u5217\u5316\u5904\u7406\u3002\n_SAFE_INT = 2 ** 53 - 1\n_MISSING = object()\n\n\ndef _json_value(value):\n    if isinstance(value, int) and not isinstance(value, bool) and not -_SAFE_INT <= value <= _SAFE_INT:\n        return _MISSING\n    try:\n        encoded = json.dumps(value, allow_nan=False)\n    except (OverflowError, RecursionError, TypeError, ValueError):\n        return _MISSING\n    return json.loads(encoded)\n\n\ndef _variables(values):\n    result = {}\n    for name, value in values.items():\n        if name.startswith("__"):\n            continue\n        encoded = _json_value(value)\n        if encoded is not _MISSING:\n            result[name] = encoded\n    return result\n\n\ndef _source_frames(frame, source_filename):\n    frames = []\n    while frame is not None:\n        if frame.f_code.co_filename == source_filename:\n            frames.append(\n                {\n                    "name": frame.f_code.co_name,\n                    "locals": _variables(frame.f_locals),\n                }\n            )\n        frame = frame.f_back\n    frames.reverse()\n    return frames\n\n\ndef _snapshot(line, frame, environment, stdout, stderr, observe, source_filename):\n    state = {\n        "line": line,\n        "stdout": stdout.getvalue(),\n        "stderr": stderr.getvalue(),\n    }\n    if _TRACE_RESOURCES:\n        state["resources"] = {name: len(records) for name, records in _TRACE_RESOURCES.items()}\n    if observe is not None and observe.get("globals"):\n        state["globals"] = _variables(environment)\n    if observe is not None and observe.get("locals"):\n        state["frames"] = _source_frames(frame, source_filename) if frame is not None else []\n    return state\n\n\ndef _frame_changes(before, after):\n    changes = []\n    before_names = [frame["name"] for frame in before]\n    after_names = [frame["name"] for frame in after]\n    if len(after) == len(before) + 1 and before_names == after_names[:-1]:\n        for index, (old_frame, new_frame) in enumerate(zip(before, after)):\n            frame_index = -1 if index == len(before) - 1 else index\n            changes.extend(\n                _changes(old_frame["locals"], new_frame["locals"], ("frames", frame_index, "locals"))\n            )\n        changes.append({"op": "append", "path": ["frames"], "value": after[-1]})\n        return changes\n    if len(before) == len(after) + 1 and before_names[:-1] == after_names:\n        changes.append({"op": "remove", "path": ["frames", -1]})\n        for index, (old_frame, new_frame) in enumerate(zip(before, after)):\n            frame_index = -1 if index == len(after) - 1 else index\n            changes.extend(\n                _changes(old_frame["locals"], new_frame["locals"], ("frames", frame_index, "locals"))\n            )\n        return changes\n    if len(before) != len(after) or before_names != after_names:\n        return [{"op": "put", "path": ["frames"], "value": after}]\n    for index, (old_frame, new_frame) in enumerate(zip(before, after)):\n        frame_index = -1 if index == len(after) - 1 else index\n        changes.extend(\n            _changes(\n                old_frame["locals"],\n                new_frame["locals"],\n                ("frames", frame_index, "locals"),\n            )\n        )\n    return changes\n\n\ndef _changes(before, after, path=()):\n    if path == ("frames",) and isinstance(before, list) and isinstance(after, list):\n        return _frame_changes(before, after)\n    if isinstance(before, dict) and isinstance(after, dict):\n        # \u540C\u4E00\u6B21\u91C7\u6837\u95F4\u53EF\u80FD\u5220\u6389\u518D\u521B\u5EFA\u540C\u540D\u952E\uFF1B\u666E\u901A put \u4E0D\u4F1A\u6539\u53D8\u5DF2\u6709\u952E\u7684\u4F4D\u7F6E\u3002\n        retained = [key for key in before if key in after]\n        added = [key for key in after if key not in before]\n        if retained + added != list(after):\n            return [{"op": "put", "path": list(path), "value": after}]\n        changes = []\n        for key in before:\n            if key not in after:\n                changes.append({"op": "remove", "path": [*path, key]})\n        for key in after:\n            if key not in before:\n                changes.append({"op": "put", "path": [*path, key], "value": after[key]})\n            else:\n                changes.extend(_changes(before[key], after[key], (*path, key)))\n        return changes\n    if before == after:\n        return []\n    if path in (("stdout",), ("stderr",)) and isinstance(before, str) and after.startswith(before):\n        return [{"op": "append", "path": list(path), "value": after[len(before) :]}]\n    return [{"op": "put", "path": list(path), "value": after}]\n\n\nclass _PicoRunLimit(BaseException):\n    """runner \u65BD\u52A0\u7684\u8FD0\u884C\u9650\u5236\u4E2D\u6B62\uFF08\u8D85\u65F6 / \u6B65\u6570\u8D85\u9650\uFF09\uFF0Cmessage \u76F4\u63A5\u9762\u5411\u5B66\u751F\u3002\n    \u7EE7\u627F BaseException\uFF1A\u5B66\u751F\u4EE3\u7801\u7684 except Exception \u4E0D\u80FD\u541E\u6389\u8FD0\u884C\u63A7\u5236\u6D41\u3002"""\n\n\nclass _PicoWaitingForInput(BaseException):\n    """interactive stdin \u7F13\u51B2\u8017\u5C3D\uFF1A\u672C\u6B21\u8FD0\u884C\u505C\u5728 input()\uFF0C\u8C03\u7528\u65B9\u8865\u4E00\u884C\u540E\u4ECE\u5934\u91CD\u8DD1\u3002"""\n\n\ndef _trace(samples, events, observe, environment, stdout, stderr, source_filename, deadline, max_steps):\n    def trace(frame, event, _argument):\n        if deadline[0] is not None and time.monotonic() >= deadline[0]:\n            raise _PicoRunLimit("\u7A0B\u5E8F\u8FD0\u884C\u8D85\u65F6")\n        # single-step \u8BED\u4E49\uFF1A\u4E00\u6B65 = \u8C03\u8BD5\u5668\u505C\u5728\u5B66\u751F\u4EE3\u7801\u91CC\u7684\u4E00\u4E2A\u843D\u70B9\u3002\n        # stmt \u505C\u5728\u5F53\u524D\u6E90\u7801\u5E27\uFF1Bcall \u505C\u5728\u88AB\u8C03\u6E90\u7801\u5E27\uFF08\u6A21\u5757\u5165\u53E3\u7B2C 0 \u884C\u4E0D\u6210\u6B65\uFF09\uFF1B\n        # return \u505C\u5728\u843D\u70B9\u5E27\uFF08f_back\uFF09\u2014\u2014\u843D\u56DE driver/\u8FD0\u884C\u5E93\u7684\u8FD4\u56DE\u5BF9\u5B66\u751F\u4E0D\u53EF\u89C1\uFF0C\u4E0D\u6784\u6210\u6B65\u3002\n        step_event = {"line": "stmt", "call": "call", "return": "return"}.get(event)\n        step_frame = None\n        if step_event in events and frame.f_code.co_filename == source_filename:\n            step_frame = frame\n            if step_event == "call" and frame.f_lineno < 1:\n                step_frame = None\n            elif step_event == "return":\n                landing = frame.f_back\n                if landing is None or landing.f_code.co_filename != source_filename:\n                    step_frame = None\n                else:\n                    step_frame = landing\n        if step_frame is not None:\n            if max_steps is not None and len(samples) >= max_steps:\n                raise _PicoRunLimit("\u7A0B\u5E8F\u6B65\u6570\u8D85\u8FC7\u4E0A\u9650")\n            samples.append(\n                (\n                    step_event,\n                    _snapshot(\n                        step_frame.f_lineno,\n                        step_frame,\n                        environment,\n                        stdout,\n                        stderr,\n                        observe,\n                        source_filename,\n                    ),\n                )\n            )\n        return trace\n\n    return trace\n\n\ndef _source_line(exception, source_filename):\n    line = None\n    current = exception.__traceback__\n    while current is not None:\n        if current.tb_frame.f_code.co_filename == source_filename:\n            line = current.tb_lineno\n        current = current.tb_next\n    return line\n\n\ndef _is_program_exception(exception, source_filename):\n    if isinstance(exception, SyntaxError):\n        return exception.filename == source_filename\n    return _source_line(exception, source_filename) is not None\n\n\ndef _program_error(exception, source_filename, stderr):\n    if isinstance(exception, SyntaxError):\n        traceback.print_exception(exception, file=stderr)\n        return {\n            "returncode": 1,\n            "error": {"message": str(exception), "line": exception.lineno},\n        }\n    if isinstance(exception, SystemExit):\n        code = exception.code\n        if code is None or code == 0:\n            return {"returncode": 0, "error": None}\n        if not isinstance(code, int):\n            print(code, file=stderr)\n            code = 1\n        return {\n            "returncode": code,\n            "error": {"message": f"\u7A0B\u5E8F\u4EE5\u72B6\u6001\u7801 {code} \u9000\u51FA", "line": None},\n        }\n    traceback.print_exception(exception, file=stderr)\n    return {\n        "returncode": 1,\n        "error": {\n            "message": f"{type(exception).__name__}: {exception}",\n            "line": _source_line(exception, source_filename),\n        },\n    }\n\n\ndef _builtins_for(stdin_config, stdout):\n    values = vars(builtins).copy()\n    if stdin_config["kind"] == "interactive":\n        # input() \u8BFB\u7F13\u51B2\u7684\u4E0B\u4E00\u884C\uFF1B\u8017\u5C3D\u5373\u4E2D\u6B62\u672C\u6B21\u8FD0\u884C\uFF08waiting\uFF09\uFF0Cprompt \u7167\u5E38\u56DE\u663E\uFF0C\n        # \u8BA9\u91CD\u8DD1\u540E\u7684 stdout \u4E0E\u771F\u7EC8\u7AEF\u4E00\u81F4\u3002\n        def interactive_input(prompt=""):\n            text = str(prompt)\n            stdout.write(text)\n            line = sys.stdin.readline()\n            if line == "":\n                raise _PicoWaitingForInput(text)\n            if not line.endswith("\\n"):\n                line += "\\n"\n            return line[:-1]\n\n        values["input"] = interactive_input\n    return values\n\n\ndef _trace_result(samples, initial_state, final_state):\n    steps = []\n    previous = initial_state\n    for event, sample in samples:\n        steps.append({"event": event, "changes": _changes(previous, sample)})\n        previous = sample\n    return {\n        "initialState": initial_state,\n        "steps": steps,\n        "finalState": final_state,\n        "resources": {name: list(records) for name, records in _TRACE_RESOURCES.items()},\n    }\n\n\ndef run(source_path, config_json):\n    _TRACE_RESOURCES.clear()\n    config = json.loads(config_json)\n    run_options = {}\n    if os.path.exists("_pico_run.json"):\n        with open("_pico_run.json", encoding="utf-8") as run_file:\n            run_options = json.load(run_file)\n    stdin_config = run_options.get("stdin") or {"kind": "string", "value": ""}\n    trace_options = run_options.get("trace") or {"events": [], "observe": None}\n    events = frozenset(trace_options["events"])\n    observe = trace_options["observe"]\n    deadline = [\n        time.monotonic() + run_options["timeoutMs"] / 1000\n        if run_options.get("timeoutMs") is not None\n        else None\n    ]\n    max_steps = run_options.get("maxTraceSteps")\n\n    stdout = io.StringIO()\n    stderr = io.StringIO()\n    stdin = io.StringIO(stdin_config["value"])\n    source_filename = source_path\n    with open(source_path, encoding="utf-8", newline="") as source_file:\n        source = source_file.read()\n\n    environment = {\n        "__builtins__": _builtins_for(stdin_config, stdout),\n        "__file__": source_filename,\n        "__name__": "__main__",\n    }\n    samples = []\n    tracer = _trace(samples, events, observe, environment, stdout, stderr, source_filename, deadline, max_steps)\n    old_stdin = sys.stdin\n    outcome = None\n\n    try:\n        sys.stdin = stdin\n        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):\n            if config["prelude"]:\n                exec(compile(config["prelude"], "<pico-prelude>", "exec"), environment, environment)\n            initial_state = _snapshot(None, None, environment, stdout, stderr, observe, source_filename)\n            try:\n                if events or deadline[0] is not None:\n                    sys.settrace(tracer)\n                exec(compile(source, source_filename, "exec"), environment, environment)\n                if config["driver"]:\n                    exec(compile(config["driver"], "<pico-driver>", "exec"), environment, environment)\n            except _PicoProgramFinished:\n                outcome = {"returncode": 0, "error": None}\n            except _PicoRunLimit as limit:\n                print(str(limit), file=stderr)\n                outcome = {\n                    "returncode": 124,\n                    "error": {\n                        "message": str(limit),\n                        "line": _source_line(limit, source_filename),\n                    },\n                }\n            except _PicoWaitingForInput as waiting:\n                outcome = {\n                    "returncode": 0,\n                    "error": None,\n                    "waiting": {"prompt": str(waiting)},\n                }\n            except BaseException as exception:\n                if not _is_program_exception(exception, source_filename):\n                    raise\n                outcome = _program_error(exception, source_filename, stderr)\n            finally:\n                sys.settrace(None)\n    finally:\n        sys.stdin = old_stdin\n\n    if outcome is None:\n        outcome = {"returncode": 0, "error": None}\n    final_state = _snapshot(None, None, environment, stdout, stderr, observe, source_filename)\n    trace = _trace_result(samples, initial_state, final_state)\n    result = {\n        "trace": trace,\n        "returncode": outcome["returncode"],\n        "error": outcome["error"],\n        "waiting": outcome.get("waiting"),\n    }\n    return json.dumps(result, ensure_ascii=False, separators=(",", ":"), allow_nan=False)\n';

// src/impl/linker/impl.ts
function linkProgramImpl({ code: source, prelude, driver, files }) {
  const config = JSON.stringify({
    prelude,
    driver
  });
  const main = [
    "import _pico_runtime as _pico",
    `__pico_result__ = _pico.run("source.py", ${JSON.stringify(config)})`,
    ""
  ].join("\n");
  for (const path of Object.keys(files)) {
    if (["main.py", "source.py", "_pico_runtime.py"].includes(path)) {
      throw new Error(`\u9644\u52A0\u6587\u4EF6\u4E0D\u80FD\u8986\u76D6 ${path}`);
    }
  }
  return Object.freeze({
    ...files,
    "main.py": main,
    "source.py": source,
    "_pico_runtime.py": runtime_default2
  });
}

// src/impl/runner/runner.ts
var queue = Promise.resolve();
var runId = 0;
function projectCopy(files) {
  if (!Object.hasOwn(files, "main.py")) throw new Error("Files \u7F3A\u5C11 main.py");
  const project = {};
  for (const [path, contents] of Object.entries(files)) {
    const parts = path.split("/");
    if (path === "" || path.startsWith("/") || path.includes("\\") || parts.some((part) => part === "" || part === "." || part === "..")) {
      throw new Error(`Files path \u5FC5\u987B\u662F\u5B89\u5168\u7684\u76F8\u5BF9 POSIX \u8DEF\u5F84: ${path}`);
    }
    if (typeof contents !== "string") throw new TypeError(`Files \u5185\u5BB9\u5FC5\u987B\u662F\u5B57\u7B26\u4E32: ${path}`);
    project[path] = contents;
  }
  return Object.freeze(project);
}
function removeTree(runtime, path) {
  for (const name of runtime.FS.readdir(path)) {
    if (name === "." || name === "..") continue;
    const child2 = `${path}/${name}`;
    if (runtime.FS.isDir(runtime.FS.stat(child2).mode)) removeTree(runtime, child2);
    else runtime.FS.unlink(child2);
  }
  runtime.FS.rmdir(path);
}
function numericOptions(options) {
  if (options === void 0) return;
  for (const name of ["timeoutMs", "maxTraceSteps"]) {
    const value = options[name];
    if (value !== void 0 && (!Number.isInteger(value) || value < 1)) {
      throw new TypeError(`PythonRunOptions.${name} \u5FC5\u987B\u662F\u6B63\u6574\u6570: ${value}`);
    }
  }
}
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isJson(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJson);
  return isRecord(value) && Object.values(value).every(isJson);
}
function variables(value) {
  return isRecord(value) && Object.values(value).every(isJson) ? value : void 0;
}
function frame(value) {
  if (!isRecord(value) || typeof value.name !== "string") return void 0;
  const locals = variables(value.locals);
  return locals === void 0 ? void 0 : value;
}
function state(value) {
  if (!isRecord(value) || !(value.line === null || Number.isInteger(value.line))) return void 0;
  if (value.resources !== void 0 && (!isRecord(value.resources) || !Object.values(value.resources).every((cursor) => Number.isSafeInteger(cursor) && cursor >= 0))) return void 0;
  if (value.stdout !== void 0 && typeof value.stdout !== "string") return void 0;
  if (value.stderr !== void 0 && typeof value.stderr !== "string") return void 0;
  if (value.globals !== void 0 && variables(value.globals) === void 0) return void 0;
  if (value.frames !== void 0 && (!Array.isArray(value.frames) || !value.frames.every((item) => frame(item)))) {
    return void 0;
  }
  return value;
}
function change(value) {
  if (!isRecord(value) || !["append", "remove", "put"].includes(String(value.op))) return void 0;
  if (!Array.isArray(value.path) || !value.path.every((part) => typeof part === "string" || Number.isInteger(part))) {
    return void 0;
  }
  if (value.op === "remove") return value;
  return isJson(value.value) ? value : void 0;
}
var TRACE_EVENTS = ["call", "return", "stmt"];
function step(value) {
  return isRecord(value) && TRACE_EVENTS.includes(value.event) && Array.isArray(value.changes) && value.changes.every((item) => change(item)) ? value : void 0;
}
function trace(value) {
  if (!isRecord(value)) return void 0;
  const initialState = state(value.initialState);
  const finalState = state(value.finalState);
  if (initialState === void 0 || finalState === void 0 || !Array.isArray(value.steps) || !value.steps.every((item) => step(item))) {
    return void 0;
  }
  const resources = value.resources ?? {};
  if (!isRecord(resources) || !Object.values(resources).every((log2) => Array.isArray(log2) && log2.every(isJson))) return void 0;
  for (const sample of [initialState, finalState]) {
    for (const [name, cursor] of Object.entries(sample.resources ?? {})) {
      if (!Array.isArray(resources[name]) || cursor > resources[name].length) return void 0;
    }
  }
  return new Trace({ initialState, steps: value.steps, finalState, resources });
}
function error(value) {
  return isRecord(value) && typeof value.message === "string" && (value.line === null || Number.isInteger(value.line)) ? value : void 0;
}
function waiting(value) {
  return isRecord(value) && typeof value.prompt === "string" ? { prompt: value.prompt } : null;
}
function result(serialized) {
  if (typeof serialized !== "string") throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u6CA1\u6709\u8FD4\u56DE\u7ED3\u679C");
  const value = JSON.parse(serialized);
  if (!isRecord(value)) throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u8FD4\u56DE\u4E86\u65E0\u6548 PythonResult");
  const parsedTrace = trace(value.trace);
  if (parsedTrace === void 0 || !Number.isInteger(value.returncode)) {
    throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u8FD4\u56DE\u4E86\u65E0\u6548 PythonResult");
  }
  const failed = value.error !== null && value.error !== void 0;
  if (failed === (value.returncode === 0) || failed && error(value.error) === void 0) {
    throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u8FD4\u56DE\u4E86\u65E0\u6548 PythonResult");
  }
  const parsedWaiting = waiting(value.waiting);
  if (parsedWaiting !== null && (failed || value.returncode !== 0)) {
    throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u8FD4\u56DE\u4E86\u65E0\u6548 PythonResult");
  }
  return deepFreeze({
    trace: parsedTrace,
    returncode: value.returncode,
    error: failed ? value.error : null,
    waiting: parsedWaiting
  });
}
async function execute(files, options, signal) {
  const runtime = await pythonRuntime();
  signal?.throwIfAborted();
  const directory = `/tmp/pico-run-${runId++}`;
  runtime.FS.mkdirTree(directory);
  try {
    for (const [path, contents] of Object.entries(files)) {
      const slash = path.lastIndexOf("/");
      if (slash !== -1) runtime.FS.mkdirTree(`${directory}/${path.slice(0, slash)}`);
      runtime.FS.writeFile(`${directory}/${path}`, contents);
    }
    if (options !== void 0) {
      runtime.FS.writeFile(`${directory}/_pico_run.json`, JSON.stringify({
        stdin: typeof options.stdin === "string" || options.stdin === void 0 ? { kind: "string", value: options.stdin ?? "" } : options.stdin,
        trace: options.trace ?? null,
        timeoutMs: options.timeoutMs ?? null,
        maxTraceSteps: options.maxTraceSteps ?? null
      }));
    }
    const serialized = await runtime.runPythonAsync(`
import os as _pico_os
import sys as _pico_sys
_pico_old_cwd = _pico_os.getcwd()
_pico_run_dir = _pico_os.path.realpath(${JSON.stringify(directory)})
_pico_result = None
try:
    _pico_os.chdir(_pico_run_dir)
    _pico_sys.modules.pop("_pico_runtime", None)
    _pico_namespace = {"__name__": "__main__", "__file__": "main.py"}
    exec(compile(open("main.py", encoding="utf-8").read(), "main.py", "exec"), _pico_namespace, _pico_namespace)
    _pico_result = _pico_namespace.get("__pico_result__")
finally:
    _pico_os.chdir(_pico_old_cwd)
    for _pico_name, _pico_module in list(_pico_sys.modules.items()):
        _pico_file = getattr(_pico_module, "__file__", None)
        if _pico_file is not None and not _pico_os.path.isabs(_pico_file):
            _pico_file = _pico_os.path.join(_pico_run_dir, _pico_file)
        if _pico_file is not None and _pico_os.path.realpath(_pico_file).startswith(_pico_run_dir + _pico_os.sep):
            _pico_sys.modules.pop(_pico_name, None)
_pico_result
`);
    return result(serialized);
  } finally {
    removeTree(runtime, directory);
  }
}
function runProgramImpl({ files, options }, context) {
  const signal = context?.signal;
  let project;
  let snapshot2;
  try {
    project = projectCopy(files);
    numericOptions(options);
    signal?.throwIfAborted();
    snapshot2 = options === void 0 ? void 0 : structuredClone(options);
  } catch (error2) {
    return Promise.reject(error2);
  }
  const next = queue.then(() => {
    signal?.throwIfAborted();
    return execute(project, snapshot2, signal);
  });
  queue = next.then(() => void 0, () => void 0);
  return next;
}

// src/impl/python/index.ts
var programs = /* @__PURE__ */ new WeakMap();
var empty = () => Object.freeze({
  interactive: false,
  result: { status: "ready", value: null },
  analysis: { status: "ready", value: null },
  input: null
});
function publish(session) {
  const { request, result: result2 } = session.evaluation.state;
  const stdin = request?.options?.stdin;
  const waiting2 = result2.status === "ready" ? result2.value?.waiting : null;
  session.state.set(Object.freeze({
    analysis: Object.freeze(session.analysis),
    result: result2,
    interactive: typeof stdin === "object" && (stdin.value !== "" || waiting2 != null),
    input: request && waiting2 ? Object.freeze({ id: request.id, prompt: waiting2.prompt }) : null
  }));
}
function execute2(session, source, options) {
  session.analysis = { status: "ready", value: null };
  session.evaluation.execute({ id: crypto.randomUUID(), source, options, configuration: session.options });
}
function createPython(options = {}, lifecycle) {
  const session = {
    options: { ...options, timeoutMs: options.timeoutMs ?? 2e3, maxTraceSteps: options.maxTraceSteps ?? 2e4 },
    state: createState(empty()),
    analysis: { status: "ready", value: null },
    connected: false,
    evaluation: new Evaluation(derivation("python evaluation", ({ request }, context) => {
      const { source, options: options2, configuration } = request;
      const signal = context.signal;
      try {
        const analysis2 = (configuration.analyzer ?? analyzer).compute(source);
        signal.throwIfAborted();
        session.analysis = { status: "ready", value: analysis2 };
      } catch (error2) {
        signal.throwIfAborted();
        session.analysis = { status: "failed", error: error2 };
        throw error2;
      }
      publish(session);
      signal.throwIfAborted();
      const files = (configuration.linker ?? linker).compute(source);
      signal.throwIfAborted();
      return (configuration.runner ?? runner).compute({ files, options: {
        ...options2,
        timeoutMs: options2?.timeoutMs ?? configuration.timeoutMs,
        maxTraceSteps: options2?.maxTraceSteps ?? configuration.maxTraceSteps
      } }, context);
    }))
  };
  const state2 = Object.freeze({
    get interactive() {
      return session.state.getSnapshot().interactive;
    },
    get result() {
      return session.state.getSnapshot().result;
    },
    get analysis() {
      return session.state.getSnapshot().analysis;
    },
    get input() {
      return session.state.getSnapshot().input;
    }
  });
  programs.set(state2, session);
  lifecycle.onDispose(() => session.evaluation.dispose());
  lifecycle.onDispose(session.evaluation.subscribe(() => publish(session)));
  lifecycle.dispatch({ type: "python.init" });
  return state2;
}
function initPython(state2, _event, { emit, onDispose }) {
  const session = programs.get(state2);
  if (session.connected) return;
  session.connected = true;
  const publish3 = () => emit({ type: "python.changed", ...session.state.getSnapshot() });
  onDispose(session.state.subscribe(publish3));
  publish3();
}
function receivePython(state2, event2) {
  const session = programs.get(state2);
  if (event2.type === "python.execute") execute2(session, event2.source, event2.options);
  else if (event2.type === "python.clear") {
    session.analysis = { status: "ready", value: null };
    session.evaluation.clear();
  } else {
    const { request, result: result2 } = session.evaluation.state;
    const stdin = request?.options?.stdin;
    if (!request || request.id !== event2.requestId || result2.status !== "ready" || !result2.value?.waiting || typeof stdin !== "object") return;
    execute2(session, request.source, { ...request.options, stdin: {
      kind: "interactive",
      value: stdin.value + (stdin.value === "" || stdin.value.endsWith("\n") ? "" : "\n") + event2.line + "\n"
    } });
  }
}
function reconfigPython(state2, event2) {
  const session = programs.get(state2);
  session.options = {
    ...session.options,
    ...event2.options,
    timeoutMs: event2.options.timeoutMs ?? session.options.timeoutMs,
    maxTraceSteps: event2.options.maxTraceSteps ?? session.options.maxTraceSteps
  };
}

// src/api/model/python.ts
var python = stateful("python", createPython, [
  on("python.reconfig", reconfigPython, []),
  event("python.reconfig", {}),
  on("python.init", initPython, ["python.changed"]),
  on("python.execute", receivePython, []),
  on("python.input", receivePython, []),
  on("python.clear", receivePython, []),
  event("python.init", {}),
  event("python.run", {}),
  event("python.reset", {}),
  event("python.execute", {}),
  event("python.input", {}),
  event("python.clear", {}),
  event("python.changed", {})
]);
var analyzer = /* @__PURE__ */ derivation("analyzer", analyzeSyntax);
var linker = /* @__PURE__ */ derivation("linker", linkProgramImpl);
var runner = /* @__PURE__ */ derivation("runner", runProgramImpl);
var pythonPreload = derivation("pythonPreload", preloadPython);

// src/impl/remote/record.ts
var encoder = new TextEncoder();
var HASH = /^sha256:[0-9a-f]{64}$/;
var Bytes = class {
  #parts = [];
  byte(value) {
    this.#parts.push(Uint8Array.of(value));
  }
  size(value) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 4294967295) throw new TypeError("value is too large");
    const bytes = new Uint8Array(4);
    new DataView(bytes.buffer).setUint32(0, value);
    this.#parts.push(bytes);
  }
  raw(value) {
    this.size(value.byteLength);
    this.#parts.push(value);
  }
  text(value) {
    this.raw(encoder.encode(value));
  }
  value() {
    const length = this.#parts.reduce((total, part) => total + part.byteLength, 0);
    const result2 = new Uint8Array(length);
    let offset = 0;
    for (const part of this.#parts) {
      result2.set(part, offset);
      offset += part.byteLength;
    }
    return result2;
  }
};
function compareBytes(left, right) {
  const length = Math.min(left.byteLength, right.byteLength);
  for (let index = 0; index < length; index++) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return left.byteLength - right.byteLength;
}
function writeValue(output, value, seen) {
  if (value === null) return output.byte(0);
  if (value === false) return output.byte(1);
  if (value === true) return output.byte(2);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("data must contain only finite numbers");
    output.byte(3);
    const bytes = new Uint8Array(8);
    new DataView(bytes.buffer).setFloat64(0, Object.is(value, -0) ? 0 : value);
    output.raw(bytes);
    return;
  }
  if (typeof value === "string") {
    output.byte(4);
    output.text(value);
    return;
  }
  if (seen.has(value)) throw new TypeError("data must be acyclic");
  seen.add(value);
  try {
    if (Array.isArray(value)) {
      output.byte(5);
      output.size(value.length);
      for (const item of value) writeValue(output, item, seen);
      return;
    }
    if (Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError("data must be a JSON object");
    output.byte(6);
    const entries = Object.entries(value).map(([key, item]) => ({ key, bytes: encoder.encode(key), item }));
    entries.sort((left, right) => compareBytes(left.bytes, right.bytes));
    output.size(entries.length);
    for (const entry of entries) {
      output.raw(entry.bytes);
      writeValue(output, entry.item, seen);
    }
  } finally {
    seen.delete(value);
  }
}
function writePosition(output, position2) {
  if (position2 === null) return output.byte(0);
  output.byte(1);
  output.text(position2.logId);
  output.text(position2.recordId);
}
function contentBytes(content) {
  const output = new Bytes();
  output.text("pico.replica.record.v1");
  output.text(content.logId);
  writePosition(output, content.parent);
  output.size(content.requires.length);
  for (const required of content.requires) writePosition(output, required);
  writeValue(output, content.data, /* @__PURE__ */ new Set());
  return output.value();
}
async function sha256(value) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", Uint8Array.from(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function contentOf(record) {
  return {
    logId: record.logId,
    parent: record.parent,
    requires: record.requires,
    data: record.data
  };
}
async function recordIdOf(content) {
  return `sha256:${await sha256(contentBytes(content))}`;
}
async function createReplicatedRecord(content) {
  return Object.freeze({ id: await recordIdOf(content), ...content });
}
async function verifyReplicatedRecord(record) {
  return HASH.test(record.id) && record.id === await recordIdOf(contentOf(record));
}

// src/impl/remote/index.ts
var PAGE_SIZE = 128;
var SyncFailure = class extends Error {
  constructor(kind, retryable, message) {
    super(message);
    this.kind = kind;
    this.retryable = retryable;
  }
  kind;
  retryable;
};
var Stopped = class extends Error {
};
var sessions = /* @__PURE__ */ new WeakMap();
function validId(value) {
  return typeof value === "string" && value.length > 0;
}
function validPosition(value, logId) {
  if (value === null || typeof value !== "object") return false;
  const position2 = value;
  return validId(position2.logId) && validId(position2.recordId) && (logId === void 0 || position2.logId === logId);
}
function copyPosition(value) {
  return value === null ? null : Object.freeze({ logId: value.logId, recordId: value.recordId });
}
function samePosition(left, right) {
  return left === right || left !== null && left !== void 0 && right !== null && right !== void 0 && left.logId === right.logId && left.recordId === right.recordId;
}
function positionOf(record) {
  return Object.freeze({ logId: record.logId, recordId: record.id });
}
function snapshot(entries) {
  return Object.freeze([...entries.values()].map((entry) => Object.freeze({
    logId: entry.logId,
    access: entry.access,
    localHead: entry.localHead,
    remoteHead: entry.remoteHead,
    pushedThrough: entry.access === "push" ? entry.remoteHead : void 0,
    pulledThrough: entry.access === "pull" ? entry.localHead : void 0
  })));
}
function safeEmit(context, event2) {
  try {
    context.emit(event2);
  } catch (error2) {
    queueMicrotask(() => {
      throw error2;
    });
  }
}
function publish2(session, context) {
  const logs2 = snapshot(session.entries);
  session.state.set(logs2);
  safeEmit(context, { type: "remote.changed", logs: logs2 });
}
function checkBinding(binding) {
  if (!validId(binding.logId)) throw new SyncFailure("invalid", false, "logId must be non-empty");
  if (binding.access !== "push" && binding.access !== "pull") {
    throw new SyncFailure("invalid", false, `invalid access for ${binding.logId}`);
  }
}
function makeEntry(binding) {
  checkBinding(binding);
  return { logId: binding.logId, access: binding.access, localHead: void 0, remoteHead: void 0 };
}
function createRemote(options, lifecycle) {
  const entries = /* @__PURE__ */ new Map();
  for (const binding of options.bindings ?? []) {
    const entry = makeEntry(binding);
    if (entries.has(entry.logId)) throw new Error(`Duplicate remote binding ${entry.logId}`);
    entries.set(entry.logId, entry);
  }
  const state2 = createState(snapshot(entries));
  const session = {
    state: state2,
    local: options.local,
    peer: options.peer,
    entries,
    targets: /* @__PURE__ */ new Set(),
    all: false,
    syncing: false,
    disposed: false
  };
  sessions.set(state2, session);
  lifecycle.onDispose(() => {
    session.disposed = true;
    session.targets.clear();
    session.all = false;
  });
  return state2;
}
function failure(error2) {
  return error2 instanceof SyncFailure ? error2 : new SyncFailure("unavailable", true, String(error2 instanceof Error ? error2.message : error2));
}
function emitFailure(context, logId, error2) {
  const value = failure(error2);
  safeEmit(context, {
    type: "remote.failed",
    ...logId === void 0 ? {} : { logId },
    kind: value.kind,
    retryable: value.retryable,
    message: value.message
  });
}
function attachRemote(state2, event2, context) {
  const session = sessions.get(state2);
  try {
    const entry = makeEntry(event2.binding);
    const current = session.entries.get(entry.logId);
    if (current?.access === entry.access) return;
    if (current) throw new SyncFailure("invalid", false, `Cannot change access for ${entry.logId}`);
    session.entries.set(entry.logId, entry);
    publish2(session, context);
  } catch (error2) {
    emitFailure(context, event2.binding.logId, error2);
  }
}
function detachRemote(state2, event2, context) {
  const session = sessions.get(state2);
  if (!session.entries.delete(event2.logId)) return;
  session.targets.delete(event2.logId);
  publish2(session, context);
}
function active(session, entry) {
  if (session.disposed || session.entries.get(entry.logId) !== entry) throw new Stopped();
}
async function observedHead(store2, logId) {
  const head = await store2.head(logId);
  if (head !== null && !validPosition(head, logId)) {
    throw new SyncFailure("invalid", false, `Invalid head for ${logId}`);
  }
  return copyPosition(head);
}
function setHeads(session, entry, localHead, remoteHead, context) {
  if (samePosition(entry.localHead, localHead) && samePosition(entry.remoteHead, remoteHead)) return;
  entry.localHead = copyPosition(localHead);
  entry.remoteHead = copyPosition(remoteHead);
  publish2(session, context);
}
async function validateRecord(record, logId) {
  if (record === null || typeof record !== "object") {
    throw new SyncFailure("invalid", false, `Invalid record in ${logId}`);
  }
  if (!validId(record.id) || record.logId !== logId) {
    throw new SyncFailure("invalid", false, `Invalid record identity in ${logId}`);
  }
  if (record.parent !== null && !validPosition(record.parent, logId)) {
    throw new SyncFailure("invalid", false, `Invalid parent for ${record.id}`);
  }
  if (!Array.isArray(record.requires) || record.requires.some((required) => !validPosition(required) || required.logId === logId)) {
    throw new SyncFailure("invalid", false, `Invalid dependencies for ${record.id}`);
  }
  try {
    if (!await verifyReplicatedRecord(record)) throw new Error();
  } catch {
    throw new SyncFailure("invalid", false, `Invalid identity for ${record.id}`);
  }
}
async function validatePage(page, logId, after) {
  if (page === null || typeof page !== "object") {
    throw new SyncFailure("invalid", false, `Invalid page for ${logId}`);
  }
  if (page.head !== null && !validPosition(page.head, logId)) {
    throw new SyncFailure("invalid", false, `Invalid page head for ${logId}`);
  }
  if (!Array.isArray(page.records) || typeof page.hasMore !== "boolean") {
    throw new SyncFailure("invalid", false, `Invalid page for ${logId}`);
  }
  let parent = after;
  const ids = /* @__PURE__ */ new Set();
  for (const record of page.records) {
    await validateRecord(record, logId);
    if (ids.has(record.id)) throw new SyncFailure("invalid", false, `Duplicate record ${record.id}`);
    if (!samePosition(record.parent, parent)) throw new SyncFailure("invalid", false, `Broken parent before ${record.id}`);
    ids.add(record.id);
    parent = positionOf(record);
  }
  if (page.hasMore && page.records.length === 0) {
    throw new SyncFailure("invalid", false, `Empty continuation page for ${logId}`);
  }
  if (!page.hasMore && !samePosition(parent, page.head)) {
    throw new SyncFailure("invalid", false, `Page does not reach head for ${logId}`);
  }
}
function validateAppend(result2, logId) {
  if (result2 === null || typeof result2 !== "object") {
    throw new SyncFailure("invalid", false, `Invalid append result for ${logId}`);
  }
  if (!["accepted", "current", "changed"].includes(result2.kind)) {
    throw new SyncFailure("invalid", false, `Invalid append result for ${logId}`);
  }
  if (result2.head !== null && !validPosition(result2.head, logId)) {
    throw new SyncFailure("invalid", false, `Invalid append head for ${logId}`);
  }
}
async function contains(store2, position2) {
  const result2 = await store2.has(position2);
  if (typeof result2 !== "boolean") {
    throw new SyncFailure("invalid", false, `Invalid presence result for ${position2.logId}`);
  }
  return result2;
}
async function ensureDependencies(session, entry, destination, records, context, stack) {
  for (const record of records) {
    for (const required of record.requires) {
      if (await contains(destination, required)) continue;
      const dependency = session.entries.get(required.logId);
      if (!dependency || dependency.access !== entry.access) {
        throw new SyncFailure("invalid", false, `Missing dependency ${required.logId}:${required.recordId}`);
      }
      if (stack.has(dependency.logId)) {
        throw new SyncFailure("invalid", false, `Causal cycle through ${dependency.logId}`);
      }
      await syncEntry(session, dependency, context, stack);
      active(session, entry);
      if (!await contains(destination, required)) {
        throw new SyncFailure("invalid", false, `Dependency was not synchronized ${required.logId}:${required.recordId}`);
      }
    }
  }
}
async function syncEntry(session, entry, context, ancestors = /* @__PURE__ */ new Set()) {
  active(session, entry);
  const stack = new Set(ancestors).add(entry.logId);
  const [initialLocalHead, initialRemoteHead] = await Promise.all([
    observedHead(session.local, entry.logId),
    observedHead(session.peer, entry.logId)
  ]);
  active(session, entry);
  setHeads(session, entry, initialLocalHead, initialRemoteHead, context);
  const source = entry.access === "push" ? session.local : session.peer;
  const destination = entry.access === "push" ? session.peer : session.local;
  const target = entry.access === "push" ? initialLocalHead : initialRemoteHead;
  while (true) {
    active(session, entry);
    const destinationHead = await observedHead(destination, entry.logId);
    active(session, entry);
    if (target === null) {
      if (destinationHead !== null) throw new SyncFailure("diverged", false, `${entry.logId} is not a prefix of its owner`);
      break;
    }
    if (await contains(destination, target)) break;
    if (destinationHead !== null && !await contains(source, destinationHead)) {
      throw new SyncFailure("diverged", false, `${entry.logId} has conflicting suffixes`);
    }
    const page = await source.read(entry.logId, destinationHead, PAGE_SIZE);
    active(session, entry);
    await validatePage(page, entry.logId, destinationHead);
    if (page.records.length === 0) {
      throw new SyncFailure("invalid", false, `Source did not provide ${entry.logId}:${target.recordId}`);
    }
    await ensureDependencies(session, entry, destination, page.records, context, stack);
    active(session, entry);
    const result2 = await destination.append(entry.logId, destinationHead, page.records);
    active(session, entry);
    validateAppend(result2, entry.logId);
    const through = positionOf(page.records.at(-1));
    if (result2.kind === "accepted" && !samePosition(result2.head, through)) {
      throw new SyncFailure("invalid", false, `Append returned the wrong head for ${entry.logId}`);
    }
    if (result2.kind === "current" && !await contains(destination, through)) {
      throw new SyncFailure("invalid", false, `Append did not retain ${entry.logId}:${through.recordId}`);
    }
    const localHead = entry.access === "push" ? page.head : result2.head;
    const remoteHead = entry.access === "push" ? result2.head : page.head;
    setHeads(session, entry, localHead, remoteHead, context);
    if (entry.access === "pull" && result2.kind === "accepted") {
      safeEmit(context, { type: "remote.received", logId: entry.logId, after: destinationHead, through });
    }
  }
  safeEmit(context, { type: "remote.synced", logId: entry.logId, through: target });
}
async function drain(session, context) {
  try {
    while (!session.disposed && (session.all || session.targets.size > 0)) {
      const entries = session.all ? [...session.entries.values()] : [...session.targets].flatMap((logId) => {
        const entry = session.entries.get(logId);
        return entry ? [entry] : [];
      });
      session.all = false;
      session.targets.clear();
      for (const entry of entries) {
        try {
          await syncEntry(session, entry, context);
        } catch (error2) {
          if (!(error2 instanceof Stopped) && !session.disposed) emitFailure(context, entry.logId, error2);
        }
      }
    }
  } finally {
    session.syncing = false;
  }
}
function syncRemote(state2, event2, context) {
  const session = sessions.get(state2);
  if (event2.logId !== void 0 && !session.entries.has(event2.logId)) {
    emitFailure(context, event2.logId, new SyncFailure("invalid", false, `Unknown remote log ${event2.logId}`));
    return;
  }
  if (event2.logId === void 0) {
    session.all = true;
    session.targets.clear();
  } else if (!session.all) {
    session.targets.add(event2.logId);
  }
  if (session.syncing) return;
  session.syncing = true;
  void drain(session, context).catch((error2) => {
    if (!session.disposed) emitFailure(context, void 0, error2);
  });
}
function restoreRemote(state2, event2, context) {
  syncRemote(state2, { type: "remote.sync", logId: event2.logId }, context);
}

// src/api/model/remote.ts
var remote = stateful("remote", createRemote, [
  on("remote.attach", attachRemote, ["remote.changed", "remote.failed"]),
  event("remote.attach", {}),
  on("remote.detach", detachRemote, ["remote.changed"]),
  event("remote.detach", {}),
  on("remote.sync", syncRemote, ["remote.received", "remote.synced", "remote.failed", "remote.changed"]),
  event("remote.sync", {}),
  on("remote.restore", restoreRemote, ["remote.received", "remote.synced", "remote.failed", "remote.changed"]),
  event("remote.restore", {}),
  event("remote.received", {}),
  event("remote.synced", {}),
  event("remote.failed", {}),
  event("remote.changed", {})
]);

// src/api/model/replica-log.ts
function recordIdOf2(content) {
  return recordIdOf(content);
}
function createReplicatedRecord2(content) {
  return createReplicatedRecord(content);
}
function verifyReplicatedRecord2(record) {
  return verifyReplicatedRecord(record);
}

// src/impl/store/index.ts
var backendOperations = /* @__PURE__ */ new WeakMap();
var sessions2 = /* @__PURE__ */ new WeakMap();
function connect(backend) {
  let operations = backendOperations.get(backend);
  if (!operations) {
    operations = { queue: [], running: false };
    backendOperations.set(backend, operations);
  }
  return { backend, operations };
}
function createStore(backend = browserStoreBackend) {
  const state2 = Object.freeze({});
  sessions2.set(state2, connect(backend));
  return state2;
}
function drain2(session) {
  if (session.running) return;
  session.running = true;
  while (session.queue.length) {
    const result2 = session.queue.shift()();
    if (result2) {
      void result2.then(() => {
        session.running = false;
        drain2(session);
      });
      return;
    }
  }
  session.running = false;
}
function enqueue(state2, operation, path, work, result2, context) {
  const session = sessions2.get(state2);
  const finish = (event2) => {
    try {
      context.emit(event2);
    } catch (error2) {
      queueMicrotask(() => {
        throw error2;
      });
    }
  };
  const fail = (error2) => finish({
    type: "store.failed",
    operation,
    path,
    message: String(error2 instanceof Error ? error2.message : error2)
  });
  session.operations.queue.push(() => {
    try {
      const value = work(session.backend);
      if (value !== null && typeof value === "object" && "then" in value && typeof value.then === "function") {
        return Promise.resolve(value).then((value2) => finish(result2(value2))).catch(fail);
      }
      finish(result2(value));
    } catch (error2) {
      fail(error2);
    }
  });
  drain2(session.operations);
}
var capture2 = (path) => Object.freeze(path.kind === "session" ? { kind: "session", key: path.key } : { kind: "file", path: path.path });
function readStore(state2, event2, context) {
  const path = capture2(event2.path);
  enqueue(state2, "read", path, (backend) => backend.read(path), (source) => ({ type: "store.loaded", path, source }), context);
}
function writeStore(state2, event2, context) {
  const path = capture2(event2.path), source = event2.source;
  enqueue(state2, "write", path, (backend) => backend.write(path, source), () => ({ type: "store.written", path }), context);
}
function removeStore(state2, event2, context) {
  const path = capture2(event2.path);
  enqueue(state2, "remove", path, (backend) => backend.remove(path), () => ({ type: "store.removed", path }), context);
}
function sessionKey(path) {
  if (path.kind !== "session") throw new Error("File paths require a filesystem backend");
  return path.key;
}
var browserStoreBackend = Object.freeze({
  read(path) {
    const key = sessionKey(path);
    return sessionStorage.getItem(key);
  },
  write(path, source) {
    const key = sessionKey(path);
    sessionStorage.setItem(key, source);
  },
  remove(path) {
    const key = sessionKey(path);
    sessionStorage.removeItem(key);
  }
});
function reconfigStore(state2, event2) {
  sessions2.set(state2, connect(event2.backend));
}

// src/api/model/store.ts
var store = stateful("store", createStore, [
  on("store.reconfig", reconfigStore, []),
  event("store.reconfig", {}),
  on("store.read", readStore, ["store.loaded", "store.failed"]),
  on("store.write", writeStore, ["store.written", "store.failed"]),
  on("store.remove", removeStore, ["store.removed", "store.failed"]),
  event("store.read", {}),
  event("store.write", {}),
  event("store.remove", {}),
  event("store.loaded", {}),
  event("store.written", {}),
  event("store.removed", {}),
  event("store.failed", {})
]);
var browserStore = browserStoreBackend;

// src/impl/components/state.ts
var layouts = /* @__PURE__ */ new WeakMap();
var themes = /* @__PURE__ */ new WeakMap();
function normalize(value) {
  if (!Number.isFinite(value.ratio)) throw new RangeError("Invalid layout ratio");
  if (Object.values(value.sizes).some((size) => !Number.isFinite(size) || size <= 0)) throw new RangeError("Invalid panel size");
  return Object.freeze({
    open: value.open === null ? null : Object.freeze([...new Set(value.open)]),
    ratio: Math.max(0.34, Math.min(0.6, value.ratio)),
    sizes: Object.freeze({ ...value.sizes }),
    tree: value.tree === null ? null : checkTree(value.tree, /* @__PURE__ */ new Set())
  });
}
function checkTree(node2, slots) {
  if ("slot" in node2) {
    if (typeof node2.slot !== "string" || node2.slot === "" || slots.has(node2.slot)) throw new RangeError("Invalid layout slot");
    slots.add(node2.slot);
    return Object.freeze({ slot: node2.slot });
  }
  if (node2.split !== "row" && node2.split !== "column" || !Array.isArray(node2.children) || node2.children.length === 0 || node2.key !== void 0 && typeof node2.key !== "string") throw new RangeError("Invalid layout split");
  return Object.freeze({ split: node2.split, children: Object.freeze(node2.children.map((child2) => checkTree(child2, slots))), ...node2.key === void 0 ? {} : { key: node2.key } });
}
function createLayout(initial = {}) {
  const state2 = createState(normalize({ open: null, ratio: 0.43, sizes: {}, tree: null, ...initial }));
  const readable = Object.freeze({ getSnapshot: state2.getSnapshot, subscribe: state2.subscribe });
  layouts.set(readable, state2);
  return readable;
}
function changeLayout(readable, event2, { emit }) {
  const state2 = layouts.get(readable);
  const next = normalize({ ...state2.getSnapshot(), ...event2.value });
  const previous = state2.getSnapshot();
  if (previous.ratio === next.ratio && JSON.stringify(previous.open) === JSON.stringify(next.open) && JSON.stringify(previous.tree) === JSON.stringify(next.tree) && Object.keys(previous.sizes).length === Object.keys(next.sizes).length && Object.keys(next.sizes).every((key) => previous.sizes[key] === next.sizes[key])) return;
  state2.set(next);
  emit({ type: "layout.changed", value: next });
}
function checkTheme(value) {
  if (value !== "auto" && value !== "light" && value !== "dark") throw new Error("Invalid theme");
  return value;
}
function createTheme(initial = "auto") {
  const state2 = createState(checkTheme(initial));
  const readable = Object.freeze({ getSnapshot: state2.getSnapshot, subscribe: state2.subscribe });
  themes.set(readable, state2);
  return readable;
}
function changeTheme(readable, event2, { emit }) {
  const state2 = themes.get(readable);
  const value = checkTheme(event2.value);
  if (value === state2.getSnapshot()) return;
  state2.set(value);
  emit({ type: "theme.changed", value });
}

// src/impl/components/widget.tsx
import { useCallback, useSyncExternalStore } from "./libs/react.js";
import { jsx } from "./libs/react.js";
function useValue(state2) {
  return useSyncExternalStore(state2.subscribe, state2.getSnapshot, state2.getSnapshot);
}
function Widget({ widget }) {
  const attach = useCallback((host) => {
    if (host === null) return;
    const element = widget.element;
    if (element === null) return;
    host.append(element);
    return () => {
      if (element.parentNode === host) element.remove();
    };
  }, [widget]);
  return /* @__PURE__ */ jsx("div", { className: "pico-widget", ref: attach });
}

// src/impl/components/shell.tsx
import { useRef as useRef3, useId as useId2, useEffect as useEffect2 } from "./libs/react.js";
import { flushSync } from "./libs/react.js";

// src/impl/components/toolbar.tsx
import { Fragment, useRef, useState, useId, useEffect } from "./libs/react.js";

// assets/icons.ts
var ICONS = {
  output: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.8" y="2.8" width="12.4" height="10.4" rx="2"/><path d="M4.3 6.2l2.2 1.8-2.2 1.8M8.3 10.2h3.2"/></svg>',
  play: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 3.5 12 8l-6.5 4.5z"/></svg>',
  debug: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="4" r="1.8"/><path d="M6.4 5.5C5 6.1 4.2 7.3 4.2 8.9c0 2.2 1.6 4 3.8 4s3.8-1.8 3.8-4c0-1.6-.8-2.8-2.2-3.4"/><path d="M8 6.5v6.4M6.1 5.9L4 4.6M9.9 5.9L12 4.6M4.3 8.8H2.2M11.7 8.8h2.1M5.1 11.4l-1.9 1.5M10.9 11.4l1.9 1.5"/></svg>',
  save: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 2h10l2 2v10H2zM5 2v4h6V2M5 14V9h6v5" /></svg>',
  home: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m2 7 6-5 6 5M4 6v8h8V6" /></svg>',
  viz: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 1.8l5.5 3.1v6.2L8 14.2 2.5 11.1V4.9z"/><path d="M2.5 4.9L8 8l5.5-3.1M8 8v6.2"/></svg>',
  download: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2.5v7.2M4.8 6.9L8 10.1l3.2-3.2M3 11.5v.6a1.6 1.6 0 0 0 1.6 1.6h6.8a1.6 1.6 0 0 0 1.6-1.6v-.6"/></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>',
  new: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9"/><path d="M13.5 2.5v2.2h-2.2"/></svg>',
  hint: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2a4.5 4.5 0 0 0-2 8.6c.5.3.8.8.8 1.4h2.4c0-.6.3-1.1.8-1.4A4.5 4.5 0 0 0 8 2z"/><path d="M6.5 14h3"/></svg>',
  auto: '<svg viewBox="0 0 16 16" aria-hidden="true"> <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.6" /> <path d="M8 3a5 5 0 0 1 0 10z" fill="currentColor" /> </svg>',
  light: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"> <circle cx="8" cy="8" r="3.2" /> <path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.7 3.7l1.1 1.1M11.2 11.2l1.1 1.1M12.3 3.7l-1.1 1.1M4.8 11.2l-1.1 1.1" /> </svg>',
  dark: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"> <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z" /> </svg>'
};

// src/impl/components/toolbar.tsx
import { Fragment as Fragment2, jsx as jsx2, jsxs } from "./libs/react.js";
function BrandMenu({ brand, menu: commands, onEvent }) {
  const id = useId();
  const trigger = useRef(null);
  const menu = useRef(null);
  const [open, setOpen] = useState(false);
  const place = () => {
    const rect = trigger.current?.getBoundingClientRect();
    if (rect === void 0 || menu.current === null) return;
    menu.current.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 228))}px`;
    menu.current.style.top = `${rect.bottom + 6}px`;
  };
  const close = () => {
    menu.current?.hidePopover();
    trigger.current?.focus();
  };
  return /* @__PURE__ */ jsxs("div", { className: "pico-topbar-brand", children: [
    /* @__PURE__ */ jsx2("style", { children: MENU_STYLE }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "pico-brand-trigger",
        ref: trigger,
        "aria-label": "Pico \u83DC\u5355",
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": id,
        popoverTarget: id,
        onClick: place,
        onKeyDown: (event2) => {
          if (event2.key !== "ArrowDown" && event2.key !== "ArrowUp") return;
          event2.preventDefault();
          place();
          menu.current?.showPopover();
          const items = menu.current?.querySelectorAll("button[role^=menuitem]:not(:disabled)");
          items?.[event2.key === "ArrowUp" ? items.length - 1 : 0]?.focus();
        },
        children: [
          /* @__PURE__ */ jsx2("img", { className: "pico-topbar-logo", src: new URL("pico.svg", import.meta.url).href, alt: "", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx2("span", { className: "pico-topbar-brand-text", children: brand }),
          /* @__PURE__ */ jsx2("svg", { className: "pico-brand-chevron", viewBox: "0 0 12 12", "aria-hidden": "true", children: /* @__PURE__ */ jsx2("path", { d: "m3 4.5 3 3 3-3", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsx2(
      "div",
      {
        id,
        className: "pico-brand-menu",
        popover: "auto",
        role: "menu",
        "aria-label": "Pico",
        ref: menu,
        onToggle: (event2) => {
          setOpen(event2.newState === "open");
          if (event2.newState === "open" && document.activeElement === trigger.current) {
            menu.current?.querySelector("button[role^=menuitem]:not(:disabled)")?.focus();
          }
        },
        onBlur: (event2) => {
          if (event2.relatedTarget !== null && !event2.currentTarget.contains(event2.relatedTarget) && event2.relatedTarget !== trigger.current) menu.current?.hidePopover();
        },
        onKeyDown: (event2) => {
          if (event2.key === "Escape") {
            event2.preventDefault();
            close();
            return;
          }
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event2.key)) return;
          event2.preventDefault();
          const items = [...event2.currentTarget.querySelectorAll("button[role^=menuitem]:not(:disabled)")];
          const index = items.indexOf(document.activeElement);
          const next = event2.key === "Home" ? 0 : event2.key === "End" ? items.length - 1 : (index + (event2.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
          items[next]?.focus();
        },
        children: commands?.map((command, index) => command.kind === "button" ? /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "pico-menu-item",
            role: command.pressed === void 0 ? "menuitem" : "menuitemcheckbox",
            "aria-checked": command.pressed,
            disabled: command.disabled,
            onClick: () => {
              if (!command.disabled) {
                close();
                onEvent?.(command.event);
              }
            },
            children: [
              /* @__PURE__ */ jsx2(Icon, { name: command.icon }),
              command.label
            ]
          },
          index
        ) : /* @__PURE__ */ jsxs("div", { role: "group", "aria-label": command.label, children: [
          /* @__PURE__ */ jsx2("div", { className: "pico-menu-label", children: command.label }),
          command.choices.map((choice) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "pico-menu-item",
              role: "menuitemradio",
              "aria-checked": command.value === choice.value,
              title: choice.title,
              onClick: () => {
                close();
                onEvent?.(choice.event);
              },
              children: [
                choice.icon && /* @__PURE__ */ jsx2(Icon, { name: choice.icon }),
                choice.label
              ]
            },
            choice.value
          ))
        ] }, index))
      }
    )
  ] });
}
var MENU_STYLE = `
.pico-brand-trigger { display: inline-flex; align-items: center; gap: var(--pico-space-2); height: 34px; padding: 0 7px; margin-left: -7px; border: 0; border-radius: 7px; background: transparent; color: inherit; cursor: pointer; transition: background var(--pico-duration-fast); }
.pico-brand-trigger:hover, .pico-brand-trigger[aria-expanded="true"] { background: color-mix(in srgb, var(--pico-ink) 8%, transparent); }
.pico-brand-chevron { width: 12px; height: 12px; color: var(--pico-ink-soft); transition: transform var(--pico-duration-fast) var(--pico-ease-out); }
.pico-brand-trigger[aria-expanded="true"] .pico-brand-chevron { transform: rotate(180deg); }
.pico-brand-menu { position: fixed; inset: auto; margin: 0; width: 220px; max-width: calc(100vw - 16px); max-height: calc(100dvh - 64px); overflow-y: auto; padding: 5px; border: 1px solid var(--pico-hairline); border-radius: 9px; background: var(--pico-surface-raised); color: var(--pico-ink); box-shadow: var(--pico-shadow-float); font: 500 var(--pico-size-xs)/1.4 var(--pico-font-ui); }
.pico-brand-menu { opacity: 0; transform: translateY(-4px) scale(.98); transform-origin: top left; transition: opacity var(--pico-duration-fast) var(--pico-ease-out), transform var(--pico-duration-fast) var(--pico-ease-out), display var(--pico-duration-fast) allow-discrete, overlay var(--pico-duration-fast) allow-discrete; }
.pico-brand-menu:popover-open { opacity: 1; transform: none; }
.pico-brand-menu:not(:popover-open) { pointer-events: none; }
@starting-style { .pico-brand-menu:popover-open { opacity: 0; transform: translateY(-4px) scale(.98); } }

.pico-menu-item { display: flex; align-items: center; gap: 9px; width: 100%; min-height: 32px; padding: 6px 9px; border: 0; border-radius: 5px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.pico-menu-item:hover, .pico-menu-item:focus-visible { background: color-mix(in srgb, var(--pico-ink) 7%, transparent); outline: none; }
.pico-menu-item svg { width: 16px; height: 16px; flex-shrink: 0; color: var(--pico-ink-soft); }
.pico-menu-item[aria-checked="true"]::after { content: "\u2713"; margin-left: auto; color: var(--pico-accent); }
.pico-menu-label { padding: 6px 9px 3px; color: var(--pico-ink-soft); }
.pico-menu-separator { height: 1px; margin: 5px 4px; background: var(--pico-hairline); }
@media (prefers-reduced-motion: reduce) { .pico-brand-menu, .pico-brand-trigger, .pico-brand-chevron { transition: none; } }
`;
function ToolbarSep() {
  return /* @__PURE__ */ jsx2("span", { className: "pico-toolbar-sep", "aria-hidden": "true" });
}
function Icon({ name }) {
  return /* @__PURE__ */ jsx2("span", { style: { display: "contents" }, "aria-hidden": "true", dangerouslySetInnerHTML: { __html: ICONS[name] } });
}
function ControlView({ control, onEvent }) {
  if (control.kind === "choices") {
    return /* @__PURE__ */ jsx2("span", { className: "pico-toolbar-choices", role: "group", "aria-label": control.label, children: control.choices.map((choice) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "pico-ghost-btn",
        "aria-pressed": control.value === choice.value,
        "aria-label": choice.title,
        title: choice.title,
        onClick: () => onEvent?.(choice.event),
        children: [
          choice.icon && /* @__PURE__ */ jsx2(Icon, { name: choice.icon }),
          choice.label
        ]
      },
      choice.value
    )) });
  }
  const { icon, label, pressed, disabled, event: event2 } = control;
  return /* @__PURE__ */ jsx2(
    "button",
    {
      type: "button",
      className: "pico-ghost-btn pico-ghost-btn--icon",
      "aria-pressed": pressed,
      disabled,
      "aria-label": label,
      title: label,
      onClick: () => {
        if (!disabled) onEvent?.(event2);
      },
      children: /* @__PURE__ */ jsx2(Icon, { name: icon })
    }
  );
}
function TopBar({ name, menu, onEvent, groups, views: views2 = [] }) {
  const list = groups ?? [];
  const bar = useRef(null);
  const fit = () => {
    const el = bar.current;
    if (el === null) return;
    for (const state2 of ["wide", "no-title", "no-brand"]) {
      el.dataset.fit = state2;
      if (el.scrollWidth <= el.clientWidth + 1) break;
    }
  };
  useEffect(fit);
  useEffect(() => {
    const el = bar.current;
    if (el === null || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs("header", { ref: bar, className: "pico-topbar", "aria-label": "playground \u5DE5\u5177\u680F", children: [
    /* @__PURE__ */ jsxs("div", { className: "pico-topbar-left", children: [
      /* @__PURE__ */ jsx2(BrandMenu, { brand: "Pico Playground", menu, onEvent }),
      name !== void 0 && /* @__PURE__ */ jsx2("div", { className: "pico-topbar-title", children: name })
    ] }),
    list.map((group, index) => /* @__PURE__ */ jsxs(Fragment, { children: [
      index > 0 && /* @__PURE__ */ jsx2(ToolbarSep, {}),
      /* @__PURE__ */ jsx2("div", { className: "pico-toolbar-group", role: group.label === void 0 ? void 0 : "group", "aria-label": group.label, children: group.controls.map((control, controlIndex) => /* @__PURE__ */ jsx2(ControlView, { control, onEvent }, controlIndex)) })
    ] }, index)),
    views2.length > 0 && /* @__PURE__ */ jsxs(Fragment2, { children: [
      list.length > 0 && /* @__PURE__ */ jsx2(ToolbarSep, {}),
      /* @__PURE__ */ jsx2("div", { className: "pico-toolbar-group", role: "group", "aria-label": "\u89C6\u56FE", children: views2.map((view) => /* @__PURE__ */ jsx2(
        "button",
        {
          type: "button",
          className: "pico-ghost-btn pico-ghost-btn--icon",
          "aria-pressed": view.pressed,
          "aria-label": view.label,
          title: view.label,
          onClick: view.onClick,
          children: /* @__PURE__ */ jsx2(Icon, { name: view.icon })
        },
        view.key
      )) })
    ] })
  ] });
}

// src/impl/components/split.tsx
import { useRef as useRef2, useState as useState2, useLayoutEffect } from "./libs/react.js";
import { jsx as jsx3 } from "./libs/react.js";
function Divider({ direction, value, min, max, onChange, pixelsPerUnit }) {
  const drag = useRef2(null);
  const position2 = (event2) => direction === "row" ? event2.clientX : event2.clientY;
  const change2 = (next) => onChange(Math.max(min, Math.min(max, next)));
  const finish = (event2) => {
    if (drag.current?.pointer !== event2.pointerId) return;
    drag.current = null;
    delete event2.currentTarget.dataset.dragging;
    if (event2.currentTarget.hasPointerCapture(event2.pointerId)) event2.currentTarget.releasePointerCapture(event2.pointerId);
  };
  return /* @__PURE__ */ jsx3(
    "div",
    {
      className: `pico-dock-divider${direction === "row" ? " pico-dock-divider--v" : ""}`,
      role: "separator",
      onPointerDown: (event2) => {
        if (event2.button !== 0 || drag.current !== null) return;
        event2.preventDefault();
        event2.currentTarget.setPointerCapture(event2.pointerId);
        drag.current = { pointer: event2.pointerId, start: position2(event2), value };
        event2.currentTarget.dataset.dragging = "true";
      },
      onPointerMove: (event2) => {
        const current = drag.current;
        if (current?.pointer !== event2.pointerId) return;
        const scale = pixelsPerUnit();
        if (scale > 0) change2(current.value + (position2(event2) - current.start) / scale);
      },
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture: finish
    }
  );
}
var MIN_PANE = 120;
function Split({ direction, minPane = MIN_PANE, className, panes, sizes, onResize }) {
  const container = useRef2(null);
  const [total, setTotal] = useState2(0);
  const keys = panes.map((pane) => pane.key);
  const keyOf = JSON.stringify(keys);
  const sizeOf = (key) => Object.hasOwn(sizes, key) ? sizes[key] : 1;
  const weight = keys.reduce((sum, key) => sum + sizeOf(key), 0);
  const pixels = (key) => weight > 0 ? total * (sizeOf(key) / weight) : 0;
  const axis = direction === "row" ? "width" : "height";
  const available = () => {
    const element = container.current;
    if (element === null) return 0;
    const style = getComputedStyle(element);
    const box = direction === "row" ? element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) : element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const dividers = [...element.children].filter((child2) => child2.getAttribute("role") === "separator");
    const occupied = dividers.reduce((sum, divider) => sum + divider.getBoundingClientRect()[axis], 0);
    return Math.max(0, box - occupied);
  };
  useLayoutEffect(() => {
    const element = container.current;
    if (element === null) return;
    const resize = () => setTotal(available());
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [direction, keyOf]);
  return /* @__PURE__ */ jsx3("div", { ref: container, className: `pico-split pico-split--${direction}${className === void 0 ? "" : ` ${className}`}`, children: panes.map((pane, index) => {
    const size = total > 0 ? pixels(keys[index]) : void 0;
    return /* @__PURE__ */ jsx3("div", { className: "pico-pane", style: { flex: size === void 0 ? "1 1 0" : `0 0 ${size}px` }, children: pane.content }, keys[index]);
  }).flatMap((pane, index) => {
    if (index === panes.length - 1) return [pane];
    const a = pixels(keys[index]);
    const b = pixels(keys[index + 1]);
    const minimum = Math.min(minPane, (a + b) / 2);
    return [pane, /* @__PURE__ */ jsx3(
      Divider,
      {
        direction,
        value: a,
        min: minimum,
        max: a + b - minimum,
        pixelsPerUnit: () => 1,
        onChange: (size) => {
          if (total <= 0) return;
          onResize({
            ...sizes,
            [keys[index]]: size / total * weight,
            [keys[index + 1]]: (a + b - size) / total * weight
          });
        }
      },
      `divider-${keys[index]}-${keys[index + 1]}`
    )];
  }) });
}

// src/impl/components/tree.ts
function arrangeLayout(tree, visible) {
  const shown = new Set(visible);
  const placed = new Set(slotsOf(tree));
  const rest = visible.filter((key) => key !== "editor" && !placed.has(key));
  let root = prune(tree, shown);
  if (rest.length > 0) root = join(root, rest.length === 1 ? { slot: rest[0] } : { split: "column", key: "layout:rest", children: rest.map((slot) => ({ slot })) });
  if (shown.has("editor") && !placed.has("editor")) root = join({ slot: "editor" }, root);
  return root;
}
function layoutKey(node2) {
  return "slot" in node2 ? node2.slot : node2.key ?? `${node2.split}:${slotsOf(node2).join("+")}`;
}
function slotsOf(node2) {
  return "slot" in node2 ? [node2.slot] : node2.children.flatMap(slotsOf);
}
function prune(node2, shown) {
  if ("slot" in node2) return shown.has(node2.slot) ? node2 : null;
  const children2 = node2.children.flatMap((child2) => {
    const kept = prune(child2, shown);
    return kept === null ? [] : [kept];
  });
  if (children2.length === 0) return null;
  return children2.length === 1 ? children2[0] : { ...node2, children: children2 };
}
function join(left, right) {
  if (left === null) return right;
  if (right === null) return left;
  return { split: "row", key: "layout:join", children: [left, right] };
}

// src/impl/components/shell.tsx
import { Fragment as Fragment3, jsx as jsx4, jsxs as jsxs2 } from "./libs/react.js";
var MIN_RATIO = 0.34;
var MAX_RATIO = 0.6;
function PlaygroundShell({
  name,
  menu,
  onEvent,
  editor: editor2,
  toolbar,
  panels,
  layout: layout2
}) {
  const closable = panels.filter(
    (panel) => panel.icon !== void 0
  );
  const state2 = useValue(layout2);
  const open = new Set(state2.open ?? panels.map((panel) => panel.key));
  const ratio = state2.ratio;
  const main = useRef3(null);
  const transition = useRef3(null);
  const transitionId = useId2().replace(/[^a-zA-Z0-9_-]/g, "");
  useEffect2(() => () => transition.current?.skipTransition(), []);
  const visible = panels.filter((panel) => open.has(panel.key));
  const toggle = (key) => {
    const update = () => {
      const current = layout2.getSnapshot();
      const next = new Set(current.open ?? panels.map((panel) => panel.key));
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onEvent({ type: "layout.change", value: { open: [...next] } });
    };
    transition.current?.skipTransition();
    if (typeof document.startViewTransition !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      update();
      return;
    }
    transition.current = document.startViewTransition(() => flushSync(update));
    void transition.current.ready.catch(() => {
    });
  };
  const viewControls = closable.map((panel) => ({ panel, pressed: open.has(panel.key) }));
  const renderPanel = (panel) => /* @__PURE__ */ jsx4(
    "section",
    {
      className: "pico-card pico-pg-panel",
      "data-view": panel.key,
      "aria-label": panel.title,
      style: { viewTransitionName: `pico-${transitionId}-panel-${panels.indexOf(panel)}` },
      children: /* @__PURE__ */ jsx4("div", { className: `pico-card-body${panel.flush ? " pico-card-body--flush" : ""}`, children: panel.content })
    },
    panel.key
  );
  const topBar = /* @__PURE__ */ jsx4(
    TopBar,
    {
      name,
      menu,
      groups: toolbar,
      onEvent,
      views: viewControls.map(({ panel, pressed }) => ({ key: panel.key, icon: panel.icon, label: `${panel.title}\u89C6\u56FE`, pressed, onClick: () => toggle(panel.key) }))
    }
  );
  if (state2.tree !== null) {
    const resize = (sizes) => onEvent({ type: "layout.change", value: { sizes: { ...state2.sizes, ...sizes } } });
    const content = (slot) => slot === "editor" ? editor2 : renderPanel(visible.find((panel) => panel.key === slot));
    const render = (node2, className) => "slot" in node2 ? /* @__PURE__ */ jsx4("div", { className: `pico-split pico-split--row${className === void 0 ? "" : ` ${className}`}`, children: /* @__PURE__ */ jsx4("div", { className: "pico-pane", style: { flex: "1 1 0" }, children: content(node2.slot) }) }) : /* @__PURE__ */ jsx4(
      Split,
      {
        direction: node2.split,
        className,
        sizes: state2.sizes,
        onResize: resize,
        panes: node2.children.map((child2) => ({ key: layoutKey(child2), content: "slot" in child2 ? content(child2.slot) : render(child2) }))
      }
    );
    const root = arrangeLayout(state2.tree, ["editor", ...visible.map((panel) => panel.key)]);
    return /* @__PURE__ */ jsxs2("div", { className: "pico-page", children: [
      /* @__PURE__ */ jsx4("style", { children: CARD_MOTION_STYLE }),
      topBar,
      root === null ? null : render(root, "pico-pg-main")
    ] });
  }
  return /* @__PURE__ */ jsxs2("div", { className: "pico-page", children: [
    /* @__PURE__ */ jsx4("style", { children: CARD_MOTION_STYLE }),
    topBar,
    /* @__PURE__ */ jsxs2("div", { className: "pico-split pico-split--row pico-pg-main", ref: main, children: [
      /* @__PURE__ */ jsx4("div", { className: "pico-pane", style: { flex: `0 0 ${visible.length === 0 ? 100 : ratio * 100}%`, viewTransitionName: `pico-${transitionId}-editor` }, children: editor2 }),
      visible.length > 0 && /* @__PURE__ */ jsxs2(Fragment3, { children: [
        /* @__PURE__ */ jsx4(
          Divider,
          {
            direction: "row",
            value: ratio * 100,
            min: MIN_RATIO * 100,
            max: MAX_RATIO * 100,
            onChange: (percent) => onEvent({ type: "layout.change", value: { ratio: percent / 100 } }),
            pixelsPerUnit: () => {
              const element = main.current;
              if (element === null) return 0;
              const style = getComputedStyle(element);
              return (element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)) / 100;
            }
          }
        ),
        /* @__PURE__ */ jsx4("div", { className: "pico-pane pico-world", children: visible.length > 0 && /* @__PURE__ */ jsx4(
          Split,
          {
            direction: "column",
            minPane: 160,
            className: "pico-pg-panels",
            panes: visible.map((panel) => ({ key: panel.key, content: renderPanel(panel) })),
            sizes: state2.sizes,
            onResize: (sizes) => onEvent({ type: "layout.change", value: { sizes } })
          }
        ) }, "world")
      ] })
    ] })
  ] });
}
var CARD_MOTION_STYLE = `
:root:has(.pico-page) { view-transition-name: none; }
:root:has(.pico-page)::view-transition { pointer-events: none; }
:root:has(.pico-page)::view-transition-group(*) { animation-duration: var(--pico-duration-move); animation-timing-function: var(--pico-ease-out); }
:root:has(.pico-page)::view-transition-old(*) { animation: pico-card-out var(--pico-duration-fast) ease-out both; }
:root:has(.pico-page)::view-transition-new(*) { animation: pico-card-in var(--pico-duration-move) var(--pico-ease-out) both; }
@keyframes pico-card-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
@keyframes pico-card-out { from { opacity: 1; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  :root:has(.pico-page)::view-transition-group(*), :root:has(.pico-page)::view-transition-old(*), :root:has(.pico-page)::view-transition-new(*) { animation: none; }
}
`;

// src/api/ui/components.tsx
var layout = stateful("layout", createLayout, [
  on("layout.reconfig", changeLayout, ["layout.changed"]),
  event("layout.reconfig", {}),
  on("layout.change", changeLayout, ["layout.changed"]),
  /** 省略的字段保持原值；open、sizes 整体替换。 */
  event("layout.change", {}),
  event("layout.changed", {})
]);
var theme = stateful("theme", createTheme, [
  on("theme.reconfig", changeTheme, ["theme.changed"]),
  event("theme.reconfig", {}),
  on("theme.change", changeTheme, ["theme.changed"]),
  event("theme.change", {}),
  event("theme.changed", {})
]);
var Widget2 = Widget;
var PlaygroundShell2 = PlaygroundShell;

// src/impl/dom.ts
function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className !== void 0) element.className = className;
  if (text !== void 0) element.textContent = text;
  return element;
}
var injectedStyles = /* @__PURE__ */ new WeakMap();
function ensureStyle(css) {
  let styles = injectedStyles.get(document);
  if (styles === void 0) {
    styles = /* @__PURE__ */ new Set();
    injectedStyles.set(document, styles);
  }
  if (styles.has(css)) return;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  styles.add(css);
}
function downloadText(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const anchor = node("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}
function emptySurface() {
  const element = node("div", "pico-empty-surface");
  element.setAttribute("aria-hidden", "true");
  return element;
}
function panelWatermark(svg) {
  ensureStyle(`
.pico-panel-watermark { position: absolute; top: 50%; left: 50%; z-index: 1; transform: translate(-50%, -50%); width: 52px; height: 52px; color: var(--pico-ink-soft); opacity: .08; pointer-events: none; }
.pico-panel-watermark svg { display: block; width: 100%; height: 100%; }
`);
  const element = node("span", "pico-panel-watermark");
  element.setAttribute("aria-hidden", "true");
  element.innerHTML = svg;
  return element;
}

// src/impl/debugger/index.ts
var TRACE_CSS = `
.pico-trace-player { position: relative; display: flex; min-width: 0; min-height: 0; height: 100%; overflow: hidden; }
.pico-trace-focus { position: relative; flex: 1; min-height: 0; height: 100%; overflow: hidden auto; border: 1px solid color-mix(in srgb, var(--pico-hairline) 72%, transparent); border-radius: var(--pico-radius); background: color-mix(in srgb, var(--pico-paper) 64%, transparent); scrollbar-width: thin; touch-action: none; user-select: none; cursor: ew-resize; }
/* padding \u4F1A\u6210\u4E3A border-box \u7684\u5BBD\u5EA6\u4E0B\u9650\uFF080 8px \u21D2 \u6700\u5C11 16px\uFF09\uFF0C\u5757\u5BBD\u5FC5\u987B\u4E25\u683C\u7B49\u4E8E\u65F6\u95F4\u69FD\u5BBD\uFF1B
   \u6807\u7B7E\u7F29\u8FDB\u7528 text-indent \u8868\u8FBE\u3002 */
.pico-trace-block { position: absolute; bottom: calc(var(--pico-trace-row) * 24px + 2px); left: var(--pico-trace-left); width: var(--pico-trace-width); height: 20px; overflow: hidden; border-radius: 3px; box-sizing: border-box; container-type: inline-size; color: var(--pico-flame-ink); background: linear-gradient(to right, var(--pico-trace-color) 0 var(--pico-trace-progress), color-mix(in srgb, var(--pico-trace-color) 28%, var(--pico-paper)) var(--pico-trace-progress) 100%); font: 600 var(--pico-size-xs)/20px var(--pico-font-mono); text-overflow: ellipsis; white-space: nowrap; text-indent: 6px; transition: filter var(--pico-duration-fast), box-shadow var(--pico-duration-fast); }
.pico-trace-block[data-palette="0"] { --pico-trace-color: var(--pico-flame-yellow); }
.pico-trace-block[data-palette="1"] { --pico-trace-color: var(--pico-flame-orange); }
.pico-trace-block[data-palette="2"] { --pico-trace-color: var(--pico-flame-salmon); }
.pico-trace-block[data-palette="3"] { --pico-trace-color: var(--pico-flame-red); }
.pico-trace-kind-loop, .pico-trace-kind-branch, .pico-trace-kind-iteration { text-align: center; text-indent: 0; }
.pico-trace-kind-stmt { text-indent: 0; }
.pico-trace-block-label { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; overflow: hidden; padding-inline: min(2px, 8cqw); font-size: min(var(--pico-size-xs), var(--pico-trace-label-size)); line-height: 1; }
.pico-trace-block:hover { z-index: 3; opacity: 1; filter: saturate(1.12); }
.pico-trace-block[data-current="true"] { z-index: 5; opacity: 1; box-shadow: inset 0 0 0 2px var(--pico-flame-ink), 0 0 0 2px var(--pico-accent); }
.pico-trace-focus[data-selection="true"] .pico-trace-block:not([data-selected="true"]):not([data-selected-column="true"]) { opacity: .2; filter: saturate(.3); }
.pico-trace-block[data-selected="true"] { z-index: 4; opacity: 1; filter: saturate(1.12); box-shadow: inset 0 0 0 1px var(--pico-on-accent), 0 0 0 1px var(--pico-accent); }
.pico-trace-block[data-selected-column="true"] { z-index: 5; opacity: 1; filter: saturate(1.12); box-shadow: inset 0 0 0 2px var(--pico-flame-ink), 0 0 0 2px var(--pico-accent); }
.pico-trace-canvas { position: relative; min-height: 100%; }
.pico-trace-cursor { position: absolute; z-index: 4; inset-block: 0; width: 2px; transform: translateX(-1px); background: var(--pico-accent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--pico-paper) 48%, transparent); pointer-events: none; }

/* \u7EC8\u6B62\u4F4D\u7F6E\u4E0E\u666E\u901A\u8BED\u53E5\u4F7F\u7528\u540C\u4E00\u89C6\u89C9\u8BED\u8A00\u3002 */
.pico-trace-bound { position: absolute; z-index: 3; bottom: 2px; height: 20px; box-sizing: border-box; border-radius: 3px; background: var(--pico-flame-yellow); pointer-events: none; }
.pico-trace-bound[data-phase="future"] { background: color-mix(in srgb, var(--pico-flame-yellow) 28%, var(--pico-paper)); }

/* \u6D6E\u5728\u8F68\u8FF9\u5DE6\u4E0A\u89D2\u7684\u7D27\u51D1 transport\u3002 */
.pico-trace-controls { position: absolute; z-index: 7; top: 6px; left: 6px; max-width: calc(100% - 12px); display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 3px; border: 1px solid var(--pico-hairline); border-radius: 8px; background: color-mix(in srgb, var(--pico-surface-raised) 94%, transparent); box-shadow: 0 2px 6px color-mix(in srgb, var(--pico-ink) 8%, transparent); }
.pico-trace-control-group { display: flex; align-items: center; gap: 1px; }
.pico-trace-control-group + .pico-trace-control-group { padding-left: 4px; border-left: 1px solid var(--pico-hairline); }
.pico-trace-control { width: 24px; height: 24px; min-width: 0; min-height: 0; padding: 0; border-radius: 5px; color: var(--pico-ink-soft); }
.pico-trace-control svg { width: 13px; height: 13px; }
.pico-trace-control[aria-pressed="true"] { color: var(--pico-accent); background: var(--pico-surface); }
.pico-trace-control:disabled { opacity: .35; cursor: default; }
.pico-trace-player .pico-trace-control:focus, .pico-trace-player .pico-trace-focus:focus { outline: none; }
.pico-trace-rate { min-width: 3ch; padding-inline: 3px; color: var(--pico-ink-soft); text-align: center; font: 500 var(--pico-size-xs)/1 var(--pico-font-mono); }
`;
var DEBUGGER_CSS = `
.pico-debugger { display: grid; flex: 1; width: 100%; height: 100%; min-width: 0; min-height: 0; grid-template-columns: clamp(176px, 30%, 260px) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); align-items: stretch; gap: var(--pico-space-3); overflow: hidden; }
.pico-debugger > [hidden] { display: none; }
.pico-debugger > .pico-empty-surface { position: relative; grid-column: 1 / -1; grid-row: 1; }
.pico-debugger-diff { position: relative; min-width: 0; min-height: 0; height: 100%; padding-right: var(--pico-space-3); border-right: 1px solid var(--pico-hairline); overflow-y: auto; scrollbar-width: thin; }
.pico-debugger-variables { display: flex; flex-direction: column; margin: 0; padding: 0; }
.pico-debugger-variable { display: grid; min-height: 30px; grid-template-columns: minmax(6ch, auto) minmax(0, 1fr); align-items: baseline; gap: var(--pico-space-2); padding: var(--pico-space-1) 2px; border-bottom: 1px solid color-mix(in srgb, var(--pico-hairline) 58%, transparent); font: 500 var(--pico-size-sm)/1.4 var(--pico-font-mono); }
.pico-debugger-name, .pico-debugger-value { margin: 0; }
/* \u540D\u79F0\u53F3\u5BF9\u9F50\uFF0Cauto \u5BBD\u9002\u914D\u5B9E\u9645\u540D\u79F0\u957F\u5EA6\uFF1B\u7B49\u53F7\u56FA\u5B9A\u5728\u7B2C 6 \u4E2A\u5B57\u7B26\u5217\u3002 */
.pico-debugger-name { display: grid; grid-template-columns: auto 2ch; align-items: baseline; min-width: 0; overflow: hidden; color: var(--pico-ink-soft); white-space: nowrap; }
.pico-debugger-name-label { display: block; min-width: 0; overflow: hidden; text-align: right; white-space: nowrap; }
.pico-debugger-name::after { content: "="; color: var(--pico-code-dim); text-align: right; }
.pico-debugger-value { min-width: 0; overflow-wrap: break-word; color: var(--pico-ink); }
.pico-debugger-value-text { color: inherit; white-space: pre-wrap; overflow-wrap: break-word; word-break: normal; }
/* \u957F\u503C\u6539\u5230\u7B49\u53F7\u4E0B\u65B9\u5E76\u5360\u6EE1\u6574\u884C\uFF0C\u4E0D\u8BA9\u53D8\u91CF\u540D\u5217\u6D6A\u8D39\u540E\u7EED\u884C\u5BBD\u5EA6\u3002 */
.pico-debugger-variable[data-expanded="true"] { grid-template-columns: minmax(0, 1fr); align-items: start; gap: 0; }
.pico-debugger-variable[data-expanded="true"] .pico-debugger-name { justify-self: start; }
.pico-debugger-variable[data-expanded="true"] .pico-debugger-value { grid-column: 1 / -1; width: 100%; padding-top: 1px; }
.pico-val-expanded { display: block; box-sizing: border-box; width: 100%; margin: 0; padding-left: 1ch; font: inherit; }
.pico-val--dict { color: var(--pico-code-dim); }
.pico-val--list { color: inherit; }
.pico-debugger-variable[data-change="added"] .pico-debugger-value,
.pico-debugger-variable[data-change="changed"] .pico-debugger-value { font-weight: 650; }
.pico-debugger-variable[data-change="removed"] { opacity: .5; }
.pico-debugger-variable[data-change="removed"] .pico-debugger-value { text-decoration: line-through; }
/* \u53EF\u9009\u4E2D\u7684\u53D8\u91CF\u884C\uFF1Ahover \u63D0\u793A\u53EF\u70B9\uFF0Cselected \u7528\u5F3A\u8C03\u8272\u8FB9\u6846\u6807\u51FA\u5F53\u524D\u5173\u6CE8\u7684\u5BF9\u8C61\u3002 */
.pico-debugger-variable[role="button"] { cursor: pointer; }
.pico-debugger-variable[role="button"]:hover { background: color-mix(in srgb, var(--pico-ink) 5%, transparent); }
.pico-debugger-variable[role="button"]:focus-visible { outline: 2px solid var(--pico-accent); outline-offset: -2px; }
.pico-debugger-variable[data-selected="true"] { background: color-mix(in srgb, var(--pico-accent) 12%, transparent); box-shadow: inset 2px 0 0 var(--pico-accent); }
.pico-debugger-variable-tools { position: sticky; z-index: 2; top: 0; display: flex; justify-content: flex-end; padding: 0 0 var(--pico-space-2); background: var(--pico-surface-raised); }
.pico-debugger-variable-tools button { height: 24px; padding: 0 7px; border: 1px solid var(--pico-hairline); border-radius: var(--pico-radius-sm); background: var(--pico-surface); color: var(--pico-ink-soft); cursor: pointer; font: 600 var(--pico-size-2xs)/1 var(--pico-font-ui); }
.pico-debugger-expand { position: sticky; z-index: 3; bottom: 0; float: right; width: 28px; height: 28px; margin: var(--pico-space-2) 0 0; padding: 5px; border: 1px solid var(--pico-hairline); border-radius: 8px; background: color-mix(in srgb, var(--pico-surface-raised) 94%, transparent); color: var(--pico-ink-soft); box-shadow: var(--pico-shadow); cursor: pointer; }
.pico-debugger-expand:hover { border-color: var(--pico-accent); color: var(--pico-accent-deep); background: var(--pico-accent-wash); }
.pico-debugger-expand svg { display: block; width: 100%; height: 100%; }
/* \u503C\u7C7B\u578B\u7740\u8272\uFF08\u4E0E\u8BED\u6CD5 token \u5BF9\u9F50\uFF09 */
.pico-val--str { color: var(--pico-syn-str); }
.pico-val--int, .pico-val--float { color: var(--pico-syn-num); }
.pico-val--bool, .pico-val--none { color: var(--pico-syn-key); font-weight: 600; }

`;
function showNumber(value) {
  return Number.isInteger(value) || !Number.isFinite(value) ? value : Number.parseFloat(value.toPrecision(12));
}
function format(value) {
  return JSON.stringify(value, (_key, item) => typeof item === "number" ? showNumber(item) : item);
}
function formatInline(value) {
  if (Array.isArray(value) && value.every((v) => v === null || typeof v !== "object")) {
    return `[${value.map(format).join(", ")}]`;
  }
  return format(value);
}
function formatExpanded(value) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value);
    if (entries.every(([, item]) => item === null || typeof item !== "object" || Array.isArray(item) && item.every((part) => part === null || typeof part !== "object"))) {
      return `{
${entries.map(([key, item]) => `  ${format(key)}: ${formatInline(item)}`).join(",\n")}
}`;
    }
  }
  return Array.isArray(value) && value.every((item) => item === null || typeof item !== "object") ? formatInline(value) : JSON.stringify(value, (_key, item) => typeof item === "number" ? showNumber(item) : item, 2);
}
function typeTag(value) {
  if (typeof value === "string") return "str";
  if (typeof value === "number") return Number.isInteger(value) ? "int" : "float";
  if (typeof value === "boolean") return "bool";
  if (value === null) return "none";
  return Array.isArray(value) ? "list" : "dict";
}
function expanded(value) {
  return format(value).length > 48 || value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 1;
}
function valueElement(variable, isExpanded) {
  if (variable.value === void 0) {
    return node("span", "pico-debugger-value-text", variable.text);
  }
  const value = variable.value;
  if (isExpanded && value !== null && typeof value === "object") {
    const pre = node("pre", `pico-debugger-value-text pico-val-expanded pico-val--${typeTag(value)}`);
    pre.textContent = formatExpanded(value);
    return pre;
  }
  const span = node("span", `pico-debugger-value-text pico-val--${typeTag(value)}`);
  span.textContent = variable.text;
  return span;
}
function topFrame(state2) {
  return state2.frames?.at(-1) ?? null;
}
function scopedVariables(state2) {
  return { ...state2.globals ?? {}, ...topFrame(state2)?.locals ?? {} };
}
function findRow(root, name) {
  for (const child2 of root.children) {
    const element = child2;
    if (element.className === "pico-debugger-variable" && element.dataset.name === name) return element;
    const found = findRow(element, name);
    if (found !== null) return found;
  }
  return null;
}
function variableRows(variables2, selected, onSelect) {
  const list = node("dl", "pico-debugger-variables");
  for (const variable of variables2) {
    const { name, value } = variable;
    const row = node("div", "pico-debugger-variable");
    row.dataset.name = name;
    if (variable.change !== null) row.dataset.change = variable.change;
    if (name === selected) row.dataset.selected = "true";
    if (value !== void 0) {
      row.tabIndex = 0;
      row.setAttribute("role", "button");
      row.setAttribute("aria-pressed", String(name === selected));
      row.title = `\u9009\u4E2D\u53D8\u91CF ${name}`;
      row.addEventListener("click", () => onSelect(name));
      row.addEventListener("keydown", (event2) => {
        if (event2.key === "Enter" || event2.key === " ") {
          event2.preventDefault();
          onSelect(name);
        }
      });
    }
    const isExpanded = value !== void 0 && expanded(value);
    if (isExpanded) row.dataset.expanded = "true";
    const valueNode = node("dd", "pico-debugger-value");
    valueNode.append(valueElement(variable, isExpanded));
    const nameNode = node("dt", "pico-debugger-name");
    nameNode.append(nameLabel(name));
    row.append(nameNode, valueNode);
    list.append(row);
  }
  return list;
}
function nameLabel(name) {
  return node("span", "pico-debugger-name-label", name);
}
function maxIndex(trace2) {
  return trace2 === null ? 0 : trace2.steps.length + 1;
}
function variablePath(name) {
  return ["variables", name];
}
function variableName(path) {
  return path.length === 2 && path[0] === "variables" && typeof path[1] === "string" ? path[1] : null;
}
function resolveDebuggerVariableSelection(selection2) {
  const name = variableName(selection2.path);
  if (name === null || !Number.isInteger(selection2.traceIndex) || selection2.traceIndex < 0 || selection2.traceIndex > selection2.run.steps.length + 1) return null;
  const variables2 = scopedVariables(selection2.run.at(selection2.traceIndex));
  return Object.hasOwn(variables2, name) ? { name, value: variables2[name] } : null;
}
function debuggerSourceOccurrences(trace2, selection2) {
  if (trace2 === null) return [];
  const from = sourceLineAt(selection2.source, selection2.from);
  const to = sourceLineAt(selection2.source, Math.max(selection2.from, selection2.to - 1));
  return tracePositions(trace2).slice(1, -1).flatMap((position2, index) => {
    const step2 = trace2.steps[index];
    if (step2?.event !== "stmt" || position2.line === null || position2.line < from || position2.line > to) return [];
    return [{ ordinal: 0, traceIndex: index + 1, line: position2.line }];
  }).map((item, index) => ({ ...item, ordinal: index + 1 }));
}
function debuggerVariableTimeline(selection2) {
  const name = variableName(selection2.path);
  if (name === null) return [];
  const points = [];
  let previousState = selection2.run.initialState;
  let previous = scopedVariables(previousState);
  for (let traceIndex = 1; traceIndex <= selection2.run.steps.length + 1; traceIndex += 1) {
    const state2 = selection2.run.at(traceIndex);
    const current = scopedVariables(state2);
    const had = Object.hasOwn(previous, name);
    const has = Object.hasOwn(current, name);
    const before = previous[name];
    const value = current[name];
    if (had !== has || had && JSON.stringify(before) !== JSON.stringify(value)) {
      points.push({
        traceIndex,
        line: previousState.line,
        change: !had && has ? "created" : had && !has ? "removed" : "changed",
        before,
        value
      });
    }
    previousState = state2;
    previous = current;
  }
  return points;
}
function debuggerVariablesAt(position2) {
  const current = scopedVariables(position2.state);
  const previous = scopedVariables(position2.previous);
  return Object.freeze([.../* @__PURE__ */ new Set([...Object.keys(current), ...Object.keys(previous)])].map((name) => {
    const before = previous[name];
    const value = current[name];
    const change2 = !Object.hasOwn(previous, name) ? "added" : !Object.hasOwn(current, name) ? "removed" : JSON.stringify(before) !== JSON.stringify(value) ? "changed" : null;
    return Object.freeze({ name, value, change: change2, text: value === void 0 ? "\u2014" : formatInline(value) });
  }));
}
function sourceLineAt(source, offset) {
  return source.slice(0, offset).split("\n").length;
}
function frameName(value) {
  if (value === null || Array.isArray(value) || typeof value !== "object") return null;
  const name = value.name;
  return typeof name === "string" ? name : null;
}
function frameNames(frames) {
  return (frames ?? []).map((frame2) => frame2.name);
}
function visibleFrames(frames) {
  return frames.filter((name) => name !== "<module>");
}
function tracePositions(trace2) {
  let line = trace2.initialState.line;
  let frames = frameNames(trace2.initialState.frames);
  const positions = [{ line, frames: visibleFrames(frames) }];
  for (const step2 of trace2.steps) {
    for (const change2 of step2.changes) {
      if (change2.op === "put" && change2.path.length === 1 && change2.path[0] === "line") {
        line = typeof change2.value === "number" ? change2.value : null;
      } else if (change2.path[0] === "frames") {
        if (change2.op === "append" && change2.path.length === 1) {
          const name = frameName(change2.value);
          if (name !== null) frames.push(name);
        } else if (change2.op === "remove" && change2.path.length === 2 && change2.path[1] === -1) {
          frames.pop();
        } else if (change2.op === "put" && change2.path.length === 1) {
          frames = (Array.isArray(change2.value) ? change2.value : []).map(frameName).filter((name) => name !== null);
        } else if (change2.op === "put" && change2.path.length === 3 && change2.path[2] === "name" && typeof change2.value === "string") {
          const rawIndex = change2.path[1];
          const index = rawIndex === -1 ? frames.length - 1 : rawIndex;
          if (typeof index === "number" && index >= 0 && index < frames.length) frames[index] = change2.value;
        }
      }
    }
    positions.push({ line, frames: visibleFrames(frames) });
  }
  positions.push({ line: trace2.finalState.line, frames: visibleFrames(frameNames(trace2.finalState.frames)) });
  return positions;
}
function functionBlocks(positions) {
  const blocks = [];
  const open = [];
  for (let index = 0; index < positions.length; index += 1) {
    const names = positions[index].frames;
    let shared = 0;
    while (shared < open.length && shared < names.length && open[shared].name === names[shared]) shared += 1;
    while (open.length > shared) {
      const span = open.pop();
      if (index > span.start) blocks.push({ kind: "function", label: `${span.name}()`, line: null, row: open.length, start: span.start, end: index });
    }
    while (open.length < names.length) open.push({ name: names[open.length], start: index });
  }
  while (open.length > 0) {
    const span = open.pop();
    blocks.push({ kind: "function", label: `${span.name}()`, line: null, row: open.length, start: span.start, end: positions.length });
  }
  return blocks;
}
function branchEnd(branch) {
  return Math.max(branch.line, ...branch.arms.map((arm) => arm.endLine));
}
function controlPath(structures, line) {
  if (line === null) return [];
  for (const structure of structures) {
    const end = structure.kind === "loop" ? structure.endLine : branchEnd(structure);
    if (line < structure.line || line > end) continue;
    if (structure.kind === "loop") return [structure, ...controlPath(structure.body, line)];
    const arm = structure.arms.find((candidate) => candidate.line <= line && line <= candidate.endLine);
    return [structure, ...controlPath(arm?.body ?? [], line)];
  }
  return [];
}
function controlBlocks(structures, positions) {
  const blocks = [];
  const open = [];
  const close = (entry, end) => {
    if (entry.structure.kind === "loop" && end > entry.iterationStart) {
      blocks.push({
        kind: "iteration",
        label: `#${entry.iteration}`,
        line: entry.structure.line,
        row: entry.row + 1,
        start: entry.iterationStart,
        end
      });
    }
    if (end > entry.start) {
      const structureEnd = entry.structure.kind === "loop" ? entry.structure.endLine : branchEnd(entry.structure);
      blocks.push({
        kind: entry.structure.kind,
        label: `L${entry.structure.line}\u2013${structureEnd}`,
        line: entry.structure.line,
        row: entry.row,
        start: entry.start,
        end
      });
    }
  };
  for (let index = 0; index < positions.length; index += 1) {
    const position2 = positions[index];
    const frameKey = position2.frames.join("\0");
    const path = controlPath(structures, position2.line);
    let shared = 0;
    while (shared < open.length && shared < path.length && open[shared].structure === path[shared] && open[shared].frameKey === frameKey) shared += 1;
    while (open.length > shared) close(open.pop(), index);
    while (open.length < path.length) {
      const depth = open.length;
      const row = position2.frames.length + path.slice(0, depth).reduce((count, parent) => count + (parent.kind === "loop" ? 2 : 1), 0);
      open.push({ structure: path[depth], frameKey, start: index, row, iteration: 1, iterationStart: index });
    }
    const previousLine = index === 0 ? null : positions[index - 1].line;
    for (let depth = 0; depth < shared; depth += 1) {
      const entry = open[depth];
      if (entry.structure.kind === "loop" && position2.line === entry.structure.line && previousLine !== position2.line && index > entry.iterationStart) {
        blocks.push({
          kind: "iteration",
          label: `#${entry.iteration}`,
          line: entry.structure.line,
          row: entry.row + 1,
          start: entry.iterationStart,
          end: index
        });
        entry.iteration += 1;
        entry.iterationStart = index;
      }
    }
    if (position2.line !== null) {
      const row = position2.frames.length + path.reduce((count, parent) => count + (parent.kind === "loop" ? 2 : 1), 0);
      blocks.push({ kind: "stmt", label: String(position2.line), line: position2.line, row, start: index, end: index + 1 });
    }
  }
  while (open.length > 0) close(open.pop(), positions.length);
  return blocks;
}
function flameBlocks(structures, positions) {
  const blocks = [...functionBlocks(positions), ...controlBlocks(structures, positions)];
  return blocks.sort((left, right) => left.row - right.row || left.start - right.start || right.end - left.end);
}
function flamePalette(block) {
  let hash = block.row * 31 + block.start * 17 + block.end;
  for (const char of block.label) hash = hash * 33 + char.charCodeAt(0) | 0;
  return Math.abs(hash) % 4;
}
var TRANSPORT_ICONS = {
  stopped: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="3"/></svg>',
  start: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3v10" stroke="currentColor" stroke-width="2"/><path d="M12 3 5 8l7 5z" fill="currentColor"/></svg>',
  end: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13 3v10" stroke="currentColor" stroke-width="2"/><path d="m4 3 7 5-7 5z" fill="currentColor"/></svg>',
  previous: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  forward: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2 13 8l-8 4.8z" fill="currentColor"/></svg>',
  reverse: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 3.2 3 8l8 4.8z" fill="currentColor"/></svg>'
};
var MIN_TRACE_SLOT = 20;
var MAX_VISIBLE_SLOTS = 200;
var NO_STRUCTURES = [];
var debuggers = /* @__PURE__ */ new WeakMap();
function createDebugger(options, lifecycle) {
  const core = new DebuggerCore(options?.variablesExpandable === true);
  debuggers.set(core.state, core);
  elements.set(core.element, core);
  lifecycle.onDispose(() => core.dispose());
  return core.state;
}
function debuggerElement(state2) {
  return debuggers.get(state2).element;
}
var elements = /* @__PURE__ */ new WeakMap();
function debuggerAnchorRectImpl(element, anchor) {
  return elements.get(element)?.anchorRect(anchor) ?? null;
}
function renderDebugger(state2, event2) {
  debuggers.get(state2).receive(event2);
}
function initDebugger(state2, _event, context) {
  debuggers.get(state2).connect(context.emit);
}
function selectDebuggerVariable(state2, event2, context) {
  const selection2 = debuggers.get(state2).variableSelection(event2.name);
  context.emit({ type: "selection.select", selection: selection2 });
}
function observeDebuggerSelection(state2, event2, context) {
  debuggers.get(state2).receiveSelection(event2, context.emit);
}
var DebuggerCore = class {
  constructor(variablesExpandable) {
    this.variablesExpandable = variablesExpandable;
    this.state = Object.freeze({});
  }
  variablesExpandable;
  projection = {
    type: "debugger.render",
    trace: null,
    analysis: null,
    position: null,
    playing: false,
    rate: 1,
    canAdjust: { reverse: false, forward: false }
  };
  state;
  element = node("div", "pico-widget pico-debugger");
  emit = null;
  selection = null;
  selected = null;
  selectedSteps = [];
  showAllVariables = false;
  viewport = Object.freeze({ first: 1, count: 0 });
  get trace() {
    return this.projection.trace;
  }
  get traceIndex() {
    return this.projection.position?.traceIndex ?? 0;
  }
  get hasFocusedSelection() {
    return this.selection?.kind === "source" || this.selection?.kind === "runtime-variable" && this.selection.run === this.trace;
  }
  get transport() {
    return !this.projection.playing ? "stopped" : this.projection.rate < 0 ? "reverse" : "forward";
  }
  player = node("section", "pico-trace-player");
  flame = node("div", "pico-trace-focus");
  diff = node("div", "pico-debugger-diff");
  empty = emptySurface();
  controls = node("div", "pico-trace-controls");
  buttons = /* @__PURE__ */ new Map();
  rate = node("span", "pico-trace-rate");
  /** 落点 → 行号：火焰图布局的副产物，课程节拍按落点读它，不重放历史状态。 */
  lines = [];
  blocks = [];
  dragPointerId = null;
  observer = null;
  events = new AbortController();
  disposed = false;
  initialized = false;
  canvas = node("div", "pico-trace-canvas");
  connect(emit) {
    if (this.initialized) return;
    this.initialized = true;
    this.emit = emit;
    this.element.classList.add("pico-widget", "pico-debugger");
    ensureStyle(TRACE_CSS);
    ensureStyle(DEBUGGER_CSS);
    this.empty.append(panelWatermark(ICONS.debug));
    this.player.append(this.controls, this.flame);
    this.element.replaceChildren(this.empty, this.diff, this.player);
    this.diff.hidden = true;
    this.player.hidden = true;
    this.flame.tabIndex = 0;
    this.flame.setAttribute("role", "img");
    this.flame.setAttribute("aria-label", "\u6267\u884C\u8F68\u8FF9\u65F6\u95F4\u8F74\uFF1B\u5DE6\u53F3\u952E\u5355\u6B65\uFF0CHome \u5230\u8D77\u70B9\uFF0CEnd \u5230\u7EC8\u70B9");
    this.diff.setAttribute("aria-live", "polite");
    const eventOptions = { signal: this.events.signal };
    this.controls.setAttribute("role", "group");
    this.controls.setAttribute("aria-label", "\u8F68\u8FF9\u64AD\u653E\u63A7\u4EF6");
    const groups = [
      ["\u8DF3\u8F6C", [["start", "\u8DF3\u5230\u8D77\u70B9"], ["end", "\u8DF3\u5230\u7EC8\u70B9"]]],
      ["\u5355\u6B65", [["previous", "\u4E0A\u4E00\u6B65"], ["next", "\u4E0B\u4E00\u6B65"]]],
      ["\u64AD\u653E", [["reverse", "\u53CD\u5411\u64AD\u653E"], ["stopped", "\u6682\u505C"], ["forward", "\u6B63\u5411\u64AD\u653E"]]]
    ];
    for (const [label, actions] of groups) {
      const group = node("div", "pico-trace-control-group");
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", label);
      for (const [action, title] of actions) {
        const button = node("button", "pico-ghost-btn pico-trace-control");
        button.type = "button";
        button.title = title;
        button.setAttribute("aria-label", title);
        button.dataset.action = action;
        button.innerHTML = TRANSPORT_ICONS[action];
        button.addEventListener("click", () => {
          if (this.disposed || button.disabled) return;
          this.endDrag();
          if (action === "forward" || action === "reverse") emit({ type: "debugger.adjust", delta: action === "forward" ? 1 : -1 });
          else if (action === "stopped") this.stopTransport(emit);
          else if ((action === "next" || action === "previous") && this.hasFocusedSelection) {
            const next = action === "next" ? this.nextSelectedIndex() : this.previousSelectedIndex();
            if (next !== null) this.move(next, emit);
          } else this.move(action === "start" ? 1 : action === "end" ? maxIndex(this.trace) : this.traceIndex + (action === "next" ? 1 : -1), emit);
        }, eventOptions);
        this.buttons.set(action, button);
        group.append(button);
      }
      this.controls.append(group);
    }
    this.rate.setAttribute("role", "status");
    this.rate.setAttribute("aria-live", "polite");
    this.controls.append(this.rate);
    this.player.addEventListener("keydown", (event2) => {
      if (event2.altKey || event2.ctrlKey || event2.metaKey || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event2.key)) return;
      event2.preventDefault();
      this.endDrag();
      const selected = event2.key === "ArrowLeft" ? this.previousSelectedIndex() : event2.key === "ArrowRight" ? this.nextSelectedIndex() : null;
      this.move(event2.key === "Home" ? 1 : event2.key === "End" ? maxIndex(this.trace) : this.hasFocusedSelection && selected !== null ? selected : this.traceIndex + (event2.key === "ArrowLeft" ? -1 : 1), emit);
    }, eventOptions);
    this.flame.addEventListener("pointerdown", (event2) => {
      if (event2.button !== 0 || event2.isPrimary === false || this.trace === null || this.dragPointerId !== null) return;
      event2.preventDefault();
      this.flame.focus({ preventScroll: true });
      this.dragPointerId = event2.pointerId;
      try {
        this.flame.setPointerCapture(event2.pointerId);
      } catch {
      }
      this.move(this.stepFromPointer(event2.clientX), emit);
    }, eventOptions);
    this.flame.addEventListener("pointermove", (event2) => {
      if (event2.pointerId !== this.dragPointerId) return;
      if ((event2.buttons & 1) === 0) {
        this.endDrag();
        return;
      }
      this.move(this.stepFromPointer(event2.clientX), emit);
    }, eventOptions);
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      this.flame.addEventListener(type, (event2) => {
        if (event2.pointerId === this.dragPointerId) this.endDrag();
      }, eventOptions);
    }
    window.addEventListener("blur", () => {
      this.endDrag();
      this.stopTransport(emit);
    }, eventOptions);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.endDrag();
        this.stopTransport(emit);
      }
    }, eventOptions);
    if (typeof ResizeObserver !== "undefined") {
      let width = this.flame.clientWidth;
      this.observer = new ResizeObserver(() => {
        const next = this.flame.clientWidth;
        if (next === width) return;
        width = next;
        if (this.trace !== null) this.paint();
      });
      this.observer.observe(this.flame);
    }
    this.updateControls();
  }
  receive(event2) {
    if (this.disposed) return;
    const { trace: trace2 } = event2;
    const structures = event2.analysis?.controlFlow ?? NO_STRUCTURES;
    const traceChanged = trace2 !== this.projection.trace;
    const structuresChanged = structures !== (this.projection.analysis?.controlFlow ?? NO_STRUCTURES);
    this.projection = { ...event2 };
    if (traceChanged) this.endDrag();
    if (traceChanged || structuresChanged) {
      const positions = trace2 === null ? [] : tracePositions(trace2);
      this.lines = positions.map((position2) => position2.line);
      this.blocks = trace2 === null ? [] : flameBlocks(structures, positions);
    }
    this.refreshSelection();
    this.empty.hidden = trace2 !== null;
    this.diff.hidden = trace2 === null;
    this.player.hidden = trace2 === null;
    this.updateControls();
    this.paint();
    this.paintDiff();
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.endDrag();
    this.observer?.disconnect();
    this.events.abort();
    this.element.replaceChildren();
    this.element.remove();
    this.projection = { type: "debugger.render", trace: null, analysis: null, position: null, playing: false, rate: 1, canAdjust: { reverse: false, forward: false } };
    this.viewport = Object.freeze({ first: 1, count: 0 });
    this.blocks = [];
    this.lines = [];
  }
  /** 当前语句后果：合并作用域相对上一步的变量 diff；调用栈由火焰图自示。 */
  paintDiff() {
    if (this.trace === null) {
      this.diff.replaceChildren();
      return;
    }
    const position2 = this.projection.position;
    if (position2 === null) {
      this.diff.replaceChildren();
      return;
    }
    const variables2 = debuggerVariablesAt(position2);
    const visible = this.selected === null || this.showAllVariables ? variables2 : variables2.filter((item) => item.name === this.selected);
    const rows = variableRows(visible, this.selected, (name) => this.selectVariable(name));
    const children2 = [];
    if (this.selected !== null) {
      const tools = node("div", "pico-debugger-variable-tools");
      const toggle = node("button", "", this.showAllVariables ? "\u53EA\u770B\u5F53\u524D" : "\u5168\u90E8");
      toggle.type = "button";
      toggle.setAttribute("aria-pressed", String(this.showAllVariables));
      toggle.addEventListener("click", () => {
        this.showAllVariables = !this.showAllVariables;
        this.paintDiff();
      });
      tools.append(toggle);
      children2.push(tools);
    }
    children2.push(rows);
    if (this.variablesExpandable) {
      const expand = node("button", "pico-debugger-expand");
      expand.type = "button";
      expand.title = "\u653E\u5927\u53D8\u91CF\u89C6\u56FE";
      expand.setAttribute("aria-label", "\u653E\u5927\u53D8\u91CF\u89C6\u56FE");
      expand.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.2 2.5H2.5v3.7M9.8 13.5h3.7V9.8M2.5 6.2 6.4 2.3M13.5 9.8 9.6 13.7"/></svg>';
      expand.addEventListener("click", () => this.emit?.({ type: "debugger.variables.expand" }));
      children2.push(expand);
    }
    this.diff.replaceChildren(...children2);
  }
  selectVariable(name) {
    if (!this.emit) return;
    this.emit({ type: "debugger.variable", name });
  }
  /** 变量名对当前观察位置的一次引用；Debugger 不保存选中态。 */
  variableSelection(name) {
    if (this.selected === name) return null;
    const { trace: trace2, position: position2 } = this.projection;
    if (trace2 === null || position2 === null) return null;
    return { kind: "runtime-variable", run: trace2, path: variablePath(name) };
  }
  /** 只读：时间轴窗口中某一步的槽位（纵向为时间轴可视区域），或变量栏中某个变量的行。 */
  anchorRect(anchor) {
    if (anchor.kind === "variable") {
      const row = findRow(this.diff, anchor.name);
      return row === null ? null : row.getBoundingClientRect();
    }
    const { first, count } = this.viewport;
    if (this.trace === null || count === 0 || anchor.traceIndex < first || anchor.traceIndex >= first + count) return null;
    const area = this.canvas.getBoundingClientRect();
    const visible = this.flame.getBoundingClientRect();
    const width = area.width / count;
    return new DOMRect(area.left + width * (anchor.traceIndex - first), visible.top, width, visible.height);
  }
  receiveSelection(event2, emit) {
    if (this.disposed) return;
    this.selection = event2.current;
    const next = this.selection !== null && (this.selection.kind === "runtime-value" || this.selection.kind === "runtime-variable") ? variableName(this.selection.path) : null;
    const unchanged = next === this.selected;
    this.selected = next;
    if (!unchanged) this.showAllVariables = false;
    this.refreshSelection();
    this.updateControls();
    this.paint();
    if (event2.current !== null && this.hasFocusedSelection && this.selectedSteps.length > 0 && this.projection.position?.atEnd === true) {
      this.move(this.selectedSteps[0], emit);
    }
    if (unchanged) return;
    this.paintDiff();
  }
  refreshSelection() {
    const current = this.selection;
    this.selectedSteps = current?.kind === "source" ? debuggerSourceOccurrences(this.trace, current).map((item) => item.traceIndex) : current?.kind === "runtime-variable" && current.run === this.trace ? debuggerVariableTimeline(current).map((point) => point.traceIndex) : [];
  }
  paint() {
    if (this.trace === null) {
      this.flame.replaceChildren();
      this.viewport = Object.freeze({ first: 1, count: 0 });
      return;
    }
    const finalIndex = maxIndex(this.trace);
    const measuredSlots = this.flame.clientWidth > 0 ? Math.max(1, Math.floor(this.flame.clientWidth / MIN_TRACE_SLOT)) : MAX_VISIBLE_SLOTS;
    const count = Math.max(1, Math.min(MAX_VISIBLE_SLOTS, measuredSlots, finalIndex));
    const first = Math.max(1, Math.min(this.traceIndex - Math.floor(count / 2), finalIndex + 1 - count));
    this.viewport = Object.freeze({ first, count });
    const viewEnd = this.viewport.first + this.viewport.count;
    const active2 = this.blocks.filter((block) => block.start <= this.traceIndex && this.traceIndex < block.end);
    const deepest = active2.reduce((found, block) => found === null || block.row >= found.row ? block : found, null);
    const nodes = [];
    const hasSelection = this.hasFocusedSelection;
    const selectedSteps = new Set(this.selectedSteps);
    const selectedColumn = hasSelection && selectedSteps.has(this.traceIndex);
    this.flame.dataset.selection = String(hasSelection);
    for (const block of this.blocks) {
      const left = Math.max(block.start, this.viewport.first);
      const right = Math.min(block.end, viewEnd);
      if (right <= left) continue;
      const width = 100 * (right - left) / this.viewport.count;
      const blockNode = node("span", `pico-trace-block pico-trace-kind-${block.kind}`);
      blockNode.dataset.kind = block.kind;
      blockNode.dataset.palette = String(flamePalette(block));
      blockNode.dataset.phase = block.start > this.traceIndex ? "future" : block.end <= this.traceIndex ? "past" : "active";
      blockNode.dataset.current = String(block === deepest);
      const selected = block.kind === "stmt" && selectedSteps.has(block.start);
      blockNode.dataset.selected = String(selected);
      blockNode.dataset.selectedColumn = String(selectedColumn && block.start <= this.traceIndex && this.traceIndex < block.end);
      blockNode.style.setProperty("--pico-trace-left", `${100 * (left - this.viewport.first) / this.viewport.count}%`);
      blockNode.style.setProperty("--pico-trace-width", `${width}%`);
      blockNode.style.setProperty("--pico-trace-row", String(block.row));
      const progress = 100 * Math.max(0, Math.min(right, this.traceIndex + 0.5) - left) / (right - left);
      blockNode.style.setProperty("--pico-trace-progress", `${progress}%`);
      blockNode.title = `${block.label}${block.line === null ? "" : ` \xB7 \u7B2C ${block.line} \u884C`}\uFF08\u4F4D\u7F6E ${block.start}..${block.end}\uFF09`;
      if (block.kind === "iteration") blockNode.textContent = width >= 4 ? block.label : "";
      else if (block.kind === "stmt") {
        const label = node("span", "pico-trace-block-label", block.label);
        const fit = 100 / (block.label.length * 0.62 + 0.3);
        label.style.setProperty("--pico-trace-label-size", `${fit}cqw`);
        blockNode.append(label);
      } else if (block.kind === "branch") blockNode.textContent = width >= 8 ? `\u2442 ${block.label}` : "\u2442";
      else if (block.kind === "loop") blockNode.textContent = width >= 10 ? `\u21BB ${block.label}` : "\u21BB";
      else blockNode.textContent = width >= 10 ? `\u0192 ${block.label}` : width >= 4 ? "\u0192 fn" : "";
      nodes.push(blockNode);
    }
    const cursor = node("div", "pico-trace-cursor");
    cursor.setAttribute("aria-hidden", "true");
    cursor.style.left = `${100 * (this.traceIndex - this.viewport.first + 0.5) / this.viewport.count}%`;
    const maxRow = this.blocks.reduce((found, block) => Math.max(found, block.row), -1);
    this.canvas.style.height = `${maxRow * 24 + 24}px`;
    const bound = (index, label) => {
      const element = node("div", "pico-trace-bound");
      element.style.left = `${100 * (index - this.viewport.first) / this.viewport.count}%`;
      element.style.width = `${100 / this.viewport.count}%`;
      element.dataset.phase = index > this.traceIndex ? "future" : "past";
      element.title = label;
      return element;
    };
    this.canvas.replaceChildren(
      ...nodes,
      cursor,
      bound(finalIndex, "\u7A0B\u5E8F\u7ED3\u675F")
    );
    this.flame.replaceChildren(this.canvas);
  }
  move(traceIndex, emit) {
    if (!this.disposed && this.trace !== null) emit({ type: "debugger.seek", traceIndex });
  }
  nextSelectedIndex() {
    if (this.selectedSteps.length === 0) return null;
    return this.selectedSteps.find((index) => index > this.traceIndex) ?? this.selectedSteps[0];
  }
  previousSelectedIndex() {
    if (this.selectedSteps.length === 0) return null;
    return [...this.selectedSteps].reverse().find((index) => index < this.traceIndex) ?? this.selectedSteps.at(-1);
  }
  endDrag() {
    const pointer = this.dragPointerId;
    this.dragPointerId = null;
    if (pointer !== null) {
      try {
        this.flame.releasePointerCapture(pointer);
      } catch {
      }
    }
  }
  stepFromPointer(clientX) {
    const rect = this.flame.getBoundingClientRect();
    const width = this.flame.clientWidth;
    if (width <= 0) return this.traceIndex;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / width));
    return Math.floor(this.viewport.first + ratio * this.viewport.count);
  }
  updateControls() {
    const atStart = this.traceIndex <= 1;
    const atEnd = this.traceIndex >= maxIndex(this.trace);
    this.controls.dataset.state = this.transport;
    for (const [action, button] of this.buttons) {
      button.disabled = this.trace === null || (action === "start" ? atStart : action === "previous" ? this.hasFocusedSelection ? this.selectedSteps.length === 0 : atStart : action === "end" ? atEnd : action === "next" ? this.hasFocusedSelection ? this.selectedSteps.length === 0 : atEnd : action === "reverse" ? !this.projection.canAdjust.reverse : action === "forward" ? !this.projection.canAdjust.forward : this.transport === "stopped");
      if (action === "next") {
        const label = this.hasFocusedSelection ? "\u4E0B\u4E00\u6B21\u76F8\u5173\u6267\u884C" : "\u4E0B\u4E00\u6B65";
        button.title = label;
        button.setAttribute("aria-label", label);
      }
      if (action === "previous") {
        const label = this.hasFocusedSelection ? "\u4E0A\u4E00\u6B21\u76F8\u5173\u6267\u884C" : "\u4E0A\u4E00\u6B65";
        button.title = label;
        button.setAttribute("aria-label", label);
      }
      if (action === "forward" || action === "reverse") {
        button.setAttribute("aria-pressed", String(action === this.transport));
        const label = action === "forward" ? this.transport === "reverse" ? "\u964D\u4F4E\u53CD\u5411\u901F\u5EA6" : "\u589E\u52A0\u6B63\u5411\u901F\u5EA6" : this.transport === "forward" ? "\u964D\u4F4E\u6B63\u5411\u901F\u5EA6" : "\u589E\u52A0\u53CD\u5411\u901F\u5EA6";
        button.title = label;
        button.setAttribute("aria-label", label);
      }
    }
    this.rate.hidden = !this.projection.playing;
    this.rate.textContent = !this.projection.playing ? "" : `${Math.abs(this.projection.rate)}\xD7`;
    this.rate.setAttribute("aria-label", !this.projection.playing ? "\u5DF2\u6682\u505C" : `${this.transport === "forward" ? "\u6B63\u5411" : "\u53CD\u5411"} ${this.rate.textContent}`);
  }
  stopTransport(emit) {
    if (!this.disposed && this.projection.playing) emit({ type: "debugger.pause" });
  }
};

// src/api/ui/debugger.ts
var debuggerComponent = stateful("debugger", createDebugger, [
  on("debugger.render", renderDebugger, []),
  // 轨迹控件与点选变量是两组独立的输出口：每条 handler 拿到自己的 emit 通道，
  // 所以 selection.select 不能并进 initDebugger 的输出声明。
  on("debugger.init", initDebugger, ["debugger.seek", "debugger.adjust", "debugger.pause", "debugger.variable", "debugger.variables.expand"]),
  on("debugger.variable", selectDebuggerVariable, ["selection.select"]),
  on("selection.changed", observeDebuggerSelection, ["debugger.seek"]),
  event("debugger.init", {}),
  event("debugger.render", {}),
  event("debugger.adjust", {}),
  event("debugger.seek", {}),
  event("debugger.pause", {}),
  /** Debugger 点选变量：只带变量名，运行与位置由 Debugger 自己补齐。 */
  event("debugger.variable", {}),
  event("debugger.variables.expand", {}),
  event("selection.changed", {})
], debuggerElement);
function resolveDebuggerVariable(selection2) {
  return resolveDebuggerVariableSelection(selection2);
}
function sourceOccurrences(trace2, selection2) {
  return debuggerSourceOccurrences(trace2, selection2);
}
function variableTimeline(selection2) {
  return debuggerVariableTimeline(selection2);
}
function debuggerAnchorRect(element, anchor) {
  return debuggerAnchorRectImpl(element, anchor);
}
function variablesAt(position2) {
  return debuggerVariablesAt(position2);
}

// src/impl/editor/index.ts
import { Compartment, StateEffect, StateField, EditorState as CMEditorState } from "./libs/codemirror.js";
import { Decoration, EditorView, drawSelection, keymap, lineNumbers } from "./libs/codemirror.js";
import { autocompletion } from "./libs/codemirror.js";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "./libs/codemirror.js";
import { bracketMatching, HighlightStyle, indentUnit, syntaxHighlighting } from "./libs/codemirror.js";
import { tags } from "./libs/codemirror.js";
import { linter, lintGutter, lintKeymap, setDiagnostics, setDiagnosticsEffect } from "./libs/codemirror.js";
var setLineEffect = StateEffect.define();
var lineMarkField = StateField.define({
  create: () => Decoration.none,
  update(value, tr) {
    if (tr.docChanged) return Decoration.none;
    for (const e of tr.effects) {
      if (e.is(setLineEffect)) {
        const mark = e.value;
        if (!mark) return Decoration.none;
        const line = tr.state.doc.line(mark.line);
        const cls = mark.kind === "error" ? "pico-line-error" : mark.kind === "change" ? "pico-line-change" : "pico-line-exec";
        return Decoration.set([Decoration.line({ class: cls }).range(line.from)]);
      }
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field)
});
var diagnosticLines = StateField.define({
  create: () => Decoration.none,
  update(value, tr) {
    if (tr.docChanged) return Decoration.none;
    for (const effect of tr.effects) if (effect.is(setDiagnosticsEffect)) {
      const lines = new Set(effect.value.filter((item) => item.severity === "error").map((item) => tr.state.doc.lineAt(item.from).from));
      return Decoration.set([...lines].sort((a, b) => a - b).map((from) => Decoration.line({ class: "pico-line-error" }).range(from)));
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field)
});
var picoHighlightStyle = HighlightStyle.define([
  // 关键字与保留常量（def/if/for…、True/False/None）：key 紫
  { tag: [tags.keyword, tags.bool], color: "var(--pico-syn-key)" },
  // 函数/方法调用与类名：fn 深紫
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.className],
    color: "var(--pico-syn-fn)"
  },
  // 字符串、f-string 与转义：str 绿
  { tag: [tags.string, tags.escape], color: "var(--pico-syn-str)" },
  { tag: tags.number, color: "var(--pico-syn-num)" },
  { tag: tags.comment, color: "var(--pico-syn-com)" }
]);
var editorTheme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "var(--pico-code-bg)", color: "var(--pico-code-ink)" },
  "&.cm-focused": { outline: "none" },
  /* 光标：drawSelection 画的 DOM 光标，baseTheme 默认 1.2px 黑线（不随主题变白）。
     本主题挂载在 baseTheme 之后、同特异性即胜出；跟随代码墨色（浅黑深白），
     2px 圆角竖条比原生细线厚实。 */
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "2px solid var(--pico-code-ink)",
    borderRadius: "2px"
  },
  /* CM 自绘选区底色：baseTheme 的 &light/&dark 五类选择器更深，!important（写在值里，
     style-mod 不认 ! 属性前缀）压过它，与终端选中底共用 --pico-code-select-bg。 */
  ".cm-selectionBackground": { background: "var(--pico-code-select-bg) !important" },
  ".cm-scroller": {
    fontFamily: "var(--pico-font-mono)",
    fontSize: "var(--pico-size-code)",
    lineHeight: "1.8",
    overflow: "auto",
    /* FiraCode 的编程连字在编辑器里渲染异常，关掉。 */
    fontVariantLigatures: "none"
  },
  ".cm-content": { padding: "var(--pico-space-5) 0 var(--pico-space-4)" },
  ".cm-gutters": {
    backgroundColor: "var(--pico-code-bg)",
    color: "var(--pico-code-dim)",
    border: "none",
    /* 行号不可选中：宿主为编辑文本重开了 user-select，行号要关回去 */
    userSelect: "none",
    /* 行号槽最小宽：短文档行号也不贴边；右对齐靠默认样式 */
    minWidth: "var(--pico-editor-gutter)",
    padding: "0 var(--pico-space-1) 0 var(--pico-space-4)",
    /* 与代码同字体同字号（line-height 同继承 1.8）：行内盒度量一致，基线天然对齐 */
    fontFamily: "var(--pico-font-mono)",
    fontSize: "var(--pico-size-code)"
  },
  /* 行号列拉满槽宽：数字贴向代码一侧，行号与代码间距即槽右衬 + 元素右衬 */
  ".cm-lineNumbers": { flexGrow: "1" },
  ".pico-line-exec": {
    backgroundColor: "var(--pico-code-exec-bg)",
    boxShadow: "inset 2px 0 0 var(--pico-accent)"
  },
  ".pico-line-change": {
    backgroundColor: "color-mix(in srgb, var(--pico-accent) 28%, transparent)",
    boxShadow: "inset 4px 0 0 var(--pico-accent)"
  },
  ".pico-line-error": {
    backgroundColor: "var(--pico-hue-error-bg)",
    boxShadow: "inset 4px 0 0 var(--pico-hue-error-strong)"
  }
});
var views = /* @__PURE__ */ new WeakMap();
var EditorCore = class {
  constructor(options) {
    this.options = options;
  }
  options;
  configuration = new Compartment();
  configure(options) {
    this.options = { ...this.options, ...options };
    views.get(this)?.view.dispatch({ effects: this.configuration.reconfigure(editorExtensions(this.options)) });
  }
  emit = () => {
  };
  #highlight = null;
  diagnostics = Object.freeze([]);
  selection = Object.freeze({ anchor: 0, head: 0 });
  select(selection2, notify) {
    if (this.#disposed || this.selection.anchor === selection2.anchor && this.selection.head === selection2.head) return;
    this.selection = Object.freeze(selection2);
    if (notify) this.emit({ type: "editor.selected", ...selection2 });
  }
  initialized = false;
  #source = "";
  #disposed = false;
  get text() {
    return this.#source;
  }
  get highlight() {
    return this.#highlight;
  }
  #setText(next) {
    if (this.#disposed) return;
    if (next !== this.text) {
      this.#highlight = null;
      this.diagnostics = Object.freeze([]);
    }
    syncEditorText(this, next);
    this.#source = next;
  }
  edit(text) {
    if (this.#disposed) return;
    this.#highlight = null;
    this.diagnostics = Object.freeze([]);
    this.#source = text;
    this.emit({ type: "editor.changed", source: text });
  }
  receive(event2) {
    if (this.#disposed) return;
    this.#setText(event2.source);
    if (event2.highlight) this.showLine(event2.highlight.line, event2.highlight.kind, event2.highlight.scroll ?? true);
    else this.clearLine();
  }
  diagnose(event2) {
    if (this.#disposed || event2.source !== this.text) return;
    this.diagnostics = Object.freeze(event2.diagnostics.filter(
      (item) => Number.isInteger(item.from) && Number.isInteger(item.to) && item.from >= 0 && item.to >= item.from && item.to <= this.text.length
    ).map((item) => Object.freeze({ ...item })));
    const view = views.get(this)?.view;
    if (view) showDiagnostics(view, this.diagnostics);
  }
  get element() {
    if (this.#disposed) throw new Error("Editor is disposed");
    return stateOf(this).card;
  }
  showLine(line, kind, scroll) {
    if (this.#disposed) return;
    const count = this.text.split("\n").length;
    const clamped = Math.min(Math.max(Number.isFinite(line) ? Math.trunc(line) : 1, 1), count);
    this.#highlight = { line: clamped, kind, scroll };
    if (views.has(this)) showEditorLine(this, clamped, kind, scroll);
  }
  clearLine() {
    this.#highlight = null;
    views.get(this)?.view.dispatch({ effects: setLineEffect.of(null) });
  }
  dispose() {
    if (this.#disposed) return;
    this.#disposed = true;
    const state2 = views.get(this);
    state2?.view.destroy();
    state2?.card.remove();
    views.delete(this);
  }
};
function editorExtensions(options) {
  return [indentUnit.of(options.indent ?? "    "), options.extensions ?? []];
}
function createView(editor2, host) {
  return new EditorView({
    parent: host,
    state: CMEditorState.create({
      doc: editor2.text,
      extensions: [
        lineNumbers(),
        drawSelection(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...lintKeymap, indentWithTab]),
        editor2.configuration.of(editorExtensions(editor2.options)),
        autocompletion(),
        bracketMatching(),
        syntaxHighlighting(picoHighlightStyle),
        lineMarkField,
        diagnosticLines,
        linter(null),
        lintGutter(),
        CMEditorState.transactionExtender.of((tr) => tr.docChanged ? { effects: setDiagnosticsEffect.of([]) } : null),
        editorTheme,
        // 直接发布正在编辑的文档，不应用文件结束换行的规范化。
        EditorView.updateListener.of((update) => {
          const state2 = views.get(editor2);
          if (state2 === void 0) return;
          if (!state2.applying && update.docChanged) editor2.edit(update.state.doc.toString());
          const { anchor, head } = update.state.selection.main;
          editor2.select({ anchor, head }, !state2.applying);
        })
      ]
    })
  });
}
function stateOf(editor2) {
  let state2 = views.get(editor2);
  if (state2 === void 0) {
    const host = document.createElement("div");
    host.className = "pico-w-editor-host";
    const card = document.createElement("div");
    card.className = "pico-card";
    card.append(host);
    state2 = { card, host, view: createView(editor2, host), applying: false };
    views.set(editor2, state2);
    const mark = editor2.highlight;
    if (mark) showEditorLine(editor2, mark.line, mark.kind, mark.scroll);
    if (editor2.diagnostics.length) showDiagnostics(state2.view, editor2.diagnostics);
  }
  return state2;
}
function showDiagnostics(view, diagnostics) {
  view.dispatch(setDiagnostics(view.state, diagnostics));
  const first = diagnostics.find((item) => item.severity === "error") ?? diagnostics[0];
  if (first && !view.hasFocus) view.dispatch({ effects: EditorView.scrollIntoView(first.from, { y: "center" }) });
}
function syncEditorText(editor2, next) {
  const state2 = views.get(editor2);
  if (state2 === void 0) return;
  const doc = state2.view.state.doc.toString();
  if (next === doc) return;
  state2.applying = true;
  try {
    state2.view.dispatch({ changes: { from: 0, to: state2.view.state.doc.length, insert: next } });
  } finally {
    state2.applying = false;
  }
}
function showEditorLine(editor2, line, kind, scroll = true) {
  const { view } = stateOf(editor2);
  const clamped = Math.min(Math.max(Number.isFinite(line) ? Math.trunc(line) : 1, 1), view.state.doc.lines);
  const target = view.state.doc.line(clamped);
  const effects = [setLineEffect.of({ line: clamped, kind })];
  if (scroll && !view.hasFocus) {
    effects.push(EditorView.scrollIntoView(target.from, { y: "center" }));
  }
  view.dispatch({ effects });
}
var editors = /* @__PURE__ */ new WeakMap();
function createEditorState(options = {}, lifecycle) {
  const core = new EditorCore(options);
  const state2 = Object.freeze({
    get source() {
      return core.text;
    },
    get selection() {
      return core.selection;
    },
    get diagnostics() {
      return core.diagnostics;
    }
  });
  editors.set(state2, core);
  lifecycle.onDispose(() => core.dispose());
  return state2;
}
function editorElement(state2) {
  return editors.get(state2).element;
}
function renderEditor(state2, event2) {
  editors.get(state2).receive(event2);
}
function diagnoseEditor(state2, event2) {
  editors.get(state2).diagnose(event2);
}
function initEditor(state2, _event, { emit }) {
  const core = editors.get(state2);
  if (core.initialized) return;
  core.initialized = true;
  core.emit = emit;
}
function reconfigEditor(state2, event2) {
  editors.get(state2).configure(event2.options);
}

// src/api/ui/editor.ts
var editor = stateful("editor", createEditorState, [
  on("editor.reconfig", reconfigEditor, []),
  event("editor.reconfig", {}),
  on("editor.render", renderEditor, []),
  on("editor.diagnostics", diagnoseEditor, []),
  on("editor.init", initEditor, ["editor.changed", "editor.selected"]),
  event("editor.init", {}),
  event("editor.render", {}),
  event("editor.diagnostics", {}),
  event("editor.selected", {}),
  event("editor.changed", {})
], editorElement);

// src/impl/playback/index.ts
var rates = [1, 2, 4, 8, 16];
var instances = /* @__PURE__ */ new WeakMap();
function createInternal(options) {
  return {
    options,
    trace: null,
    analysis: null,
    position: null,
    playing: false,
    rate: 1,
    input: null,
    interactive: false,
    terminal: null,
    disposed: false,
    timer: void 0
  };
}
function createPlayback(options = {}, lifecycle) {
  const current = createInternal(options);
  const state2 = Object.freeze({
    get trace() {
      return current.trace;
    },
    get analysis() {
      return current.analysis;
    },
    get position() {
      return current.position;
    },
    get playing() {
      return current.playing;
    },
    get rate() {
      return current.rate;
    }
  });
  instances.set(state2, current);
  lifecycle.onDispose(() => {
    current.disposed = true;
    clearTimeout(current.timer);
  });
  return state2;
}
function receivePlayback(state2, event2, { emit }) {
  const current = instances.get(state2);
  const level = () => current.playing ? Math.sign(current.rate) * (rates.indexOf(Math.abs(current.rate)) + 1) : 0;
  const seek = (index) => {
    if (current.trace) current.position = current.trace.position(Math.max(1, Math.min(
      current.trace.steps.length + 1,
      Number.isFinite(index) ? Math.trunc(index) : 1
    )));
  };
  const publish3 = () => {
    if (current.trace && current.position) {
      const output = current.interactive ? current.trace.finalState : current.position.state;
      current.terminal = { stdout: output.stdout ?? "", stderr: output.stderr ?? "", input: current.input };
    }
    const canPlay = current.trace !== null && current.trace.steps.length > 0 && current.position !== null;
    emit({ type: "playback.changed", ...state2 });
    emit({ type: "debugger.render", ...state2, canAdjust: {
      reverse: canPlay && level() > -rates.length && (level() > 0 || current.position.traceIndex > 1),
      forward: canPlay && level() < rates.length && (level() < 0 || !current.position.atEnd)
    } });
    emit({ type: "terminal.render", view: current.terminal });
  };
  const schedule = () => {
    clearTimeout(current.timer);
    if (current.disposed || !current.playing || !current.trace || !current.position) return;
    const duration = current.options.stepMsFor?.(current.position, current.trace) ?? current.options.stepMs ?? 1e3 / 3;
    current.timer = setTimeout(() => {
      if (!current.trace || !current.position) return;
      seek(current.position.traceIndex + Math.sign(current.rate));
      if (current.rate > 0 ? current.position.atEnd : current.position.traceIndex === 1) current.playing = false;
      publish3();
      schedule();
    }, (Number.isFinite(duration) && duration > 0 ? duration : 1e3 / 3) / Math.abs(current.rate));
  };
  if (event2.type === "playback.reconfig") {
    current.options = { ...current.options, ...event2.options };
  } else if (event2.type === "python.changed") {
    const result2 = event2.result;
    current.analysis = event2.analysis.status === "ready" ? event2.analysis.value : null;
    current.input = event2.input;
    if (result2.status === "ready" && result2.value) {
      if (current.trace !== result2.value.trace) {
        current.trace = result2.value.trace;
        current.playing = false;
        seek(current.trace.steps.length + 1);
      }
      current.interactive = event2.interactive;
    } else {
      current.trace = null;
      current.position = null;
      current.playing = false;
      if (result2.status === "failed") current.terminal = { stdout: "", stderr: String(result2.error), input: null };
      else if (result2.status === "ready") {
        current.terminal = null;
        current.interactive = false;
      } else if (current.terminal) current.terminal = { ...current.terminal, input: null };
    }
  } else if (event2.type === "python.clear") {
    current.trace = null;
    current.analysis = null;
    current.position = null;
    current.playing = false;
    current.input = null;
    current.interactive = false;
    current.terminal = null;
  } else if (event2.type === "debugger.pause") current.playing = false;
  else if (event2.type === "debugger.seek") {
    seek(event2.traceIndex);
    current.playing = false;
  } else if (current.trace && current.position) {
    const next = Math.max(-rates.length, Math.min(rates.length, level() + event2.delta));
    if (next === level()) return;
    const wasPlaying = current.playing;
    current.playing = next !== 0 && current.trace.steps.length > 0;
    if (next !== 0) current.rate = Math.sign(next) * rates[Math.abs(next) - 1];
    if (current.playing && !wasPlaying) {
      if (current.rate > 0 && current.position.atEnd) seek(1);
      if (current.rate < 0 && current.position.traceIndex === 1) seek(current.trace.steps.length + 1);
    }
  }
  publish3();
  schedule();
}

// src/api/ui/playback.ts
var playback = stateful("playback", createPlayback, [
  on("playback.reconfig", receivePlayback, ["playback.changed", "debugger.render", "terminal.render"]),
  event("playback.reconfig", {}),
  on("python.changed", receivePlayback, ["playback.changed", "debugger.render", "terminal.render"]),
  on("python.clear", receivePlayback, ["playback.changed", "debugger.render", "terminal.render"]),
  on("debugger.seek", receivePlayback, ["playback.changed", "debugger.render", "terminal.render"]),
  on("debugger.adjust", receivePlayback, ["playback.changed", "debugger.render", "terminal.render"]),
  on("debugger.pause", receivePlayback, ["playback.changed", "debugger.render", "terminal.render"]),
  event("playback.changed", {})
]);

// src/impl/playground/assembly.ts
import { useEffect as useEffect3, useState as useState3 } from "./libs/react.js";
function usePlaygroundAssembly(component, initialOptions, options) {
  const [view, setView] = useState3(null);
  useEffect3(() => {
    const bus = options?.bus ?? new EventBus();
    const ownsBus = options?.bus === void 0;
    const cleanups = [];
    const commands = options?.commands ?? { run: { type: "playground.run" }, reset: { type: "playground.reset" }, clear: { type: "playground.clear" } };
    let automatic;
    const own = (instance) => {
      cleanups.push(() => instance.dispose());
      return instance;
    };
    const dispose = () => {
      clearTimeout(automatic);
      const errors = [];
      for (const cleanup of cleanups.splice(0).reverse()) {
        try {
          cleanup();
        } catch (error2) {
          errors.push(error2);
        }
      }
      if (ownsBus) bus.dispose();
      if (errors.length) throw new AggregateError(errors, "Playground cleanup failed");
    };
    try {
      const logger = own(log.create(bus));
      if (options?.logToConsole !== false) cleanups.push(bus.subscribe(["log.appended"], ({ record }) => {
        if (record.kind === "change") console.log(`[pico:state] ${record.source}`, record);
      }));
      const editing = own(editor.create(options?.editor ?? {}, bus));
      const arrangement = own(layout.create(bus));
      const appearance = own(theme.create(bus));
      own(store.create(bus));
      bus.send("log", { type: "log.reconfig", options: options?.log ?? {} });
      bus.send("layout", { type: "layout.reconfig", value: options?.layout ?? {} });
      bus.send("theme", { type: "theme.reconfig", value: options?.theme ?? "auto" });
      bus.send("store", { type: "store.reconfig", backend: options?.store ?? browserStore });
      const create = component.create;
      const course = own(initialOptions === void 0 ? create(bus) : create(initialOptions, bus));
      const initialSource = course.state.source;
      const previousTheme = document.documentElement.dataset.picoTheme;
      const applyTheme = () => {
        const value = appearance.state.getSnapshot();
        if (value === "auto") delete document.documentElement.dataset.picoTheme;
        else document.documentElement.dataset.picoTheme = value;
      };
      applyTheme();
      cleanups.push(() => {
        if (previousTheme === void 0) delete document.documentElement.dataset.picoTheme;
        else document.documentElement.dataset.picoTheme = previousTheme;
      });
      cleanups.push(appearance.state.subscribe(applyTheme));
      for (const type of ["log.init", "editor.init"]) bus.emit({ type }, "application.start");
      const observations = /* @__PURE__ */ new Map();
      const parts = options?.assemble?.({
        bus,
        editor: editing,
        own,
        observe: (name, snapshot2, events) => {
          if (["course", "layout", "theme"].includes(name) || observations.has(name)) throw new Error(`Duplicate observation: ${name}`);
          observations.set(name, { snapshot: snapshot2, events });
        }
      }) ?? {};
      const preloading = new AbortController();
      cleanups.push(() => preloading.abort());
      for (const preload of options?.preload ?? []) {
        void Promise.resolve().then(() => {
          if (!preloading.signal.aborted) return preload.compute(void 0, { signal: preloading.signal });
        }).catch(() => {
        });
      }
      const configuredSession = options?.session === void 0 ? { kind: "session", key: `pico:editor:${window.location.pathname}${window.location.search}${window.location.hash}` } : options.session;
      const session = configuredSession && Object.freeze({ ...configuredSession });
      const isSession = (path) => session !== null && path?.kind === "session" && path.key === session.key;
      const confirmReset = options?.confirmReset ?? (() => window.confirm("\u91CD\u7F6E\u540E\uFF0C\u5F53\u524D\u7F16\u8F91\u5185\u5BB9\u548C\u672C\u5730\u8349\u7A3F\u5C06\u4E22\u5931\u3002\u786E\u5B9A\u6062\u590D\u521D\u59CB\u4EE3\u7801\u5417\uFF1F"));
      const reportError = options?.reportError ?? ((message) => window.alert(message));
      const reads = [];
      let revision = 0;
      let source = initialSource;
      const send = (event2, origin = "toolbar") => bus.emit(event2, origin);
      const renderEditor2 = () => send({ type: "editor.render", source: course.state.source }, "playground");
      const publish3 = () => {
        setView({
          state: course.state,
          parts,
          editor: editing,
          layout: arrangement.state,
          theme: appearance.state,
          log: logger.state,
          bus,
          send,
          toolbar: [{ controls: [{
            kind: "button",
            icon: "download",
            label: "\u4E0B\u8F7D\u4EE3\u7801",
            event: { type: "playground.download", name: options?.filename ?? "source.txt", source: course.state.source }
          }] }],
          menu: [
            { kind: "button", icon: "new", label: "\u91CD\u7F6E\u7F16\u8F91\u5668", event: commands.reset },
            { kind: "choices", label: "\u4E3B\u9898", value: appearance.state.getSnapshot(), choices: [
              { value: "auto", icon: "auto", label: "\u8DDF\u968F\u7CFB\u7EDF", event: { type: "theme.change", value: "auto" } },
              { value: "light", icon: "light", label: "\u6D45\u8272", event: { type: "theme.change", value: "light" } },
              { value: "dark", icon: "dark", label: "\u6DF1\u8272", event: { type: "theme.change", value: "dark" } }
            ] }
          ]
        });
      };
      const snapshots = () => ({
        course: { ...course.state },
        ...Object.fromEntries([...observations].map(([name, { snapshot: snapshot2 }]) => [name, snapshot2()])),
        layout: arrangement.state.getSnapshot(),
        theme: appearance.state.getSnapshot()
      });
      let previous = snapshots();
      for (const [name, data] of Object.entries(previous)) send({ type: "log.record", source: name, kind: "initial", data }, "playground");
      const recordChanges = (operation) => {
        const current = snapshots();
        for (const name of Object.keys(current)) {
          const observation = observations.get(name);
          if (observation && !observation.events.includes(operation)) {
            current[name] = previous[name];
            continue;
          }
          const before = previous[name], after = current[name];
          const changes = before !== null && after !== null && typeof before === "object" && typeof after === "object" ? [.../* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(after)])].flatMap((key) => {
            const oldValue = before[key], value = after[key];
            return Object.is(oldValue, value) ? [] : [{ path: [key], before: oldValue, after: value }];
          }) : Object.is(before, after) ? [] : [{ path: [], before, after }];
          if (changes.length) send({ type: "log.record", source: name, kind: "change", operation, changes }, "playground");
        }
        previous = current;
      };
      const handlers = [
        on("playground.download", (_state, event2) => {
          try {
            downloadText(event2.name, event2.source);
          } catch (error2) {
            reportError(String(error2 instanceof Error ? error2.message : error2));
          }
        }, []),
        on("store.read", (_state, event2) => {
          if (isSession(event2.path)) reads.push({ revision, source: course.state.source });
        }),
        on("store.failed", (_state, event2) => {
          if (event2.operation === "read" && isSession(event2.path)) reads.shift();
          reportError(event2.message);
        }),
        on("store.loaded", (_state, event2) => {
          const restoring = isSession(event2.path);
          const read = restoring ? reads.shift() : null;
          if (restoring && (!read || read.revision !== revision || read.source !== course.state.source)) return;
          if (!restoring) revision++;
          if (event2.source !== null) send({ type: "editor.changed", source: event2.source }, restoring ? "session.restore" : "store.loaded");
        }),
        on(commands.reset.type, (_state) => {
          if (!confirmReset()) return;
          revision++;
          clearTimeout(automatic);
          send({ type: "editor.changed", source: initialSource }, "application.reset");
          send(commands.clear, "application.reset");
          if (session) send({ type: "store.remove", path: session }, "application.reset");
        }),
        on("editor.changed", (_state) => {
          revision++;
          if (options?.automatic !== void 0) {
            clearTimeout(automatic);
            automatic = setTimeout(() => send(commands.run, "automatic"), options.automatic);
          }
        }),
        on(commands.run.type, (_state) => {
          clearTimeout(automatic);
        })
      ];
      own(stateful("playground-runtime", () => void 0, handlers).create(bus));
      cleanups.push(bus.subscribeAll((event2, origin) => {
        if (event2.type.startsWith("log.")) return;
        if (source !== course.state.source) {
          source = course.state.source;
          revision++;
          if (session && origin !== "session.restore" && origin !== "application.reset") send({ type: "store.write", path: session, source }, "playground");
          if (origin !== "application.reset") send(commands.clear, "playground");
          send({ type: "editor.render", source }, "playground");
        }
        recordChanges(event2.type);
        if (!event2.type.endsWith(".render")) publish3();
      }));
      cleanups.push(() => logger.receive({ type: "log.flush" }));
      renderEditor2();
      publish3();
      if (session) send({ type: "store.read", path: session }, "application.start");
      for (const event2 of options?.start ?? []) send(event2, "application.start");
      return dispose;
    } catch (error2) {
      dispose();
      throw error2;
    }
  }, [
    component,
    initialOptions,
    options?.bus,
    options?.filename,
    options?.start,
    options?.automatic,
    options?.assemble,
    options?.editor,
    options?.preload,
    options?.commands,
    options?.store,
    options?.session,
    options?.confirmReset,
    options?.reportError,
    options?.layout,
    options?.theme,
    options?.logToConsole,
    options?.log
  ]);
  return view;
}

// src/api/ui/playground.ts
var usePlayground = usePlaygroundAssembly;

// src/impl/selection/state.ts
function createSelection() {
  return { current: null };
}
function sameSelection(left, right) {
  if (left === right) return true;
  if (!left || !right || left.kind !== right.kind) return false;
  switch (left.kind) {
    case "source":
      return right.kind === "source" && left.source === right.source && left.from === right.from && left.to === right.to;
    case "runtime-value":
      return right.kind === "runtime-value" && left.run === right.run && left.traceIndex === right.traceIndex && samePath(left.path, right.path);
    case "runtime-variable":
      return right.kind === "runtime-variable" && left.run === right.run && samePath(left.path, right.path);
    case "world-object":
      return right.kind === "world-object" && left.run === right.run && left.objectId === right.objectId;
  }
}
function samePath(left, right) {
  return left.length === right.length && left.every((step2, index) => step2 === right[index]);
}
function select(state2, event2, { emit }) {
  if (sameSelection(state2.current, event2.selection)) return;
  state2.current = event2.selection;
  emit({ type: "selection.changed", ...state2 });
}
function clear(state2, _event, context) {
  select(state2, { selection: null }, context);
}
function invalidateSource(state2, event2, context) {
  const current = state2.current;
  if (!current || current.kind !== "source" || current.source === event2.source) return;
  select(state2, { selection: null }, context);
}
function invalidateRun(state2, event2, context) {
  const current = state2.current;
  if (!current || current.kind === "source") return;
  const next = event2.result.status === "ready" && event2.result.value ? event2.result.value.trace : null;
  if (next !== null && current.run === next) return;
  select(state2, { selection: null }, context);
}
function reconcile(state2, event2, context) {
  const current = state2.current;
  if (!current || current.kind !== "runtime-value" && current.kind !== "runtime-variable") return;
  if (current.run !== event2.trace) return select(state2, { selection: null }, context);
  if (current.kind === "runtime-variable") return;
  if (event2.position && event2.position.traceIndex === current.traceIndex) return;
  select(state2, { selection: null }, context);
}

// src/api/ui/selection.ts
var selection = stateful("selection", createSelection, [
  on("selection.select", select, ["selection.changed"]),
  event("selection.select", {}),
  on("selection.clear", clear, ["selection.changed"]),
  event("selection.clear", {}),
  on("editor.changed", invalidateSource, ["selection.changed"]),
  event("editor.changed", {}),
  on("python.changed", invalidateRun, ["selection.changed"]),
  event("python.changed", {}),
  on("playback.changed", reconcile, ["selection.changed"]),
  event("playback.changed", {}),
  event("selection.changed", {})
]);

// src/impl/terminal/surface.ts
function toXtermColor(value) {
  const m = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s+\/\s+([\d.]+%?))?\)$/);
  if (m === null) return value;
  const alpha = m[4] === void 0 ? 1 : m[4].endsWith("%") ? Number.parseFloat(m[4]) / 100 : Number.parseFloat(m[4]);
  return `rgba(${Math.round(Number.parseFloat(m[1]) * 255)}, ${Math.round(Number.parseFloat(m[2]) * 255)}, ${Math.round(Number.parseFloat(m[3]) * 255)}, ${alpha})`;
}
function resolveToken(token, property) {
  const probe = document.createElement("span");
  probe.style.setProperty(property, `var(${token})`);
  document.body.append(probe);
  const value = getComputedStyle(probe).getPropertyValue(property).trim();
  probe.remove();
  return value;
}
var INPUT_SLOT = 195;
var ERROR_SLOT = 203;
var RESET_INK = "\x1B[39m";
async function createSurface(host) {
  const [{ Terminal }, { FitAddon }, { default: xtermCss }] = await Promise.all([
    import("./libs/xterm.js"),
    import("./libs/xterm.js"),
    Promise.resolve().then(() => __toESM(require_xterm()))
  ]);
  ensureStyle(xtermCss);
  const term = new Terminal({
    convertEol: true,
    // 程序 stdout 是裸 \n
    scrollback: 1e3,
    fontFamily: resolveToken("--pico-font-mono", "font-family"),
    fontSize: Number.parseFloat(resolveToken("--pico-size-sm", "font-size")),
    // Editor(--pico-size-code)小一号
    lineHeight: 1,
    // 半格/全格块字符（ASCII Art）要靠自然行距无缝拼接
    cursorStyle: "bar",
    cursorBlink: true
  });
  term.open(host);
  const applyTheme = () => {
    const extendedAnsi = [];
    extendedAnsi[INPUT_SLOT - 16] = resolveToken("--pico-syn-key", "color");
    extendedAnsi[ERROR_SLOT - 16] = resolveToken("--pico-hue-error-ink", "color");
    term.options.theme = {
      background: resolveToken("--pico-code-bg", "background-color"),
      foreground: resolveToken("--pico-code-ink", "color"),
      cursor: resolveToken("--pico-accent", "color"),
      /* 选中底与编辑器共用 --pico-code-select-bg：computed 是 color(srgb … / a)，须换算成 rgba() */
      selectionBackground: toXtermColor(resolveToken("--pico-code-select-bg", "background-color")),
      extendedAnsi
    };
  };
  applyTheme();
  let themeObserver = null;
  if (typeof MutationObserver !== "undefined") {
    themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-pico-theme"]
    });
  }
  const colorScheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  colorScheme?.addEventListener?.("change", applyTheme);
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  const fit = () => {
    if (host.clientWidth > 0 && host.clientHeight > 0) fitAddon.fit();
  };
  fit();
  let resizeObserver = null;
  let frame2 = 0;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame2);
      frame2 = requestAnimationFrame(fit);
    });
    resizeObserver.observe(host);
  }
  let origin = 0;
  return {
    write(text, options) {
      let out = "";
      if (options?.replaceLine === true) out += "\r\x1B[2K";
      if (options?.ink === "input") out += `\x1B[38;5;${INPUT_SLOT}m`;
      else if (options?.ink === "error") out += `\x1B[38;5;${ERROR_SLOT}m`;
      out += text;
      if (options?.ink !== void 0) out += RESET_INK;
      term.write(out);
    },
    onData(handler) {
      const subscription = term.onData(handler);
      return () => subscription.dispose();
    },
    setActive(active2) {
      term.write(active2 ? "\x1B[?25h" : "\x1B[?25l");
    },
    focus() {
      term.focus();
    },
    blur() {
      term.blur();
    },
    clear() {
      term.write("\x1B[2J\x1B[H", () => {
        origin = term.buffer.active.baseY;
      });
    },
    reset() {
      term.reset();
      origin = 0;
    },
    lineRect(line) {
      const buffer = term.buffer.active;
      let logical = 0;
      let row = -1;
      for (let y = origin; y < buffer.length && row < 0; y += 1) {
        if (buffer.getLine(y)?.isWrapped === true) continue;
        logical += 1;
        if (logical === line) row = y;
      }
      const screen = term.element?.querySelector(".xterm-screen");
      if (row < 0 || !screen) return null;
      const box = screen.getBoundingClientRect();
      const height = box.height / term.rows;
      const width = box.width / term.cols;
      const text = buffer.getLine(row)?.translateToString(true) ?? "";
      return new DOMRect(box.left, box.top + (row - buffer.viewportY) * height, Math.max(1, Math.min(term.cols, text.length)) * width, height);
    },
    dispose() {
      themeObserver?.disconnect();
      resizeObserver?.disconnect();
      colorScheme?.removeEventListener?.("change", applyTheme);
      cancelAnimationFrame(frame2);
      term.dispose();
    }
  };
}

// src/impl/terminal/index.ts
var TERMINAL_CSS = `
.pico-term {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.pico-term-body {
  flex: 1;
  min-height: 0;
  background: var(--pico-code-bg);
}

.pico-term .xterm-viewport { scrollbar-width: thin; }

`;
var terminals = /* @__PURE__ */ new WeakMap();
function createTerminal(_options, lifecycle) {
  const core = new TerminalCore();
  const state2 = Object.freeze({});
  terminals.set(state2, core);
  lifecycle.onDispose(() => core.dispose());
  return state2;
}
function terminalElement(state2) {
  return terminals.get(state2).element;
}
var elements2 = /* @__PURE__ */ new WeakMap();
function terminalLineRectImpl(element, line) {
  return elements2.get(element)?.lineRect(line) ?? null;
}
function renderTerminal(state2, event2) {
  terminals.get(state2).render(event2.view);
}
function initTerminal(state2, _event, context) {
  terminals.get(state2).connect(context.emit);
}
var TerminalCore = class {
  #onData = null;
  #root = null;
  #host = null;
  #empty = null;
  #surface = null;
  #pending = null;
  #accepting = false;
  #inputRequest = null;
  #buffer = "";
  #lineStart = true;
  // 光标在行首（上次写以 \n 结尾）
  #shownOut = "";
  #shownErr = "";
  #hasActivity = false;
  #disposed = false;
  #unsubscribe = null;
  connect(emit) {
    if (this.#onData !== null) return;
    this.#onData = (data) => this.#receiveData(data, emit);
  }
  /** 终端元素；访问即开始装载表面（挂载后尽早懒加载 xterm）。 */
  get element() {
    if (this.#disposed) throw new Error("Terminal is disposed");
    if (this.#root === null) {
      ensureStyle(TERMINAL_CSS);
      this.#root = node("div", "pico-widget pico-term");
      elements2.set(this.#root, this);
      this.#host = node("div", "pico-term-body");
      this.#empty = emptySurface();
      const watermark = panelWatermark(ICONS.output);
      this.#root.append(this.#host, this.#empty, watermark);
      this.#syncEmpty();
    }
    this.#ensure();
    return this.#root;
  }
  /** 只读：当前输出第 line 行的矩形；终端表面尚未装载时为 null。 */
  lineRect(line) {
    return this.#surface?.lineRect(line) ?? null;
  }
  #reset() {
    if (this.#disposed) return;
    this.#shownOut = "";
    this.#shownErr = "";
    this.#buffer = "";
    this.#accepting = false;
    this.#inputRequest = null;
    this.#hasActivity = false;
    this.#lineStart = true;
    if (this.#surface !== null) {
      this.#surface.reset();
      this.#surface.setActive(false);
    }
    this.#syncEmpty();
  }
  render(view) {
    if (this.#disposed) return;
    if (view === null) {
      this.#reset();
      return;
    }
    const outputChanged = view.stdout !== this.#shownOut || view.stderr !== this.#shownErr;
    const newRequest = view.input !== null && view.input.id !== this.#inputRequest?.id;
    const promptChanged = view.input !== null && view.input.prompt !== this.#inputRequest?.prompt;
    if ((outputChanged || newRequest || promptChanged) && this.#accepting) {
      this.#emit("", void 0, true);
      this.#lineStart = true;
    }
    if (newRequest) this.#buffer = "";
    if (view.input !== null) this.#inputRequest = view.input;
    this.#renderOutput(view.stdout, view.stderr);
    if (view.input === null) this.#setAcceptingInput(false);
    else if (newRequest) this.#setAcceptingInput(true, true);
    else if ((outputChanged || promptChanged) && this.#accepting) {
      if (!this.#lineStart) this.#emit("\n");
      this.#repaint();
    }
  }
  /** 推累积 stdout/stderr；确定性程序保证各段前缀递增，这里只追加差量。
      非前缀（含 trace 回退）时软清屏后整写，避免 surface.reset() 整机复位闪烁。 */
  #renderOutput(stdout, stderr) {
    if (this.#disposed) return;
    this.#ensure();
    if (stdout === this.#shownOut && stderr === this.#shownErr) return;
    if (!stdout.startsWith(this.#shownOut) || !stderr.startsWith(this.#shownErr)) {
      this.#surface?.clear();
      this.#shownOut = "";
      this.#shownErr = "";
      this.#lineStart = true;
      this.#hasActivity = false;
    }
    if (stdout !== this.#shownOut) {
      this.#hasActivity = true;
      this.#emit(stdout.slice(this.#shownOut.length));
      this.#shownOut = stdout;
    }
    if (stderr !== this.#shownErr) {
      this.#hasActivity = true;
      this.#emit(stderr.slice(this.#shownErr.length), "error");
      this.#shownErr = stderr;
    }
    this.#syncEmpty();
  }
  /** true：出提示符并接收一行键入；false：冻结（不收键、藏光标）。 */
  #setAcceptingInput(accepting, restart = false) {
    if (this.#disposed) return;
    this.#ensure();
    if (accepting === this.#accepting && !restart) return;
    this.#accepting = accepting;
    if (accepting) this.#hasActivity = true;
    this.#syncEmpty();
    this.#surface?.setActive(accepting);
    if (!accepting) {
      this.#surface?.blur();
      return;
    }
    if (!this.#lineStart) this.#emit("\n");
    this.#repaint();
    this.#surface?.focus();
  }
  #ensure() {
    if (this.#disposed || this.#host === null || this.#surface !== null || this.#pending !== null) return;
    const host = this.#host;
    this.#pending = Promise.resolve().then(() => createSurface(host)).then((surface) => {
      if (this.#disposed) {
        surface.dispose();
        return;
      }
      this.#surface = surface;
      this.#unsubscribe = surface.onData((data) => this.#onData?.(data));
      surface.reset();
      surface.setActive(this.#accepting);
      if (this.#shownOut !== "") this.#emit(this.#shownOut);
      if (this.#shownErr !== "") this.#emit(this.#shownErr, "error");
      if (this.#accepting) {
        if (!this.#lineStart) this.#emit("\n");
        this.#repaint();
        surface.focus();
      }
    }).catch((error2) => {
      this.#unsubscribe?.();
      this.#unsubscribe = null;
      this.#surface?.dispose();
      this.#surface = null;
      this.#pending = null;
      if (!this.#disposed) console.error("Terminal \u8868\u9762\u521D\u59CB\u5316\u5931\u8D25", error2);
    });
  }
  dispose() {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#accepting = false;
    this.#onData = null;
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    this.#surface?.dispose();
    this.#surface = null;
    this.#root?.remove();
  }
  #emit(text, ink, replaceLine = false) {
    this.#surface?.write(text, { ink, replaceLine });
    if (!replaceLine) this.#lineStart = text.endsWith("\n");
  }
  #repaint() {
    this.#emit(`\u203A ${this.#buffer}`, "input", true);
  }
  #receiveData(data, emit) {
    if (!this.#accepting) return;
    data = data.replaceAll("\x1B[200~", "").replaceAll("\x1B[201~", "");
    if (data.startsWith("\x1B")) return;
    for (const char of data) {
      if (char === "\r") {
        this.#submit(emit);
        return;
      }
      if (char === "\x7F") this.#buffer = [...this.#buffer].slice(0, -1).join("");
      else if (char >= " ") this.#buffer += char;
      else continue;
      this.#repaint();
    }
  }
  #submit(emit) {
    const line = this.#buffer;
    this.#buffer = "";
    this.#accepting = false;
    this.#surface?.setActive(false);
    this.#emit("\n");
    emit({ type: "terminal.submitted", requestId: this.#inputRequest.id, line });
  }
  #syncEmpty() {
    if (this.#host !== null) this.#host.hidden = !this.#hasActivity;
    if (this.#empty !== null) this.#empty.hidden = this.#hasActivity;
  }
};

// src/api/ui/terminal.ts
var terminal = stateful("terminal", createTerminal, [
  on("terminal.render", renderTerminal, []),
  on("terminal.init", initTerminal, ["terminal.submitted"]),
  event("terminal.init", {}),
  event("terminal.render", {}),
  event("terminal.submitted", {})
], terminalElement);
function terminalLineRect(element, line) {
  return terminalLineRectImpl(element, line);
}
export {
  EventBus,
  PlaygroundShell2 as PlaygroundShell,
  PySource,
  PySource as Source,
  Trace,
  Widget2 as Widget,
  analyzer,
  browserStore,
  createReplicatedRecord2 as createReplicatedRecord,
  createState,
  debuggerComponent as debugger,
  debuggerAnchorRect,
  decodeLearningAssessment2 as decodeLearningAssessment,
  decodeLearningEvidenceData2 as decodeLearningEvidenceData,
  decodeLearningResultData2 as decodeLearningResultData,
  derivation,
  editor,
  evaluation,
  event,
  layout,
  lean,
  leanRunner,
  linker,
  log,
  on,
  playback,
  python,
  pythonPreload,
  recordIdOf2 as recordIdOf,
  remote,
  resolveDebuggerVariable,
  runner,
  selection,
  sourceOccurrences,
  stateful,
  store,
  terminal,
  terminalLineRect,
  theme,
  usePlayground,
  variableTimeline,
  variablesAt,
  verifyReplicatedRecord2 as verifyReplicatedRecord
};
