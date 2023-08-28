import WIIBalanceBoard from "/src/wiibalanceboard.js";

let requestButton = document.getElementById("request-hid-device");
let startButton = document.getElementById('startBtn')
let pauseButton = document.getElementById('pauseBtn')
let clearButton = document.getElementById('clearBtn')
let recordButton = document.getElementById('recordBtn')
let showDataButton = document.getElementById('showDataBtn')
let tareButton = document.getElementById('tareBtn')
let deleteButton = document.getElementById('deleteBtn')

var wiibalanceboard = undefined;

requestButton.addEventListener("click", async () => {
  let device;
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }]
    });

    device = devices[0];
    wiibalanceboard = new WIIBalanceBoard(device);
  } catch (error) {
    console.log("An error occurred.", error);
  }

  if (!device) {
    console.log("No device was selected.");
  } else {
    console.log(`HID: ${device.productName}`);

    enableControls();
    showLiveData();
  }
});

function initButtons() {
  // LED buttons
  document
    .getElementById("led1")
    .addEventListener("click", () => wiibalanceboard.toggleLed(0));
}

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')


startButton.addEventListener('click', () => {
  showLiveData()
})

pauseButton.addEventListener('click', () => {
  wiibalanceboard.WeightListener = null
})

clearButton.addEventListener('click', () => {
  ctx.reset()
})

recordButton.addEventListener('click', () => {
  wiibalanceboard.isRecording = !wiibalanceboard.isRecording
})

showDataButton.addEventListener('click', () => {
  console.log(wiibalanceboard.eventData)
})

tareButton.addEventListener('click', async () => {
  // turn isTare true for 5 s
  // record raw scores into tareData
  // turn isTare back to false
  // find avg or max for each sensor
  // change calibration matrix values

  // console.log('true')
  // setTimeout(() => {
  //   console.log('false')
  //   console.log('data')
  // }, 5000);
 

  wiibalanceboard.isTare = true
  delay(5000)
  wiibalanceboard.isTare = false
  console.log(wiibalanceboard.tareData)
  wiibalanceboard.Tare(wiibalanceboard.tareData)

})

deleteButton.addEventListener('click', () => {
  
})

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function showLiveData() {
  wiibalanceboard.WeightListener = weights => {
    let totalWeight = weights.TOP_RIGHT + weights.BOTTOM_RIGHT + weights.TOP_LEFT + weights.BOTTOM_LEFT

    let xValue = (1 + ((weights.TOP_RIGHT + weights.BOTTOM_RIGHT) - (weights.TOP_LEFT + weights.BOTTOM_LEFT)) / (totalWeight)) * (416)

    let yValue = (1 + ((weights.BOTTOM_RIGHT + weights.BOTTOM_LEFT) - (weights.TOP_RIGHT + weights.TOP_LEFT)) / (totalWeight)) * (268)

    ctx.strokeRect(xValue,yValue,5,5)
  };
}

function enableControls() {
  document.getElementById("Controls").classList.remove("hidden");
  document.getElementById("WeightsViz").classList.remove("hidden");
  document.getElementById("fakecanvas").classList.remove("hidden");
  document.getElementById("canvasholder").classList.remove("hidden");
  document.getElementById("instructions").classList.add("hidden");
}

initButtons();
