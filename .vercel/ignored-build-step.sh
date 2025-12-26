#!/bin/bash

# Exit with 1 to skip build, 0 to proceed with build

# Get the latest commit message
COMMIT_MSG=$(git log -1 --pretty=%B)

# Skip build if commit message contains [skip ci] or [vercel skip]
if [[ "$COMMIT_MSG" =~ \[skip\ ci\] ]] || [[ "$COMMIT_MSG" =~ \[vercel\ skip\] ]]; then
  echo "🛑 Skipping build due to commit message"
  exit 1
fi

# Check if only certain files changed (e.g., docs, specs)
if git diff HEAD^ HEAD --quiet -- ':(exclude)src/' ':(exclude)api/' ':(exclude)lib/' ':(exclude)package.json' ':(exclude)vercel.json'; then
  echo "🛑 Skipping build - only non-code files changed"
  exit 1
fi

# Proceed with build
echo "✅ Proceeding with build"
exit 0
