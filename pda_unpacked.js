let fs = require('fs');
let Duplex = require('stream').Duplex;

let term = require( 'terminal-kit' ).terminal ;
let opts = require("nomnom")
    .option('path', {
        position: 0,
        help: "File .exe .or .dll",
        list: true
    })
    .option('stream', {
        abbr: 's',
        help: "item ID -s ID",
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
        callback: function() {
            return "version 1.0.0";
        }
    }).parse();


class Unpacked {
    constructor(path) {
        this.path = path;
        this.files = [];
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

    unpacked(){

        let buffer = fs.readFileSync(this.path);
        let f1 = this.findIndex(buffer, [0x50, 0x41, 0x44, 0x50, 0x41, 0x44, 0x50]);
        let count = buffer[f1 - 8];
        if(count != 0){
            let x1 = f1 + 0x3 + 0x8 + (0x8 * count);
            let namesize;
            let xl1;
            for (let i = 0; i < count; i++) {
                namesize = buffer[x1];  // File name size console.log(fl1)
                xl1 = x1 + 0x1;    // File name
                this.files.push({
                    name: buffer.slice(xl1, xl1 + namesize).toString('ucs2'),
                    type: 0,
                    size: 0,
                    content:  Buffer.from([])
                });
                x1 = xl1 + namesize + 0x4;
            }

            for (let i = 0; i < count; i++) {
                this.files[i].type = buffer[x1];

                switch (this.files[i].type){
                    case 0x1:
                        this.files[i].size = buffer[x1 + 0x1];
                        this.files[i].content = buffer.slice(x1 + 0x2 , x1 + 0x2 + this.files[i].size).toString('utf8');
                        x1 = x1 + 0x2 + this.files[i].size

                        break;
                    case 0x20:
                        this.files[i].size = buffer.readIntLE(x1 + 0x1, 0x4);
                        this.files[i].content = buffer.slice(x1 + 0x5 , x1 + 0x5 + this.files[i].size);
                        x1 = x1 + 0x4 + this.files[i].size + 0x1;

                        break;
                }
            }


        }
    }


    getList() {
        this.unpacked();
        if(this.files.length){
            this.files.forEach((item, index) =>(
                term.green( "ID: %d\tname: %s\t type: %d\tsize: %d\r\n" ,index, item.name , item.type, item.size)
            ));


           // return this.files
        }
        return -1;
    }

    getFile(item) {
        this.unpacked();

        if(this.files.length){
            if (this.files[item].content){
                let stream = new Duplex();
                stream.push(this.files[item].content);
                stream.push(null);
                stream.pipe(process.stdout)
               // console.info(this.files[item].content)
            }

        }
        return -1;
    }
}






if (opts.list){
    const unpacked = new Unpacked(opts.path[0]);
    unpacked.getList();
}
if (opts.stream){
    const unpacked = new Unpacked(opts.path[0]);
    unpacked.getFile(opts.stream[0])
}