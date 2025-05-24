import { Injectable } from '@angular/core';
import { Server } from './server';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class MessagerService {
  private socket?: WebSocket;
  private path: string = Server.SocketUrl;
  private callbackMap: Map<string, (data: string) => void> = new Map()

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

    this.socket.onopen = (event) => {
      console.log("Socket opened:", event);
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
        this.callbackMap.get(request)!(data);
      }
    };

    this.socket.onerror = (event) => {
      console.error("Socket error:", event);
    };

    this.socket.onclose = (event) => {
      console.warn("Socket close:", event);
    };
}
  appendCallback(code: string, operation: (data: string) => void) {
    this.callbackMap.set(code, operation);
  }

  writeSocket(content: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(content);
    } else {
      console.error("Socket closed.");
    }
  }

  closeSocket() {
    console.log("socket closing");
    if (this.socket) {
      this.socket.close(1000, "Normal closure");
    }
  }
}
