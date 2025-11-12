if (typeof window.InstallTrigger !== "undefined") {
  delete window.wrappedJSObject.InstallTrigger;
}

Object.defineProperty(window.navigator.wrappedJSObject, "appVersion", {
  get: exportFunction(function () {
    return navigator.userAgent.replace("Mozilla/", "");
  }, window),

  set: exportFunction(function () {}, window),
});

Object.defineProperty(window.navigator.wrappedJSObject, "vendor", {
  get: exportFunction(function () {
    return "Google Inc.";
  }, window),

  set: exportFunction(function () {}, window),
});

window.wrappedJSObject.chrome = cloneInto(
  {
    csi: {},
    loadTimes: {},
    runtime: {},
    webstore: {},
  },
  window,
);
