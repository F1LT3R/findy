#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const Promise = require('bluebird')
const micromatch = require('micromatch')
const moment = require('moment')
const chalk = require('chalk')

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

Array.prototype.sortByProp = function (p) {
	return this.sort((a, b) => {
		return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0
	})
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
			resolve({
				// mtime: 0,
				// file: ''
			})
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
					if (matchingFilePattern(filepath)) {
						fileList.push({
							filepath: filepath,
							mtimeMs: stat.mtimeMs,
							mtime: stat.mtime
						})
					}
				} else if (stat.isDirectory()) {
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

const main = () => {
	recursiveRead('.').then(results => {
		results.sortByProp('mtime')

		results.forEach(file => {
			const time = moment(file.mtime).format('ddd MMM DD YYYY HH:mm:ss')
			console.log(chalk.yellow(time), chalk.cyan.underline(file.filepath))
		})
	}).catch(err => {
		console.error(err)
		process.exit(1)
	})
}

main()
