# Contributing

Welcome to the Speechmatics Javascript SDK! We're open to contributions from anyone. We hope you can find everything you need in here to get started contributing to this repo.

## Table of Contents

- [Useful Links](#useful-links)
- [How to Submit Changes](#how-to-submit-changes)
- [How to Report a Bug](#how-to-report-a-bug)
- [How to Request a Feature](#how-to-request-a-feature)
- [Style Guide](#style-guide)
- [Testing](#testing)



## Useful Links

- [Speechmatics Website](https://www.speechmatics.com/)
- [Portal (for generating API keys)](https://portal.speechmatics.com/manage-access/)
- [Docs](https://docs.speechmatics.com/)
- [PNPM workspaces docs](https://pnpm.io/workspaces)


## PNPM

This monorepo uses [`pnpm`](https://pnpm.io/) as a package manager. You can install it in various ways, but we would recommend using Corepack, which comes bundled with recent NodeJS versions: https://pnpm.io/installation#using-corepack

### PNPM installation steps

- If you have PNPM installed already, we recommend removing it from your system with this command: rm -rf $PNPM_HOME
- If using NVM, run `nvm use` in the speechmatics-js-sdk repo, to ensure you're using Node 22 or higher
- In the `speechmatics-js-sdk/` folder, run `corepack use pnpm@latest`
- Run `corepack enable pnpm`
- Verify `pnpm --version` outputs the same version found in the `packageManager` field of [`package.json`](/package.json)

### Installing dependencies

After cloning this repo, run

```sh
# In the root of the project
pnpm i
```

This will install dependencies for all projects in the workspace.

## How to Submit Changes

We try not to be too prescreptive about how people work, but we also believe in helping make things easier by following a couple of basic steps. If you follow these recommendations, it should make the review process simpler and quicker:

1. If your change is large, consider reaching out to us beforehand and discussing the issue. This could save you a lot of time if there are good reasons why we haven't done something.
2. Fork the repo and work on a branch on your fork. Try to give your branches short, descriptive names in the format {type}/{description} e.g. bugfix/missing-try-catch.
3. Make sure your changes are tested - ideally both manually and in the unit tests.
4. When opening a PR back into our repo, provide some simple descriptive comments that list the changes being made in the PR.
5. Give your PR a short, descriptive title.

## How to Report a Bug

If you are experiencing a bug, you can report it via the [issues](https://github.com/speechmatics/speechmatics-js/issues) page.  The more details you give us, the better we can understand and fix your problem!

## How to Request a Feature

If you want a feature, you can open a discussion via the [issues](https://github.com/speechmatics/speechmatics-js/issues) page. Try to tag your issue with the most appropriate label available so that we can track it more easily.


## Style Guide

We use Biome for linting and formatting: https://www.npmjs.com/package/@biomejs/biome

You can run linting and formatting using the scripts:

```
pnpm lint
pnpm format
```
