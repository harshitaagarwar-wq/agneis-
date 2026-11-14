chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "aegis-capture-page",
    title: "Save to Aegis Vault",
    contexts: ["page", "selection"],
  });
});
