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

// src/core_impl.ts
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
function deriveImpl(inputs, compute) {
  let previous;
  let snapshot;
  let published;
  const listeners = /* @__PURE__ */ new Set();
  let unsubscribe = [];
  const getSnapshot = () => {
    const values = inputs.map((input) => input.getSnapshot());
    if (previous === void 0 || values.some((value, index) => !Object.is(value, previous[index]))) {
      const next = compute(...values);
      previous = values;
      snapshot = next;
    }
    return snapshot;
  };
  const notify = () => {
    const next = getSnapshot();
    if (Object.is(published, next)) return;
    published = next;
    for (const listener of [...listeners]) listener();
  };
  return {
    getSnapshot,
    subscribe: (listener) => {
      if (listeners.size === 0) {
        published = getSnapshot();
        try {
          for (const input of new Set(inputs)) unsubscribe.push(input.subscribe(notify));
        } catch (error2) {
          for (const stop of unsubscribe) stop();
          unsubscribe = [];
          throw error2;
        }
      }
      const subscription = () => listener();
      listeners.add(subscription);
      return () => {
        if (!listeners.delete(subscription) || listeners.size !== 0) return;
        for (const stop of unsubscribe) stop();
        unsubscribe = [];
      };
    }
  };
}

// src/core.ts
function createState(initial) {
  return createStateImpl(initial);
}
function derive(inputs, compute) {
  return deriveImpl(inputs, compute);
}

// src/libs/host.ts
function isFunction(value) {
  return typeof value === "function";
}
function draftOf(value) {
  if (typeof value !== "object" || value === null) return null;
  const record = value;
  const initial = record.initial;
  if (initial !== null && typeof initial !== "string") return null;
  if (!isFunction(record.save) || !isFunction(record.clear)) return null;
  return {
    initial,
    save: record.save.bind(record),
    clear: record.clear.bind(record)
  };
}
function hostBridge(scope) {
  if (typeof scope !== "object" || scope === null) return null;
  const injected = scope.__PICO_HOST__;
  if (typeof injected !== "object" || injected === null) return null;
  const record = injected;
  const draft = draftOf(record.draft);
  if (draft === null || !isFunction(record.home)) return null;
  return { draft, home: record.home.bind(record) };
}

// src/libs/components.tsx
import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore
} from "./libs/react.js";
import { flushSync } from "./libs/react.js";

// src/libs/dom.ts
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

// src/libs/icons.ts
var PANEL_ICONS = {
  output: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.8" y="2.8" width="12.4" height="10.4" rx="2"/><path d="M4.3 6.2l2.2 1.8-2.2 1.8M8.3 10.2h3.2"/></svg>',
  play: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 3.5 12 8l-6.5 4.5z"/></svg>',
  debug: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="4" r="1.8"/><path d="M6.4 5.5C5 6.1 4.2 7.3 4.2 8.9c0 2.2 1.6 4 3.8 4s3.8-1.8 3.8-4c0-1.6-.8-2.8-2.2-3.4"/><path d="M8 6.5v6.4M6.1 5.9L4 4.6M9.9 5.9L12 4.6M4.3 8.8H2.2M11.7 8.8h2.1M5.1 11.4l-1.9 1.5M10.9 11.4l1.9 1.5"/></svg>'
};

