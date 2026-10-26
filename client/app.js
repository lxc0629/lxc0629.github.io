// apps/client/app/main.tsx
import { createElement as createElement2 } from "/libs/react.js";
import { createRoot as createRoot2 } from "/libs/react.js";
import { EventBus as EventBus2 } from "/pico.js";

// apps/client/api/playgrounds.ts
import { on, stateful } from "/pico.js";

// apps/client/impl/playground/catalog.ts
import { createState } from "/pico.js";

// apps/client/impl/replica/values.ts
function nonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) throw new TypeError(`${label} must be non-empty`);
  return value;
}
function samePosition(left, right) {
  return left === right || left !== null && right !== null && left.logId === right.logId && left.recordId === right.recordId;
}
function copyPosition(value) {
  return value === null ? null : Object.freeze({ logId: value.logId, recordId: value.recordId });
}
function positionOf(record) {
  return Object.freeze({ logId: record.logId, recordId: record.id });
}
function positionKey(position) {
  return `${position.logId}\0${position.recordId}`;
}
function decodePosition(value, label = "position", logId) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  const input = value;
  const decoded = Object.freeze({
    logId: nonEmptyString(input["logId"], `${label}.logId`),
    recordId: nonEmptyString(input["recordId"], `${label}.recordId`)
  });
  if (logId !== void 0 && decoded.logId !== logId) throw new TypeError(`${label} belongs to another Log`);
  return decoded;
}
function decodeNullablePosition(value, label = "position", logId) {
  return value === null ? null : decodePosition(value, label, logId);
}
function asValue(value) {
  return value;
}
function decodeValue(value, seen = /* @__PURE__ */ new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "object" || seen.has(value)) throw new TypeError("data must be a finite JSON value");
  seen.add(value);
  try {
    if (Array.isArray(value)) return Object.freeze(value.map((item) => decodeValue(item, seen)));
    if (Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError("data must be a finite JSON value");
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key2, item]) => [key2, decodeValue(item, seen)])
    ));
  } finally {
    seen.delete(value);
  }
}
function decodeRecord(value, expectedLogId) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("record must be an object");
  }
  const input = value;
  const logId = nonEmptyString(input["logId"], "record.logId");
  if (expectedLogId !== void 0 && logId !== expectedLogId) throw new TypeError("record belongs to another Log");
  if (!Array.isArray(input["requires"])) throw new TypeError("record.requires must be an array");
  const requires = input["requires"].map((item, index) => decodePosition(item, `record.requires[${index}]`));
  if (requires.some((required) => required.logId === logId)) {
    throw new TypeError("same-Log causality must use parent");
  }
  return Object.freeze({
    id: nonEmptyString(input["id"], "record.id"),
    logId,
    parent: decodeNullablePosition(input["parent"], "record.parent", logId),
    requires: Object.freeze(requires),
    data: decodeValue(input["data"])
  });
}
function sameValue(left, right) {
  if (Object.is(left, right)) return true;
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object") return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => sameValue(item, right[index]));
  }
  const leftObject = left;
  const rightObject = right;
  const leftKeys = Object.keys(leftObject);
  const rightKeys = Object.keys(rightObject);
  return leftKeys.length === rightKeys.length && leftKeys.every((key2) => Object.hasOwn(rightObject, key2) && sameValue(leftObject[key2], rightObject[key2]));
}
function sameRecord(left, right) {
  return left.id === right.id && left.logId === right.logId && samePosition(left.parent, right.parent) && left.requires.length === right.requires.length && left.requires.every((item, index) => samePosition(item, right.requires[index])) && sameValue(left.data, right.data);
}
function decodePage(value, logId) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new TypeError("page must be an object");
  const input = value;
  if (!Array.isArray(input["records"]) || typeof input["hasMore"] !== "boolean") {
    throw new TypeError("page shape is invalid");
  }
  return Object.freeze({
    records: Object.freeze(input["records"].map((item) => decodeRecord(item, logId))),
    head: decodeNullablePosition(input["head"], "page.head", logId),
    hasMore: input["hasMore"]
  });
}
function decodeAppendResult(value, logId) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("append result must be an object");
  }
  const input = value;
  if (input["kind"] !== "accepted" && input["kind"] !== "current" && input["kind"] !== "changed") {
    throw new TypeError("append result kind is invalid");
  }
  return Object.freeze({
    kind: input["kind"],
    head: decodeNullablePosition(input["head"], "append result head", logId)
  });
}

// apps/client/impl/refresh.ts
function createRefresh(read) {
  let tail = Promise.resolve();
  let queued = null;
  let disposed = false;
  const refresh2 = () => {
    if (disposed) return Promise.resolve();
    if (queued !== null) return queued;
    const next = tail.catch(() => void 0).then(async () => {
      queued = null;
      if (!disposed) await read();
    });
    queued = next;
    tail = next;
    return next;
  };
  return { refresh: refresh2, dispose: () => {
    disposed = true;
  } };
}

// apps/client/impl/playground/catalog.ts
var sessions = /* @__PURE__ */ new WeakMap();
var EMPTY = Object.freeze([]);
function releaseOf(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("release data must be an object");
  }
  const data = value;
  if (data["type"] !== "playground.released") throw new TypeError("release type is invalid");
  const title = data["title"];
  if (title !== void 0 && (typeof title !== "string" || title.length === 0)) {
    throw new TypeError("release title is invalid");
  }
  return Object.freeze({
    playgroundId: nonEmptyString(data["playgroundId"], "playgroundId"),
    versionId: nonEmptyString(data["versionId"], "versionId"),
    mediaType: nonEmptyString(data["mediaType"], "mediaType"),
    ...title === void 0 ? {} : { title }
  });
}
async function project(local) {
  const current = /* @__PURE__ */ new Map();
  let after = null;
  for (; ; ) {
    const page = await local.read(PLAYGROUND_RELEASES_LOG_ID, after, 128);
    for (const record of page.records) {
      const release = releaseOf(record.data);
      current.set(release.playgroundId, release);
    }
    if (!page.hasMore) break;
    const last = page.records.at(-1);
    if (last === void 0) throw new TypeError("release Log returned an empty continuation page");
    after = Object.freeze({ logId: last.logId, recordId: last.id });
  }
  return Object.freeze([...current.values()].sort((left, right) => left.playgroundId < right.playgroundId ? -1 : left.playgroundId > right.playgroundId ? 1 : 0));
}
function createPlaygroundCatalog(options, lifecycle) {
  const state = createState(Object.freeze({ status: "loading", releases: EMPTY }));
  let disposed = false;
  const refresh2 = createRefresh(async () => {
    try {
      const releases = await project(options.local);
      if (!disposed) state.set(Object.freeze({ status: "ready", releases }));
    } catch (cause) {
      if (disposed) return;
      state.set(Object.freeze({
        status: "failed",
        releases: state.getSnapshot().releases,
        message: cause instanceof Error ? cause.message : String(cause)
      }));
      throw cause;
    }
  });
  const ready = refresh2.refresh();
  const catalog = Object.freeze({
    getSnapshot: state.getSnapshot,
    subscribe: state.subscribe,
    ready
  });
  sessions.set(catalog, refresh2);
  lifecycle.onDispose(() => {
    disposed = true;
    refresh2.dispose();
  });
  return catalog;
}
function receivePlaygroundReleases(state, event4) {
  if (event4.logId !== PLAYGROUND_RELEASES_LOG_ID) return;
  void sessions.get(state).refresh().catch(() => void 0);
}

// apps/client/impl/http.ts
var HttpBodyTooLarge = class extends Error {
};
var HttpInvalidJson = class extends Error {
};
function httpOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:" || url.username !== "" || url.password !== "" || url.search !== "" || url.hash !== "" || url.pathname !== "/" && url.pathname !== "") {
    throw new TypeError("baseUrl must be an HTTP origin");
  }
  return url.origin;
}
async function readBoundedBytes(response, maximum) {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maximum) throw new HttpBodyTooLarge();
  if (response.body === null) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel().catch(() => void 0);
        throw new HttpBodyTooLarge();
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
  return bytes;
}
async function readBoundedJson(response, maximum) {
  const bytes = await readBoundedBytes(response, maximum);
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (cause) {
    throw new HttpInvalidJson("Response is not valid JSON", { cause });
  }
}

// apps/client/impl/playground/http-packages.ts
var DEFAULT_MAX_PACKAGE_BYTES = 10 * 1024 * 1024;
async function bytesOf(response, maximum) {
  try {
    return await readBoundedBytes(response, maximum);
  } catch (cause) {
    if (cause instanceof HttpBodyTooLarge) throw new Error("Playground package is too large");
    throw cause;
  }
}
async function verifyVersion(bytes, versionId) {
  if (!versionId.startsWith("sha256:")) return;
  const expected = versionId.slice(7);
  if (!/^[0-9a-f]{64}$/.test(expected)) throw new Error("Playground package Version is invalid");
  if (globalThis.crypto?.subtle === void 0) {
    throw new Error("This host cannot verify Playground package versions");
  }
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest(
    "SHA-256",
    Uint8Array.from(bytes).buffer
  ));
  const actual = [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (actual !== expected) throw new Error("Playground package does not match its Version");
}
function createHttpPlaygroundPackages(options) {
  const origin = httpOrigin(options.baseUrl);
  if (typeof options.fetch !== "function") throw new TypeError("fetch must be a function");
  const maximum = options.maxPackageBytes ?? DEFAULT_MAX_PACKAGE_BYTES;
  if (!Number.isInteger(maximum) || maximum < 1) throw new TypeError("maxPackageBytes must be a positive integer");
  const headers = Object.freeze({ ...options.headers });
  return Object.freeze({
    read: async (release) => {
      const path = [release.playgroundId, "versions", release.versionId, "package"].map(encodeURIComponent).join("/");
      const response = await options.fetch(`${origin}/api/v1/playgrounds/${path}`, { headers });
      if (!response.ok) throw new Error(`Playground package request failed with HTTP ${response.status}`);
      const mediaType = response.headers.get("content-type")?.split(";", 1)[0]?.trim();
      if (mediaType !== release.mediaType) throw new Error("Playground package media type does not match its release");
      const bytes = await bytesOf(response, maximum);
      await verifyVersion(bytes, release.versionId);
      return Object.freeze({ mediaType, bytes });
    }
  });
}

// apps/client/api/playgrounds.ts
var PLAYGROUND_RELEASES_LOG_ID = "playground-releases";
var playgroundCatalog = stateful(
  "playgrounds",
  createPlaygroundCatalog,
  [on("remote.received", receivePlaygroundReleases, [])]
);

// apps/client/impl/client/create-client.ts
import { remote } from "/pico.js";
import { EventBus } from "/pico.js";

// apps/client/impl/submission/writer.ts
import { event, on as on2, stateful as stateful2 } from "/pico.js";

// apps/client/impl/log-id.ts
function encodeLogComponent(value, label) {
  return encodeURIComponent(nonEmptyString(value, label));
}

// apps/client/impl/submission/writer.ts
function submissionRequestLogId(principalId, replicaId) {
  return `principal/${encodeLogComponent(principalId, "principalId")}/submission/${encodeLogComponent(replicaId, "replicaId")}/requests`;
}
function submissionResultLogId(principalId, replicaId) {
  return `principal/${encodeLogComponent(principalId, "principalId")}/submission/${encodeLogComponent(replicaId, "replicaId")}/results`;
}
function isSubmissionResultLogFor(principalId, logId) {
  const parts = logId.split("/");
  return parts.length === 5 && parts[0] === "principal" && parts[1] === encodeLogComponent(principalId, "principalId") && parts[2] === "submission" && parts[3].length > 0 && parts[4] === "results";
}
var requestLogs = /* @__PURE__ */ new WeakMap();
function createSubmissionWriter(options, _lifecycle) {
  const state = Object.freeze({});
  requestLogs.set(state, submissionRequestLogId(options.principalId, options.replicaId));
  return state;
}
function requestSubmission(state, input, context) {
  const request3 = Object.freeze({
    type: "submission.requested",
    submissionId: nonEmptyString(input.submissionId, "submissionId"),
    playgroundId: nonEmptyString(input.playgroundId, "playgroundId"),
    revision: Object.freeze({ ...input.revision })
  });
  context.emit({
    type: "client.append",
    requestId: input.requestId,
    logId: requestLogs.get(state),
    requires: [request3.revision],
    data: asValue(request3)
  });
}
var submissionWriter = stateful2(
  "submission-writer",
  createSubmissionWriter,
  [
    on2("submission.request", requestSubmission, ["client.append"]),
    event("submission.request", {})
  ]
);

// apps/client/impl/submission/history.ts
import { createState as createState2 } from "/pico.js";
var EMPTY2 = Object.freeze([]);
function createSubmissionHistory(source) {
  const state = createState2(Object.freeze({ status: "loading", submissions: EMPTY2 }));
  let disposed = false;
  const refresh2 = createRefresh(async () => {
    try {
      const submissions = Object.freeze([...await source.read()]);
      if (!disposed) state.set(Object.freeze({ status: "ready", submissions }));
    } catch (cause) {
      if (disposed) return;
      state.set(Object.freeze({
        status: "failed",
        submissions: state.getSnapshot().submissions,
        message: cause instanceof Error ? cause.message : String(cause)
      }));
      throw cause;
    }
  });
  const ready = refresh2.refresh();
  return Object.freeze({
    getSnapshot: state.getSnapshot,
    subscribe: state.subscribe,
    ready,
    refresh: refresh2.refresh,
    dispose: () => {
      disposed = true;
      refresh2.dispose();
    }
  });
}

// apps/client/impl/client/draft-attachments.ts
import { createState as createState4 } from "/pico.js";

// apps/client/impl/draft/protocol.ts
function integer(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`${label} must be a non-negative integer`);
  return value;
}
function draftPrefix(principalId, draftId) {
  return `principal/${encodeLogComponent(principalId, "principalId")}/draft/${encodeLogComponent(draftId, "draftId")}`;
}
function revisionLogId(principalId, draftId, replicaId) {
  return `${revisionLogPrefix(principalId, draftId)}${encodeLogComponent(replicaId, "replicaId")}`;
}
function revisionLogPrefix(principalId, draftId) {
  return `${draftPrefix(principalId, draftId)}/revision/`;
}
function requestLogId(principalId, draftId, replicaId) {
  return `${draftPrefix(principalId, draftId)}/request/${encodeLogComponent(replicaId, "replicaId")}`;
}
function decisionLogId(principalId, draftId) {
  return `${draftPrefix(principalId, draftId)}/decision`;
}
function revisionScope(logId) {
  const parts = logId.split("/");
  if (parts.length !== 6 || parts[0] !== "principal" || parts[2] !== "draft" || parts[4] !== "revision") {
    throw new TypeError("record is not stored in a Revision Log");
  }
  try {
    return Object.freeze({
      principalId: nonEmptyString(decodeURIComponent(parts[1]), "principalId"),
      draftId: nonEmptyString(decodeURIComponent(parts[3]), "draftId"),
      replicaId: nonEmptyString(decodeURIComponent(parts[5]), "replicaId")
    });
  } catch (error) {
    if (error instanceof URIError) throw new TypeError("Revision Log contains invalid encoding");
    throw error;
  }
}
function decodeRevision(record) {
  if (typeof record.data !== "object" || record.data === null || Array.isArray(record.data)) {
    throw new TypeError("revision data must be an object");
  }
  const data = record.data;
  if (data["type"] !== "draft.revised") throw new TypeError("record is not a Draft Revision");
  const draftId = nonEmptyString(data["draftId"], "revision.draftId");
  const replicaId = nonEmptyString(data["replicaId"], "revision.replicaId");
  const scope = revisionScope(record.logId);
  if (scope.draftId !== draftId || scope.replicaId !== replicaId || record.logId !== revisionLogId(scope.principalId, draftId, replicaId)) {
    throw new TypeError("revision is stored in the wrong Log");
  }
  if (typeof data["source"] !== "string") throw new TypeError("revision.source must be a string");
  const base = data["base"] === null ? null : decodePosition(data["base"], "revision.base");
  let merged;
  if (data["merged"] !== void 0) {
    if (!Array.isArray(data["merged"])) throw new TypeError("revision.merged must be an array");
    merged = Object.freeze(data["merged"].map((item, index) => decodePosition(item, `revision.merged[${index}]`)));
  }
  return Object.freeze({
    type: "draft.revised",
    draftId,
    replicaId,
    source: data["source"],
    base,
    ...merged === void 0 ? {} : { merged }
  });
}
function commandPositions(command) {
  return command.type === "draft.beginEditing" ? [command.expectedHead] : [command.expectedHead, command.targetHead];
}
function decodeDecision(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new TypeError("decision must be an object");
  const data = value;
  const draftId = nonEmptyString(data["draftId"], "decision.draftId");
  if (data["type"] === "draft.started") return Object.freeze({
    type: data["type"],
    draftId,
    head: decodePosition(data["head"], "decision.head")
  });
  const common = {
    draftId,
    commandId: nonEmptyString(data["commandId"], "decision.commandId"),
    request: decodePosition(data["request"], "decision.request")
  };
  if (data["type"] === "draft.editingStarted") return Object.freeze({
    type: data["type"],
    ...common,
    writer: nonEmptyString(data["writer"], "decision.writer"),
    epoch: integer(data["epoch"], "decision.epoch")
  });
  if (data["type"] === "draft.takenOver" || data["type"] === "draft.advanced") return Object.freeze({
    type: data["type"],
    ...common,
    head: decodePosition(data["head"], "decision.head"),
    writer: nonEmptyString(data["writer"], "decision.writer"),
    epoch: integer(data["epoch"], "decision.epoch")
  });
  if (data["type"] === "draft.rejected") return Object.freeze({
    type: data["type"],
    ...common,
    reason: nonEmptyString(data["reason"], "decision.reason"),
    head: decodePosition(data["head"], "decision.head"),
    writer: data["writer"] === null ? null : nonEmptyString(data["writer"], "decision.writer"),
    epoch: integer(data["epoch"], "decision.epoch")
  });
  throw new TypeError("decision type is invalid");
}
function copyRef(ref) {
  return Object.freeze({ head: Object.freeze({ ...ref.head }), writer: ref.writer, epoch: ref.epoch });
}
function projectDraftLog(records2) {
  if (records2.length === 0) throw new TypeError("decision Log is empty");
  const started = decodeDecision(records2[0].data);
  if (started.type !== "draft.started") throw new TypeError("decision Log must start with draft.started");
  const firstParts = records2[0].logId.split("/");
  if (firstParts.length !== 5 || firstParts[0] !== "principal" || firstParts[2] !== "draft" || firstParts[4] !== "decision") throw new TypeError("decision is stored in the wrong Log");
  let principalId;
  try {
    principalId = nonEmptyString(decodeURIComponent(firstParts[1]), "principalId");
  } catch (error) {
    if (error instanceof URIError) throw new TypeError("Decision Log contains invalid encoding");
    throw error;
  }
  const logId = decisionLogId(principalId, started.draftId);
  let parent = null;
  let ref = Object.freeze({ head: started.head, writer: null, epoch: 0 });
  const commands = /* @__PURE__ */ new Map();
  for (const [index, record] of records2.entries()) {
    if (record.logId !== logId || !samePosition(record.parent, parent)) throw new TypeError("decision Log chain is invalid");
    if (record.requires.length !== 0) throw new TypeError("decision records must not depend on replica-owned Logs");
    const decision = index === 0 ? started : decodeDecision(record.data);
    if (decision.draftId !== started.draftId) throw new TypeError("decision belongs to another Draft");
    if (index > 0) {
      if (decision.type === "draft.started") throw new TypeError("draft.started can only be the first decision");
      if (commands.has(decision.commandId)) throw new TypeError("commandId appears more than once");
      if (decision.type === "draft.rejected") {
        if (!samePosition(decision.head, ref.head) || decision.writer !== ref.writer || decision.epoch !== ref.epoch) {
          throw new TypeError("rejection does not describe the current DraftRef");
        }
      } else if (decision.type === "draft.editingStarted") {
        if (ref.writer !== null || decision.epoch !== ref.epoch + 1) throw new TypeError("editing transition is invalid");
        ref = Object.freeze({ head: ref.head, writer: decision.writer, epoch: decision.epoch });
      } else if (decision.type === "draft.takenOver") {
        if (decision.epoch !== ref.epoch + 1) throw new TypeError("takeover epoch is invalid");
        ref = Object.freeze({ head: decision.head, writer: decision.writer, epoch: decision.epoch });
      } else {
        if (decision.writer !== ref.writer || decision.epoch !== ref.epoch) throw new TypeError("advance fence is invalid");
        ref = Object.freeze({ head: decision.head, writer: ref.writer, epoch: ref.epoch });
      }
      commands.set(decision.commandId, Object.freeze({
        request: decision.request,
        decision: positionOf(record),
        ref: copyRef(ref),
        outcome: decision.type === "draft.rejected" ? "rejected" : "accepted",
        ...decision.type === "draft.rejected" ? { reason: decision.reason } : {}
      }));
    }
    parent = positionOf(record);
  }
  return Object.freeze({ ref: copyRef(ref), commands, logHead: parent });
}

