let fs = require('fs');

function findIndex (arr, find, offset = 0) {
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
  
  function findIndexes (arr, find, offset = 0) {
    const indexes = []
    for (let i = 0; i <= arr.length - find.length; i++) {
      const isFound = arr.slice(i, i + find.length).every((item, index) => {
        return find[index] === item
      })
      if (isFound) {
        indexes.push(i + offset)
      }
    }
    return indexes
  }
  
function unpacked(filename, mode){
    let files = [];
    let buffer = fs.readFileSync(filename);
    let f1 = findIndex(buffer, [0x50, 0x41, 0x44, 0x50, 0x41, 0x44, 0x50]);
    let count = buffer[f1 - 8];
    if( count != 0){
        let x1 = f1 + 0x3 + 0x8 + (0x8 * count);
        let fl1;
        let xl1;
        for (let i = 0; i < count; i++) {
            fl1 = buffer[x1];  // File name size console.log(fl1)
            xl1 = x1 + 0x1;    // File name
            let buf = buffer.slice(xl1, xl1 + fl1); 
            //console.log(buf);
            files.push({
                name: Buffer.from(buf).toString('ucs2'),
                type: 0,
                size: 0,
                content:  Buffer.from([])
              });           
            x1 = xl1 + fl1 + 0x4;
        }
        console.info(files[0].name);
        let xl2
        for (let i = 0; i < count; i++) {
            files[i].type = buffer[x1];

            switch (files[i].type){
                case 0x1:
                    files[i].size = buffer[x1 + 0x1];
                    files[i].content = buffer.slice(x1 + 0x2 , x1 + 0x2 + files[i].size).toString('utf8');
                    x1 = x1 + 0x2 + files[i].size

                    break;
                case 0x20:
                    files[i].size = buffer.readIntLE(x1 + 0x1, 0x4);
                    files[i].content = buffer.slice(x1 + 0x5 , x1 + 0x4 + files[i].size);         
                    x1 = x1 + 0x4 + files[i].size + 0x1;


                    break;
            }


        }

        fs.mkdir('./tmp', { recursive: true }, (err) => {
            if (err) throw err;
          });
        console.info(files);
        files.forEach(element =>(            
        fs.writeFileSync('./tmp/' + element.name, element.content),
        console.info(element.name)
        ));

        //console.info(findIndexes(buffer, [0x50, 0x41, 0x44, 0x50, 0x41, 0x44, 0x50]));
    }else{
        console.error("Fille not faund!")
    }

} 

let filename = process.argv[3];
 if (process.argv[2] === '-l'){
    unpacked(filename, process.argv[2]);
 }



//console.info(buffer.length);


//console.info(buf);
