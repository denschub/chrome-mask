class EnabledHostnamesList {
  #set = new Set();

  async load() {
    const storage = await browser.storage.sync.get("enabledHostnames");
    this.#set = new Set(storage.enabledHostnames);
  }

  async #persist() {
    const enabledHostnames = Array.from(this.#set.values());
    await browser.storage.sync.set({ enabledHostnames });

    try {
      await browser.runtime.sendMessage({ action: "enabled_hostnames_changed" });
    } catch (ex) {
      console.error("Failed to send enabled_hostnames_changed message:", ex);
    }
  }

  async add(hostname) {
    this.#set.add(hostname);
    await this.#persist();
  }

  async remove(hostname) {
    this.#set.delete(hostname);
    await this.#persist();
  }

  contains(hostname) {
    return this.#set.has(hostname);
  }

  get_values() {
    return this.#set.values();
  }
}

const ChromeVersion = 126;
const ChromeUAStrings = {
  win: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ChromeVersion}.0.0.0 Safari/537.36`,
  mac: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ChromeVersion}.0.0.0 Safari/537.36`,
  linux: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ChromeVersion}.0.0.0 Safari/537.36`,
  android: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ChromeVersion}.0.0.0 Mobile Safari/537.36`,
};

async function GetChromeUA() {
  const platformInfo = await browser.runtime.getPlatformInfo();
  return ChromeUAStrings[platformInfo.os];
}
