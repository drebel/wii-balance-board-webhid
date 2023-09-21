import WIIBalanceBoard from "/src/wiibalanceboard.js"

let requestButton = document.getElementById("request-hid-device")
let toggleLiveDataButton = document.getElementById('startBtn')
let clearButton = document.getElementById('clearBtn')
let recordButton = document.getElementById('recordBtn')
let downloadButton = document.getElementById('downloadBtn')
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
    let duration = document.getElementById('recordingDuration').value
    recordButton.innerText = 'Stop'
    let statusCell = document.getElementById('statusCell')

    if(duration > 0){
      statusCell.innerText = `Live data plotting paused to optimze recording performance. Recording Duration: ${duration} seconds`
      timeoutId = setTimeout(() => {
        wiibalanceboard.isRecording = false
        handleStopRecording()
        
      }, duration*1000)
    }else{
      statusCell.innerText = `Live data plotting paused to optimze recording performance. Recording Duration: no timer`
    }
  }


  wiibalanceboard.isRecording = !wiibalanceboard.isRecording

  

  if(wiibalanceboard.isRecording){
    //does having this here cause a delay in recording hz?
    downloadButton.classList.add('hidden')
    return

  }else if(!wiibalanceboard.isRecording){
    if(timeoutId){
      clearTimeout(timeoutId)
    }
    handleStopRecording()
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

downloadButton.addEventListener('click', () => {
  document.getElementById('raw').click()
  document.getElementById('resampled').click()
})

function handleStopRecording(){

      wiibalanceboard.WeightListener = null

      recordButton.innerText = 'Record'
      toggleLiveDataButton.innerText = 'Start Plotting Live Data'
      document.getElementById('statusCell').innerText = `Paused Plotting Live Data (not recording)`

      wiibalanceboard.isShowingLiveData = false

      let time = wiibalanceboard.CalculateTime()
      document.getElementById('timeCell').innerText = time / 1000
    
      wiibalanceboard.CalculateCoordinates()

      wiibalanceboard.ResampleCoordinates(wiibalanceboard.rawCoordinates)
    
      let pathLength =  wiibalanceboard.CalculatePathLength(wiibalanceboard.resampledCoordinates)
      document.getElementById('pathLengthCell').innerText = pathLength

      plotXYCoordinates(wiibalanceboard.resampledCoordinates,5)

      arrayToCSV(wiibalanceboard.rawCoordinates, 'raw')
      arrayToCSV(wiibalanceboard.resampledCoordinates, 'resampled')

      downloadButton.classList.remove('hidden')
}

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
  ctx.reset()
  ctx.transform(1, 0, 0, -1, canvas.width/2, canvas.height/2)
  let xyCoordinates = data
  for(let i = 0; i < xyCoordinates.length; i++){
    // console.log(xyCoordinates[i][1], xyCoordinates[i][2])
    ctx.strokeRect(xyCoordinates[i][1]*2, xyCoordinates[i][2]*2, size, size)
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  // ctx.transform(1, 0, 0, -1, -canvas.width/2, -canvas.height/2)
}

// function plotlyXYCoordinates(data0, data1){
//   let trace0 = {
//     x:[],
//     y:[],
//     mode: 'markers',
//     type: 'scatter',
//   }

//   let trace1 = {
//     x:[],
//     y:[],
//     mode: 'lines+markers',
//     type: 'scatter',
//   }

//   data0.forEach(element => {
//     trace0.x.push(element[1])
//     trace0.y.push(element[2])
//   });

//   data1.forEach(element => {
//     trace1.x.push(element[1])
//     trace1.y.push(element[2])
//   });

//   let plotData = [trace0, trace1]

//   console.log(trace0)
//   console.log(trace1)


//   Plotly.newPlot('plotlyCanvas', plotData, {scrollZoom: true});
// }

function enableControls() {
  document.getElementById("Controls").classList.remove("hidden")
  // document.getElementById("WeightsViz").classList.remove("hidden")
  // document.getElementById("fakecanvas").classList.remove("hidden")
  document.getElementById("canvasholder").classList.remove("hidden")
  document.getElementById("stats").classList.remove("hidden")
  document.getElementById("instructions").classList.add("hidden")
}

function arrayToCSV(dataArray, id) {


  if(document.getElementById(id)){
    const existingDownloadLink = document.getElementById(id)
    document.body.removeChild(existingDownloadLink)
  }

  // Convert the array to a CSV string
  const csvContent = dataArray.map(row => row.join(',')).join('\n')

  // Create a Blob object from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv' })

  // Create a download link
  const currentDate = new Date()
  const formattedDate = currentDate.toISOString().replace(/:/g, "-").replace(/\..+/, "")

  const downloadLink = document.createElement('a')
  downloadLink.href = window.URL.createObjectURL(blob)
  downloadLink.id = id
  downloadLink.download = `${id}_${formattedDate}.csv`

  // Trigger a click event on the download link
  document.body.appendChild(downloadLink)
  // downloadLink.click()

  // // Clean up by removing the download link
  // document.body.removeChild(downloadLink)
}

initButtons()
