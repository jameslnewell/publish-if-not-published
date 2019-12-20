#!/usr/bin/env node
/* tslint:disable: no-console */
import chalk from 'chalk';
import * as yargs from 'yargs';
import publish from '.';

function formatNameAndVersion(metadata: {[name: string]: any}) {
  return `${chalk.bold.white(metadata.name)}${chalk.bold.grey('@')}${chalk.bold.white(metadata.version)}`;
}

const argv = yargs.argv;

(async () => {
  try {
    const {published, reason, manifest} = await publish({tagCheck: argv.tagCheck, args: argv._});

    if (published) {
      console.log(`✅ Published ${formatNameAndVersion(manifest)}`);
      return;
    }

    if (reason === 'private') {
      console.log(`⚠️  Skipped publishing ${formatNameAndVersion(manifest)} because this package is marked as private.`);
      return;
    }

    if (reason === 'already-published') {
      console.log(`ℹ️  Skipped publishing ${formatNameAndVersion(manifest)} because this version is already published.`);
      return;
    }

    if (reason === "missing-suffix") {
      console.log(`⚠️  Skipped publishing ${formatNameAndVersion(manifest)} because the package is being published as a ${chalk.bold.white("non-latest")} tag and the version has no suffix.`);
      return;
    }

    if (reason === "extraneous-suffix") {
      console.log(`⚠️  Skipped publishing ${formatNameAndVersion(manifest)} because the package is being published as ${chalk.bold.white("latest")} but the version has an extraneous suffix.`);
      return;
    }
  } catch (error) {
    console.log(`❌ Failed to publish package:`);
    console.log();
    console.error(error.message);
    process.exit(1);
  }
})();
