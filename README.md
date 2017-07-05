# Findy!

Findy is the handy little cli utility for finding lost files by name.

_To find lost files by contents, use [ack](https://beyondgrep.com/)_

### Output

![[Example Output](output.png)](output.png)

### Features

- Finds files reursively
- Ignores `node_modules` and `.git` directories
- Lists files in reverse modified order (newest at bottom)
- Friendly formmated date-time
- Clickable CLI links (iTerm2)
- Minimatch filepath pattern matching

## Installation

```shell
yarn install findy -g
```

## Search Examples

### Negation

Find all Markdown files recursively, that are **not** named `README.md`

```shell
findy '**/*.md' '!**/README.md'
```

### File permissions

Searching through some files and directories requires elevated permission. Where you see: 'Unhandled rejection Error: EACCES: permission denied', you can use `sudo`.

```shell
sudo findy '**/*.md'
```

### Current Dir

Find any `README.md` file in the current directory. Note: Findy will still search recursively, but will only show results that match the current directory.

```shell
findy 'README.md'
```

### Containing word

To find any `.txt` file containing the the word `notes`:

```shell
findy '**/*notes*.txt'
```

### Starting with word

To find any file starting with the the word `notes`:

```shell
findy '**/notes*.*'
```

### Ending with word

To find any file ending with the the word `notes`:

```shell
findy '**/*notes.*'
```


### Find This-or-That

To find a Markdown file containing either `notes` or `tasks`:

```shell
findy '**/*{notes,tasks}*.md'
```

