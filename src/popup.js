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
  const currentHostname = new URL(activeTab.url).hostname;

  const headline = document.getElementById("headline");
  const checkbox = document.getElementById("mask_enabled");
  const webcompatLink = document.getElementById("webcompat_link");
  const bugzillaLink = document.getElementById("bugzilla_link");

  if (enabledHostnames.contains(currentHostname)) {
    headline.innerText = "The mask is on! I pretend to be Chrome on this site.";
    checkbox.checked = true;
  } else {
    headline.innerText = "The mask is off. I look like Firefox to this site.";
    checkbox.checked = false;
  }

  webcompatLink.href = linkWithSearch("https://webcompat.com/issues/new", [["url", activeTab.url]]);
  bugzillaLink.href = linkWithSearch("https://bugzilla.mozilla.org/enter_bug.cgi", [
    ["bug_file_loc", activeTab.url],
    ["component", "Site Reports"],
    ["product", "Web Compatibility"],
    ["short_desc", `${currentHostname} - Site needs Chrome UA spoof`],
    ["status_whiteboard", "[webcompat-source:chrome-mask-extension]"],
  ]);
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
