#!/usr/bin/env node
/* tslint:disable: no-console */
import 'regenerator-runtime/runtime';
import chalk from 'chalk';
import yargs from 'yargs';
import publish from '.';

function formatNameAndVersion(metadata: {[name: string]: any}): string {
  return `${chalk.bold.white(metadata.name)}${chalk.bold.grey(
    '@',
  )}${chalk.bold.white(metadata.version)}`;
}

(async () => {
  try {
    const argv = await yargs
      .option('tag-check', {type: 'boolean', default: true})
      .option('max-buffer', {type: 'number'}).argv;

    const {published, reason, manifest} = await publish({
      shouldCheckTag: argv['tag-check'],
      args: argv._.map(String),
      maxBuffer: argv['max-buffer'],
    });

    if (published) {
      console.log(`✅ Published ${formatNameAndVersion(manifest)}`);
      return;
    }

    if (reason === 'private') {
      console.log(
        `🤫  Skipped publishing ${formatNameAndVersion(
          manifest,
        )} because this package is marked as private.`,
      );
      return;
    }

    if (reason === 'already-published') {
      console.log(
        `⏩  Skipped publishing ${formatNameAndVersion(
          manifest,
        )} because this version is already published.`,
      );
      return;
    }

    if (reason === 'missing-suffix') {
      console.log(
        `⚠️  Skipped publishing ${formatNameAndVersion(
          manifest,
        )} because the package is being published as a ${chalk.bold.white(
          'non-latest',
        )} tag and the version has no suffix.`,
      );
      process.exitCode = 1;
      return;
    }

    if (reason === 'extraneous-suffix') {
      console.log(
        `⚠️  Skipped publishing ${formatNameAndVersion(
          manifest,
        )} because the package is being published as ${chalk.bold.white(
          'latest',
        )} but the version has an extraneous suffix.`,
      );
      process.exitCode = 1;
      return;
    }
  } catch (error) {
    console.log(`❌ Failed to publish package:`);
    console.log();
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
})();