// apps/client/impl/draft/state.ts
var draftSessions = /* @__PURE__ */ new WeakMap();

// apps/client/impl/draft/actions.ts
function emit(context, output) {
  try {
    context.emit(output);
  } catch (error) {
    queueMicrotask(() => {
      throw error;
    });
  }
}
function positions(values, ownLog) {
  const seen = /* @__PURE__ */ new Set();
  return Object.freeze(values.filter((value) => {
    if (value.logId === ownLog) return false;
    const key2 = `${value.logId}\0${value.recordId}`;
    if (seen.has(key2)) return false;
    seen.add(key2);
    return true;
  }).map((value) => Object.freeze({ ...value })));
}
function appendCommand(session2, command, context, requestId = command.commandId) {
  if (command.draftId !== session2.draftId) return;
  emit(context, {
    type: "client.append",
    requestId,
    logId: session2.requestLog,
    requires: positions(commandPositions(command), session2.requestLog),
    data: asValue(command)
  });
}
function failedForSession(session2, requestId, message4, context) {
  emit(context, { type: "draft.actionFailed", draftId: session2.draftId, requestId, message: message4 });
}
function saveDraft(state, input, context) {
  const session2 = draftSessions.get(state);
  if (input.draftId !== session2.draftId) return;
  const base = input.base === void 0 ? session2.editingBase : input.base;
  const revision = Object.freeze({
    type: "draft.revised",
    draftId: session2.draftId,
    replicaId: session2.replicaId,
    source: input.source,
    base,
    ...input.merged === void 0 ? {} : { merged: Object.freeze(input.merged.map((position) => Object.freeze({ ...position }))) }
  });
  context.emit({
    type: "client.append",
    requestId: input.requestId,
    logId: session2.revisionLog,
    requires: positions([...base === null ? [] : [base], ...input.merged ?? []], session2.revisionLog),
    data: asValue(revision)
  });
}
function editingBaseOf(state) {
  const session2 = draftSessions.get(state);
  return session2.editingBase ?? session2.current?.localRevision?.position ?? null;
}
function settled(state) {
  return draftSessions.get(state).pending.catch(() => void 0);
}
function setEditingBase(state, input) {
  const session2 = draftSessions.get(state);
  if (input.draftId !== session2.draftId) return;
  const current = session2.current;
  session2.editingBase = input.origin === "package" ? null : input.origin === "local" ? current?.localRevision?.position ?? null : current?.canonical.position ?? null;
}
function requestCommand(state, requestId, command, context) {
  appendCommand(draftSessions.get(state), command, context, requestId);
}
function beginEditing(state, input, context) {
  const session2 = draftSessions.get(state);
  requestCommand(state, input.commandId, Object.freeze({ ...input, type: "draft.beginEditing", replicaId: session2.replicaId }), context);
}
function takeoverDraft(state, input, context) {
  const session2 = draftSessions.get(state);
  const local = session2.current?.localRevision;
  if (local === null || local === void 0 || !samePosition(local.position, input.targetHead)) {
    failedForSession(session2, input.commandId, "Takeover must target this device's latest Revision", context);
    return;
  }
  queueTakeover(session2, input.commandId, local.position, context);
}
function advanceDraft(state, input, context) {
  const session2 = draftSessions.get(state);
  const current = session2.current;
  if (current?.relation !== "ahead" || current.localRevision === null || !samePosition(current.localRevision.position, input.targetHead) || !samePosition(current.canonical.position, input.expectedHead) || current.projection.ref.epoch !== input.expectedEpoch || current.projection.ref.writer !== session2.replicaId || !samePosition(current.localRevision.base, input.expectedHead)) {
    failedForSession(session2, input.commandId, "Revision cannot advance from the current canonical head", context);
    return;
  }
  requestCommand(state, input.commandId, Object.freeze({ ...input, type: "draft.advance", replicaId: session2.replicaId }), context);
}
function useSharedDraft(state, input, context) {
  const session2 = draftSessions.get(state);
  if (input.draftId !== session2.draftId || session2.current === void 0) {
    failedForSession(session2, "use-shared", "The shared Revision is not available yet", context);
    return;
  }
  const { canonical } = session2.current;
  session2.followedShared = canonical.position;
  emit(context, {
    type: "draft.shared",
    draftId: session2.draftId,
    position: canonical.position,
    source: canonical.source
  });
}
function queueTakeover(session2, commandId, target, context) {
  const current = session2.current;
  const canTakeOver = current?.relation === "diverged" || current?.relation === "ahead" && current.projection.ref.writer !== session2.replicaId;
  if (current === void 0 || !canTakeOver || current.localRevision === null) {
    failedForSession(session2, commandId, "This device has no Revision that requires takeover", context);
    return;
  }
  const command = Object.freeze({
    type: "draft.takeover",
    commandId,
    draftId: session2.draftId,
    replicaId: session2.replicaId,
    expectedHead: current.canonical.position,
    expectedEpoch: current.projection.ref.epoch,
    targetHead: target
  });
  const key2 = positionKey(target);
  const queued = session2.pendingTakeovers.get(key2) ?? [];
  queued.push({ target, command });
  session2.pendingTakeovers.set(key2, queued);
  emit(context, { type: "remote.sync", logId: target.logId });
}
function continueHere(state, input, context) {
  const session2 = draftSessions.get(state);
  if (input.draftId !== session2.draftId || input.commandId.length === 0) return;
  const local = session2.current?.localRevision;
  if (local === null || local === void 0) {
    failedForSession(session2, input.commandId, "This device has no saved Revision to continue from", context);
    return;
  }
  queueTakeover(session2, input.commandId, local.position, context);
}
function mergeDraft(state, input, context) {
  const session2 = draftSessions.get(state);
  const current = session2.current;
  if (input.draftId !== session2.draftId || input.requestId.length === 0 || input.commandId.length === 0) return;
  if (current?.relation !== "diverged" || current.localRevision === null || current.commonBase === null) {
    failedForSession(session2, input.commandId, "A shared base is not available for a three-way merge", context);
    return;
  }
  session2.pendingMerges.set(input.requestId, {
    commandId: input.commandId,
    expectedHead: current.canonical.position,
    expectedEpoch: current.projection.ref.epoch
  });
  const revision = Object.freeze({
    type: "draft.revised",
    draftId: session2.draftId,
    replicaId: session2.replicaId,
    source: input.source,
    base: current.commonBase,
    merged: Object.freeze([current.localRevision.position, current.canonical.position])
  });
  emit(context, {
    type: "client.append",
    requestId: input.requestId,
    logId: session2.revisionLog,
    requires: positions([current.commonBase, current.localRevision.position, current.canonical.position], session2.revisionLog),
    data: asValue(revision)
  });
}

// apps/client/impl/draft/coordinator.ts
import { createState as createState3, event as event2, on as on3, stateful as stateful3 } from "/pico.js";

// apps/client/impl/draft/history.ts
function key(value) {
  return `${value.logId}\0${value.recordId}`;
}
function same(left, right) {
  return left === right || left !== null && right !== null && left.logId === right.logId && left.recordId === right.recordId;
}
function projectDraftHistory(localHead, canonicalHead, nodes) {
  const byPosition = new Map(nodes.map((node) => [key(node.position), node]));
  const ancestors = (head) => {
    const found = /* @__PURE__ */ new Map();
    const queue = [head];
    const queued = /* @__PURE__ */ new Set([key(head)]);
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      const currentKey = key(current);
      found.set(currentKey, current);
      const node = byPosition.get(currentKey);
      if (node === void 0) return null;
      for (const parent of node.parents) {
        const parentKey = key(parent);
        if (queued.has(parentKey)) continue;
        queued.add(parentKey);
        queue.push(parent);
      }
    }
    return found;
  };
  if (localHead === null) return Object.freeze({ relation: "behind", commonBase: null });
  if (same(localHead, canonicalHead)) return Object.freeze({ relation: "same", commonBase: localHead });
  const local = ancestors(localHead);
  const canonical = ancestors(canonicalHead);
  if (local === null || canonical === null) return Object.freeze({ relation: "unknown", commonBase: null });
  if (local.has(key(canonicalHead))) return Object.freeze({ relation: "ahead", commonBase: canonicalHead });
  if (canonical.has(key(localHead))) return Object.freeze({ relation: "behind", commonBase: localHead });
  const common = [...local.values()].filter((position) => canonical.has(key(position)));
  const maximal = common.filter((candidate) => !common.some((other) => {
    if (same(candidate, other)) return false;
    return ancestors(other)?.has(key(candidate)) ?? false;
  }));
  return Object.freeze({ relation: "diverged", commonBase: maximal.length === 1 ? maximal[0] : null });
}

// apps/client/impl/draft/inspection.ts
var PAGE_SIZE = 128;
async function recordsOf(local, logId) {
  const records2 = [];
  let after = null;
  for (; ; ) {
    const page = await local.read(logId, after, PAGE_SIZE);
    records2.push(...page.records);
    if (!page.hasMore) return records2;
    const last = page.records.at(-1);
    if (last === void 0) throw new Error(`${logId} returned an empty continuation page`);
    after = positionOf(last);
  }
}
function logReader(local) {
  const loaded = /* @__PURE__ */ new Map();
  return (logId) => {
    const cached = loaded.get(logId);
    if (cached !== void 0) return cached;
    const loading = recordsOf(local, logId);
    loaded.set(logId, loading);
    return loading;
  };
}
async function recordAt(read, expected) {
  return (await read(expected.logId)).find((record) => record.id === expected.recordId) ?? null;
}
function directLocalAdvance(localHead, canonical, records2, revisionLog) {
  let cursor = localHead;
  const seen = /* @__PURE__ */ new Set();
  while (cursor !== null && !samePosition(cursor, canonical)) {
    const key2 = positionKey(cursor);
    if (seen.has(key2)) return null;
    seen.add(key2);
    const record = records2.get(key2);
    if (record === void 0) return null;
    const revision = decodeRevision(record);
    if (cursor.logId === revisionLog && samePosition(revision.base, canonical)) return cursor;
    cursor = revision.base;
  }
  return null;
}
function emit2(context, event4) {
  try {
    context.emit(event4);
  } catch (error) {
    queueMicrotask(() => {
      throw error;
    });
  }
}
async function inspectDraft(session2, context) {
  const read = logReader(session2.local);
  const decisions = await read(session2.decisionLog);
  if (decisions.length === 0) return null;
  const projected = projectDraftLog(decisions);
  const projection = Object.freeze({ ref: projected.ref });
  const canonicalRecord = await recordAt(read, projection.ref.head);
  const localHead = await session2.local.head(session2.revisionLog);
  const localRecord = localHead === null ? null : await recordAt(read, localHead);
  const missing = /* @__PURE__ */ new Map();
  const records2 = /* @__PURE__ */ new Map();
  const nodes = [];
  const pending = [projection.ref.head, ...localHead === null ? [] : [localHead]];
  while (pending.length > 0) {
    const position = pending.pop();
    const key2 = positionKey(position);
    if (records2.has(key2) || missing.has(key2)) continue;
    const record = await recordAt(read, position);
    if (record === null) {
      missing.set(key2, position);
      continue;
    }
    const revision = decodeRevision(record);
    if (revision.draftId !== session2.draftId) throw new TypeError("Revision belongs to another Draft");
    records2.set(key2, record);
    const parents = [...revision.base === null ? [] : [revision.base], ...revision.merged ?? [], ...record.requires];
    nodes.push({ position, parents });
    pending.push(...parents);
  }
  if (canonicalRecord === null) missing.set(positionKey(projection.ref.head), projection.ref.head);
  for (const position of missing.values()) {
    if (position.logId !== session2.revisionLog) {
      emit2(context, { type: "remote.attach", binding: { logId: position.logId, access: "pull" } });
    }
    emit2(context, { type: "remote.sync", logId: position.logId });
  }
  if (canonicalRecord === null) return null;
  const canonical = decodeRevision(canonicalRecord);
  if (canonical.draftId !== session2.draftId) throw new TypeError("canonical Revision belongs to another Draft");
  const local = localRecord === null ? null : decodeRevision(localRecord);
  const history = missing.size > 0 ? { relation: "unknown", commonBase: null } : projectDraftHistory(localHead, projection.ref.head, nodes);
  const commonBaseRecord = history.commonBase === null ? null : await recordAt(read, history.commonBase);
  const commonBaseSource = commonBaseRecord === null ? null : decodeRevision(commonBaseRecord).source;
  return Object.freeze({
    changed: {
      projection,
      relation: history.relation,
      localRevision: local === null || localHead === null ? null : { position: localHead, source: local.source, base: local.base },
      commonBase: history.commonBase,
      canonical: { position: projection.ref.head, source: canonical.source }
    },
    snapshot: Object.freeze({
      status: "ready",
      localSource: local?.source ?? null,
      sharedSource: canonical.source,
      commonBaseSource,
      relation: history.relation,
      writer: projection.ref.writer === null ? "none" : projection.ref.writer === session2.replicaId ? "thisReplica" : "anotherReplica"
    }),
    advanceCandidate: history.relation === "ahead" ? directLocalAdvance(localHead, projection.ref.head, records2, session2.revisionLog) : null,
    rejected: Object.freeze([...projected.commands.entries()].flatMap(([commandId, outcome]) => outcome.outcome === "rejected" && outcome.request.logId === session2.requestLog ? [{ commandId, decision: outcome.decision, reason: outcome.reason }] : []))
  });
}
async function localSnapshot(session2) {
  const records2 = await recordsOf(session2.local, session2.revisionLog);
  const latest = records2.at(-1);
  if (latest === void 0) return Object.freeze({ status: "empty" });
  const revision = decodeRevision(latest);
  if (revision.draftId !== session2.draftId) throw new TypeError("Revision belongs to another Draft");
  return Object.freeze({ status: "local", localSource: revision.source });
}

