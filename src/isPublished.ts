import {exec} from 'child_process';

export function isPublished(name: string, version: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const cmd = `npm info --json ${name} versions`;
    exec(cmd, (execError, stdout) => {
      if (execError) {
        if (
          /404 Not found/.test(execError.message) ||
          /code E404/.test(execError.message)
        ) {
          resolve(false);
        } else {
          reject(execError);
        }
      } else {
        try {
          const json = JSON.parse(stdout);
          if (typeof json === 'string') {
            resolve(json === version);
          } else if (Array.isArray(json)) {
            resolve(json.includes(version));
          } else {
            reject(new Error(`"${cmd}" didn't return an array of versions.`));
          }
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}
