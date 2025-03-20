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

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { toString as mdastToString } from 'mdast-util-to-string';
import { getPackages, Package } from '@manypkg/get-packages';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'readline/promises';
import { Octokit } from 'octokit';
import { execa } from 'execa';
import GitUrlParse from 'git-url-parse';

export async function determinePackagesToRelease(changesetTagOutput: string) {
  const packagesToRelease: { pkg: Package; tagName: string }[] = [];
  const { packages, tool } = await getPackages(process.cwd());
  if (tool.type !== 'root') {
    let newTagRegex = /New tag:\s+(@[^/]+\/[^@]+|[^/]+)@([^\s]+)/;
    let packagesByName = new Map(packages.map((x) => [x.packageJson.name, x]));

    for (let line of changesetTagOutput.split('\n')) {
      let match = line.match(newTagRegex);
      if (match === null) {
        continue;
      }
      let pkgName = match[1];
      let pkg = packagesByName.get(pkgName);
      if (pkg === undefined) {
        throw new Error(`Package "${pkgName}" not found.`);
      }
      packagesToRelease.push({
        pkg: pkg,
        tagName: `${pkg.packageJson.name}@${pkg.packageJson.version}`,
      });
    }
  } else {
    if (packages.length === 0) {
      throw new Error(`No package found.` + 'This is probably a bug.');
    }
    let pkg = packages[0];
    let newTagRegex = /New tag:/;
    for (let line of changesetTagOutput.split('\n')) {
      let match = line.match(newTagRegex);

      if (match) {
        packagesToRelease.push({
          pkg: pkg,
          tagName: `v${pkg.packageJson.version}`,
        });
        break;
      }
    }
  }
  return packagesToRelease;
}

export const BumpLevels = {
  dep: 0,
  patch: 1,
  minor: 2,
  major: 3,
} as const;

export function getChangelogEntry(changelog: string, version: string) {
  let ast = unified().use(remarkParse).parse(changelog);

  let highestLevel: number = BumpLevels.dep;

  let nodes = ast.children as Array<any>;
  let headingStartInfo:
    | {
        index: number;
        depth: number;
      }
    | undefined;
  let endIndex: number | undefined;

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    if (node.type === 'heading') {
      let stringified = mdastToString(node);
      let match = stringified.toLowerCase().match(/(major|minor|patch)/);
      if (match !== null) {
        let level = BumpLevels[match[0] as 'major' | 'minor' | 'patch'];
        highestLevel = Math.max(level, highestLevel);
      }
      if (headingStartInfo === undefined && stringified === version) {
        headingStartInfo = {
          index: i,
          depth: node.depth,
        };
        continue;
      }
      if (
        endIndex === undefined &&
        headingStartInfo !== undefined &&
        headingStartInfo.depth === node.depth
      ) {
        endIndex = i;
        break;
      }
    }
  }
  if (headingStartInfo) {
    ast.children = ast.children.slice(headingStartInfo.index + 1, endIndex);
  }
  return {
    content: unified().use(remarkStringify).stringify(ast),
    highestLevel: highestLevel,
  };
}

async function getCurrentBranch() {
  const response = await execa`git rev-parse --abbrev-ref HEAD`.catch(
    () => null,
  );
  return response?.stdout;
}

async function getRemoteForBranch(branch: string) {
  const response = await execa`git config --get branch.${branch}.remote`.catch(
    () => null,
  );
  return response?.stdout;
}

async function getRemote() {
  const branch = await getCurrentBranch();
  return branch ? getRemoteForBranch(branch) : null;
}

export async function getRepoInfo() {
  const remote = (await getRemote()) ?? 'origin';
  const url = (await execa`git remote get-url ${remote}`).stdout;
  return GitUrlParse(url);
}

export async function createRelease(
  octokit: Octokit,
  { pkg, tagName }: { pkg: Package; tagName: string },
) {
  let changelogFileName = path.join(pkg.dir, 'CHANGELOG.md');

  let changelog = await fs.readFile(changelogFileName, 'utf8');

  let changelogEntry = getChangelogEntry(changelog, pkg.packageJson.version);
  if (!changelogEntry) {
    // we can find a changelog but not the entry for this version
    // if this is true, something has probably gone wrong
    throw new Error(
      `Could not find changelog entry for ${pkg.packageJson.name}@${pkg.packageJson.version}`,
    );
  }
  const { owner, name } = await getRepoInfo();
  const response = await octokit.rest.repos.createRelease({
    name: tagName,
    tag_name: tagName,
    body: changelogEntry.content,
    prerelease: pkg.packageJson.version.includes('-'),
    repo: name,
    owner,
  });
  return response;
}

export async function yesNoQuestion(
  rl: readline.Interface,
  question: string,
  { defaultAnswer = false } = {},
) {
  const answer = (await rl.question(`${question} (Y/n) `)).trim();
  return answer ? answer === 'Y' || answer === 'y' : defaultAnswer;
}