// apps/client/impl/draft/coordinator.ts
function safeEmit(context, output) {
  try {
    context.emit(output);
  } catch (error) {
    queueMicrotask(() => {
      throw error;
    });
  }
}
async function syncedContains(session2, position) {
  const through = session2.syncedThrough;
  if (through === null || through.logId !== position.logId) return false;
  const records2 = await recordsOf(session2.local, position.logId);
  const targetIndex = records2.findIndex((record) => record.id === position.recordId);
  const throughIndex = records2.findIndex((record) => record.id === through.recordId);
  return targetIndex >= 0 && throughIndex >= targetIndex;
}
async function advanceIfCurrent(session2, inspection, context) {
  const current = inspection.changed;
  const target = inspection.advanceCandidate;
  if (current.relation !== "ahead" || target === null || current.projection.ref.writer !== session2.replicaId || !await syncedContains(session2, target)) return;
  const key2 = positionKey(target);
  if (session2.advancing.has(key2)) return;
  session2.advancing.add(key2);
  const commandId = `advance:${target.recordId}`;
  appendCommand(session2, Object.freeze({
    type: "draft.advance",
    commandId,
    draftId: session2.draftId,
    replicaId: session2.replicaId,
    expectedHead: current.canonical.position,
    expectedEpoch: current.projection.ref.epoch,
    targetHead: target
  }), context);
}
async function requestHasCommand(session2, commandId) {
  const requests = await recordsOf(session2.local, session2.requestLog);
  return requests.some((record) => typeof record.data === "object" && record.data !== null && !Array.isArray(record.data) && record.data["commandId"] === commandId);
}
function emitBeginEditing(session2, target, expected, context) {
  const key2 = `${positionKey(expected.head)}\0${expected.epoch}`;
  if (session2.beginning.has(key2)) return;
  session2.beginning.add(key2);
  appendCommand(session2, Object.freeze({
    type: "draft.beginEditing",
    commandId: `begin:${target.recordId}`,
    draftId: session2.draftId,
    replicaId: session2.replicaId,
    expectedHead: expected.head,
    expectedEpoch: expected.epoch
  }), context);
}
async function beginUninitialized(session2, context) {
  if ((await recordsOf(session2.local, session2.decisionLog)).length > 0) return;
  const revisions = await recordsOf(session2.local, session2.revisionLog);
  const initialRecord = revisions[0];
  if (initialRecord === void 0) return;
  const initial = decodeRevision(initialRecord);
  if (initial.draftId !== session2.draftId || initial.base !== null) return;
  const head = positionOf(initialRecord);
  if (!await syncedContains(session2, head)) return;
  if (await requestHasCommand(session2, `begin:${head.recordId}`)) return;
  emitBeginEditing(session2, head, { head, epoch: 0 }, context);
}
function beginIfNeeded(session2, current, context) {
  const local = current.localRevision;
  if (current.relation !== "ahead" || local === null || current.projection.ref.writer !== null) return;
  emitBeginEditing(session2, local.position, { head: current.canonical.position, epoch: current.projection.ref.epoch }, context);
}
function refresh(state, context) {
  const session2 = draftSessions.get(state);
  const run = async () => {
    if (session2.disposed) return;
    const inspection = await inspectDraft(session2, context);
    if (inspection === null) {
      session2.current = void 0;
      const snapshot = await localSnapshot(session2);
      if (session2.disposed) return;
      draftSessions.get(state).snapshot.set(snapshot);
      await beginUninitialized(session2, context);
      return;
    }
    const current = inspection.changed;
    if (session2.disposed) return;
    session2.current = current;
    draftSessions.get(state).snapshot.set(inspection.snapshot);
    safeEmit(context, {
      type: "draft.changed",
      draftId: session2.draftId,
      ...current
    });
    for (const rejected of inspection.rejected) {
      if (session2.reportedDecisions.has(rejected.decision.recordId)) continue;
      session2.reportedDecisions.add(rejected.decision.recordId);
      failedForSession(session2, rejected.commandId, rejected.reason, context);
    }
    if (current.relation === "behind" && !samePosition(session2.followedShared, current.canonical.position)) {
      session2.followedShared = current.canonical.position;
      safeEmit(context, {
        type: "draft.shared",
        draftId: session2.draftId,
        position: current.canonical.position,
        source: current.canonical.source
      });
    }
    beginIfNeeded(session2, current, context);
    await advanceIfCurrent(session2, inspection, context);
  };
  session2.pending = session2.pending.catch(() => void 0).then(run);
  void session2.pending.catch((error) => queueMicrotask(() => {
    throw error;
  }));
}
function createDraftCoordinator(options, lifecycle) {
  if (options.principalId.length === 0 || options.draftId.length === 0 || options.replicaId.length === 0) {
    throw new TypeError("principalId, draftId and replicaId must be non-empty");
  }
  const state = createState3(Object.freeze({ status: "empty" }));
  draftSessions.set(state, {
    ...options,
    revisionLog: revisionLogId(options.principalId, options.draftId, options.replicaId),
    requestLog: requestLogId(options.principalId, options.draftId, options.replicaId),
    decisionLog: decisionLogId(options.principalId, options.draftId),
    pending: Promise.resolve(),
    disposed: false,
    syncedThrough: null,
    followedShared: null,
    pendingMerges: /* @__PURE__ */ new Map(),
    pendingTakeovers: /* @__PURE__ */ new Map(),
    advancing: /* @__PURE__ */ new Set(),
    beginning: /* @__PURE__ */ new Set(),
    reportedDecisions: /* @__PURE__ */ new Set(),
    editingBase: null,
    snapshot: state
  });
  lifecycle.onDispose(() => {
    draftSessions.get(state).disposed = true;
  });
  return state;
}
function receiveClientAppended(state, input, context) {
  const session2 = draftSessions.get(state);
  if (input.position.logId === session2.revisionLog) {
    session2.editingBase = input.position;
    refresh(state, context);
  }
  const merge = session2.pendingMerges.get(input.requestId);
  if (merge === void 0) return;
  if (input.position.logId !== session2.revisionLog) return;
  session2.pendingMerges.delete(input.requestId);
  const command = Object.freeze({
    type: "draft.takeover",
    commandId: merge.commandId,
    draftId: session2.draftId,
    replicaId: session2.replicaId,
    expectedHead: merge.expectedHead,
    expectedEpoch: merge.expectedEpoch,
    targetHead: input.position
  });
  const key2 = positionKey(input.position);
  const queued = session2.pendingTakeovers.get(key2) ?? [];
  queued.push({ target: input.position, command });
  session2.pendingTakeovers.set(key2, queued);
  safeEmit(context, { type: "remote.sync", logId: input.position.logId });
}
function receiveClientFailed(state, input, context) {
  const session2 = draftSessions.get(state);
  if (input.logId === session2.revisionLog && session2.pendingMerges.delete(input.requestId)) {
    failedForSession(session2, input.requestId, input.message, context);
  }
}
function receiveRemoteFailed(state, input, context) {
  const session2 = draftSessions.get(state);
  if (input.logId !== session2.revisionLog) return;
  for (const queued of session2.pendingTakeovers.values()) {
    for (const item of queued) failedForSession(session2, item.command.commandId, input.message, context);
  }
  session2.pendingTakeovers.clear();
}
function receiveRemoteSynced(state, input, context) {
  const session2 = draftSessions.get(state);
  if (input.logId === session2.revisionLog) session2.syncedThrough = input.through;
  if (input.logId === session2.revisionLog && input.through !== null) {
    void syncedTakeovers(session2, input.through, context);
  }
  refresh(state, context);
}
async function syncedTakeovers(session2, through, context) {
  const records2 = await recordsOf(session2.local, through.logId);
  const throughIndex = records2.findIndex((record) => record.id === through.recordId);
  if (throughIndex < 0) return;
  for (const [key2, queued] of session2.pendingTakeovers) {
    const targetIndex = records2.findIndex((record) => record.id === queued[0].target.recordId);
    if (targetIndex < 0 || targetIndex > throughIndex) continue;
    session2.pendingTakeovers.delete(key2);
    for (const item of queued) appendCommand(session2, item.command, context);
  }
}
function receiveDraftRecord(state, input, context) {
  const session2 = draftSessions.get(state);
  const revisionPrefix = revisionLogPrefix(session2.principalId, session2.draftId);
  if (input.logId === session2.decisionLog || input.logId.startsWith(revisionPrefix)) {
    refresh(state, context);
  }
}
function refreshDraft(state, _input, context) {
  refresh(state, context);
}
var draftCoordinator = stateful3(
  "draft-coordinator",
  createDraftCoordinator,
  [
    on3("draft.save", saveDraft, ["client.append"]),
    on3("draft.editing", setEditingBase, []),
    on3("draft.beginEditing", beginEditing, ["client.append"]),
    on3("draft.takeover", takeoverDraft, ["remote.sync", "client.append", "draft.actionFailed"]),
    on3("draft.advance", advanceDraft, ["client.append", "draft.actionFailed"]),
    on3("draft.useShared", useSharedDraft, ["draft.shared", "draft.actionFailed"]),
    on3("draft.continueHere", continueHere, ["remote.sync", "client.append", "draft.actionFailed"]),
    on3("draft.merge", mergeDraft, ["client.append", "remote.sync", "draft.actionFailed"]),
    on3("client.appended", receiveClientAppended, ["remote.attach", "remote.sync", "client.append", "draft.changed", "draft.shared", "draft.actionFailed"]),
    on3("client.failed", receiveClientFailed, ["draft.actionFailed"]),
    on3("remote.failed", receiveRemoteFailed, ["draft.actionFailed"]),
    on3("remote.synced", receiveRemoteSynced, ["remote.attach", "remote.sync", "client.append", "draft.changed", "draft.shared", "draft.actionFailed"]),
    on3("remote.received", receiveDraftRecord, ["remote.attach", "remote.sync", "client.append", "draft.changed", "draft.shared", "draft.actionFailed"]),
    on3("draft.refresh", refreshDraft, ["remote.attach", "remote.sync", "client.append", "draft.changed", "draft.shared", "draft.actionFailed"]),
    event2("draft.useShared", {}),
    event2("draft.shared", {}),
    event2("draft.continueHere", {}),
    event2("draft.merge", {}),
    event2("draft.actionFailed", {}),
    event2("draft.changed", {})
  ]
);

// apps/client/impl/client/writer.ts
import {
  createReplicatedRecord
} from "/pico.js";
import { event as event3, on as on4, stateful as stateful4 } from "/pico.js";
var clientWriter = stateful4("client", createClientWriter, [
  on4("client.append", appendClientRecord, ["client.appended", "client.failed", "remote.sync"]),
  event3("client.append", {}),
  event3("client.appended", {}),
  event3("client.failed", {})
]);
var sessions2 = /* @__PURE__ */ new WeakMap();
function message(cause) {
  return cause instanceof Error ? cause.message : String(cause);
}
function validId(value) {
  return typeof value === "string" && value.length > 0;
}
function emit3(context, event4) {
  try {
    context.emit(event4);
  } catch (error) {
    queueMicrotask(() => {
      throw error;
    });
  }
}
function validate(event4, session2) {
  if (!session2.accepting) throw new Error("client is closing");
  if (!validId(event4.requestId)) throw new TypeError("requestId must be non-empty");
  if (!validId(event4.logId)) throw new TypeError("logId must be non-empty");
  if (session2.access.get(event4.logId) !== "push") throw new TypeError(`${event4.logId} is not a push Log`);
  if (event4.requires !== void 0 && !Array.isArray(event4.requires)) {
    throw new TypeError("requires must be an array");
  }
  for (const required of event4.requires ?? []) {
    if (!validId(required?.logId) || !validId(required?.recordId)) {
      throw new TypeError("requires contains an invalid Position");
    }
    if (required.logId === event4.logId) {
      throw new TypeError("same-Log causality is represented by parent, not requires");
    }
  }
}
async function append(event4, session2, context) {
  try {
    const parent = await session2.local.head(event4.logId);
    const record = await createReplicatedRecord({
      logId: event4.logId,
      parent,
      requires: event4.requires ?? [],
      data: event4.data
    });
    const result = await session2.local.append(event4.logId, parent, [record]);
    if (result.kind !== "accepted" || !samePosition(result.head, positionOf(record))) {
      throw new Error(`local append lost ownership of ${event4.logId}`);
    }
    emit3(context, { type: "client.appended", requestId: event4.requestId, position: positionOf(record) });
    emit3(context, { type: "remote.sync", logId: event4.logId });
  } catch (cause) {
    emit3(context, {
      type: "client.failed",
      requestId: event4.requestId,
      logId: event4.logId,
      message: message(cause)
    });
  }
}
function createClientWriter(options, lifecycle) {
  const access = /* @__PURE__ */ new Map();
  for (const binding of options.bindings) {
    if (!validId(binding.logId) || binding.access !== "push" && binding.access !== "pull") {
      throw new TypeError("bindings contain an invalid Log binding");
    }
    if (access.has(binding.logId)) throw new TypeError(`duplicate Log binding ${binding.logId}`);
    access.set(binding.logId, binding.access);
  }
  const state = Object.freeze({});
  const session2 = { local: options.local, access, queues: /* @__PURE__ */ new Map(), accepting: true };
  sessions2.set(state, session2);
  lifecycle.onDispose(() => {
    session2.accepting = false;
  });
  return state;
}
function appendClientRecord(state, event4, context) {
  const session2 = sessions2.get(state);
  let request3;
  try {
    validate(event4, session2);
    request3 = Object.freeze({
      type: "client.append",
      requestId: event4.requestId,
      logId: event4.logId,
      requires: Object.freeze((event4.requires ?? []).map((required) => Object.freeze({ ...required }))),
      data: decodeValue(event4.data)
    });
  } catch (cause) {
    emit3(context, { type: "client.failed", requestId: event4.requestId, logId: event4.logId, message: message(cause) });
    return;
  }
  const previous = session2.queues.get(request3.logId) ?? Promise.resolve();
  const current = previous.then(() => append(request3, session2, context));
  session2.queues.set(request3.logId, current);
  void current.finally(() => {
    if (session2.queues.get(request3.logId) === current) session2.queues.delete(request3.logId);
  });
}
function addClientBindings(state, bindings) {
  const session2 = sessions2.get(state);
  const added = [];
  for (const binding of bindings) {
    const access = session2.access.get(binding.logId);
    if (access !== void 0 && access !== binding.access) {
      throw new TypeError(`Cannot change access for ${binding.logId}`);
    }
    if (access === void 0) added.push(binding);
  }
  for (const binding of added) session2.access.set(binding.logId, binding.access);
  return Object.freeze(added);
}
async function stopClientWriter(state) {
  const session2 = sessions2.get(state);
  session2.accepting = false;
  await Promise.all([...session2.queues.values()]);
}

