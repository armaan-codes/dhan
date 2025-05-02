class WebSocketService {
    constructor(url) {
      this.url = url;
      this.socket = null;
    }
  
    connect(onMessage, onError, onClose, onOpen) {
      this.socket = new WebSocket(this.url);
  
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        if (onOpen) {
          onOpen();
        }
      };
  
      this.socket.onmessage = (event) => {
        console.log('Message received:', event.data);
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) {
          onError(error);
        }
      };
  
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        if (onClose) {
          onClose();
        }
      };
    }
  
    subscribe(message) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        console.error('WebSocket is not open. Unable to subscribe.');
      }
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
  
  export default WebSocketService;