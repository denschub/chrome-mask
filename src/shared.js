class EnabledHostnamesList {
  #set = new Set();

  async load() {
    const storage = await browser.storage.sync.get("enabledHostnames");
    if (storage?.enabledHostnames) {
      this.#set = new Set(storage.enabledHostnames);
    }
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

class ChromeUAStringManager {
  #remoteUrl = "https://chrome-mask-remote-storage.0b101010.services/current-chrome-major-version.txt";

  // This are just fallbacks in the case we somehow have to make a request before everything is loaded.
  #currentPlatform = "win";
  #currentUAString = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36`;

  async init() {
    const platformInfo = await browser.runtime.getPlatformInfo();
    this.#currentPlatform = platformInfo.os;

    await this.buildUAStringFromStorage();

    window.setInterval(
      async () => {
        await this.maybeRefreshRemote();
      },
      60 * 60 * 1000,
    );
    await this.maybeRefreshRemote();
  }

  getUAString() {
    return this.#currentUAString;
  }

  async buildUAStringFromStorage() {
    let currentChromeVersion = "126";

    const storedMajorVersion = (await browser.storage.sync.get("remoteStorageVersionNumber"))
      ?.remoteStorageVersionNumber?.version;
    if (storedMajorVersion) {
      currentChromeVersion = storedMajorVersion;
    }

    const ChromeUAStrings = {
      win: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${currentChromeVersion}.0.0.0 Safari/537.36`,
      mac: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${currentChromeVersion}.0.0.0 Safari/537.36`,
      linux: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${currentChromeVersion}.0.0.0 Safari/537.36`,
      android: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${currentChromeVersion}.0.0.0 Mobile Safari/537.36`,
    };

    this.#currentUAString = ChromeUAStrings[this.#currentPlatform];
  }

  async maybeRefreshRemote() {
    const updatedAt = (await browser.storage.sync.get("remoteStorageVersionNumber"))?.remoteStorageVersionNumber
      ?.updatedAt;

    if (updatedAt > Date.now() - 24 * 60 * 60 * 1000) {
      console.info("remote updated in the last 24h, bailing");
      return;
    }

    try {
      const remoteResponseRaw = await fetch(this.#remoteUrl);
      if (remoteResponseRaw.status !== 200) {
        console.error("failed to update remote, unexpected status code", remoteResponseRaw.status);
        return;
      }

      const remoteResponse = await remoteResponseRaw.text();
      await browser.storage.sync.set({
        remoteStorageVersionNumber: {
          version: remoteResponse.trim(),
          updatedAt: Date.now(),
        },
      });

      this.buildUAStringFromStorage();
    } catch (ex) {
      console.error("failed to update remote", ex);
    }
  }
}
