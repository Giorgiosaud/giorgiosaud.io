/* empty css                                                           */import{r as s,o as c,a as l,c as _,b as u,t as a}from"./runtime-core.esm-bundler.DWCCFpFs.js";const i=(n,t)=>{const o=n.__vccOpts||n;for(const[e,r]of t)o[e]=r;return o},d={__name:"buttonVue",setup(n,{expose:t}){t();const o=s(0);c(async()=>{setTimeout(()=>o.value++,1e3)});const e={count:o,ref:s,onMounted:c};return Object.defineProperty(e,"__isScriptSetup",{enumerable:!1,value:!0}),e}},p={class:"border-green-400 border-solid border-2 p-1 m-3"};function b(n,t,o,e,r,m){return l(),_("div",p,[u("h3",null," Vue Button was clicked "+a(e.count)+" "+a(e.count===1?"time":"times"),1),u("button",{class:"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",onClick:t[0]||(t[0]=f=>e.count++)}," Increment Count Vue ")])}const g=i(d,[["render",b]]);export{g as default};
