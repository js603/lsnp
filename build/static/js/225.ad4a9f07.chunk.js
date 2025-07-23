"use strict";(self.webpackChunklsnp=self.webpackChunklsnp||[]).push([[225],{225:(e,r,a)=>{a.r(r),a.d(r,{default:()=>v});var t=a(43),o=a(464),n=a(854),i=a(569),s=a(770),d=a(707),l=a(960);const c=o.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
`,u=o.Ay.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Serif', serif;
  letter-spacing: 2px;
`,g=o.Ay.div`
  background-color: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.5);
  color: #ff6666;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 300px;
  text-align: center;
`,b=o.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 1.5rem;
`,f=o.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,p=o.Ay.label`
  font-size: 1rem;
`,m=o.Ay.input`
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
`,h=o.Ay.button`
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
`,x=o.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`,y=o.Ay.button`
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
`,w=o.Ay.button`
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
`,v=()=>{const e=(0,n.Im)(),[r,a]=(0,t.useState)(!0),[o,v]=(0,t.useState)(""),[k,A]=(0,t.useState)(""),[j,C]=(0,t.useState)(""),[I,S]=(0,t.useState)(""),[E,z]=(0,t.useState)(!1);(0,t.useEffect)(()=>("MAIN_THEME"!==e.currentBgm&&d.Ay.playMusic("MAIN_THEME",{volume:-12}),d.Ay.applyAtmosphericEffect(.3),()=>{d.Ay.applyAtmosphericEffect(0)}),[e.currentBgm]);const L=e=>{switch(e.code){case"auth/invalid-email":return"Invalid email address.";case"auth/user-disabled":return"This account has been disabled.";case"auth/user-not-found":return"No account found with this email.";case"auth/wrong-password":return"Incorrect password.";case"auth/email-already-in-use":return"This email is already in use.";case"auth/weak-password":return"Password is too weak. Use at least 6 characters.";default:return"An error occurred. Please try again."}};return(0,l.jsx)(i.A,{backgroundImage:"/assets/images/title_bg.jpg",children:(0,l.jsxs)(c,{children:[(0,l.jsx)(u,{children:r?"Login":"Register"}),I&&(0,l.jsx)(g,{children:I}),(0,l.jsxs)(b,{onSubmit:async a=>{a.preventDefault(),S(""),z(!0);try{if(r){await s.A.login(o,k);const r=s.A.getCurrentUser();r&&r.displayName&&e.setPlayerName(r.displayName),e.setCurrentScreen("title")}else await s.A.register(o,k,j),e.setPlayerName(j),e.setCurrentScreen("title");d.Ay.playSfx("UI_CLICK")}catch(I){console.error("Authentication error:",I),S(L(I)),d.Ay.playSfx("UI_CHOICE_SELECT")}finally{z(!1)}},children:[(0,l.jsxs)(f,{children:[(0,l.jsx)(p,{children:"Email"}),(0,l.jsx)(m,{type:"email",value:o,onChange:e=>v(e.target.value),required:!0,disabled:E})]}),(0,l.jsxs)(f,{children:[(0,l.jsx)(p,{children:"Password"}),(0,l.jsx)(m,{type:"password",value:k,onChange:e=>A(e.target.value),required:!0,disabled:E})]}),!r&&(0,l.jsxs)(f,{children:[(0,l.jsx)(p,{children:"Display Name"}),(0,l.jsx)(m,{type:"text",value:j,onChange:e=>C(e.target.value),required:!0,disabled:E,maxLength:20})]}),(0,l.jsx)(h,{type:"submit",disabled:E,children:E?"Processing...":r?"Login":"Register"})]}),(0,l.jsxs)(x,{children:[r?"Don't have an account?":"Already have an account?",(0,l.jsx)(y,{type:"button",onClick:()=>{a(!r),S(""),d.Ay.playSfx("UI_CLICK")},disabled:E,children:r?"Register":"Login"})]}),(0,l.jsx)(w,{onClick:()=>e.setCurrentScreen("title"),disabled:E,children:"Back to Title"})]})})}},569:(e,r,a)=>{a.d(r,{A:()=>l});var t=a(43),o=a(464),n=a(960);const i=o.Ay.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,s=o.Ay.div`
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
`,d=o.Ay.div`
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
`,l=e=>{let{children:r,backgroundImage:a}=e;const o=(0,t.useRef)(null);return(0,t.useEffect)(()=>{const e=()=>{};return window.addEventListener("resize",e),()=>{window.removeEventListener("resize",e)}},[]),(0,n.jsxs)(i,{ref:o,children:[(0,n.jsx)(s,{backgroundImage:a}),(0,n.jsx)(d,{children:r})]})}}}]);
//# sourceMappingURL=225.ad4a9f07.chunk.js.map