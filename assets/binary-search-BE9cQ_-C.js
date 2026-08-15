import"./styles-B0sFPpM3.js";import{n as e,t}from"./definition-H7hdRxeE.js";var n={id:`binary-search`,version:`1.0.0`,starterFiles:{"main.py":`low = 0
high = length() - 1

while low <= high:
    mid = (low + high) // 2
    result = compare(mid)
    if result == 0:
        break
    if result < 0:
        low = mid + 1
    else:
        high = mid - 1

if low > high:
    report_not_found()
`},entryPath:`main.py`,supportFiles:{"binary_search_api.py":`from _pico_runtime import emit, runtime_input

_values = runtime_input['values']
_target = runtime_input['target']

def length():
    return len(_values)

def target():
    return _target

def compare(index):
    if isinstance(index, bool) or not isinstance(index, int):
        emit({'type': 'invalid-compare', 'index': repr(index), 'reason': 'index 必须是非 bool 整数'})
        return 0
    if index < 0 or index >= len(_values):
        emit({'type': 'invalid-compare', 'index': index, 'reason': f'index {index} 越界；合法范围是 0..{len(_values) - 1}'})
        return 0
    result = -1 if _values[index] < _target else 1 if _values[index] > _target else 0
    emit({'type': 'compare', 'index': index, 'result': result})
    return result

def report_not_found():
    emit({'type': 'report-not-found'})
`},api:[{name:`length`,module:`binary_search_api`,exportName:`length`,example:`length()`,description:`返回数组长度`},{name:`target`,module:`binary_search_api`,exportName:`target`,example:`target()`,description:`返回要查找的目标值`},{name:`compare`,module:`binary_search_api`,exportName:`compare`,example:`compare(index)`,description:`比较指定位置与目标，并记录证据`},{name:`report_not_found`,module:`binary_search_api`,exportName:`report_not_found`,example:`report_not_found()`,description:`证据区间排空后报告未找到`}]};function r(e=[3,7,12,18,24,31,42,56,71],t=31){if(e.length===0||!e.every(Number.isFinite))throw TypeError(`数组必须包含有限数值`);if(!e.every((t,n)=>n===0||e[n-1]<t))throw TypeError(`数组必须严格递增`);if(!Number.isFinite(t))throw TypeError(`目标必须是有限数值`);return{initialState:{values:[...e],target:t,evidenceLow:0,evidenceHigh:e.length-1,comparisons:[],conclusion:`searching`,foundIndex:null,stayedWithinEvidence:!0,feedback:`尚未比较；全部索引都可能包含目标。`},transition:i}}var i=(e,t)=>{if(t.type===`configure`)return r(t.values,t.target).initialState;if(t.type===`invalid-compare`)throw RangeError(t.reason);if(t.type===`report-not-found`){if(e.conclusion!==`searching`)throw Error(`已经得到结论，不能再次报告未找到`);if(e.evidenceLow<=e.evidenceHigh)throw Error(`证据区间 ${e.evidenceLow}..${e.evidenceHigh} 尚未排空，不能报告未找到`);if(e.values.includes(e.target))throw Error(`目标实际存在，不能报告未找到`);return{...e,conclusion:`not-found`,feedback:`比较证据已排空全部候选，确认目标不存在。`}}if(e.conclusion!==`searching`)throw Error(`已经得到结论，不能继续 compare`);if(!Number.isSafeInteger(t.index)||t.index<0||t.index>=e.values.length)throw RangeError(`index ${t.index} 越界；合法范围是 0..${e.values.length-1}`);let n=e.values[t.index]<e.target?-1:+(e.values[t.index]>e.target);if(t.result!==n)throw Error(`compare(${t.index}) 的结果与数组不一致`);let i=e.comparisons.some(({index:e})=>e===t.index),a=t.index>=e.evidenceLow&&t.index<=e.evidenceHigh,o=[...e.comparisons,{index:t.index,result:t.result}];if(t.result===0)return{...e,comparisons:o,conclusion:`found`,foundIndex:t.index,stayedWithinEvidence:e.stayedWithinEvidence&&(i||a),feedback:`compare(${t.index}) 命中目标。`};let s=t.result<0?Math.max(e.evidenceLow,t.index+1):e.evidenceLow,c=t.result>0?Math.min(e.evidenceHigh,t.index-1):e.evidenceHigh,l=t.result<0?`0..${t.index}`:`${t.index}..${e.values.length-1}`;return{...e,evidenceLow:s,evidenceHigh:c,comparisons:o,stayedWithinEvidence:e.stayedWithinEvidence&&(i||a),feedback:i?`重复 compare(${t.index})；没有虚构新的进展。`:`compare(${t.index}) 排除索引 ${l}。`}},a=r(),o=(e,t,n)=>c(e,t,null,null,n);function s(e,t,n){let r=n.steps.slice(n.stepIndex+1).find(e=>e.stateAfter.comparisons.length>e.stateBefore.comparisons.length)?.stateAfter.comparisons.at(-1)?.index??null;c(e,t,n.frame,r)}function c(e,t,n,r,i){let a=document.createElement(`section`);a.className=`pico-world-binary-search`;let o=t.conclusion===`found`?`找到目标，索引 ${t.foundIndex}`:t.conclusion===`not-found`?`证据区间已排空，目标不存在`:l(t.evidenceLow,t.evidenceHigh);a.innerHTML=`
    <header class="pico-world-binary-search__heading">
      <p>目标值 <strong>${t.target}</strong></p>
      <h1>用比较证据缩小可信区间</h1>
      <p>${d(t.feedback)}</p>
    </header>
    ${i===void 0?``:`<form class="pico-world-binary-search__setup"><label>在哪些数里找<input name="values" value="${t.values.join(`, `)}" aria-describedby="search-setup-error"></label><label>要找哪个数<input name="target" type="number" step="any" value="${t.target}"></label><button type="submit">应用题目</button><p id="search-setup-error" role="alert"></p></form>`}
    <div class="pico-world-binary-search__facts" aria-live="polite">
      <section><span>证据区间</span><strong>${o}</strong></section>
      <section><span>代码变量</span><strong>${u(n?.locals??null,t.values.length)}</strong></section>
    </div>
    <div class="pico-world-binary-search__scene" role="group" aria-label="有序数组与二分查找证据">
      <ol class="pico-world-binary-search__array"></ol>
      <div class="pico-world-binary-search__legend">
        <span><i data-mark="evidence"></i>证据仍保留</span><span><i data-mark="excluded"></i>已由比较排除</span>
        ${r===null?``:`<span><i data-mark="future"></i>本次运行的下一次实际比较</span>`}
      </div>
    </div>`;let s=f(a,`ol`),c=a.querySelector(`form`);c?.addEventListener(`submit`,e=>{e.preventDefault();let t=new FormData(c),n=String(t.get(`values`)).split(/[,，\s]+/).filter(Boolean).map(Number),r=Number(t.get(`target`)),a=f(c,`[role=alert]`);try{i?.({type:`configure`,values:n,target:r})}catch(e){a.textContent=e instanceof Error?e.message:String(e)}});let p=t.comparisons.at(-1)?.index??null;s.replaceChildren(...t.values.map((e,n)=>{let i=document.createElement(`li`),a=n<t.evidenceLow||n>t.evidenceHigh;return i.className=`pico-world-binary-search__item`,a&&(i.dataset.state=`excluded`),n===p&&(i.dataset.current=`true`),n===r&&(i.dataset.future=`true`),i.innerHTML=`<span>${n}</span><strong>${e}</strong><small>${n===p?`刚比较`:a?`已排除`:`候选`}</small>`,i})),e.replaceChildren(a)}function l(e,t){return e<=t?`${e}..${t}`:`空区间`}function u(e,t){if(e===null)return`等待 Trace Frame`;let n=[`low`,`mid`,`high`].filter(t=>Object.hasOwn(e,t)).map(n=>{let r=e[n];return`${n}=${String(r)}${typeof r==`number`&&Number.isSafeInteger(r)&&r>=0&&r<t?``:`（类型或范围异常）`}`});return n.length===0?`当前 Frame 未定义 low / mid / high`:n.join(` · `)}function d(e){let t=document.createElement(`span`);return t.textContent=e,t.innerHTML}function f(e,t){let n=e.querySelector(t);if(n===null)throw Error(`缺少 ${t}`);return n}function p(e){if(e.type===`compare`){if(!Number.isSafeInteger(e.index)||![-1,0,1].includes(e.result))throw TypeError(`compare 事件字段非法`);return{type:`compare`,index:e.index,result:e.result}}if(e.type===`invalid-compare`){if(typeof e.index!=`number`&&typeof e.index!=`string`||typeof e.reason!=`string`)throw TypeError(`invalid-compare 事件字段非法`);return{type:`invalid-compare`,index:e.index,reason:e.reason}}if(e.type===`report-not-found`)return{type:`report-not-found`};throw TypeError(`未知 World Event：${e.type}`)}var m=t({id:`binary-search`,version:`1`,title:`二分查找：缩小可信区间`,python:n,world:{machine:a,isState:h,renderView:o,renderReplayView:s,adaptEvent:p,runtimeInput:e=>({values:e.values,target:e.target})},isComplete:e=>e.stayedWithinEvidence&&e.conclusion!==`searching`});function h(e){let t=e;return Array.isArray(t.values)&&t.values.length>0&&t.values.every(Number.isFinite)&&t.values.every((e,n)=>n===0||t.values[n-1]<e)&&typeof t.target==`number`&&Number.isFinite(t.target)&&Number.isSafeInteger(t.evidenceLow)&&t.evidenceLow>=0&&t.evidenceLow<=t.values.length&&Number.isSafeInteger(t.evidenceHigh)&&t.evidenceHigh>=-1&&t.evidenceHigh<t.values.length&&Array.isArray(t.comparisons)&&t.comparisons.every(e=>typeof e==`object`&&!!e&&Number.isSafeInteger(e.index)&&e.index>=0&&e.index<t.values.length&&[-1,0,1].includes(e.result)&&e.result===(t.values[e.index]<t.target?-1:+(t.values[e.index]>t.target)))&&[`searching`,`found`,`not-found`].includes(t.conclusion??``)&&(t.foundIndex===null||Number.isSafeInteger(t.foundIndex)&&t.foundIndex>=0&&t.foundIndex<t.values.length)&&typeof t.stayedWithinEvidence==`boolean`&&typeof t.feedback==`string`?t.conclusion===`found`?t.foundIndex!==null&&t.foundIndex!==void 0&&t.values[t.foundIndex]===t.target:t.conclusion===`not-found`?t.foundIndex===null&&t.evidenceLow>t.evidenceHigh&&!t.values.includes(t.target):t.foundIndex===null:!1}e(m);