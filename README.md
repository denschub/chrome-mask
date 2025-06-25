# Chrome Mask for Firefox

A little Firefox Extension that provides a one-click toggle to spoof as Chrome in Firefox - or, in other words, to put on the Chrome Mask.

This extension is available on addons.mozilla.org, [install this extension via addons.mozilla.org](https://addons.mozilla.org/addon/chrome-simulator). The extension is available for both Firefox on Desktops (all supported operating systems), and for Firefox for Android.

## Why?

There are a lot of generic "User Agent spoof" extensions. However, this extension does a few things differently:

- Unlike some extensions with outdated version numbers and UA strings, this extension automatically updates the Chrome version it pretends to be. It does that by querying a simple API every 24 hours, check [the privacy policy](./Privacy.md) for a bit more details.
- You don't have to pick the correct Operating System manually; this extension does it for you.
- This extension also shims a few additional JavaScript attributes, like `navigator.vendor` or the global `chrome` object, to pass common browser checks.

## What this isn't doing

This extension does not attempt to shim common Chrome-only Web Platform APIs. Doing so would lead me down into an endless pit of despair. It also does not shim any Client Hint headers.

## License

MIT.