// apps/client/impl/client/draft-attachments.ts
function validId2(value) {
  return typeof value === "string" && value.length > 0;
}
function createDraftAttachments(options) {
  const { identity, local, bus, remote: remote2, writer } = options;
  const attachments = /* @__PURE__ */ new Map();
  const coordinators = /* @__PURE__ */ new Set();
  let disposed = false;
  const attach = (draftId) => {
    if (disposed) throw new Error("client is disposed");
    if (!validId2(draftId)) throw new TypeError("draftId must be non-empty");
    const attached = attachments.get(draftId);
    if (attached) return attached;
    const bindings = [
      { logId: revisionLogId(identity.principalId, draftId, identity.replicaId), access: "push" },
      { logId: requestLogId(identity.principalId, draftId, identity.replicaId), access: "push" },
      { logId: decisionLogId(identity.principalId, draftId), access: "pull" }
    ];
    for (const binding of addClientBindings(writer, bindings)) {
      bus.emit({ type: "remote.attach", binding }, "client");
    }
    const coordinator = draftCoordinator.create({
      principalId: identity.principalId,
      draftId,
      replicaId: identity.replicaId,
      local
    }, bus, `draft-coordinator:${draftId}`);
    coordinators.add(coordinator);
    coordinator.receive({ type: "draft.refresh" });
    const revisionLog = revisionLogId(identity.principalId, draftId, identity.replicaId);
    const syncState = createState4(Object.freeze({ status: "unknown" }));
    let syncFailure = null;
    const updateSync = () => {
      const entry = remote2.state.getSnapshot().find((log) => log.logId === revisionLog);
      const localHead = entry?.localHead ?? null;
      syncState.set(syncFailure ?? (localHead === null ? Object.freeze({ status: "unknown" }) : samePosition(entry?.pushedThrough ?? null, localHead) ? Object.freeze({ status: "synced" }) : Object.freeze({ status: "pending" })));
    };
    const unsubscribeRemoteState = remote2.state.subscribe(updateSync);
    const unsubscribeRemoteFailure = bus.subscribe(
      ["remote.failed", "remote.synced"],
      (event4) => {
        if (event4.logId !== revisionLog) return;
        syncFailure = event4.type === "remote.failed" ? Object.freeze({
          status: event4.kind === "unavailable" ? "unavailable" : "blocked",
          message: event4.message ?? "Remote sync failed"
        }) : null;
        updateSync();
      }
    );
    updateSync();
    const pendingWrites = /* @__PURE__ */ new Map();
    const attachmentId = `attachment:${draftId}:${globalThis.crypto.randomUUID()}`;
    let writeSequence = 0;
    let attachmentDisposed = false;
    const unsubscribeWrites = bus.subscribe(
      ["client.appended", "client.failed"],
      (event4) => {
        const pending = pendingWrites.get(event4.requestId);
        if (pending === void 0) return;
        pendingWrites.delete(event4.requestId);
        if (event4.type === "client.appended" && event4.position !== void 0) pending.resolve(event4.position);
        else pending.reject(new Error(event4.message ?? "The local append failed"));
      }
    );
    const append2 = (emit6) => new Promise((resolve, reject) => {
      if (attachmentDisposed) {
        reject(new Error("Draft attachment is disposed"));
        return;
      }
      const requestId = `${attachmentId}:write:${++writeSequence}`;
      pendingWrites.set(requestId, { resolve, reject });
      emit6(requestId);
    });
    const emitAction = (emit6) => {
      if (attachmentDisposed) throw new Error("Draft attachment is disposed");
      emit6();
    };
    const actionId = (kind) => `${attachmentId}:${kind}:${++writeSequence}`;
    const listeners = /* @__PURE__ */ new Set();
    const unsubscribeState = coordinator.state.subscribe(() => {
      for (const listener of [...listeners]) listener();
    });
    const attachment = Object.freeze({
      getSnapshot: coordinator.state.getSnapshot,
      ready: settled(coordinator.state),
      sync: Object.freeze({
        getSnapshot: syncState.getSnapshot,
        subscribe: syncState.subscribe
      }),
      editing: (origin) => {
        bus.emit({ type: "draft.editing", draftId, origin }, `attachment:${draftId}`);
      },
      save: async (source) => {
        await append2((requestId) => {
          bus.emit({ type: "draft.save", requestId, draftId, source }, `attachment:${draftId}`);
        });
      },
      submit: () => {
        const revision = editingBaseOf(coordinator.state);
        if (revision === null) return Promise.reject(new Error("There is no durable Revision to submit"));
        return append2((requestId) => {
          bus.emit({
            type: "submission.request",
            requestId,
            submissionId: `submission:${draftId}:${requestId}`,
            playgroundId: draftId,
            revision
          }, `attachment:${draftId}`);
        });
      },
      useShared: () => emitAction(() => {
        bus.emit({ type: "draft.useShared", draftId }, `attachment:${draftId}`);
      }),
      continueHere: () => emitAction(() => {
        bus.emit({
          type: "draft.continueHere",
          draftId,
          commandId: actionId("continue")
        }, `attachment:${draftId}`);
      }),
      merge: (source) => emitAction(() => {
        bus.emit({
          type: "draft.merge",
          draftId,
          requestId: actionId("merge-request"),
          commandId: actionId("merge"),
          source
        }, `attachment:${draftId}`);
      }),
      subscribe: (listener) => {
        if (attachmentDisposed) return () => void 0;
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      dispose: () => {
        if (attachmentDisposed) return;
        attachmentDisposed = true;
        unsubscribeState();
        unsubscribeRemoteState();
        unsubscribeRemoteFailure();
        unsubscribeWrites();
        for (const pending of pendingWrites.values()) pending.reject(new Error("Draft attachment is disposed"));
        pendingWrites.clear();
        listeners.clear();
        coordinator.dispose();
        coordinators.delete(coordinator);
        attachments.delete(draftId);
      }
    });
    attachments.set(draftId, attachment);
    bus.emit({ type: "remote.sync" }, "client");
    return attachment;
  };
  return Object.freeze({
    attach,
    refresh: () => {
      for (const coordinator of coordinators) coordinator.receive({ type: "draft.refresh" });
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      for (const attachment of [...attachments.values()]) attachment.dispose();
    }
  });
}

// apps/client/impl/learning-analysis/logs.ts
function learningEvidenceLogId(principalId, replicaId) {
  return `principal/${encodeLogComponent(principalId, "principalId")}/analysis/${encodeLogComponent(replicaId, "replicaId")}/evidence`;
}
function learningResultLogId(principalId) {
  return `principal/${encodeLogComponent(principalId, "principalId")}/analysis/results`;
}

// apps/client/impl/learning-analysis/capture.ts
import {
  decodeLearningEvidenceData
} from "/pico.js";
var MAX_EVIDENCE_BYTES = 64 * 1024;
function message2(cause) {
  return cause instanceof Error ? cause.message : String(cause);
}
function emit4(bus, event4) {
  try {
    bus.emit(event4, "learning-evidence");
  } catch (error) {
    queueMicrotask(() => {
      throw error;
    });
  }
}
function createLearningEvidenceCapture(options) {
  const { bus, evidenceLogId } = options;
  const session2 = globalThis.crypto.randomUUID();
  const pending = /* @__PURE__ */ new Map();
  const active = /* @__PURE__ */ new Set();
  let sequence = 0;
  let disposed = false;
  const fail = (requestId, cause) => {
    const operation = pending.get(requestId);
    if (!active.delete(requestId) && operation === void 0) return;
    pending.delete(requestId);
    const failure = new Error(message2(cause));
    operation?.reject(failure);
    emit4(bus, { type: "learning.evidence.failed", requestId, message: failure.message });
  };
  const stopCapture = bus.subscribe(["learning.evidence.record"], (event4) => {
    if (active.has(event4.requestId)) return;
    active.add(event4.requestId);
    try {
      const currentSequence = ++sequence;
      const evidence = decodeLearningEvidenceData({
        version: 1,
        type: "learning.evidence.recorded",
        source: { session: session2, sequence: currentSequence },
        subject: event4.subject,
        payload: event4.payload
      });
      if (new TextEncoder().encode(JSON.stringify(evidence)).byteLength > MAX_EVIDENCE_BYTES) {
        throw new TypeError(`Evidence exceeds ${MAX_EVIDENCE_BYTES} bytes`);
      }
      bus.emit({
        type: "client.append",
        requestId: event4.requestId,
        logId: evidenceLogId,
        requires: event4.requires ?? [],
        data: asValue(evidence)
      }, "learning-evidence");
    } catch (error) {
      fail(event4.requestId, error);
    }
  });
  const stopAppend = bus.subscribe(
    ["client.appended", "client.failed"],
    (event4) => {
      if (!active.has(event4.requestId)) return;
      if (event4.type === "client.failed") {
        fail(event4.requestId, event4.message ?? "Evidence append failed");
        return;
      }
      if (event4.position === void 0) {
        fail(event4.requestId, "Evidence append returned no Position");
        return;
      }
      const operation = pending.get(event4.requestId);
      active.delete(event4.requestId);
      pending.delete(event4.requestId);
      operation?.resolve(event4.position);
      emit4(bus, { type: "learning.evidence.accepted", requestId: event4.requestId, position: event4.position });
    }
  );
  return Object.freeze({
    record: (subject, payload, requires = []) => new Promise((resolve, reject) => {
      if (disposed) {
        reject(new Error("Learning Evidence capture is disposed"));
        return;
      }
      const requestId = `learning-evidence:${session2}:${sequence + 1}`;
      const dependencies = Object.freeze(requires.map((position) => Object.freeze({ ...position })));
      pending.set(requestId, { resolve, reject });
      try {
        bus.emit({
          type: "learning.evidence.record",
          requestId,
          subject,
          payload,
          requires: dependencies
        }, "learning-evidence");
      } catch (error) {
        fail(requestId, error);
      }
    }),
    dispose: () => {
      if (disposed) return;
      disposed = true;
      stopCapture();
      stopAppend();
      for (const operation of pending.values()) operation.reject(new Error("Learning Evidence capture is disposed"));
      pending.clear();
      active.clear();
    }
  });
}

// apps/client/impl/learning-analysis/projection.ts
import {
  decodeLearningAssessment,
  decodeLearningEvidenceData as decodeLearningEvidenceData2,
  decodeLearningResultData
} from "/pico.js";
import { createState as createState5 } from "/pico.js";
function subjectKey(subject) {
  return JSON.stringify([subject.playgroundId, subject.versionId, subject.exerciseKey ?? null]);
}
async function records(local, logId) {
  const output = [];
  let after = null;
  for (; ; ) {
    const page = await local.read(logId, after, 128);
    output.push(...page.records);
    if (!page.hasMore) return output;
    const last = page.records.at(-1);
    if (last === void 0) throw new TypeError(`${logId} returned an empty continuation page`);
    after = Object.freeze({ logId: last.logId, recordId: last.id });
  }
}
function project2(values) {
  const entries = /* @__PURE__ */ new Map();
  let unavailable = false;
  for (const value of values) {
    try {
      const record = decodeLearningResultData(value);
      const key2 = subjectKey(record.subject);
      const current = entries.get(key2);
      if (record.type === "learning.analysis.failed") {
        entries.set(key2, {
          subject: record.subject,
          result: current?.result ?? null,
          basis: current?.basis ?? null,
          unavailable: true
        });
        continue;
      }
      entries.set(key2, {
        subject: record.subject,
        result: decodeLearningAssessment(record.output),
        basis: record.basis,
        unavailable: false
      });
    } catch {
      unavailable = true;
    }
  }
  return { entries, unavailable };
}
function hasNewEvidence(basis, evidence, evidenceLogId, subject) {
  const through = new Set(
    basis?.evidence.filter((window2) => window2.through.logId === evidenceLogId).map((window2) => window2.through.recordId) ?? []
  );
  if (through.size === 0) return false;
  let analyzed = -1;
  for (let index = 0; index < evidence.length; index++) {
    if (through.has(evidence[index].id)) analyzed = Math.max(analyzed, index);
  }
  if (analyzed < 0) return false;
  const key2 = subjectKey(subject);
  return evidence.slice(analyzed + 1).some((record) => {
    try {
      return subjectKey(decodeLearningEvidenceData2(record.data).subject) === key2;
    } catch {
      return false;
    }
  });
}
function emit5(bus, event4) {
  try {
    bus.emit(event4, "learning-feedback");
  } catch (error) {
    queueMicrotask(() => {
      throw error;
    });
  }
}
function createLearningFeedback(options) {
  const { local, bus, evidenceLogId, resultLogId } = options;
  const state = createState5(Object.freeze({
    entries: Object.freeze([]),
    unavailable: false
  }));
  let disposed = false;
  const initialized = /* @__PURE__ */ new Map();
  const render = (subject) => {
    const snapshot = state.getSnapshot();
    const entry = snapshot.entries.find((candidate) => subjectKey(candidate.subject) === subjectKey(subject));
    emit5(bus, {
      type: "learning.feedback.render",
      subject,
      value: Object.freeze({
        result: entry?.result ?? null,
        unavailable: entry?.unavailable ?? snapshot.unavailable,
        hasNewLocalEvidence: entry?.hasNewLocalEvidence ?? false
      })
    });
  };
  const notify = () => {
    emit5(bus, { type: "learning.feedback.changed" });
    for (const subject of initialized.values()) render(subject);
  };
  const refreshing = createRefresh(async () => {
    try {
      const [resultRecords, evidenceRecords] = await Promise.all([
        records(local, resultLogId),
        records(local, evidenceLogId)
      ]);
      const current = project2(resultRecords.map((record) => record.data));
      const entries = Object.freeze([...current.entries.values()].sort((left, right) => subjectKey(left.subject).localeCompare(subjectKey(right.subject))).map((entry) => Object.freeze({
        subject: entry.subject,
        result: entry.result,
        unavailable: entry.unavailable,
        hasNewLocalEvidence: hasNewEvidence(
          entry.basis,
          evidenceRecords,
          evidenceLogId,
          entry.subject
        )
      })));
      const snapshot = Object.freeze({ entries, unavailable: current.unavailable });
      if (!disposed) {
        state.set(snapshot);
        notify();
      }
    } catch (error) {
      if (!disposed) {
        const previous = state.getSnapshot();
        state.set(Object.freeze({ ...previous, unavailable: true }));
        notify();
      }
      throw error;
    }
  });
  const refresh2 = refreshing.refresh;
  const stop = bus.subscribe(["remote.received", "client.appended"], (event4) => {
    const logId = event4.logId ?? event4.position?.logId;
    if (logId === resultLogId || logId === evidenceLogId) void refresh2().catch(() => void 0);
  });
  const stopInit = bus.subscribe(["learning.feedback.init"], (event4) => {
    initialized.set(subjectKey(event4.subject), event4.subject);
    render(event4.subject);
  });
  const ready = refresh2();
  return Object.freeze({
    getSnapshot: state.getSnapshot,
    subscribe: state.subscribe,
    ready,
    refresh: refresh2,
    dispose: () => {
      disposed = true;
      refreshing.dispose();
      stop();
      stopInit();
      initialized.clear();
    }
  });
}

// apps/client/impl/client/create-client.ts
function validId3(value) {
  return typeof value === "string" && value.length > 0;
}
function clientBindings(options) {
  const identity = options.identity;
  if (!validId3(identity?.principalId) || !validId3(identity.replicaId)) {
    throw new TypeError("identity is required");
  }
  if (typeof options.submissions?.read !== "function") throw new TypeError("submissions source is required");
  return Object.freeze([
    Object.freeze({ logId: PLAYGROUND_RELEASES_LOG_ID, access: "pull" }),
    Object.freeze({ logId: submissionRequestLogId(identity.principalId, identity.replicaId), access: "push" }),
    Object.freeze({ logId: submissionResultLogId(identity.principalId, identity.replicaId), access: "pull" }),
    Object.freeze({ logId: learningEvidenceLogId(identity.principalId, identity.replicaId), access: "push" }),
    Object.freeze({ logId: learningResultLogId(identity.principalId), access: "pull" })
  ]);
}
function createClientImplementation(options) {
  const bus = options.bus ?? new EventBus();
  const ownsBus = options.bus === void 0;
  const identity = options.identity;
  const bindings = clientBindings(options);
  const remoteInstance = remote.create({ local: options.local, peer: options.peer, bindings }, bus);
  const writer = clientWriter.create({ local: options.local, bindings }, bus);
  const catalog = playgroundCatalog.create({ local: options.local }, bus);
  const drafts = createDraftAttachments({ identity, local: options.local, bus, remote: remoteInstance, writer: writer.state });
  const submissionCommands = submissionWriter.create({ principalId: identity.principalId, replicaId: identity.replicaId }, bus);
  const submissions = createSubmissionHistory(options.submissions);
  const evidence = createLearningEvidenceCapture({
    bus,
    evidenceLogId: learningEvidenceLogId(identity.principalId, identity.replicaId)
  });
  const feedback = createLearningFeedback({
    local: options.local,
    bus,
    evidenceLogId: learningEvidenceLogId(identity.principalId, identity.replicaId),
    resultLogId: learningResultLogId(identity.principalId)
  });
  void submissions.ready.catch(() => void 0);
  void feedback.ready.catch(() => void 0);
  const submissionLogs = /* @__PURE__ */ new Set([
    submissionRequestLogId(identity.principalId, identity.replicaId),
    submissionResultLogId(identity.principalId, identity.replicaId)
  ]);
  const unsubscribeSubmissions = bus.subscribe(
    ["remote.synced", "remote.received"],
    (event4) => {
      if (event4.logId !== void 0 && submissionLogs.has(event4.logId)) {
        void submissions.refresh().catch(() => void 0);
      }
    }
  );
  let disposed = false;
  const ready = Promise.all([
    ...bindings.map((binding) => options.local.head(binding.logId)),
    catalog.state.ready
  ]).then(() => void 0);
  void ready.then(
    () => {
      if (disposed) return;
      drafts.refresh();
      bus.emit({ type: "remote.sync" }, "client");
    },
    () => void 0
  );
  const unsubscribePeer = options.peer.subscribe?.(({ logId }) => {
    if (disposed) return;
    if (logId === void 0 || isSubmissionResultLogFor(identity.principalId, logId)) {
      void submissions.refresh().catch(() => void 0);
    }
    if (logId === void 0 || remoteInstance.state.getSnapshot().some((binding) => binding.logId === logId)) {
      bus.emit(logId === void 0 ? { type: "remote.sync" } : { type: "remote.sync", logId }, "client");
    }
  });
  return Object.freeze({
    playgrounds: catalog.state,
    submissions,
    evidence,
    feedback,
    ready,
    retrySync: () => bus.emit({ type: "remote.sync" }, "client"),
    attachDraft: drafts.attach,
    dispose: async () => {
      if (disposed) return;
      disposed = true;
      unsubscribePeer?.();
      unsubscribeSubmissions();
      remoteInstance.dispose();
      drafts.dispose();
      submissionCommands.dispose();
      submissions.dispose();
      evidence.dispose();
      feedback.dispose();
      catalog.dispose();
      await stopClientWriter(writer.state);
      writer.dispose();
      if (ownsBus) bus.dispose();
    }
  });
}

// apps/client/api/client.ts
function createClient(options) {
  return createClientImplementation(options);
}

// apps/client/impl/submission/http-source.ts
var DEFAULT_MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
function commentOf(value, index) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`submissions[].comments[${index}] must be an object`);
  }
  const input = value;
  return Object.freeze({
    author: nonEmptyString(input["author"], `submissions[].comments[${index}].author`),
    text: nonEmptyString(input["text"], `submissions[].comments[${index}].text`)
  });
}
function submissionOf(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("submissions[] must be an object");
  }
  const input = value;
  if (!Array.isArray(input["comments"])) throw new TypeError("submissions[].comments must be an array");
  const common = {
    id: nonEmptyString(input["id"], "submissions[].id"),
    submissionId: nonEmptyString(input["submissionId"], "submissions[].submissionId"),
    playgroundId: nonEmptyString(input["playgroundId"], "submissions[].playgroundId"),
    comments: Object.freeze(input["comments"].map(commentOf))
  };
  if (input["status"] === "requested") return Object.freeze({ ...common, status: input["status"] });
  if (input["status"] === "completed") return Object.freeze({
    ...common,
    status: input["status"],
    tag: nonEmptyString(input["tag"], "submissions[].tag")
  });
  if (input["status"] === "failed") return Object.freeze({
    ...common,
    status: input["status"],
    message: nonEmptyString(input["message"], "submissions[].message")
  });
  throw new TypeError("submissions[].status is invalid");
}
async function bodyOf(response, maximum) {
  try {
    return await readBoundedJson(response, maximum);
  } catch (cause) {
    if (cause instanceof HttpBodyTooLarge) throw new Error("Submission history is too large");
    if (cause instanceof HttpInvalidJson) throw new Error("Submission history is invalid JSON", { cause });
    throw cause;
  }
}
function createHttpSubmissionSource(options) {
  const origin = httpOrigin(options.baseUrl);
  if (typeof options.fetch !== "function") throw new TypeError("fetch must be a function");
  const maximum = options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
  if (!Number.isInteger(maximum) || maximum < 1) throw new TypeError("maxResponseBytes must be a positive integer");
  const headers = Object.freeze({ ...options.headers });
  return Object.freeze({
    read: async () => {
      const response = await options.fetch(`${origin}/api/v1/submissions`, { headers });
      if (!response.ok) throw new Error(`Submission history request failed with HTTP ${response.status}`);
      const body = await bodyOf(response, maximum);
      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        throw new TypeError("Submission history must be an object");
      }
      const values = body["submissions"];
      if (!Array.isArray(values)) throw new TypeError("Submission history must contain submissions");
      return Object.freeze(values.map(submissionOf));
    }
  });
}

