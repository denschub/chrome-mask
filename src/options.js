const enabledHostnames = new EnabledHostnamesList();

async function initUi() {
  [
    ["add-site-hostname-explanation", "addSiteHostnameExplanation"],
    ["add-site-title", "addSiteTitle"],
    ["masked-sites-title", "maskedSitesTitle"],
  ].forEach(([id, i18nKey]) => {
    document.getElementById(id).innerText = browser.i18n.getMessage(i18nKey);
  });

  document.getElementById("add-site-button").value = browser.i18n.getMessage("addSiteButton");

  setupAddForm();
  setupSiteList();
}

function tryValidateHostname(input) {
  if (URL.canParse(input)) {
    return URL.parse(input).hostname;
  }

  if (URL.canParse(`https://${input}`)) {
    return URL.parse(`https://${input}`).hostname;
  }

  return undefined;
}

function setupAddForm() {
  const inputEl = document.getElementById("add-site-input");
  document.getElementById("add-site-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const maybeHostname = tryValidateHostname(inputEl.value);
    if (!maybeHostname) {
      alert(browser.i18n.getMessage("addSiteErrorInvalid"));
      return false;
    }

    if (enabledHostnames.contains(maybeHostname)) {
      alert(browser.i18n.getMessage("addSiteErrorAlreadyActive"));
      return false;
    }

    await enabledHostnames.add(maybeHostname);
    inputEl.value = "";
    window.location.reload();
  });
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
        window.location.reload();
      });

      siteListItem.append(hostnameLabel, deleteButton);
      siteList.appendChild(siteListItem);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  await enabledHostnames.load();
  await initUi();

  browser.runtime.onMessage.addListener(async (msg) => {
    switch (msg.action) {
      case "enabled_hostnames_changed":
        window.location.reload();
        break;
      default:
        throw new Error("unexpected message received", msg);
    }
  });
});
