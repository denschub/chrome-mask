# Privacy Policy

The addon contains an auto-update mechanism that automatically updates the Chrome User Agent strings based on the currently released Chrome version. The API it downloads the info from [only provides the version number](https://chrome-mask-remote-storage.0b101010.services/current-chrome-major-version.txt), nothing else, so no evil code injection is possible.

The version number is hosted inside a Cloudflare R2 bucket, and is served directly from that, without any additional server logic. Therefore, I do not have a way to collect and store user data, like IP addresses.
