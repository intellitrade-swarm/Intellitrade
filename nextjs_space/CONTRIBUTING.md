
# Contributing to iCHAIN Swarms

Thank you for your interest in contributing to iCHAIN Swarms! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/YOUR_USERNAME/ichain-swarms/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Detailed description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing [Issues](https://github.com/YOUR_USERNAME/ichain-swarms/issues) for similar suggestions
2. Create a new issue with:
   - Clear feature description
   - Use case and benefits
   - Potential implementation approach
   - Any relevant examples

### Code Contributions

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ichain-swarms.git
cd ichain-swarms

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/ichain-swarms.git
```

#### 2. Create a Branch

```bash
# Update your fork
git checkout master
git pull upstream master

# Create feature branch
git checkout -b feature/your-feature-name
```

#### 3. Make Changes

- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation as needed
- Write/update tests if applicable

#### 4. Test Your Changes

```bash
# Install dependencies
yarn install

# Run type checking
yarn tsc --noEmit

# Run linting
yarn lint

# Test build
yarn build

# Run development server
yarn dev
```

#### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add new trading strategy for volatility detection

- Implemented moving average crossover
- Added risk management parameters
- Updated documentation"
```

**Commit Message Format:**

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or updates
- `chore`: Maintenance tasks

#### 6. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then:
1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Submit the pull request

### Pull Request Guidelines

**Before Submitting:**
- ✅ Code builds successfully
- ✅ All tests pass
- ✅ No linting errors
- ✅ Documentation updated
- ✅ Commits are clean and descriptive

**PR Description Should Include:**
- What changes were made
- Why the changes were made
- How to test the changes
- Screenshots (if UI changes)
- Related issue numbers (if applicable)

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

```typescript
// Use TypeScript for new files
// Use meaningful variable names
const tradingStrategy = new Strategy();

// Use async/await over promises
async function executeTrade() {
  try {
    const result = await api.trade();
    return result;
  } catch (error) {
    console.error('Trade failed:', error);
    throw error;
  }
}

// Add JSDoc comments for functions
/**
 * Calculates optimal position size based on account balance and risk
 * @param balance - Current account balance in USD
 * @param riskPercent - Risk percentage (0-100)
 * @returns Position size in USD
 */
function calculatePositionSize(balance: number, riskPercent: number): number {
  return balance * (riskPercent / 100);
}
```

### React Components

```typescript
// Use functional components with TypeScript
interface TradingCardProps {
  trade: Trade;
  onClose: () => void;
}

export function TradingCard({ trade, onClose }: TradingCardProps) {
  const [loading, setLoading] = useState(false);
  
  // Handlers
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
}
```

### File Organization

```
lib/
├── trading/           # Trading logic
├── ai/               # AI providers
├── blockchain/       # Blockchain interactions
└── utils/            # Utility functions

components/
├── ui/               # Reusable UI components
├── trading/          # Trading-specific components
└── layout/           # Layout components

app/
├── api/              # API routes
├── arena/            # Arena page
└── auth/             # Authentication pages
```

## 🔒 Security Guidelines

### Never Commit:
- ❌ API keys or secrets
- ❌ Private keys or mnemonics
- ❌ Database credentials
- ❌ Personal information
- ❌ .env files

### Always:
- ✅ Use environment variables
- ✅ Validate user input
- ✅ Sanitize data
- ✅ Follow principle of least privilege
- ✅ Review dependencies for vulnerabilities

## 📝 Documentation Guidelines

### Code Comments

```typescript
// Good: Explains WHY
// Use exponential backoff to handle rate limits from the API
await retryWithBackoff(apiCall);

// Bad: Explains WHAT (obvious from code)
// Call the API
await apiCall();
```

### Documentation Files

- Keep README.md up to date
- Document new features in guides
- Update API documentation
- Add examples for complex features

## 🧪 Testing Guidelines

```typescript
// Write tests for critical functionality
describe('Position Sizing', () => {
  it('should calculate correct position size', () => {
    const balance = 1000;
    const risk = 2;
    const result = calculatePositionSize(balance, risk);
    expect(result).toBe(20);
  });
  
  it('should handle zero balance', () => {
    const result = calculatePositionSize(0, 2);
    expect(result).toBe(0);
  });
});
```

## 🐛 Debugging Tips

### Logging

```typescript
// Use structured logging
console.log('[Trading]', 'Executing trade:', {
  symbol: 'ETH-USD',
  amount: 100,
  side: 'buy'
});

// For debugging only
if (process.env.NODE_ENV === 'development') {
  console.debug('Debug info:', data);
}
```

### Error Handling

```typescript
try {
  await riskyOperation();
} catch (error) {
  // Log with context
  console.error('Operation failed:', {
    operation: 'riskyOperation',
    error: error.message,
    stack: error.stack
  });
  
  // Re-throw or handle
  throw new Error(`Failed to execute: ${error.message}`);
}
```

## 📋 Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainer reviews code
3. **Testing**: Reviewer tests changes locally
4. **Approval**: PR approved and merged
5. **Release**: Changes included in next release

## 🎯 Priority Areas

We're especially looking for contributions in:

1. **Trading Strategies**: New profitable strategies
2. **AI Integration**: Additional AI providers
3. **Risk Management**: Enhanced safety features
4. **UI/UX**: Improved user interface
5. **Documentation**: Guides and examples
6. **Testing**: Comprehensive test coverage
7. **Performance**: Optimization improvements

## 💬 Communication

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions
- **Discussions**: General questions and ideas

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

Thank you for contributing to iCHAIN Swarms! 🚀
