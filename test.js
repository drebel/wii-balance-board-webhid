// const { buffer } = new Uint8Array([33, 241, 35, 166, 72, 237, 6, 152, 0, 0]);
// const dataview = new DataView(buffer);
// console.log(dataview.getUint16(0)); // 8689
// console.log(dataview.getUint16(2)); // 9126
// console.log(dataview.getUint16(4)); // 18669
// console.log(dataview.getUint16(6)); // 1688

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

// calibration = [
//     [10000.0, 10000.0, 10000.0, 10000.0],
//     [10000.0, 10000.0, 10000.0, 10000.0],
//     [10000.0, 10000.0, 10000.0, 10000.0]
//   ];

// const { buffer } = new Uint8Array([33, 241, 35, 166, 72, 237, 6, 152, 0, 0]);
// const dataview = new DataView(buffer);
// const weights = [0, 1, 2, 3].map(i => {
//     const raw = dataview.getUint16(2 * i, false);
//     console.log(raw)
//     //return raw;
//     if (raw < calibration[0][i]) {
//     return 0;
//     } else if (raw < calibration[1][i]) {
//     return (
//         17 *
//         ((raw - calibration[0][i]) /
//         (calibration[1][i] - calibration[0][i]))
//     );
//     } else {
//     return (
//         17 +
//         17 *
//         ((raw - calibration[1][i]) /
//             (calibration[2][i] - calibration[1][i]))
//     );
//     }
// })

// console.log(calibration[0][0])


// 0: 0
// 1: 0
// 2: 240
// 3: 0
// 4: 36 00100100
// 5: 34 00100010
// 6: 132
// 7: 35
// 8: 180
// 9: 73
// 10: 40
// 11: 6
// 12: 246
// 13: 41
// 14: 46
// 15: 42
// 16: 109
// 17: 79
// 18: 168
// 19: 13
// 20: 152

// 0: 0
// 1: 0
// 2: 112
// 3: 0
// 4: 52
// 5: 47
// 6: 220
// 7: 49
// 8: 49
// 9: 86
// 10: 49
// 11: 20
// 12: 68
// 13: 0
// 14: 0
// 15: 0
// 16: 0
// 17: 0
// 18: 0
// 19: 0
// 20: 0





// let data = [9134,9411,18946,1914]

[3.3456543456543457, 3.178780773739742, 0.9051194539249147, 2.9927083333333337]

function WeightDecoder(data){
    let calibration = [
        [8740, 9092, 18868, 1576],
        [10742, 10798, 20333, 3496],
        [12084, 12764, 22065, 5169]
    ]
    const weights = [0,1,2,3].map(i => {
        let raw = data[i]
        if (raw < calibration[0][i]) {
            return 0;
        } else if (raw < calibration[1][i]) {
            return (
            17 *
            ((raw - calibration[0][i]) /
                (calibration[1][i] - calibration[0][i]))
            );
        } else {
            return (
            17 +
            17 *
                ((raw - calibration[1][i]) /
                (calibration[2][i] - calibration[1][i]))
            );
        }
    })
    console.log(weights.reduce((acc, cv) => acc += cv))
}

// WeightDecoder([9134,9411,18946,1914])
WeightDecoder([10751,10345,20769,3803])

// [17.114008941877795, 12.485932004689332, 21.27944572748268, 20.119545726240286]

