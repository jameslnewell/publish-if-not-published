# publish-if-not-published

Publish a package if the current version isn't already published.

![A list of packages published with publish-if-not-published](https://raw.githubusercontent.com/jameslnewell/publish-if-not-published/master/screenshot.jpg)

## Installation

```bash
yarn add --dev publish-if-not-published
```

## Usage

Run `publish-if-not-published` and pass any additional arguments that you would have passed to `npm publish`.

```bash
"$(yarn bin)/publish-if-not-published" -- --otp 123456 --dry-run
```

### Tags

When specifing a non-latest tag to be published, a suffix should also be appended to the version so as not to use up a semver version on a prerelease.

```json
{
  "name": "package",
  "version": "2.0.0-next.0"
}
```

```bash
"$(yarn bin)/publish-if-not-published" -- --tag next
```

`publish-if-not-published` checks whether it has been called with a non-latest tag, and the version of the package to prevent:

1. Accidentally publishing a tagged release with a non-suffixed version, or
1. Accidentally publishing a latest release with a suffixed version.

These checks can be turned off with the `--no-tag-check` flag:

```bash
"$(yarn bin)/publish-if-not-published" --no-tag-check -- --tag rc
```
