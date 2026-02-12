const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const SIGNIN_URL = "https://www.v2ex.com/signin";
let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    title: "V2EX Local Client",
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition: "persist:v2ex"
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

async function autoFillAndSubmit(win, username, password) {
  const script = `
    (() => {
      const username = ${JSON.stringify(username)};
      const password = ${JSON.stringify(password)};

      const userInput = document.querySelector(
        'input[name="u"], input[name="username"], input[type="text"]'
      );
      const passInput = document.querySelector('input[name="p"], input[type="password"]');

      if (!userInput || !passInput) {
        return { ok: false, reason: "fields_not_found" };
      }

      userInput.focus();
      userInput.value = username;
      userInput.dispatchEvent(new Event("input", { bubbles: true }));
      userInput.dispatchEvent(new Event("change", { bubbles: true }));

      passInput.focus();
      passInput.value = password;
      passInput.dispatchEvent(new Event("input", { bubbles: true }));
      passInput.dispatchEvent(new Event("change", { bubbles: true }));

      const submitButton = document.querySelector(
        'input[type="submit"], button[type="submit"], button.primary'
      );
      if (submitButton) {
        submitButton.click();
        return { ok: true, submitted: true };
      }

      const form = passInput.form || userInput.form || document.querySelector("form");
      if (!form) {
        return { ok: false, reason: "form_not_found" };
      }

      form.submit();
      return { ok: true, submitted: true };
    })();
  `;

  return win.webContents.executeJavaScript(script, true);
}

ipcMain.handle("open:v2ex-signin", async () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return { ok: false, reason: "window_unavailable" };
  }

  await mainWindow.loadURL(SIGNIN_URL);
  return { ok: true };
});

ipcMain.handle("login:v2ex", async (_event, payload) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return { ok: false, reason: "window_unavailable" };
  }

  const username = typeof payload?.username === "string" ? payload.username.trim() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  await mainWindow.loadURL(SIGNIN_URL);

  if (!username || !password) {
    return { ok: true, mode: "manual" };
  }

  try {
    const result = await autoFillAndSubmit(mainWindow, username, password);
    return result?.ok ? { ok: true, mode: "auto" } : { ok: false, reason: result?.reason || "unknown" };
  } catch (error) {
    return { ok: false, reason: error?.message || "execute_failed" };
  }
});

ipcMain.handle("go:home", async () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return { ok: false, reason: "window_unavailable" };
  }
  await mainWindow.loadFile(path.join(__dirname, "index.html"));
  return { ok: true };
});

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
