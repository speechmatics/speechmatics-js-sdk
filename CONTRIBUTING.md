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

> Any color you like.

We use Rome for linting https://www.npmjs.com/package/rome

You can run linting and formatting using the scripts:

```
npm run format
npm run check
```

We also make use of the [pre-commit](https://pre-commit.com/) package. It will run a serious of checks on every commit to make sure your code is properly formatted and linted. You can run the pre-commit check independent of a commit with the command `pre-commit run --all-files`.

In general, code should be self-explanatory and kept as simple as possible. Comments can be added to clarify what a piece of code does and jsdoc annotations should be added to any important functions that are expected to be used by SDK clients.

## Testing

Tests for this repo are included in the `/tests` directory. You can use the command `npm test` to run unit tests. 

If you make changes to the SDK, the tests should be updated or added to in a sensible way to ensure the new change is properly covered.