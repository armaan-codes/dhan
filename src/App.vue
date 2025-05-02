<template>
	<div className="chart-container">
		<PieChart :options="chartOptions" />
	</div>
</template>

<script>
import PieChart from './components/PieChart.vue';
import WebSocketService from './services/WebSocketService';

export default {
	components: { PieChart },
	data() {
		return {
			chartOptions: {
				series: [
					{
						name: 'Test',
						data: [
							{ name: 'Product A', y: 0 },
							{ name: 'Product B', y: 0 },
						],
					},
				],
			},
			webSocketService: null, // Instance of WebSocketService
		};
	},
	mounted() {
		// Initialize WebSocketService
		this.webSocketService = new WebSocketService('wss://api-feed.dhan.co?version=2&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzQ4NTQ4MTE4LCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwMzE3NTg2MCJ9.RM86VJkdpuHwxF-3xT1FPMk__sHG7GrQtCbKGh_uAiSCCi6MRNWF5FCtL1-MtglC42us5hnkKKkl6g6NXEGIoA&clientId=1103175860&authType=2');

		// Connect to WebSocket
		this.webSocketService.connect(
			(data) => {
				// Update chart data dynamically
				if (data && data.series) {
					this.chartOptions.series[0].data = data.series;
				}
			},
			(error) => {
				console.error('WebSocket error:', error);
			},
			() => {
				console.log('WebSocket connection closed');
			},
			() => {
				// Subscribe when WebSocket is open
				this.webSocketService.subscribe({
					RequestCode: 15,
					InstrumentCount: 2,
					InstrumentList: [
						{
							ExchangeSegment: 'NSE_EQ',
							SecurityId: '1333',
						},
						{
							ExchangeSegment: 'BSE_EQ',
							SecurityId: '532540',
						},
					],
				});
			}
		);

		this.webSocketService.subscribe({
			"RequestCode": 15,
			"InstrumentCount": 2,
			"InstrumentList": [
				{
					"ExchangeSegment": "NSE_EQ",
					"SecurityId": "1333"
				},
				{
					"ExchangeSegment": "BSE_EQ",
					"SecurityId": "532540"
				}
			]
		});
	},
	beforeDestroy() {
		// Disconnect WebSocket when the component is destroyed
		if (this.webSocketService) {
			this.webSocketService.disconnect();
		}
	},
};
</script>