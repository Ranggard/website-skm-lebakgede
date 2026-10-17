# Branch Protection Rules

This document describes the recommended branch protection rules for the SKM Questionnaire Website project.

## Purpose

Branch protection rules ensure code quality and prevent accidental issues from being merged into the main codebase.

## Recommended Rules for Main Branch

### Basic Settings

- **Require a pull request before merging**: Enabled
  - **Require approvals**: 1 approval required
  - **Require status checks to pass before merging**: Enabled
    - **Require branches to be up to date before merging**: Enabled

### Status Checks

The following checks must pass before merging:

1. **Tests and Type Check** (from `.github/workflows/test.yml`)
   - Linter check
   - Type check
   - Unit tests

### Implementation

To set up these rules in GitHub:

1. Go to your repository settings
2. Navigate to **Branches** > **Branch protection rules**
3. Click **Add rule**
4. Configure as follows:

```
Branch name pattern: main
  ☑ Require a pull request before merging
    ☑ Require approvals (1)
  ☑ Require status checks to pass before merging
    ☑ Require branches to be up to date before merging
    Status checks that must pass:
      - Tests and Type Check
```

## Recommended Rules for Develop Branch

Similar settings but with different requirements:

```
Branch name pattern: develop
  ☑ Require a pull request before merging
    ☑ Require approvals (1)
  ☑ Require status checks to pass before merging
    ☑ Require branches to be up to date before merging
```

## Additional Recommendations

- Require all requested reviewers to approve
- Require code review from code owners (if using CODEOWNERS file)
- Dismiss stale pull request approvals when new commits are pushed
- Restrict who can push to matching branches (optional)

## See Also

- [GitHub Branch Protection Rules Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Workflow file](.github/workflows/test.yml)
