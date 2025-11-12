# 8.0.0

The addon now removes `window.InstallTrigger` to pass very common patterns like `if ("InstallTrigger" in window)` or `if (typeof window.InstallTrigger !== "undefined")`.

# 7.0.1

Fixed multiple regressions when running Chrome Mask in Firefox for Android. Firefox for Android now correctly uses a Chrome Android user agent string, not Chrome on Windows. The menu entry now also again correctly identifies if Chrome Mask is enabled or not. Sorry for that!

# 7.0.0

- Adds support for an optional keyboard shortcut to toggle Chrome Mask. Thank you very much, [@dannycolin](https://github.com/dannycolin)!

# 6.0.0

- The addon now spoofs `navigator.appVersion` to match what Chrome is doing.
- This addon is now available in Turkish (thank you, [@MemoKing34](https://github.com/MemoKing34)) and Simplified Chinese (thank you, [@AcideFluorhydrique](https://github.com/AcideFluorhydrique))!

# 5.0.0

- Added a settings UI to add or remove sites from Chrome Mask without being on that site. Thanks to [@dannycolin](https://github.com/dannycolin) for the initial prototype here.
- Added an explicit warning to only use Chrome Mask on sites that claim "Firefox is not supported", because using it on other sites will break things.

# 4.3.0

- The addon is now available in Polish! Thank you [@damblor](https://github.com/damblor) for the help!
- There was a bug where the default on-hover title for the button was wrong. That bug was fixed by [@dannycolin](https://github.com/dannycolin)!
- The addon claimed it could work on `about:` and `moz-extension://` pages, which it could not. The UI has been adjusted to handle this case. Thanks for the contribution, [@changhuapeng](https://github.com/changhuapeng)!

# 4.2.0

If you had more than one Firefox window open, the addon previously showed the wrong state icon in some windows, so it looked like the Chrome Mask was enabled when it was not. This bug is now fixed, so all status badges should be correct!

# 4.1.0

Originally, the addon loaded _all_ tabs with the same hostname if you flipped the switch. For people with too many tabs open, this could have presented a.. uhm.. problem. Now, only the currently selected tabs get reloaded. Thank you [@SuperTux88](https://github.com/SuperTux88) for the report and the PR!

# 4.0.0

- For Linux users, we now spoof as Chrome-on-Windows. Some sites deliberately block all Linux browsers, and this is an easy way to get around that.
- The addon is now available in French and German! Thanks to [@dannycolin](https://github.com/dannycolin) for contributing the initial localization support and the French locale.

# 3.0.0

The addon now has a status indicator, so you can see if the Chrome Mask is on or off without even clicking on it. Thanks for the contribution, [@dannycolin](https://github.com/dannycolin)!

# 2.0.0

Chrome Mask now automatically updates the Chrome version, without needing an addon update. It does that by requesting the current stable Chrome major version [from an API](https://chrome-mask-remote-storage.0b101010.services/current-chrome-major-version.txt). The update runs once a day, in the background, without bothering you.

# 1.0.0

This was the initial release!
