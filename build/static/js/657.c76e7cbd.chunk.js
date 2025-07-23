"use strict";(self.webpackChunklsnp=self.webpackChunklsnp||[]).push([[657],{569:(e,r,t)=>{t.d(r,{A:()=>l});var n=t(43),i=t(464),o=t(960);const a=i.Ay.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,s=i.Ay.div`
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
`,c=i.Ay.div`
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
`,l=e=>{let{children:r,backgroundImage:t}=e;const i=(0,n.useRef)(null);return(0,n.useEffect)(()=>{const e=()=>{};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]),(0,o.jsxs)(a,{ref:i,children:[(0,o.jsx)(s,{backgroundImage:t}),(0,o.jsx)(c,{children:r})]})}},657:(e,r,t)=>{t.r(r),t.d(r,{default:()=>y});var n=t(43),i=t(464),o=t(854),a=t(569),s=t(707),c=t(960);const l=i.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
`,d=i.Ay.h1`
  font-size: 4rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Serif', serif;
  letter-spacing: 2px;
`,g=i.Ay.h2`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.8;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Sans', sans-serif;
  font-weight: 300;
`,u=i.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
`,f=i.Ay.button`
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
`,m=i.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
`,x=i.Ay.label`
  font-size: 1.2rem;
  text-align: center;
`,p=i.Ay.input`
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
`,b=(0,i.Ay)(f)`
  margin-top: 1rem;
`,h=i.Ay.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.8rem;
  opacity: 0.5;
`,y=()=>{const e=(0,o.Im)(),[r,t]=(0,n.useState)(!1),[i,y]=(0,n.useState)(e.playerName||""),[w,k]=(0,n.useState)(!1);(0,n.useEffect)(()=>{const e=localStorage.getItem("pigeonweed_save");return t(!!e),()=>{}},[e.currentBgm]);const A=async()=>{try{return await s.Ay.audioManager.initializeAfterUserInteraction(),"MAIN_THEME"!==e.currentBgm&&s.Ay.playMusic("MAIN_THEME",{volume:-12}),s.Ay.applyAtmosphericEffect(.3),!0}catch(r){return console.error("Failed to initialize audio:",r),!1}},v=async()=>{i.trim()?(await A(),e.setPlayerName(i),e.startNewGame()):k(!0)};return(0,c.jsx)(a.A,{children:(0,c.jsxs)(l,{children:[(0,c.jsx)(d,{children:"\ube44\ub458\uae30\ubc25\uc758 \ubc24"}),(0,c.jsx)(g,{children:"Night of Pigeonweed"}),w?(0,c.jsxs)(m,{onSubmit:async r=>{r.preventDefault(),i.trim()&&(await A(),e.setPlayerName(i),v())},children:[(0,c.jsx)(x,{children:"Enter your name:"}),(0,c.jsx)(p,{type:"text",value:i,onChange:e=>{y(e.target.value)},autoFocus:!0,maxLength:20,placeholder:"Your name..."}),(0,c.jsx)(b,{type:"submit",children:"Start"})]}):(0,c.jsxs)(u,{children:[(0,c.jsx)(f,{onClick:v,children:"New Game"}),r&&(0,c.jsx)(f,{onClick:async()=>{await A(),e.setCurrentScreen("game"),s.Ay.playSfx("UI_CLICK")},children:"Continue"}),(0,c.jsx)(f,{onClick:async()=>{await A(),s.Ay.playSfx("UI_CLICK"),e.setCurrentScreen("auth")},children:"Login / Register"}),(0,c.jsx)(f,{onClick:async()=>{await A(),s.Ay.playSfx("UI_CLICK"),e.setCurrentScreen("settings")},children:"Settings"}),(0,c.jsx)(f,{onClick:async()=>{await A(),s.Ay.playSfx("UI_CLICK"),e.setCurrentScreen("credits")},children:"Credits"})]}),(0,c.jsx)(h,{children:"v0.1.0 - Alpha"})]})})}}}]);
//# sourceMappingURL=657.c76e7cbd.chunk.js.map