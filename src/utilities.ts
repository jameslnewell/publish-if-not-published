import * as fs from 'fs';
import * as util from 'util';
import * as semver from 'semver';
import yargs from 'yargs-parser';

const readFile = util.promisify(fs.readFile);

export async function readJSON(file: string): Promise<any> {
  return JSON.parse((await readFile(file)).toString());
}

export function getTagFromArgs(args: string[] = []): string | undefined {
  const argv = yargs(args, {
    narg: {
      tag: 1,
    },
    string: ['tag'],
  });
  return argv.tag === 'latest' ? undefined : argv.tag;
}

export function isPrerelease(version: string): boolean {
  // semver.prerelease(version) returns an array of prerelease components, or null if none exist
  // e.g. prerelease('1.2.3-alpha.1') -> ['alpha', 1]
  return semver.prerelease(version) !== null;
}