// src/libs/components.tsx
import { Fragment as Fragment2, jsx, jsxs } from "./libs/react.js";
function useValue(state2) {
  return useSyncExternalStore(state2.subscribe, state2.getSnapshot, state2.getSnapshot);
}
function WidgetImpl({ widget }) {
  const attach = useCallback((host) => {
    if (host === null) return;
    const element = widget.element;
    host.append(element);
    return () => {
      if (element.parentNode === host) element.remove();
    };
  }, [widget]);
  return /* @__PURE__ */ jsx("div", { className: "pico-widget", ref: attach });
}
function Divider({ direction, value, min, max, onChange, pixelsPerUnit }) {
  const drag = useRef(null);
  const position = (event) => direction === "row" ? event.clientX : event.clientY;
  const change2 = (next) => onChange(Math.max(min, Math.min(max, next)));
  const finish = (event) => {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `pico-dock-divider${direction === "row" ? " pico-dock-divider--v" : ""}`,
      role: "separator",
      onPointerDown: (event) => {
        if (event.button !== 0 || drag.current !== null) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { pointer: event.pointerId, start: position(event), value };
        event.currentTarget.dataset.dragging = "true";
      },
      onPointerMove: (event) => {
        const current = drag.current;
        if (current?.pointer !== event.pointerId) return;
        const scale = pixelsPerUnit();
        if (scale > 0) change2(current.value + (position(event) - current.start) / scale);
      },
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture: finish
    }
  );
}
var MIN_PANE = 120;
function Split({ direction, minPane = MIN_PANE, className, children: children2 }) {
  const panes = Children.toArray(children2);
  const container = useRef(null);
  const [sizes, setSizes] = useState(/* @__PURE__ */ new Map());
  const keys = panes.map((pane, index) => (isValidElement(pane) ? pane.key : null) ?? `#${index}`);
  const keyOf = keys.join("\0");
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
    const resize = () => {
      const total = available();
      if (total <= 0 || keys.length === 0) return;
      setSizes((current) => {
        if (keys.length > current.size) return new Map(keys.map((key) => [key, total / keys.length]));
        const next = new Map(keys.map((key) => [key, current.get(key) ?? total / keys.length]));
        const used = [...next.values()].reduce((sum, size) => sum + size, 0);
        if (used <= 0) return new Map(keys.map((key) => [key, total / keys.length]));
        const factor = total / used;
        if (next.size === current.size && keys.every((key) => current.has(key)) && Math.abs(factor - 1) < 1e-3) return current;
        return new Map([...next].map(([key, size]) => [key, size * factor]));
      });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [direction, keyOf]);
  return /* @__PURE__ */ jsx("div", { ref: container, className: `pico-split pico-split--${direction}${className === void 0 ? "" : ` ${className}`}`, children: panes.map((pane, index) => {
    const size = sizes.get(keys[index]);
    return /* @__PURE__ */ jsx("div", { className: "pico-pane", style: { flex: size === void 0 ? "1 1 0" : `0 0 ${size}px` }, children: pane }, keys[index]);
  }).flatMap((pane, index) => {
    if (index === panes.length - 1) return [pane];
    const a = sizes.get(keys[index]) ?? 0;
    const b = sizes.get(keys[index + 1]) ?? 0;
    const minimum = Math.min(minPane, (a + b) / 2);
    return [pane, /* @__PURE__ */ jsx(
      Divider,
      {
        direction,
        value: a,
        min: minimum,
        max: a + b - minimum,
        pixelsPerUnit: () => 1,
        onChange: (size) => setSizes((current) => {
          const span = (current.get(keys[index]) ?? 0) + (current.get(keys[index + 1]) ?? 0);
          return new Map(current).set(keys[index], size).set(keys[index + 1], span - size);
        })
      },
      `divider-${keys[index]}-${keys[index + 1]}`
    )];
  }) });
}
var themeListeners = /* @__PURE__ */ new Set();
function currentTheme() {
  if (typeof document === "undefined") return "auto";
  const value = document.documentElement.dataset.picoTheme;
  return value === "light" || value === "dark" ? value : "auto";
}
function subscribeTheme(listener) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}
function setTheme(theme) {
  if (theme === "auto") delete document.documentElement.dataset.picoTheme;
  else document.documentElement.dataset.picoTheme = theme;
  for (const listener of themeListeners) listener();
}
var THEME_ICONS = {
  auto: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("circle", { cx: "8", cy: "8", r: "5", fill: "none", stroke: "currentColor", strokeWidth: "1.6" }),
    /* @__PURE__ */ jsx("path", { d: "M8 3a5 5 0 0 1 0 10z", fill: "currentColor" })
  ] }),
  light: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("circle", { cx: "8", cy: "8", r: "3.2" }),
    /* @__PURE__ */ jsx("path", { d: "M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.7 3.7l1.1 1.1M11.2 11.2l1.1 1.1M12.3 3.7l-1.1 1.1M4.8 11.2l-1.1 1.1" })
  ] }),
  dark: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z" }) })
};
function ThemeControls({ onSelect }) {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "auto");
  return /* @__PURE__ */ jsxs("div", { role: "group", "aria-label": "\u4E3B\u9898", children: [
    /* @__PURE__ */ jsx("div", { className: "pico-menu-label", children: "\u5916\u89C2" }),
    ["auto", "light", "dark"].map((value) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "pico-menu-item",
        role: "menuitemradio",
        "aria-checked": theme === value,
        title: value === "auto" ? "\u8DDF\u968F\u7CFB\u7EDF" : value === "light" ? "\u6D45\u8272" : "\u6DF1\u8272",
        "aria-label": value === "auto" ? "\u8DDF\u968F\u7CFB\u7EDF\u4E3B\u9898" : value === "light" ? "\u6D45\u8272\u4E3B\u9898" : "\u6DF1\u8272\u4E3B\u9898",
        onClick: () => {
          setTheme(value);
          onSelect();
        },
        children: [
          THEME_ICONS[value],
          value === "auto" ? "\u8DDF\u968F\u7CFB\u7EDF" : value === "light" ? "\u6D45\u8272" : "\u6DF1\u8272"
        ]
      },
      value
    ))
  ] });
}
var LOGO_URL = new URL("pico.svg", import.meta.url).href;
function BrandMenu({ brand, onResetEditor }) {
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
    /* @__PURE__ */ jsx("style", { children: MENU_STYLE }),
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
        onKeyDown: (event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          place();
          menu.current?.showPopover();
          const items = menu.current?.querySelectorAll("[role^=menuitem]");
          items?.[event.key === "ArrowUp" ? items.length - 1 : 0]?.focus();
        },
        children: [
          /* @__PURE__ */ jsx("img", { className: "pico-topbar-logo", src: LOGO_URL, alt: "", "aria-hidden": "true" }),
          /* @__PURE__ */ jsx("span", { className: "pico-topbar-brand-text", children: brand }),
          /* @__PURE__ */ jsx("svg", { className: "pico-brand-chevron", viewBox: "0 0 12 12", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "m3 4.5 3 3 3-3", fill: "none", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        id,
        className: "pico-brand-menu",
        popover: "auto",
        role: "menu",
        "aria-label": "Pico",
        ref: menu,
        onToggle: (event) => {
          setOpen(event.newState === "open");
          if (event.newState === "open" && document.activeElement === trigger.current) {
            menu.current?.querySelector("[role^=menuitem]")?.focus();
          }
        },
        onBlur: (event) => {
          if (event.relatedTarget !== null && !event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== trigger.current) menu.current?.hidePopover();
        },
        onKeyDown: (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
          }
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const items = [...event.currentTarget.querySelectorAll("[role^=menuitem]")];
          const index = items.indexOf(document.activeElement);
          const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
          items[next]?.focus();
        },
        children: [
          onResetEditor !== void 0 && /* @__PURE__ */ jsxs(Fragment2, { children: [
            /* @__PURE__ */ jsxs("button", { type: "button", className: "pico-menu-item", role: "menuitem", onClick: () => {
              close();
              if (window.confirm("\u91CD\u7F6E\u540E\uFF0C\u5F53\u524D\u7F16\u8F91\u5185\u5BB9\u548C\u672C\u5730\u8349\u7A3F\u5C06\u4E22\u5931\u3002\u786E\u5B9A\u6062\u590D\u521D\u59CB\u4EE3\u7801\u5417\uFF1F")) onResetEditor();
            }, children: [
              /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M3 6a5.2 5.2 0 1 1-.2 3M3 2.5V6h3.5" }) }),
              "\u91CD\u7F6E\u7F16\u8F91\u5668"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "pico-menu-separator", role: "separator" })
          ] }),
          /* @__PURE__ */ jsx(ThemeControls, { onSelect: close })
        ]
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
  return /* @__PURE__ */ jsx("span", { className: "pico-toolbar-sep", "aria-hidden": "true" });
}
var TOOLBAR_ICONS = {
  output: /* @__PURE__ */ jsx("span", { style: { display: "contents" }, dangerouslySetInnerHTML: { __html: PANEL_ICONS.output } }),
  debug: /* @__PURE__ */ jsx("span", { style: { display: "contents" }, dangerouslySetInnerHTML: { __html: PANEL_ICONS.debug } }),
  viz: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { d: "M8 1.8l5.5 3.1v6.2L8 14.2 2.5 11.1V4.9z" }),
    /* @__PURE__ */ jsx("path", { d: "M2.5 4.9L8 8l5.5-3.1M8 8v6.2" })
  ] }),
  play: /* @__PURE__ */ jsx("span", { style: { display: "contents" }, dangerouslySetInnerHTML: { __html: PANEL_ICONS.play } }),
  download: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M8 2.5v7.2M4.8 6.9L8 10.1l3.2-3.2M3 11.5v.6a1.6 1.6 0 0 0 1.6 1.6h6.8a1.6 1.6 0 0 0 1.6-1.6v-.6" }) }),
  close: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M4 4l8 8M12 4l-8 8" }) }),
  new: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { d: "M13.5 8a5.5 5.5 0 1 1-1.6-3.9" }),
    /* @__PURE__ */ jsx("path", { d: "M13.5 2.5v2.2h-2.2" })
  ] }),
  hint: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { d: "M8 2a4.5 4.5 0 0 0-2 8.6c.5.3.8.8.8 1.4h2.4c0-.6.3-1.1.8-1.4A4.5 4.5 0 0 0 8 2z" }),
    /* @__PURE__ */ jsx("path", { d: "M6.5 14h3" })
  ] })
};
function ControlView({ control }) {
  if (control.kind === "choices") {
    return /* @__PURE__ */ jsx("span", { className: "pico-toolbar-choices", role: "group", "aria-label": control.label, children: control.choices.map((choice) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "pico-ghost-btn",
        "aria-pressed": control.value === choice.value,
        "aria-label": choice.title,
        title: choice.title,
        onClick: () => control.onChange(choice.value),
        children: choice.label
      },
      choice.value
    )) });
  }
  const { icon, label, pressed, disabled, onClick } = control;
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: "pico-ghost-btn pico-ghost-btn--icon",
      "aria-pressed": pressed,
      disabled,
      "aria-label": label,
      title: label,
      onClick,
      children: TOOLBAR_ICONS[icon]
    }
  );
}
function HostHomeButton() {
  if (typeof window === "undefined") return null;
  const home = hostBridge(window)?.home;
  if (home === void 0) return null;
  return /* @__PURE__ */ jsx("button", { type: "button", className: "pico-home", "aria-label": "\u8FD4\u56DE\u8BFE\u7A0B\u5217\u8868", title: "\u8FD4\u56DE\u8BFE\u7A0B\u5217\u8868", onClick: home, children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { d: "M2.6 7.5 8 3.1l5.4 4.4V13a.6.6 0 0 1-.6.6H3.2a.6.6 0 0 1-.6-.6z" }),
    /* @__PURE__ */ jsx("path", { d: "M6.3 13.6V9.7h3.4v3.9" })
  ] }) });
}
function TopBarImpl({ brand, name, onResetEditor, groups }) {
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
      /* @__PURE__ */ jsx(HostHomeButton, {}),
      /* @__PURE__ */ jsx(BrandMenu, { brand: brand ?? "Pico Playground", onResetEditor }),
      name !== void 0 && /* @__PURE__ */ jsx("div", { className: "pico-topbar-title", children: name })
    ] }),
    list.map((group, index) => /* @__PURE__ */ jsxs(Fragment, { children: [
      index > 0 && /* @__PURE__ */ jsx(ToolbarSep, {}),
      /* @__PURE__ */ jsx("div", { className: "pico-toolbar-group", role: group.label === void 0 ? void 0 : "group", "aria-label": group.label, children: group.controls.map((control, controlIndex) => /* @__PURE__ */ jsx(ControlView, { control }, controlIndex)) })
    ] }, index))
  ] });
}
var bareChrome = ({ brand, name, onResetEditor, toolbar }) => /* @__PURE__ */ jsx(TopBarImpl, { brand, name, onResetEditor, groups: toolbar });
var webChrome = (slot) => /* @__PURE__ */ jsx(
  TopBarImpl,
  {
    brand: slot.brand,
    name: slot.name,
    onResetEditor: slot.onResetEditor,
    groups: [...slot.toolbar, {
      controls: [{
        kind: "button",
        icon: "download",
        label: `\u4E0B\u8F7D ${slot.id}.py`,
        onClick: () => downloadText(`${slot.id}.py`, slot.source.getSnapshot())
      }]
    }]
  }
);
var HostChromeContext = createContext(bareChrome);
var MIN_RATIO = 0.34;
var MAX_RATIO = 0.6;
var DEFAULT_RATIO = 0.43;
function PlaygroundShellImpl({
  name,
  id,
  source,
  brand,
  onResetEditor,
  editor,
  toolbar,
  panels,
  initialOpen,
  editorRatio = DEFAULT_RATIO
}) {
  const closable = panels.filter(
    (panel) => panel.pinned !== true && panel.icon !== void 0
  );
  const [open, setOpen] = useState(
    () => new Set(initialOpen ?? panels.map((panel) => panel.key))
  );
  const [ratio, setRatio] = useState(() => Math.min(Math.max(editorRatio, MIN_RATIO), MAX_RATIO));
  const main = useRef(null);
  const transition = useRef(null);
  const transitionId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  useEffect(() => () => transition.current?.skipTransition(), []);
  useEffect(() => {
    if (name !== void 0) document.title = name;
  }, [name]);
  const pinned = panels.filter((panel) => panel.pinned === true);
  const visible = panels.filter((panel) => panel.pinned !== true && open.has(panel.key));
  const toggle = (key) => {
    const update = () => setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    transition.current?.skipTransition();
    if (typeof document.startViewTransition !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      update();
      return;
    }
    transition.current = document.startViewTransition(() => flushSync(update));
    void transition.current.ready.catch(() => {
    });
  };
  const chrome = useContext(HostChromeContext);
  const groups = [
    ...toolbar ?? [],
    ...closable.length > 0 ? [{
      label: "\u89C6\u56FE",
      controls: closable.map((panel) => ({
        kind: "button",
        icon: panel.icon,
        label: `${panel.title}\u89C6\u56FE`,
        pressed: open.has(panel.key),
        onClick: () => toggle(panel.key)
      }))
    }] : []
  ];
  const renderPanel = (panel) => /* @__PURE__ */ jsx(
    "section",
    {
      className: "pico-card pico-pg-panel",
      "data-view": panel.key,
      "aria-label": panel.title,
      style: { viewTransitionName: `pico-${transitionId}-panel-${panels.indexOf(panel)}` },
      children: /* @__PURE__ */ jsx("div", { className: `pico-card-body${panel.flush ? " pico-card-body--flush" : ""}`, children: panel.content })
    },
    panel.key
  );
  return /* @__PURE__ */ jsxs("div", { className: "pico-page", children: [
    /* @__PURE__ */ jsx("style", { children: CARD_MOTION_STYLE }),
    chrome({ brand, name, id, source, onResetEditor, toolbar: groups }),
    /* @__PURE__ */ jsxs("div", { className: "pico-split pico-split--row pico-pg-main", ref: main, children: [
      /* @__PURE__ */ jsx("div", { className: "pico-pane", style: { flex: `0 0 ${pinned.length === 0 && visible.length === 0 ? 100 : ratio * 100}%`, viewTransitionName: `pico-${transitionId}-editor` }, children: editor }),
      (pinned.length > 0 || visible.length > 0) && /* @__PURE__ */ jsxs(Fragment2, { children: [
        /* @__PURE__ */ jsx(
          Divider,
          {
            direction: "row",
            value: ratio * 100,
            min: MIN_RATIO * 100,
            max: MAX_RATIO * 100,
            onChange: (percent) => setRatio(percent / 100),
            pixelsPerUnit: () => {
              const element = main.current;
              if (element === null) return 0;
              const style = getComputedStyle(element);
              return (element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)) / 100;
            }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "pico-pane pico-world", children: [
          pinned.length > 0 && /* @__PURE__ */ jsx("div", { className: "pico-pg-pinned", children: pinned.map(renderPanel) }),
          visible.length > 0 && /* @__PURE__ */ jsx(Split, { direction: "column", minPane: 160, className: "pico-pg-panels", children: visible.map(renderPanel) })
        ] }, "world")
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
function Widget(props) {
  return /* @__PURE__ */ jsx(WidgetImpl, { ...props });
}
function TopBar(props) {
  return /* @__PURE__ */ jsx(TopBarImpl, { ...props });
}
var HostChromeProvider = HostChromeContext.Provider;
function PlaygroundShell(props) {
  return /* @__PURE__ */ jsx(PlaygroundShellImpl, { ...props });
}

// src/libs/analyzer/impl/syntax.ts
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
          end: lineAt(Math.max(body.from, body.to - 1)),
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
            end: lineAt(Math.max(part.from, part.to - 1)),
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
function analyzeSyntax(source) {
  const tree = pythonLanguage.parser.parse(source).topNode;
  const starts = lineStarts(source);
  const syntaxErrors = syntaxErrorsOf(source, tree, starts);
  return Object.freeze({
    syntaxErrors,
    controlFlow: syntaxErrors.length === 0 ? controlFlowOf(tree, starts) : Object.freeze([])
  });
}

// src/libs/analyzer/index.ts
function analyzeProgram(source) {
  return analyzeSyntax(source);
}

// src/libs/assets/index.ts
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

// src/libs/debugger/impl.ts
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
.pico-debugger-diff { min-width: 0; min-height: 0; height: 100%; padding-right: var(--pico-space-3); border-right: 1px solid var(--pico-hairline); overflow-y: auto; scrollbar-width: thin; }
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
  return format(value).length > 48;
}
function valueElement(value, isExpanded) {
  if (value === void 0) {
    return node("span", "pico-debugger-value-text", "\u2014");
  }
  if (isExpanded && value !== null && typeof value === "object") {
    const pre = node("pre", `pico-debugger-value-text pico-val-expanded pico-val--${typeTag(value)}`);
    pre.textContent = formatExpanded(value);
    return pre;
  }
  const span = node("span", `pico-debugger-value-text pico-val--${typeTag(value)}`);
  span.textContent = formatInline(value);
  return span;
}
function topFrame(state2) {
  return state2.frames?.at(-1) ?? null;
}
function scopedVariables(state2) {
  return { ...state2.globals ?? {}, ...topFrame(state2)?.locals ?? {} };
}
function variableRows(current, previous) {
  const list = node("dl", "pico-debugger-variables");
  for (const name of /* @__PURE__ */ new Set([...Object.keys(current), ...Object.keys(previous)])) {
    const before = previous[name];
    const after = current[name];
    const row = node("div", "pico-debugger-variable");
    if (!Object.hasOwn(previous, name)) row.dataset.change = "added";
    else if (!Object.hasOwn(current, name)) row.dataset.change = "removed";
    else if (JSON.stringify(before) !== JSON.stringify(after)) row.dataset.change = "changed";
    const isExpanded = after !== void 0 && expanded(after);
    if (isExpanded) row.dataset.expanded = "true";
    const valueNode = node("dd", "pico-debugger-value");
    valueNode.append(valueElement(after, isExpanded));
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
function clamp(trace2, traceIndex) {
  return Math.max(0, Math.min(maxIndex(trace2), Number.isFinite(traceIndex) ? Math.trunc(traceIndex) : 0));
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
function controlKinds(structures) {
  const kinds = /* @__PURE__ */ new Map();
  const visit = (nodes) => {
    for (const structure of nodes) {
      if (structure.kind === "loop") {
        kinds.set(structure.line, "loop");
        visit(structure.body);
      } else {
        for (const arm of structure.arms) {
          kinds.set(arm.line, "branch");
          visit(arm.body);
        }
      }
    }
  };
  visit(structures);
  return kinds;
}
function flameBlocks(structures, positions) {
  const kinds = controlKinds(structures);
  const blocks = functionBlocks(positions);
  for (let index = 0; index < positions.length; index += 1) {
    const position = positions[index];
    if (position.line === null) continue;
    const kind = kinds.get(position.line) ?? "stmt";
    blocks.push({
      kind,
      label: kind === "stmt" ? String(position.line) : kind === "loop" ? "loop" : "if",
      line: position.line,
      row: position.frames.length,
      start: index,
      end: index + 1
    });
  }
  return blocks.sort((left, right) => left.row - right.row || left.start - right.start || right.end - left.end);
}
function flamePalette(block) {
  let hash = block.row * 31 + block.start * 17 + block.end;
  for (const char of block.label) hash = hash * 33 + char.charCodeAt(0) | 0;
  return Math.abs(hash) % 4;
}
var PLAYBACK_MULTIPLIERS = [1, 2, 4, 8, 16];
var DEFAULT_STEP_MS = 1e3 / 3;
function usableDelay(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
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
var DebuggerCore = class {
  position = createState(null);
  /** 容器 = 自带 transport 的轨迹播放器 + 当前语句后果区。 */
  element = node("div", "pico-widget pico-debugger");
  player = node("section", "pico-trace-player");
  flame = node("div", "pico-trace-focus");
  diff = node("div", "pico-debugger-diff");
  empty = emptySurface();
  controls = node("div", "pico-trace-controls");
  buttons = /* @__PURE__ */ new Map();
  rate = node("span", "pico-trace-rate");
  transport = "stopped";
  playbackLevel = 0;
  stepMs;
  stepMsFor;
  /** 落点 → 行号：火焰图布局的副产物，课程节拍按落点读它，不重放历史状态。 */
  lines = [];
  trace = null;
  cachedTrace = null;
  cachedControlFlow = NO_STRUCTURES;
  blocks = [];
  traceIndex = 0;
  viewStart = 0;
  viewSpan = 1;
  dragPointer = null;
  playTimer = null;
  observer = null;
  events = new AbortController();
  disposed = false;
  canvas = node("div", "pico-trace-canvas");
  constructor(stepMs, stepMsFor, playback = true) {
    if (stepMs !== void 0 && (!Number.isFinite(stepMs) || stepMs <= 0)) {
      throw new RangeError("Debugger playback stepMs must be finite and positive");
    }
    if (stepMsFor !== void 0 && typeof stepMsFor !== "function") {
      throw new TypeError("Debugger playback stepMsFor must be a function");
    }
    this.stepMs = stepMs ?? DEFAULT_STEP_MS;
    this.stepMsFor = stepMsFor ?? null;
    ensureStyle(TRACE_CSS);
    ensureStyle(DEBUGGER_CSS);
    this.empty.append(panelWatermark(PANEL_ICONS.debug));
    this.player.append(this.controls, this.flame);
    this.element.append(this.empty, this.diff, this.player);
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
      if (!playback && label === "\u64AD\u653E") continue;
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
          if (action === "forward" || action === "reverse") this.adjustPlayback(action === "forward" ? 1 : -1);
          else {
            this.stopTransport();
            if (action !== "stopped") this.move(action === "start" ? 1 : action === "end" ? maxIndex(this.trace) : this.traceIndex + (action === "next" ? 1 : -1));
          }
        }, eventOptions);
        this.buttons.set(action, button);
        group.append(button);
      }
      this.controls.append(group);
    }
    this.rate.setAttribute("role", "status");
    this.rate.setAttribute("aria-live", "polite");
    this.controls.append(this.rate);
    this.player.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      this.endDrag();
      this.stopTransport();
      this.move(event.key === "Home" ? 1 : event.key === "End" ? maxIndex(this.trace) : this.traceIndex + (event.key === "ArrowLeft" ? -1 : 1));
    }, eventOptions);
    this.flame.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.isPrimary === false || this.trace === null || this.dragPointer !== null) return;
      event.preventDefault();
      this.flame.focus({ preventScroll: true });
      this.dragPointer = event.pointerId;
      this.stopTransport();
      try {
        this.flame.setPointerCapture(event.pointerId);
      } catch {
      }
      this.move(this.stepFromPointer(event.clientX));
    }, eventOptions);
    this.flame.addEventListener("pointermove", (event) => {
      if (event.pointerId !== this.dragPointer) return;
      if ((event.buttons & 1) === 0) {
        this.endDrag();
        return;
      }
      this.move(this.stepFromPointer(event.clientX));
    }, eventOptions);
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      this.flame.addEventListener(type, (event) => {
        if (event.pointerId === this.dragPointer) this.endDrag();
      }, eventOptions);
    }
    window.addEventListener("blur", () => {
      this.endDrag();
      this.stopTransport();
    }, eventOptions);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.endDrag();
        this.stopTransport();
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
  render(trace2, controlFlow, landing) {
    if (this.disposed) return;
    const structures = controlFlow ?? NO_STRUCTURES;
    const traceChanged = trace2 !== this.cachedTrace;
    const structuresChanged = structures !== this.cachedControlFlow;
    const landed = this.traceIndex;
    this.trace = trace2;
    if (traceChanged || landing !== void 0) {
      this.endDrag();
      this.stopTransport();
    }
    if (traceChanged) this.cachedTrace = trace2;
    if (traceChanged || structuresChanged) {
      this.cachedControlFlow = structures;
      const positions = trace2 === null ? [] : tracePositions(trace2);
      this.lines = positions.map((position) => position.line);
      this.blocks = trace2 === null ? [] : flameBlocks(structures, positions);
    }
    const target = landing ?? (traceChanged ? maxIndex(trace2) : this.traceIndex);
    this.traceIndex = trace2 === null ? 0 : Math.max(1, clamp(trace2, target));
    this.empty.hidden = trace2 !== null;
    this.diff.hidden = trace2 === null;
    this.player.hidden = trace2 === null;
    this.updateControls();
    if (trace2 === null || this.traceIndex >= maxIndex(trace2)) this.stopTransport();
    this.paint();
    this.paintDiff();
    if (traceChanged || this.traceIndex !== landed) this.emit();
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.endDrag();
    this.stopTransport();
    this.observer?.disconnect();
    this.events.abort();
    this.element.remove();
    this.trace = this.cachedTrace = null;
    this.blocks = [];
    this.lines = [];
  }
  /** 落点停留时长：课程自定义节拍优先，缺省用 stepMs。 */
  holdFor(index) {
    const trace2 = this.trace;
    const step2 = trace2 !== null && index >= 1 && index <= trace2.steps.length ? trace2.steps[index - 1] : null;
    const custom = usableDelay(this.stepMsFor?.({
      index,
      event: step2?.event ?? null,
      line: this.lines[index] ?? null,
      executedLine: index >= 2 ? this.lines[index - 1] ?? null : null
    }) ?? void 0);
    return custom ?? this.stepMs;
  }
  emit() {
    this.position.set(this.currentPosition());
  }
  currentPosition() {
    const trace2 = this.trace;
    if (trace2 === null) return null;
    const step2 = this.traceIndex >= 1 && this.traceIndex <= trace2.steps.length ? trace2.steps[this.traceIndex - 1] : null;
    return {
      traceIndex: this.traceIndex,
      atEnd: this.traceIndex === maxIndex(trace2),
      event: step2?.event ?? null,
      state: trace2.at(this.traceIndex),
      previous: trace2.at(Math.max(0, this.traceIndex - 1))
    };
  }
  /** 当前语句后果：合并作用域相对上一步的变量 diff；调用栈由火焰图自示。 */
  paintDiff() {
    if (this.trace === null) {
      this.diff.replaceChildren();
      return;
    }
    const current = this.trace.at(this.traceIndex);
    const previous = this.trace.at(Math.max(0, this.traceIndex - 1));
    this.diff.replaceChildren(variableRows(scopedVariables(current), scopedVariables(previous)));
  }
  paint() {
    if (this.trace === null) {
      this.flame.replaceChildren();
      return;
    }
    const finalIndex = maxIndex(this.trace);
    const measuredSlots = this.flame.clientWidth > 0 ? Math.max(1, Math.floor(this.flame.clientWidth / MIN_TRACE_SLOT)) : MAX_VISIBLE_SLOTS;
    this.viewSpan = Math.max(1, Math.min(MAX_VISIBLE_SLOTS, measuredSlots, finalIndex));
    this.viewStart = Math.max(1, Math.min(this.traceIndex - Math.floor(this.viewSpan / 2), finalIndex + 1 - this.viewSpan));
    const viewEnd = this.viewStart + this.viewSpan;
    const active = this.blocks.filter((block) => block.start <= this.traceIndex && this.traceIndex < block.end);
    const deepest = active.reduce((found, block) => found === null || block.row >= found.row ? block : found, null);
    const nodes = [];
    for (const block of this.blocks) {
      const left = Math.max(block.start, this.viewStart);
      const right = Math.min(block.end, viewEnd);
      if (right <= left) continue;
      const width = 100 * (right - left) / this.viewSpan;
      const blockNode = node("span", `pico-trace-block pico-trace-kind-${block.kind}`);
      blockNode.dataset.kind = block.kind;
      blockNode.dataset.palette = String(flamePalette(block));
      blockNode.dataset.phase = block.start > this.traceIndex ? "future" : block.end <= this.traceIndex ? "past" : "active";
      blockNode.dataset.current = String(block === deepest);
      blockNode.style.setProperty("--pico-trace-left", `${100 * (left - this.viewStart) / this.viewSpan}%`);
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
    cursor.style.left = `${100 * (this.traceIndex - this.viewStart + 0.5) / this.viewSpan}%`;
    const maxRow = this.blocks.reduce((found, block) => Math.max(found, block.row), -1);
    this.canvas.style.height = `${maxRow * 24 + 24}px`;
    const bound = (index, label) => {
      const element = node("div", "pico-trace-bound");
      element.style.left = `${100 * (index - this.viewStart) / this.viewSpan}%`;
      element.style.width = `${100 / this.viewSpan}%`;
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
  move(traceIndex) {
    const firstIndex = this.trace === null ? 0 : 1;
    const next = Math.max(firstIndex, clamp(this.trace, traceIndex));
    if (next === this.traceIndex) {
      if (next === firstIndex || next >= maxIndex(this.trace)) this.stopTransport();
      return;
    }
    this.traceIndex = next;
    this.paint();
    this.paintDiff();
    this.updateControls();
    this.emit();
    if (next === firstIndex || next >= maxIndex(this.trace)) this.stopTransport();
  }
  endDrag() {
    const pointer = this.dragPointer;
    this.dragPointer = null;
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
    return Math.floor(this.viewStart + ratio * this.viewSpan);
  }
  updateControls() {
    const atStart = this.traceIndex <= 1;
    const atEnd = this.traceIndex >= maxIndex(this.trace);
    this.controls.dataset.state = this.transport;
    for (const [action, button] of this.buttons) {
      button.disabled = this.trace === null || (action === "start" || action === "previous" ? atStart : action === "end" || action === "next" ? atEnd : action === "reverse" ? this.playbackLevel <= -PLAYBACK_MULTIPLIERS.length || atStart && this.playbackLevel <= 0 : action === "forward" ? this.playbackLevel >= PLAYBACK_MULTIPLIERS.length || atEnd && this.playbackLevel >= 0 : this.transport === "stopped");
      if (action === "forward" || action === "reverse") {
        button.setAttribute("aria-pressed", String(action === this.transport));
        const label = action === "forward" ? this.playbackLevel < 0 ? "\u964D\u4F4E\u53CD\u5411\u901F\u5EA6" : "\u589E\u52A0\u6B63\u5411\u901F\u5EA6" : this.playbackLevel > 0 ? "\u964D\u4F4E\u6B63\u5411\u901F\u5EA6" : "\u589E\u52A0\u53CD\u5411\u901F\u5EA6";
        button.title = label;
        button.setAttribute("aria-label", label);
      }
    }
    this.rate.hidden = this.playbackLevel === 0;
    this.rate.textContent = this.playbackLevel === 0 ? "" : `${PLAYBACK_MULTIPLIERS[Math.abs(this.playbackLevel) - 1]}\xD7`;
    this.rate.setAttribute("aria-label", this.playbackLevel === 0 ? "\u5DF2\u6682\u505C" : `${this.playbackLevel > 0 ? "\u6B63\u5411" : "\u53CD\u5411"} ${this.rate.textContent}`);
  }
  adjustPlayback(delta) {
    const level = Math.max(-PLAYBACK_MULTIPLIERS.length, Math.min(PLAYBACK_MULTIPLIERS.length, this.playbackLevel + delta));
    this.stopTransport();
    if (level === 0 || this.disposed || this.trace === null || (level > 0 ? this.traceIndex >= maxIndex(this.trace) : this.traceIndex <= 1)) return;
    this.playbackLevel = level;
    this.transport = level > 0 ? "forward" : "reverse";
    this.schedulePlayback();
    this.updateControls();
  }
  /** 每个落点可以停留不同时长，所以逐落点重排计时器，而不是固定间隔。 */
  schedulePlayback() {
    const level = this.playbackLevel;
    if (level === 0) return;
    const delay = this.holdFor(this.traceIndex) / PLAYBACK_MULTIPLIERS[Math.abs(level) - 1];
    this.playTimer = window.setTimeout(() => {
      if (this.playTimer !== null) window.clearTimeout(this.playTimer);
      this.playTimer = null;
      if (this.disposed || this.playbackLevel !== level) return;
      this.move(this.traceIndex + Math.sign(level));
      if (this.playbackLevel === level) this.schedulePlayback();
    }, delay);
  }
  stopTransport() {
    if (this.playTimer !== null) window.clearTimeout(this.playTimer);
    this.playTimer = null;
    this.transport = "stopped";
    this.playbackLevel = 0;
    this.updateControls();
  }
};

// src/libs/debugger/index.ts
var Debugger = class {
  #core;
  /** stepMs 必须是有限正数；stepMsFor 必须是函数；缺省 1× 档每步 1000/3 毫秒。 */
  constructor(options) {
    this.#core = new DebuggerCore(options?.stepMs, options?.stepMsFor, options?.playback);
  }
  /** 当前回放位置，初始为 null；换 Trace、定位或用户回放时同步更新。 */
  get position() {
    return this.#core.position;
  }
  get element() {
    return this.#core.element;
  }
  /**
   * 新 trace 默认落在最终位置，同一 trace 保留位置；landing 显式定位并停止播放。
   * landing 为 traceIndex，小数截断并夹到 1..steps.length+1，非有限值按起点处理。
   * controlFlow=null 等同空结构列表，仍可回放，只不标注循环/分支结构。
   * null 清空视图。trace 或位置变化时同步更新 position，重复渲染不重复通知。
   * 播放计时器、缩放和拖动仅属于此视图，不执行 Python。
   */
  render(trace2, controlFlow, landing) {
    this.#core.render(trace2, controlFlow, landing);
  }
  dispose() {
    this.#core.dispose();
  }
};

// src/libs/editor/impl.ts
import { StateEffect, StateField, EditorState as CMEditorState } from "./libs/codemirror.js";
import { Decoration, EditorView, drawSelection, keymap, lineNumbers } from "./libs/codemirror.js";
import { autocompletion } from "./libs/codemirror.js";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "./libs/codemirror.js";
import { globalCompletion, localCompletionSource, python } from "./libs/codemirror.js";
import { bracketMatching, HighlightStyle, indentUnit, syntaxHighlighting } from "./libs/codemirror.js";
import { tags } from "./libs/codemirror.js";
var setLineEffect = StateEffect.define();
var cleanPaste = CMEditorState.transactionFilter.of((tr) => {
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
var lineMarkField = StateField.define({
  create: () => Decoration.none,
  update(value, tr) {
    if (tr.docChanged) return Decoration.none;
    for (const e of tr.effects) {
      if (e.is(setLineEffect)) {
        const mark = e.value;
        if (!mark) return Decoration.none;
        const line = tr.state.doc.line(mark.line);
        const cls = mark.kind === "error" ? "pico-line-error" : "pico-line-exec";
        return Decoration.set([Decoration.line({ class: cls }).range(line.from)]);
      }
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
  ".pico-line-error": {
    backgroundColor: "var(--pico-hue-error-bg)",
    boxShadow: "inset 4px 0 0 var(--pico-hue-error-strong)"
  }
});
var views = /* @__PURE__ */ new WeakMap();
var editorText = (text) => text.replace(/\r?\n$/, "");
var EditorCore = class {
  #source;
  #disposed = false;
  constructor(text) {
    this.#source = createState(editorText(text));
  }
  get source() {
    return this.#source;
  }
  get text() {
    return this.#source.getSnapshot();
  }
  replace(text) {
    if (this.#disposed) return;
    const next = editorText(text);
    syncEditorText(this, next);
    this.#source.set(next);
  }
  acceptEdit(text) {
    if (!this.#disposed) this.#source.set(text);
  }
  get element() {
    if (this.#disposed) throw new Error("Editor is disposed");
    return stateOf(this).card;
  }
  showLine(line, kind, scroll) {
    if (!this.#disposed) showEditorLine(this, line, kind, scroll);
  }
  clearLine() {
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
function createView(editor, host) {
  return new EditorView({
    parent: host,
    state: CMEditorState.create({
      doc: editor.text,
      extensions: [
        lineNumbers(),
        drawSelection(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        python(),
        autocompletion({ override: [globalCompletion, localCompletionSource] }),
        bracketMatching(),
        indentUnit.of("    "),
        cleanPaste,
        syntaxHighlighting(picoHighlightStyle),
        lineMarkField,
        editorTheme,
        // 直接发布正在编辑的文档，不应用文件结束换行的规范化。
        EditorView.updateListener.of((update) => {
          const state2 = views.get(editor);
          if (state2 === void 0 || state2.applying || !update.docChanged) return;
          editor.acceptEdit(update.state.doc.toString());
        })
      ]
    })
  });
}
function stateOf(editor) {
  let state2 = views.get(editor);
  if (state2 === void 0) {
    const host = document.createElement("div");
    host.className = "pico-w-editor-host";
    const card = document.createElement("div");
    card.className = "pico-card";
    card.append(host);
    state2 = { card, host, view: createView(editor, host), applying: false };
    views.set(editor, state2);
  }
  return state2;
}
function syncEditorText(editor, next) {
  const state2 = views.get(editor);
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
function showEditorLine(editor, line, kind, scroll = true) {
  const { view } = stateOf(editor);
  const clamped = Math.min(Math.max(Number.isFinite(line) ? Math.trunc(line) : 1, 1), view.state.doc.lines);
  const target = view.state.doc.line(clamped);
  const effects = [setLineEffect.of({ line: clamped, kind })];
  if (scroll && !view.hasFocus) {
    effects.push(EditorView.scrollIntoView(target.from, { y: "center" }));
  }
  view.dispatch({ effects });
}

// src/libs/editor/index.ts
var Editor = class {
  #core;
  /** 初始文本仅移除一个末尾 LF/CRLF，不 trim 其他空白。 */
  constructor(text) {
    this.#core = new EditorCore(text);
  }
  /** 当前完整文本；用户编辑和 replace 均同步发布变化，用户编辑不移除末尾换行。 */
  get source() {
    return this.#core.source;
  }
  /** 等同 source.getSnapshot()。 */
  get text() {
    return this.#core.text;
  }
  /** 替换全文并移除一个末尾 LF/CRLF；规范化后相同的文本不通知订阅者。 */
  replace(text) {
    this.#core.replace(text);
  }
  get element() {
    return this.#core.element;
  }
  /** 单行高亮，行号从 1 起；小数截断、越界夹到首末行，非有限值按 1 处理。
   * 默认滚动到该行，但编辑器聚焦时不滚动；文本变化自动清除高亮。 */
  showLine(line, kind, scroll = true) {
    this.#core.showLine(line, kind, scroll);
  }
  clearLine() {
    this.#core.clearLine();
  }
  /** 可重复调用；释放视图并移除 DOM。之后 replace/showLine 无操作，访问 element 抛错。 */
  dispose() {
    this.#core.dispose();
  }
};

// src/libs/linker/runtime.py
var runtime_default = 'import builtins\nimport contextlib\nimport io\nimport json\nimport os\nimport sys\nimport time\nimport traceback\n\n\n_TRACE_RESOURCES = {}\n\n\ndef register_trace_resource(name, records):\n    """Register a live append-only sequence; snapshots store only its length."""\n    key, suffix = name, 1\n    while key in _TRACE_RESOURCES:\n        key = f"{name}:{suffix}"\n        suffix += 1\n    _TRACE_RESOURCES[key] = records\n    return key\n\n\nclass _PicoProgramFinished(BaseException):\n    """Successful terminal operation, separate from user errors and resource limits."""\n\n\ndef finish():\n    raise _PicoProgramFinished()\n\n\n# JSON \u8FB9\u754C\u5916\u7684\u503C\u76F4\u63A5\u8DF3\u8FC7\uFF08\u51FD\u6570\u3001set\u3001nan\u2026\u2026\u4E0D\u51FA\u73B0\u5728\u53D8\u91CF\u9762\u677F\uFF09\uFF0C\u9519\u8BEF\u4E0D\u4F20\u64AD\u5230 RunResult\u3002\n# JS \u5B89\u5168\u6574\u6570\uFF08\xB12^53-1\uFF09\u4E4B\u5916\u7684 int \u4F1A\u88AB JSON.parse \u6EA2\u51FA\u6216\u4E22\u7CBE\u5EA6\uFF0C\u540C\u6837\u6309\u4E0D\u53EF\u5E8F\u5217\u5316\u5904\u7406\u3002\n_SAFE_INT = 2 ** 53 - 1\n_MISSING = object()\n\n\ndef _json_value(value):\n    if isinstance(value, int) and not isinstance(value, bool) and not -_SAFE_INT <= value <= _SAFE_INT:\n        return _MISSING\n    try:\n        encoded = json.dumps(value, allow_nan=False)\n    except (OverflowError, RecursionError, TypeError, ValueError):\n        return _MISSING\n    return json.loads(encoded)\n\n\ndef _variables(values):\n    result = {}\n    for name, value in values.items():\n        if name.startswith("__"):\n            continue\n        encoded = _json_value(value)\n        if encoded is not _MISSING:\n            result[name] = encoded\n    return result\n\n\ndef _source_frames(frame, source_filename):\n    frames = []\n    while frame is not None:\n        if frame.f_code.co_filename == source_filename:\n            frames.append(\n                {\n                    "name": frame.f_code.co_name,\n                    "locals": _variables(frame.f_locals),\n                }\n            )\n        frame = frame.f_back\n    frames.reverse()\n    return frames\n\n\ndef _snapshot(line, frame, environment, stdout, stderr, observe, source_filename):\n    state = {\n        "line": line,\n        "stdout": stdout.getvalue(),\n        "stderr": stderr.getvalue(),\n    }\n    if _TRACE_RESOURCES:\n        state["resources"] = {name: len(records) for name, records in _TRACE_RESOURCES.items()}\n    if observe is not None and observe.get("globals"):\n        state["globals"] = _variables(environment)\n    if observe is not None and observe.get("locals"):\n        state["frames"] = _source_frames(frame, source_filename) if frame is not None else []\n    return state\n\n\ndef _frame_changes(before, after):\n    changes = []\n    before_names = [frame["name"] for frame in before]\n    after_names = [frame["name"] for frame in after]\n    if len(after) == len(before) + 1 and before_names == after_names[:-1]:\n        for index, (old_frame, new_frame) in enumerate(zip(before, after)):\n            frame_index = -1 if index == len(before) - 1 else index\n            changes.extend(\n                _changes(old_frame["locals"], new_frame["locals"], ("frames", frame_index, "locals"))\n            )\n        changes.append({"op": "append", "path": ["frames"], "value": after[-1]})\n        return changes\n    if len(before) == len(after) + 1 and before_names[:-1] == after_names:\n        changes.append({"op": "remove", "path": ["frames", -1]})\n        for index, (old_frame, new_frame) in enumerate(zip(before, after)):\n            frame_index = -1 if index == len(after) - 1 else index\n            changes.extend(\n                _changes(old_frame["locals"], new_frame["locals"], ("frames", frame_index, "locals"))\n            )\n        return changes\n    if len(before) != len(after) or before_names != after_names:\n        return [{"op": "put", "path": ["frames"], "value": after}]\n    for index, (old_frame, new_frame) in enumerate(zip(before, after)):\n        frame_index = -1 if index == len(after) - 1 else index\n        changes.extend(\n            _changes(\n                old_frame["locals"],\n                new_frame["locals"],\n                ("frames", frame_index, "locals"),\n            )\n        )\n    return changes\n\n\ndef _changes(before, after, path=()):\n    if path == ("frames",) and isinstance(before, list) and isinstance(after, list):\n        return _frame_changes(before, after)\n    if isinstance(before, dict) and isinstance(after, dict):\n        # \u540C\u4E00\u6B21\u91C7\u6837\u95F4\u53EF\u80FD\u5220\u6389\u518D\u521B\u5EFA\u540C\u540D\u952E\uFF1B\u666E\u901A put \u4E0D\u4F1A\u6539\u53D8\u5DF2\u6709\u952E\u7684\u4F4D\u7F6E\u3002\n        retained = [key for key in before if key in after]\n        added = [key for key in after if key not in before]\n        if retained + added != list(after):\n            return [{"op": "put", "path": list(path), "value": after}]\n        changes = []\n        for key in before:\n            if key not in after:\n                changes.append({"op": "remove", "path": [*path, key]})\n        for key in after:\n            if key not in before:\n                changes.append({"op": "put", "path": [*path, key], "value": after[key]})\n            else:\n                changes.extend(_changes(before[key], after[key], (*path, key)))\n        return changes\n    if before == after:\n        return []\n    if path in (("stdout",), ("stderr",)) and isinstance(before, str) and after.startswith(before):\n        return [{"op": "append", "path": list(path), "value": after[len(before) :]}]\n    return [{"op": "put", "path": list(path), "value": after}]\n\n\nclass _PicoRunLimit(BaseException):\n    """runner \u65BD\u52A0\u7684\u8FD0\u884C\u9650\u5236\u4E2D\u6B62\uFF08\u8D85\u65F6 / \u6B65\u6570\u8D85\u9650\uFF09\uFF0Cmessage \u76F4\u63A5\u9762\u5411\u5B66\u751F\u3002\n    \u7EE7\u627F BaseException\uFF1A\u5B66\u751F\u4EE3\u7801\u7684 except Exception \u4E0D\u80FD\u541E\u6389\u8FD0\u884C\u63A7\u5236\u6D41\u3002"""\n\n\nclass _PicoWaitingForInput(BaseException):\n    """interactive stdin \u7F13\u51B2\u8017\u5C3D\uFF1A\u672C\u6B21\u8FD0\u884C\u505C\u5728 input()\uFF0C\u8C03\u7528\u65B9\u8865\u4E00\u884C\u540E\u4ECE\u5934\u91CD\u8DD1\u3002"""\n\n\ndef _trace(samples, events, observe, environment, stdout, stderr, source_filename, deadline, max_steps):\n    def trace(frame, event, _argument):\n        if deadline[0] is not None and time.monotonic() >= deadline[0]:\n            raise _PicoRunLimit("\u7A0B\u5E8F\u8FD0\u884C\u8D85\u65F6")\n        # single-step \u8BED\u4E49\uFF1A\u4E00\u6B65 = \u8C03\u8BD5\u5668\u505C\u5728\u5B66\u751F\u4EE3\u7801\u91CC\u7684\u4E00\u4E2A\u843D\u70B9\u3002\n        # stmt \u505C\u5728\u5F53\u524D\u6E90\u7801\u5E27\uFF1Bcall \u505C\u5728\u88AB\u8C03\u6E90\u7801\u5E27\uFF08\u6A21\u5757\u5165\u53E3\u7B2C 0 \u884C\u4E0D\u6210\u6B65\uFF09\uFF1B\n        # return \u505C\u5728\u843D\u70B9\u5E27\uFF08f_back\uFF09\u2014\u2014\u843D\u56DE driver/\u8FD0\u884C\u5E93\u7684\u8FD4\u56DE\u5BF9\u5B66\u751F\u4E0D\u53EF\u89C1\uFF0C\u4E0D\u6784\u6210\u6B65\u3002\n        step_event = {"line": "stmt", "call": "call", "return": "return"}.get(event)\n        step_frame = None\n        if step_event in events and frame.f_code.co_filename == source_filename:\n            step_frame = frame\n            if step_event == "call" and frame.f_lineno < 1:\n                step_frame = None\n            elif step_event == "return":\n                landing = frame.f_back\n                if landing is None or landing.f_code.co_filename != source_filename:\n                    step_frame = None\n                else:\n                    step_frame = landing\n        if step_frame is not None:\n            if max_steps is not None and len(samples) >= max_steps:\n                raise _PicoRunLimit("\u7A0B\u5E8F\u6B65\u6570\u8D85\u8FC7\u4E0A\u9650")\n            samples.append(\n                (\n                    step_event,\n                    _snapshot(\n                        step_frame.f_lineno,\n                        step_frame,\n                        environment,\n                        stdout,\n                        stderr,\n                        observe,\n                        source_filename,\n                    ),\n                )\n            )\n        return trace\n\n    return trace\n\n\ndef _source_line(exception, source_filename):\n    line = None\n    current = exception.__traceback__\n    while current is not None:\n        if current.tb_frame.f_code.co_filename == source_filename:\n            line = current.tb_lineno\n        current = current.tb_next\n    return line\n\n\ndef _is_program_exception(exception, source_filename):\n    if isinstance(exception, SyntaxError):\n        return exception.filename == source_filename\n    return _source_line(exception, source_filename) is not None\n\n\ndef _program_error(exception, source_filename, stderr):\n    if isinstance(exception, SyntaxError):\n        traceback.print_exception(exception, file=stderr)\n        return {\n            "returncode": 1,\n            "error": {"message": str(exception), "line": exception.lineno},\n        }\n    if isinstance(exception, SystemExit):\n        code = exception.code\n        if code is None or code == 0:\n            return {"returncode": 0, "error": None}\n        if not isinstance(code, int):\n            print(code, file=stderr)\n            code = 1\n        return {\n            "returncode": code,\n            "error": {"message": f"\u7A0B\u5E8F\u4EE5\u72B6\u6001\u7801 {code} \u9000\u51FA", "line": None},\n        }\n    traceback.print_exception(exception, file=stderr)\n    return {\n        "returncode": 1,\n        "error": {\n            "message": f"{type(exception).__name__}: {exception}",\n            "line": _source_line(exception, source_filename),\n        },\n    }\n\n\ndef _builtins_for(stdin_config, stdout):\n    values = vars(builtins).copy()\n    if stdin_config["kind"] == "interactive":\n        # input() \u8BFB\u7F13\u51B2\u7684\u4E0B\u4E00\u884C\uFF1B\u8017\u5C3D\u5373\u4E2D\u6B62\u672C\u6B21\u8FD0\u884C\uFF08waiting\uFF09\uFF0Cprompt \u7167\u5E38\u56DE\u663E\uFF0C\n        # \u8BA9\u91CD\u8DD1\u540E\u7684 stdout \u4E0E\u771F\u7EC8\u7AEF\u4E00\u81F4\u3002\n        def interactive_input(prompt=""):\n            text = str(prompt)\n            stdout.write(text)\n            line = sys.stdin.readline()\n            if line == "":\n                raise _PicoWaitingForInput(text)\n            if not line.endswith("\\n"):\n                line += "\\n"\n            return line[:-1]\n\n        values["input"] = interactive_input\n    return values\n\n\ndef _trace_result(samples, initial_state, final_state):\n    steps = []\n    previous = initial_state\n    for event, sample in samples:\n        steps.append({"event": event, "changes": _changes(previous, sample)})\n        previous = sample\n    return {\n        "initialState": initial_state,\n        "steps": steps,\n        "finalState": final_state,\n        "resources": {name: list(records) for name, records in _TRACE_RESOURCES.items()},\n    }\n\n\ndef run(source_path, config_json):\n    _TRACE_RESOURCES.clear()\n    config = json.loads(config_json)\n    run_options = {}\n    if os.path.exists("_pico_run.json"):\n        with open("_pico_run.json", encoding="utf-8") as run_file:\n            run_options = json.load(run_file)\n    stdin_config = run_options.get("stdin") or {"kind": "string", "value": ""}\n    trace_options = run_options.get("trace") or {"events": [], "observe": None}\n    events = frozenset(trace_options["events"])\n    observe = trace_options["observe"]\n    deadline = [\n        time.monotonic() + run_options["timeoutMs"] / 1000\n        if run_options.get("timeoutMs") is not None\n        else None\n    ]\n    max_steps = run_options.get("maxTraceSteps")\n\n    stdout = io.StringIO()\n    stderr = io.StringIO()\n    stdin = io.StringIO(stdin_config["value"])\n    source_filename = source_path\n    with open(source_path, encoding="utf-8", newline="") as source_file:\n        source = source_file.read()\n\n    environment = {\n        "__builtins__": _builtins_for(stdin_config, stdout),\n        "__file__": source_filename,\n        "__name__": "__main__",\n    }\n    samples = []\n    tracer = _trace(samples, events, observe, environment, stdout, stderr, source_filename, deadline, max_steps)\n    old_stdin = sys.stdin\n    outcome = None\n\n    try:\n        sys.stdin = stdin\n        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):\n            if config["prelude"]:\n                exec(compile(config["prelude"], "<pico-prelude>", "exec"), environment, environment)\n            initial_state = _snapshot(None, None, environment, stdout, stderr, observe, source_filename)\n            try:\n                if events or deadline[0] is not None:\n                    sys.settrace(tracer)\n                exec(compile(source, source_filename, "exec"), environment, environment)\n                if config["driver"]:\n                    exec(compile(config["driver"], "<pico-driver>", "exec"), environment, environment)\n            except _PicoProgramFinished:\n                outcome = {"returncode": 0, "error": None}\n            except _PicoRunLimit as limit:\n                print(str(limit), file=stderr)\n                outcome = {\n                    "returncode": 124,\n                    "error": {\n                        "message": str(limit),\n                        "line": _source_line(limit, source_filename),\n                    },\n                }\n            except _PicoWaitingForInput as waiting:\n                outcome = {\n                    "returncode": 0,\n                    "error": None,\n                    "waiting": {"prompt": str(waiting)},\n                }\n            except BaseException as exception:\n                if not _is_program_exception(exception, source_filename):\n                    raise\n                outcome = _program_error(exception, source_filename, stderr)\n            finally:\n                sys.settrace(None)\n    finally:\n        sys.stdin = old_stdin\n\n    if outcome is None:\n        outcome = {"returncode": 0, "error": None}\n    final_state = _snapshot(None, None, environment, stdout, stderr, observe, source_filename)\n    trace = _trace_result(samples, initial_state, final_state)\n    result = {\n        "trace": trace,\n        "returncode": outcome["returncode"],\n        "error": outcome["error"],\n        "waiting": outcome.get("waiting"),\n    }\n    return json.dumps(result, ensure_ascii=False, separators=(",", ":"), allow_nan=False)\n';

// src/libs/linker/impl.ts
function linkProgramImpl(source, prelude, driver, files) {
  const config = JSON.stringify({
    prelude: prelude ?? "",
    driver: driver ?? ""
  });
  const main = [
    "import _pico_runtime as _pico",
    `__pico_result__ = _pico.run("source.py", ${JSON.stringify(config)})`,
    ""
  ].join("\n");
  for (const path of Object.keys(files ?? {})) {
    if (["main.py", "source.py", "_pico_runtime.py"].includes(path)) {
      throw new Error(`\u9644\u52A0\u6587\u4EF6\u4E0D\u80FD\u8986\u76D6 ${path}`);
    }
  }
  return Object.freeze({
    ...files,
    "main.py": main,
    "source.py": source,
    "_pico_runtime.py": runtime_default
  });
}

// src/libs/linker/index.ts
function linkProgram(source, options) {
  return linkProgramImpl(source, options?.prelude, options?.driver, options?.files);
}

// src/libs/playground/impl.ts
import { useEffect as useEffect2, useMemo, useRef as useRef2, useState as useState2 } from "./libs/react.js";

// src/libs/playground/draft.ts
function draftStorageKey(pathname, search = "", hash = "") {
  return `pico:editor:${pathname}${search}${hash}`;
}
function textOrEmpty(value) {
  return typeof value === "string" ? value : "";
}
function createDraftBackend(scope) {
  if (typeof scope !== "object" || scope === null) return null;
  const window2 = scope;
  const injected = hostBridge(window2)?.draft;
  if (injected !== void 0 && injected !== null) {
    return {
      load: () => injected.initial,
      save: (text) => {
        void injected.save(text);
      },
      clear: () => {
        void injected.clear();
      }
    };
  }
  const pathname = window2.location?.pathname;
  if (typeof pathname !== "string") return null;
  const key = draftStorageKey(
    pathname,
    textOrEmpty(window2.location?.search),
    textOrEmpty(window2.location?.hash)
  );
  const storage = () => window2.localStorage ?? null;
  return {
    load: () => {
      try {
        return storage()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    save: (text) => {
      try {
        storage()?.setItem(key, text);
      } catch {
      }
    },
    clear: () => {
      try {
        storage()?.removeItem(key);
      } catch {
      }
    }
  };
}

// src/libs/runner/runner.ts
import { loadPyodide } from "./libs/pyodide.js";

// src/libs/runner/pyodideBases.ts
function pyodideBases(scope) {
  if (Array.isArray(scope.__PICO_PYODIDE_BASES__)) {
    return scope.__PICO_PYODIDE_BASES__.filter(
      (base) => typeof base === "string" && base.length > 0
    );
  }
  const single = scope.__PICO_PYODIDE_BASE__;
  return typeof single === "string" && single.length > 0 ? [single] : [];
}
async function loadFirstPyodide(bases, load) {
  if (bases.length === 0) return await load(void 0);
  let last;
  for (const base of bases) {
    try {
      return await load(base);
    } catch (error2) {
      console.warn(`Pyodide \u4ECE ${base} \u52A0\u8F7D\u5931\u8D25\uFF0C\u6539\u7528\u4E0B\u4E00\u4E2A\u6765\u6E90`, error2);
      last = error2;
    }
  }
  throw last;
}

// src/libs/runner/trace.ts
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

// src/libs/runner/runner.ts
var pyodidePromise;
var queue = Promise.resolve();
var runId = 0;
function pyodide() {
  if (pyodidePromise === void 0) {
    pyodidePromise = loadFirstPyodide(
      pyodideBases(globalThis),
      (base) => base === void 0 ? loadPyodide() : loadPyodide({ indexURL: base })
    ).catch((error2) => {
      pyodidePromise = void 0;
      throw error2;
    });
  }
  return pyodidePromise;
}
function warmupProgramImpl() {
  return pyodide().then(() => void 0, () => void 0);
}
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
      throw new TypeError(`RunOptions.${name} \u5FC5\u987B\u662F\u6B63\u6574\u6570: ${value}`);
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
  if (!isRecord(resources) || !Object.values(resources).every((log) => Array.isArray(log) && log.every(isJson))) return void 0;
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
  if (!isRecord(value)) throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u8FD4\u56DE\u4E86\u65E0\u6548 RunResult");
  const parsedTrace = trace(value.trace);
  if (parsedTrace === void 0 || !Number.isInteger(value.returncode)) {
    throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u8FD4\u56DE\u4E86\u65E0\u6548 RunResult");
  }
  const failed = value.error !== null && value.error !== void 0;
  if (failed === (value.returncode === 0) || failed && error(value.error) === void 0) {
    throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u8FD4\u56DE\u4E86\u65E0\u6548 RunResult");
  }
  const parsedWaiting = waiting(value.waiting);
  if (parsedWaiting !== null && (failed || value.returncode !== 0)) {
    throw new Error("Linker \u79C1\u6709\u534F\u8BAE\u8FD4\u56DE\u4E86\u65E0\u6548 RunResult");
  }
  return deepFreeze({
    trace: parsedTrace,
    returncode: value.returncode,
    error: failed ? value.error : null,
    waiting: parsedWaiting
  });
}
async function execute(files, options) {
  const runtime = await pyodide();
  options?.signal?.throwIfAborted();
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
function runProgramImpl(files, options) {
  let project;
  let snapshot;
  try {
    project = projectCopy(files);
    numericOptions(options);
    const { signal, ...values } = options ?? {};
    signal?.throwIfAborted();
    snapshot = { ...structuredClone(values), signal };
  } catch (error2) {
    return Promise.reject(error2);
  }
  const next = queue.then(() => {
    snapshot?.signal?.throwIfAborted();
    return execute(project, snapshot);
  });
  queue = next.then(() => void 0, () => void 0);
  return next;
}

// src/libs/runner/index.ts
function runProgram(files, options) {
  return runProgramImpl(files, options);
}
function appendedStdin(value, line) {
  const terminated = value === "" || value.endsWith("\n") ? value : `${value}
`;
  return `${terminated}${line}
`;
}
function warmupProgram() {
  return warmupProgramImpl();
}
var Trace = class {
  initialState;
  steps;
  finalState;
  /** Python 自动维护的只追加资源日志；每份只存一次，ProgramState.resources 存游标。 */
  resources;
  constructor(fields) {
    this.initialState = immutableCopy(fields.initialState);
    this.steps = immutableCopy(fields.steps);
    this.finalState = immutableCopy(fields.finalState);
    this.resources = immutableCopy(fields.resources ?? {});
  }
  /**
   * 整数范围 0..steps.length + 1；0 为 initialState，最后一个位置为 finalState。
   * 位置 i（1..steps.length）为应用 steps[i - 1] 后的不可变状态；越界抛错。
   * finalState 是独立终止快照，不对应某个 step。最终位置不存在下一状态。
   */
  at(traceIndex) {
    return stateAtImpl(this, traceIndex);
  }
};

// src/libs/playground/execution.ts
function createExecution(input, debounceMs = 400) {
  if (!Number.isFinite(debounceMs) || debounceMs < 0) throw new RangeError("debounceMs must be nonnegative");
  const execution = createState({ status: "idle" });
  let timer;
  let active;
  let disposed = false;
  let generation = 0;
  function cancel() {
    generation += 1;
    clearTimeout(timer);
    timer = void 0;
    active?.abort();
    active = void 0;
  }
  function launch(request) {
    if (disposed) return;
    cancel();
    const current = generation;
    const controller = new AbortController();
    active = controller;
    execution.set({ status: "pending", request });
    if (disposed || current !== generation) return;
    void Promise.all([analyzeProgram(request.source), runProgram(linkProgram(request.source, request), {
      ...request.options,
      timeoutMs: request.options?.timeoutMs ?? 2e3,
      maxTraceSteps: request.options?.maxTraceSteps ?? 2e4,
      signal: controller.signal
    })]).then(
      ([analysis, result2]) => {
        if (!disposed && current === generation) execution.set({ status: "ready", request, result: result2, analysis });
      },
      (error2) => {
        if (!disposed && current === generation) execution.set({ status: "failed", request, error: error2 });
      }
    );
  }
  function refresh() {
    cancel();
    const current = generation;
    execution.set({ status: "idle" });
    if (disposed || current !== generation) return;
    const request = input.getSnapshot();
    if (request.trigger === "automatic") timer = setTimeout(() => launch(request), debounceMs);
  }
  const unsubscribe = input.subscribe(refresh);
  refresh();
  return {
    execution,
    run: () => launch(input.getSnapshot()),
    feed(line) {
      const current = execution.getSnapshot();
      if (current.status !== "ready" || current.result.waiting === null) return;
      const stdin = current.request.options?.stdin;
      if (typeof stdin !== "object" || stdin.kind !== "interactive") return;
      launch({
        ...current.request,
        options: {
          ...current.request.options,
          stdin: { kind: "interactive", value: appendedStdin(stdin.value, line) }
        }
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancel();
      unsubscribe();
    }
  };
}

// src/libs/playground/wire.ts
function wireImpl(states) {
  const names = Object.keys(states);
  return derive(names.map((name) => states[name]), (...values) => Object.fromEntries(names.map((name, index) => [name, values[index]])));
}

// src/libs/terminal/impl.ts
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
var PROMPT = "\u203A ";
var TerminalCore = class {
  submission = createState(null);
  #root = null;
  #host = null;
  #empty = null;
  #surfaceFactory;
  #surface = null;
  #pending = null;
  #accepting = false;
  #inputRequested = false;
  #buffer = "";
  #lineStart = true;
  // 光标在行首（上次写以 \n 结尾）
  #shownOut = "";
  #shownErr = "";
  #hasActivity = false;
  #disposed = false;
  #unsubscribe = null;
  constructor(options) {
    this.#surfaceFactory = options.surface ?? defaultSurface;
  }
  /** 终端元素；访问即开始装载表面（挂载后尽早懒加载 xterm）。 */
  get element() {
    if (this.#disposed) throw new Error("Terminal is disposed");
    if (this.#root === null) {
      ensureStyle(TERMINAL_CSS);
      this.#root = node("div", "pico-widget pico-term");
      this.#host = node("div", "pico-term-body");
      this.#empty = emptySurface();
      const watermark = panelWatermark(PANEL_ICONS.output);
      this.#root.append(this.#host, this.#empty, watermark);
      this.#syncEmpty();
    }
    this.#ensure();
    return this.#root;
  }
  #reset() {
    if (this.#disposed) return;
    this.#shownOut = "";
    this.#shownErr = "";
    this.#buffer = "";
    this.#accepting = false;
    this.#inputRequested = false;
    this.#hasActivity = false;
    this.#lineStart = true;
    if (this.#surface !== null) {
      this.#surface.reset();
      this.#surface.setActive(false);
    }
    this.#syncEmpty();
    this.submission.set(null);
  }
  render(view) {
    if (this.#disposed) return;
    if (view === null) {
      this.#reset();
      return;
    }
    const outputChanged = view.stdout !== this.#shownOut || view.stderr !== this.#shownErr;
    const wasRequested = this.#inputRequested;
    this.#inputRequested = view.input;
    if (outputChanged && this.#accepting) {
      this.#emit("", void 0, true);
      this.#lineStart = true;
    }
    this.#renderOutput(view.stdout, view.stderr);
    if (!view.input) this.#setAcceptingInput(false);
    else if (!wasRequested) this.#setAcceptingInput(true);
    else if (outputChanged && this.#accepting) {
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
  #setAcceptingInput(accepting) {
    if (this.#disposed) return;
    this.#ensure();
    if (accepting === this.#accepting) return;
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
    this.#pending = Promise.resolve().then(() => this.#surfaceFactory(host)).then((surface) => {
      if (this.#disposed) {
        surface.dispose();
        return;
      }
      this.#surface = surface;
      this.#unsubscribe = surface.onData((data) => this.#receive(data));
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
    this.#emit(`${PROMPT}${this.#buffer}`, "input", true);
  }
  #receive(data) {
    if (!this.#accepting) return;
    data = data.replaceAll("\x1B[200~", "").replaceAll("\x1B[201~", "");
    if (data.startsWith("\x1B")) return;
    for (const char of data) {
      if (char === "\r") {
        this.#submit();
        return;
      }
      if (char === "\x7F") this.#buffer = [...this.#buffer].slice(0, -1).join("");
      else if (char >= " ") this.#buffer += char;
      else continue;
      this.#repaint();
    }
  }
  #submit() {
    const line = this.#buffer;
    this.#buffer = "";
    this.#accepting = false;
    this.#surface?.setActive(false);
    this.#emit("\n");
    this.submission.set({ line });
  }
  #syncEmpty() {
    if (this.#host !== null) this.#host.hidden = !this.#hasActivity;
    if (this.#empty !== null) this.#empty.hidden = this.#hasActivity;
  }
};
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
var defaultSurface = async (host) => {
  const [{ Terminal: Terminal2 }, { FitAddon }, { default: xtermCss }] = await Promise.all([
    import("./libs/xterm.js"),
    import("./libs/xterm.js"),
    Promise.resolve().then(() => __toESM(require_xterm()))
  ]);
  ensureStyle(xtermCss);
  const term = new Terminal2({
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
    setActive(active) {
      term.write(active ? "\x1B[?25h" : "\x1B[?25l");
    },
    focus() {
      term.focus();
    },
    blur() {
      term.blur();
    },
    clear() {
      term.write("\x1B[2J\x1B[H");
    },
    reset() {
      term.reset();
    },
    dispose() {
      themeObserver?.disconnect();
      resizeObserver?.disconnect();
      colorScheme?.removeEventListener?.("change", applyTheme);
      cancelAnimationFrame(frame2);
      term.dispose();
    }
  };
};

// src/libs/terminal/index.ts
var Terminal = class {
  #core;
  constructor(options = {}) {
    this.#core = new TerminalCore(options);
  }
  /**
   * 最近提交的一行，初始为 null；每次提交同步产生新快照，包括相同内容和空行。
   * 草稿不对外暴露。render(null) 清除此状态；普通 render 不产生提交。
   * 消费者按快照身份识别新提交，不因其他状态变化重复处理同一行。
   */
  get submission() {
    return this.#core.submission;
  }
  get element() {
    return this.#core.element;
  }
  /**
   * 原子更新输出和输入许可。相同内容幂等，不重新开放已提交的输入。
   * 输出前缀增长时追加差量并保留输入回显；否则以新输出替换屏幕记录。
   * 未提交的输入保留，input=false 时冻结；null 清空所有记录与输入，恢复空态。
   */
  render(view) {
    this.#core.render(view);
  }
  dispose() {
    this.#core.dispose();
  }
};

// src/libs/playground/impl.ts
function useProgramImpl(request, onEdit, debuggerOptions) {
  const [view, setView] = useState2(null);
  const edit = useRef2(onEdit);
  const initialSource = useMemo(() => request.getSnapshot().source, [request]);
  useEffect2(() => {
    edit.current = onEdit;
  }, [onEdit]);
  useEffect2(() => {
    void warmupProgram();
    const draft = createDraftBackend(typeof window === "undefined" ? void 0 : window);
    const saved = draft?.load() ?? null;
    const editor = new Editor(saved === null ? request.getSnapshot().source : `${saved}
`);
    if (saved !== null && saved !== request.getSnapshot().source) edit.current(saved);
    const resetEditor = () => {
      editor.replace(initialSource);
      draft?.clear();
    };
    const controller = createExecution(request);
    const terminal = new Terminal();
    const debuggerView = new Debugger(debuggerOptions);
    const state2 = wireImpl({
      execution: controller.execution,
      position: debuggerView.position,
      submission: terminal.submission
    });
    let terminalView = null;
    const showTerminal = (next) => {
      terminalView = next;
      terminal.render(next);
    };
    const run = () => {
      showTerminal(null);
      controller.run();
    };
    const publish = () => setView({ editor, terminal, debugger: debuggerView, ...state2.getSnapshot(), run, resetEditor });
    const renderPosition = () => {
      const { execution, position: next } = state2.getSnapshot();
      if (next === null || execution.status !== "ready") {
        editor.clearLine();
      } else {
        const stdin = execution.request.options?.stdin;
        const interactive = typeof stdin === "object" && (execution.result.waiting !== null || stdin.value !== "");
        const output = interactive ? execution.result.trace.finalState : next.state;
        showTerminal({ stdout: output.stdout ?? "", stderr: output.stderr ?? "", input: execution.result.waiting !== null });
        const error2 = execution.result.error;
        if (next.atEnd && error2?.line != null) editor.showLine(error2.line, "error", false);
        else if (next.state.line !== null) editor.showLine(next.state.line, "execution", false);
        else editor.clearLine();
      }
    };
    const render = () => {
      const execution = controller.execution.getSnapshot();
      if (execution.status === "ready") {
        const { result: result2, request: request2 } = execution;
        debuggerView.render(result2.trace, execution.analysis.controlFlow);
        if (typeof request2.options?.stdin === "object") {
          showTerminal({
            stdout: result2.trace.finalState.stdout ?? "",
            stderr: result2.trace.finalState.stderr ?? "",
            input: result2.waiting !== null
          });
        }
      } else {
        debuggerView.render(null, null);
        if (terminalView !== null) showTerminal({ ...terminalView, input: false });
        if (execution.status === "idle") showTerminal(null);
        if (execution.status === "failed") showTerminal({ stdout: "", stderr: String(execution.error), input: false });
      }
    };
    const stopExecution = controller.execution.subscribe(render);
    const stopPosition = debuggerView.position.subscribe(renderPosition);
    const stopSubmission = terminal.submission.subscribe(() => {
      const submission = terminal.submission.getSnapshot();
      if (submission !== null) controller.feed(submission.line);
    });
    const stopState = state2.subscribe(publish);
    const stopEdit = editor.source.subscribe(() => {
      edit.current(editor.text);
      draft?.save(editor.text);
    });
    const stopSource = request.subscribe(() => {
      const source = request.getSnapshot().source;
      if (editor.text !== source) editor.replace(source);
    });
    render();
    publish();
    return () => {
      stopState();
      stopSubmission();
      stopPosition();
      stopExecution();
      stopEdit();
      stopSource();
      controller.dispose();
      debuggerView.dispose();
      terminal.dispose();
      editor.dispose();
    };
  }, [request, initialSource]);
  return view;
}

// src/libs/playground/index.ts
function wire(states) {
  return wireImpl(states);
}
function useProgram(request, onEdit, debuggerOptions) {
  return useProgramImpl(request, onEdit, debuggerOptions);
}
export {
  Debugger,
  Editor,
  HostChromeProvider,
  PlaygroundShell,
  Terminal,
  TopBar,
  Trace,
  Widget,
  analyzeProgram,
  appendedStdin,
  asset,
  bareChrome,
  createState,
  derive,
  linkProgram,
  runProgram,
  useProgram,
  useValue,
  warmupProgram,
  webChrome,
  wire
};
