// apps/client/teacher/main.tsx
import { createElement } from "/libs/react.js";
import { createRoot } from "/libs/react.js";

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

// apps/client/teacher/api.ts
var MAX_TEACHER_RESPONSE_BYTES = 4 * 1024 * 1024;
var TeacherHttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  status;
};
async function request(fetch2, baseUrl, path, init = {}) {
  let response;
  try {
    response = await fetch2(new URL(path, baseUrl), {
      credentials: "same-origin",
      ...init,
      headers: init.body === void 0 ? init.headers : {
        "Content-Type": "application/json",
        ...init.headers
      }
    });
  } catch (cause) {
    throw new Error("\u65E0\u6CD5\u8FDE\u63A5\u670D\u52A1\u5668", { cause });
  }
  if (!response.ok) {
    const message = response.status === 401 ? "\u6559\u5E08\u4F1A\u8BDD\u65E0\u6548\u6216\u5DF2\u7ECF\u8FC7\u671F" : response.status === 404 ? "\u8FD9\u6761\u63D0\u4EA4\u5DF2\u7ECF\u4E0D\u5B58\u5728" : response.status >= 500 ? "\u670D\u52A1\u5668\u6682\u65F6\u65E0\u6CD5\u5904\u7406\u8BF7\u6C42" : `\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${response.status}\uFF09`;
    throw new TeacherHttpError(response.status, message);
  }
  return response;
}
async function responseJson(response) {
  try {
    return await readBoundedJson(response, MAX_TEACHER_RESPONSE_BYTES);
  } catch (cause) {
    if (cause instanceof HttpBodyTooLarge) throw new Error("Teacher response is too large");
    if (cause instanceof HttpInvalidJson) throw new Error("Teacher response is invalid JSON", { cause });
    throw cause;
  }
}
function createTeacherApi(fetch2, baseUrl) {
  const origin = httpOrigin(baseUrl);
  return {
    authenticate: async (accessCode) => {
      await request(fetch2, origin, "/api/v1/session", {
        method: "POST",
        body: JSON.stringify({ accessCode })
      });
    },
    signOut: async () => {
      await request(fetch2, origin, "/api/v1/session", { method: "DELETE" });
    },
    submissions: async () => {
      const response = await request(fetch2, origin, "/api/v1/teacher/submissions");
      const value = await responseJson(response);
      return value.submissions;
    },
    submission: async (requestRecordId) => {
      const response = await request(
        fetch2,
        origin,
        `/api/v1/teacher/submissions/${encodeURIComponent(requestRecordId)}`
      );
      return await responseJson(response);
    },
    comment: async (requestRecordId, text) => {
      await request(
        fetch2,
        origin,
        `/api/v1/teacher/submissions/${encodeURIComponent(requestRecordId)}/comments`,
        { method: "POST", body: JSON.stringify({ text }) }
      );
    }
  };
}

