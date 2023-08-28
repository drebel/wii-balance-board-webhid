import {
  ReportMode,
  DataReportMode,
  LEDS,
  BUTTON_BYTE1,
  BUTTON_BYTE2,
  InputReport,
  WiiBalanceBoardPositions,
} from "./const.js";

import WIIMote from "./wiimote.js";

export default class WIIBalanceBoard extends WIIMote {
  constructor(device) {
    super(device);

    this.WeightListener = null;
    this.weights = {
      TOP_RIGHT: 0,
      BOTTOM_RIGHT: 1,
      TOP_LEFT: 2,
      BOTTOM_LEFT: 3,
    };
      // calibration info = [
      // [TOP_RIGHT 0kg, BOTTOM_RIGHT 0kg, TOP_LEFT 0kg, BOTTOM_LEFT 0kg]
      // [TOP_RIGHT 17kg, BOTTOM_RIGHT 17kg, TOP_LEFT 17kg, BOTTOM_LEFT 17kg]
      // [TOP_RIGHT 34kg, BOTTOM_RIGHT 34kg, TOP_LEFT 34kg, BOTTOM_LEFT 34kg]
      // ]
      this.calibration = [
        [10000.0, 10000.0, 10000.0, 10000.0],
        [10000.0, 10000.0, 10000.0, 10000.0],
        [10000.0, 10000.0, 10000.0, 10000.0]
      ];
    this.eventData = []
    this.isRecording = false
    this.isTare = false
    this.tareData = []
  }

  // Initiliase the Wiimote
  initiateDevice() {
    this.device.open().then(() => {
      this.sendReport(ReportMode.STATUS_INFO_REQ, [0x00]);
      this.sendReport(ReportMode.MEM_REG_READ, [
        0x04,
        0xa4,
        0x00,
        0x24,
        0x00,
        0x18
      ]);
      this.setDataTracking(DataReportMode.EXTENSION_8BYTES);

      this.device.oninputreport = e => this.listener(e);
    });
  }

  WeightCalibrationDecoder(data) {
    const length = data.getUint8(2) / 16 + 1;
    if (length == 16) {
      [0, 1].forEach(i => {
        this.calibration[i] = [0, 1, 2, 3].map(j =>
          data.getUint16(4 + i * 8 + 2 * j, true)
        );
      });
    } else if (length == 8) {
      this.calibration[2] = [0, 1, 2, 3].map(j =>
        data.getUint16(4 + 2 * j, true)
      );
    }
  }

  WeightDecoder(data) {
    const weights = [0, 1, 2, 3].map(i => {
      const raw = data.getUint16(2 + 2 * i, false);
      // console.log(raw)
      //return raw;
      if (raw < this.calibration[0][i]) {
        return 0;
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
        );
      }
    });
  }

  TareDecoder(data) {
    const sensorValues = [0, 1, 2, 3].map(i => {
      const raw = data.getUint16(2 + 2 * i, false);
      // console.log(raw)
      return raw;
    });
    this.tareData.push(sensorValues)
  }

  Tare(tareData){
    // map thru array then reduce each one to find average
    // or maybe we find max, well try both and figure out which one feels better
    // go thru first array in calibration matrix and replace calibration values respectively
  }

  // main listener received input from the Wiimote
  listener(event) {
    // console.log(this.calibration)

    var { data } = event;
    var { timeStamp } = event;
    // console.log(data, timeStamp)
    // console.log(event)


    switch (event.reportId) {
      case InputReport.STATUS:
        console.log("status");
        break;
      case InputReport.READ_MEM_DATA:
        // calibration data
        console.log("calibration data");
        this.WeightCalibrationDecoder(data);
        break;
      case DataReportMode.EXTENSION_8BYTES:
        //have if statement to figure out what to do with data depending on using input
        if(this.isRecording){
          this.eventData.push([timeStamp, data])
        }else if(this.isTare){
          this.TareDecoder(data)
        } else {
          this.WeightDecoder(data)
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
        break;
      default:
        console.log(`event of unused report id ${event.reportId}`);
        break;
    }
  }
}
