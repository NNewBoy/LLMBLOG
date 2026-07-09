import{c as S,a8 as w,r as m,N as z,o as i,e as g,C as a,P as s,B as r,I as l,aP as v,F as f,D as V,A as u,S as p,g as M,J as R,G as B,aQ as T,O as A,an as E}from"./index-DgtgrmOZ.js";import{E as O}from"./index-JI_yNgsW.js";import{T as D}from"./ThemeToggle-Bg1yJA1w.js";import{A as q,M as F,T as G}from"./AppDrawer-D0LDemQv.js";import{c as n}from"./createLucideIcon-kzB4eSO2.js";import{L as N}from"./layout-dashboard-z2IGVrTz.js";import{F as H}from"./file-text-CJH-I1Yg.js";import{_ as P}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-CYYx4mda.js";import"./pick-rBBJVvIS.js";import"./hasIn-BCphzRly.js";import"./theme-DQ16v2cO.js";import"./index-BFkEmgUz.js";import"./index-C65n73pR.js";import"./use-dialog-CYx8XPWW.js";/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=n("ChevronsLeftIcon",[["path",{d:"m11 17-5-5 5-5",key:"13zhaf"}],["path",{d:"m18 17-5-5 5-5",key:"h8a8et"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=n("ChevronsRightIcon",[["path",{d:"m6 17 5-5-5-5",key:"xnjwq"}],["path",{d:"m13 17 5-5-5-5",key:"17xmmf"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=n("ImageIcon",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=n("LogOutIcon",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=n("MessageSquareIcon",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=n("SettingsIcon",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),$={id:"admin-sidebar",class:"admin-sidebar glass"},W={"aria-label":"后台导航"},X={class:"icon-border"},Z={class:"admin-link-label"},aa={class:"admin-main"},ea={class:"admin-topbar-wrapper"},oa={class:"admin-topbar glass"},ta=["aria-expanded","aria-label"],sa={id:"main-content",class:"admin-content"},k="llmblog-admin-sidebar-collapsed",la=S({__name:"AdminLayout",setup(na){const _=w(),y=R(),L=A(),d=m(!1),b=m(),t=m(localStorage.getItem(k)==="1");function x(){t.value=!t.value,localStorage.setItem(k,t.value?"1":"0"),setTimeout(()=>window.dispatchEvent(new Event("resize")),250)}const h=[{to:"/admin/dashboard",label:"分析概览",icon:N},{to:"/admin/notes",label:"笔记管理",icon:H},{to:"/admin/images",label:"图片管理",icon:K},{to:"/admin/tags",label:"标签管理",icon:G},{to:"/admin/comments",label:"评论管理",icon:U},{to:"/admin/settings",label:"系统设置",icon:Y}];function I(){_.logout(),y.push("/admin/login")}return z(()=>L.path,()=>{E(()=>{var c;return(c=b.value)==null?void 0:c.setScrollTop(0)})}),(c,o)=>{const C=T("RouterView");return i(),g(f,null,[o[4]||(o[4]=a("a",{href:"#main-content",class:"skip-link"},"跳到主内容",-1)),a("div",{class:M(["admin-shell",{"sidebar-collapsed":t.value}])},[a("aside",$,[s(l(v),{to:"/admin/dashboard",class:"admin-brand","aria-label":"LLMBLOG 后台首页"},{default:r(()=>[...o[2]||(o[2]=[a("div",{class:"brand-icon-border"},[a("span",{class:"brand-mark"},"L")],-1),a("span",{class:"brand-text"},"LLMBLOG 后台",-1)])]),_:1}),a("nav",W,[(i(),g(f,null,V(h,e=>s(l(v),{key:e.to,to:e.to,class:"admin-link","aria-label":t.value?e.label:void 0,title:t.value?e.label:void 0},{default:r(()=>[a("div",X,[(i(),u(p(e.icon),{size:18}))]),a("span",Z,B(e.label),1)]),_:2},1032,["to","aria-label","title"])),64))])]),s(q,{modelValue:d.value,"onUpdate:modelValue":o[0]||(o[0]=e=>d.value=e),"brand-to":"/admin/dashboard","brand-text":"LLMBLOG 后台",links:h,"nav-aria-label":"后台导航"},null,8,["modelValue"]),a("div",aa,[a("div",ea,[a("header",oa,[a("button",{class:"icon-btn hamburger","aria-label":"打开菜单",onClick:o[1]||(o[1]=e=>d.value=!0)},[s(l(F),{size:18})]),a("button",{class:"icon-btn sidebar-toggle","aria-expanded":!t.value,"aria-controls":"admin-sidebar","aria-label":t.value?"展开侧边栏":"折叠侧边栏",onClick:x},[(i(),u(p(t.value?l(J):l(j)),{size:20}))],8,ta),o[3]||(o[3]=a("div",{class:"topbar-spacer"},null,-1)),s(D),a("button",{class:"icon-btn logout","aria-label":"退出登录",onClick:I},[s(l(Q),{size:18})])])]),s(l(O),{ref_key:"scrollbarRef",ref:b,class:"admin-scroll"},{default:r(()=>[a("main",sa,[s(C,null,{default:r(({Component:e})=>[(i(),u(p(e)))]),_:1})])]),_:1},512)])],2)],64)}}}),La=P(la,[["__scopeId","data-v-8c0cc724"]]);export{La as default};
