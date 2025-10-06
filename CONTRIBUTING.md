# Contributing to TinyVerse Stage

Thank you for your interest in contributing to TinyVerse Stage! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the project
- Show empathy towards other community members

## Getting Started

Before contributing, please:

1. Read the [ROADMAP.md](./ROADMAP.md) to understand project goals
2. Review the [QUICK_START.md](./QUICK_START.md) to understand the project
3. Check existing [issues](../../issues) and [pull requests](../../pulls)
4. Join discussions on relevant issues

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended with Svelte extension)

### Installation

```bash
# Clone the repository
git clone https://github.com/Steake/TinyVerse.git
cd TinyVerse

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking

## Project Structure

```
TinyVerse/
├── src/
│   ├── App.svelte              # Main application
│   ├── lib/
│   │   ├── api/                # API client and types
│   │   ├── components/         # UI components
│   │   ├── stores/             # State management (Svelte stores)
│   │   └── utils/              # Utility functions
│   ├── assets/                 # Static assets
│   └── main.ts                 # Entry point
├── public/                     # Public static files
├── API_spec.md                 # API specification
├── ROADMAP.md                  # Development roadmap
└── QUICK_START.md              # Quick start guide
```

## How to Contribute

### Types of Contributions

1. **Bug Fixes**: Fix existing issues
2. **Features**: Implement new features from the roadmap
3. **Documentation**: Improve or add documentation
4. **Tests**: Add or improve tests
5. **Performance**: Optimize existing code
6. **Accessibility**: Fix accessibility issues

### Finding Work

- Check issues labeled `good first issue` for beginner-friendly tasks
- Look for `help wanted` labels for priority work
- Review [ROADMAP.md](./ROADMAP.md) for planned features
- Check the TypeScript errors list for immediate fixes

### Creating an Issue

Before creating an issue:
1. Search existing issues to avoid duplicates
2. Check if it's already in the roadmap
3. Provide clear reproduction steps for bugs
4. Include screenshots/videos if relevant

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow existing code style

### Svelte Components

- One component per file
- Use `<script lang="ts">` for TypeScript
- Group related functionality together
- Add prop types with TypeScript
- Use reactive statements (`$:`) appropriately
- Keep components under 300 lines when possible

### CSS/Styling

- Use Tailwind CSS utility classes
- Use DaisyUI components when available
- Follow existing color scheme
- Ensure responsive design
- Use semantic HTML elements

### File Naming

- Components: PascalCase (e.g., `AgentCard.svelte`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Stores: camelCase (e.g., `agents.ts`)
- Types: PascalCase (e.g., `Agent.ts`)

### Git Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add agent personality editor
fix: resolve TypeScript error in world store
docs: update API specification
refactor: simplify agent card component
```

## Pull Request Process

### Before Submitting

1. Ensure your code follows the coding standards
2. Update documentation if needed
3. Add tests for new features (when testing is set up)
4. Ensure type checking passes (when errors are fixed)
5. Test your changes thoroughly

### Submitting a PR

1. Fork the repository
2. Create a feature branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Commit with clear messages
5. Push to your fork
6. Open a Pull Request

### PR Guidelines

- **Title**: Clear and descriptive
- **Description**: 
  - What changes were made
  - Why the changes were needed
  - How to test the changes
  - Screenshots/videos if UI changes
- **Link Issues**: Reference related issues with `Fixes #123`
- **Keep Focused**: One feature/fix per PR
- **Small PRs**: Easier to review (< 500 lines preferred)

### PR Template

```markdown
## Description
[Describe your changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (describe)

## Related Issues
Fixes #(issue number)

## How Has This Been Tested?
[Describe testing approach]

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added (when applicable)
```

## Issue Guidelines

### Bug Reports

Include:
- Clear title describing the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/error messages
- Environment (browser, OS, Node version)

### Feature Requests

Include:
- Clear title describing the feature
- Problem it solves
- Proposed solution
- Alternative solutions considered
- Additional context

### Questions

- Check existing documentation first
- Search for similar questions
- Provide context about what you're trying to achieve
- Include code examples if relevant

## Development Tips

### Current Known Issues

The project currently has:
- 62 TypeScript compilation errors (being addressed)
- 54 accessibility warnings (being addressed)
- No backend API implementation (in progress)

When working on the codebase, you may encounter these issues. Focus on:
1. Not introducing new TypeScript errors
2. Following accessibility best practices
3. Using mock data until backend is ready

### Testing Your Changes

```bash
# Run type checking
npm run check

# Run development server and test manually
npm run dev

# Build and check for production issues
npm run build
npm run preview
```

### Debugging

- Use browser DevTools
- Check console for errors
- Use Svelte DevTools extension
- Add console.logs (remove before committing)
- Use TypeScript's type checking

## Questions?

- Open a discussion on GitHub
- Comment on relevant issues
- Review existing documentation

## Recognition

Contributors will be acknowledged in:
- GitHub contributors page
- Release notes for significant contributions
- Future CONTRIBUTORS.md file

Thank you for contributing to TinyVerse Stage! 🎭
