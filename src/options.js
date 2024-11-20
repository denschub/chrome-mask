const enabledHostnames = new EnabledHostnamesList();

async function updateUiState() {
  const siteList = document.getElementById("site-list");
  const siteListTitle = document.getElementById("site-list-title");
  const siteListDescription = document.getElementById("site-list-description");

  siteListTitle.innerText = browser.i18n.getMessage("siteListTitle");
  siteListDescription.innerText = browser.i18n.getMessage("siteListDescription");

  if (enabledHostnames.size() > 0) {
    enabledHostnames.get_values().forEach((hostname) => {
      const siteListItem = document.createElement("li");
      siteListItem.textContent = hostname;
      siteList.appendChild(siteListItem);
    });
  } else {
    const siteListItem = document.createElement("p");
    siteListItem.innerText = browser.i18n.getMessage("siteListEmpty");
    siteList.appendChild(siteListItem);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await enabledHostnames.load();
  await updateUiState();

  browser.runtime.onMessage.addListener(async (msg) => {
    switch (msg.action) {
      case "enabled_hostnames_changed":
        await updateUiState();
        window.location.reload();
        break;
      default:
        throw new Error("unexpected message received", msg);
    }
  });
});
