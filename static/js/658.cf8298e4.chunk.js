"use strict";(self.webpackChunklsnp=self.webpackChunklsnp||[]).push([[658],{569:(e,t,r)=>{r.d(t,{A:()=>c});var n=r(43),i=r(464),o=r(579);const s=i.Ay.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,a=i.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${e=>e.$backgroundImage?`url(${e.$backgroundImage})`:"none"};
  background-size: cover;
  background-position: center;
  filter: brightness(0.7); /* Darken the background for better text readability */
  transition: background-image 1s ease-in-out;
  
  /* Fallback background if no image is provided */
  background-color: ${e=>e.$backgroundImage?"transparent":"#121212"};
`,l=i.Ay.div`
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
`,c=e=>{let{children:t,backgroundImage:r}=e;const i=(0,n.useRef)(null);return(0,n.useEffect)(()=>{const e=()=>{};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]),(0,o.jsxs)(s,{ref:i,children:[(0,o.jsx)(a,{$backgroundImage:r}),(0,o.jsx)(l,{children:t})]})}},658:(e,t,r)=>{r.r(t),r.d(t,{default:()=>S});var n=r(43),i=r(464),o=r(82),s=r(569),a=r(579);const l=i.Ay.div`
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
  cursor: ${e=>e.$isComplete?"default":"pointer"};
  position: relative;
  font-family: 'Noto Serif', serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  
  /* Add a subtle border */
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Ensure proper text wrapping */
  white-space: pre-wrap;
  word-wrap: break-word;
`,c=i.Ay.span`
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
`,d=e=>{let{text:t,typingSpeed:r=30,onComplete:i=()=>{},instantDisplay:o=!1,className:s}=e;const[d,u]=(0,n.useState)(""),[f,p]=(0,n.useState)(!1),m=(0,n.useRef)(null),g=(0,n.useRef)(null),b=(0,n.useRef)(0);(0,n.useEffect)(()=>(b.current=0,u(""),p(!1),g.current&&clearInterval(g.current),o?(u(t),p(!0),void i()):(g.current=setInterval(()=>{b.current<t.length?(u(e=>e+t[b.current]),b.current++):(clearInterval(g.current),p(!0),i())},r),()=>{g.current&&clearInterval(g.current)})),[t,r,i,o]);return(0,a.jsxs)(l,{ref:m,onClick:()=>{f||(clearInterval(g.current),u(t),p(!0),i())},className:s,$isComplete:f,children:[d,!f&&(0,a.jsx)(c,{})]})},u=i.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
`,f=i.Ay.button`
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
`,p=e=>{let{choices:t=[],onSelect:r,visible:i=!0,className:o}=e;const[s,l]=(0,n.useState)(null),[c,d]=(0,n.useState)(!1);(0,n.useEffect)(()=>{d(!1);const e=setTimeout(()=>{d(!0)},200*t.length);return()=>clearTimeout(e)},[t]);return i&&0!==t.length?(0,a.jsx)(u,{className:o,children:t.map((e,t)=>(0,a.jsx)(f,{onClick:()=>((e,t)=>{r&&c&&r(e,t)})(e,t),onMouseEnter:()=>l(t),onMouseLeave:()=>l(null),isHovered:s===t,animationDelay:.2*t,animationComplete:c,disabled:!c,children:e},`choice-${t}`))}):null},m=i.Ay.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`,g=e=>{let{sceneDescription:t,characters:r=[],mood:i="neutral",onRenderComplete:o=()=>{},className:s}=e;return n.useEffect(()=>{o()},[o]),(0,a.jsx)(m,{className:s})},b=e=>{let{character:t,position:r="center",emotion:n="neutral",speaking:i=!1,entering:o=!1,exiting:s=!1,size:a="medium"}=e;return null};r(41);const h=i.Ay.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
`,x=i.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ffffff;
`,y=i.Ay.div`
  margin-top: 1rem;
  font-size: 1.2rem;
  font-family: 'Noto Sans', sans-serif;
`,v=i.Ay.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`,k=i.Ay.div`
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
`,w=i.Ay.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 20;
`,j=i.Ay.button`
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
`,S=()=>{const e=(0,o.Im)(),[t,r]=(0,n.useState)(!1),[i,l]=(0,n.useState)(null);return(0,n.useEffect)(()=>(r(!1),e.currentScene&&l({stop:()=>{}}),()=>{i&&i.stop()}),[e.currentScene]),e.currentScene?(0,a.jsxs)(s.A,{children:[(0,a.jsx)(g,{sceneDescription:e.currentScene.content,characters:e.characters,mood:e.currentScene.mood}),e.characters.map(e=>(0,a.jsx)(b,{character:e,position:e.position,emotion:e.emotion||"neutral",size:e.size||"medium"},e.id)),(0,a.jsxs)(h,{children:[(0,a.jsx)(d,{text:e.currentScene.content,typingSpeed:e.settings.textSpeed,onComplete:()=>{r(!0),i&&(i.stop(),l(null))},instantDisplay:e.isLoading}),(0,a.jsx)(p,{choices:e.currentScene.choices,onSelect:(t,n)=>{r(!1),e.selectChoice(n)},visible:t&&!e.isLoading})]}),e.isLoading&&(0,a.jsx)(k,{children:(0,a.jsx)(v,{})}),(0,a.jsxs)(w,{children:[(0,a.jsx)(j,{onClick:()=>e.setCurrentScreen("settings"),children:"\uc124\uc815"}),(0,a.jsx)(j,{onClick:()=>e.setCurrentScreen("title"),children:"\uba54\uc778 \uba54\ub274"})]})]}):(0,a.jsx)(s.A,{children:(0,a.jsxs)(x,{children:[(0,a.jsx)(v,{}),(0,a.jsx)(y,{children:"\uc774\uc57c\uae30 \ubd88\ub7ec\uc624\ub294 \uc911..."})]})})}}}]);
//# sourceMappingURL=658.cf8298e4.chunk.js.map