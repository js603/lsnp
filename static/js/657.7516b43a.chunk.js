"use strict";(self.webpackChunklsnp=self.webpackChunklsnp||[]).push([[657],{569:(e,r,t)=>{t.d(r,{A:()=>d});var n=t(43),o=t(464),i=t(579);const s=o.Ay.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,a=o.Ay.div`
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
`,c=o.Ay.div`
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
`,d=e=>{let{children:r,backgroundImage:t}=e;const o=(0,n.useRef)(null);return(0,n.useEffect)(()=>{const e=()=>{};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]),(0,i.jsxs)(s,{ref:o,children:[(0,i.jsx)(a,{$backgroundImage:t}),(0,i.jsx)(c,{children:r})]})}},657:(e,r,t)=>{t.r(r),t.d(r,{default:()=>b});var n=t(43),o=t(464),i=t(82),s=t(569),a=t(579);const c=o.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
`,d=o.Ay.h1`
  font-size: 4rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Serif', serif;
  letter-spacing: 2px;
`,l=o.Ay.h2`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.8;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Sans', sans-serif;
  font-weight: 300;
`,g=o.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
`,f=o.Ay.button`
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 1rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.8);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`,u=o.Ay.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.8rem;
  opacity: 0.5;
`,b=()=>{const e=(0,i.Im)(),[r,t]=(0,n.useState)(!1);(0,n.useEffect)(()=>{const e=localStorage.getItem("pigeonweed_save");t(!!e)},[]);return(0,a.jsx)(s.A,{children:(0,a.jsxs)(c,{children:[(0,a.jsx)(d,{children:"\ube44\ub458\uae30\ubc25\uc758 \ubc24"}),(0,a.jsx)(l,{children:"\ube44\ub458\uae30\ubc25\uc758 \ubc24"}),(0,a.jsxs)(g,{children:[(0,a.jsx)(f,{onClick:()=>{e.startNewGame()},children:"\uc0c8 \uac8c\uc784"}),r&&(0,a.jsx)(f,{onClick:()=>{e.setCurrentScreen("game")},children:"\uc774\uc5b4\ud558\uae30"}),(0,a.jsx)(f,{onClick:()=>{e.setCurrentScreen("auth")},children:"\ub85c\uadf8\uc778 / \ud68c\uc6d0\uac00\uc785"}),(0,a.jsx)(f,{onClick:()=>{e.setCurrentScreen("settings")},children:"\uc124\uc815"}),(0,a.jsx)(f,{onClick:()=>{e.setCurrentScreen("credits")},children:"\uc81c\uc791\uc9c4"})]}),(0,a.jsx)(u,{children:"v0.1.0 - \uc54c\ud30c \ubc84\uc804"})]})})}}}]);
//# sourceMappingURL=657.7516b43a.chunk.js.map