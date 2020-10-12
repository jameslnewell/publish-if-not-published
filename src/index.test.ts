import * as child_process from 'child_process';
import * as utilities from './utilities';
import publish, {PublishResultReason} from '.';

jest.mock('child_process');

const manifestWithNormalVersion = {
  name: 'test-package',
  version: '1.2.3',
};

describe('publish()', () => {
  const execSpy = jest.spyOn(child_process, 'exec');
  const readJSONSpy = jest.spyOn(utilities, 'readJSON');

  const setupPackageJSON = (
    manifest: any = manifestWithNormalVersion,
  ): void => {
    readJSONSpy.mockReturnValue(Promise.resolve(manifest));
  };

  const setupPackageJSONError = (error: any): void => {
    readJSONSpy.mockReturnValue(Promise.reject(error));
  };

  const setupNPMPublishSuccess = (): void => {
    execSpy.mockImplementation(function (_cmd, _opts, callback) {
      callback?.(null, '', '');
      // eslint-disable-next-line
      // @ts-ignore
      return this;
    });
  };

  const setupNPMPublishError = (error: child_process.ExecException): void => {
    execSpy.mockImplementation(function (_cmd, _opts, callback) {
      callback?.(error, '', '');
      // eslint-disable-next-line
      // @ts-ignore
      return this;
    });
  };

  beforeEach(() => {
    execSpy.mockReset();
    readJSONSpy.mockReset();
  });

  test('resolves when package is private', async () => {
    const manifest = {
      ...manifestWithNormalVersion,
      private: true,
    };
    setupPackageJSON(manifest);
    setupNPMPublishSuccess();
    await expect(publish({})).resolves.toEqual({
      published: false,
      reason: PublishResultReason.PRIVATE,
      manifest,
    });
  });

  [
    ['--tag=next'],
    ['--tag', 'next'],
    ['--foo', 'bar', '--tag', 'preview', '--baz', 'buzz'],
  ].forEach((args) => {
    test(`resolves with a reason when a tag is provided but the version is not a prerelease - args`, async () => {
      setupPackageJSON();
      setupNPMPublishSuccess();
      await expect(publish({args, shouldCheckTag: true})).resolves.toEqual({
        published: false,
        reason: PublishResultReason.MISSING_SUFFIX,
        manifest: manifestWithNormalVersion,
      });
    });
    test('resolves without a reason when a tag is provided, the version is not a prerelease, the tag is not checked the NPM publish command is successful', async () => {
      setupPackageJSON();
      setupNPMPublishSuccess();
      await expect(publish({args, shouldCheckTag: false})).resolves.toEqual({
        published: true,
        reason: undefined,
        manifest: manifestWithNormalVersion,
      });
    });
  });

  [
    '1.0.0-x.0',
    '0.0.2-rc',
    '5.2.17-next.123asdcq24raq2',
    '12.8.3-preview.85',
  ].forEach((version) => {
    const manifestWithPreReleaseVersion = {
      ...manifestWithNormalVersion,
      version,
    };
    test(`resolves with a reason when a tag is not provided but the version is a prerelease - ${version}`, async () => {
      setupPackageJSON(manifestWithPreReleaseVersion);
      setupNPMPublishSuccess();
      await expect(publish({shouldCheckTag: true})).resolves.toEqual({
        published: false,
        reason: PublishResultReason.EXTRANEOUS_SUFFIX,
        manifest: manifestWithPreReleaseVersion,
      });
    });
    test('resolves without a reason when a tag is not provided, the version is a prerelease, the tag is not checked the NPM publish command is successful', async () => {
      setupPackageJSON(manifestWithPreReleaseVersion);
      setupNPMPublishSuccess();
      await expect(publish({shouldCheckTag: false})).resolves.toEqual({
        published: true,
        reason: undefined,
        manifest: manifestWithPreReleaseVersion,
      });
    });
  });

  test('resolves with a reason when the package version is already published', async () => {
    setupPackageJSON();
    setupNPMPublishError({
      name: 'error',
      message: 'You cannot publish over the previously published versions',
    });
    await expect(publish({})).resolves.toEqual({
      published: false,
      reason: PublishResultReason.ALREADY_PUBLISHED,
      manifest: manifestWithNormalVersion,
    });
  });

  test('resolves without a reason when the NPM publish command is successful', async () => {
    setupPackageJSON();
    setupNPMPublishSuccess();
    await expect(publish({})).resolves.toEqual({
      published: true,
      reason: undefined,
      manifest: manifestWithNormalVersion,
    });
  });

  test('rejects when the package JSON cannot be read', async () => {
    const errorMessage = 'Uh oh!';
    setupPackageJSONError(errorMessage);
    setupNPMPublishSuccess();
    await expect(publish({})).rejects.toMatch(errorMessage);
  });

  test('rejects when the NPM publish command is unsuccessful', async () => {
    const errorMessage = {
      name: 'error',
      message: 'Uh oh!',
    };
    setupPackageJSON();
    setupNPMPublishError(errorMessage);
    await expect(publish({})).rejects.toEqual(errorMessage);
  });
});