// apps/client/impl/replica/browser-log.ts
import {
  verifyReplicatedRecord
} from "/pico.js";
var LOGS = "logs";
var RECORDS = "records";
var BY_LOG_SEQUENCE = "byLogSequence";
var ReplicaLogBrowserError = class extends Error {
  constructor(message4, options) {
    super(message4, options);
    this.name = "ReplicaLogBrowserError";
  }
};
function request(operation) {
  return new Promise((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error ?? new Error("IndexedDB request failed"));
  });
}
function completed(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
  });
}
function logOf(value, expectedLogId) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`metadata for ${expectedLogId} is invalid`);
  }
  const input = value;
  if (input["logId"] !== expectedLogId || typeof input["headRecordId"] !== "string" || input["headRecordId"].length === 0 || !Number.isSafeInteger(input["nextSequence"]) || Number(input["nextSequence"]) < 1) {
    throw new TypeError(`metadata for ${expectedLogId} is invalid`);
  }
  return input;
}
function storedRecordOf(value, logId) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`stored record for ${logId} is invalid`);
  }
  const input = value;
  if (input["logId"] !== logId || typeof input["recordId"] !== "string" || !Number.isSafeInteger(input["sequence"]) || Number(input["sequence"]) < 0) {
    throw new TypeError(`stored record for ${logId} is invalid`);
  }
  return {
    logId,
    recordId: input["recordId"],
    sequence: input["sequence"],
    record: decodeRecord(input["record"], logId)
  };
}
function databaseName(identity) {
  const principalId = nonEmptyString(identity?.principalId, "identity.principalId");
  const replicaId = nonEmptyString(identity?.replicaId, "identity.replicaId");
  return `picopg:replica-log:${encodeURIComponent(principalId)}:${encodeURIComponent(replicaId)}`;
}
var IndexedDbReplicaLog = class {
  #database;
  #keyRange;
  #description;
  constructor(options) {
    const name = options.databaseName ?? databaseName(options.identity);
    if (name.length === 0) throw new TypeError("databaseName must be non-empty");
    const factory = options.indexedDB ?? globalThis.indexedDB;
    const keyRange = options.keyRange ?? globalThis.IDBKeyRange;
    if (factory === void 0 || keyRange === void 0) throw new Error("IndexedDB is not available");
    this.#description = `browser database ${name}`;
    this.#keyRange = keyRange;
    this.#database = new Promise((resolve, reject) => {
      const opening = factory.open(name, 1);
      opening.onupgradeneeded = () => {
        const database = opening.result;
        if (!database.objectStoreNames.contains(LOGS)) {
          database.createObjectStore(LOGS, { keyPath: "logId" });
        }
        if (!database.objectStoreNames.contains(RECORDS)) {
          const records2 = database.createObjectStore(RECORDS, { keyPath: ["logId", "recordId"] });
          records2.createIndex(BY_LOG_SEQUENCE, ["logId", "sequence"], { unique: true });
        }
      };
      opening.onsuccess = () => resolve(opening.result);
      opening.onerror = () => reject(opening.error ?? new Error("IndexedDB open failed"));
      opening.onblocked = () => reject(new Error("IndexedDB upgrade is blocked"));
    });
  }
  async head(logId) {
    nonEmptyString(logId, "logId");
    try {
      const database = await this.#database;
      const transaction = database.transaction(LOGS, "readonly");
      const done = completed(transaction);
      const value = await request(transaction.objectStore(LOGS).get(logId));
      await done;
      if (value === void 0) return null;
      const metadata = logOf(value, logId);
      return Object.freeze({ logId, recordId: metadata.headRecordId });
    } catch (cause) {
      throw this.#error(`cannot read head of ${logId}`, cause);
    }
  }
  async has(position) {
    const expected = decodeNullablePosition(position, "position");
    try {
      const database = await this.#database;
      const transaction = database.transaction(RECORDS, "readonly");
      const done = completed(transaction);
      const key2 = await request(transaction.objectStore(RECORDS).getKey([expected.logId, expected.recordId]));
      await done;
      return key2 !== void 0;
    } catch (cause) {
      throw this.#error(`cannot find ${expected.logId}:${expected.recordId}`, cause);
    }
  }
  async read(logId, after, limit) {
    nonEmptyString(logId, "logId");
    const cursor = decodeNullablePosition(after, "after", logId);
    if (!Number.isInteger(limit) || limit < 1) throw new TypeError("limit must be a positive integer");
    try {
      const database = await this.#database;
      const transaction = database.transaction([LOGS, RECORDS], "readonly");
      const done = completed(transaction);
      const logs = transaction.objectStore(LOGS);
      const records2 = transaction.objectStore(RECORDS);
      const metadataValue = await request(logs.get(logId));
      const metadata = metadataValue === void 0 ? null : logOf(metadataValue, logId);
      let start2 = 0;
      if (cursor !== null) {
        const stored = await request(records2.get([logId, cursor.recordId]));
        if (stored === void 0) throw new Error(`unknown cursor ${logId}:${cursor.recordId}`);
        start2 = storedRecordOf(stored, logId).sequence + 1;
      }
      const range = this.#keyRange.bound([logId, start2], [logId, Number.MAX_SAFE_INTEGER]);
      const values = await request(records2.index(BY_LOG_SEQUENCE).getAll(range, limit + 1));
      await done;
      const decoded = values.map((value) => storedRecordOf(value, logId));
      for (const stored of decoded) {
        if (stored.recordId !== stored.record.id || !await verifyReplicatedRecord(stored.record)) {
          throw new TypeError(`invalid record identity ${stored.recordId}`);
        }
      }
      return Object.freeze({
        records: Object.freeze(decoded.slice(0, limit).map((value) => value.record)),
        head: metadata === null ? null : Object.freeze({ logId, recordId: metadata.headRecordId }),
        hasMore: decoded.length > limit
      });
    } catch (cause) {
      throw this.#error(`cannot read ${logId}`, cause);
    }
  }
  async append(logId, expectedHead, incoming) {
    nonEmptyString(logId, "logId");
    const expected = decodeNullablePosition(expectedHead, "expectedHead", logId);
    if (!Array.isArray(incoming)) throw new TypeError("records must be an array");
    const batch = incoming.map((record) => decodeRecord(record, logId));
    for (const record of batch) {
      if (!await verifyReplicatedRecord(record)) throw new TypeError(`invalid record identity ${record.id}`);
    }
    let transaction;
    let done;
    try {
      const database = await this.#database;
      transaction = database.transaction([LOGS, RECORDS], "readwrite");
      done = completed(transaction);
      const logs = transaction.objectStore(LOGS);
      const records2 = transaction.objectStore(RECORDS);
      const metadataValue = await request(logs.get(logId));
      const metadata = metadataValue === void 0 ? null : logOf(metadataValue, logId);
      const current = metadata === null ? null : Object.freeze({ logId, recordId: metadata.headRecordId });
      if (!samePosition(current, expected)) {
        let replayed = batch.length > 0;
        for (const record of batch) {
          const value = await request(records2.get([logId, record.id]));
          replayed = replayed && value !== void 0 && sameRecord(storedRecordOf(value, logId).record, record);
        }
        transaction.abort();
        await done.catch(() => void 0);
        return Object.freeze({ kind: replayed ? "current" : "changed", head: copyPosition(current) });
      }
      if (batch.length === 0) {
        await done;
        return Object.freeze({ kind: "current", head: copyPosition(current) });
      }
      let parent = current;
      let sequence = metadata?.nextSequence ?? 0;
      const batchIds = /* @__PURE__ */ new Set();
      for (const record of batch) {
        if (!samePosition(record.parent, parent)) throw new TypeError(`broken parent before ${record.id}`);
        if (batchIds.has(record.id) || await request(records2.getKey([logId, record.id])) !== void 0) {
          throw new TypeError(`record id reused: ${record.id}`);
        }
        for (const required of record.requires) {
          if (await request(records2.getKey([required.logId, required.recordId])) === void 0) {
            throw new TypeError(`missing dependency ${required.logId}:${required.recordId}`);
          }
        }
        batchIds.add(record.id);
        records2.add({ logId, recordId: record.id, sequence, record });
        sequence += 1;
        parent = positionOf(record);
      }
      logs.put({ logId, headRecordId: parent.recordId, nextSequence: sequence });
      await done;
      return Object.freeze({ kind: "accepted", head: copyPosition(parent) });
    } catch (cause) {
      try {
        transaction?.abort();
      } catch {
      }
      await done?.catch(() => void 0);
      throw this.#error(`cannot append ${logId}`, cause);
    }
  }
  #error(message4, cause) {
    return cause instanceof ReplicaLogBrowserError ? cause : new ReplicaLogBrowserError(`${message4} in ${this.#description}`, { cause });
  }
};
function createBrowserReplicaLogStore(options) {
  return new IndexedDbReplicaLog(options);
}

// apps/client/impl/replica/http-peer.ts
var PROTOCOL_VERSION = 1;
var RemoteHttpError = class extends Error {
  constructor(status, message4, options) {
    super(message4, options);
    this.status = status;
    this.name = "RemoteHttpError";
  }
  status;
};
function pathFor(origin, logId, suffix) {
  const segments = ["api", "v1", "replica", "logs", nonEmptyString(logId, "logId"), ...suffix];
  return `${origin}/${segments.map(encodeURIComponent).join("/")}`;
}
function json(bytes) {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (cause) {
    throw new RemoteHttpError(void 0, "remote returned invalid JSON", { cause });
  }
}
var HttpRemotePeerImpl = class {
  #origin;
  #fetch;
  #headers;
  #maximum;
  #ready;
  constructor(options) {
    this.#origin = httpOrigin(options.baseUrl);
    if (typeof options.fetch !== "function") throw new TypeError("fetch must be a function");
    this.#fetch = options.fetch;
    this.#headers = Object.freeze({ ...options.headers });
    this.#maximum = options.maxResponseBytes ?? 4 * 1024 * 1024;
    if (!Number.isInteger(this.#maximum) || this.#maximum < 1) {
      throw new TypeError("maxResponseBytes must be a positive integer");
    }
  }
  async #handshake() {
    const result = await this.#request(`${this.#origin}/api/v1/replica/handshake`, { method: "GET" }, [200]);
    const value = json(result.bytes);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new RemoteHttpError(200, "remote handshake is invalid");
    }
    const input = value;
    if (!Number.isInteger(input["protocol"])) throw new RemoteHttpError(200, "remote handshake is missing protocol");
    if (input["protocol"] !== PROTOCOL_VERSION) {
      throw new RemoteHttpError(200, `remote protocol ${input["protocol"]} does not match client ${PROTOCOL_VERSION}`);
    }
    const capabilities = input["capabilities"];
    if (!Array.isArray(capabilities) || !capabilities.every((item) => typeof item === "string")) {
      throw new RemoteHttpError(200, "remote handshake capabilities are invalid");
    }
    if (!capabilities.includes("replicate")) {
      throw new RemoteHttpError(200, "remote does not advertise replica capability");
    }
    return Object.freeze({
      protocol: input["protocol"],
      server: typeof input["server"] === "string" ? input["server"] : "",
      capabilities: Object.freeze([...capabilities])
    });
  }
  async handshake() {
    return await this.#negotiate();
  }
  async identity() {
    const result = await this.#request(`${this.#origin}/api/v1/replica/identity`, { method: "GET" }, [200]);
    const input = json(result.bytes);
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      throw new RemoteHttpError(200, "remote identity is invalid");
    }
    try {
      const value = input;
      return Object.freeze({
        principalId: nonEmptyString(value["principalId"], "principalId"),
        replicaId: nonEmptyString(value["replicaId"], "replicaId")
      });
    } catch (cause) {
      throw new RemoteHttpError(200, "remote identity is invalid", { cause });
    }
  }
  async #negotiate(refresh2 = false) {
    if (refresh2) this.#ready = void 0;
    if (this.#ready !== void 0) return await this.#ready;
    let pending;
    pending = this.#handshake().catch((cause) => {
      if (this.#ready === pending) this.#ready = void 0;
      throw cause;
    });
    this.#ready = pending;
    return await pending;
  }
  async #request(url, init, accepted) {
    let response;
    try {
      response = await this.#fetch(url, { ...init, headers: { ...this.#headers, ...init.headers } });
    } catch (cause) {
      throw new RemoteHttpError(void 0, "remote request failed", { cause });
    }
    let bytes;
    try {
      bytes = await readBoundedBytes(response, this.#maximum);
    } catch (cause) {
      if (cause instanceof HttpBodyTooLarge) {
        throw new RemoteHttpError(response.status, "remote response is too large");
      }
      throw new RemoteHttpError(response.status, "remote response could not be read", { cause });
    }
    if (!accepted.includes(response.status)) {
      throw new RemoteHttpError(response.status, `remote request failed with HTTP ${response.status}`);
    }
    return { status: response.status, bytes };
  }
  async head(logId) {
    await this.#negotiate();
    const result = await this.#request(pathFor(this.#origin, logId, ["head"]), { method: "GET" }, [200]);
    const value = json(result.bytes);
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new RemoteHttpError(200, "remote head is invalid");
    try {
      return decodeNullablePosition(value["head"], "head", logId);
    } catch (cause) {
      throw new RemoteHttpError(200, "remote head is invalid", { cause });
    }
  }
  async has(position) {
    await this.#negotiate();
    const expected = decodeNullablePosition(position, "position");
    const result = await this.#request(
      pathFor(this.#origin, expected.logId, ["records", expected.recordId]),
      { method: "HEAD" },
      [204, 404]
    );
    return result.status === 204;
  }
  async read(logId, after, limit) {
    await this.#negotiate();
    nonEmptyString(logId, "logId");
    const cursor = decodeNullablePosition(after, "after", logId);
    if (!Number.isInteger(limit) || limit < 1) throw new TypeError("limit must be a positive integer");
    const query = new URLSearchParams({ limit: String(limit) });
    if (cursor !== null) query.set("after", cursor.recordId);
    const url = `${pathFor(this.#origin, logId, ["records"])}?${query.toString()}`;
    const result = await this.#request(url, { method: "GET" }, [200]);
    try {
      return decodePage(json(result.bytes), logId);
    } catch (cause) {
      throw new RemoteHttpError(200, "remote page is invalid", { cause });
    }
  }
  async append(logId, expectedHead, records2) {
    await this.#negotiate();
    nonEmptyString(logId, "logId");
    const expected = decodeNullablePosition(expectedHead, "expectedHead", logId);
    if (!Array.isArray(records2)) throw new TypeError("records must be an array");
    const result = await this.#request(pathFor(this.#origin, logId, ["records"]), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedHead: expected, records: records2 })
    }, [200, 409]);
    try {
      return decodeAppendResult(json(result.bytes), logId);
    } catch (cause) {
      throw new RemoteHttpError(result.status, "remote append result is invalid", { cause });
    }
  }
  subscribe(listener) {
    const controller = new AbortController();
    void this.#streamWithReconnect(controller, listener).catch(() => void 0);
    return () => {
      controller.abort();
    };
  }
  async #streamWithReconnect(controller, listener) {
    let attempt = 0;
    while (!controller.signal.aborted) {
      try {
        await this.#negotiate(attempt > 0);
        await this.#streamEvents(controller, listener);
        attempt = 0;
      } catch (cause) {
        if (controller.signal.aborted) return;
        if (!this.#isTransient(cause)) return;
        await this.#backoff(controller, attempt);
        attempt = Math.min(attempt + 1, 8);
        continue;
      }
      await this.#backoff(controller, attempt);
      attempt = Math.min(attempt + 1, 8);
    }
  }
  #isTransient(cause) {
    if (!(cause instanceof RemoteHttpError)) return true;
    if (cause.status === void 0) return true;
    return cause.status >= 500 || cause.status === 408 || cause.status === 429;
  }
  async #backoff(controller, attempt) {
    if (controller.signal.aborted) return;
    const base = 250;
    const max = 3e4;
    const delay = Math.min(max, base * 2 ** attempt);
    const jitter = Math.floor(Math.random() * 250);
    const total = delay + jitter;
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, total);
      controller.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
    });
  }
  async #streamEvents(controller, listener) {
    const url = `${this.#origin}/api/v1/replica/events`;
    let response;
    try {
      response = await this.#fetch(url, { headers: { ...this.#headers }, signal: controller.signal });
    } catch (cause) {
      throw new RemoteHttpError(void 0, "remote event stream failed", { cause });
    }
    if (response.status !== 200 || response.body === null) {
      throw new RemoteHttpError(response.status, `remote event stream returned HTTP ${response.status}`);
    }
    listener(Object.freeze({}));
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let separator;
        while ((separator = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, separator);
          buffer = buffer.slice(separator + 2);
          this.#dispatchEvent(raw, listener);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  #dispatchEvent(raw, listener) {
    for (const line of raw.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      try {
        const value = JSON.parse(line.slice(6));
        if (typeof value.logId === "string") listener(Object.freeze({ logId: value.logId }));
      } catch {
        return;
      }
      return;
    }
  }
};
function createHttpRemotePeer(options) {
  return new HttpRemotePeerImpl(options);
}

// apps/client/app/host.tsx
import { createElement } from "/libs/react.js";
import { createRoot } from "/libs/react.js";
function createModuleHost(options) {
  return Object.freeze({
    initialSource: async (release) => (await options.loader.load(release)).starter,
    mount: async (release, host) => {
      const course = await options.loader.load(release);
      const element = document.createElement("div");
      element.style.height = "100%";
      options.container.append(element);
      const root2 = createRoot(element);
      const Surface = course.Root;
      root2.render(createElement(Surface, {
        source: host.source,
        options: { bus: host.bus, session: null }
      }));
      return {
        dispose: () => {
          root2.unmount();
          element.remove();
        }
      };
    }
  });
}

