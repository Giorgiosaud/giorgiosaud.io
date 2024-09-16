import{i as P,d,e as z,f as G,g as W,h as j,j as y,k as R,l as O,m as F,n as K,p as I,q as U,s as X,u as V,v as Z,w as m,S as J}from"./runtime-core.esm-bundler.DWCCFpFs.js";/**
* @vue/runtime-dom v3.5.6
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let b;const A=typeof window<"u"&&window.trustedTypes;if(A)try{b=A.createPolicy("vue",{createHTML:t=>t})}catch{}const x=b?t=>b.createHTML(t):t=>t,Q="http://www.w3.org/2000/svg",Y="http://www.w3.org/1998/Math/MathML",f=typeof document<"u"?document:null,v=f&&f.createElement("template"),k={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,i)=>{const s=e==="svg"?f.createElementNS(Q,t):e==="mathml"?f.createElementNS(Y,t):n?f.createElement(t,{is:n}):f.createElement(t);return t==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:t=>f.createTextNode(t),createComment:t=>f.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>f.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,i,s,o){const r=n?n.previousSibling:e.lastChild;if(s&&(s===o||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===o||!(s=s.nextSibling)););else{v.innerHTML=x(i==="svg"?`<svg>${t}</svg>`:i==="mathml"?`<math>${t}</math>`:t);const c=v.content;if(i==="svg"||i==="mathml"){const l=c.firstChild;for(;l.firstChild;)c.appendChild(l.firstChild);c.removeChild(l)}e.insertBefore(c,n)}return[r?r.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},tt=Symbol("_vtc");function et(t,e,n){const i=t[tt];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const C=Symbol("_vod"),nt=Symbol("_vsh"),it=Symbol(""),st=/(^|;)\s*display\s*:/;function rt(t,e,n){const i=t.style,s=d(n);let o=!1;if(n&&!s){if(e)if(d(e))for(const r of e.split(";")){const c=r.slice(0,r.indexOf(":")).trim();n[c]==null&&h(i,c,"")}else for(const r in e)n[r]==null&&h(i,r,"");for(const r in n)r==="display"&&(o=!0),h(i,r,n[r])}else if(s){if(e!==n){const r=i[it];r&&(n+=";"+r),i.cssText=n,o=st.test(n)}}else e&&t.removeAttribute("style");C in t&&(t[C]=o?i.display:"",t[nt]&&(i.display="none"))}const E=/\s*!important$/;function h(t,e,n){if(R(n))n.forEach(i=>h(t,e,i));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const i=ot(t,e);E.test(n)?t.setProperty(O(i),n.replace(E,""),"important"):t[i]=n}}const T=["Webkit","Moz","ms"],S={};function ot(t,e){const n=S[e];if(n)return n;let i=F(e);if(i!=="filter"&&i in t)return S[e]=i;i=K(i);for(let s=0;s<T.length;s++){const o=T[s]+i;if(o in t)return S[e]=o}return e}const w="http://www.w3.org/1999/xlink";function M(t,e,n,i,s,o=X(e)){i&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(w,e.slice(6,e.length)):t.setAttributeNS(w,e,n):n==null||o&&!I(n)?t.removeAttribute(e):t.setAttribute(e,o?"":U(n)?String(n):n)}function ct(t,e,n,i){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?x(n):n);return}const s=t.tagName;if(e==="value"&&s!=="PROGRESS"&&!s.includes("-")){const r=s==="OPTION"?t.getAttribute("value")||"":t.value,c=n==null?t.type==="checkbox"?"on":"":String(n);(r!==c||!("_value"in t))&&(t.value=c),n==null&&t.removeAttribute(e),t._value=n;return}let o=!1;if(n===""||n==null){const r=typeof t[e];r==="boolean"?n=I(n):n==null&&r==="string"?(n="",o=!0):r==="number"&&(n=0,o=!0)}try{t[e]=n}catch{}o&&t.removeAttribute(e)}function ft(t,e,n,i){t.addEventListener(e,n,i)}function lt(t,e,n,i){t.removeEventListener(e,n,i)}const N=Symbol("_vei");function at(t,e,n,i,s=null){const o=t[N]||(t[N]={}),r=o[e];if(i&&r)r.value=i;else{const[c,l]=ut(e);if(i){const p=o[e]=mt(i,s);ft(t,c,p,l)}else r&&(lt(t,c,r,l),o[e]=void 0)}}const L=/(?:Once|Passive|Capture)$/;function ut(t){let e;if(L.test(t)){e={};let i;for(;i=t.match(L);)t=t.slice(0,t.length-i[0].length),e[i[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):O(t.slice(2)),e]}let g=0;const dt=Promise.resolve(),pt=()=>g||(dt.then(()=>g=0),g=Date.now());function mt(t,e){const n=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=n.attached)return;V(ht(i,n.value),e,5,[i])};return n.value=t,n.attached=pt(),n}function ht(t,e){if(R(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(i=>s=>!s._stopped&&i&&i(s))}else return e}const H=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,St=(t,e,n,i,s,o)=>{const r=s==="svg";e==="class"?et(t,i,r):e==="style"?rt(t,n,i):j(e)?y(e)||at(t,e,n,i,o):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):gt(t,e,i,r))?(ct(t,e,i),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&M(t,e,i,r,o,e!=="value")):(e==="true-value"?t._trueValue=i:e==="false-value"&&(t._falseValue=i),M(t,e,i,r))};function gt(t,e,n,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in t&&H(e)&&P(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return H(e)&&d(n)?!1:!!(e in t||t._isVueCE&&(/[A-Z]/.test(e)||!d(n)))}const D=W({patchProp:St},k);let u,_=!1;function bt(){return u||(u=z(D))}function At(){return u=_?u:G(D),_=!0,u}const vt=(...t)=>{const e=bt().createApp(...t),{mount:n}=e;return e.mount=i=>{const s=$(i);if(!s)return;const o=e._component;!P(o)&&!o.render&&!o.template&&(o.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const r=n(s,!1,B(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),r},e},Ct=(...t)=>{const e=At().createApp(...t),{mount:n}=e;return e.mount=i=>{const s=$(i);if(s)return n(s,!0,B(s))},e};function B(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function $(t){return d(t)?document.querySelector(t):t}const Et=()=>{},Tt=Z({props:{value:String,name:String,hydrate:{type:Boolean,default:!0}},setup({name:t,value:e,hydrate:n}){if(!e)return()=>null;let i=n?"astro-slot":"astro-static-slot";return()=>m(i,{name:t,innerHTML:e})}}),Nt=t=>async(e,n,i,{client:s})=>{if(!t.hasAttribute("ssr"))return;const o=e.name?`${e.name} Host`:void 0,r={};for(const[a,q]of Object.entries(i))r[a]=()=>m(Tt,{value:q,name:a==="default"?void 0:a});const c=s!=="only",p=(c?Ct:vt)({name:o,render(){let a=m(e,n,r);return wt(e.setup)&&(a=m(J,null,a)),a}});await Et(),p.mount(t,c),t.addEventListener("astro:unmount",()=>p.unmount(),{once:!0})};function wt(t){const e=t?.constructor;return e&&e.name==="AsyncFunction"}export{Nt as default};
