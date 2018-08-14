import {exec} from 'child_process';

export interface PublishOptions {
  cwd?: string;
  args?: string[];
}

export interface PublishResult {
  published: boolean;
  reason: 'private' | 'already-published' | undefined;
  manifest: {[name: string]: any};
}

export default function publish(options: PublishOptions = {}): Promise<PublishResult> {
  return new Promise((resolve, reject) => {
    const {cwd = process.cwd(), args = []} = options;

    let manifest: {[name: string]: any};
    try {
      manifest = require(`${cwd}/package.json`);
    } catch (metaError) {
      reject(metaError);
      return;
    }

    if (manifest.private) {
      resolve({
        published: false,
        reason: 'private',
        manifest
      });
      return;
    }

    const cmd = `npm publish ${args.join(' ')}`;
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
