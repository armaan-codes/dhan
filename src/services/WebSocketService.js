class WebSocketService {
	constructor(url) {
		this.url = url;
		this.socket = null;
	}

	connect(onMessage, onError, onClose, onOpen) {
		this.socket = new WebSocket(this.url);

		this.socket.onopen = () => {
			console.log("WebSocket connection established");
			if (onOpen) {
				onOpen();
			}
		};

		this.socket.onmessage = (event) => {
			// console.log("WebSocket message received:", event.data);
			if (event.data instanceof Blob) {
				// Handle Blob data
				const reader = new FileReader();
				reader.onload = () => {
					const arrayBuffer = reader.result; // Read Blob as ArrayBuffer
					const decodedData = this.decodeBinaryResponse(arrayBuffer);
					// console.log("Decoded Message:", decodedData);
					if (onMessage) {
						onMessage(decodedData);
					}
				};
				reader.readAsArrayBuffer(event.data);
			}
		};

		this.socket.onerror = (error) => {
			console.error("WebSocket error:", error);
			if (onError) {
				onError(error);
			}
		};

		this.socket.onclose = () => {
			console.log("WebSocket connection closed");
			if (onClose) {
				onClose();
			}
		};
	}

	decodeBinaryResponse(buffer) {
		const dataView = new DataView(buffer);

		// Decode Response Header (8 bytes)
		const responseCode = dataView.getUint8(0); // 1 byte
		const messageLength = dataView.getInt16(1, true); // 2 bytes (little-endian)
		const exchangeSegment = dataView.getUint8(3); // 1 byte
		const securityId = dataView.getInt32(4, true); // 4 bytes (little-endian)

		// Decode Ticker Packet or Prev Close based on response code
		if (responseCode === 2) {
			// Ticker Packet
			const lastTradedPrice = dataView.getFloat32(8, true); // 4 bytes (little-endian)
			const lastTradeTime = dataView.getInt32(12, true); // 4 bytes (little-endian)
			return {
				type: "TickerPacket",
				responseCode,
				messageLength,
				exchangeSegment,
				securityId,
				lastTradedPrice,
				lastTradeTime,
			};
		} else if (responseCode === 6) {
			// Prev Close Packet
			const previousClosePrice = dataView.getFloat32(8, true); // 4 bytes (little-endian)
			const openInterest = dataView.getInt32(12, true); // 4 bytes (little-endian)
			return {
				type: "PrevClosePacket",
				responseCode,
				messageLength,
				exchangeSegment,
				securityId,
				previousClosePrice,
				openInterest,
			};
		} else {
			// Unknown response code
			return {
				type: "UnknownPacket",
				responseCode,
				messageLength,
				exchangeSegment,
				securityId,
			};
		}
	}

	subscribe(message) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(message));
		} else {
			console.error("WebSocket is not open. Unable to subscribe.");
		}
	}

	disconnect() {
		if (this.socket) {
			this.socket.close();
		}
	}
}

export default WebSocketService;