// apps/client/teacher/ui.tsx
import { useEffect, useState } from "/libs/react.js";
import { Fragment, jsx, jsxs } from "/libs/react.js";
var statusLabel = (status) => ({
  requested: "\u5904\u7406\u4E2D",
  completed: "\u5DF2\u5B8C\u6210",
  failed: "\u5931\u8D25"
})[status];
function TeacherAccess({ authenticate }) {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    void authenticate(accessCode).catch((reason) => {
      setError(reason instanceof Error ? reason.message : String(reason));
      setBusy(false);
    });
  };
  return /* @__PURE__ */ jsx("main", { className: "teacher-gate", children: /* @__PURE__ */ jsxs("form", { className: "teacher-gate-panel", onSubmit: submit, children: [
    /* @__PURE__ */ jsx("span", { className: "teacher-eyebrow", children: "Pico \u6559\u5E08\u5DE5\u4F5C\u53F0" }),
    /* @__PURE__ */ jsx("h1", { children: "\u67E5\u770B\u771F\u5B9E\u63D0\u4EA4" }),
    /* @__PURE__ */ jsx("p", { children: "\u4F7F\u7528\u6559\u5E08\u8D26\u53F7\u7684\u8BBF\u95EE\u7801\u767B\u5F55\u3002\u53EF\u89C1\u5B66\u751F\u7531\u670D\u52A1\u5668\u540D\u518C\u51B3\u5B9A\u3002" }),
    /* @__PURE__ */ jsx("label", { htmlFor: "teacher-access-code", children: "\u8BBF\u95EE\u7801" }),
    /* @__PURE__ */ jsx("input", { id: "teacher-access-code", type: "password", autoComplete: "current-password", value: accessCode, onChange: (event) => setAccessCode(event.currentTarget.value), required: true }),
    error !== null && /* @__PURE__ */ jsx("p", { className: "teacher-error", role: "alert", children: error }),
    /* @__PURE__ */ jsx("button", { type: "submit", disabled: busy, children: busy ? "\u6B63\u5728\u9A8C\u8BC1\u2026" : "\u8FDB\u5165\u5DE5\u4F5C\u53F0" })
  ] }) });
}
function TeacherApp({ api: api2, initial, signOut }) {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState(initial.at(-1)?.requestRecordId ?? null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const loadList = async () => {
    setError(null);
    setItems(await api2.submissions());
  };
  const loadDetail = async (requestRecordId) => {
    setLoading(true);
    setError(null);
    try {
      setDetail(await api2.submission(requestRecordId));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (selected === null) {
      setDetail(null);
      return;
    }
    void loadDetail(selected).catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, [selected]);
  const submitComment = (event) => {
    event.preventDefault();
    if (selected === null) return;
    setLoading(true);
    setError(null);
    void api2.comment(selected, text).then(async () => {
      setText("");
      await loadDetail(selected);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : String(reason))).finally(() => setLoading(false));
  };
  return /* @__PURE__ */ jsxs("div", { className: "teacher-shell", children: [
    /* @__PURE__ */ jsxs("header", { className: "teacher-topbar", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "teacher-eyebrow", children: "Pico" }),
        /* @__PURE__ */ jsx("strong", { children: "\u6559\u5E08\u5DE5\u4F5C\u53F0" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "teacher-topbar-actions", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
          void loadList().catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
        }, children: "\u5237\u65B0" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
          void signOut();
        }, children: "\u9000\u51FA" })
      ] })
    ] }),
    error !== null && /* @__PURE__ */ jsxs("div", { className: "teacher-alert", role: "alert", children: [
      error,
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setError(null), children: "\u5173\u95ED" })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "teacher-layout", children: [
      /* @__PURE__ */ jsxs("aside", { className: "teacher-list", "aria-label": "\u63D0\u4EA4\u5217\u8868", children: [
        /* @__PURE__ */ jsxs("div", { className: "teacher-section-title", children: [
          /* @__PURE__ */ jsx("strong", { children: "\u63D0\u4EA4" }),
          /* @__PURE__ */ jsx("span", { children: items.length })
        ] }),
        items.length === 0 && /* @__PURE__ */ jsx("p", { className: "teacher-empty", children: "\u8FD8\u6CA1\u6709\u63D0\u4EA4\u3002" }),
        items.map((item) => /* @__PURE__ */ jsxs("button", { className: "teacher-submission", "data-active": selected === item.requestRecordId, type: "button", onClick: () => setSelected(item.requestRecordId), children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: item.playgroundId }),
            /* @__PURE__ */ jsxs("small", { children: [
              item.principalId,
              " \xB7 ",
              item.replicaId
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "teacher-status", "data-status": item.status, children: statusLabel(item.status) })
        ] }, item.requestRecordId))
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "teacher-detail", "aria-live": "polite", children: [
        selected === null && /* @__PURE__ */ jsxs("div", { className: "teacher-empty-state", children: [
          /* @__PURE__ */ jsx("h1", { children: "\u9009\u62E9\u4E00\u6761\u63D0\u4EA4" }),
          /* @__PURE__ */ jsx("p", { children: "\u8FD9\u91CC\u4F1A\u663E\u793A\u63D0\u4EA4\u56FA\u5B9A\u6307\u5411\u7684\u6E90\u7801\u4E0E\u8BC4\u8BED\u3002" })
        ] }),
        selected !== null && loading && detail === null && /* @__PURE__ */ jsx("p", { role: "status", children: "\u6B63\u5728\u8BFB\u53D6\u63D0\u4EA4\u2026" }),
        detail !== null && detail.requestRecordId === selected && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("header", { className: "teacher-detail-header", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "teacher-eyebrow", children: detail.principalId }),
              /* @__PURE__ */ jsx("h1", { children: detail.playgroundId })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "teacher-status", "data-status": detail.status, children: statusLabel(detail.status) })
          ] }),
          /* @__PURE__ */ jsxs("dl", { className: "teacher-metadata", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "Replica" }),
              /* @__PURE__ */ jsx("dd", { children: detail.replicaId })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "Revision" }),
              /* @__PURE__ */ jsx("dd", { title: detail.revision.recordId, children: detail.revision.recordId.slice(0, 12) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { children: "\u7ED3\u679C" }),
              /* @__PURE__ */ jsx("dd", { children: detail.tag ?? detail.message ?? "\u7B49\u5F85\u670D\u52A1\u5668\u5904\u7406" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "teacher-source", children: [
            /* @__PURE__ */ jsxs("div", { className: "teacher-section-title", children: [
              /* @__PURE__ */ jsx("strong", { children: "\u7CBE\u786E Revision" }),
              /* @__PURE__ */ jsx("span", { children: "\u53EA\u8BFB" })
            ] }),
            /* @__PURE__ */ jsx("pre", { children: /* @__PURE__ */ jsx("code", { children: detail.source }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "teacher-comments", children: [
            /* @__PURE__ */ jsxs("div", { className: "teacher-section-title", children: [
              /* @__PURE__ */ jsx("strong", { children: "\u9488\u5BF9\u672C\u6B21\u63D0\u4EA4\u7684\u8BC4\u8BED" }),
              /* @__PURE__ */ jsx("span", { children: detail.comments.length })
            ] }),
            detail.comments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "teacher-empty", children: "\u8FD8\u6CA1\u6709\u8BC4\u8BED\u3002" }) : /* @__PURE__ */ jsx("ul", { children: detail.comments.map((comment) => /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("strong", { children: comment.author }),
              /* @__PURE__ */ jsx("p", { children: comment.text })
            ] }, comment.position.recordId)) }),
            /* @__PURE__ */ jsxs("form", { onSubmit: submitComment, children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "comment-text", children: "\u8BC4\u8BED" }),
              /* @__PURE__ */ jsx("textarea", { id: "comment-text", value: text, onChange: (event) => setText(event.currentTarget.value), required: true }),
              /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, children: loading ? "\u6B63\u5728\u4FDD\u5B58\u2026" : "\u53D1\u5E03\u8BC4\u8BED" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}

// apps/client/teacher/main.tsx
var root = createRoot(document.getElementById("app"));
var api = createTeacherApi(fetch, location.origin);
function showAccess() {
  root.render(createElement(TeacherAccess, {
    authenticate: async (accessCode) => {
      await api.authenticate(accessCode);
      await boot();
    }
  }));
}
async function boot() {
  root.render(createElement("main", { className: "teacher-gate" }, "\u6B63\u5728\u8BFB\u53D6\u63D0\u4EA4\u2026"));
  try {
    const submissions = await api.submissions();
    root.render(createElement(TeacherApp, {
      api,
      initial: submissions,
      signOut: async () => {
        await api.signOut();
        showAccess();
      }
    }));
  } catch (error) {
    if (error instanceof TeacherHttpError && error.status === 401) {
      showAccess();
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    root.render(createElement(
      "main",
      { className: "teacher-gate" },
      createElement(
        "section",
        { className: "teacher-gate-panel" },
        createElement("h1", null, "\u6559\u5E08\u5DE5\u4F5C\u53F0\u65E0\u6CD5\u542F\u52A8"),
        createElement("p", { role: "alert" }, message),
        createElement("button", { type: "button", onClick: () => {
          void boot();
        } }, "\u91CD\u8BD5")
      )
    ));
  }
}
void boot();
