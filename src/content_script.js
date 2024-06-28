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
