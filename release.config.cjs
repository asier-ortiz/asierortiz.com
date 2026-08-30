module.exports = {
  branches: ['main'],

  plugins: [
    '@semantic-release/commit-analyzer', // Analyzes commit messages to determine the next version
    '@semantic-release/release-notes-generator', // Generates release notes based on commits
    '@semantic-release/changelog', // Updates the CHANGELOG.md file
    ['@semantic-release/npm', { npmPublish: false }], // Writes the new version to package.json; never publishes to npm
    '@semantic-release/git', // Commits the updated files (package.json, changelog, etc.) — must run after npm
    '@semantic-release/github', // Publishes the release on GitHub with changelog and tag
  ],

  preset: 'conventionalcommits', // Uses Conventional Commits convention
};
