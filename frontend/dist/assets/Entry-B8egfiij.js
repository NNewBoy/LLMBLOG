import{E as f}from"./index-Dd9ZvzWE.js";import{c as v,aJ as b,y as w,o as i,e as h,C as t,P as l,I as r,G as c,B as x,J as B,F as E,D as M,A as I,S as z,L as C,aK as L}from"./index-CWziNt91.js";/* empty css                     */import{T as S}from"./ThemeToggle-BWVeXGRe.js";import{u as $}from"./theme-BkWES_Je.js";import{c as d}from"./createLucideIcon-DWJPt8Og.js";import{L as q}from"./layout-dashboard-DY9uY7bJ.js";import{_ as D}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-DHs70kLR.js";import"./pick-lx0i7DdX.js";import"./hasIn-C-6cgbnN.js";/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=d("ArrowRightIcon",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=d("BookOpenIcon",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=d("ExternalLinkIcon",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=d("GlobeIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]),R={class:"entry-page"},V={class:"entry-topbar-wrapper"},F={class:"entry-topbar glass"},H={class:"brand"},J={id:"main-content",class:"entry-main"},N={class:"hero"},O={class:"hero-title"},P={class:"hero-desc"},j={class:"entry-grid","aria-label":"入口列表"},Q=["aria-label","onClick","onKeydown"],U={class:"card-icon"},W={class:"card-body"},X={class:"card-title"},Y={class:"card-desc"},Z=v({__name:"Entry",setup(ee){const y=B(),o=b(),u=$();w(()=>o.load());const m=C(()=>{const e=[{key:"blog",title:"Blog 主页",desc:"阅读笔记、标签与时间线",icon:K,target:"/",internal:!0},{key:"admin",title:"Blog 后台",desc:"管理笔记、图片与站点设置",icon:q,target:"/admin",internal:!0}],a=(o.settings.entry_links||[]).map((n,s)=>({key:`ext-${s}`,title:n.title||n.url,desc:n.url,icon:A,target:n.url,internal:!1}));return[...e,...a]});function g(e){const a=e.includes("?")?"&":"?";return`${e}${a}theme=${u.theme}`}function _(e){L(e.target).catch(()=>{}),e.internal?y.push(e.target):window.location.href=g(e.target)}function k(e,a){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),_(a))}return(e,a)=>{const n=f;return i(),h("div",R,[t("div",V,[t("header",F,[t("div",H,[l(r(G),{size:22}),t("span",null,c(r(o).settings.site_name||"个人笔记博客"),1)]),l(S)])]),l(n,{class:"entry-scroll"},{default:x(()=>[t("main",J,[t("section",N,[t("h1",O,c(r(o).settings.site_name||"个人笔记博客"),1),t("p",P,c(r(o).settings.site_desc||r(o).settings.blogger_desc||"一个记录与分享的角落"),1)]),t("section",j,[(i(!0),h(E,null,M(m.value,s=>(i(),h("article",{key:s.key,class:"entry-card glass glass-interactive",tabindex:"0",role:"link","aria-label":`进入 ${s.title}`,onClick:p=>_(s),onKeydown:p=>k(p,s)},[t("div",U,[(i(),I(z(s.icon),{size:28}))]),t("div",W,[t("h2",X,c(s.title),1),t("p",Y,c(s.desc),1)]),l(r(T),{class:"card-arrow",size:20})],40,Q))),128))])])]),_:1})])}}}),_e=D(Z,[["__scopeId","data-v-a3662598"]]);export{_e as default};
