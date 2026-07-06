import{p as et}from"./chunk-JWPE2WC7-COTTLiGv.js";import{g as at,s as rt,a as it,b as ot,n as nt,m as st,_ as l,l as E,c as lt,y as ct,B as dt,C as pt,d as gt,o as ht,z as ft}from"./mermaid.core-ShTzPPRj.js";import{p as mt}from"./cynefin-VYW2F7L2-NQSavfn1.js";import"./Middleware-XC2-3HOy.js";import{a as U}from"./arc-Bsn9TSWs.js";import{o as ut}from"./ordinal-Cboi1Yqb.js";import{p as vt}from"./pie-BzT_uFpD.js";import"./index-DcXMQoC_.js";import"./line-D94wfqqt.js";import"./array-BKyUJesY.js";import"./path-CbwjOpE9.js";import"./init-Gi6I4Gst.js";var St=ft.pie,R={sections:new Map,showData:!1},T=R.sections,L=R.showData,xt=structuredClone(St),wt=l(()=>structuredClone(xt),"getConfig"),$t=l(()=>{T=new Map,L=R.showData,ht()},"clear"),Ct=l(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),E.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),yt=l(()=>T,"getSections"),Dt=l(t=>{L=t},"setShowData"),Tt=l(()=>L,"getShowData"),V={getConfig:wt,clear:$t,setDiagramTitle:st,getDiagramTitle:nt,setAccTitle:ot,getAccTitle:it,setAccDescription:rt,getAccDescription:at,addSection:Ct,getSections:yt,setShowData:Dt,getShowData:Tt},bt=l((t,a)=>{et(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),At={parse:l(async t=>{const a=await mt("pie",t);E.debug(a),bt(a,V)},"parse")},_t=l(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),kt=_t,zt=l(t=>{const a=[...t.values()].reduce((n,u)=>n+u,0),W=[...t.entries()].map(([n,u])=>({label:n,value:u})).filter(n=>n.value/a*100>=1);return vt().value(n=>n.value).sort(null)(W)},"createPieArcs"),Et=l((t,a,W,F)=>{var I;E.debug(`rendering pie chart
`+t);const n=F.db,u=lt(),h=ct(n.getConfig(),u.pie),H=40,i=18,c=4,$=450,S=$,b=dt(a),C=b.append("g");C.attr("transform","translate("+S/2+","+$/2+")");const{themeVariables:o}=u;let[M]=pt(o.pieOuterStrokeWidth);M??(M=2);const X=h.legendPosition,O=h.textPosition,Z=h.donutHole>0&&h.donutHole<=.9?h.donutHole:0,f=Math.min(S,$)/2-H,j=U().innerRadius(Z*f).outerRadius(f),q=U().innerRadius(f*O).outerRadius(f*O),x=C.append("g");x.append("circle").attr("cx",0).attr("cy",0).attr("r",f+M/2).attr("class","pieOuterCircle");const y=n.getSections(),J=zt(y),K=[o.pie1,o.pie2,o.pie3,o.pie4,o.pie5,o.pie6,o.pie7,o.pie8,o.pie9,o.pie10,o.pie11,o.pie12];let A=0;y.forEach(e=>{A+=e});const P=J.filter(e=>(e.data.value/A*100).toFixed(0)!=="0"),_=ut(K).domain([...y.keys()]);x.selectAll("mySlices").data(P).enter().append("path").attr("d",j).attr("fill",e=>_(e.data.label)).attr("class",e=>{let r="pieCircle";return h.highlightSlice==="hover"?r+=" highlightedOnHover":h.highlightSlice===e.data.label&&(r+=" highlighted"),r}),x.selectAll("mySlices").data(P).enter().append("text").text(e=>(e.data.value/A*100).toFixed(0)+"%").attr("transform",e=>"translate("+q.centroid(e)+")").style("text-anchor","middle").attr("class","slice");const Q=C.append("text").text(n.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),w=[...y.entries()].map(([e,r])=>({label:e,value:r})),m=C.selectAll(".legend").data(w).enter().append("g").attr("class","legend");m.append("rect").attr("width",i).attr("height",i).style("fill",e=>_(e.label)).style("stroke",e=>_(e.label)),m.append("text").attr("x",i+c).attr("y",i-c).text(e=>n.getShowData()?`${e.label} [${e.value}]`:e.label);const v=Math.max(...m.selectAll("text").nodes().map(e=>(e==null?void 0:e.getBoundingClientRect().width)??0));let D=$,k=S+H;const s=i+c,z=w.length*s;switch(X){case"center":m.attr("transform",(e,r)=>{const d=s*w.length/2,p=-v/2-(i+c),g=r*s-d;return"translate("+p+","+g+")"});break;case"top":D+=z,m.attr("transform",(e,r)=>{const d=f,p=-v/2-(i+c),g=r*s-d;return`translate(${p}, ${g})`}),x.attr("transform",()=>`translate(0, ${z+s})`);break;case"bottom":D+=z,m.attr("transform",(e,r)=>{const d=-f-s,p=-v/2-(i+c),g=r*s-d;return"translate("+p+","+g+")"});break;case"left":k+=i+c+v,m.attr("transform",(e,r)=>{const d=s*w.length/2,p=-f-(i+c),g=r*s-d;return"translate("+p+","+g+")"}),x.attr("transform",()=>`translate(${v+i+c}, 0)`);break;case"right":default:k+=i+c+v,m.attr("transform",(e,r)=>{const d=s*w.length/2,p=12*i,g=r*s-d;return"translate("+p+","+g+")"});break}const B=((I=Q.node())==null?void 0:I.getBoundingClientRect().width)??0,Y=S/2-B/2,tt=S/2+B/2,G=Math.min(0,Y),N=Math.max(k,tt)-G;b.attr("viewBox",`${G} 0 ${N} ${D}`),gt(b,D,N,h.useMaxWidth)},"draw"),Rt={draw:Et},Xt={parser:At,db:V,renderer:Rt,styles:kt};export{Xt as diagram};
