# Testing Guide for NewAgentCard Component

## Overview

This guide explains how to run snapshot tests for the `NewAgentCard` component to detect visual changes between updates. The tests use **Vitest** with **React Testing Library** for comprehensive visual regression testing.

## Test Setup

### Dependencies Installed

- **Vitest**: Fast unit test runner
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **jsdom**: DOM environment for Node.js testing
- **@vitejs/plugin-react**: React plugin for Vite

### Configuration Files

1. **`vitest.config.ts`**: Vitest configuration with React support
2. **`src/test/setup.ts`**: Test setup with mocks for Next.js components
3. **`src/components/agents-v2/__tests__/NewAgentCard.test.tsx`**: Snapshot tests

## Running Tests

### Basic Test Commands

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run snapshot tests with verbose output
npm run test:snapshot
```

### Running Specific Tests

```bash
# Run only NewAgentCard tests
npm run test:run -- NewAgentCard

# Run specific test file
npm run test:run -- src/components/agents-v2/__tests__/NewAgentCard.test.tsx

# Run tests matching a pattern
npm run test:run -- -t "snapshot"
```

## Snapshot Test Structure

### Test Categories

1. **Snapshot Tests**: Basic rendering tests for all variants
2. **Visual Regression Tests**: Styling consistency tests
3. **Responsive Design Tests**: Layout tests for different screen sizes

### Mock Data Examples

The tests use comprehensive mock data that covers all possible states:

```typescript
const mockAgent: AIAgent = {
  id: 'test-agent',
  name: 'AI Test Compliance Agent',
  description: 'A comprehensive AI agent for testing...',
  icon: 'GraduationCap',
  price: '£199.99',
  originalPrice: '£299.99',
  features: ['Automated compliance checking', 'Real-time monitoring'],
  keyBenefits: ['Reduce compliance errors by 95%', 'Save 20+ hours per week'],
  status: 'available',
  category: 'compliance',
  complexity: 'advanced',
  href: '/ai-test-compliance',
  popular: true,
  new: false,
  showcaseImage: '/images/test-agent-showcase.png'
}
```

## Test Scenarios Covered

### 1. Component Variants
- ✅ Default variant
- ✅ Compact variant
- ✅ Featured variant

### 2. Agent States
- ✅ Available agents
- ✅ Coming soon agents
- ✅ Popular agents
- ✅ New agents
- ✅ Agents with/without original price
- ✅ Agents with/without showcase images

### 3. Display Options
- ✅ With/without images
- ✅ With/without badges
- ✅ With/without benefits
- ✅ With/without action buttons
- ✅ Custom CSS classes

### 4. Visual Regression
- ✅ Popular agent styling
- ✅ New agent styling
- ✅ Button states (available vs coming soon)
- ✅ Responsive layouts

## Understanding Snapshot Tests

### What Are Snapshots?

Snapshot tests capture the rendered HTML output of your component and save it as a reference. When you run tests again, they compare the new output against the saved snapshot to detect any changes.

### Snapshot Files

Snapshots are stored in:
```
src/components/agents-v2/__tests__/__snapshots__/
```

### When Snapshots Change

Snapshots will change when:
- Component structure changes
- CSS classes change
- Text content changes
- Props behavior changes

### Updating Snapshots

When you make intentional changes to the component:

```bash
# Update all snapshots
npm run test:run -- -u

# Update specific test snapshots
npm run test:run -- -u --testNamePattern="NewAgentCard"
```

## Visual Regression Testing

### Purpose

Visual regression tests ensure that styling remains consistent across updates, especially for:
- Popular agent indicators
- New agent badges
- Button states
- Responsive layouts

### Test Examples

```typescript
// Tests popular agent styling consistency
it('should maintain consistent styling for popular agents', () => {
  const popularAgent = { ...mockAgent, popular: true, new: false }
  const { container } = render(<NewAgentCard agent={popularAgent} />)
  expect(container.firstChild).toMatchSnapshot('popular-agent-styling')
})
```

## Troubleshooting

### Common Issues

1. **Snapshot Mismatch**
   ```bash
   # If snapshots don't match, review the diff and update if intentional
   npm run test:run -- -u
   ```

2. **Icon Rendering Issues**
   - The Icon component is mocked to avoid dynamic rendering issues
   - Icons are rendered as `<div>` elements with the icon name

3. **Next.js Component Issues**
   - Next.js Image component is mocked
   - Router functions are mocked
   - Window.location is mocked

### Debugging Tests

```bash
# Run tests with debug output
npm run test:run -- --reporter=verbose

# Run specific failing test
npm run test:run -- -t "should render default variant correctly"
```

## Best Practices

### 1. Test All Variants
Always test all component variants and prop combinations to ensure comprehensive coverage.

### 2. Use Descriptive Test Names
Test names should clearly describe what scenario is being tested:
```typescript
it('should render coming soon agent correctly', () => {
  // test implementation
})
```

### 3. Mock External Dependencies
Mock Next.js components and external dependencies to isolate component testing.

### 4. Test Edge Cases
Include tests for:
- Minimal data scenarios
- Missing optional props
- Different agent statuses

### 5. Regular Snapshot Updates
Update snapshots when making intentional changes to avoid false positives.

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
```

### Pre-commit Hooks

Consider adding pre-commit hooks to run tests automatically:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run"
    }
  }
}
```

## Performance Considerations

### Test Execution Time
- Snapshot tests are fast (typically < 100ms per test)
- Total test suite runs in ~2-3 seconds
- Use `--run` flag for CI/CD environments

### Memory Usage
- Tests use jsdom for DOM simulation
- Minimal memory footprint
- Suitable for CI/CD environments

## Future Enhancements

### Potential Improvements

1. **Visual Testing**: Integrate with tools like Percy or Chromatic for visual regression testing
2. **Accessibility Testing**: Add axe-core for accessibility testing
3. **Performance Testing**: Add performance benchmarks
4. **E2E Testing**: Add Playwright or Cypress for end-to-end testing

### Additional Test Types

```typescript
// Accessibility tests
it('should meet accessibility standards', async () => {
  const { container } = render(<NewAgentCard agent={mockAgent} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

// Performance tests
it('should render within performance budget', () => {
  const start = performance.now()
  render(<NewAgentCard agent={mockAgent} />)
  const end = performance.now()
  expect(end - start).toBeLessThan(100) // 100ms budget
})
```

## Conclusion

The snapshot testing setup provides comprehensive visual regression testing for the NewAgentCard component. Regular test runs will help catch unintended visual changes and ensure component consistency across updates.

For questions or issues, refer to the Vitest documentation or the project's testing guidelines. 