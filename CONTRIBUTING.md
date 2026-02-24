# Contributing Guide

## Code Standards

### TypeScript
- Strict mode enabled
- Explicit types for function parameters and returns
- No `any` types (use `unknown` with type guards)

### Naming Conventions
- Classes: `PascalCase` (e.g., `UserProfile`)
- Functions/variables: `camelCase` (e.g., `getUserProfile`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_TIMEOUT`)
- Files: `kebab-case.ts` or `PascalCase.ts` for components

### Database Schema
- Table names: `snake_case` (e.g., `user_profiles`)
- Column names: `snake_case` (e.g., `first_name`)
- Foreign keys: `{table_name}_id` (e.g., `user_id`)

### Git Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Commit with clear messages: `git commit -m "Add feature: description"`
3. Push to remote: `git push origin feature/description`
4. Create pull request for code review

### Commit Message Format
```
type: subject

body (optional)

footer (optional, e.g., Closes #123)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Pull Request Process

1. Update DEVELOPMENT.md with any new steps
2. Add tests for new features
3. Ensure all tests pass: `npm run test`
4. Ensure code is linted: `npm run lint`
5. Request code review

## Testing

### Backend Tests
```bash
npm run backend:test
```

### Frontend Tests
```bash
npm run frontend:test
```

## Performance Considerations

- Database queries: Use indexes, avoid N+1 problems
- API responses: Keep under 1MB, paginate large datasets
- Frontend: Code split, lazy load components
- LLM calls: Cache responses when possible

## Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Use parameterized queries
- Keep dependencies updated

## Documentation

- Add JSDoc comments for public functions
- Document complex algorithms
- Keep README and API docs updated
- Document environment variables

## Questions?

Open an issue or contact the maintainers.
