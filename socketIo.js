// socketIo.js

import { Server } from 'socket.io';

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ["GET", "POST"],
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    let activeUsers = [];

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      io.emit('get-users', activeUsers);
    });

    socket.on('setup', (userId) => {
      const existingUser = activeUsers.find((user) => user.userId === userId);
      if (!existingUser) {
        activeUsers.push({
          userId: userId,
          socketId: socket.id,
        });
      }
      io.emit('get-users', activeUsers);
      socket.join(123);
      socket.emit('connected');
    });

    socket.on('send-message',(data)=>{
      console.log(data,'message socket io')
      socket.to(123).emit('receive_message',data)
    });
  });

  io.on('error', (error) => {
    console.error('Socket.IO Error:', error);
  });
};

export default setupSocketIO;
