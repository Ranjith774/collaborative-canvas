const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createRoom } = require("./rooms");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

const room = createRoom("default");

io.on("connection", socket => {
  socket.join("default");

  socket.emit("INIT", room.getState());

  socket.on("STROKE_COMMIT", stroke => {
    room.addStroke(stroke);
    io.to("default").emit("STROKE_COMMIT", stroke);
  });

  socket.on("UNDO", () => {
    const strokeId = room.undo();
    if (strokeId) {
      io.to("default").emit("UNDO_APPLIED", strokeId);
    }
  });

  socket.on("REDO", () => {
    const stroke = room.redo();
    if (stroke) {
      io.to("default").emit("STROKE_COMMIT", stroke);
    }
  });

  socket.on("CURSOR", data => {
    socket.to("default").emit("CURSOR", {
      id: socket.id,
      ...data
    });
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
