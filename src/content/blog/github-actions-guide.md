---
title: "Getting Started with GitHub Actions: A Comprehensive Guide for Beginners"
description: "Learn how to automate tasks with GitHub Actions. This guide covers the basics, offers tips for beginners, and walks you through setting up your first CI/CD workflows."
pubDate: "2025-04-23"
image: "/assets/blog/github-actions.webp"
tags: [ "github", "ci-cd", "automation" ]
author: "Asier Ortiz"
draft: false
---

GitHub Actions makes it easy to automate your development workflows — from continuous integration to deployment — all
directly within your GitHub repository.

Whether you're shipping a web app, validating a pull request, or generating documentation, Actions help you eliminate
repetitive tasks and focus on what matters most: writing code.

This guide is tailored for developers new to CI/CD and GitHub Actions. We'll break down its core concepts, walk you
through creating your first workflow, and explore best practices and real-world use cases.

---

## 📋 Table of Contents

<div class="not-prose mb-8 rounded-lg border border-base-700 bg-base-900 p-4">
<ul class="flex flex-col gap-2">
  <li><a href="#what-are-github-actions" class="text-base-300 hover:text-primary-400 transition-colors duration-300">What are GitHub Actions?</a></li>
  <li><a href="#1-core-concepts" class="text-base-300 hover:text-primary-400 transition-colors duration-300">1. Core Concepts</a></li>
  <li><a href="#2-common-use-cases" class="text-base-300 hover:text-primary-400 transition-colors duration-300">2. Common Use Cases</a></li>
  <li><a href="#3-creating-your-first-workflow" class="text-base-300 hover:text-primary-400 transition-colors duration-300">3. Creating Your First Workflow</a></li>
  <li><a href="#4-practical-examples" class="text-base-300 hover:text-primary-400 transition-colors duration-300">4. Practical Examples</a></li>
  <li><a href="#5-using-secrets-in-workflows" class="text-base-300 hover:text-primary-400 transition-colors duration-300">5. Using Secrets in Workflows</a></li>
  <li><a href="#6-advanced-workflows" class="text-base-300 hover:text-primary-400 transition-colors duration-300">6. Advanced Workflows</a></li>
  <li><a href="#7-best-practices" class="text-base-300 hover:text-primary-400 transition-colors duration-300">7. Best Practices</a></li>
  <li><a href="#8-next-steps" class="text-base-300 hover:text-primary-400 transition-colors duration-300">8. Next Steps</a></li>
  <li><a href="#9-glossary" class="text-base-300 hover:text-primary-400 transition-colors duration-300">9. Glossary</a></li>
</ul>
</div>

---

## What are GitHub Actions?

GitHub Actions is GitHub's native automation feature that enables CI/CD directly in your repositories. With Actions, you
can build and test code, deploy apps, run scheduled tasks, and respond to various GitHub events like pushes, pull
requests, issues, and more.

It's event-driven and tightly integrated with GitHub, making it easy to set up and scale across different projects and
languages.

---

## 1. Core Concepts

A GitHub Actions **workflow** is triggered by an **event** (such as a `push`, `pull_request`, or a manual dispatch). That event starts a pipeline of automated steps, which are defined using a structured set of concepts:

- **Workflow**: A configurable automation file written in YAML, stored in `.github/workflows/`.
- **Job**: A group of steps that run on the same virtual environment (also called a runner).
- **Step**: An individual task — usually a shell command or a call to an action.
- **Action**: A reusable unit of logic that can be used across workflows. You can use official or community actions from the GitHub Marketplace, or create your own.
- **Runner**: The virtual machine where jobs are executed (e.g., `ubuntu-latest`, `windows-latest`).

![Diagram showing how GitHub Actions workflows are triggered by events and structured into jobs and steps](/assets/blog/github-actions-flow-diagram.webp)

---

## 2. Common Use Cases

- **CI/CD pipelines**: Automate test, build, and deployment cycles.
- **Issue management**: Label issues, notify teams, or auto-close stale issues.
- **Dependency updates**: Automatically check for and apply updates.
- **Container workflows**: Build and publish Docker containers.
- **Documentation deployment**: Push markdown docs to GitHub Pages.

---

## 3. Creating Your First Workflow

If you're just getting started, the fastest way to create your first GitHub Action is directly from the GitHub
interface — no local setup required.

### 📍 Step-by-Step

1. Go to your repository on GitHub.

2. Click the **Actions** tab in the top menu.

3. GitHub will suggest templates based on your project.
   <img
   src="/assets/blog/github-actions-screenshot-1.webp"
   alt="GitHub Actions tab showing template suggestions"
   data-zoomable
   />

4. Choose a template or click **"set up a workflow yourself"** to start from scratch.

   GitHub will open a built-in editor with a new file at `.github/workflows/`.

   Paste the following:

   ```yaml
   name: Hello World

   on: [push]

   jobs:
     greet:
       runs-on: ubuntu-latest
       steps:
         - name: Print greeting
           run: echo "👋 Hello from your first GitHub Action!"
   ```

   <img
   src="/assets/blog/github-actions-screenshot-2.webp"
   alt="YAML editor with hello-world workflow example"
   data-zoomable
   />

