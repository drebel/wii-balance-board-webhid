import {
  ReportMode,
  DataReportMode,
  InputReport,
  WiiBalanceBoardPositions,
} from "./const.js"

import WIIMote from "./wiimote.js"

// const Decimal = require('decimal.js')
// import Decimal from "../node_modules/decimal.js/decimal.js"
// import Decimal from "decimal.js"

export default class WIIBalanceBoard extends WIIMote {
  constructor(device) {
    super(device)
    
    this.WeightListener = null
    this.weights = {
      TOP_RIGHT: 0,
      BOTTOM_RIGHT: 1,
      TOP_LEFT: 2,
      BOTTOM_LEFT: 3,
    }
      // calibration breakpoints = [
      // [TOP_RIGHT 0kg, BOTTOM_RIGHT 0kg, TOP_LEFT 0kg, BOTTOM_LEFT 0kg]
      // [TOP_RIGHT 17kg, BOTTOM_RIGHT 17kg, TOP_LEFT 17kg, BOTTOM_LEFT 17kg]
      // [TOP_RIGHT 34kg, BOTTOM_RIGHT 34kg, TOP_LEFT 34kg, BOTTOM_LEFT 34kg]
      // ]
      this.calibration = [
        [10000.0, 10000.0, 10000.0, 10000.0],
        [10000.0, 10000.0, 10000.0, 10000.0],
        [10000.0, 10000.0, 10000.0, 10000.0]
      ]
    this.eventData = []
    this.isRecording = false
    this.isTare = false
    this.isShowingLiveData = true
    this.tareData = [[], [], [], []]
    this.newCalibration = [0,0,0,0]
    this.rawCoordinates = []
    this.resampledCoordinates = []
  }

  // Initiliase the Wiimote
  initiateDevice() {
    this.device.open().then(() => {
      this.sendReport(ReportMode.STATUS_INFO_REQ, [0x00])
      this.sendReport(ReportMode.MEM_REG_READ, [
        0x04,
        0xa4,
        0x00,
        0x24,
        0x00,
        0x18
      ])
      this.setDataTracking(DataReportMode.EXTENSION_8BYTES)

      this.device.oninputreport = e => this.listener(e)
    })
  }

  WeightCalibrationDecoder(data) {
    const length = data.getUint8(2) / 16 + 1
    if (length == 16) {
      [0, 1].forEach(i => {
        this.calibration[i] = [0, 1, 2, 3].map(j =>
          data.getUint16(4 + i * 8 + 2 * j, true)
        )
      })
    } else if (length == 8) {
      this.calibration[2] = [0, 1, 2, 3].map(j =>
        data.getUint16(4 + 2 * j, true)
      )
    }
  }

  WeightDecoder(data) {
    return [0, 1, 2, 3].map(i => {
      const raw = data.getUint16(2 + 2 * i, false);
      // console.log(raw)
      //return raw;
      if (raw < this.calibration[0][i]) {
        return 0;
      // } else if (raw < this.newCalibration[i]) {
      //   return 0
      } else if (raw < this.calibration[1][i]) {
        return (
          17 *
          ((raw - this.calibration[0][i]) /
            (this.calibration[1][i] - this.calibration[0][i]))
        );
      } else {
        return (
          17 +
          17 *
            ((raw - this.calibration[1][i]) /
              (this.calibration[2][i] - this.calibration[1][i]))
        )
      }
    })
  }

  WeightPlotter(data) {
    // console.log(data)
    let weights = this.WeightDecoder(data)

    for (let position in WiiBalanceBoardPositions) {
      const index = WiiBalanceBoardPositions[position]
      this.weights[position] = weights[index]
    }
        
    if (this.WeightListener) {
      this.WeightListener(this.weights)
    }
  }

  TareDecoder(data) {
    for (let i = 0; i < 4; i++) {
      this.tareData[i].push(data.getUint16(2 + 2 * i, false))
    }
  }

  Tare(){
    // map thru array then reduce each one to find average
    // or maybe we find max, well try both and figure out which one feels better
    // go thru first array in calibration matrix and replace calibration values respectively
    const newCalibration = this.tareData.map( i => {
      return Math.max(...i) + 10

      // let sum = i.reduce((acc, cv) => {
      //  acc += cv
      //  return acc
      // }, 0)
      // return sum / i.length
    })
    this.newCalibration = newCalibration
  }

  CalculateTime(){
    if(this.eventData.length){
      return this.eventData[this.eventData.length-1][0] - this.eventData[0][0]
    }else{
      console.log('sorry no data to analyze')
    }
  }

