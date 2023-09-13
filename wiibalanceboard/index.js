import WIIBalanceBoard from "/src/wiibalanceboard.js"

let requestButton = document.getElementById("request-hid-device")
let toggleLiveDataButton = document.getElementById('startBtn')
let clearButton = document.getElementById('clearBtn')
let recordButton = document.getElementById('recordBtn')
// let showDataButton = document.getElementById('showDataBtn')
// let tareButton = document.getElementById('tareBtn')
let analyzeButton = document.getElementById('analyzeBtn')
// let deleteButton = document.getElementById('deleteBtn')

var wiibalanceboard = undefined;

requestButton.addEventListener("click", async () => {
  let device
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x057e }]
    });

    device = devices[0];
    wiibalanceboard = new WIIBalanceBoard(device)
  } catch (error) {
    console.log("An error occurred.", error)
  }

  if (!device) {
    console.log("No device was selected.")
  } else {
    console.log(`HID: ${device.productName}`)

    enableControls()
    showLiveData()
  }
});

function initButtons() {
  // LED buttons
  document
    .getElementById("led1")
    .addEventListener("click", () => wiibalanceboard.toggleLed(0));
}

const ctx = document.getElementById('canvas').getContext('2d')


toggleLiveDataButton.addEventListener('click', () => {
  wiibalanceboard.isShowingLiveData = !wiibalanceboard.isShowingLiveData
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

let timeoutId

recordButton.addEventListener('click', () => {

  if(!wiibalanceboard.isRecording){
    wiibalanceboard.eventData = []
    document.getElementById('statusCell').innerText = `Live data plotting paused to optimze recording performance`
    recordButton.innerText = 'Stop Recording'

    console.log("start timeout")
    timeoutId = setTimeout(() => {
      wiibalanceboard.isRecording = false
      wiibalanceboard.WeightListener = null
      recordButton.innerText = 'Record'
      toggleLiveDataButton.innerText = 'Start Plotting Live Data'
      document.getElementById('statusCell').innerText = `Paused Plotting Live Data (not recording)`
      wiibalanceboard.isShowingLiveData = false

      let time = wiibalanceboard.CalculateTime()
      document.getElementById('timeCell').innerText = time / 1000
    
      wiibalanceboard.CalculateCoordinates()
      console.log(wiibalanceboard.rawCoordinates)

      wiibalanceboard.ResampleCoordinates(wiibalanceboard.rawCoordinates)
      console.log(wiibalanceboard.resampledCoordinates)
    
      let pathLength =  wiibalanceboard.CalculatePathLength(wiibalanceboard.resampledCoordinates)
      document.getElementById('pathLengthCell').innerText = pathLength

      plotXYCoordinates(wiibalanceboard.resampledCoordinates,5)

      console.log('timeout executed')

      // arrayToCSV(wiibalanceboard.rawCoordinates)
      // arrayToCSV(wiibalanceboard.resampledCoordinates)
    }, 5000)
  }


  wiibalanceboard.isRecording = !wiibalanceboard.isRecording
  

  if(wiibalanceboard.isRecording){
    return
  }else if(!wiibalanceboard.isRecording){

    wiibalanceboard.WeightListener = null

    if(timeoutId){
      console.log("cleartimeout true and canceled")
      clearTimeout(timeoutId)
    }else{
      console.log('no timeoutId was set i guess')
    }

    recordButton.innerText = 'Record'
    toggleLiveDataButton.innerText = 'Start Plotting Live Data'
    document.getElementById('statusCell').innerText = `Paused Plotting Live Data (not recording)`
    wiibalanceboard.isShowingLiveData = false

    let time = wiibalanceboard.CalculateTime()
    document.getElementById('timeCell').innerText = time / 1000
  
    wiibalanceboard.CalculateCoordinates()
    console.log(wiibalanceboard.rawCoordinates)

    wiibalanceboard.ResampleCoordinates(wiibalanceboard.rawCoordinates)
    console.log(wiibalanceboard.resampledCoordinates)
  
    let pathLength =  wiibalanceboard.CalculatePathLength(wiibalanceboard.resampledCoordinates)
    document.getElementById('pathLengthCell').innerText = pathLength

    plotXYCoordinates(wiibalanceboard.resampledCoordinates,5)

    // arrayToCSV(wiibalanceboard.rawCoordinates)
    // arrayToCSV(wiibalanceboard.resampledCoordinates)
  }
})

// tareButton.addEventListener('click', async () => {
//   console.log('Initiating 5 second tare')
//   wiibalanceboard.isTare = true
//   await delay(5000)
//   wiibalanceboard.isTare = false
//   console.log(wiibalanceboard.tareData)
//   console.log(wiibalanceboard.calibration)
//   wiibalanceboard.Tare()
// })

// analyzeButton.addEventListener('click', () => {
//   let time = wiibalanceboard.CalculateTime()
//   document.getElementById('timeCell').innerText = time / 1000

//   wiibalanceboard.CalculateCoordinates()
//   console.log(wiibalanceboard.xyCoordinates)

//   let pathLength =  wiibalanceboard.CalculatePathLength()
//   document.getElementById('pathLengthCell').innerText = pathLength
// })

// deleteButton.addEventListener('click', () => {
//   wiibalanceboard.eventData = []
// })

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }


function showLiveData() {
  wiibalanceboard.WeightListener = weights => {
    let totalWeight = weights.TOP_RIGHT + weights.BOTTOM_RIGHT + weights.TOP_LEFT + weights.BOTTOM_LEFT
    // console.log(totalWeight)

    let xValue = (1 + ((weights.TOP_RIGHT + weights.BOTTOM_RIGHT) - (weights.TOP_LEFT + weights.BOTTOM_LEFT)) / (totalWeight)) * (433)

    let yValue = (1 + ((weights.BOTTOM_RIGHT + weights.BOTTOM_LEFT) - (weights.TOP_RIGHT + weights.TOP_LEFT)) / (totalWeight)) * (238)

    ctx.strokeRect(xValue,yValue,5,5)
    // console.log(xValue,yValue)
  }
}

function plotXYCoordinates(data,size){
  // ctx.reset()
  ctx.transform(1, 0, 0, -1, canvas.width/2, canvas.height/2)
  let xyCoordinates = data
  for(let i = 0; i < xyCoordinates.length; i++){
    // console.log(xyCoordinates[i][1], xyCoordinates[i][2])
    ctx.strokeRect(xyCoordinates[i][1]*2, xyCoordinates[i][2]*2, size, size)
  }
  ctx.transform(1, 0, 0, -1, -canvas.width/2, -canvas.height/2)
}

function enableControls() {
  document.getElementById("Controls").classList.remove("hidden")
  // document.getElementById("WeightsViz").classList.remove("hidden")
  // document.getElementById("fakecanvas").classList.remove("hidden")
  document.getElementById("canvasholder").classList.remove("hidden")
  document.getElementById("stats").classList.remove("hidden")
  document.getElementById("instructions").classList.add("hidden")
}

function arrayToCSV(dataArray) {
  // Convert the array to a CSV string
  const csvContent = dataArray.map(row => row.join(',')).join('\n')

  // Create a Blob object from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv' })

  // Create a download link
  const downloadLink = document.createElement('a')
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = 'data.csv'

  // Trigger a click event on the download link
  document.body.appendChild(downloadLink)
  downloadLink.click()

  // Clean up by removing the download link
  document.body.removeChild(downloadLink)
}

initButtons()