5. Click **Commit changes** to save and activate the workflow.

- The workflow will run automatically after each `git push`.
- You can view its execution in the **Actions** tab, where each step is logged in real-time.
- If something fails, GitHub shows exactly where and why.
  <img
  src="/assets/blog/github-actions-screenshot-3.webp"
  alt="GitHub Actions run result showing successful output"
  data-zoomable
  />

> 💡 Once you're comfortable, you can define more complex workflows or store them in your repo directly.

---

## 4. Practical Examples

### 🧪 Example: Continuous Integration for Node.js

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
> Ensures that every change pushed to the repository or suggested through a pull request is automatically validated by
> building and executing tests.


### 🧪 Example: Deployment to GitHub Pages

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


### 🧪 Example: Daily Scheduled Cleanup

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


### 🧪 Example: Publish to NPM on Tag Push

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
> Triggered when a new version tag is pushed, this workflow installs dependencies and publishes the package to NPM using
> a secret authentication token.


### 🧪 Example: Send Slack Notification on Push

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

## 5. Using Secrets in Workflows

You may have noticed that some of the examples above reference values like `${{ secrets.NPM_TOKEN }}` or
`${{ secrets.SLACK_WEBHOOK }}`. These are known as **GitHub Secrets**, and they're essential for securely handling
sensitive information in your workflows.

Many automation tasks require access to credentials such as API keys, access tokens, or webhook URLs. Instead of
hardcoding these into your workflow files (which is insecure and discouraged), GitHub allows you to store them securely
in your repository settings.

### How to add a secret

1. Go to your repository on GitHub.
2. Navigate to **Settings → Secrets and variables → Actions**.
3. Click **New repository secret**.
4. Add a name like `NPM_TOKEN` or `SLACK_WEBHOOK` and paste the corresponding value.

Once added, you can reference your secret in any workflow file like this:

```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 6. Advanced Workflows

GitHub Actions can scale with your projects, supporting advanced automation scenarios. Here are some patterns and
features you can use to unlock powerful workflows:

- **Matrix builds**: Run jobs across multiple environments (OS, language versions, etc.) to ensure cross-compatibility.
- **Reusable workflows**: Share and reuse entire workflows across repositories or teams, improving maintainability.
- **Environment-specific jobs**: Use conditional logic (`if:`) to trigger jobs only in certain environments like staging
  or production.
- **Manual triggers**: Allow manual execution of workflows through `workflow_dispatch`, useful for deployments or fixes.
- **Artifacts and logs**: Upload generated files, logs, or reports using `actions/upload-artifact` for later inspection.
- **Conditional job chaining**: Combine `needs` and job outputs to create sophisticated job dependencies.
- **Dynamic expressions**: Use `${{ }}` syntax with contexts and functions to dynamically control your workflows (e.g.,
  `${{ github.actor }}`, `${{ steps.step_id.outputs.result }}`).
- **Third-party integrations**: Trigger workflows from external services using `repository_dispatch` events.

### 🧪 Example: Workflow Dispatch with Custom Inputs

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment target'
        required: true
        default: 'staging'
```

> Enables manual triggering from the GitHub UI with custom parameters.


### 🧪 Example: Uploading Artifacts

```yaml
- name: Upload coverage report
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: ./coverage/
```

> Save build results, test coverage reports, or other generated assets for download or review.


### 🧪 Example: Conditional Jobs Based on Environment

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: ./deploy.sh
```

> This job runs only if the push was to the `main` branch.

---

## 7. Best Practices

- **Keep it simple**: Break large workflows into smaller, manageable files.
- **Cache dependencies**: Improve build times using `actions/cache`.
- **Secure secrets**: Store tokens and API keys in `Settings > Secrets`.
- **Use pinned versions**: Reference specific versions (`@v4`, `@v2`) instead of `@latest`.
- **Avoid redundancy**: Reuse logic with composite actions or reusable workflows.
- **Monitor runs**: Set up failure alerts and track metrics.

---

## 8. Next Steps

- Read the official [GitHub Actions Quickstart](https://docs.github.com/en/actions/quickstart).
- Explore pre-built [actions on the Marketplace](https://github.com/marketplace/actions).
- Experiment with advanced features like job dependencies, matrix builds, and composite actions.
- Track workflow runs in the "Actions" tab for insights and debugging.

> 🌟 **Pro tip:** Automate documentation updates and changelog generation with GitHub Actions using tools
> like [release-drafter](https://github.com/marketplace/actions/release-drafter) to generate changelogs automatically.

---

## 9. Glossary

- **Workflow**: A YAML-defined automation triggered by GitHub events.
- **Runner**: A VM or container where a job is executed.
- **Job**: A set of sequential steps in a workflow.
- **Step**: A command or action within a job.
- **Matrix build**: A strategy to run jobs across multiple configurations.

For more terms, visit
the [GitHub Actions glossary](https://docs.github.com/en/actions/learn-github-actions/essential-features-of-github-actions#terminology).

---

> 🎯 Start with a small automation (like linting or testing), then evolve your workflow as your project grows.

---

**Happy Automating with GitHub Actions!** 🚀
