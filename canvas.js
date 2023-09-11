const ctx = document.getElementById("canvas").getContext("2d");
document.getElementById('draw').addEventListener('click', draw)

function draw() {
    // for (let i = 0; i < 3; i++) {
    //   for (let j = 0; j < 3; j++) {
    //     ctx.save();
    //     ctx.fillStyle = `rgb(${51 * i}, ${255 - 51 * i}, 255)`;
    //     ctx.translate(10 + j * 50, 10 + i * 50);
    //     ctx.fillRect(0, 0, 25, 25);
    //     ctx.restore();
    //   }
    // }

    //draw 1 rectangle
    // translate origin
    // draw another rectangle
    // translate origin back
    // draw another rectangle

    ctx.strokeRect(0,0,5,5)
    ctx.transform(1, 0, 0, -1, canvas.width/2, canvas.height/2)
    ctx.strokeRect(0,0,10,10)
    ctx.strokeRect(10,-10,5,5)
    ctx.strokeRect(20,20,5,5)
    ctx.strokeRect(-30,30,5,5)
    ctx.strokeRect(-40,-40,5,5)
    ctx.transform(1, 0, 0, -1, -canvas.width/2, canvas.height/2)
    // ctx.reset()
    ctx.strokeRect(0,0,10,10)
  }
  