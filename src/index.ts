import {exec} from 'child_process';
import {getTagFromArgs, isPrerelease, readJSON} from './utilities';

export interface PublishOptions {
  cwd?: string;
  args?: string[];
  shouldCheckTag?: boolean;
}

export enum PublishResultReason {
  PRIVATE = 'private',
  ALREADY_PUBLISHED = 'already-published',
  MISSING_SUFFIX = 'missing-suffix',
  EXTRANEOUS_SUFFIX = 'extraneous-suffix',
}

export interface PublishResult {
  published: boolean;
  reason:
    | PublishResultReason
    | undefined;
  manifest: { [name: string]: any };
}

export default async function publish(options: PublishOptions = {}): Promise<PublishResult> {
  const {cwd = process.cwd(), shouldCheckTag = true, args = []} = options;

  let manifest: {[name: string]: any} = await readJSON(`${cwd}/package.json`);

  const hasTag = getTagFromArgs(args);
  const hasSuffix = isPrerelease(manifest.version);

  if (manifest.private) {
    return {
      published: false,
      reason: PublishResultReason.PRIVATE,
      manifest
    };
  }

  if (shouldCheckTag) {
    if (hasTag && !hasSuffix) {
      return {
        published: false,
        reason: PublishResultReason.MISSING_SUFFIX,
        manifest
      };
    }

    if (!hasTag && hasSuffix) {
      return {
        published: false,
        reason: PublishResultReason.EXTRANEOUS_SUFFIX,
        manifest
      };
    }
  }

  return new Promise(async (resolve, reject) => {
    const cmd = `npm publish ${args.join(" ")}`;
    exec(cmd, {cwd}, (execError) => {
      if (execError) {
        if (/You cannot publish over the previously published versions/.test(execError.message)) {
          resolve({
            published: false,
            reason: PublishResultReason.ALREADY_PUBLISHED,
            manifest
          });
        } else {
          reject(execError);
        }
      } else {
        resolve({
          published: true,
          reason: undefined,
          manifest
        });
      }
    });
  });
}