// apps/client/impl/playground/zip-package.ts
var EOCD = 101010256;
var CENTRAL_FILE = 33639248;
var LOCAL_FILE = 67324752;
var MAX_COMMENT_BYTES = 65535;
var MAX_FILES = 1024;
var MAX_UNCOMPRESSED_BYTES = 8 * 1024 * 1024;
function unsigned(view, offset) {
  return view.getUint32(offset, true);
}
function safePath(raw) {
  if (raw === "" || raw.startsWith("/") || raw.includes("\\") || raw.includes("\0")) {
    throw new Error(`Unsafe package path: ${raw}`);
  }
  const parts = raw.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    throw new Error(`Unsafe package path: ${raw}`);
  }
  return raw;
}
function centralEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const minimum = Math.max(0, bytes.byteLength - 22 - MAX_COMMENT_BYTES);
  let end = -1;
  for (let offset2 = bytes.byteLength - 22; offset2 >= minimum; offset2 -= 1) {
    if (unsigned(view, offset2) === EOCD) {
      end = offset2;
      break;
    }
  }
  if (end < 0) throw new Error("Package is not a ZIP archive");
  if (view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0) {
    throw new Error("Multi-volume ZIP packages are not supported");
  }
  const count = view.getUint16(end + 10, true);
  const centralSize = unsigned(view, end + 12);
  const centralOffset = unsigned(view, end + 16);
  if (count > MAX_FILES || centralOffset + centralSize > end) throw new Error("Invalid ZIP directory");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const entries = [];
  const seen = /* @__PURE__ */ new Set();
  let offset = centralOffset;
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    if (offset + 46 > end || unsigned(view, offset) !== CENTRAL_FILE) {
      throw new Error("Invalid ZIP directory entry");
    }
    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const crc322 = unsigned(view, offset + 16);
    const compressedSize = unsigned(view, offset + 20);
    const size = unsigned(view, offset + 24);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = unsigned(view, offset + 42);
    const next = offset + 46 + nameLength + extraLength + commentLength;
    if (next > end || flags & 1 || ![0, 8].includes(method)) {
      throw new Error("Unsupported ZIP entry");
    }
    const path = safePath(decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength)));
    if (path.endsWith("/") || seen.has(path)) throw new Error(`Duplicate package path: ${path}`);
    seen.add(path);
    total += size;
    if (total > MAX_UNCOMPRESSED_BYTES) throw new Error("Package expands beyond 8 MiB");
    entries.push(Object.freeze({ path, method, crc32: crc322, compressedSize, size, localOffset }));
    offset = next;
  }
  if (offset !== centralOffset + centralSize) throw new Error("Invalid ZIP directory size");
  return Object.freeze(entries);
}
function crc32(bytes) {
  let value = 4294967295;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value >>> 1 ^ 3988292384 & -(value & 1);
    }
  }
  return (value ^ 4294967295) >>> 0;
}
async function inflate(bytes, maximum) {
  if (typeof DecompressionStream !== "function") {
    throw new Error("This host cannot decompress ZIP packages");
  }
  const reader = new Blob([Uint8Array.from(bytes).buffer]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader();
  const chunks = [];
  let size = 0;
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new Error("ZIP entry expands beyond its declared size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}
async function entryBytes(packageBytes, entry) {
  const view = new DataView(packageBytes.buffer, packageBytes.byteOffset, packageBytes.byteLength);
  const offset = entry.localOffset;
  if (offset + 30 > packageBytes.byteLength || unsigned(view, offset) !== LOCAL_FILE) {
    throw new Error(`Invalid ZIP entry: ${entry.path}`);
  }
  const nameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const start2 = offset + 30 + nameLength + extraLength;
  const end = start2 + entry.compressedSize;
  if (end > packageBytes.byteLength) throw new Error(`Truncated ZIP entry: ${entry.path}`);
  const localPath = new TextDecoder("utf-8", { fatal: true }).decode(packageBytes.subarray(offset + 30, offset + 30 + nameLength));
  if (localPath !== entry.path || view.getUint16(offset + 8, true) !== entry.method) {
    throw new Error(`ZIP entry metadata does not match: ${entry.path}`);
  }
  const compressed = packageBytes.subarray(start2, end);
  const result = entry.method === 0 ? compressed.slice() : await inflate(compressed, entry.size);
  if (result.byteLength !== entry.size || crc32(result) !== entry.crc32) {
    throw new Error(`Corrupt ZIP entry: ${entry.path}`);
  }
  return result;
}
function contentType(path) {
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".wasm")) return "application/wasm";
  return "application/octet-stream";
}
function moduleOf(value, label) {
  if (typeof value !== "object" || value === null) throw new TypeError(`${label} is not a course module`);
  const candidate = value;
  if (typeof candidate.starter !== "string") throw new TypeError(`${label} does not export the course starter source`);
  if (typeof candidate.Root !== "function") throw new TypeError(`${label} does not export Root`);
  return value;
}
function runtimeSource(source, runtimeBaseUrl2) {
  const replace = (_match, prefix, quote, path) => {
    if (path !== "pico.js" && path !== "world.js" && !path.startsWith("libs/")) {
      throw new Error(`Unsupported course runtime import: ../${path}`);
    }
    return `${prefix}${quote}${new URL(path, runtimeBaseUrl2).href}${quote}`;
  };
  return source.replace(/(\bfrom\s+)(["'])\.\.\/((?:libs\/)?[^"']+\.js)\2/g, replace).replace(/(\bimport\s+)(["'])\.\.\/((?:libs\/)?[^"']+\.js)\2/g, replace);
}
function assetSource(source, modulePath, assets) {
  const virtualUrl = new URL(modulePath, "https://package.invalid/").href;
  const prefix = [
    `const __picopgAssets = Object.freeze(${JSON.stringify(assets)});`,
    `const __picopgModuleUrl = ${JSON.stringify(virtualUrl)};`,
    "const __picopgUrl = (path, base) => {",
    "  if (base === import.meta.url) {",
    "    const key = new globalThis.URL(path, __picopgModuleUrl).pathname.slice(1);",
    "    const asset = __picopgAssets[key];",
    "    if (asset !== undefined) return new globalThis.URL(asset);",
    "  }",
    "  return new globalThis.URL(path, base);",
    "};"
  ].join("\n");
  return `${prefix}
${source.replaceAll("new URL(", "__picopgUrl(")}`;
}
async function loadZipPlaygroundModule(release, packageValue, options) {
  const entries = centralEntries(packageValue.bytes);
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  const manifestEntry = byPath.get("picopg.json");
  if (manifestEntry === void 0) throw new Error("Package is missing picopg.json");
  const manifestText = new TextDecoder("utf-8", { fatal: true }).decode(await entryBytes(packageValue.bytes, manifestEntry));
  const manifest = JSON.parse(manifestText);
  if (manifest.schemaVersion !== 1 || typeof manifest.module !== "string") {
    throw new Error("Package manifest does not declare a schemaVersion 1 module");
  }
  const modulePath = safePath(manifest.module);
  const moduleEntry = byPath.get(modulePath);
  if (moduleEntry === void 0 || !modulePath.endsWith(".js")) {
    throw new Error("Package module is missing");
  }
  const createObjectURL = options.createObjectURL ?? ((blob) => URL.createObjectURL(blob));
  const revokeObjectURL = options.revokeObjectURL ?? ((url) => URL.revokeObjectURL(url));
  const created = [];
  const createUrl = (blob) => {
    const url = createObjectURL(blob);
    created.push(url);
    return url;
  };
  try {
    const assets = {};
    for (const entry of entries) {
      if (entry.path === modulePath || entry.path === "picopg.json" || entry.path.endsWith("/index.html")) continue;
      assets[entry.path] = createUrl(new Blob(
        [Uint8Array.from(await entryBytes(packageValue.bytes, entry)).buffer],
        { type: contentType(entry.path) }
      ));
    }
    const source = new TextDecoder("utf-8", { fatal: true }).decode(await entryBytes(packageValue.bytes, moduleEntry));
    const rewritten = assetSource(runtimeSource(source, options.runtimeBaseUrl), modulePath, assets);
    const moduleUrl = createUrl(new Blob([rewritten], { type: "text/javascript" }));
    const importer = options.import ?? ((url) => import(url));
    return moduleOf(await importer(moduleUrl), `${release.playgroundId}@${release.versionId}`);
  } catch (error) {
    for (const url of created) revokeObjectURL(url);
    throw error;
  }
}

// apps/client/app/playgrounds.ts
function createPackageCache(packages) {
  const cache = /* @__PURE__ */ new Map();
  return Object.freeze({
    read: (release) => {
      const cached = cache.get(release.versionId);
      if (cached !== void 0) return cached;
      const pending = Promise.resolve().then(() => packages.read(release)).catch((error) => {
        cache.delete(release.versionId);
        throw error;
      });
      cache.set(release.versionId, pending);
      return pending;
    }
  });
}
function createPackageLoader(options) {
  const packages = createPackageCache(options.packages);
  const cache = /* @__PURE__ */ new Map();
  return Object.freeze({
    load: (release) => {
      const cached = cache.get(release.versionId);
      if (cached !== void 0) return cached;
      const pending = packages.read(release).then((packageValue) => {
        if (packageValue.mediaType !== "application/zip") {
          throw new Error(`Unsupported Playground package media type: ${packageValue.mediaType}`);
        }
        return loadZipPlaygroundModule(release, packageValue, options);
      }).catch((error) => {
        cache.delete(release.versionId);
        throw error;
      });
      cache.set(release.versionId, pending);
      return pending;
    }
  });
}

// apps/client/app/ui.tsx
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "/libs/react.js";
import { Fragment, jsx, jsxs } from "/libs/react.js";
var short = (versionId) => versionId.startsWith("sha256:") ? versionId.slice(7, 15) : versionId;
function useReadable(readable) {
  const subscribe = useCallback((listener) => readable.subscribe(listener), [readable]);
  return useSyncExternalStore(subscribe, () => readable.getSnapshot());
}
function draftLine(snapshot) {
  const active = snapshot.active;
  if (active.status !== "ready") return "";
  const draft = active.workspace.draft;
  if (draft.status === "empty") return "\u8FD8\u6CA1\u6709\u4FDD\u5B58\u8FC7";
  if (draft.status === "local") return "\u5DF2\u4FDD\u5B58\u5728\u8FD9\u53F0\u8BBE\u5907\uFF0C\u7B49\u5F85\u9996\u6B21\u540C\u6B65";
  if (draft.relation === "diverged") return "\u8FD9\u53F0\u8BBE\u5907\u548C\u5171\u4EAB\u7248\u672C\u90FD\u6709\u65B0\u4FEE\u6539";
  if (draft.writer === "anotherReplica") return "\u53E6\u4E00\u53F0\u8BBE\u5907\u6B63\u5728\u7EE7\u7EED\u8FD9\u4E2A\u7248\u672C";
  if (active.save.status === "dirty") return "\u6709\u5C1A\u672A\u4FDD\u5B58\u7684\u6539\u52A8";
  if (active.save.status === "saving") return "\u6B63\u5728\u4FDD\u5B58\u5230\u8FD9\u53F0\u8BBE\u5907\u2026";
  if (active.save.status === "failed") return `\u4FDD\u5B58\u5931\u8D25\uFF1A${active.save.message}`;
  return draft.relation === "behind" ? "\u6709\u65B0\u7684\u5171\u4EAB\u7248\u672C" : "\u672C\u5730\u7248\u672C\u5DF2\u4FDD\u5B58";
}
var syncLabel = (status) => ({
  unknown: "\u5C1A\u672A\u540C\u6B65",
  pending: "\u7B49\u5F85\u540C\u6B65",
  synced: "\u5DF2\u540C\u6B65",
  unavailable: "\u79BB\u7EBF",
  blocked: "\u540C\u6B65\u53D7\u963B"
})[status] ?? status;
var submissionLabel = (status) => ({
  requested: "\u5904\u7406\u4E2D",
  completed: "\u5DF2\u5B8C\u6210",
  failed: "\u5931\u8D25"
})[status] ?? status;
function App({ client, workspaces, container, identity, signOut }) {
  const catalog = useReadable(client.playgrounds);
  const feedback = useReadable(client.feedback);
  const snapshot = useReadable(workspaces.state);
  const host = useRef(null);
  const [notice, setNotice] = useState(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeSource, setMergeSource] = useState("");
  useEffect(() => {
    if (host.current !== null && container.parentElement !== host.current) host.current.append(container);
  }, [container]);
  const active = snapshot.active;
  const activeId = snapshot.activePlaygroundId;
  const release = (candidate) => `${candidate.playgroundId}@${short(candidate.versionId)}`;
  const perform = (operation) => {
    setNotice(null);
    void Promise.resolve().then(operation).catch((error) => {
      setNotice(error instanceof Error ? error.message : String(error));
    });
  };
  const ready = active.status === "ready" ? active : null;
  const draft = ready?.workspace.draft.status === "ready" ? ready.workspace.draft : null;
  const conflict = draft !== null && (draft.relation === "diverged" || draft.writer === "anotherReplica");
  const canUseShared = draft?.localSource !== null && draft?.relation !== "same";
  const canMerge = draft?.relation === "diverged" && draft.commonBaseSource !== null && draft.localSource !== null;
  const sync = ready?.workspace.sync;
  const history = ready?.workspace.submissions;
  const currentFeedback = ready === null ? void 0 : feedback.entries.find((entry) => entry.subject.playgroundId === ready.workspace.playgroundId && entry.subject.versionId === ready.workspace.release.versionId && entry.subject.exerciseKey === void 0);
  const feedbackUnavailable = feedback.unavailable || currentFeedback?.unavailable === true;
  const busy = ready?.save.status === "saving" || ready?.workspace.submitting === true;
  useEffect(() => {
    setMergeOpen(false);
    setNotice(null);
  }, [activeId]);
  useEffect(() => {
    const status = ready?.save.status;
    if (status !== "dirty" && status !== "saving" && status !== "failed") return;
    const beforeUnload = (event4) => {
      event4.preventDefault();
      event4.returnValue = "";
    };
    const saveWhenHidden = () => {
      if (document.visibilityState !== "hidden") return;
      void workspaces.save().catch((error) => {
        setNotice(error instanceof Error ? error.message : String(error));
      });
    };
    window.addEventListener("beforeunload", beforeUnload);
    if (status === "dirty") document.addEventListener("visibilitychange", saveWhenHidden);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("visibilitychange", saveWhenHidden);
    };
  }, [ready?.save.status, workspaces]);
  return /* @__PURE__ */ jsxs("div", { className: "client-shell", children: [
    /* @__PURE__ */ jsxs("header", { className: "pico-topbar client-topbar", children: [
      /* @__PURE__ */ jsxs("div", { className: "pico-topbar-left", children: [
        /* @__PURE__ */ jsx("span", { className: "pico-topbar-brand", children: "Pico" }),
        /* @__PURE__ */ jsx("span", { className: "client-identity", title: `${identity.principalId} \xB7 ${identity.replicaId}`, children: identity.principalId })
      ] }),
      sync !== void 0 && /* @__PURE__ */ jsx("span", { className: "client-sync", "data-status": sync.status, role: "status", children: syncLabel(sync.status) }),
      /* @__PURE__ */ jsx("button", { className: "pico-ghost-btn", type: "button", onClick: () => perform(signOut), children: "\u9000\u51FA" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "client-catalog", "aria-label": "\u8BFE\u7A0B", children: [
      /* @__PURE__ */ jsx("strong", { children: "\u8BFE\u7A0B" }),
      catalog.status === "loading" && /* @__PURE__ */ jsx("span", { role: "status", children: "\u6B63\u5728\u8BFB\u53D6\u8BFE\u7A0B\u2026" }),
      catalog.status === "failed" && /* @__PURE__ */ jsxs("span", { className: "client-inline-error", role: "alert", children: [
        "\u76EE\u5F55\u52A0\u8F7D\u5931\u8D25\uFF1A",
        catalog.message
      ] }),
      catalog.releases.map((candidate) => {
        const opened = snapshot.open.find((workspace) => workspace.playgroundId === candidate.playgroundId);
        const current = opened?.release.versionId === candidate.versionId;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            className: "client-button",
            type: "button",
            disabled: current,
            onClick: () => perform(() => opened === void 0 ? workspaces.open(candidate) : workspaces.update(candidate)),
            children: [
              opened !== void 0 && !current ? "\u66F4\u65B0\u81F3 " : "",
              candidate.title ?? candidate.playgroundId,
              "\uFF08",
              short(candidate.versionId),
              "\uFF09"
            ]
          },
          candidate.playgroundId
        );
      }),
      catalog.status === "failed" && /* @__PURE__ */ jsx("button", { className: "client-button", type: "button", onClick: () => client.retrySync(), children: "\u91CD\u8BD5" })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "client-tabs", "aria-label": "\u6253\u5F00\u7684\u5DE5\u4F5C\u533A", children: [
      snapshot.open.length === 0 && /* @__PURE__ */ jsx("span", { children: "\u9009\u62E9\u4E00\u95E8\u8BFE\u7A0B\u5F00\u59CB" }),
      snapshot.open.map((workspace) => /* @__PURE__ */ jsxs("span", { className: "client-tab", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "client-tab-main",
            type: "button",
            "aria-current": workspace.playgroundId === activeId ? "page" : void 0,
            onClick: () => perform(() => workspaces.activate(workspace.playgroundId)),
            children: release(workspace.release)
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "client-tab-close",
            type: "button",
            "aria-label": `\u5173\u95ED ${workspace.release.title ?? workspace.playgroundId}`,
            onClick: () => perform(() => workspaces.close(workspace.playgroundId)),
            children: "\u5173\u95ED"
          }
        )
      ] }, workspace.playgroundId))
    ] }),
    /* @__PURE__ */ jsx("main", { className: "client-workspace", ref: host }),
    /* @__PURE__ */ jsxs("footer", { className: "client-dock", children: [
      notice !== null && /* @__PURE__ */ jsxs("div", { className: "client-alert", role: "alert", children: [
        /* @__PURE__ */ jsx("span", { children: notice }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setNotice(null), children: "\u77E5\u9053\u4E86" })
      ] }),
      sync?.status === "unavailable" && /* @__PURE__ */ jsxs("div", { className: "client-offline", role: "status", children: [
        /* @__PURE__ */ jsx("span", { children: "\u73B0\u5728\u5904\u4E8E\u79BB\u7EBF\u72B6\u6001\u3002\u4FDD\u5B58\u4ECD\u4F1A\u5199\u5165\u8FD9\u53F0\u8BBE\u5907\uFF0C\u8054\u7F51\u540E\u53EF\u4EE5\u7EE7\u7EED\u540C\u6B65\u3002" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => client.retrySync(), children: "\u91CD\u8BD5\u540C\u6B65" })
      ] }),
      sync?.status === "blocked" && /* @__PURE__ */ jsxs("div", { className: "client-alert", role: "alert", children: [
        "\u540C\u6B65\u5DF2\u505C\u6B62\uFF1A",
        sync.message
      ] }),
      (currentFeedback !== void 0 || feedbackUnavailable) && /* @__PURE__ */ jsxs("section", { className: "client-feedback", "aria-labelledby": "learning-feedback-title", children: [
        /* @__PURE__ */ jsxs("div", { className: "client-feedback-heading", children: [
          /* @__PURE__ */ jsx("strong", { id: "learning-feedback-title", children: "\u5B66\u4E60\u53CD\u9988" }),
          feedbackUnavailable && /* @__PURE__ */ jsx("span", { role: "status", children: "\u5206\u6790\u6682\u4E0D\u53EF\u7528" })
        ] }),
        currentFeedback?.result !== null && currentFeedback?.result !== void 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { children: currentFeedback.result.summary }),
          currentFeedback.hasNewLocalEvidence && /* @__PURE__ */ jsx("p", { role: "status", children: "\u5DF2\u6709\u65B0\u7684\u672C\u673A\u5B66\u4E60\u8BB0\u5F55\uFF0C\u53CD\u9988\u53EF\u80FD\u9700\u8981\u66F4\u65B0\u3002" }),
          currentFeedback.result.findings.length > 0 && /* @__PURE__ */ jsx("ul", { children: currentFeedback.result.findings.map((finding, index) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: finding.topic.label }),
            "\uFF1A",
            finding.claim
          ] }, `${finding.topic.key}:${index}`)) }),
          currentFeedback.result.recommendations.length > 0 && /* @__PURE__ */ jsx("ol", { children: currentFeedback.result.recommendations.map((recommendation, index) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: recommendation.topic.label }),
            "\uFF1A",
            recommendation.rationale
          ] }, `${recommendation.topic.key}:${index}`)) }),
          currentFeedback.result.limitations.map((limitation, index) => /* @__PURE__ */ jsxs("p", { children: [
            "\u9650\u5236\uFF1A",
            limitation
          ] }, index))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "client-actions", children: [
        /* @__PURE__ */ jsxs("div", { className: "client-state", children: [
          /* @__PURE__ */ jsx("strong", { children: active.status === "ready" ? draftLine(snapshot) : active.status === "opening" ? "\u6B63\u5728\u6253\u5F00\u5DE5\u4F5C\u533A\u2026" : active.status === "failed" ? `\u6253\u5F00\u5931\u8D25\uFF1A${active.message}` : "\u8FD8\u6CA1\u6709\u6253\u5F00\u8BFE\u7A0B" }),
          ready !== null && /* @__PURE__ */ jsx("span", { children: ready.workspace.submitting ? "\u6B63\u5728\u63D0\u4EA4\u2026" : ready.workspace.submissionFailure !== null ? `\u63D0\u4EA4\u5931\u8D25\uFF1A${ready.workspace.submissionFailure}` : ready.workspace.evidenceFailure !== null ? `\u63D0\u4EA4\u5DF2\u8BB0\u5F55\uFF1B\u5B66\u4E60\u5206\u6790\u8BB0\u5F55\u5931\u8D25\uFF1A${ready.workspace.evidenceFailure}` : history?.status === "loading" ? "\u6B63\u5728\u8BFB\u53D6\u63D0\u4EA4\u8BB0\u5F55\u2026" : history?.status === "failed" ? `\u63D0\u4EA4\u8BB0\u5F55\u8BFB\u53D6\u5931\u8D25\uFF1A${history.message}` : `\u63D0\u4EA4\u8BB0\u5F55\uFF1A${history?.submissions.length ?? 0} \u6761` })
        ] }),
        ready !== null && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("button", { className: "client-button", type: "button", disabled: busy, onClick: () => perform(workspaces.save), children: "\u4FDD\u5B58" }),
          /* @__PURE__ */ jsx("button", { className: "client-button", type: "button", disabled: busy, onClick: () => perform(workspaces.discard), children: "\u653E\u5F03\u672A\u4FDD\u5B58\u6539\u52A8" }),
          /* @__PURE__ */ jsx("button", { className: "client-button client-button-primary", type: "button", disabled: busy, onClick: () => perform(workspaces.submit), children: "\u63D0\u4EA4" })
        ] })
      ] }),
      conflict && draft !== null && /* @__PURE__ */ jsxs("section", { className: "client-conflict", "aria-labelledby": "conflict-title", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { id: "conflict-title", children: "\u9700\u8981\u9009\u62E9\u7EE7\u7EED\u65B9\u5F0F" }),
          /* @__PURE__ */ jsx("p", { children: "\u4F60\u7684\u7248\u672C\u4E0D\u4F1A\u88AB\u5220\u9664\u3002\u8BF7\u9009\u62E9\u5171\u4EAB\u7248\u672C\uFF0C\u6216\u8005\u8BA9\u8FD9\u53F0\u8BBE\u5907\u63A5\u7BA1\u5E76\u7EE7\u7EED\u3002" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "client-conflict-actions", children: [
          canUseShared && /* @__PURE__ */ jsx("button", { className: "client-button", type: "button", onClick: () => perform(workspaces.useShared), children: "\u4F7F\u7528\u5171\u4EAB\u7248\u672C" }),
          draft.localSource !== null && /* @__PURE__ */ jsx("button", { className: "client-button", type: "button", onClick: () => perform(workspaces.continueHere), children: "\u5728\u6B64\u8BBE\u5907\u7EE7\u7EED" }),
          canMerge && /* @__PURE__ */ jsx("button", { className: "client-button", type: "button", onClick: () => {
            setMergeSource(draft.localSource ?? "");
            setMergeOpen(true);
          }, children: "\u6BD4\u8F83\u5E76\u5408\u5E76" })
        ] })
      ] }),
      mergeOpen && draft !== null && /* @__PURE__ */ jsxs("section", { className: "client-merge", "aria-labelledby": "merge-title", children: [
        /* @__PURE__ */ jsxs("div", { className: "client-merge-heading", children: [
          /* @__PURE__ */ jsx("strong", { id: "merge-title", children: "\u6BD4\u8F83\u5E76\u5408\u5E76" }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMergeOpen(false), children: "\u53D6\u6D88" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "client-comparison", children: [
          /* @__PURE__ */ jsxs("label", { children: [
            "\u8FD9\u53F0\u8BBE\u5907",
            /* @__PURE__ */ jsx("pre", { children: draft.localSource })
          ] }),
          /* @__PURE__ */ jsxs("label", { children: [
            "\u5171\u4EAB\u7248\u672C",
            /* @__PURE__ */ jsx("pre", { children: draft.sharedSource })
          ] })
        ] }),
        /* @__PURE__ */ jsx("label", { htmlFor: "merged-source", children: "\u5408\u5E76\u540E\u7684\u6E90\u7801" }),
        /* @__PURE__ */ jsx("textarea", { id: "merged-source", value: mergeSource, onChange: (event4) => setMergeSource(event4.currentTarget.value) }),
        /* @__PURE__ */ jsx("button", { className: "client-button client-button-primary", type: "button", onClick: () => perform(async () => {
          await workspaces.merge(mergeSource);
          setMergeOpen(false);
        }), children: "\u4FDD\u5B58\u5408\u5E76\u5E76\u5728\u6B64\u7EE7\u7EED" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "client-submissions", "aria-labelledby": "submissions-title", children: [
        /* @__PURE__ */ jsxs("div", { className: "client-submissions-heading", children: [
          /* @__PURE__ */ jsx("strong", { id: "submissions-title", children: "\u63D0\u4EA4\u8BB0\u5F55" }),
          history?.status === "failed" && /* @__PURE__ */ jsx("button", { className: "client-button", type: "button", onClick: () => perform(() => client.submissions.refresh()), children: "\u91CD\u8BD5" })
        ] }),
        history?.status === "loading" && /* @__PURE__ */ jsx("p", { role: "status", children: "\u6B63\u5728\u8BFB\u53D6\u63D0\u4EA4\u8BB0\u5F55\u2026" }),
        history?.status !== "loading" && history?.submissions.length === 0 && /* @__PURE__ */ jsx("p", { children: "\u8FD8\u6CA1\u6709\u63D0\u4EA4\u8BB0\u5F55\u3002" }),
        history !== void 0 && history.submissions.length > 0 && /* @__PURE__ */ jsx("ol", { children: history.submissions.map((submission) => /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsxs("div", { className: "client-submission-heading", children: [
            /* @__PURE__ */ jsx("strong", { children: submissionLabel(submission.status) }),
            submission.status === "completed" && /* @__PURE__ */ jsx("span", { children: submission.tag }),
            submission.status === "failed" && /* @__PURE__ */ jsx("span", { children: submission.message })
          ] }),
          submission.comments.length === 0 ? /* @__PURE__ */ jsx("p", { children: "\u8FD9\u6B21\u63D0\u4EA4\u8FD8\u6CA1\u6709\u8BC4\u8BED\u3002" }) : /* @__PURE__ */ jsx("ul", { children: submission.comments.map((comment, index) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: comment.author }),
            /* @__PURE__ */ jsx("span", { children: comment.text })
          ] }, `${index}:${comment.author}:${comment.text}`)) })
        ] }, submission.id)) })
      ] })
    ] })
  ] });
}

