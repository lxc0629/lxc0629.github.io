(function(){var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,o)=>(o=n==null?{}:e(i(n)),s(r||!n||!n.__esModule||!a.call(n,`default`)?t(o,`default`,{value:n,enumerable:!0}):o,n)),l=o(((e,t)=>{t.exports={}})),u=Object.defineProperty,d=(e,t)=>u(e,`name`,{value:t,configurable:!0}),f=(e=>typeof require<`u`?require:typeof Proxy<`u`?new Proxy(e,{get:(e,t)=>(typeof require<`u`?require:e)[t]}):e)(function(e){if(typeof require<`u`)return require.apply(this,arguments);throw Error(`Dynamic require of "`+e+`" is not supported`)}),p=(()=>{for(var e=new Uint8Array(128),t=0;t<64;t++)e[t<26?t+65:t<52?t+71:t<62?t-4:t*4-205]=t;return t=>{for(var n=t.length,r=new Uint8Array((n-(t[n-1]==`=`)-(t[n-2]==`=`))*3/4|0),i=0,a=0;i<n;){var o=e[t.charCodeAt(i++)],s=e[t.charCodeAt(i++)],c=e[t.charCodeAt(i++)],l=e[t.charCodeAt(i++)];r[a++]=o<<2|s>>4,r[a++]=s<<4|c>>2,r[a++]=c<<6|l}return r}})();function m(e){return!isNaN(parseFloat(e))&&isFinite(e)}d(m,`_isNumber`);function h(e){return e.charAt(0).toUpperCase()+e.substring(1)}d(h,`_capitalize`);function g(e){return function(){return this[e]}}d(g,`_getter`);var _=[`isConstructor`,`isEval`,`isNative`,`isToplevel`],v=[`columnNumber`,`lineNumber`],y=[`fileName`,`functionName`,`source`],b=_.concat(v,y,[`args`],[`evalOrigin`]);function x(e){if(e)for(var t=0;t<b.length;t++)e[b[t]]!==void 0&&this[`set`+h(b[t])](e[b[t]])}for(d(x,`StackFrame`),x.prototype={getArgs:d(function(){return this.args},`getArgs`),setArgs:d(function(e){if(Object.prototype.toString.call(e)!==`[object Array]`)throw TypeError(`Args must be an Array`);this.args=e},`setArgs`),getEvalOrigin:d(function(){return this.evalOrigin},`getEvalOrigin`),setEvalOrigin:d(function(e){if(e instanceof x)this.evalOrigin=e;else if(e instanceof Object)this.evalOrigin=new x(e);else throw TypeError(`Eval Origin must be an Object or StackFrame`)},`setEvalOrigin`),toString:d(function(){var e=this.getFileName()||``,t=this.getLineNumber()||``,n=this.getColumnNumber()||``,r=this.getFunctionName()||``;return this.getIsEval()?e?`[eval] (`+e+`:`+t+`:`+n+`)`:`[eval]:`+t+`:`+n:r?r+` (`+e+`:`+t+`:`+n+`)`:e+`:`+t+`:`+n},`toString`)},x.fromString=d(function(e){var t=e.indexOf(`(`),n=e.lastIndexOf(`)`),r=e.substring(0,t),i=e.substring(t+1,n).split(`,`),a=e.substring(n+1);if(a.indexOf(`@`)===0)var o=/@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(a,``),s=o[1],c=o[2],l=o[3];return new x({functionName:r,args:i||void 0,fileName:s,lineNumber:c||void 0,columnNumber:l||void 0})},`StackFrame$$fromString`),S=0;S<_.length;S++)x.prototype[`get`+h(_[S])]=g(_[S]),x.prototype[`set`+h(_[S])]=function(e){return function(t){this[e]=!!t}}(_[S]);var S;for(C=0;C<v.length;C++)x.prototype[`get`+h(v[C])]=g(v[C]),x.prototype[`set`+h(v[C])]=function(e){return function(t){if(!m(t))throw TypeError(e+` must be a Number`);this[e]=Number(t)}}(v[C]);var C;for(w=0;w<y.length;w++)x.prototype[`get`+h(y[w])]=g(y[w]),x.prototype[`set`+h(y[w])]=function(e){return function(t){this[e]=String(t)}}(y[w]);var w,T=x;function E(){var e=/^\s*at .*(\S+:\d+|\(native\))/m,t=/^(eval@)?(\[native code])?$/;return{parse:d(function(t){if(t.stack&&t.stack.match(e))return this.parseV8OrIE(t);if(t.stack)return this.parseFFOrSafari(t);throw Error(`Cannot parse given Error object`)},`ErrorStackParser$$parse`),extractLocation:d(function(e){if(e.indexOf(`:`)===-1)return[e];var t=/(.+?)(?::(\d+))?(?::(\d+))?$/.exec(e.replace(/[()]/g,``));return[t[1],t[2]||void 0,t[3]||void 0]},`ErrorStackParser$$extractLocation`),parseV8OrIE:d(function(t){return t.stack.split(`
`).filter(function(t){return!!t.match(e)},this).map(function(e){e.indexOf(`(eval `)>-1&&(e=e.replace(/eval code/g,`eval`).replace(/(\(eval at [^()]*)|(,.*$)/g,``));var t=e.replace(/^\s+/,``).replace(/\(eval code/g,`(`).replace(/^.*?\s+/,``),n=t.match(/ (\(.+\)$)/);t=n?t.replace(n[0],``):t;var r=this.extractLocation(n?n[1]:t);return new T({functionName:n&&t||void 0,fileName:[`eval`,`<anonymous>`].indexOf(r[0])>-1?void 0:r[0],lineNumber:r[1],columnNumber:r[2],source:e})},this)},`ErrorStackParser$$parseV8OrIE`),parseFFOrSafari:d(function(e){return e.stack.split(`
`).filter(function(e){return!e.match(t)},this).map(function(e){if(e.indexOf(` > eval`)>-1&&(e=e.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,`:$1`)),e.indexOf(`@`)===-1&&e.indexOf(`:`)===-1)return new T({functionName:e});var t=/((.*".+"[^@]*)?[^@]*)(?:@)/,n=e.match(t),r=n&&n[1]?n[1]:void 0,i=this.extractLocation(e.replace(t,``));return new T({functionName:r,fileName:i[0],lineNumber:i[1],columnNumber:i[2],source:e})},this)},`ErrorStackParser$$parseFFOrSafari`)}}d(E,`ErrorStackParser`);var ee=new E;function te(){return typeof API<`u`&&API!==globalThis.API?API.runtimeEnv:ne({IN_BUN:typeof Bun<`u`,IN_DENO:typeof Deno<`u`,IN_NODE:typeof process==`object`&&typeof process.versions==`object`&&typeof process.versions.node==`string`&&!process.browser,IN_SAFARI:typeof navigator==`object`&&typeof navigator.userAgent==`string`&&navigator.userAgent.indexOf(`Chrome`)===-1&&navigator.userAgent.indexOf(`Safari`)>-1,IN_SHELL:typeof read==`function`&&typeof load==`function`,IN_WORKERD:typeof navigator==`object`&&navigator.userAgent?.includes(`Cloudflare-Workers`)})}d(te,`getGlobalRuntimeEnv`);var D=te();function ne(e){let t=e.IN_NODE&&typeof module<`u`&&module.exports&&typeof f==`function`&&typeof __dirname==`string`,n=e.IN_NODE&&!t,r=!e.IN_NODE&&!e.IN_DENO&&!e.IN_BUN,i=r&&typeof window<`u`&&typeof window.document<`u`&&typeof document.createElement==`function`&&`sessionStorage`in window&&typeof globalThis.importScripts!=`function`,a=r&&typeof globalThis.WorkerGlobalScope<`u`&&typeof globalThis.self<`u`&&globalThis.self instanceof globalThis.WorkerGlobalScope;if(a&&O())throw Error(`Classic web workers are not supported`);let o={...e,IN_BROWSER:r,IN_BROWSER_MAIN_THREAD:i,IN_BROWSER_WEB_WORKER:a,IN_NODE_COMMONJS:t,IN_NODE_ESM:n};if(!(o.IN_BROWSER_MAIN_THREAD||o.IN_BROWSER_WEB_WORKER||o.IN_NODE||o.IN_SHELL||o.IN_WORKERD))throw Error(`Cannot determine runtime environment: ${JSON.stringify(o)}`);return o}d(ne,`calculateDerivedFlags`);function O(){try{return globalThis.importScripts(`data:text/javascript,`),!0}catch{return!1}}d(O,`isClassicWorker`);var k,A,re,j;async function M(){if(!D.IN_NODE||(k=(await Promise.resolve().then(()=>c(l(),1))).default,re=await Promise.resolve().then(()=>c(l(),1)),j=await Promise.resolve().then(()=>c(l(),1)),(await Promise.resolve().then(()=>c(l(),1))).default,A=await Promise.resolve().then(()=>c(l(),1)),I=A.sep,typeof f<`u`))return;let e={fs:re,crypto:await Promise.resolve().then(()=>c(l(),1)),ws:await Promise.resolve().then(()=>c(l(),1)),child_process:await Promise.resolve().then(()=>c(l(),1))};globalThis.require=function(t){return e[t]}}d(M,`initNodeModules`);function N(e,t){return A.resolve(t||`.`,e)}d(N,`node_resolvePath`);function P(e,t){return t===void 0&&(t=location),new URL(e,t).toString()}d(P,`browser_resolvePath`);var F=D.IN_NODE?N:D.IN_SHELL?d(e=>e,`resolvePath`):P,I;D.IN_NODE||(I=`/`);function L(e,t){return e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`)?{response:fetch(e)}:{binary:j.readFile(e).then(e=>new Uint8Array(e.buffer,e.byteOffset,e.byteLength))}}d(L,`node_getBinaryResponse`);function R(e,t){if(e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`))throw Error(`Shell cannot fetch urls`);return{binary:Promise.resolve(new Uint8Array(readbuffer(e)))}}d(R,`shell_getBinaryResponse`);function z(e,t){let n=new URL(e,location);return{response:fetch(n,t?{integrity:t}:{})}}d(z,`browser_getBinaryResponse`);var B=D.IN_NODE?L:D.IN_SHELL?R:z;async function V(e,t){let{response:n,binary:r}=B(e,t);if(r)return r;let i=await n;if(!i.ok)throw Error(`Failed to load '${e}': request failed.`);return new Uint8Array(await i.arrayBuffer())}d(V,`loadBinaryFile`);var ie=D.IN_NODE?H:d(async e=>await import(e),`loadScript`);async function H(e){return e.startsWith(`file://`)&&(e=e.slice(7)),e.includes(`://`)?await import(e):await import(k.pathToFileURL(e).href)}d(H,`nodeLoadScript`);async function U(e){if(D.IN_NODE){await M();let t=await j.readFile(e,{encoding:`utf8`});return JSON.parse(t)}if(D.IN_SHELL){let t=read(e);return JSON.parse(t)}return await(await fetch(e)).json()}d(U,`loadLockFile`);async function W(){if(D.IN_NODE_COMMONJS)return __dirname;let e;try{throw Error()}catch(t){e=t}let t=ee.parse(e)[0].fileName;if(D.IN_NODE&&!t.startsWith(`file://`)&&(t=`file://${t}`),D.IN_NODE_ESM){let e=await Promise.resolve().then(()=>c(l(),1));return(await Promise.resolve().then(()=>c(l(),1))).fileURLToPath(e.dirname(t))}let n=t.lastIndexOf(I);if(n===-1)throw Error(`Could not extract indexURL path from pyodide module location. Please pass the indexURL explicitly to loadPyodide.`);return t.slice(0,n)}d(W,`calculateDirname`);function G(e){return e.substring(0,e.lastIndexOf(`/`)+1)||globalThis.location?.toString()||`.`}d(G,`calculateInstallBaseUrl`);function K(e){let t=e.FS,n=e.FS.filesystems.MEMFS,r=e.PATH,i={DIR_MODE:16895,FILE_MODE:33279,mount:d(function(e){if(!e.opts.fileSystemHandle)throw Error(`opts.fileSystemHandle is required`);return n.mount.apply(null,arguments)},`mount`),syncfs:d(async(e,t,n)=>{try{let r=i.getLocalSet(e),a=await i.getRemoteSet(e),o=t?a:r,s=t?r:a;await i.reconcile(e,o,s),n(null)}catch(e){n(e)}},`syncfs`),getLocalSet:d(e=>{let n=Object.create(null);function i(e){return e!==`.`&&e!==`..`}d(i,`isRealDir`);function a(e){return t=>r.join2(e,t)}d(a,`toAbsolute`);let o=t.readdir(e.mountpoint).filter(i).map(a(e.mountpoint));for(;o.length;){let e=o.pop(),r=t.stat(e);t.isDir(r.mode)&&o.push.apply(o,t.readdir(e).filter(i).map(a(e))),n[e]={timestamp:r.mtime,mode:r.mode}}return{type:`local`,entries:n}},`getLocalSet`),getRemoteSet:d(async e=>{let t=Object.create(null),n=await ae(e.opts.fileSystemHandle);for(let[a,o]of n)a!==`.`&&(t[r.join2(e.mountpoint,a)]={timestamp:o.kind===`file`?new Date((await o.getFile()).lastModified):new Date,mode:o.kind===`file`?i.FILE_MODE:i.DIR_MODE});return{type:`remote`,entries:t,handles:n}},`getRemoteSet`),loadLocalEntry:d(e=>{let r=t.lookupPath(e,{}).node,i=t.stat(e);if(t.isDir(i.mode))return{timestamp:i.mtime,mode:i.mode};if(t.isFile(i.mode))return r.contents=n.getFileDataAsTypedArray(r),{timestamp:i.mtime,mode:i.mode,contents:r.contents};throw Error(`node type not supported`)},`loadLocalEntry`),storeLocalEntry:d((e,n)=>{if(t.isDir(n.mode))t.mkdirTree(e,n.mode);else if(t.isFile(n.mode))t.writeFile(e,n.contents,{canOwn:!0});else throw Error(`node type not supported`);t.chmod(e,n.mode),t.utime(e,n.timestamp,n.timestamp)},`storeLocalEntry`),removeLocalEntry:d(e=>{var n=t.stat(e);t.isDir(n.mode)?t.rmdir(e):t.isFile(n.mode)&&t.unlink(e)},`removeLocalEntry`),loadRemoteEntry:d(async e=>{if(e.kind===`file`){let t=await e.getFile();return{contents:new Uint8Array(await t.arrayBuffer()),mode:i.FILE_MODE,timestamp:new Date(t.lastModified)}}if(e.kind===`directory`)return{mode:i.DIR_MODE,timestamp:new Date};throw Error(`unknown kind: `+e.kind)},`loadRemoteEntry`),storeRemoteEntry:d(async(e,n,i)=>{let a=e.get(r.dirname(n)),o=t.isFile(i.mode)?await a.getFileHandle(r.basename(n),{create:!0}):await a.getDirectoryHandle(r.basename(n),{create:!0});if(o.kind===`file`){let e=await o.createWritable();await e.write(i.contents),await e.close()}e.set(n,o)},`storeRemoteEntry`),removeRemoteEntry:d(async(e,t)=>{await e.get(r.dirname(t)).removeEntry(r.basename(t)),e.delete(t)},`removeRemoteEntry`),reconcile:d(async(e,n,a)=>{let o=0,s=[];Object.keys(n.entries).forEach(function(e){let r=n.entries[e],i=a.entries[e];(!i||t.isFile(r.mode)&&r.timestamp.getTime()>i.timestamp.getTime())&&(s.push(e),o++)}),s.sort();let c=[];if(Object.keys(a.entries).forEach(function(e){n.entries[e]||(c.push(e),o++)}),c.sort().reverse(),!o)return;let l=n.type===`remote`?n.handles:a.handles;for(let t of s){let n=r.normalize(t.replace(e.mountpoint,`/`)).substring(1);if(a.type===`local`){let e=l.get(n),r=await i.loadRemoteEntry(e);i.storeLocalEntry(t,r)}else{let e=i.loadLocalEntry(t);await i.storeRemoteEntry(l,n,e)}}for(let t of c)if(a.type===`local`)i.removeLocalEntry(t);else{let n=r.normalize(t.replace(e.mountpoint,`/`)).substring(1);await i.removeRemoteEntry(l,n)}},`reconcile`)};e.FS.filesystems.NATIVEFS_ASYNC=i}d(K,`initializeNativeFS`);var ae=d(async e=>{let t=[];async function n(e){for await(let r of e.values())t.push(r),r.kind===`directory`&&await n(r)}d(n,`collect`),await n(e);let r=new Map;r.set(`.`,e);for(let n of t){let t=(await e.resolve(n)).join(`/`);r.set(t,n)}return r},`getFsHandles`),oe=p(`AGFzbQEAAAABDANfAGAAAW9gAW8BfwMDAgECBygCE0pzdl9HZXRFcnJvcl9pbXBvcnQAAA5Kc3ZFcnJvcl9DaGVjawABChMCBwD7AQD7GwsJACAA+xr7FAAL`),se=async function(){if(!(globalThis.navigator&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform===`MacIntel`&&typeof navigator.maxTouchPoints<`u`&&navigator.maxTouchPoints>1)))try{let e=await WebAssembly.compile(oe);return await WebAssembly.instantiate(e)}catch(e){if(e instanceof WebAssembly.CompileError)return;throw e}}();async function q(){let e=await se;if(e)return e.exports;let t=Symbol(`error marker`);return{Jsv_GetError_import:d(()=>t,`Jsv_GetError_import`),JsvError_Check:d(e=>e===t,`JsvError_Check`)}}d(q,`getJsvErrorImport`);function J(e){let t={config:e,runtimeEnv:D},n={noImageDecoding:!0,noAudioDecoding:!0,noWasmDecoding:!1,preRun:de(e),print:e.stdout,printErr:e.stderr,onExit(e){n.exitCode=e},thisProgram:e._sysExecutable,arguments:e.args,API:t,locateFile:d(t=>e.indexURL+t,`locateFile`),instantiateWasm:fe(e.indexURL)};return n}d(J,`createSettings`);function Y(e){return function(t){try{t.FS.mkdirTree(e)}catch(t){console.error(`Error occurred while making a home directory '${e}':`),console.error(t),console.error(`Using '/' for a home directory instead`),e=`/`}t.FS.chdir(e)}}d(Y,`createHomeDirectory`);function X(e){return function(t){Object.assign(t.ENV,e)}}d(X,`setEnvironment`);function ce(e){return e?[async t=>{t.addRunDependency(`fsInitHook`);try{await e(t.FS,{sitePackages:t.API.sitePackages})}finally{t.removeRunDependency(`fsInitHook`)}}]:[]}d(ce,`callFsInitHook`);function le(e){let t=e.HEAPU32[e._Py_Version>>>2];return[t>>>24&255,t>>>16&255,t>>>8&255]}d(le,`computeVersionTuple`);function ue(e){let t=V(e);return async e=>{e.API.pyVersionTuple=le(e);let[n,r]=e.API.pyVersionTuple;e.FS.mkdirTree(`/lib`),e.API.sitePackages=`/lib/python${n}.${r}/site-packages`,e.FS.mkdirTree(e.API.sitePackages),e.addRunDependency(`install-stdlib`);try{let i=await t;e.FS.writeFile(`/lib/python${n}${r}.zip`,i)}catch(e){console.error(`Error occurred while installing the standard library:`),console.error(e)}finally{e.removeRunDependency(`install-stdlib`)}}}d(ue,`installStdlib`);function de(e){let t;return t=e.stdLibURL==null?e.indexURL+`python_stdlib.zip`:e.stdLibURL,[ue(t),Y(e.env.HOME),X(e.env),K,...ce(e.fsInit)]}d(de,`getFileSystemInitializationFuncs`);function fe(e){if(typeof WasmOffsetConverter<`u`)return;let{binary:t,response:n}=B(e+`pyodide.asm.wasm`),r=q();return function(e,i){return async function(){let{Jsv_GetError_import:a,JsvError_Check:o}=await r;e.env.Jsv_GetError_import=a,e.env.JsvError_Check=o;try{let r;r=n?await WebAssembly.instantiateStreaming(n,e):await WebAssembly.instantiate(await t,e);let{instance:a,module:o}=r;i(a,o)}catch(e){console.warn(`wasm instantiation failed!`),console.warn(e)}}(),{}}}d(fe,`getInstantiateWasmFunc`);var pe=`314.0.2`;function Z(e){return e===void 0||e.endsWith(`/`)?e:e+`/`}d(Z,`withTrailingSlash`);var me=pe;async function he(e={}){if(await M(),e.lockFileContents&&e.lockFileURL)throw Error(`Can't pass both lockFileContents and lockFileURL`);let t=e.indexURL||await W();if(t=Z(F(t)),e.packageBaseUrl=Z(e.packageBaseUrl),e.cdnUrl=Z(e.packageBaseUrl??`https://cdn.jsdelivr.net/pyodide/v314.0.2/full/`),!e.lockFileContents){let n=e.lockFileURL??t+`pyodide-lock.json`;e.lockFileContents=U(n),e.packageBaseUrl??=G(n)}e.indexURL=t,e.packageCacheDir&&=Z(F(e.packageCacheDir));let n={jsglobals:globalThis,stdin:globalThis.prompt?()=>globalThis.prompt():void 0,args:[],env:{},packages:[],packageCacheDir:e.packageBaseUrl,enableRunUntilComplete:!0,checkAPIVersion:!0,BUILD_ID:`a4189f0fe3d610ecd603639c08596362b70a34b106c58c9a93486c22df4c89a5`},r=Object.assign(n,e);return r.env.HOME??=`/home/pyodide`,r.env.PYTHONINSPECT??=`1`,r}d(he,`initializeConfiguration`);function ge(e){let t=J(e),n=t.API;return n.lockFilePromise=Promise.resolve(e.lockFileContents),t}d(ge,`createEmscriptenSettings`);async function _e(e){return e.createPyodideModule?e.createPyodideModule:(await ie(`${e.indexURL}pyodide.asm.mjs`)).default}d(_e,`loadWasmScript`);async function ve(e,t){if(!e._loadSnapshot)return;let n=await e._loadSnapshot,r=ArrayBuffer.isView(n)?n:new Uint8Array(n);return t.noInitialRun=!0,t.INITIAL_MEMORY=r.length,r}d(ve,`prepareSnapshot`);async function Q(e,t){let n=await e(t);if(t.exitCode!==void 0)throw new n.ExitStatus(t.exitCode);return n}d(Q,`instantiatePyodideModule`);function ye(e,t){let n=e.API;if(t.pyproxyToStringRepr&&n.setPyProxyToStringMethod(!0),t.convertNullToNone&&n.setCompatNullToNone(!0),t.toJsLiteralMap&&n.setCompatToJsLiteralMap(!0),n.version!==`314.0.2`&&t.checkAPIVersion)throw Error(`Pyodide version does not match: '${me}' <==> '${n.version}'. If you updated the Pyodide version, make sure you also updated the 'indexURL' parameter passed to loadPyodide.`);e.locateFile=e=>{throw e.endsWith(`.so`)?Error(`Failed to find dynamic library "${e}"`):Error(`Unexpected call to locateFile("${e}")`)}}d(ye,`configureAPI`);function be(e,t,n){let r=e.API,i;return t&&(i=r.restoreSnapshot(t)),r.finalizeBootstrap(i,n._snapshotDeserializer)}d(be,`bootstrapPyodide`);async function xe(e,t){let n=e._api;return n.sys.path.insert(0,``),n._pyodide.set_excepthook(),await n.packageIndexReady,n.initializeStreams(t.stdin,t.stdout,t.stderr),e}d(xe,`finalizeSetup`);async function Se(e={}){let t=await he(e),n=ge(t),r=await _e(t),i=await ve(t,n),a=await Q(r,n);return ye(a,t),await xe(be(a,i,t),t)}d(Se,`loadPyodide`);let $=globalThis,Ce=Se({indexURL:`/pyodide/`});Ce.then(()=>$.postMessage({type:`ready`})),$.onmessage=async({data:e})=>{let{request:t,inputBuffer:n}=e,r=[],i=[],a=[],o=[],s=[],c,l=0,u=0,d=0,f=0,p=[],m=()=>{let e=0;for(;e<p.length&&e<a.length&&JSON.stringify(p[e])===JSON.stringify(a[e]);)e+=1;let n=p.at(-1),c=a.at(-1),m=e===p.length-1&&p.length===a.length&&n!==void 0&&n.type!==`display`&&c!==void 0&&c.type!==`display`&&c.sequence===n.sequence&&c.type===n.type&&c.text.startsWith(n.text),h={framesFrom:l,frames:o.slice(l),worldEventsFrom:u,worldEvents:s.slice(u),ioEventsFrom:m?a.length:e,ioEvents:m?[]:a.slice(e),ioTailTextDelta:m?c.text.slice(n.text.length):``,stdoutDelta:r.join(``).slice(d),stderrDelta:i.join(``).slice(f)};$.postMessage({type:`delta`,requestId:t.id,delta:h}),l=o.length,u=s.length,d=r.join(``).length,f=i.join(``).length,p=a.map(e=>({...e}))};$._pico_delta=e=>{let t=JSON.parse(String(e));if(t.framesFrom!==o.length||t.worldEventsFrom!==s.length)throw Error(`Python Trace Delta 不连续`);o=[...o,...t.frames],s=[...s,...t.worldEvents],m()},$._pico_display=e=>{let t=JSON.parse(String(e));a.push({...t,sequence:a.length}),m()};try{let e=await Ce,l=t.stdin===``?[]:t.stdin.replaceAll(`\r
`,`
`).split(`
`),u=n===null?null:new Int32Array(n,0,2),d=n===null?null:new Uint8Array(n,8),f=new TextDecoder,p=new TextDecoder,h=new TextDecoder,g=0,_=(e,t)=>{if(t===``&&(e===`stdout`||e===`stderr`))return;let n=a.at(-1);n?.type===e?a[a.length-1]={...n,text:n.text+t}:a.push({sequence:a.length,type:e,text:t})};e.setStdin({stdin:()=>{let e=l.shift();if(e===void 0){if(_(`input-requested`,``),u===null||d===null)return;let n=r.join(``).slice(g).split(`
`).at(-1)??``;m(),$.postMessage({type:`input-requested`,requestId:t.id,prompt:n}),Atomics.wait(u,0,0);let i=Atomics.load(u,1);e=f.decode(Uint8Array.from(d.subarray(0,i))),Atomics.store(u,0,0)}return _(`stdin`,e),g=r.join(``).length,m(),e}}),e.setStdout({raw:e=>{let t=p.decode(Uint8Array.of(e),{stream:!0});r.push(t),_(`stdout`,t),m()}}),e.setStderr({raw:e=>{let t=h.decode(Uint8Array.of(e),{stream:!0});i.push(t),_(`stderr`,t),m()}}),await e.runPythonAsync(`
import json, math, os, shutil, sys, types
from js import _pico_delta, _pico_display
_pico_root = "/pico-project"
os.chdir("/")
for _pico_name, _pico_module in list(sys.modules.items()):
    _pico_file = getattr(_pico_module, "__file__", None)
    if isinstance(_pico_file, str) and _pico_file.startswith(_pico_root + "/"):
        del sys.modules[_pico_name]
shutil.rmtree(_pico_root, ignore_errors=True)
os.makedirs(_pico_root)
for _pico_path, _pico_source in json.loads(${JSON.stringify(JSON.stringify(t.files))}).items():
    _pico_full_path = os.path.join(_pico_root, _pico_path)
    os.makedirs(os.path.dirname(_pico_full_path), exist_ok=True)
    with open(_pico_full_path, "w", encoding="utf-8") as _pico_file_handle:
        _pico_file_handle.write(_pico_source)
os.chdir(_pico_root)
if _pico_root not in sys.path:
    sys.path.insert(0, _pico_root)

_pico_world_events = []
_pico_current_frame_index = None
_pico_frames = []
_pico_sent_frames = 0
_pico_sent_world_events = 0
def _pico_send_delta():
    global _pico_sent_frames, _pico_sent_world_events
    _pico_delta(json.dumps({"framesFrom": _pico_sent_frames, "frames": _pico_frames[_pico_sent_frames:], "worldEventsFrom": _pico_sent_world_events, "worldEvents": _pico_world_events[_pico_sent_world_events:]}, allow_nan=False))
    _pico_sent_frames = len(_pico_frames)
    _pico_sent_world_events = len(_pico_world_events)

def _pico_emit(event):
    if not isinstance(event, dict) or not isinstance(event.get("type"), str) or not event["type"]:
        raise TypeError("world event 必须是包含非空 type 的字典")
    if len(_pico_world_events) >= 2000:
        raise RuntimeError("world event 数量超过 2000")
    if _pico_current_frame_index is None:
        raise RuntimeError("world event 没有对应的学生代码 Frame")
    _pico_event = json.loads(json.dumps(event, allow_nan=False))
    _pico_event["sequence"] = len(_pico_world_events)
    _pico_event["executionFrameIndex"] = _pico_current_frame_index
    _pico_world_events.append(_pico_event)
    _pico_send_delta()
_pico_runtime = types.ModuleType("_pico_runtime")
_pico_runtime.emit = _pico_emit
_pico_runtime.runtime_input = json.loads(${JSON.stringify(JSON.stringify(t.runtimeInput))})
sys.modules["_pico_runtime"] = _pico_runtime

def _pico_display_value(value, depth=0):
    if depth > 6:
        raise ValueError("display 数据嵌套不能超过 6 层")
    if value is None:
        return {"type": "none", "value": None}
    if isinstance(value, bool):
        return {"type": "bool", "value": value}
    if isinstance(value, int):
        if not -(2**53 - 1) <= value <= 2**53 - 1:
            raise ValueError("display 整数超出安全范围")
        return {"type": "int", "value": value}
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("display 浮点数必须是有限值")
        return {"type": "float", "value": value}
    if isinstance(value, str):
        if len(value) > 10000:
            raise ValueError("display 字符串不能超过 10000 个字符")
        return {"type": "string", "value": value}
    if isinstance(value, (list, tuple)):
        if len(value) > 200:
            raise ValueError("display 列表或元组不能超过 200 项")
        return {"type": "list" if isinstance(value, list) else "tuple", "items": [_pico_display_value(item, depth + 1) for item in value]}
    if isinstance(value, dict):
        if len(value) > 200 or not all(isinstance(key, str) for key in value):
            raise ValueError("display 字典只能包含最多 200 个字符串键")
        return {"type": "dict", "entries": [[key, _pico_display_value(item, depth + 1)] for key, item in value.items()]}
    raise TypeError(f"display 不支持 {type(value).__name__}")

def display(value, title=None):
    if title is not None and not isinstance(title, str):
        raise TypeError("display 标题必须是字符串或 None")
    if _pico_current_frame_index is None:
        raise RuntimeError("display 没有对应的学生代码 Frame")
    _pico_send_delta()
    event = {"type": "display", "executionFrameIndex": _pico_current_frame_index, "value": _pico_display_value(value)}
    if title is not None:
        event["title"] = title
    _pico_display(json.dumps(event, allow_nan=False))

def _pico_local(value):
    if isinstance(value, float) and not math.isfinite(value):
        return repr(value)
    if isinstance(value, (int, float, str, bool, type(None))):
        return value
    try:
        return repr(value)[:200]
    except BaseException as error:
        return f"<repr failed: {type(error).__name__}>"

def _pico_depth(frame):
    depth = 0
    parent = frame.f_back
    while parent is not None:
        if parent.f_code.co_filename == ${JSON.stringify(t.entryPath)}:
            depth += 1
        parent = parent.f_back
    return depth

def _pico_trace(frame, event, arg):
    global _pico_current_frame_index
    if event == "line" and frame.f_code.co_filename == ${JSON.stringify(t.entryPath)}:
        if len(_pico_frames) >= 2000:
            raise RuntimeError("Trace 超过 2000 个执行步骤；请缩小输入或减少循环次数")
        _pico_frames.append({
            "path": frame.f_code.co_filename,
            "line": frame.f_lineno,
            "depth": _pico_depth(frame),
            "locals": {
                name: _pico_local(value)
                for name, value in frame.f_locals.items()
                if not name.startswith("_")
                and not callable(value)
                and not isinstance(value, types.ModuleType)
            },
        })
        _pico_current_frame_index = len(_pico_frames) - 1
        if len(_pico_frames) == 1 or len(_pico_frames) % 50 == 0:
            _pico_send_delta()
    return _pico_trace
sys.settrace(_pico_trace)
`);let v=t.files[t.entryPath]??``,y=await e.runPythonAsync(`
import importlib, json, traceback
_pico_error = None
try:
    _pico_student_globals = {"__name__": "__main__", "__file__": ${JSON.stringify(t.entryPath)}, "display": display}
    for _pico_binding in json.loads(${JSON.stringify(JSON.stringify(t.api))}):
        _pico_api_module = importlib.import_module(_pico_binding["module"])
        _pico_student_globals[_pico_binding["name"]] = getattr(_pico_api_module, _pico_binding["exportName"])
    exec(compile(${JSON.stringify(v)}, ${JSON.stringify(t.entryPath)}, "exec"), _pico_student_globals)
except BaseException as _pico_exception:
    _pico_path = getattr(_pico_exception, "filename", None)
    _pico_line = getattr(_pico_exception, "lineno", None)
    _pico_tb = _pico_exception.__traceback__
    while _pico_tb is not None:
        if _pico_tb.tb_frame.f_code.co_filename == ${JSON.stringify(t.entryPath)}:
            _pico_path = ${JSON.stringify(t.entryPath)}
            _pico_line = _pico_tb.tb_lineno
        _pico_tb = _pico_tb.tb_next
    _pico_error = {
        "kind": "syntax" if isinstance(_pico_exception, SyntaxError) else "input" if isinstance(_pico_exception, EOFError) else "runtime",
        "exceptionType": type(_pico_exception).__name__,
        "exceptionMessage": ("当前页面不支持实时 input()；请使用具备跨源隔离的服务运行，或预先填写输入。" if ${n===null?`True`:`False`} else "程序还需要一行输入。") if isinstance(_pico_exception, EOFError) else str(_pico_exception),
        "message": ("当前页面不支持实时 input()；请使用具备跨源隔离的服务运行，或预先填写输入。" if ${n===null?`True`:`False`} else "程序还需要一行输入。") if isinstance(_pico_exception, EOFError) else "".join(traceback.format_exception(_pico_exception)),
        "path": _pico_path,
        "line": _pico_line,
    }
finally:
    sys.settrace(None)
json.dumps({"frames": _pico_frames, "error": _pico_error, "worldEvents": _pico_world_events})
`),b=JSON.parse(String(y));o=b.frames,s=b.worldEvents,c=we(r,i,b.error,o,s,a)}catch(e){let t=e instanceof Error?e.message:String(e);c=we(r,i,{kind:`internal`,exceptionType:e instanceof Error?e.name:`Error`,exceptionMessage:t,message:t,path:null,line:null},o,s,a)}$.postMessage({type:`completed`,requestId:t.id,execution:c}),delete $._pico_delta,delete $._pico_display};function we(e,t,n,r,i,a){return{stdout:e.join(``),stderr:t.join(``),exitCode:n===null?0:n.kind===`internal`?null:1,error:n,frames:r,worldEvents:i,ioEvents:a}}})();