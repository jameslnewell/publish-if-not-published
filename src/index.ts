import {exec} from 'child_process';
import {isPublished} from './isPublished';
import {getTagFromArgs, isPrerelease, readJSON} from './utilities';

export interface PublishOptions {
  cwd?: string;
  args?: string[];
  shouldCheckTag?: boolean;
  maxBuffer?: number;
}

export enum PublishResultReason {
  PRIVATE = 'private',
  ALREADY_PUBLISHED = 'already-published',
  MISSING_SUFFIX = 'missing-suffix',
  EXTRANEOUS_SUFFIX = 'extraneous-suffix',
}

export interface PublishResult {
  published: boolean;
  reason: PublishResultReason | undefined;
  manifest: {[name: string]: any};
}

export default async function publish(
  options: PublishOptions = {},
): Promise<PublishResult> {
  const {
    cwd = process.cwd(),
    shouldCheckTag = true,
    args = [],
    maxBuffer,
  } = options;
  const manifest: {[name: string]: any} = await readJSON(`${cwd}/package.json`);

  const hasTag = getTagFromArgs(args);
  const hasSuffix = isPrerelease(manifest.version);

  if (manifest.private) {
    return {
      published: false,
      reason: PublishResultReason.PRIVATE,
      manifest,
    };
  }

  // check whether we're published before the tag check because the tag check will
  // error when there's no reason to error (we're not publishing anything)
  if (await isPublished(manifest.name, manifest.version)) {
    return {
      published: false,
      reason: PublishResultReason.ALREADY_PUBLISHED,
      manifest,
    };
  }

  if (shouldCheckTag) {
    if (hasTag && !hasSuffix) {
      return {
        published: false,
        reason: PublishResultReason.MISSING_SUFFIX,
        manifest,
      };
    }

    if (!hasTag && hasSuffix) {
      return {
        published: false,
        reason: PublishResultReason.EXTRANEOUS_SUFFIX,
        manifest,
      };
    }
  }

  return new Promise((resolve, reject) => {
    const cmd = `npm publish ${args.join(' ')}`;
    exec(cmd, {cwd, maxBuffer}, (execError) => {
      if (execError) {
        if (
          /You cannot publish over the previously published versions|Cannot publish over existing version/.test(
            execError.message,
          )
        ) {
          resolve({
            published: false,
            reason: PublishResultReason.ALREADY_PUBLISHED,
            manifest,
          });
        } else {
          reject(execError);
        }
      } else {
        resolve({
          published: true,
          reason: undefined,
          manifest,
        });
      }
    });
  });
}