// apps/client/app/workspaces.ts
import { createState as createState6 } from "/pico.js";

// apps/client/impl/workspace-bridge.ts
var nextCorrelationId = 0;
function createWorkspaceBridge(port, source) {
  let cursor = Object.freeze({ version: 0, source });
  let baseSource = source;
  let disposed = false;
  const pending = /* @__PURE__ */ new Map();
  const unsubscribe = port.subscribe((change) => {
    if (disposed) return;
    const operation = change.correlationId === void 0 ? void 0 : pending.get(change.correlationId);
    if (change.correlationId !== void 0 && !operation) return;
    cursor = Object.freeze({ version: cursor.version + 1, source: change.source });
    if (!operation) return;
    pending.delete(change.correlationId);
    if (change.source !== operation.source) {
      operation.reject(new Error("Source replacement acknowledgement did not match the requested source"));
      return;
    }
    baseSource = operation.base;
    operation.resolve(cursor);
  });
  return {
    getSnapshot: () => cursor,
    getBaseSource: () => baseSource,
    replace: (source2, base = source2) => {
      if (disposed) return Promise.reject(new Error("Workspace bridge is disposed"));
      if (pending.size > 0) return Promise.reject(new Error("Source replacement is already in progress"));
      const correlationId = `workspace-bridge-${++nextCorrelationId}`;
      return new Promise((resolve, reject) => {
        pending.set(correlationId, { source: source2, base, resolve, reject });
        try {
          port.replace(Object.freeze({ source: source2, correlationId }));
        } catch (error) {
          pending.delete(correlationId);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
    markSaved: (saved) => {
      if (disposed) return false;
      baseSource = saved.source;
      return cursor.version === saved.version;
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      for (const operation of pending.values()) operation.reject(new Error("Workspace bridge is disposed"));
      pending.clear();
    }
  };
}

// apps/client/app/workspaces.ts
var CLOSED = Object.freeze({ status: "closed" });
var AUTOSAVE_IDLE_MS = 2e3;
var AUTOSAVE_MAX_MS = 3e4;
function message3(cause) {
  return cause instanceof Error ? cause.message : String(cause);
}
function readCursor(session2) {
  if (session2 === void 0) return { open: [], active: null };
  try {
    const raw = session2.storage.getItem(session2.key);
    if (raw === null) return { open: [], active: null };
    const value = JSON.parse(raw);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return { open: [], active: null };
    const input = value;
    const open = input["open"];
    if (!Array.isArray(open) || !open.every((item) => typeof item === "string" && item.length > 0)) {
      return { open: [], active: null };
    }
    const active = input["active"];
    if (active !== null && (typeof active !== "string" || active.length === 0)) return { open: [], active: null };
    return { open: Object.freeze([...new Set(open)]), active };
  } catch {
    return { open: [], active: null };
  }
}
function createWorkspaces(options) {
  const { client, bus, host, session: session2 } = options;
  const cursor = readCursor(session2);
  const state = createState6(Object.freeze({
    open: Object.freeze([]),
    activePlaygroundId: null,
    active: CLOSED
  }));
  const records2 = /* @__PURE__ */ new Map();
  const starters = /* @__PURE__ */ new Map();
  let active = null;
  let opening = null;
  let failure = null;
  let pendingShared = false;
  let busy = false;
  let disposed = false;
  let idleSave;
  let maximumSave;
  let saveTask = null;
  let restoring = session2 !== void 0;
  let persistedCursor = null;
  const cancelAutosave = () => {
    if (idleSave !== void 0) clearTimeout(idleSave);
    if (maximumSave !== void 0) clearTimeout(maximumSave);
    idleSave = void 0;
    maximumSave = void 0;
  };
  const runAutosave = () => {
    cancelAutosave();
    if (disposed || active === null) return;
    void save().catch(() => void 0);
  };
  const scheduleAutosave = () => {
    if (disposed || active === null) return;
    if (active.bridge.getSnapshot().source === active.bridge.getBaseSource()) {
      cancelAutosave();
      return;
    }
    if (idleSave !== void 0) clearTimeout(idleSave);
    idleSave = setTimeout(runAutosave, AUTOSAVE_IDLE_MS);
    maximumSave ??= setTimeout(runAutosave, AUTOSAVE_MAX_MS);
  };
  const requireRelease = (release) => {
    if (typeof release?.playgroundId !== "string" || release.playgroundId.length === 0 || typeof release.versionId !== "string" || release.versionId.length === 0) {
      throw new TypeError("release must carry a playgroundId and a versionId");
    }
    const known = client.playgrounds.getSnapshot().releases.find((item) => item.playgroundId === release.playgroundId);
    if (known === void 0 || known.versionId !== release.versionId) {
      throw new Error(`${release.playgroundId}@${release.versionId} is not the current Release`);
    }
    return release;
  };
  const saveStatusOf = (current) => {
    if (current.saving) return Object.freeze({ status: "saving" });
    if (current.failure !== null) return Object.freeze({ status: "failed", message: current.failure });
    const cursor2 = current.bridge.getSnapshot();
    if (cursor2.source === current.bridge.getBaseSource()) {
      return current.origin === "package" && cursor2.source === current.startSource ? Object.freeze({ status: "pristine" }) : Object.freeze({ status: "clean" });
    }
    return Object.freeze({ status: "dirty" });
  };
  const submissionHistoryOf = (playgroundId) => {
    const current = client.submissions.getSnapshot();
    const submissions = Object.freeze(current.submissions.filter((item) => item.playgroundId === playgroundId));
    return current.status === "failed" ? Object.freeze({ status: current.status, submissions, message: current.message }) : Object.freeze({ status: current.status, submissions });
  };
  const summaryOf = (record) => Object.freeze({
    playgroundId: record.release.playgroundId,
    release: record.release,
    draft: record.attachment.getSnapshot(),
    sync: record.attachment.sync.getSnapshot(),
    submissions: submissionHistoryOf(record.release.playgroundId),
    submitting: record.submitting,
    submissionFailure: record.submissionFailure,
    evidenceFailure: record.evidenceFailure
  });
  const activeSnapshot = () => {
    if (opening !== null) return Object.freeze({ status: "opening", release: opening });
    if (failure !== null) {
      return Object.freeze({ status: "failed", release: failure.release, message: failure.message });
    }
    if (active === null) return CLOSED;
    const record = records2.get(active.playgroundId);
    return Object.freeze({
      status: "ready",
      workspace: summaryOf(record),
      save: saveStatusOf(active)
    });
  };
  const publish = () => {
    state.set(Object.freeze({
      open: Object.freeze([...records2.values()].map(summaryOf)),
      activePlaygroundId: active?.playgroundId ?? null,
      active: activeSnapshot()
    }));
    if (session2 === void 0 || restoring || disposed) return;
    const serialized = JSON.stringify({
      open: [...records2.keys()],
      active: active?.playgroundId ?? null
    });
    if (serialized === persistedCursor) return;
    try {
      session2.storage.setItem(session2.key, serialized);
      persistedCursor = serialized;
    } catch {
    }
  };
  const stopSubmissions = client.submissions.subscribe(publish);
  const createPort = () => {
    let pending = null;
    return Object.freeze({
      subscribe: (receive) => bus.subscribe(
        ["editor.changed"],
        (event4) => {
          let replaced = false;
          if (pending !== null && event4.source === pending.source) {
            const correlationId = pending.correlationId;
            replaced = true;
            pending = null;
            receive({ source: event4.source, correlationId });
          } else {
            receive({ source: event4.source });
          }
          publish();
          if (!replaced) scheduleAutosave();
        }
      ),
      replace: (command) => {
        if (pending !== null) throw new Error("Source replacement is already in progress");
        pending = command;
        try {
          bus.emit({ type: "editor.changed", source: command.source }, "workspace");
        } catch (error) {
          pending = null;
          throw error;
        }
      }
    });
  };
  const requireActive = () => {
    if (active === null) throw new Error("No workspace is active");
    return active;
  };
  const assertSwitchable = () => {
    if (active === null) return;
    const status = saveStatusOf(active).status;
    if (status === "dirty" || status === "saving" || status === "failed") {
      throw new Error(`The active workspace has unsaved edits (${status})`);
    }
  };
  const teardownActive = () => {
    if (active === null) return;
    cancelAutosave();
    active.surface.dispose();
    active.bridge.dispose();
    active = null;
  };
  const track = (release) => {
    const attachment = client.attachDraft(release.playgroundId);
    const record = {
      release,
      attachment,
      submitting: false,
      submissionFailure: null,
      evidenceFailure: null,
      stop: Object.freeze([
        attachment.subscribe(publish),
        attachment.sync.subscribe(publish)
      ])
    };
    records2.set(release.playgroundId, record);
    return record;
  };
  const activate = async (playgroundId) => {
    if (disposed) throw new Error("workspaces are disposed");
    const record = records2.get(playgroundId);
    if (record === void 0) throw new Error(`${playgroundId} is not open`);
    if (active?.playgroundId === playgroundId) return;
    if (busy) throw new Error("Another workspace operation is in progress");
    assertSwitchable();
    busy = true;
    teardownActive();
    opening = record.release;
    failure = null;
    publish();
    try {
      const startSource = starters.get(playgroundId) ?? await host.initialSource(record.release);
      starters.set(playgroundId, startSource);
      await record.attachment.ready;
      const snapshot = record.attachment.getSnapshot();
      const local = snapshot.status === "ready" ? snapshot.localSource : snapshot.status === "local" ? snapshot.localSource : null;
      const shared = snapshot.status === "ready" ? snapshot.sharedSource : null;
      const origin = local !== null ? "local" : shared !== null ? "shared" : "package";
      const source = local ?? shared ?? startSource;
      const bridge = createWorkspaceBridge(createPort(), source);
      let surface;
      try {
        surface = await host.mount(record.release, { bus, source });
      } catch (error) {
        bridge.dispose();
        throw error;
      }
      if (disposed) {
        surface.dispose();
        bridge.dispose();
        return;
      }
      active = { playgroundId, bridge, surface, startSource, origin, saving: false, failure: null };
      opening = null;
      record.attachment.editing(origin);
    } catch (error) {
      opening = null;
      failure = { release: record.release, message: message3(error) };
    } finally {
      busy = false;
      publish();
    }
  };
  const open = async (release) => {
    await ready;
    if (disposed) throw new Error("workspaces are disposed");
    requireRelease(release);
    const existing = records2.get(release.playgroundId);
    if (existing !== void 0) {
      if (existing.release.versionId !== release.versionId) {
        throw new Error(`${release.playgroundId} is already open at another Release`);
      }
      await activate(release.playgroundId);
      return;
    }
    if (busy) throw new Error("Another workspace operation is in progress");
    assertSwitchable();
    await client.ready;
    track(release);
    void client.submissions.refresh().catch(() => void 0);
    await activate(release.playgroundId);
  };
  const ready = (async () => {
    if (session2 === void 0) return;
    try {
      await client.ready;
      const releases = new Map(
        client.playgrounds.getSnapshot().releases.map((release) => [release.playgroundId, release])
      );
      for (const playgroundId of cursor.open) {
        const release = releases.get(playgroundId);
        if (release !== void 0) track(release);
      }
      if (cursor.active !== null && records2.has(cursor.active)) await activate(cursor.active);
    } finally {
      restoring = false;
      publish();
    }
  })();
  const update = async (release) => {
    if (disposed) throw new Error("workspaces are disposed");
    requireRelease(release);
    const record = records2.get(release.playgroundId);
    if (record === void 0) throw new Error(`${release.playgroundId} is not open`);
    if (record.release.versionId === release.versionId) return;
    if (busy) throw new Error("Another workspace operation is in progress");
    if (active?.playgroundId !== release.playgroundId) {
      record.release = release;
      starters.delete(release.playgroundId);
      publish();
      return;
    }
    assertSwitchable();
    busy = true;
    const previous = active;
    opening = release;
    publish();
    try {
      const startSource = await host.initialSource(release);
      const source = previous.origin === "package" ? startSource : previous.bridge.getSnapshot().source;
      const origin = previous.origin === "package" ? "package" : previous.origin;
      const bridge = createWorkspaceBridge(createPort(), source);
      let surface;
      try {
        surface = await host.mount(release, { bus, source });
      } catch (error) {
        bridge.dispose();
        throw error;
      }
      previous.surface.dispose();
      previous.bridge.dispose();
      record.release = release;
      starters.set(release.playgroundId, startSource);
      active = {
        playgroundId: release.playgroundId,
        bridge,
        surface,
        startSource,
        origin,
        saving: false,
        failure: null
      };
      record.attachment.editing(origin);
    } finally {
      opening = null;
      busy = false;
      publish();
    }
  };
  const close = async (playgroundId) => {
    if (disposed) throw new Error("workspaces are disposed");
    const record = records2.get(playgroundId);
    if (record === void 0) return;
    if (busy) throw new Error("Another workspace operation is in progress");
    if (active?.playgroundId === playgroundId) assertSwitchable();
    busy = true;
    try {
      if (active?.playgroundId === playgroundId) teardownActive();
      for (const stop of record.stop) stop();
      record.attachment.dispose();
      records2.delete(playgroundId);
      starters.delete(playgroundId);
    } finally {
      busy = false;
      publish();
    }
  };
  async function save() {
    let force = true;
    for (; ; ) {
      if (saveTask !== null) {
        await saveTask;
        force = false;
        continue;
      }
      const current = requireActive();
      const cursor2 = current.bridge.getSnapshot();
      if (!force && cursor2.source === current.bridge.getBaseSource()) return;
      force = false;
      cancelAutosave();
      const record = records2.get(current.playgroundId);
      current.saving = true;
      current.failure = null;
      publish();
      const pending = record.attachment.save(cursor2.source).then(
        () => {
          current.saving = false;
          current.bridge.markSaved(cursor2);
          current.origin = "local";
          publish();
        },
        (error) => {
          current.saving = false;
          current.failure = message3(error);
          publish();
          throw error;
        }
      );
      saveTask = pending;
      try {
        await pending;
      } finally {
        if (saveTask === pending) saveTask = null;
      }
    }
  }
  const applySource = async (source, origin) => {
    const current = requireActive();
    cancelAutosave();
    await current.bridge.replace(source);
    current.origin = origin;
    records2.get(current.playgroundId).attachment.editing(origin);
    publish();
  };
  const discard = async () => {
    const current = requireActive();
    const snapshot = records2.get(current.playgroundId).attachment.getSnapshot();
    const local = snapshot.status === "ready" ? snapshot.localSource : snapshot.status === "local" ? snapshot.localSource : null;
    current.failure = null;
    await applySource(local ?? current.startSource, local === null ? "package" : "local");
  };
  const submit = async () => {
    const current = requireActive();
    const record = records2.get(current.playgroundId);
    if (record.submitting) {
      throw new Error("A submission is already in progress");
    }
    if (saveStatusOf(current).status === "dirty") await save();
    record.submitting = true;
    record.submissionFailure = null;
    record.evidenceFailure = null;
    publish();
    try {
      const request3 = await record.attachment.submit();
      try {
        await client.evidence.record(
          { playgroundId: record.release.playgroundId, versionId: record.release.versionId },
          {
            schema: "learning.submission.requested",
            version: 1,
            data: { request: { logId: request3.logId, recordId: request3.recordId } }
          },
          [request3]
        );
      } catch (error) {
        record.evidenceFailure = message3(error);
      }
    } catch (error) {
      record.submissionFailure = message3(error);
      throw error;
    } finally {
      record.submitting = false;
      publish();
    }
    void client.submissions.refresh().catch(() => void 0);
    publish();
  };
  const useShared = () => {
    const current = requireActive();
    pendingShared = true;
    records2.get(current.playgroundId).attachment.useShared();
  };
  const continueHere2 = () => {
    const current = requireActive();
    records2.get(current.playgroundId).attachment.continueHere();
  };
  const merge = async (source) => {
    const current = requireActive();
    cancelAutosave();
    await current.bridge.replace(source);
    current.bridge.markSaved(current.bridge.getSnapshot());
    records2.get(current.playgroundId).attachment.merge(source);
    publish();
  };
  const ignoreAfterDispose = (error) => {
    if (disposed) return;
    queueMicrotask(() => {
      throw error;
    });
  };
  const stopDraft = bus.subscribe(
    ["draft.shared", "draft.actionFailed"],
    (event4) => {
      if (active === null || event4.draftId !== active.playgroundId) return;
      if (event4.type === "draft.actionFailed") {
        pendingShared = false;
        active.failure = event4.message ?? "Draft action failed";
        publish();
        return;
      }
      if (event4.source === void 0) return;
      const status = saveStatusOf(active).status;
      if (!pendingShared && status !== "pristine" && status !== "clean") return;
      pendingShared = false;
      void applySource(event4.source, "shared").catch(ignoreAfterDispose);
    }
  );
  return Object.freeze({
    state,
    ready,
    open,
    update,
    activate,
    close,
    discard,
    save,
    submit,
    useShared,
    continueHere: continueHere2,
    merge,
    dispose: async () => {
      if (disposed) return;
      disposed = true;
      cancelAutosave();
      stopSubmissions();
      teardownActive();
      stopDraft();
      for (const record of records2.values()) {
        for (const stop of record.stop) stop();
        record.attachment.dispose();
      }
      records2.clear();
      starters.clear();
      publish();
    }
  });
}

// apps/client/app/session.ts
var MAX_SESSION_RESPONSE_BYTES = 64 * 1024;
var SessionHttpError = class extends Error {
  constructor(status, message4) {
    super(message4);
    this.status = status;
    this.name = "SessionHttpError";
  }
  status;
};
function identityOf(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Session returned an invalid identity");
  }
  const input = value;
  if (typeof input["principalId"] !== "string" || input["principalId"].length === 0 || typeof input["replicaId"] !== "string" || input["replicaId"].length === 0) {
    throw new Error("Session returned an invalid identity");
  }
  return Object.freeze({ principalId: input["principalId"], replicaId: input["replicaId"] });
}
async function request2(fetch2, path, init) {
  let response;
  try {
    response = await fetch2(path, { ...init, credentials: "same-origin", cache: "no-store" });
  } catch (cause) {
    throw new Error("\u65E0\u6CD5\u8FDE\u63A5\u670D\u52A1\u5668", { cause });
  }
  if (!response.ok) {
    const message4 = response.status === 401 ? "\u8BBF\u95EE\u7801\u65E0\u6548\uFF0C\u6216\u4F1A\u8BDD\u5DF2\u7ECF\u8FC7\u671F" : response.status === 429 ? "\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5" : response.status >= 500 ? "\u670D\u52A1\u5668\u6682\u65F6\u65E0\u6CD5\u5EFA\u7ACB\u4F1A\u8BDD\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5" : `\u65E0\u6CD5\u5EFA\u7ACB\u4F1A\u8BDD\uFF08HTTP ${response.status}\uFF09`;
    throw new SessionHttpError(response.status, message4);
  }
  return response;
}
async function responseJson(response) {
  try {
    return await readBoundedJson(response, MAX_SESSION_RESPONSE_BYTES);
  } catch (cause) {
    if (cause instanceof HttpBodyTooLarge) throw new Error("Session response is too large");
    if (cause instanceof HttpInvalidJson) throw new Error("Session returned invalid JSON", { cause });
    throw cause;
  }
}
function createBrowserSession(fetch2) {
  return Object.freeze({
    current: async () => identityOf(await responseJson(await request2(fetch2, "/api/v1/session", { method: "GET" }))),
    bootstrap: async (accessCode) => {
      if (typeof accessCode !== "string" || accessCode.trim().length === 0) {
        throw new TypeError("\u8BF7\u8F93\u5165\u8BBF\u95EE\u7801");
      }
      const response = await request2(fetch2, "/api/v1/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessCode })
      });
      return identityOf(await responseJson(response));
    },
    signOut: async () => {
      await request2(fetch2, "/api/v1/session", { method: "DELETE" });
    }
  });
}

// apps/client/app/session-ui.tsx
import { useState as useState2 } from "/libs/react.js";
import { jsx as jsx2, jsxs as jsxs2 } from "/libs/react.js";
function SessionLoading() {
  return /* @__PURE__ */ jsx2("main", { className: "client-gate", children: /* @__PURE__ */ jsxs2("section", { className: "client-gate-panel", children: [
    /* @__PURE__ */ jsx2("h1", { children: "Pico" }),
    /* @__PURE__ */ jsx2("p", { role: "status", children: "\u6B63\u5728\u6062\u590D\u4F1A\u8BDD\u2026" })
  ] }) });
}
function SessionAccess({ authenticate }) {
  const [accessCode, setAccessCode] = useState2("");
  const [busy, setBusy] = useState2(false);
  const [failure, setFailure] = useState2(null);
  const submit = (event4) => {
    event4.preventDefault();
    setBusy(true);
    setFailure(null);
    void authenticate(accessCode).catch((error) => {
      setBusy(false);
      setFailure(error instanceof Error ? error.message : String(error));
    });
  };
  return /* @__PURE__ */ jsx2("main", { className: "client-gate", children: /* @__PURE__ */ jsxs2("form", { onSubmit: submit, children: [
    /* @__PURE__ */ jsx2("h1", { children: "Pico" }),
    /* @__PURE__ */ jsx2("p", { children: "\u8F93\u5165\u4E3A\u4F60\u5206\u914D\u7684\u8BBF\u95EE\u7801\u3002\u8FD9\u91CC\u4E0D\u9700\u8981\u59D3\u540D\u6216\u5BC6\u7801\u3002" }),
    /* @__PURE__ */ jsx2("label", { htmlFor: "access-code", children: "\u8BBF\u95EE\u7801" }),
    /* @__PURE__ */ jsx2(
      "input",
      {
        id: "access-code",
        autoComplete: "one-time-code",
        value: accessCode,
        onChange: (event4) => setAccessCode(event4.currentTarget.value),
        disabled: busy,
        required: true,
        autoFocus: true
      }
    ),
    /* @__PURE__ */ jsx2("button", { type: "submit", disabled: busy, children: busy ? "\u6B63\u5728\u8FDB\u5165\u2026" : "\u8FDB\u5165 Pico" }),
    failure !== null && /* @__PURE__ */ jsx2("p", { role: "alert", children: failure })
  ] }) });
}
function SessionFailure({ message: message4, retry }) {
  return /* @__PURE__ */ jsx2("main", { className: "client-gate", children: /* @__PURE__ */ jsxs2("section", { className: "client-gate-panel", children: [
    /* @__PURE__ */ jsx2("h1", { children: "Pico \u65E0\u6CD5\u542F\u52A8" }),
    /* @__PURE__ */ jsx2("p", { role: "alert", children: message4 }),
    /* @__PURE__ */ jsx2("button", { type: "button", onClick: retry, children: "\u91CD\u8BD5" })
  ] }) });
}

// apps/client/app/main.tsx
var root = createRoot2(document.getElementById("app"));
var session = createBrowserSession(fetch);
var runtime = null;
function runtimeBaseUrl() {
  const configured = document.querySelector('meta[name="picopg-runtime-base"]')?.content ?? "/";
  return new URL(configured, location.origin).href;
}
async function disposeRuntime() {
  const current = runtime;
  runtime = null;
  if (current === null) return;
  await current.workspaces.dispose();
  await current.client.dispose();
}
async function start(identity) {
  await disposeRuntime();
  const bus = new EventBus2();
  const local = createBrowserReplicaLogStore({ identity });
  const peer = createHttpRemotePeer({ baseUrl: location.origin, fetch });
  const client = createClient({
    bus,
    local,
    peer,
    identity,
    submissions: createHttpSubmissionSource({ baseUrl: location.origin, fetch })
  });
  const container = document.createElement("div");
  container.style.height = "100%";
  const loader = createPackageLoader({
    packages: createHttpPlaygroundPackages({ baseUrl: location.origin, fetch }),
    runtimeBaseUrl: runtimeBaseUrl()
  });
  const workspaces = createWorkspaces({
    client,
    bus,
    host: createModuleHost({ loader, container }),
    session: {
      storage: sessionStorage,
      key: `picopg:workspaces:${encodeURIComponent(identity.principalId)}:${encodeURIComponent(identity.replicaId)}`
    }
  });
  runtime = { client, workspaces };
  root.render(createElement2(App, {
    client,
    workspaces,
    container,
    identity,
    signOut: async () => {
      const active = workspaces.state.getSnapshot().active;
      if (active.status === "ready" && (active.save.status === "dirty" || active.save.status === "saving" || active.save.status === "failed")) {
        await workspaces.save();
      }
      await disposeRuntime();
      await session.signOut();
      showAccess();
    }
  }));
}
function showAccess() {
  root.render(createElement2(SessionAccess, {
    authenticate: async (accessCode) => start(await session.bootstrap(accessCode))
  }));
}
function boot() {
  root.render(createElement2(SessionLoading));
  void session.current().then(start).catch((error) => {
    if (error instanceof SessionHttpError && error.status === 401) {
      showAccess();
      return;
    }
    const message4 = error instanceof Error ? error.message : String(error);
    root.render(createElement2(SessionFailure, { message: message4, retry: boot }));
  });
}
boot();
