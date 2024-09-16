import{r as i}from"./index.DhYZZe0J.js";var p={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var f=i,a=Symbol.for("react.element"),m=Symbol.for("react.fragment"),_=Object.prototype.hasOwnProperty,x=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,b={key:!0,ref:!0,__self:!0,__source:!0};function d(o,e,n){var r,t={},l=null,c=null;n!==void 0&&(l=""+n),e.key!==void 0&&(l=""+e.key),e.ref!==void 0&&(c=e.ref);for(r in e)_.call(e,r)&&!b.hasOwnProperty(r)&&(t[r]=e[r]);if(o&&o.defaultProps)for(r in e=o.defaultProps,e)t[r]===void 0&&(t[r]=e[r]);return{$$typeof:a,type:o,key:l,ref:c,props:t,_owner:x.current}}s.Fragment=m;s.jsx=d;s.jsxs=d;p.exports=s;var u=p.exports;function v({title:o="Increment Count React."}){const[e,n]=i.useState(0),r=()=>n(t=>t+1);return i.useEffect(()=>{setTimeout(()=>n(t=>t+1),1e3)},[]),u.jsxs("div",{className:"border-blue-400 border-solid border-2 p-1 m-3",children:[u.jsxs("h3",{children:["React Button was clicked ",e," ",e===1?"time":"times"]}),u.jsx("button",{className:"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",onClick:r,children:o})]})}export{v as default};
