import{c as S,a8 as w,r as m,N as z,o as i,e as v,C as a,P as s,B as r,I as l,aP as h,F as f,D as V,A as u,S as p,g as M,J as R,G as T,ai as B,aQ as A,O as E,al as O}from"./index-SCHVJ4ag.js";import{E as D}from"./index-BaxKTLSR.js";import{T as q}from"./ThemeToggle-xvoC6sOU.js";import{A as F,M as G,T as N}from"./AppDrawer-CGQnW7gS.js";import{c as n}from"./createLucideIcon-Bd6cK4r_.js";import{L as H}from"./layout-dashboard-CUgo1UNC.js";import{F as P}from"./file-text-CRZ-oW27.js";import{_ as j}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./index-C9TiOA8u.js";import"./pick-BZpTvlWf.js";import"./hasIn-B2d-tGTi.js";import"./theme-CuAjEWqG.js";import"./index-By239Qg8.js";import"./index-4Jp9vusv.js";import"./el-overlay-ZJJMD1vU.js";/* empty css             *//**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=n("ChevronsLeftIcon",[["path",{d:"m11 17-5-5 5-5",key:"13zhaf"}],["path",{d:"m18 17-5-5 5-5",key:"h8a8et"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=n("ChevronsRightIcon",[["path",{d:"m6 17 5-5-5-5",key:"xnjwq"}],["path",{d:"m13 17 5-5-5-5",key:"17xmmf"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=n("ImageIcon",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=n("LogOutIcon",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=n("MessageSquareIcon",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-vue-next v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=n("SettingsIcon",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),W={id:"admin-sidebar",class:"admin-sidebar glass"},X={"aria-label":"后台导航"},Z={class:"icon-border"},aa={class:"admin-link-label"},ea={class:"admin-main"},oa={class:"admin-topbar-wrapper"},ta={class:"admin-topbar glass"},sa=["aria-expanded","aria-label"],la={id:"main-content",class:"admin-content"},k="llmblog-admin-sidebar-collapsed",na=S({__name:"AdminLayout",setup(ia){const y=w(),_=R(),L=E(),d=m(!1),b=m(),t=m(localStorage.getItem(k)==="1");function x(){t.value=!t.value,localStorage.setItem(k,t.value?"1":"0"),setTimeout(()=>window.dispatchEvent(new Event("resize")),250)}const g=[{to:"/admin/dashboard",label:"分析概览",icon:H},{to:"/admin/notes",label:"笔记管理",icon:P},{to:"/admin/images",label:"图片管理",icon:Q},{to:"/admin/tags",label:"标签管理",icon:N},{to:"/admin/comments",label:"评论管理",icon:Y},{to:"/admin/settings",label:"系统设置",icon:$}];function I(){y.logout(),_.push("/admin/login")}return z(()=>L.path,()=>{O(()=>{var c;return(c=b.value)==null?void 0:c.setScrollTop(0)})}),(c,e)=>{const C=A("RouterView");return i(),v(f,null,[e[5]||(e[5]=a("a",{href:"#main-content",class:"skip-link"},"跳到主内容",-1)),a("div",{class:M(["admin-shell",{"sidebar-collapsed":t.value}])},[a("aside",W,[s(l(h),{to:"/admin/dashboard",class:"admin-brand","aria-label":"LLMBLOG 后台首页"},{default:r(()=>[...e[2]||(e[2]=[a("div",{class:"brand-icon-border"},[a("span",{class:"brand-mark"},"L")],-1),a("span",{class:"brand-text"},"LLMBLOG 后台",-1)])]),_:1}),a("nav",X,[(i(),v(f,null,V(g,o=>s(l(h),{key:o.to,to:o.to,class:"admin-link","aria-label":t.value?o.label:void 0,title:t.value?o.label:void 0},{default:r(()=>[a("div",Z,[(i(),u(p(o.icon),{size:18}))]),a("span",aa,T(o.label),1)]),_:2},1032,["to","aria-label","title"])),64))])]),s(F,{modelValue:d.value,"onUpdate:modelValue":e[0]||(e[0]=o=>d.value=o),"brand-to":"/admin/dashboard","brand-text":"LLMBLOG 后台",links:g,"nav-aria-label":"后台导航"},null,8,["modelValue"]),a("div",ea,[a("div",oa,[a("header",ta,[a("button",{class:"icon-btn hamburger","aria-label":"打开菜单",onClick:e[1]||(e[1]=o=>d.value=!0)},[s(l(G),{size:22})]),a("button",{class:"icon-btn sidebar-toggle","aria-expanded":!t.value,"aria-controls":"admin-sidebar","aria-label":t.value?"展开侧边栏":"折叠侧边栏",onClick:x},[(i(),u(p(t.value?l(K):l(J)),{size:20}))],8,sa),e[4]||(e[4]=a("div",{class:"topbar-spacer"},null,-1)),s(q),a("button",{class:"icon-btn logout","aria-label":"退出登录",onClick:I},[s(l(U),{size:18}),e[3]||(e[3]=a("span",{class:"logout-text"},"退出",-1))])])]),s(l(D),{ref_key:"scrollbarRef",ref:b,class:"admin-scroll"},{default:r(()=>[a("main",la,[s(C,null,{default:r(({Component:o})=>[s(B,{name:"fade",mode:"out-in"},{default:r(()=>[(i(),u(p(o)))]),_:2},1024)]),_:1})])]),_:1},512)])],2)],64)}}}),Ia=j(na,[["__scopeId","data-v-5b05a873"]]);export{Ia as default};
