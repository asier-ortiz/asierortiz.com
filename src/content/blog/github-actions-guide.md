---
title: "Getting Started with GitHub Actions: A Comprehensive Guide for Beginners"
description: "Learn how to automate tasks with GitHub Actions. This guide covers the basics, offers tips for beginners, and walks you through setting up your first CI/CD workflows."
pubDate: "2025-04-21"
image: "/assets/blog/github-actions.png"
tags: ["github", "ci/cd", "automation"]
author: "Asier Ortiz"
draft: false
---

[//]: # (# Getting Started with GitHub Actions: A Comprehensive Guide for Beginners)

GitHub Actions is a powerful feature that enables you to automate workflows directly within your GitHub repository. Whether you're looking to run tests, build your project, validate links, or deploy your application, GitHub Actions can streamline these processes.

This guide is designed for developers new to Continuous Integration and Continuous Deployment (CI/CD) who want to harness the capabilities of GitHub Actions to automate their development workflows.

---

## 📋 Table of Contents

- [What are GitHub Actions?](#what-are-github-actions)
- [Core Concepts](#core-concepts)
- [Setting Up Your First Workflow](#setting-up-your-first-workflow)
- [Common Use Cases](#common-use-cases)
- [Best Practices](#best-practices)
- [Practical Examples](#practical-examples)
  - [Example 1: Continuous Integration for Node.js](#example-1-continuous-integration-for-nodejs)
  - [Example 2: Continuous Deployment to GitHub Pages](#example-2-continuous-deployment-to-github-pages)
  - [Example 3: Scheduled Tasks](#example-3-scheduled-tasks)
  - [Example 4: Publishing to NPM](#example-4-publishing-to-npm)
  - [Example 5: Slack Notifications](#example-5-slack-notifications)
- [Next Steps](#next-steps)

---

## What are GitHub Actions?

GitHub Actions is a CI/CD platform that allows you to automate your build, test, and deployment pipeline. You can create workflows that build and test every pull request to your repository or deploy merged pull requests to production.

Beyond CI/CD, GitHub Actions enables you to run workflows triggered by various events in your repository, such as issues being opened or comments being added.

---

## Core Concepts

- **Workflow**: A configurable automated process made up of one or more jobs. Defined in a YAML file located in the `.github/workflows` directory of your repository.
- **Job**: A set of steps that execute on the same runner. Jobs can run sequentially or in parallel.
- **Step**: An individual task that can run commands or actions.
- **Action**: A reusable extension that can simplify your workflow. Actions can be created by you or shared by the GitHub community.

Example folder structure:

```plaintext
.github/workflows/ci.yml
.github/workflows/deploy.yml
```

---

## Setting Up Your First Workflow

Let's create a simple workflow that runs tests on your Node.js application every time you push code:

```yaml
name: Node.js CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test
```

> **Explanation:**
> - `on: [push]` triggers the workflow every time you push code to the repository.
> - The `build` job specifies that it should run on an `ubuntu-latest` virtual machine.
> - Steps include checking out the code, setting up Node.js, installing dependencies, and running tests.

---

## Common Use Cases

GitHub Actions can be used for a variety of tasks, including:

- **Continuous Integration**: Automatically build and test your code when you push changes.
- **Continuous Deployment**: Deploy your application to production after successful tests.
- **Scheduled Tasks**: Run tasks at scheduled intervals, such as nightly builds or weekly reports.
- **Publishing Packages**: Automatically publish packages to registries like NPM or Docker Hub.
- **Notifications**: Send notifications to Slack, email, or other services based on repository events.

---

## Best Practices

- **Keep Workflows Minimal**: Design workflows to perform specific tasks to make them easier to manage and debug.
- **Use Secrets for Sensitive Information**: Store API keys and other sensitive data in GitHub Secrets to prevent exposure.
- **Limit Environment Variables Scope**: Define environment variables at the narrowest scope necessary to avoid unintended side effects.
- **Use Caching**: Cache dependencies to speed up workflow execution times.
- **Specify Action Versions**: Use specific versions or commit hashes for actions to prevent unexpected changes.
- **Review Third-Party Actions**: Ensure third-party actions are from trusted sources and understand what they do before using them.

---

## Practical Examples

### Example 1: Continuous Integration for Node.js

```yaml
name: Node.js CI

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build the project
        run: npm run build

      - name: Run tests
        run: npm test
```

> **Explanation:**
> Ensures that every change pushed to the repository or suggested through a pull request is automatically validated by building and executing tests.

---

### Example 2: Continuous Deployment to GitHub Pages

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Build site
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

> **Explanation:**
> After building the project, this workflow publishes the content of the `./dist` folder to GitHub Pages automatically.

---

### Example 3: Scheduled Tasks

```yaml
name: Daily Cleanup

on:
  schedule:
    - cron: '0 3 * * *'  # Runs daily at 3 AM UTC

jobs:
  cleanup:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Cleanup temp files
        run: npm run cleanup
```

> **Explanation:**
> Runs daily to perform maintenance tasks such as cleaning up temporary files.

---

### Example 4: Publishing to NPM

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org/'

      - name: Install dependencies
        run: npm install

      - name: Publish package
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

> **Explanation:**
> Triggered when a new version tag is pushed, this workflow installs dependencies and publishes the package to NPM using a secret authentication token.

---

### Example 5: Slack Notifications

```yaml
name: Slack Notification

on:
  push:

jobs:
  notify:
    runs-on: ubuntu-latest

    steps:
      - name: Send notification to Slack
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_MESSAGE: 'A new commit has been pushed to the repository!'
```

> **Explanation:**
> Each push triggers a Slack message to a specified channel using a secure webhook URL.

---

## Next Steps

- Explore the [GitHub Actions Marketplace](https://github.com/marketplace/actions) for reusable actions.
- Try combining multiple jobs inside one workflow.
- Set up automatic deployments to Vercel, Netlify, or DigitalOcean.
- Track your status with detailed badges in your README.

> 🎯 Start simple. Validate, build, test, and deploy. Then grow your workflows as your projects evolve.

---

**Happy Automating with GitHub Actions!** 🚀
