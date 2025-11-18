import { Socket } from 'socket.io-client';

export interface WebRTCMessage {
  type: 'parlay-called' | 'vote-update' | 'reaction' | 'sync-time';
  data: any;
  timestamp: number;
}

export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private socket: Socket;
  private roomCode: string;
  private isHost: boolean;
  
  constructor(socket: Socket, roomCode: string, isHost: boolean) {
    this.socket = socket;
    this.roomCode = roomCode;
    this.isHost = isHost;
    
    this.setupSocketListeners();
  }
  
  private setupSocketListeners() {
    // Handle WebRTC signaling
    this.socket.on('webrtc:offer', async ({ from, offer }) => {
      await this.handleOffer(from, offer);
    });
    
    this.socket.on('webrtc:answer', async ({ from, answer }) => {
      await this.handleAnswer(from, answer);
    });
    
    this.socket.on('webrtc:ice-candidate', async ({ from, candidate }) => {
      await this.handleIceCandidate(from, candidate);
    });
    
    this.socket.on('webrtc:peer-left', ({ peerId }) => {
      this.closePeerConnection(peerId);
    });
  }
  
  async createConnection(peerId: string): Promise<RTCPeerConnection> {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    const pc = new RTCPeerConnection(config);
    this.peerConnections.set(peerId, pc);
    
    // Set up ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc:ice-candidate', {
          to: peerId,
          candidate: event.candidate
        });
      }
    };
    
    // Set up data channel
    if (this.isHost) {
      const channel = pc.createDataChannel('game-data', {
        ordered: true,
        maxRetransmits: 3
      });
      
      this.setupDataChannel(peerId, channel);
    } else {
      pc.ondatachannel = (event) => {
        this.setupDataChannel(peerId, event.channel);
      };
    }
    
    return pc;
  }
  
  private setupDataChannel(peerId: string, channel: RTCDataChannel) {
    channel.onopen = () => {
      console.log(`WebRTC data channel opened with ${peerId}`);
      this.dataChannels.set(peerId, channel);
    };
    
    channel.onclose = () => {
      console.log(`WebRTC data channel closed with ${peerId}`);
      this.dataChannels.delete(peerId);
    };
    
    channel.onmessage = (event) => {
      try {
        const message: WebRTCMessage = JSON.parse(event.data);
        this.handleMessage(peerId, message);
      } catch (error) {
        console.error('Failed to parse WebRTC message:', error);
      }
    };
    
    channel.onerror = (error) => {
      console.error('WebRTC data channel error:', error);
    };
  }
  
  async initiateConnection(peerId: string) {
    const pc = await this.createConnection(peerId);
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    this.socket.emit('webrtc:offer', {
      to: peerId,
      offer: offer
    });
  }
  
  private async handleOffer(from: string, offer: RTCSessionDescriptionInit) {
    const pc = await this.createConnection(from);
    
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    this.socket.emit('webrtc:answer', {
      to: from,
      answer: answer
    });
  }
  
  private async handleAnswer(from: string, answer: RTCSessionDescriptionInit) {
    const pc = this.peerConnections.get(from);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  }
  
  private async handleIceCandidate(from: string, candidate: RTCIceCandidateInit) {
    const pc = this.peerConnections.get(from);
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  }
  
  private handleMessage(peerId: string, message: WebRTCMessage) {
    // Emit events based on message type
    switch (message.type) {
      case 'parlay-called':
        this.socket.emit('webrtc:parlay-called', {
          from: peerId,
          parlayId: message.data.parlayId,
          timestamp: message.timestamp
        });
        break;
        
      case 'vote-update':
        this.socket.emit('webrtc:vote-update', {
          from: peerId,
          votes: message.data.votes,
          timestamp: message.timestamp
        });
        break;
        
      case 'reaction':
        this.socket.emit('webrtc:reaction', {
          from: peerId,
          reaction: message.data.reaction,
          timestamp: message.timestamp
        });
        break;
        
      case 'sync-time':
        // Handle time synchronization
        const rtt = Date.now() - message.timestamp;
        console.log(`RTT with ${peerId}: ${rtt}ms`);
        break;
    }
  }
  
  sendMessage(message: WebRTCMessage, peerId?: string) {
    const data = JSON.stringify(message);
    
    if (peerId) {
      // Send to specific peer
      const channel = this.dataChannels.get(peerId);
      if (channel && channel.readyState === 'open') {
        channel.send(data);
      }
    } else {
      // Broadcast to all peers
      this.dataChannels.forEach((channel) => {
        if (channel.readyState === 'open') {
          channel.send(data);
        }
      });
    }
  }
  
  private closePeerConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
    
    const channel = this.dataChannels.get(peerId);
    if (channel) {
      channel.close();
      this.dataChannels.delete(peerId);
    }
  }
  
  destroy() {
    this.peerConnections.forEach((pc) => pc.close());
    this.dataChannels.forEach((channel) => channel.close());
    this.peerConnections.clear();
    this.dataChannels.clear();
  }
}
