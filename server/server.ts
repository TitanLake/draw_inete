import socketIo from 'socket.io';

const rooms = new Map<string, string[]>();

const server = socketIo();

server.on('connection', socket => {
  socket.on('join room', (roomId: string) => {
    let room = rooms.get(roomId);
    if (!room) {
     socket.emit('error');
     return;
    }
    if (room.length >= 4) {
      socket.emit('room full');
      return;
    }
    room.push(socket.id);
    socket.join(roomId);
    socket.emit('joined room', room.map(id => ({ id })));
    server.to(roomId).emit('room update', room.map(id => ({ id })));
  });

  socket.on('disconnect', () => {
    for (const room of rooms.values()) {
      const index = room.indexOf(socket.id);
      if (index >= 0) {
        room.splice(index, 1);
        socket.leave(room.id);
        server.to(room.id).emit('room update', room.map(id => ({ id })));
        if (!room.length) {
          rooms.delete(room.id);
        }
      }
    }
  });
});
