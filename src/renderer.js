const form = document.getElementById("login-form");
const submitButton = document.getElementById("submit-btn");
const cursorGlow = document.getElementById("cursor-glow");
const ropeZone = document.getElementById("rope-zone");
const ropeGrip = document.getElementById("rope-grip");
const ropePath = document.getElementById("rope-path");
const ropePathBack = document.getElementById("rope-path-back");

const ROPE_X = 60;
const ROPE_BASE_Y = 340;
const MAX_PULL = 132;
const TOGGLE_THRESHOLD = 52;

const state = {
  dragging: false,
  startY: 0,
  startX: 0,
  startPull: 0,
  startLateral: 0,
  pull: 0,
  lateral: 0,
  velocity: 0,
  lateralVelocity: 0,
  readyToToggle: false,
  recoiling: false,
  recoilStart: 0,
  jitterAmp: 0,
  jitterA: 0,
  jitterB: 0,
  idleSeed: Math.random() * Math.PI * 2
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setCursorGlow(event) {
  const x = event.clientX ?? window.innerWidth / 2;
  const y = event.clientY ?? window.innerHeight / 2;
  cursorGlow.style.left = `${x}px`;
  cursorGlow.style.top = `${y}px`;
}

function toggleLight() {
  document.body.classList.toggle("light-on");
}

function drawRope(now) {
  const idleWiggle = state.dragging ? 0 : Math.sin(now * 0.00115 + state.idleSeed) * 1.8;
  const endX = ROPE_X + state.lateral + idleWiggle;
  const endY = ROPE_BASE_Y + state.pull;

  const bend = state.lateral * 0.74;
  const c1x = ROPE_X + bend * 0.18;
  const c1y = ROPE_BASE_Y * 0.33;
  const c2x = endX - bend * 0.64;
  const c2y = endY * 0.78 + 20 + Math.max(0, state.pull) * 0.12;

  const d = `M ${ROPE_X} 0 C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${endX.toFixed(2)} ${endY.toFixed(2)}`;

  ropePath.setAttribute("d", d);
  ropePathBack.setAttribute("d", d);
  ropeGrip.style.left = `${endX}px`;
  ropeGrip.style.top = `${endY}px`;
}

function updatePhysics(now, dtMs) {
  if (state.dragging) {
    return;
  }

  const dt = Math.min(34, dtMs) / 16.666;
  const recoilAge = now - state.recoilStart;

  const jitter = state.recoiling
    ? (Math.sin(now * 0.041 + state.jitterA) + Math.sin(now * 0.067 + state.jitterB) * 0.6) * state.jitterAmp * Math.exp(-recoilAge / 620)
    : 0;

  state.velocity += (-0.19 * state.pull + jitter) * dt;
  state.velocity *= Math.pow(0.84, dt);
  state.pull += state.velocity * dt;

  state.lateralVelocity += (-0.16 * state.lateral) * dt;
  state.lateralVelocity *= Math.pow(0.86, dt);
  state.lateral += state.lateralVelocity * dt;

  state.pull = clamp(state.pull, -24, MAX_PULL);
  state.lateral = clamp(state.lateral, -34, 34);

  if (state.recoiling && recoilAge > 900) {
    state.recoiling = false;
  }

  if (!state.recoiling && Math.abs(state.pull) < 0.08 && Math.abs(state.velocity) < 0.08) {
    state.pull = 0;
    state.velocity = 0;
  }
}

function onDragStart(event) {
  event.preventDefault();
  state.dragging = true;
  state.startY = event.clientY;
  state.startX = event.clientX;
  state.startPull = state.pull;
  state.startLateral = state.lateral;
  state.readyToToggle = false;
  state.recoiling = false;
  ropeZone.classList.add("active", "dragging");
  if (typeof event.currentTarget?.setPointerCapture === "function") {
    event.currentTarget.setPointerCapture(event.pointerId);
  }
}

function onDragMove(event) {
  if (!state.dragging) {
    return;
  }

  const dy = event.clientY - state.startY;
  const dx = event.clientX - state.startX;

  state.pull = clamp(state.startPull + dy, -12, MAX_PULL);

  const softCurve = Math.sin(dy * 0.14) * 2.6;
  state.lateral = clamp(state.startLateral + dx * 0.42 + softCurve, -34, 34);

  if (state.pull >= TOGGLE_THRESHOLD) {
    state.readyToToggle = true;
  }
}

function onDragEnd() {
  if (!state.dragging) {
    return;
  }

  state.dragging = false;
  if (state.readyToToggle) {
    toggleLight();
  }
  state.readyToToggle = false;

  state.velocity = -(4.2 + Math.random() * 6.2) - Math.min(state.pull, MAX_PULL) * 0.08;
  state.lateralVelocity += (Math.random() - 0.5) * (1.4 + Math.abs(state.lateral) * 0.06);

  state.recoiling = true;
  state.recoilStart = performance.now();
  state.jitterAmp = 0.35 + Math.random() * 0.35;
  state.jitterA = Math.random() * Math.PI * 2;
  state.jitterB = Math.random() * Math.PI * 2;

  ropeZone.classList.remove("dragging");
  if (!ropeZone.matches(":hover")) {
    ropeZone.classList.remove("active");
  }
}

ropeZone.addEventListener("pointerenter", () => {
  ropeZone.classList.add("active");
});

ropeZone.addEventListener("pointerleave", () => {
  if (!state.dragging) {
    ropeZone.classList.remove("active");
  }
});

ropeGrip.addEventListener("pointerdown", (event) => {
  event.stopPropagation();
  onDragStart(event);
});
ropeZone.addEventListener("pointerdown", onDragStart);

window.addEventListener("pointermove", (event) => {
  setCursorGlow(event);
  onDragMove(event);
});

window.addEventListener("pointerup", onDragEnd);
window.addEventListener("pointercancel", onDragEnd);

setCursorGlow({});

let lastTs = performance.now();
function animate(now) {
  const dt = now - lastTs;
  lastTs = now;
  updatePhysics(now, dt);
  drawRope(now);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function setLoading(loading) {
  submitButton.disabled = loading;
  submitButton.classList.toggle("is-loading", loading);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading(true);

  try {
    await window.v2exClient.openOfficialSignin();
  } catch (error) {
    setLoading(false);
  }
});
