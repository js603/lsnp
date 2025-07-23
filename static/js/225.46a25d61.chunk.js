"use strict";(self.webpackChunklsnp=self.webpackChunklsnp||[]).push([[225],{225:(e,r,t)=>{t.r(r),t.d(r,{default:()=>k});var o=t(43),a=t(464),n=t(82),i=t(569),s=t(770),d=t(41),l=t(579);const c=a.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
`,u=a.Ay.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Serif', serif;
  letter-spacing: 2px;
`,b=a.Ay.div`
  background-color: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.5);
  color: #ff6666;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 300px;
  text-align: center;
`,g=a.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 1.5rem;
`,f=a.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,p=a.Ay.label`
  font-size: 1rem;
`,m=a.Ay.input`
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`,x=a.Ay.button`
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  
  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 0.8);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`,h=a.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`,y=a.Ay.button`
  background: none;
  border: none;
  color: #66aaff;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  padding: 0;
  
  &:hover:not(:disabled) {
    color: #99ccff;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`,v=a.Ay.button`
  background-color: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 0.6);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`,k=()=>{const e=(0,n.Im)(),[r,t]=(0,o.useState)(!0),[a,k]=(0,o.useState)(""),[w,A]=(0,o.useState)(""),[j,C]=(0,o.useState)(""),[I,S]=(0,o.useState)(""),[E,z]=(0,o.useState)(!1);(0,o.useEffect)(()=>("MAIN_THEME"!==e.currentBgm&&d.A.playMusic("MAIN_THEME",{volume:-12}),d.A.applyAtmosphericEffect(.3),()=>{d.A.applyAtmosphericEffect(0)}),[e.currentBgm]);const N=e=>{switch(e.code){case"auth/invalid-email":return"\uc720\ud6a8\ud558\uc9c0 \uc54a\uc740 \uc774\uba54\uc77c \uc8fc\uc18c\uc785\ub2c8\ub2e4.";case"auth/user-disabled":return"\uc774 \uacc4\uc815\uc740 \ube44\ud65c\uc131\ud654\ub418\uc5c8\uc2b5\ub2c8\ub2e4.";case"auth/user-not-found":return"\ud574\ub2f9 \uc774\uba54\uc77c\ub85c \ub4f1\ub85d\ub41c \uacc4\uc815\uc744 \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.";case"auth/wrong-password":return"\ube44\ubc00\ubc88\ud638\uac00 \uc62c\ubc14\ub974\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.";case"auth/email-already-in-use":return"\uc774\ubbf8 \uc0ac\uc6a9 \uc911\uc778 \uc774\uba54\uc77c\uc785\ub2c8\ub2e4.";case"auth/weak-password":return"\ube44\ubc00\ubc88\ud638\uac00 \ub108\ubb34 \uc57d\ud569\ub2c8\ub2e4. \ucd5c\uc18c 6\uc790 \uc774\uc0c1 \uc0ac\uc6a9\ud574\uc8fc\uc138\uc694.";default:return"\uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \uc2dc\ub3c4\ud574\uc8fc\uc138\uc694."}};return(0,l.jsx)(i.A,{backgroundImage:"/assets/images/title_bg.jpg",children:(0,l.jsxs)(c,{children:[(0,l.jsx)(u,{children:r?"\ub85c\uadf8\uc778":"\ud68c\uc6d0\uac00\uc785"}),I&&(0,l.jsx)(b,{children:I}),(0,l.jsxs)(g,{onSubmit:async t=>{t.preventDefault(),S(""),z(!0);try{if(r){await s.A.login(a,w);const r=s.A.getCurrentUser();r&&r.displayName&&e.setPlayerName(r.displayName),e.setCurrentScreen("title")}else await s.A.register(a,w,j),e.setPlayerName(j),e.setCurrentScreen("title");d.A.playSfx("UI_CLICK")}catch(I){console.error("Authentication error:",I),S(N(I)),d.A.playSfx("UI_CHOICE_SELECT")}finally{z(!1)}},children:[(0,l.jsxs)(f,{children:[(0,l.jsx)(p,{children:"\uc774\uba54\uc77c"}),(0,l.jsx)(m,{type:"email",value:a,onChange:e=>k(e.target.value),required:!0,disabled:E})]}),(0,l.jsxs)(f,{children:[(0,l.jsx)(p,{children:"\ube44\ubc00\ubc88\ud638"}),(0,l.jsx)(m,{type:"password",value:w,onChange:e=>A(e.target.value),required:!0,disabled:E})]}),!r&&(0,l.jsxs)(f,{children:[(0,l.jsx)(p,{children:"\ub2c9\ub124\uc784"}),(0,l.jsx)(m,{type:"text",value:j,onChange:e=>C(e.target.value),required:!0,disabled:E,maxLength:20})]}),(0,l.jsx)(x,{type:"submit",disabled:E,children:E?"\ucc98\ub9ac \uc911...":r?"\ub85c\uadf8\uc778":"\ud68c\uc6d0\uac00\uc785"})]}),(0,l.jsxs)(h,{children:[r?"\uacc4\uc815\uc774 \uc5c6\uc73c\uc2e0\uac00\uc694?":"\uc774\ubbf8 \uacc4\uc815\uc774 \uc788\uc73c\uc2e0\uac00\uc694?",(0,l.jsx)(y,{type:"button",onClick:()=>{t(!r),S(""),d.A.playSfx("UI_CLICK")},disabled:E,children:r?"\ud68c\uc6d0\uac00\uc785":"\ub85c\uadf8\uc778"})]}),(0,l.jsx)(v,{onClick:()=>e.setCurrentScreen("title"),disabled:E,children:"\uba54\uc778\uc73c\ub85c \ub3cc\uc544\uac00\uae30"})]})})}},569:(e,r,t)=>{t.d(r,{A:()=>l});var o=t(43),a=t(464),n=t(579);const i=a.Ay.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,s=a.Ay.div`
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
`,d=a.Ay.div`
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
`,l=e=>{let{children:r,backgroundImage:t}=e;const a=(0,o.useRef)(null);return(0,o.useEffect)(()=>{const e=()=>{};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]),(0,n.jsxs)(i,{ref:a,children:[(0,n.jsx)(s,{backgroundImage:t}),(0,n.jsx)(d,{children:r})]})}}}]);
//# sourceMappingURL=225.46a25d61.chunk.js.map