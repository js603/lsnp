"use strict";(self.webpackChunklsnp=self.webpackChunklsnp||[]).push([[965],{569:(e,t,i)=>{i.d(t,{A:()=>c});var n=i(43),r=i(464),o=i(960);const a=r.Ay.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,s=r.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${e=>e.backgroundImage?`url(${e.backgroundImage})`:"none"};
  background-size: cover;
  background-position: center;
  filter: brightness(0.7); /* Darken the background for better text readability */
  transition: background-image 1s ease-in-out;
  
  /* Fallback background if no image is provided */
  background-color: ${e=>e.backgroundImage?"transparent":"#121212"};
`,l=r.Ay.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Position content at the bottom */
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
`,c=e=>{let{children:t,backgroundImage:i}=e;const r=(0,n.useRef)(null);return(0,n.useEffect)(()=>{const e=()=>{};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]),(0,o.jsxs)(a,{ref:r,children:[(0,o.jsx)(s,{backgroundImage:i}),(0,o.jsx)(l,{children:t})]})}},965:(e,t,i)=>{i.r(t),i.d(t,{default:()=>$});var n=i(43),r=i(464),o=i(854),a=i(569),s=i(960);const l=r.Ay.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: #f0f0f0;
  padding: 1.5rem;
  border-radius: 8px;
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 800px;
  width: 100%;
  min-height: 150px;
  margin-bottom: 2rem;
  cursor: ${e=>e.isComplete?"default":"pointer"};
  position: relative;
  font-family: 'Noto Serif', serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  
  /* Add a subtle border */
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Ensure proper text wrapping */
  white-space: pre-wrap;
  word-wrap: break-word;
`,c=r.Ay.span`
  display: inline-block;
  width: 0.6rem;
  height: 1.2rem;
  background-color: #f0f0f0;
  margin-left: 2px;
  animation: blink 1s infinite;
  vertical-align: middle;
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`,d=e=>{let{text:t,typingSpeed:i=30,onComplete:r=()=>{},instantDisplay:o=!1,className:a}=e;const[d,h]=(0,n.useState)(""),[f,u]=(0,n.useState)(!1),p=(0,n.useRef)(null),g=(0,n.useRef)(null),m=(0,n.useRef)(0);(0,n.useEffect)(()=>(m.current=0,h(""),u(!1),g.current&&clearInterval(g.current),o?(h(t),u(!0),void r()):(g.current=setInterval(()=>{m.current<t.length?(h(e=>e+t[m.current]),m.current++):(clearInterval(g.current),u(!0),r())},i),()=>{g.current&&clearInterval(g.current)})),[t,i,r,o]);return(0,s.jsxs)(l,{ref:p,onClick:()=>{f||(clearInterval(g.current),h(t),u(!0),r())},className:a,isComplete:f,children:[d,!f&&(0,s.jsx)(c,{})]})},h=r.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
`,f=r.Ay.button`
  background-color: rgba(0, 0, 0, 0.7);
  color: ${e=>e.isHovered?"#ffffff":"#d0d0d0"};
  border: 1px solid rgba(255, 255, 255, ${e=>e.isHovered?"0.3":"0.1"});
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Noto Sans', sans-serif;
  position: relative;
  overflow: hidden;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: ${e=>e.animationComplete?1:0};
  transform: ${e=>e.animationComplete?"translateY(0)":"translateY(20px)"};
  transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease, color 0.2s ease, border 0.2s ease;
  transition-delay: ${e=>e.animationDelay}s;
  
  &:hover, &:focus {
    background-color: rgba(40, 40, 40, 0.9);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.5);
    outline: none;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  /* Add a subtle indicator for the choice */
  &::before {
    content: '•';
    position: absolute;
    left: 0.5rem;
    opacity: ${e=>e.isHovered?1:0};
    transition: opacity 0.2s ease;
  }
  
  /* Disable button styling when animation is not complete */
  &:disabled {
    cursor: default;
    pointer-events: none;
  }
`,u=e=>{let{choices:t=[],onSelect:i,visible:r=!0,className:o}=e;const[a,l]=(0,n.useState)(null),[c,d]=(0,n.useState)(!1);(0,n.useEffect)(()=>{d(!1);const e=setTimeout(()=>{d(!0)},200*t.length);return()=>clearTimeout(e)},[t]);return r&&0!==t.length?(0,s.jsx)(h,{className:o,children:t.map((e,t)=>(0,s.jsx)(f,{onClick:()=>((e,t)=>{i&&c&&i(e,t)})(e,t),onMouseEnter:()=>l(t),onMouseLeave:()=>l(null),isHovered:a===t,animationDelay:.2*t,animationComplete:c,disabled:!c,children:e},`choice-${t}`))}):null};const p=new class{constructor(){this.canvas=null,this.ctx=null,this.width=0,this.height=0,this.renderQueue=[],this.animationFrameId=null,this.isRendering=!1}initialize(e,t,i){return this.canvas=e,this.ctx=e.getContext("2d"),this.width=t||e.width,this.height=i||e.height,this.canvas.width=this.width,this.canvas.height=this.height,console.log(`Canvas initialized with dimensions ${this.width}x${this.height}`),this}clear(){this.ctx&&this.ctx.clearRect(0,0,this.width,this.height)}startRendering(){this.isRendering||(this.isRendering=!0,this.render())}stopRendering(){this.isRendering=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null)}render(){if(this.isRendering){for(;this.renderQueue.length>0;){this.renderQueue.shift().render(this.ctx,this.width,this.height)}this.animationFrameId=requestAnimationFrame(()=>this.render())}}addToRenderQueue(e){this.renderQueue.push(e),this.isRendering||this.startRendering()}drawBackgroundScene(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const{palette:i=["#1a1a2e","#16213e","#0f3460","#e94560"],complexity:n=.5,mood:r="neutral"}=t,o={render:(t,o,a)=>{t.clearRect(0,0,o,a);const s=e.toLowerCase().includes("night")||e.toLowerCase().includes("dark"),l=e.toLowerCase().includes("rain"),c=e.toLowerCase().includes("fog")||e.toLowerCase().includes("mist"),d=e.toLowerCase().includes("forest")||e.toLowerCase().includes("trees"),h=e.toLowerCase().includes("room")||e.toLowerCase().includes("inside")||e.toLowerCase().includes("interior");let f,u,p;s?(f="#0a0a1a",u="#0f0f1f",p="#141428"):(f="#4a6ea5",u="#2c4c2c",p="#3a5a3a"),i.length>=3&&([f,u,p]=i),"dark"===r||"tense"===r?(f=this.darkenColor(f,.3),u=this.darkenColor(u,.3),p=this.darkenColor(p,.3)):"light"===r?(f=this.lightenColor(f,.3),u=this.lightenColor(u,.3),p=this.lightenColor(p,.3)):"mysterious"===r&&(f=this.blendColors(f,"#2a0a4a",.3),u=this.blendColors(u,"#1a0a2a",.3),p=this.blendColors(p,"#2a0a3a",.3));const g=t.createLinearGradient(0,0,0,.6*a);g.addColorStop(0,f),g.addColorStop(1,this.blendColors(f,p,.5)),t.fillStyle=g,t.fillRect(0,0,o,.6*a);const m=t.createLinearGradient(0,.6*a,0,a);if(m.addColorStop(0,p),m.addColorStop(1,u),t.fillStyle=m,t.fillRect(0,.6*a,o,.4*a),d&&!h){const e=Math.floor(10+20*n);for(let i=0;i<e;i++){const e=Math.random()*o,i=.6*a+Math.random()*(.3*a),n=50+100*Math.random(),r=10+20*Math.random();t.fillStyle="#3a2a1a",t.fillRect(e-r/2,i-n,r,n),t.fillStyle=s?"#1a2a1a":"#2a4a2a",t.beginPath(),t.arc(e,i-n,3*r,0,2*Math.PI),t.fill()}}else if(h&&(t.fillStyle=this.lightenColor(p,.2),t.fillRect(0,0,o,a),t.fillStyle=this.darkenColor(u,.1),t.fillRect(0,.7*a,o,.3*a),s||l)){const e=.3*o,i=.4*a,n=.6*o,r=.2*a;if(t.fillStyle="#2a2a2a",t.fillRect(n,r,e,i),t.fillStyle=s?"#0a0a2a":"#4a6ea5",t.fillRect(n+10,r+10,e-20,i-20),l){t.strokeStyle="rgba(200, 200, 255, 0.5)",t.lineWidth=1;for(let o=0;o<20;o++){const o=n+10+Math.random()*(e-20),a=r+10+Math.random()*(i-20),s=5+15*Math.random();t.beginPath(),t.moveTo(o,a),t.lineTo(o+2,a+s),t.stroke()}}}if(l&&!h){t.strokeStyle="rgba(200, 200, 255, 0.5)",t.lineWidth=1;for(let e=0;e<100;e++){const e=Math.random()*o,i=Math.random()*a,n=10+20*Math.random();t.beginPath(),t.moveTo(e,i),t.lineTo(e+4,i+n),t.stroke()}}if(c){t.fillStyle="rgba(255, 255, 255, 0.2)";for(let e=0;e<5;e++){const e=Math.random()*a,i=50+100*Math.random();t.beginPath(),t.rect(0,e,o,i),t.fill()}}const x=Math.floor(50*n);for(let e=0;e<x;e++){const e=Math.random()*o,i=Math.random()*a,n=1+3*Math.random();t.fillStyle=`rgba(255, 255, 255, ${.1*Math.random()})`,t.beginPath(),t.arc(e,i,n,0,2*Math.PI),t.fill()}}};this.addToRenderQueue(o)}drawSilhouette(e,t){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const{size:n=100,opacity:r=.8,color:o="#000000"}=i,a={render:(i,a,s)=>{let l,c;"left"===t?(l=.25*a,c=.8*s):"right"===t?(l=.75*a,c=.8*s):(l=.5*a,c=.8*s);const d=e.toLowerCase().includes("tall"),h=e.toLowerCase().includes("short"),f=e.toLowerCase().includes("slender")||e.toLowerCase().includes("thin"),u=e.toLowerCase().includes("large")||e.toLowerCase().includes("big");let p=n;d&&(p*=1.2),h&&(p*=.8),f&&(p*=.9),u&&(p*=1.3),i.fillStyle=`rgba(${parseInt(o.slice(1,3),16)}, ${parseInt(o.slice(3,5),16)}, ${parseInt(o.slice(5,7),16)}, ${r})`;const g=.2*p;i.beginPath(),i.arc(l,c-.8*p,g,0,2*Math.PI),i.fill(),i.beginPath(),i.moveTo(l-.3*p,c-.6*p),i.lineTo(l-.25*p,c),i.lineTo(l+.25*p,c),i.lineTo(l+.3*p,c-.6*p),i.closePath(),i.fill(),i.beginPath(),i.moveTo(l-.3*p,c-.55*p),i.lineTo(l-.5*p,c-.3*p),i.lineTo(l-.45*p,c-.25*p),i.lineTo(l-.25*p,c-.5*p),i.closePath(),i.fill(),i.beginPath(),i.moveTo(l+.3*p,c-.55*p),i.lineTo(l+.5*p,c-.3*p),i.lineTo(l+.45*p,c-.25*p),i.lineTo(l+.25*p,c-.5*p),i.closePath(),i.fill()}};this.addToRenderQueue(a)}drawEffect(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const{intensity:i=.5,duration:n=2e3,color:r="#ffffff"}=t,o={startTime:Date.now(),duration:n,render:(t,n,a)=>{const s=Date.now()-o.startTime,l=Math.min(s/o.duration,1);if(l>=1){const e=this.renderQueue.indexOf(o);return void(-1!==e&&this.renderQueue.splice(e,1))}const c=e.toLowerCase().includes("flash"),d=e.toLowerCase().includes("fade"),h=e.toLowerCase().includes("shake"),f=e.toLowerCase().includes("reveal");if(c){const e=i*Math.sin(l*Math.PI);t.fillStyle=`rgba(${parseInt(r.slice(1,3),16)}, ${parseInt(r.slice(3,5),16)}, ${parseInt(r.slice(5,7),16)}, ${e})`,t.fillRect(0,0,n,a)}else if(d){const e=i*(d.includes("in")?l:1-l);t.fillStyle=`rgba(0, 0, 0, ${e})`,t.fillRect(0,0,n,a)}else if(h){const e=10*i*(1-l),n=Math.random()*e*2-e,r=Math.random()*e*2-e;t.save(),t.translate(n,r),t.restore()}else if(f){const i=l;if(t.fillStyle="rgba(0, 0, 0, 1)",e.toLowerCase().includes("left"))t.fillRect(n*i,0,n*(1-i),a);else if(e.toLowerCase().includes("right"))t.fillRect(0,0,n*(1-i),a);else if(e.toLowerCase().includes("top"))t.fillRect(0,a*i,n,a*(1-i));else if(e.toLowerCase().includes("bottom"))t.fillRect(0,0,n,a*(1-i));else{const e=Math.sqrt(n*n+a*a)*i;t.beginPath(),t.arc(n/2,a/2,e,0,2*Math.PI),t.clip()}}}};return this.addToRenderQueue(o),new Promise(e=>{setTimeout(e,n)})}darkenColor(e,t){const i=parseInt(e.slice(1,3),16),n=parseInt(e.slice(3,5),16),r=parseInt(e.slice(5,7),16),o=Math.max(0,Math.floor(i*(1-t))),a=Math.max(0,Math.floor(n*(1-t))),s=Math.max(0,Math.floor(r*(1-t)));return`#${o.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}${s.toString(16).padStart(2,"0")}`}lightenColor(e,t){const i=parseInt(e.slice(1,3),16),n=parseInt(e.slice(3,5),16),r=parseInt(e.slice(5,7),16),o=Math.min(255,Math.floor(i+(255-i)*t)),a=Math.min(255,Math.floor(n+(255-n)*t)),s=Math.min(255,Math.floor(r+(255-r)*t));return`#${o.toString(16).padStart(2,"0")}${a.toString(16).padStart(2,"0")}${s.toString(16).padStart(2,"0")}`}blendColors(e,t,i){const n=parseInt(e.slice(1,3),16),r=parseInt(e.slice(3,5),16),o=parseInt(e.slice(5,7),16),a=parseInt(t.slice(1,3),16),s=parseInt(t.slice(3,5),16),l=parseInt(t.slice(5,7),16),c=Math.floor(n*(1-i)+a*i),d=Math.floor(r*(1-i)+s*i),h=Math.floor(o*(1-i)+l*i);return`#${c.toString(16).padStart(2,"0")}${d.toString(16).padStart(2,"0")}${h.toString(16).padStart(2,"0")}`}};var g=i(513);const m=async(e,t)=>{try{const n={palette:["#1a1a2e","#16213e","#0f3460","#e94560"],complexity:.5,effects:[]};if(!e||e.length<10)return n;const r=`\n      Based on the following scene description, generate visual directives for rendering the scene.\n      The mood of the scene is: ${t}.\n      \n      Scene description: "${e}"\n      \n      Respond with a JSON object containing:\n      1. A color palette (array of 4 hex colors: sky, ground, middle, accent)\n      2. Complexity value (0.0 to 1.0)\n      3. Optional array of visual effects (each with description, intensity, duration, color)\n      \n      Example format:\n      {\n        "palette": ["#1a1a2e", "#16213e", "#0f3460", "#e94560"],\n        "complexity": 0.7,\n        "effects": [\n          {\n            "description": "flash",\n            "intensity": 0.5,\n            "duration": 2000,\n            "color": "#ffffff"\n          }\n        ]\n      }\n    `,o=await g.Ay.generateStoryContent(r,{temperature:.3,maxTokens:256});try{const e=o.match(/\{[\s\S]*}/);if(e){const t=JSON.parse(e[0]);return(!t.palette||!Array.isArray(t.palette)||t.palette.length<4)&&(t.palette=n.palette),("number"!==typeof t.complexity||t.complexity<0||t.complexity>1)&&(t.complexity=n.complexity),t.effects&&Array.isArray(t.effects)||(t.effects=[]),t}}catch(i){console.error("Error parsing LLM response:",i)}return n}catch(n){return console.error("Error generating visual directives:",n),{palette:["#1a1a2e","#16213e","#0f3460","#e94560"],complexity:.5,effects:[]}}},x=r.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  opacity: ${e=>e.isRendering?.7:1};
  transition: opacity 0.5s ease;
`,C=r.Ay.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`,b=e=>{let{sceneDescription:t,characters:i=[],mood:r="neutral",onRenderComplete:o=()=>{},className:a}=e;const l=(0,n.useRef)(null),[c,d]=(0,n.useState)({width:0,height:0}),[h,f]=(0,n.useState)(!1),u=((e,t,i)=>((0,n.useEffect)(()=>{if(e.current)return p.initialize(e.current,t,i),p.startRendering(),()=>{p.stopRendering()}},[e,t,i]),p))(l,c.width,c.height);return(0,n.useEffect)(()=>{const e=()=>{if(l.current){const{clientWidth:e,clientHeight:t}=l.current.parentElement;d({width:e,height:t})}};return e(),window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]),(0,n.useEffect)(()=>{if(!t||!u||0===c.width)return;(async()=>{f(!0);try{const e=await m(t,r);if(u.drawBackgroundScene(t,{palette:e.palette,complexity:e.complexity,mood:r}),i.forEach(e=>{u.drawSilhouette(e.description,e.position,{size:e.size||100,opacity:e.opacity||.8,color:e.color||"#000000"})}),e.effects&&e.effects.length>0)for(const t of e.effects)await u.drawEffect(t.description,{intensity:t.intensity||.5,duration:t.duration||2e3,color:t.color||"#ffffff"});o()}catch(e){console.error("Error rendering scene:",e)}finally{f(!1)}})()},[t,i,r,c,u,o]),(0,s.jsxs)(x,{className:a,isRendering:h,children:[(0,s.jsx)("canvas",{ref:l}),h&&(0,s.jsx)(C,{})]})},y=e=>{let{character:t,position:i="center",emotion:r="neutral",speaking:o=!1,entering:a=!1,exiting:l=!1,size:c="medium"}=e;const d=(0,n.useRef)(null);(0,n.useEffect)(()=>{if(!d.current)return;const e=d.current;e.className="character-silhouette",e.classList.add(`position-${i}`),e.classList.add(`emotion-${r}`),e.classList.add(`size-${c}`),o&&e.classList.add("speaking"),a&&e.classList.add("entering"),l&&e.classList.add("exiting")},[i,r,o,a,l,c]);return t?(0,s.jsxs)("div",{ref:d,className:`character-silhouette position-${i} emotion-${r} size-${c} ${o?"speaking":""} ${a?"entering":""} ${l?"exiting":""}`,"data-character-id":t.id,"data-character-name":t.name,role:"img","aria-label":`${t.name||"\uce90\ub9ad\ud130"} ${o?"\ub9d0\ud558\ub294 \uc911":""} ${"neutral"!==r?r:""}`,children:[(()=>{if(!t||!t.type)return(0,s.jsxs)("svg",{viewBox:"0 0 100 200",className:"silhouette-svg",children:[(0,s.jsx)("path",{d:"M50,10 C65,10 75,25 75,40 C75,55 65,70 50,70 C35,70 25,55 25,40 C25,25 35,10 50,10 Z"}),(0,s.jsx)("path",{d:"M30,75 C40,73 60,73 70,75 C75,75 80,80 80,85 L80,180 C80,190 75,195 70,195 L30,195 C25,195 20,190 20,180 L20,85 C20,80 25,75 30,75 Z"})]});switch(t.type){case"adult-male":return(0,s.jsxs)("svg",{viewBox:"0 0 100 200",className:"silhouette-svg",children:[(0,s.jsx)("path",{d:"M50,10 C67,10 80,23 80,40 C80,57 67,70 50,70 C33,70 20,57 20,40 C20,23 33,10 50,10 Z"}),(0,s.jsx)("path",{d:"M30,75 C40,73 60,73 70,75 C75,75 85,80 85,85 L85,180 C85,190 80,195 75,195 L25,195 C20,195 15,190 15,180 L15,85 C15,80 25,75 30,75 Z"})]});case"adult-female":return(0,s.jsxs)("svg",{viewBox:"0 0 100 200",className:"silhouette-svg",children:[(0,s.jsx)("path",{d:"M50,10 C65,10 75,25 75,40 C75,55 65,70 50,70 C35,70 25,55 25,40 C25,25 35,10 50,10 Z"}),(0,s.jsx)("path",{d:"M30,75 C40,73 60,73 70,75 C80,80 85,100 90,130 C92,150 85,180 80,195 L20,195 C15,180 8,150 10,130 C15,100 20,80 30,75 Z"})]});case"child":return(0,s.jsxs)("svg",{viewBox:"0 0 100 200",className:"silhouette-svg",children:[(0,s.jsx)("path",{d:"M50,20 C62,20 70,32 70,45 C70,58 62,70 50,70 C38,70 30,58 30,45 C30,32 38,20 50,20 Z"}),(0,s.jsx)("path",{d:"M35,75 C42,73 58,73 65,75 C70,75 75,80 75,85 L75,180 C75,190 70,195 65,195 L35,195 C30,195 25,190 25,180 L25,85 C25,80 30,75 35,75 Z"})]});case"elderly":return(0,s.jsxs)("svg",{viewBox:"0 0 100 200",className:"silhouette-svg",children:[(0,s.jsx)("path",{d:"M50,10 C65,10 75,25 75,40 C75,55 65,70 50,70 C35,70 25,55 25,40 C25,25 35,10 50,10 Z"}),(0,s.jsx)("path",{d:"M40,75 C45,73 55,73 60,75 C65,75 70,80 70,85 C75,110 75,140 70,170 L70,180 C70,190 65,195 60,195 L40,195 C35,195 30,190 30,180 L30,170 C25,140 25,110 30,85 C30,80 35,75 40,75 Z"})]});default:return(0,s.jsxs)("svg",{viewBox:"0 0 100 200",className:"silhouette-svg",children:[(0,s.jsx)("path",{d:"M50,10 C65,10 75,25 75,40 C75,55 65,70 50,70 C35,70 25,55 25,40 C25,25 35,10 50,10 Z"}),(0,s.jsx)("path",{d:"M30,75 C40,73 60,73 70,75 C75,75 80,80 80,85 L80,180 C80,190 75,195 70,195 L30,195 C25,195 20,190 20,180 L20,85 C20,80 25,75 30,75 Z"})]})}})(),t.showName&&(0,s.jsx)("div",{className:"character-name","aria-hidden":"true",children:t.name})]}):null};var v=i(707);const w=r.Ay.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
`,S=r.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ffffff;
`,M=r.Ay.div`
  margin-top: 1rem;
  font-size: 1.2rem;
  font-family: 'Noto Sans', sans-serif;
`,L=r.Ay.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`,k=r.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`,j=r.Ay.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 20;
`,I=r.Ay.button`
  background-color: rgba(0, 0, 0, 0.7);
  color: #d0d0d0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.9);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.5);
  }
`,$=()=>{const e=(0,o.Im)(),[t,i]=(0,n.useState)(!1),[r,l]=(0,n.useState)(null);return(0,n.useEffect)(()=>{if(i(!1),e.currentScene){const e=v.Ay.playSfx("UI_TEXT_TYPING",{loop:!0});l(e)}return()=>{r&&v.Ay.stopSfx("UI_TEXT_TYPING")}},[e.currentScene,r]),e.currentScene?(0,s.jsxs)(a.A,{children:[(0,s.jsx)(b,{sceneDescription:e.currentScene.content,characters:e.characters,mood:e.currentScene.mood,onRenderComplete:()=>{}}),e.characters.map(e=>(0,s.jsx)(y,{position:e.position,emotion:e.emotion||"neutral",size:e.size||"medium",opacity:e.opacity||.8},e.id)),(0,s.jsxs)(w,{children:[(0,s.jsx)(d,{text:e.currentScene.content,typingSpeed:e.settings.textSpeed,onComplete:()=>{var t,n;i(!0),r&&(v.Ay.stopSfx("UI_TEXT_TYPING"),l(null)),(null===(t=e.currentScene)||void 0===t||null===(n=t.choices)||void 0===n?void 0:n.length)>0&&v.Ay.playSfx("UI_CHOICE_APPEAR")},instantDisplay:e.isLoading}),(0,s.jsx)(u,{choices:e.currentScene.choices,onSelect:(t,n)=>{i(!1),e.selectChoice(n)},visible:t&&!e.isLoading})]}),e.isLoading&&(0,s.jsx)(k,{children:(0,s.jsx)(L,{})}),(0,s.jsxs)(j,{children:[(0,s.jsx)(I,{onClick:()=>e.setCurrentScreen("settings"),children:"Settings"}),(0,s.jsx)(I,{onClick:()=>e.setCurrentScreen("title"),children:"Main Menu"})]})]}):(0,s.jsx)(a.A,{children:(0,s.jsxs)(S,{children:[(0,s.jsx)(L,{}),(0,s.jsx)(M,{children:"Loading story..."})]})})}}}]);
//# sourceMappingURL=965.2ab134bc.chunk.js.map