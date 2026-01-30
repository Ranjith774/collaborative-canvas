const rooms = {};

function createRoom(id) {
  if (!rooms[id]) {
    rooms[id] = {
      strokes: [],
      undoStack: [],
      redoStack: []
    };
  }

  return {
    addStroke(stroke) {
      rooms[id].strokes.push(stroke);
      rooms[id].undoStack.push(stroke.id);
      rooms[id].redoStack = [];
    },

    undo() {
      const last = rooms[id].undoStack.pop();
      if (!last) return null;
      rooms[id].redoStack.push(last);
      return last;
    },

    redo() {
      const id = rooms[id].redoStack.pop();
      if (!id) return null;
      rooms[id].undoStack.push(id);
      return rooms[id].strokes.find(s => s.id === id);
    },

    getState() {
      return rooms[id];
    }
  };
}

module.exports = { createRoom };
