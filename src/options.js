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
  setupKeyboardShortcuts();
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

async function setupKeyboardShortcuts() {
  const platformInfo = await browser.runtime.getPlatformInfo();
  if (platformInfo.os == "android") return;

  const shortcutsTitle = document.getElementById("shortcuts-title");
  shortcutsTitle.textContent = browser.i18n.getMessage("shortcutsTitle");

  const shortcutsCommandCombo = document.getElementById("shortcuts-command-combo");
  shortcutsCommandCombo.textContent = browser.i18n.getMessage("shortcutsCommandCombo");

  const shortcutsCommandDescription = document.getElementById("shortcuts-command-description");
  shortcutsCommandDescription.textContent = browser.i18n.getMessage("shortcutsCommandDescription");

  const shortcutsCommandList = document.getElementById("shortcuts-command-list");
  const browserCommands = await browser.commands.getAll();
  browserCommands.forEach((browserCommand) => {
    const shortcutsCommandRow = document.createElement("tr");

    const shortcutsCommandItemShortcut = document.createElement("td");
    shortcutsCommandItemShortcut.textContent =
      browserCommand.shortcut || browser.i18n.getMessage("shortcutsCommandItemShortcutUndefined");

    const shortcutsCommandItemDescription = document.createElement("td");
    shortcutsCommandItemDescription.textContent = browserCommand.description;

    shortcutsCommandRow.append(shortcutsCommandItemShortcut, shortcutsCommandItemDescription);
    shortcutsCommandList.appendChild(shortcutsCommandRow);
  });

  const browserInfo = await browser.runtime.getBrowserInfo();
  const browserVersion = browserInfo.version.split(".")[0];

  if (browserVersion >= 137) {
    const shortcutsOpenPanelButton = document.getElementById("shortcuts-open-panel-button");
    shortcutsOpenPanelButton.textContent = browser.i18n.getMessage("shortcutsOpenPanelButton");
    shortcutsOpenPanelButton.addEventListener("click", async () => {
      await browser.commands.openShortcutSettings();
    });
    shortcutsOpenPanelButton.style.display = "block";
  }

  const shortcutsSection = document.getElementById("shortcuts-section");
  shortcutsSection.style.display = "block";
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
