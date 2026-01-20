/**
 * @file
 *
 * Source code in part taken from:

 * https://github.com/release-it/release-it
 * MIT License
 *
 * Copyright (c) 2018 Lars Kappert
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *

 * https://github.com/changesets/changesets
 *
 * MIT License
 *
 * Copyright (c) 2019 Ben Conolly
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { execa } from 'execa';
import readline from 'readline/promises';
import getReleasePlan from '@changesets/get-release-plan';
import {
  createRelease,
  determinePackagesToRelease,
  yesNoQuestion,
} from './utils.mts';
import { Octokit } from 'octokit';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('\nPlease provided the GITHUB_TOKEN environment variable');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const gitDiffResult = await execa({
  reject: false,
})`git diff HEAD --quiet`;

if (gitDiffResult.failed) {
  console.error(
    '\nYou have outstanding changes in your working directory. Please commit or stash them first before proceeding.',
  );
  process.exit(1);
}

console.log('\nPreparing to version packages...');

const releasePlan = await getReleasePlan(process.cwd());

if (releasePlan.changesets.length === 0) {
  console.error('\nNo changesets found...');
  process.exit(1);
}

const statusResult = await execa({
  reject: false,
  preferLocal: true,
})`changeset status --verbose`;
if (statusResult.failed) {
  console.error(statusResult.stderr);
  process.exit(1);
}

console.log(`${statusResult.stdout}\n`);

const versionResult = await execa({
  reject: false,
  preferLocal: true,
})`changeset version`;
if (versionResult.failed) {
  console.error(versionResult.stderr);
  process.exit(1);
}
console.log('\n');

const shouldCommit = await yesNoQuestion(prompt, '\nCommit ?', {
  defaultAnswer: true,
});
if (!shouldCommit) {
  process.exit(0);
}

const stageResult = await execa({
  reject: false,
})`git add . --all`;

if (stageResult.failed) {
  console.error(stageResult.stderr);
  process.exit(1);
}

const commitResult = await execa({
  reject: false,
})`git commit -m ${'Version packages'}`;

if (commitResult.failed) {
  console.error(commitResult.stderr);
  process.exit(1);
}

const shouldTag = await yesNoQuestion(prompt, '\nCreate tags?', {
  defaultAnswer: true,
});
if (!shouldTag) {
  process.exit(0);
}

const tagResult = await execa({
  reject: false,
  preferLocal: true,
})`changeset tag`;

if (tagResult.failed) {
  console.error(tagResult.stderr);
  process.exit(1);
}

const shouldPush = await yesNoQuestion(prompt, '\nPush to git forge?', {
  defaultAnswer: true,
});
if (!shouldPush) {
  process.exit(0);
}

const pushResult = await execa({ reject: false })`git push --follow-tags`;
if (pushResult.failed) {
  console.error(pushResult.stderr);
  process.exit(1);
}

console.log(`\n ${pushResult.stdout}`);

const shouldRelease = await yesNoQuestion(prompt, '\nRelease to Github?');
if (!shouldRelease) {
  process.exit(1);
}

const packagesToRelease = await determinePackagesToRelease(tagResult.stdout);

const releases: string[] = [];
for (const { pkg, tagName } of packagesToRelease) {
  try {
    const releaseResponse = await createRelease(octokit, {
      pkg,
      tagName,
    });
    releases.push(releaseResponse.data.html_url);
  } catch (e) {
    console.error(e);
    console.error(
      `\nSomething went wrong while releasing ${pkg.packageJson.name}`,
    );
    process.exit(1);
  }
}

console.log('\nGithub releases: ');
console.log('-------------------');
for (const release of releases) {
  console.log(`🔗 ${release}`);
}
console.log(`\nRelease successful! 🚀`);
process.exit(0);
