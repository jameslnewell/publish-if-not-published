import {exec} from 'child_process';
import * as semver from 'semver';
import * as yargs from 'yargs-parser';

export interface PublishOptions {
  cwd?: string;
  args?: string[];
  shouldCheckTag?: boolean;
}

export function getTagFromArgs(args: string[] = []) {
  const argv = yargs(args, {
    narg: {
      tag: 1
    },
    string: ['tag']
  });
  return argv.tag === 'latest' ? undefined : argv.tag
}

export function isPrerelease(version: string) {
  // semver.prerelease(version) returns an array of prerelease components, or null if none exist
  // e.g. prerelease('1.2.3-alpha.1') -> ['alpha', 1]
  return semver.prerelease(version) !== null;
}

export interface PublishResult {
  published: boolean;
  reason:
    | "private"
    | "already-published"
    | "missing-suffix"
    | "extraneous-suffix"
    | undefined;
  manifest: { [name: string]: any };
}

export default function publish(options: PublishOptions = {}): Promise<PublishResult> {
  return new Promise((resolve, reject) => {
    const {cwd = process.cwd(), shouldCheckTag = true, args = []} = options;

    let manifest: {[name: string]: any};
    try {
      manifest = require(`${cwd}/package.json`);
    } catch (metaError) {
      reject(metaError);
      return;
    }

    const hasTag = getTagFromArgs(args);
    const hasSuffix = isPrerelease(manifest.version);

    if (manifest.private) {
      resolve({
        published: false,
        reason: 'private',
        manifest
      });
      return;
    }

    if (shouldCheckTag) {
      if (hasTag && !hasSuffix) {
        resolve({
          published: false,
          reason: 'missing-suffix',
          manifest
        });
        return;
      }

      if (!hasTag && hasSuffix) {
        resolve({
          published: false,
          reason: 'extraneous-suffix',
          manifest
        });
        return;
      }
    }

    const cmd = `npm publish ${args.join(" ")}`;
    exec(cmd, {cwd}, (execError) => {
      if (execError) {
        if (/You cannot publish over the previously published versions/.test(execError.message)) {
          resolve({
            published: false,
            reason: 'already-published',
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
