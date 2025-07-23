"use strict";(self.webpackChunklsnp=self.webpackChunklsnp||[]).push([[657],{569:(e,r,t)=>{t.d(r,{A:()=>c});var o=t(43),n=t(464),i=t(579);const a=n.Ay.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,s=n.Ay.div`
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
`,l=n.Ay.div`
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
`,c=e=>{let{children:r,backgroundImage:t}=e;const n=(0,o.useRef)(null);return(0,o.useEffect)(()=>{const e=()=>{};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]),(0,i.jsxs)(a,{ref:n,children:[(0,i.jsx)(s,{backgroundImage:t}),(0,i.jsx)(l,{children:r})]})}},657:(e,r,t)=>{t.r(r),t.d(r,{default:()=>p});var o=t(43),n=t(464),i=t(82),a=t(569),s=t(579);const l=n.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
`,c=n.Ay.h1`
  font-size: 4rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Serif', serif;
  letter-spacing: 2px;
`,d=n.Ay.h2`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.8;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Sans', sans-serif;
  font-weight: 300;
`,g=n.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
`,f=n.Ay.button`
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
`,m=n.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
`,u=n.Ay.label`
  font-size: 1.2rem;
  text-align: center;
`,b=n.Ay.input`
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 1rem;
  font-size: 1.2rem;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`,x=(0,n.Ay)(f)`
  margin-top: 1rem;
`,h=n.Ay.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.8rem;
  opacity: 0.5;
`,p=()=>{const e=(0,i.Im)(),[r,t]=(0,o.useState)(!1),[n,p]=(0,o.useState)(e.playerName||""),[y,k]=(0,o.useState)(!1);(0,o.useEffect)(()=>{const e=localStorage.getItem("pigeonweed_save");t(!!e)},[]);const v=()=>{n.trim()?(e.setPlayerName(n),e.startNewGame()):k(!0)};return(0,s.jsx)(a.A,{children:(0,s.jsxs)(l,{children:[(0,s.jsx)(c,{children:"\ube44\ub458\uae30\ubc25\uc758 \ubc24"}),(0,s.jsx)(d,{children:"\ube44\ub458\uae30\ubc25\uc758 \ubc24"}),y?(0,s.jsxs)(m,{onSubmit:r=>{r.preventDefault(),n.trim()&&(e.setPlayerName(n),v())},children:[(0,s.jsx)(u,{children:"\uc774\ub984\uc744 \uc785\ub825\ud558\uc138\uc694:"}),(0,s.jsx)(b,{type:"text",value:n,onChange:e=>{p(e.target.value)},autoFocus:!0,maxLength:20,placeholder:"\ub2f9\uc2e0\uc758 \uc774\ub984..."}),(0,s.jsx)(x,{type:"submit",children:"\uc2dc\uc791"})]}):(0,s.jsxs)(g,{children:[(0,s.jsx)(f,{onClick:v,children:"\uc0c8 \uac8c\uc784"}),r&&(0,s.jsx)(f,{onClick:()=>{e.setCurrentScreen("game")},children:"\uc774\uc5b4\ud558\uae30"}),(0,s.jsx)(f,{onClick:()=>{e.setCurrentScreen("auth")},children:"\ub85c\uadf8\uc778 / \ud68c\uc6d0\uac00\uc785"}),(0,s.jsx)(f,{onClick:()=>{e.setCurrentScreen("settings")},children:"\uc124\uc815"}),(0,s.jsx)(f,{onClick:()=>{e.setCurrentScreen("credits")},children:"\uc81c\uc791\uc9c4"})]}),(0,s.jsx)(h,{children:"v0.1.0 - \uc54c\ud30c \ubc84\uc804"})]})})}}}]);
//# sourceMappingURL=657.cb75e166.chunk.js.map