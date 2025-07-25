"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.emitToRoom = emitToRoom;
const socket_io_1 = require("socket.io");
let io = null;
function initSocket(server) {
    io = new socket_io_1.Server(server, {
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
function emitToRoom(room, event, data) {
    if (io) {
        io.to(room).emit(event, data);
    }
}
