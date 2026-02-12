const form = document.getElementById("login-form");
const statusNode = document.getElementById("status");
const cursorGlow = document.getElementById("cursor-glow");
const pullCord = document.getElementById("pull-cord");
const cordLine = document.getElementById("cord-line");
const cordKnob = document.getElementById("cord-knob");

const SIGNIN_URL = "https://www.v2ex.com/signin";
const CORD_BASE_HEIGHT = 110;
const CORD_BASE_KNOB_TOP = 104;
const TOGGLE_THRESHOLD = 62;
const MAX_PULL = 112;

let isDragging = false;
let dragStartY = 0;
let toggledInCurrentDrag = false;

function setStatus(text) {
  statusNode.textContent = text;
}

function toggleLight() {
  document.body.classList.toggle("light-on");
}

function setCordPull(pull) {
  cordLine.style.height = `${CORD_BASE_HEIGHT + pull}px`;
  cordKnob.style.top = `${CORD_BASE_KNOB_TOP + pull}px`;
}

function onPointerMove(event) {
  const x = event.clientX ?? window.innerWidth / 2;
  const y = event.clientY ?? window.innerHeight / 2;
  cursorGlow.style.left = `${x}px`;
  cursorGlow.style.top = `${y}px`;

  if (!isDragging) {
    return;
  }

  const pull = Math.max(0, Math.min(MAX_PULL, y - dragStartY));
  setCordPull(pull);

  if (!toggledInCurrentDrag && pull >= TOGGLE_THRESHOLD) {
    toggleLight();
    toggledInCurrentDrag = true;
  }
}

function endDrag() {
  if (!isDragging) {
    return;
  }
  isDragging = false;
  toggledInCurrentDrag = false;
  cordLine.style.transition = "height 0.16s ease";
  cordKnob.style.transition = "top 0.16s ease";
  setCordPull(0);
}

pullCord.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  isDragging = true;
  dragStartY = event.clientY;
  toggledInCurrentDrag = false;
  cordLine.style.transition = "none";
  cordKnob.style.transition = "none";
  pullCord.setPointerCapture(event.pointerId);
});

pullCord.addEventListener("pointerup", endDrag);
pullCord.addEventListener("pointercancel", endDrag);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);

window.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Enter") {
    toggleLight();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus("正在打开 V2EX 官方登录页...");
  window.location.href = SIGNIN_URL;
});
