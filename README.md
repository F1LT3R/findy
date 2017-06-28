# Findy!

> The handy little cli utility for finding lost files.

![[Example Output](output.png)](output.png)

- Finds files reursively
- Ignores `node_modules` and `.git` directories
- Lists files in reverse modified order (newest at bottom)
- Friendly formmated date-time
- Clickable CLI links (iTerm2)
- Minimatch filepath pattern matching

## Installation

```
yarn install findy -g
```

## Example

Find all Markdown files recursively, that are not named `README.md`

```
findy "**/*.md" "!**/README.md"
```
