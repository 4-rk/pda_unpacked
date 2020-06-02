const fs = require('fs')
const Duplex = require('stream').Duplex

module.exports = class Unpacker {
  constructor (path) {
    this.path = path
  }

  findIndex (arr, find, offset = 0) {
    for (let i = 0; i < arr.length - find.length; i++) {
      const isFound = arr.slice(i, i + find.length).every((item, index) => {
        return find[index] === item
      })
      if (isFound) {
        return i + offset
      }
    }
    return -1
  }

  unpack () {
    const files = []
    let buffer = fs.readFileSync(this.path)
    let f1 = this.findIndex(buffer, [0x50, 0x41, 0x44, 0x50, 0x41, 0x44, 0x50])
    let count = buffer[f1 - 8]
    if (count === 0) {
      return files
    }
    let x1 = f1 + 0x3 + 0x8 + (0x8 * count)
    let nameSize
    let xl1

    for (let i = 0; i < count; i++) {
      nameSize = buffer[x1]
      xl1 = x1 + 0x1    // File name
      files.push({
        name: buffer.slice(xl1, xl1 + nameSize).toString('ucs2'),
        type: 0,
        size: 0,
        content: Buffer.from([])
      })
      x1 = xl1 + nameSize + 0x4
    }

    for (let i = 0; i < count; i++) {
      files[i].type = buffer[x1]

      switch (files[i].type) {
        case 0x1:
          files[i].size = buffer[x1 + 0x1]
          files[i].content = buffer.slice(x1 + 0x2, x1 + 0x2 + files[i].size).toString('utf8')
          x1 = x1 + 0x2 + files[i].size
          break
        case 0x20:
          files[i].size = buffer.readIntLE(x1 + 0x1, 0x4)
          files[i].content = buffer.slice(x1 + 0x5, x1 + 0x5 + files[i].size)
          x1 = x1 + 0x4 + files[i].size + 0x1
          break
      }
    }

    return files
  }

  getList () {
    return Object.values(this.unpack());
  }

  getStream (index) {
    const files = this.unpack()

    if (files.length === 0) {
      return
    }

    if (files[index] && files[index].content) {
      let stream = new Duplex()
      stream.push(files[index].content)
      stream.push(null)
      return stream
    }
  }
}
