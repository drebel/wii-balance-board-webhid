const { buffer } = new Uint8Array([33, 241, 35, 166, 72, 237, 6, 152, 0, 0]);
const dataview = new DataView(buffer);
console.log(dataview.getUint16(0)); // 8689
console.log(dataview.getUint16(2)); // 9126
console.log(dataview.getUint16(4)); // 18669
console.log(dataview.getUint16(6)); // 1688

// gets 24 -> 36 and 9C -> 156 bc its hex -> decimal
// then somehow it gets 9372 from 36 and 156??

// binary for each decimal?
// 35 and 156
// 00100100 10011100
// 00100100 10011100
// 10010010011100

// so the zeros on the front are ignored just like in decimal


// at some point the hex is turned to decimal? 
// at least this code can only read ints. idka bout the main code. 
// the int is turned to binary
// the two bytes are read in big endian order (first one is first)
// which reads 00100100 10011100
// they are combined and read as 10010010011100
// which when is turned into decimal is 9372


