import{c as k,aJ as f,y as v,o as i,e as h,C as t,P as l,I as a,G as r,B as b,J as w,F as x,D as B,A as E,S as M,L as I,aK as z}from"./index-5wnQJmMD.js";import{E as C}from"./index-CMwbCShT.js";import{T as L}from"./ThemeToggle-DAlELfrl.js";import{u as S}from"./theme-DJoIMNKZ.js";import{c as d}from"./createLucideIcon-UUk9gHjN.js";import{L as $}from"./layout-dashboard-yVEPoMxf.js";import{_ as q}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-B-PXKoKt.js";import"./pick-IIEy0y49.js";import"./hasIn-DChR0f_y.js";/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=d("ArrowRightIcon",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=d("BookOpenIcon",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=d("ExternalLinkIcon",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=d("GlobeIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]),G={class:"entry-page"},R={class:"entry-topbar-wrapper"},V={class:"entry-topbar glass"},F={class:"brand"},H={id:"main-content",class:"entry-main"},J={class:"hero"},N={class:"hero-title"},O={class:"hero-desc"},P={class:"entry-grid","aria-label":"入口列表"},j=["aria-label","onClick","onKeydown"],Q={class:"card-icon"},U={class:"card-body"},W={class:"card-title"},X={class:"card-desc"},Y=k({__name:"Entry",setup(Z){const _=w(),o=f(),y=S();v(()=>o.load());const u=I(()=>{const e=[{key:"blog",title:"Blog 主页",desc:"阅读笔记、标签与时间线",icon:T,target:"/",internal:!0},{key:"admin",title:"Blog 后台",desc:"管理笔记、图片与站点设置",icon:$,target:"/admin",internal:!0}],n=(o.settings.entry_links||[]).map((s,c)=>({key:`ext-${c}`,title:s.title||s.url,desc:s.url,icon:K,target:s.url,internal:!1}));return[...e,...n]});function g(e){const n=e.includes("?")?"&":"?";return`${e}${n}theme=${y.theme}`}function p(e){z(e.target).catch(()=>{}),e.internal?_.push(e.target):window.location.href=g(e.target)}function m(e,n){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),p(n))}return(e,n)=>(i(),h("div",G,[t("div",R,[t("header",V,[t("div",F,[l(a(A),{size:22}),t("span",null,r(a(o).settings.site_name||"个人笔记博客"),1)]),l(L)])]),l(a(C),{class:"entry-scroll"},{default:b(()=>[t("main",H,[t("section",J,[t("h1",N,r(a(o).settings.site_name||"个人笔记博客"),1),t("p",O,r(a(o).settings.site_desc||a(o).settings.blogger_desc||"一个记录与分享的角落"),1)]),t("section",P,[(i(!0),h(x,null,B(u.value,s=>(i(),h("article",{key:s.key,class:"entry-card glass glass-interactive",tabindex:"0",role:"link","aria-label":`进入 ${s.title}`,onClick:c=>p(s),onKeydown:c=>m(c,s)},[t("div",Q,[(i(),E(M(s.icon),{size:28}))]),t("div",U,[t("h2",W,r(s.title),1),t("p",X,r(s.desc),1)]),l(a(D),{class:"card-arrow",size:20})],40,j))),128))])])]),_:1})]))}}),de=q(Y,[["__scopeId","data-v-b30d433f"]]);export{de as default};
