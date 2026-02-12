const form = document.getElementById("login-form");
const statusNode = document.getElementById("status");
const SIGNIN_URL = "https://www.v2ex.com/signin";

function setStatus(text) {
  statusNode.textContent = text;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  // Pages 端无法在 v2ex.com 域设置登录态，这里仅打开官方登录页。
  setStatus("正在打开 V2EX 官方登录页...");
  window.location.href = SIGNIN_URL;
});

