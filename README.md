# asierortiz.com

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![semantic-release](https://img.shields.io/badge/semantic--release-🚀-green?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Release Workflow](https://github.com/asier-ortiz/asierortiz.com/actions/workflows/release.yml/badge.svg)](https://github.com/asier-ortiz/asierortiz.com/actions/workflows/release.yml)
[![Validate RSS Feed](https://github.com/asier-ortiz/asierortiz.com/actions/workflows/validate-feed.yml/badge.svg)](https://github.com/asier-ortiz/asierortiz.com/actions/workflows/validate-feed.yml)
[![Broken Links Check](https://github.com/asier-ortiz/asierortiz.com/actions/workflows/check-links.yml/badge.svg)](https://github.com/asier-ortiz/asierortiz.com/actions/workflows/check-links.yml)

This repository contains the source code for my personal portfolio and blog: [asierortiz.com](https://asierortiz.com/).

---

## ✨ About the Project

My personal website showcases my work, projects, and technical blog.

It features:

- **Hero Section**: Brief introduction and call to action.
- **Background**: Overview of my experience, skills, and technologies that I use.
- **Projects**: Selected portfolio projects with detailed descriptions and repository links.
- **Blog**: A space for articles about web development, machine learning, and more.
- **Newsletter Subscription** *(Work in Progress)*: A feature to allow visitors to subscribe easily via Netlify Forms, with future integration to external email marketing services.
- **Contact**: Includes links to my email and social media profiles for easy connection.

---

## ⚙️ Technologies Used

- [Astro](https://astro.build/)
- [Vue 3](https://vuejs.org/) (for interactive islands)
- [Fuse.js](https://fusejs.io/) (for full-text fuzzy search within the blog)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Netlify](https://www.netlify.com/) (Continuous Deployment is set up through GitHub integration)

---

## 🔄 CI/CD Workflows

This project uses GitHub Actions to ensure code quality and automate deployment:

- **Semantic Release**: Automatically determines the next version, updates the changelog, tags the release, and publishes it to GitHub based on commit messages.
- **Validate RSS Feed**: Checks that the generated RSS feed (`/feed.xml`) is valid after each push.
- **Check Broken Links**: Scans the site for broken links after each build to ensure reliability.
- **Continuous Deployment**: If all validations pass, the site is automatically deployed to Netlify.

---

## 🚀 Getting Started

Clone and Run Locally:

```bash
git clone https://github.com/yourusername/asierortiz.com.git
cd asierortiz.com
npm install
npm run dev
```

### Available Commands

| Command                    | Action                                              |
|:---------------------------|:----------------------------------------------------|
| `npm install`              | Install dependencies                                |
| `npm run dev`              | Start local development server at `localhost:3000`  |
| `npm run build`            | Build the production site into `./dist/`            |
| `npm run preview`          | Preview the production build locally                |
| `npm run format`           | Format code using Prettier                          |
| `npm run astro ...`        | Run CLI commands like `astro add`, `astro check`    |
| `npm run astro -- --help`  | Get help using the Astro CLI                        |

---

## 📷 Screenshots

<table style="border: none; border-collapse: collapse;">
  <tr>
    <td align="center" style="border: none;">
      <img src="./screenshots/screenshot-1.jpg" alt="Screenshot 1" style="max-height: 300px; object-fit: contain;"/>
    </td>
    <td align="center" style="border: none;">
      <img src="./screenshots/screenshot-2.jpg" alt="Screenshot 2" style="max-height: 300px; object-fit: contain;"/>
    </td>
    <td align="center" style="border: none;">
      <img src="./screenshots/screenshot-3.jpg" alt="Screenshot 3" style="max-height: 300px; object-fit: contain;"/>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 📬 Contact

If you have any questions, suggestions, or just want to say hello:

- 📧 [hello@asierortiz.com](mailto:hello@asierortiz.com)

---

> Thank you for visiting my portfolio and blog! 🙌
