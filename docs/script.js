const form = document.getElementById("login-form");
const statusNode = document.getElementById("status");
const cursorGlow = document.getElementById("cursor-glow");
const ropeZone = document.querySelector(".rope-zone");
const ropeSway = document.querySelector(".rope-sway");

const SIGNIN_URL = "https://www.v2ex.com/signin";
const MAX_PULL = 46;

let isDraggingRope = false;
let ropeStartY = 0;

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

function setRopePull(value) {
  ropeSway.style.setProperty("--rope-pull", `${value}px`);
}

ropeZone.addEventListener("pointerenter", () => {
  ropeZone.classList.add("active");
});

ropeZone.addEventListener("pointerleave", () => {
  if (!isDraggingRope) {
    ropeZone.classList.remove("active");
  }
});

ropeZone.addEventListener("pointerdown", (event) => {
  isDraggingRope = true;
  ropeStartY = event.clientY;
  ropeZone.classList.add("active");
  ropeZone.setPointerCapture(event.pointerId);
});

function resetRope() {
  if (!isDraggingRope) {
    return;
  }
  isDraggingRope = false;
  setRopePull(0);
}

ropeZone.addEventListener("pointerup", resetRope);
ropeZone.addEventListener("pointercancel", resetRope);
window.addEventListener("pointerup", resetRope);
window.addEventListener("pointercancel", resetRope);

window.addEventListener("pointermove", (event) => {
  if (!isDraggingRope) {
    return;
  }
  const pull = Math.max(0, Math.min(MAX_PULL, event.clientY - ropeStartY));
  setRopePull(pull);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus("正在打开 V2EX 官方登录页...");
  window.location.href = SIGNIN_URL;
});
