const Unpacker = require('./src/unpacker')
const term = require('terminal-kit').terminal
const nomnom = require('nomnom')
const readline = require('readline')

const options = nomnom
  .option('path', {
    position: 0,
    help: 'File .exe .or .dll',
    list: true
  })
  .option('stream', {
    abbr: 's',
    help: 'item ID -s ID',
    list: true
  })
  .option('list', {
    abbr: 'l',
    flag: true,
    help: 'Print Resources list'
  })
  .option('version', {
    flag: true,
    abbr: 'v',
    help: 'print version',
    callback: function () {
      return 'version 1.0.0'
    }
  })
  .parse()

if (!options.path && (options.list || options.stream)) {
  term.magenta('Enter File name: ')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('', (answer) => {
    run(answer)
    rl.close()
  })
}

if (!options.path) {
  term.bold.red('Bad arguments, check it with option --help \r\n')
}

if (options.path && (options.list || options.stream)) {
  run(options.path[0])
}

function run (filename) {
  const unpacker = new Unpacker(filename)

  if (options.list) {
    unpacker.getList().forEach((item, index) => (
      term.green('ID: %d\tname: %s\t type: %d\tsize: %d\r\n', index, item.name, item.type, item.size)
    ))
    term('\r\n')
  }
  if (options.stream) {
    const stream = unpacker.getStream(options.stream[0])
    if (!stream) {
      term.bold.red('File not found \r\n')
      return
    }
    stream.pipe(process.stdout)
  }
}

