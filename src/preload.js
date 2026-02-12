const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("v2exClient", {
  openOfficialSignin: () => ipcRenderer.invoke("open:v2ex-signin"),
  loginV2EX: (payload) => ipcRenderer.invoke("login:v2ex", payload),
  goHome: () => ipcRenderer.invoke("go:home")
});

