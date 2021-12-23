## Change log

### 3.1.2

- Fix `isPublish` check to work when a package has never been published before
  and a string is returned instead of an array

### 3.1.1

- Fix `isPublish` check to work when a package has never been published before
  and 404s are returned

### 3.1.0

- Check whether a package version has already been published before checking
  tags so we skip instead of erroring when we're trying to publish a pre-release
  but the current version is a not a pre-release and has already been
  published -

### 3.0.0

- Made tag issues exit with a non-zero exit code
- Changed emojis
- Include README.md in files

### 2.2.1

- Updated to handle slightly modified text for already published version

### 2.2.0

- Added `--max-buffer` flag to support large std\* buffers
  ([#3](https://github.com/jameslnewell/publish-if-not-published/issues/3))

### 2.1.0

- Added tests and updated all the dependencies
- Fixed `--tag-check` behaviour to be on by default

### 2.0.0

- Add dist-tag / version suffix logic for preventing accidentally publishing a
  tagged release with a real version, or a latest release with a version suffix.
  ([#4](https://github.com/jameslnewell/publish-if-not-published/pull/4))

### 1.0.0

- Initial release
