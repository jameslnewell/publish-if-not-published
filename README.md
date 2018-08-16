# publish-if-not-published

Publish a package if the current version isn't already published.

![A list of packages published with publish-if-not-published](https://github.com/jameslnewell/publish-if-not-published/blob/master/screenshot.jpg)

## Installation

```bash
yarn add --dev publish-if-not-published
```

## Usage

Run `publish-if-not-published` and pass any additional arguments that you would have passed to `npm publish`.

```bash
"$(yarn bin)/publish-if-not-published" -- --otp 123456
```
