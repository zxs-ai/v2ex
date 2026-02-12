const form = document.getElementById("login-form");
const statusNode = document.getElementById("status");
const cursorGlow = document.getElementById("cursor-glow");

const SIGNIN_URL = "https://www.v2ex.com/signin";

function setStatus(text) {
  statusNode.textContent = text;
}

function onPointerMove(event) {
  const x = event.clientX ?? window.innerWidth / 2;
  const y = event.clientY ?? window.innerHeight / 2;
  cursorGlow.style.left = `${x}px`;
  cursorGlow.style.top = `${y}px`;
}
window.addEventListener("pointermove", onPointerMove);
onPointerMove({});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus("正在打开 V2EX 官方登录页...");
  window.location.href = SIGNIN_URL;
});
