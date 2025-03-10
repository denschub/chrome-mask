const enabledHostnames = new EnabledHostnamesList();

async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length < 1) {
    throw new Error("could not get active tab");
  }

  return tabs[0];
}

async function updateUiState() {
  const activeTab = await getActiveTab();
  const currentUrl = new URL(activeTab.url);
  const currentProtocol = currentUrl.protocol;
  const currentHostname = currentUrl.hostname;
  const maskStatus = document.getElementById("maskStatus");
  const fancyContainer = document.querySelector("section.fancy_toggle_container");
  const checkbox = document.getElementById("mask_enabled");
  const inProductReporterLink = document.createElement("a");
  const webcompatLink = document.createElement("a");
  const breakageWarning = document.getElementById("breakageWarning");
  const reportBrokenSite = document.getElementById("reportBrokenSite");

  if (currentProtocol == "moz-extension:" || currentHostname == "") {
    maskStatus.innerText = browser.i18n.getMessage("maskStatusUnsupported");
    fancyContainer.style.display = "none";
  } else if (enabledHostnames.contains(currentHostname)) {
    maskStatus.innerText = browser.i18n.getMessage("maskStatusOn");
    checkbox.checked = true;
  } else {
    maskStatus.innerText = browser.i18n.getMessage("maskStatusOff");
    checkbox.checked = false;
  }

  inProductReporterLink.href = "https://support.mozilla.org/kb/report-breakage-due-blocking";
  inProductReporterLink.innerText = browser.i18n.getMessage("inProductReporterLinkText");

  webcompatLink.href = linkWithSearch("https://webcompat.com/issues/new", [["url", activeTab.url]]);
  webcompatLink.innerText = browser.i18n.getMessage("webcompatLinkText");

  breakageWarning.innerText = browser.i18n.getMessage("breakageWarning");

  reportBrokenSite.innerHTML = browser.i18n.getMessage("reportBrokenSite", [
    inProductReporterLink.outerHTML,
    webcompatLink.outerHTML,
  ]);

  // Annoyingly, on Android, `browser.runtime.openOptionsPage` is fundamentally
  // broken. For this to be viable, I'd need two bugs fixed:
  //   - https://bugzilla.mozilla.org/show_bug.cgi?id=1795449
  //   - https://bugzilla.mozilla.org/show_bug.cgi?id=1884550
  // So for now, just display a fallback text for Android... :(
  const platformInfo = await browser.runtime.getPlatformInfo();
  if (platformInfo.os == "android") {
    document.getElementById("manageSites").style.display = "none";
    document.getElementById("manageSitesFallbackText").innerText = browser.i18n.getMessage("manageSitesFallback");
    document.getElementById("manageSitesFallback").style.display = "block";
  } else {
    const manageSitesButton = document.getElementById("manageSitesButton");
    manageSitesButton.innerText = browser.i18n.getMessage("manageSitesButton");
    manageSitesButton.addEventListener("click", async () => {
      await browser.runtime.openOptionsPage();
    });
  }
}

function linkWithSearch(base, searchParamsInit) {
  const url = new URL(base);
  const searchParams = new URLSearchParams(searchParamsInit);
  url.search = searchParams.toString();
  return url.toString();
}

document.addEventListener("DOMContentLoaded", async () => {
  await enabledHostnames.load();
  await updateUiState();

  document.getElementById("mask_enabled").addEventListener("change", async (ev) => {
    const activeTab = await getActiveTab();
    const currentHostname = new URL(activeTab.url).hostname;

    if (!currentHostname) {
      ev.target.checked = false;
      return;
    }

    if (ev.target.checked) {
      await enabledHostnames.add(currentHostname);
    } else {
      await enabledHostnames.remove(currentHostname);
    }

    await updateUiState();
  });
});
