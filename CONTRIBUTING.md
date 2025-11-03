# Contributing to Youth Finance App

Thank you for your interest in contributing to Youth Finance App! This document provides guidelines and instructions for contributing to the project.

## 🌟 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/YOUR_USERNAME/youth-finance-app.git
   cd youth-finance-app
   ```
3. **Create a branch** for your contribution
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies**
   ```bash
   npm install
   ```
5. **Set up your development environment** (see README.md)

## 💻 Development Workflow

### Making Changes

1. **Write clear, concise commits**
   - Use present tense ("Add feature" not "Added feature")
   - Reference issues when applicable (#123)
   - Keep commits focused on a single change

2. **Follow the coding standards**
   - TypeScript strict mode
   - ESLint and Prettier configurations
   - Existing code style and patterns

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Update documentation** if needed

### Commit Message Format

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT refresh token functionality

Implement refresh token rotation to improve security.
Tokens are now stored in httpOnly cookies.

Closes #123
```

```
fix(transactions): resolve balance calculation bug

Fixed an issue where pending transactions were
incorrectly included in available balance.

Fixes #456
```

## 🧪 Testing

- Write tests for new features
- Ensure all existing tests pass
- Aim for high test coverage
- Include both unit and integration tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Code Style

### TypeScript

- Use TypeScript strict mode
- Define types explicitly
- Avoid `any` type
- Use interfaces for object shapes
- Use enums for fixed sets of values

### Naming Conventions

- **Files**: kebab-case (e.g., `user-service.ts`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Functions/Variables**: camelCase (e.g., `getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_LOGIN_ATTEMPTS`)
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `User` or `IUser`)

### Code Organization

```typescript
// Imports (external first, then internal)
import express from 'express';
import { UserService } from './services/user.service';

// Types/Interfaces
interface RequestBody {
  email: string;
  password: string;
}

// Constants
const MAX_RETRIES = 3;

// Main code
export const loginController = async (req, res) => {
  // Implementation
};
```

### Comments

- Write self-documenting code
- Add JSDoc comments for public APIs
- Explain "why" not "what"
- Keep comments up to date

```typescript
/**
 * Creates a new user account with the provided information.
 * 
 * @param userData - User registration data
 * @returns Created user object without password
 * @throws {ValidationError} If user data is invalid
 * @throws {ConflictError} If email already exists
 */
export async function createUser(userData: UserRegistrationData): Promise<User> {
  // Implementation
}
```

## 🔍 Pull Request Process

1. **Update your branch** with the latest main
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Push your changes**
   ```bash
   git push origin your-branch
   ```

3. **Create a Pull Request** on GitHub
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Reference related issues
   - Add screenshots for UI changes
   - Ensure CI checks pass

4. **Address review feedback**
   - Be responsive to comments
   - Make requested changes
   - Push updates to the same branch

5. **Wait for approval** from maintainers

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe testing done

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No new warnings
```

## 🏗️ Project Structure

### Backend
```
backend/src/
├── config/         # Configuration files
├── controllers/    # Route controllers (thin layer)
├── services/       # Business logic (thick layer)
├── middleware/     # Custom middleware
├── routes/         # Route definitions
├── validators/     # Request validation schemas
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
```

### Frontend (Web Dashboard)
```
web-dashboard/src/
├── components/     # Reusable components
│   ├── common/     # Generic components
│   └── layout/     # Layout components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── services/       # API services
├── stores/         # State management
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## 🐛 Reporting Bugs

Before reporting a bug:
1. Check existing issues
2. Use latest version
3. Try to reproduce consistently

When reporting:
- Use a clear title
- Describe expected vs actual behavior
- Provide reproduction steps
- Include environment details
- Add error messages/logs
- Attach screenshots if applicable

## 💡 Feature Requests

We welcome feature requests! Please:
- Check existing feature requests
- Clearly describe the feature
- Explain the use case
- Discuss implementation approach (if applicable)

## 📚 Documentation

- Update README.md for user-facing changes
- Update API docs for endpoint changes
- Add JSDoc comments for new functions/classes
- Update architecture docs for structural changes

## 🔒 Security

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Email the security team directly
3. Provide detailed information
4. Wait for acknowledgment before disclosure

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

All contributors will be recognized in our documentation and release notes.

## 📞 Questions?

- Open a GitHub discussion
- Comment on existing issues
- Reach out to maintainers

Thank you for contributing to Youth Finance App! 🎉
