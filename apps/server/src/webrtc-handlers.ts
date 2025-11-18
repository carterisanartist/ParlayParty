import { Server, Socket } from 'socket.io';
import { roomManager } from './room-manager';

export function setupWebRTCHandlers(io: Server, socket: Socket) {
  // Handle WebRTC offer
  socket.on('webrtc:offer', ({ to, offer }) => {
    const targetSocket = io.sockets.sockets.get(to);
    if (targetSocket) {
      targetSocket.emit('webrtc:offer', { 
        from: socket.id, 
        offer 
      });
    }
  });

  // Handle WebRTC answer
  socket.on('webrtc:answer', ({ to, answer }) => {
    const targetSocket = io.sockets.sockets.get(to);
    if (targetSocket) {
      targetSocket.emit('webrtc:answer', { 
        from: socket.id, 
        answer 
      });
    }
  });

  // Handle ICE candidates
  socket.on('webrtc:ice-candidate', ({ to, candidate }) => {
    const targetSocket = io.sockets.sockets.get(to);
    if (targetSocket) {
      targetSocket.emit('webrtc:ice-candidate', { 
        from: socket.id, 
        candidate 
      });
    }
  });

  // Handle peer disconnection
  socket.on('disconnect', () => {
    // Find the room this socket was in
    const roomCode = getRoomCodeForSocket(socket);
    if (roomCode) {
      // Notify all other players in the room that this peer left
      socket.to(roomCode).emit('webrtc:peer-left', { 
        peerId: socket.id 
      });
    }
  });
}

function getRoomCodeForSocket(socket: Socket): string | null {
  // Get all rooms the socket is in
  const rooms = Array.from(socket.rooms);
  
  // Filter out the socket's own room (which has the same ID as the socket)
  const roomCodes = rooms.filter(room => room !== socket.id);
  
  // Return the first room code (should only be in one game room)
  return roomCodes.length > 0 ? roomCodes[0] : null;
}
