const enabledHostnames = new EnabledHostnamesList();

async function updateUiState() {
  document.getElementById("masked-sites-title").innerText = browser.i18n.getMessage("maskedSitesTitle");

  setupSiteList();
}

function setupSiteList() {
  const siteList = document.getElementById("masked-sites");
  siteList.innerHTML = "";

  if (enabledHostnames.size() < 1) {
    const siteListItem = document.createElement("p");
    siteListItem.innerText = browser.i18n.getMessage("siteListEmpty");
    siteList.appendChild(siteListItem);
    return;
  }

  [...enabledHostnames.get_values()]
    .sort((a, b) => a.localeCompare(b))
    .forEach((hostname) => {
      const siteListItem = document.createElement("div");
      siteListItem.classList.add("site-list-item");

      const hostnameLabel = document.createElement("p");
      hostnameLabel.textContent = hostname;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = browser.i18n.getMessage("siteListRemoveButton");
      deleteButton.addEventListener("click", async () => {
        await enabledHostnames.remove(hostname);
        await updateUiState();
      });

      siteListItem.append(hostnameLabel, deleteButton);
      siteList.appendChild(siteListItem);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  await enabledHostnames.load();
  await updateUiState();

  browser.runtime.onMessage.addListener(async (msg) => {
    switch (msg.action) {
      case "enabled_hostnames_changed":
        await enabledHostnames.load();
        await updateUiState();
        break;
      default:
        throw new Error("unexpected message received", msg);
    }
  });
});
