#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const Promise = require('bluebird')
const micromatch = require('micromatch')
const moment = require('moment')
const chalk = require('chalk')

const pkg = require(path.join(__dirname, 'package.json'))

const cfonts = require('cfonts')
const logoText = cfonts.render('findy', {
	font: 'chrome',
	align: 'left',
	colors: [
		'gray',
		'white',
		'candy'
	],
	letterSpacing: 0.6,
	background: 'red',
	lineHeight: 1,
	space: false,
	maxLength: '0'
})

const logo = logoText.string
	.replace(/\[41m/, '')

const version = pkg.version.split('').map(char => {
	if (Number.isNaN(Number(char))) {
		return chalk.dim(char)
	}

	return char
}).join('')

const link = chalk.white.underline.italic.dim('https://github.com/f1lt3r/findy')

process.stdout.write(`${logo} v${version} \n${link} \n`)

const filePatterns = process.argv.slice(2)

const ignoreDirs = [
	'node_modules',
	'node_modules/',
	'node_modules/**',
	'**/node_modules/**',
	'Library/',
	'Library/**',

	'.git',
	'.git/',
	'.git/**',
	'**/.git/**',

	'.DS_Store',
	'**/.DS_Store'
]

let filesSearched = 0
let foldersSearched = 0
let filesMatched = 0
let filesSorted = 0

const scrubSeq = {
	deleteChar: '\x1b\x5b\x44',
	deleteUp: '\x1B[1A',
	deleteLeft: '\r'
}

const progressupdate = () => {
	process.stdout.write('\n')
	process.stdout.write(scrubSeq.deleteUp)
	process.stdout.write(chalk.reset.white(`Matched: ${chalk.green(filesMatched)} of ${chalk.blue(filesSearched)} files in ${chalk.yellow(foldersSearched)} dirs`))
}

let progressInterval = setInterval(() => {
	progressupdate()
}, 100)

const sortUpdate = length => {
	if (filesSorted % 10 === 0) {
		process.stdout.write(scrubSeq.deleteLeft)
		process.stdout.write(chalk.reset.white(`Sorting: ${chalk.cyan(filesSorted)}...`))
	}
}

Array.prototype.sortByProp = function (p) {
	const length = this.length

	const results = this.sort((a, b) => {
		filesSorted += 1
		sortUpdate(length)
		return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0
	})

	process.stdout.write(scrubSeq.deleteLeft)

	return results
}

const matchingFilePattern = filepath => {
	return micromatch(filepath, filePatterns).length
}

const recursiveRead = dir => new Promise((resolve, reject) => {
	const readDir = uri => new Promise((resolve, reject) => {
		try {
			fs.readdir(uri, (err, data) => {
				if (err) {
					reject(err)
				}

				resolve(data)
			})
		} catch (err) {
			resolve([])
		}
	})

	const stat = filepath => new Promise((resolve, reject) => {
		try {
			fs.lstat(filepath, (err, stat) => {
				if (err) {
					return reject(err)
				}

				resolve(stat)
			})
		} catch (err) {
			resolve({})
		}
	})

	const filterFiles = files => new Promise((resolve, reject) => {
		const stats = []

		files.forEach(file => {
			const filepath = path.join(dir, file)
			stats.push(stat(filepath))
		})

		Promise.all(stats).then(results => {
			const dirs = []
			let fileList = []

			results.forEach((stat, idx) => {
				const filepath = path.join(dir, files[idx])

				if (stat.isFile()) {
					filesSearched += 1

					if (matchingFilePattern(filepath)) {
						filesMatched += 1

						const file = path.parse(filepath)

						fileList.push({
							filepath,
							base: file.base,
							dir: file.dir,
							mtimeMs: stat.mtimeMs,
							mtime: stat.mtime
						})
					}
				} else if (stat.isDirectory()) {
					foldersSearched += 1

					if (filepath === '..' && filepath === '.') {
						return
					}

					dirs.push(filepath)
				}
			})

			if (dirs.length === 0) {
				return resolve(fileList)
			}

			const nextReads = []

			dirs.forEach(dir => {
				const matchAry = micromatch(dir, ignoreDirs)
				const noMatch = matchAry.length === 0

				if (noMatch) {
					nextReads.push(recursiveRead(dir))
				}
			})

			if (nextReads.length < 1) {
				resolve(fileList)
			}

			Promise.all(nextReads)
			.then(results => {
				results.forEach(dirResult => {
					fileList = fileList.concat(dirResult)
				})

				resolve(fileList)
			})
			.catch(err => {
				reject(err)
			})
		})
	})

	readDir(dir)
	.then(filterFiles)
	.then(files => {
		resolve(files)
	})
	.catch(err => {
		reject(err)
	})
})

const colorBy = {
	Mon: 'red',
	Tue: 'green',
	Wed: 'yellow',
	Thu: 'blue',
	Fri: 'magenta',
	Sat: 'cyan',
	Sun: 'white'
}

const main = dir => {
	recursiveRead(dir).then(results => {
		clearInterval(progressInterval)
		process.stdout.write('\n')

		results.sortByProp('mtime')

		results.forEach(file => {
			const time = moment(file.mtime)

			const day = time.format('ddd')
			const month = time.format('MMM')
			const date = time.format('DD')
			const year = time.format('YYYY')
			const clocktime = time.format('HH:mm:ss')

			const color = colorBy[day]
			const timestamp = `${chalk.dim(day)} ${month} ${date} ${chalk.dim(year)} ${clocktime}`
			const prettyTime = chalk[color](timestamp)

			const sep = file.dir ? path.sep : ''

			const link = chalk.grey.underline(
				file.dir + sep + chalk[color](file.base)
			)

			console.log(prettyTime, link)
		})
	}).catch(err => {
		clearInterval(progressInterval)
		console.error(err)
		process.exit(1)
	})
}

if (module.parent) {
	module.exports = main
} else {
	main('.')
}
