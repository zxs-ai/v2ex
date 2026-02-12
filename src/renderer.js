const form = document.getElementById("login-form");
const submitButton = document.getElementById("submit-btn");
const manualButton = document.getElementById("manual-btn");
const statusNode = document.getElementById("status");
const cursorGlow = document.getElementById("cursor-glow");

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

function setLoading(loading) {
  submitButton.disabled = loading;
  manualButton.disabled = loading;
  submitButton.textContent = loading ? "处理中..." : "进入官方并登录";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  setLoading(true);
  setStatus("正在打开官方登录页面...");

  try {
    const result = await window.v2exClient.loginV2EX({ username, password });
    if (result?.ok && result?.mode === "auto") {
      setStatus("已尝试自动提交，若有验证码请在官方页面继续。");
      return;
    }
    if (result?.ok && result?.mode === "manual") {
      setStatus("已打开官方登录页面，请手动完成登录。");
      return;
    }
    setStatus(`自动提交失败：${result?.reason || "未知错误"}，请手动登录。`);
  } catch (error) {
    setStatus(`执行失败：${error?.message || "未知错误"}`);
  } finally {
    setLoading(false);
  }
});

manualButton.addEventListener("click", async () => {
  setLoading(true);
  setStatus("正在打开官方登录页面...");
  try {
    await window.v2exClient.openOfficialSignin();
  } catch (error) {
    setStatus(`打开失败：${error?.message || "未知错误"}`);
    setLoading(false);
  }
});
