import{b as r,Z as s,$ as o,a0 as c,a1 as i,a2 as u,I as d}from"./index-SCHVJ4ag.js";const E="update:modelValue",l="change",N="input",T=e=>r?window.requestAnimationFrame(e):setTimeout(e,16),_=e=>r?window.cancelAnimationFrame(e):clearTimeout(e),t={prefix:Math.floor(Math.random()*1e4),current:0},I=Symbol("elIdInjection"),m=()=>i()?u(I,t):t,f=e=>{const n=m();!r&&n===t&&s("IdInjection",`Looks like you are using server rendering, you must provide a id provider to ensure the hydration process to be succeed
usage: app.provide(ID_INJECTION_KEY, {
  prefix: number,
  current: number,
})`);const a=o();return c(()=>d(e)||`${a.value}-id-${n.prefix}-${n.current++}`)};export{l as C,N as I,E as U,m as a,_ as c,T as r,f as u};
