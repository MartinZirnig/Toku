import { Injectable } from '@angular/core';
import { Server } from './server';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class MessagerService {
  private socket?: WebSocket;
  private path: string = Server.SocketUrl;
  private callbackMap: Map<string, ((data: string) => void)[]> = new Map();
  private messageIntervalId?: any;

  constructor() {
    (window as any).messagerService = this;
  }

  openSocket() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN 
      || this.socket.readyState === WebSocket.CONNECTING)) {
      console.warn("web socket is active.");
      return;
    }

    if (User.Id === null) {
      console.error("user not initialized.");
      return;
    }

    const path = `${this.path}/messager?uid=${encodeURIComponent(User.Id)}`;
    this.socket = new WebSocket(path);
    this.socket.binaryType = "arraybuffer";

    this.socket.onopen = (event) => {
      this.startPeriodicBinaryMessages();
    };

    this.socket.onmessage = (event) => {
      const raw = String(event.data);
      const firstSpaceIndex = raw.indexOf(' ');
      if (firstSpaceIndex === -1) {
        console.warn("invalid format:", raw);
        return;
      }

      const request = raw.slice(0, firstSpaceIndex).trim();
      const data = raw.slice(firstSpaceIndex + 1);

      if (this.callbackMap.has(request)) {
        const callbacks = this.callbackMap.get(request)!
        callbacks.forEach(cb => {
          cb(data);
        });
      }
    };

    this.socket.onerror = (event) => {
      console.error("Socket error:", event);
    };

    this.socket.onclose = (event) => {
      console.warn("Socket close:", event);
      this.stopPeriodicBinaryMessages();
    };
  }

  private startPeriodicBinaryMessages() {
    this.stopPeriodicBinaryMessages(); 
    this.messageIntervalId = setInterval(() => {
      const message = new Uint8Array(15);
      for (let i = 0; i < 15; i++) {
        message[i] = i;
      }
      console.log("pinging socket");
      this.writeSocket(message.buffer);
    }, 30000);
  }

  private stopPeriodicBinaryMessages() {
    if (this.messageIntervalId) {
      clearInterval(this.messageIntervalId);
      this.messageIntervalId = undefined;
    }
  }

  appendCallback(code: string, operation: (data: string) => void) {

    console.log("adding: ", code);
    if (this.callbackMap.has(code)){
      this.callbackMap.get(code)?.push(operation);
    } else {
      this.callbackMap.set(code, [operation]);
    }
  }

  writeSocket(content: string | ArrayBuffer) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(content);
    } else {
      console.error("Socket closed.");
    }
  }

  closeSocket() {
    console.log("socket closing");
    this.stopPeriodicBinaryMessages();
    if (this.socket) {
      this.socket.close(1000, "Normal closure");
    }
  }
}
