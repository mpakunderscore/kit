const fs = require('node:fs')
const path = require('node:path')

const outputDirectory = path.resolve(__dirname, '../../dist/electron')
const packageJsonPath = path.resolve(outputDirectory, 'package.json')

fs.mkdirSync(outputDirectory, { recursive: true })
fs.writeFileSync(packageJsonPath, '{\n    "type": "commonjs"\n}\n', 'utf-8')
