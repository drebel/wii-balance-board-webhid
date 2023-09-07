import WIIBalanceBoard from "/src/wiibalanceboard.js";

let requestButton = document.getElementById("request-hid-device");
let toggleLiveDataButton = document.getElementById('startBtn')
let clearButton = document.getElementById('clearBtn')
let recordButton = document.getElementById('recordBtn')
let showDataButton = document.getElementById('showDataBtn')
let tareButton = document.getElementById('tareBtn')
let analyzeButton = document.getElementById('analyzeBtn')
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


toggleLiveDataButton.addEventListener('click', () => {
  wiibalanceboard.isShowingLiveData = !wiibalanceboard.isShowingLiveData
  console.log(wiibalanceboard.isShowingLiveData)
  if(wiibalanceboard.isShowingLiveData){
    showLiveData()
    toggleLiveDataButton.innerText = 'Stop Plotting Live Data'
    document.getElementById('statusCell').innerText = 'Plotting Live Data (not recording)'

  }else if(!wiibalanceboard.isShowingLiveData){
    wiibalanceboard.WeightListener = null
    toggleLiveDataButton.innerText = 'Start Plotting Live Data'
    document.getElementById('statusCell').innerText = 'Paused Plotting Live Data (not recording)'
  }else{
    console.log(wiibalanceboard.isShowingLiveData, 'error')
  }
  
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
  console.log('Initiating 5 second tare')
  wiibalanceboard.isTare = true
  await delay(5000)
  wiibalanceboard.isTare = false
  console.log(wiibalanceboard.tareData)
  console.log(wiibalanceboard.calibration)
  wiibalanceboard.Tare()
})

analyzeButton.addEventListener('click', () => {
  let time = wiibalanceboard.CalculateTime()
  document.getElementById('timeCell').innerText = time / 1000

  wiibalanceboard.CalculateCoordinates()
  console.log(wiibalanceboard.xyCoordinates)

  let pathLength =  wiibalanceboard.CalculatePathLength()
  document.getElementById('pathLengthCell').innerText = pathLength
})

deleteButton.addEventListener('click', () => {
  wiibalanceboard.eventData = []
})

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function showLiveData() {
  wiibalanceboard.WeightListener = weights => {
    let totalWeight = weights.TOP_RIGHT + weights.BOTTOM_RIGHT + weights.TOP_LEFT + weights.BOTTOM_LEFT
    // console.log(totalWeight)

    let xValue = (1 + ((weights.TOP_RIGHT + weights.BOTTOM_RIGHT) - (weights.TOP_LEFT + weights.BOTTOM_LEFT)) / (totalWeight)) * (416)

    let yValue = (1 + ((weights.BOTTOM_RIGHT + weights.BOTTOM_LEFT) - (weights.TOP_RIGHT + weights.TOP_LEFT)) / (totalWeight)) * (268)

    ctx.strokeRect(xValue,yValue,5,5)
  };
}

function enableControls() {
  document.getElementById("Controls").classList.remove("hidden");
  // document.getElementById("WeightsViz").classList.remove("hidden");
  // document.getElementById("fakecanvas").classList.remove("hidden");
  document.getElementById("canvasholder").classList.remove("hidden");
  document.getElementById("stats").classList.remove("hidden");
  document.getElementById("instructions").classList.add("hidden");
}

initButtons();
