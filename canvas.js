const ctx = document.getElementById("canvas").getContext("2d");
document.getElementById('draw').addEventListener('click', draw)

function draw() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.save();
        ctx.fillStyle = `rgb(${51 * i}, ${255 - 51 * i}, 255)`;
        ctx.translate(10 + j * 50, 10 + i * 50);
        ctx.fillRect(0, 0, 25, 25);
        ctx.restore();
      }
    }
  }
  