  CalculateCoordinates(){
    // decode array buffer to get raw data for each sensor at each timestamp
    // probably can just reuse weight decoder function
    // take the raw data conver it to kg
    // take the kg and from each sensor and height and width
    // width = 433mm and height = 238mm per https://www.mdpi.com/1424-8220/14/10/18244
    // ultimately want a log of timestamps and corresponding xy coordinates so we can plot

    // this function is going to get a large array of arrays that holds the timestamp and array buffer
    // the input will always be an array of arrays and will at least have 1 data point. could potentially have unlimited data poitns in it. maybe i should put a limit on the record button...
    // input seconds will be in ms and could start at any number
    // array buffer will be a buffer with bits for each sensor in a unsigned 8 bit array with the normal spots for each sensor

    // the function will return an array of arrays, that are the xy coordinates and time stamps for each datapoint. x y coordinates will be in mm and time will be in s and start from 0s
    // format will be an array [[]]

    // [[1000, arraybuffer], [1001, arraybuffer], [1002, arraybuffer]] returns
    // [[0, 0, 0], [1, 1, 2], [2, 2, 3]]

    // function takes in the eventdata array
    // we will map thru each element, and call weight decoder on the second element of the array to get the array buffer data
    // this will return an array holding the raw sensor values as kg
    // add up the kg, and then calculate x and y values using the total weight, and combinations of each sensor weight
    // multiply the value by width or height in mm
    // return an array with [s, x, y] elements
    // return the mapped array 
    let initialTime = this.eventData[0][0]
    let rawCoordinates = this.eventData.map(point => {
      let weights = this.WeightDecoder(point[1])

      let totalWeight = weights.reduce((acc, cv) => {
        return acc += cv
      },0)

      let xValue = (((weights[0] + weights[1]) - (weights[2] + weights[3])) / totalWeight) * (433/2)

      let yValue = (((weights[0] + weights[2]) - (weights[1] + weights[3])) / totalWeight) * (238/2)

      return [(point[0] - initialTime) / 1000, xValue, yValue]
    })
    this.rawCoordinates = rawCoordinates
  }

  ResampleCoordinates(data, windowSize = 0.25, desiredFrequency = 25){
    let currentTime = Math.max(0, data[0][0]);
    const outputData = [];
    
    while (currentTime < data[data.length - 1][0]) {
        // Create an array to store relevant data point indices within the window
        const relevantTimes = [];

        // Find data points that fall within the current sliding window
        for (let t = 0; t < data.length; t++) {
            if (Math.abs(data[t][0] - currentTime) < windowSize * 0.5) {
                relevantTimes.push(t);
            }
        }

        if (relevantTimes.length === 1) {
            // If there's only one relevant data point, use it as is
            const t = relevantTimes[0];
            outputData.push([currentTime, data[t][1], data[t][2]])
        } else {
            let sumX = 0;
            let sumY = 0;
            let weightSum = 0;

            // Calculate the weighted average of data points within the window
            for (let i = 0; i < relevantTimes.length; i++) {
                const t = relevantTimes[i];
                let leftBorder, rightBorder;

                if (i === 0 || t === 0) {
                    leftBorder = Math.max(data[0][0], currentTime - windowSize * 0.5);
                } else {
                    leftBorder = 0.5 * (data[t][0] + data[t - 1][0]);
                }

                if (i === relevantTimes.length - 1) {
                    rightBorder = Math.min(data[data.length - 1][0], currentTime + windowSize * 0.5);
                } else {
                    rightBorder = 0.5 * (data[t + 1][0] + data[t][0]);
                }

                const w = rightBorder - leftBorder;
                sumX += data[t][1] * w; // Accumulate weighted X values
                sumY += data[t][2] * w; // Accumulate weighted Y values
                weightSum += w;
            }

            const resampledX = sumX / weightSum;
            const resampledY = sumY / weightSum;

            outputData.push([currentTime, resampledX, resampledY]);
        }

        // Move the sliding window by incrementing the current time
        currentTime += 1 / desiredFrequency;
    }
    // this.resampledCoordinates = outputData // Return resampled data as an array of arrays
    return outputData
  }

  CalculatePathLength(data){
    // function doesnt take in any parameters
    // function returns a number which is the path length of the xy data in mm

    //take xycoordinate array
    //declare pathlength var 
    // loop thru it
    // each loop do Math.sqrt((x[i+1]- x[i])^2 + y[i+1]- y[i])^2)
    // then add result to pathlength
    // return path length

    let xyCoordinates = data
    let pathLength = 0

    for(let i = 0; i < xyCoordinates.length - 1; i++){
      // console.log(xyCoordinates[i+1][1],xyCoordinates[i][1],xyCoordinates[i+1][2],xyCoordinates[i][2])
      let dist = Math.sqrt((xyCoordinates[i+1][1] - xyCoordinates[i][1])**2 + (xyCoordinates[i+1][2] - xyCoordinates[i][2])**2)
      pathLength += dist
    }
    return pathLength
  }

  

  // main listener received input from the Wiimote
  listener(event) {
    // console.log(this.calibration)

    var { data } = event
    var { timeStamp } = event
    // console.log(data, timeStamp)
    // console.log(event)


    switch (event.reportId) {
      case InputReport.STATUS:
        // console.log("status")
        break
      case InputReport.READ_MEM_DATA:
        // calibration data
        // console.log("calibration data")
        this.WeightCalibrationDecoder(data)
        break;
      case DataReportMode.EXTENSION_8BYTES:
        //have if statement to figure out what to do with data depending on using input
        if(this.isRecording){
          this.eventData.push([timeStamp, data])
        }else if(this.isTare){
          this.TareDecoder(data)
        } else {
          this.WeightPlotter(data)
        }

        // have an is recording boolean
        // if true records timestamps and data to array to be analyzed later

        // if tare is true
        // collect data for 5 sec then turn back to false
        // take the greatest value or maybe the average value?
        // then change the calibration matrix [0] to the value for each sensor

        // if low q live feed is clicked? 
        // use the original weight decoder to show data on the canvas

        // NOTE: need to make sure buttons cant be clicked while others are true, so need to be toggling them together or setting them explicitly. 
        break
      default:
        console.log(`event of unused report id ${event.reportId}`)
        break
    }
  }
}
