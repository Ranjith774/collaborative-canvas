const socket = io();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let currentStroke = null;
let strokes = [];

function drawStroke(stroke) {
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";

  ctx.beginPath();
  stroke.points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}

canvas.addEventListener("pointerdown", e => {
  drawing = true;
  currentStroke = {
    id: crypto.randomUUID(),
    color: document.getElementById("color").value,
    width: document.getElementById("width").value,
    points: [{ x: e.clientX, y: e.clientY }]
  };
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;

  currentStroke.points.push({ x: e.clientX, y: e.clientY });

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(drawStroke);
  drawStroke(currentStroke);

  socket.emit("CURSOR", { x: e.clientX, y: e.clientY });
});

canvas.addEventListener("pointerup", () => {
  if (!drawing) return;
  drawing = false;

  strokes.push(currentStroke);
  socket.emit("STROKE_COMMIT", currentStroke);
});

socket.on("INIT", state => {
  strokes = state.strokes || [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(drawStroke);
});

socket.on("STROKE_COMMIT", stroke => {
  strokes.push(stroke);
  drawStroke(stroke);
});

socket.on("UNDO_APPLIED", id => {
  strokes = strokes.filter(s => s.id !== id);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(drawStroke);
});

document.getElementById("undo").onclick = () => socket.emit("UNDO");
document.getElementById("redo").onclick = () => socket.emit("REDO");
