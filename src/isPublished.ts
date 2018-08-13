import {exec} from 'child_process';

export function isPublished(name: string, version: string) {
  return new Promise((resolve, reject) => {
    const cmd = `npm info ${name} versions --json`;
    exec(cmd, (execError, stdout) => {
      if (execError) {
        if (/404 Not found : .+/.test(execError.message)) {
          resolve(false);
        } else {
          reject(execError);
        }
        return;
      } else {
        try {
          const json = JSON.parse(stdout);
          if (!Array.isArray(json)) {
            reject(new Error(`"${cmd}" didn't return an array of versions.`));
          } else {
            resolve(json.includes(version));
          }
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}
