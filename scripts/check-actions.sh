#!/bin/sh

# See https://alexwlchan.net/2025/github-actions-audit/
find . -path './.github/workflows/*' -type f -name '*.yml' -print0 \
  | xargs -0 grep --no-filename "uses:" \
  | sed 's/\- uses:/uses:/g' \
  | tr '"' ' ' \
  | awk '{print $2}' \
  | sed 's/\r//g' \
  | sort \
  | uniq --count \
  | sort --numeric-sort