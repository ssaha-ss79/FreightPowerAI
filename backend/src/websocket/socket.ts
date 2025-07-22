import { Server } from 'socket.io';

let io: Server | null = null;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Example: join room by driver_id or dispatcher_id
    socket.on('join', (room) => {
      socket.join(room);
    });
    // Example: handle custom events
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

export function emitToRoom(room: string, event: string, data: any) {
  if (io) {
    io.to(room).emit(event, data);
  }
}
