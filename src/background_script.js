const chromeUAStringManager = new ChromeUAStringManager();
const enabledHostnames = new EnabledHostnamesList();
let contentScriptHandle = null;

function matchPatternsForHostnames(hostnames) {
  return hostnames.map((n) => `*://${n}/*`);
}

async function contentScriptSetup() {
  const oldHostnames = new Set(enabledHostnames.get_values());

  await enabledHostnames.load();

  const hostsToAdd = new Set();
  const hostsToRemove = new Set(oldHostnames.keys());
  for (const hostname of enabledHostnames.get_values()) {
    if (oldHostnames.has(hostname)) {
      hostsToRemove.delete(hostname);
    } else {
      hostsToAdd.add(hostname);
    }
  }

  if (contentScriptHandle) {
    contentScriptHandle.unregister();
    contentScriptHandle = null;
  }

  if ([...enabledHostnames.get_values()].length > 0) {
    contentScriptHandle = await browser.contentScripts.register({
      allFrames: true,
      js: [{ file: "content_script.js" }],
      matches: matchPatternsForHostnames([...enabledHostnames.get_values()]),
      runAt: "document_start",
    });
  }

  setupOnBeforeSendHeaders();

  const changedHostnames = [...hostsToAdd, ...hostsToRemove];
  const affectedTabs = await browser.tabs.query({ url: matchPatternsForHostnames(changedHostnames), active: true });
  for (const tab of affectedTabs) {
    browser.tabs.reload(tab.id, { bypassCache: true });
  }
}

function onBeforeSendHeadersHandler(details) {
  for (const header of details.requestHeaders) {
    if (header.name.toLowerCase() === "user-agent") {
      header.value = chromeUAStringManager.getUAString();
    }
  }

  return { requestHeaders: details.requestHeaders };
}

function setupOnBeforeSendHeaders() {
  if (browser.webRequest.onBeforeSendHeaders.hasListener(onBeforeSendHeadersHandler)) {
    browser.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersHandler);
  }

  if ([...enabledHostnames.get_values()].length < 1) {
    return;
  }

  browser.webRequest.onBeforeSendHeaders.addListener(
    onBeforeSendHeadersHandler,
    { urls: matchPatternsForHostnames([...enabledHostnames.get_values()]) },
    ["blocking", "requestHeaders"],
  );
}

function updateBadgeStatus(currentTab) {
  if (currentTab.id != browser.tabs.TAB_ID_NONE) {
    const currentHostname = new URL(currentTab.url).hostname;
    const urls = [...enabledHostnames.get_values()];

    const isOn = urls.includes(currentHostname);
    browser.browserAction.setIcon({
      tabId: currentTab.id,
      path: `assets/badge-indicator-${isOn ? "on" : "off"}.svg`,
    });
    browser.browserAction.setTitle({
      tabId: currentTab.id,
      title: browser.i18n.getMessage(`maskStatus${isOn ? "On" : "Off"}`),
    });
  }
}

async function toggleMask(tab) {
  const currentHostname = new URL(tab.url).hostname;

  if (enabledHostnames.contains(currentHostname)) {
    await enabledHostnames.remove(currentHostname);
  } else {
    await enabledHostnames.add(currentHostname);
  }
}

async function init() {
  browser.runtime.onMessage.addListener(async (msg) => {
    switch (msg.action) {
      case "enabled_hostnames_changed":
        await contentScriptSetup();
        break;
      default:
        throw new Error("unexpected message received", msg);
    }
  });

  if (browser.commands?.onCommand) {
    browser.commands.onCommand.addListener(async (command, tab) => {
      switch (command) {
        case "toggle_mask":
          await toggleMask(tab);
          await contentScriptSetup();
          browser.tabs.reload(tab.id, { bypassCache: true });
          break;
      }
    });
  }

  browser.tabs.onUpdated.addListener(async (tabId, _changeInfo, _tabInfo) => {
    const currentTab = await browser.tabs.get(tabId);
    updateBadgeStatus(currentTab);
  });

  await chromeUAStringManager.init();
  await contentScriptSetup();
  setupOnBeforeSendHeaders();
}

init();
