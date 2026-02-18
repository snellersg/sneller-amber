# Comprehensive Test Plan - Sneller Amber v2

## 🎯 Overview

This test plan ensures code quality, functionality, and reliability across all aspects of the Sneller Amber application. It covers static analysis, automated testing, performance validation, and security checks.

## 🚀 Quick Start

Run all quality checks with a single command:

```bash
npm run test:all
```

Individual test categories:

```bash
npm run test:lint          # Code linting and formatting
npm run test:type          # TypeScript type checking
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests
npm run test:build         # Build verification
npm run test:security      # Security audit
npm run test:performance   # Performance benchmarks
```

## 📋 Test Categories

### 1. **Static Code Analysis**

#### Linting & Formatting

```bash
# Check code style and formatting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Verify Next.js build
npm run build:verify
```

**What it checks:**

- ESLint rules compliance
- TypeScript type safety
- Code formatting consistency
- Import/export correctness
- Unused variables and dead code

#### Security Scanning

```bash
# Check for vulnerabilities
npm run security:audit

# Check dependencies
npm run security:deps
```

### 2. **Automated Testing**

#### Unit Tests

```bash
# Run unit tests
npm run test:unit

# Run with coverage
npm run test:unit:coverage

# Watch mode for development
npm run test:unit:watch
```

**Coverage targets:**

- Utilities and helpers: 90%+
- Business logic: 85%+
- Components: 80%+
- API routes: 90%+

#### Integration Tests

```bash
# Test component integration
npm run test:integration

# Test API endpoints
npm run test:api
```

**What it tests:**

- Supabase connection and queries
- Authentication flows
- Component interactions
- Network state handling
- Mobile lifecycle integration

#### End-to-End Tests

```bash
# Run full user journeys
npm run test:e2e

# Run in specific browser
npm run test:e2e:chrome
npm run test:e2e:mobile
```

**Critical user flows:**

- User registration and login
- Admin panel access and functionality
- Mobile app lifecycle transitions
- Network reconnection scenarios
- Error recovery processes

### 3. **Performance Testing**

```bash
# Lighthouse performance audit
npm run test:performance

# Bundle size analysis
npm run analyze:bundle

# Load testing
npm run test:load
```

**Performance targets:**

- First Contentful Paint: < 2s
- Largest Contentful Paint: < 4s
- Cumulative Layout Shift: < 0.1
- Bundle size: < 500KB (gzipped)

### 4. **Build Verification**

```bash
# Verify production build
npm run test:build

# Check all environments
npm run test:build:all

# Validate deployment
npm run test:deploy
```

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

- Unit test runner
- Coverage reporting
- Module mocking
- React Testing Library setup

### Playwright Configuration (`playwright.config.ts`)

- E2E test runner
- Multi-browser testing
- Mobile device simulation
- Visual regression testing

### Quality Gates

Before merging code, ensure:

- [ ] All lint checks pass (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Unit tests pass with >80% coverage (`npm run test:unit:coverage`)
- [ ] Integration tests pass (`npm run test:integration`)
- [ ] Build succeeds (`npm run build`)
- [ ] No security vulnerabilities (`npm run security:audit`)

## 📱 Mobile-Specific Testing

Given the mobile connection fixes, special attention to:

### Mobile Network Scenarios

- [ ] App backgrounding/foregrounding
- [ ] Network disconnection/reconnection
- [ ] Poor network conditions
- [ ] Authentication persistence
- [ ] Error recovery mechanisms

### Test Scripts for Mobile

```bash
# Mobile-specific E2E tests
npm run test:mobile

# Network simulation tests
npm run test:network-conditions

# Mobile performance audit
npm run test:mobile:performance
```

## 🔍 Manual Testing Checklist

### Authentication & Authorization

- [ ] User can register with valid email
- [ ] User can login with correct credentials
- [ ] Admin users can access admin panel
- [ ] Non-admin users are restricted appropriately
- [ ] Password reset functionality works
- [ ] Session persistence across browser refreshes

### Admin Panel Functionality

- [ ] User management (view, invite, role changes)
- [ ] Domain management (add, remove, view)
- [ ] Data loads correctly on page refresh
- [ ] Error states display appropriately
- [ ] Loading states are user-friendly

### Mobile App Lifecycle

- [ ] App handles backgrounding gracefully
- [ ] Reconnection works after network loss
- [ ] No "Something went wrong" errors on app return
- [ ] Real-time updates continue after reconnection
- [ ] UI remains responsive during reconnection

### Cross-Browser Compatibility

Test in:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 🚨 Critical Error Scenarios

Test these failure modes:

- [ ] Supabase service unavailable
- [ ] Network timeout scenarios
- [ ] Invalid authentication tokens
- [ ] Database connection failures
- [ ] API rate limiting
- [ ] Large data set handling

## 📊 Monitoring & Alerts

### Production Monitoring

- Error tracking integration
- Performance monitoring
- Real User Monitoring (RUM)
- Uptime monitoring

### Key Metrics to Track

- Error rates
- Performance metrics
- User engagement
- Authentication success rates
- Mobile connection stability

## 🔄 Continuous Integration

### Pre-commit Hooks

```bash
# Install pre-commit hooks
npm run prepare

# Run all checks before commit
npm run pre-commit
```

### GitHub Actions Workflow

Automatically runs on PR/push:

1. Lint and type checking
2. Unit and integration tests
3. Build verification
4. Security audit
5. Performance regression checks

## 📚 Test Data Management

### Test Database Setup

- Separate test Supabase instance
- Seed data scripts
- Data cleanup procedures
- Mock user accounts

### Environment Variables

Required for testing:

```env
# Test environment variables
NEXT_PUBLIC_SUPABASE_URL_TEST=
NEXT_PUBLIC_SUPABASE_ANON_KEY_TEST=
SUPABASE_SERVICE_ROLE_KEY_TEST=
```

## 🎉 Success Criteria

A release is ready when:

- [ ] All automated tests pass
- [ ] Code coverage meets targets
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Manual testing checklist complete
- [ ] Mobile scenarios thoroughly tested
- [ ] Production build deploys successfully

## 🔧 Troubleshooting

### Common Issues

- **Tests failing locally but passing in CI**: Environment differences, clear cache
- **Mobile tests inconsistent**: Network timing, increase timeouts
- **Build failures**: Check TypeScript errors, dependency conflicts
- **Performance regressions**: Analyze bundle, check for memory leaks

### Debug Commands

```bash
# Debug test failures
npm run test:debug

# Verbose test output
npm run test:verbose

# Clear all caches
npm run clean
```

## 📝 Documentation

Keep updated:

- [ ] API documentation
- [ ] Component documentation
- [ ] Architecture decisions
- [ ] Performance benchmarks
- [ ] Security considerations

---

_This test plan should be reviewed and updated with each major release or architectural change._
