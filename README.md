# Findy!

The handy little cli utility for finding lost files by name.

_**Sidenote:** To find files by contents, forget grep, use [ack](https://beyondgrep.com/)_

![[Findy Example Output](img/find-example-output.png)](img/find-example-output.png)

### Features

- Finds files reursively
- Ignores `node_modules` and `.git` directories
- Lists files in reverse modified order (newest at bottom)
- Friendly formmated date-time
- Clickable relative CLI links (iTerm2)
- Regex filepath pattern matching

## Installation

```shell
yarn install findy -g
```

## Search Examples

### Find All Local

Find all files in the current directory containing the word `yarn` anywhere in the name:

```shell
findy '*yarn*'
```

### Find By Extension

Find all `.env` and `.log` files in the current directory:

```shell
findy '*.env' '*.log'
```

### Find Recursive

Find all `.env` files recursively:

```shell
findy '**/*.env'
```

### Negation

**Important:** negation requires the use of single-quotes around the search phrase, unless used in an array (see: negative in array).

Find all Markdown files recursively, that are **not** named `README.md`:

```shell
findy '**/*.md' '!**/README.md'
```

### Searching with Sudo

Searching through some files and directories may require elevated permission. Where you see: 'Unhandled rejection Error: EACCES: permission denied', you can use `sudo`.

Seach for files with elevated permission:

```shell
sudo findy '**/*.md'
```

### Current Dir

**Important:** Findy will still search recursively, but will only show results that match the current directory.

Find any `README.md` file in the current directory:

```shell
findy 'README.md'
```

### Containing Word Recursive

To recusively find any `.txt` file containing the the word `notes`:

```shell
findy '**/*notes*.txt'
```

### Starting with word

To recusrively find any file starting with the the word `notes`:

```shell
findy '**/notes*'
```

### Ending with word

To recusrively find any file ending with the the word `notes`:

```shell
findy '**/*notes.*'
```

### Find This-or-That

To find a Markdown file containing either `notes` or `tasks`:

```shell
findy '**/*{notes,tasks}*.md'
```

### Negative In Array

To find a anything in the current directory, with `foo` but **not** `bar`:

```shell
findy '*{foo,!bar}*'
```

