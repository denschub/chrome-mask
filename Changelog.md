# 4.3.0 (unreleased)

- The addon is now available in Polish! Thank you [@damblor](https://github.com/damblor) for the help!

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
