<template>
	<div className="flex flex-row space-x-4">
		<div className="w-1/2 p-4">
			<PieChart :options="chartRocOptions" />
		</div>
		<div className="w-1/2 p-4">
			<PieChart :options="chartRocPercentageOptions" />
		</div>
	</div>
</template>

<script>
import PieChart from './components/PieChart.vue';
import WebSocketService from './services/WebSocketService';
import instrumentsData from '../public/n50-instruments.json';

export default {
	components: { PieChart },
	data() {
		return {
			chartRocOptions: {
				series: [
					{
						name: 'Nifty 50',
						data: [
							{ name: 'Bears', y: 0 },
							{ name: 'Bulls', y: 0 },
						],
					},
				],
			},
			chartRocPercentageOptions: {
				series: [
					{
						name: 'Nifty 50 (%)',
						data: [
							{ name: 'Bears', y: 0 },
							{ name: 'Bulls', y: 0 },
						],
					},
				],
			},
			instrumentsData: instrumentsData,
			webSocketService: null,
		};
	},
	methods: {
		synchronizeChartData() {
			let positiveRocCount = 0;
			let negativeRocCount = 0;

			let positiveRocPercentageCount = 0;
			let negativeRocPercentageCount = 0;

			this.instrumentsData.forEach((instrument) => {
				if (instrument.roc > 0) {
					positiveRocCount += instrument.roc;
				} else if (instrument.roc < 0) {
					negativeRocCount += instrument.roc;
				}

				if (instrument.rocPercentage > 0) {
					positiveRocPercentageCount += instrument.rocPercentage;
				} else if (instrument.rocPercentage < 0) {
					negativeRocPercentageCount += instrument.rocPercentage;
				}

			});

			// Update the chart data
			this.chartRocOptions.series[0].data[0].y = (Math.abs(negativeRocCount) / (Math.abs(positiveRocCount) + Math.abs(negativeRocCount))) * 100;
			this.chartRocOptions.series[0].data[1].y = (Math.abs(positiveRocCount) / (Math.abs(positiveRocCount) + Math.abs(negativeRocCount))) * 100;

			this.chartRocPercentageOptions.series[0].data[0].y = (Math.abs(negativeRocPercentageCount) / (Math.abs(positiveRocPercentageCount) + Math.abs(negativeRocPercentageCount))) * 100;
			this.chartRocPercentageOptions.series[0].data[1].y = (Math.abs(positiveRocPercentageCount) / (Math.abs(positiveRocPercentageCount) + Math.abs(negativeRocPercentageCount))) * 100;


		},
	},
	mounted() {
		// Initialize WebSocketService
		this.webSocketService = new WebSocketService('wss://api-feed.dhan.co?version=2&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzQ4NTQ4MTE4LCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwMzE3NTg2MCJ9.RM86VJkdpuHwxF-3xT1FPMk__sHG7GrQtCbKGh_uAiSCCi6MRNWF5FCtL1-MtglC42us5hnkKKkl6g6NXEGIoA&clientId=1103175860&authType=2');

		// Connect to WebSocket
		this.webSocketService.connect(
			(data) => {
				if(data.type == 'TickerPacket' || data.type == 'PrevClosePacket') {
					let instrumentIndex = this.instrumentsData.findIndex((instrument) => instrument.securityId == data.securityId)
					if(data.type == 'TickerPacket') {
						this.instrumentsData[instrumentIndex].ltp = parseFloat((data.lastTradedPrice).toFixed(2));
					} else if(data.type == 'PrevClosePacket') {
						this.instrumentsData[instrumentIndex].prevClosePrice = parseFloat((data.previousClosePrice).toFixed(2));
					}

					if(this.instrumentsData[instrumentIndex].ltp > 0 && this.instrumentsData[instrumentIndex].prevClosePrice > 0) {
						this.instrumentsData[instrumentIndex].roc = this.instrumentsData[instrumentIndex].ltp - this.instrumentsData[instrumentIndex].prevClosePrice;
						this.instrumentsData[instrumentIndex].rocPercentage = (this.instrumentsData[instrumentIndex].roc / this.instrumentsData[instrumentIndex].prevClosePrice) * 100;
					
						this.synchronizeChartData();
					}
				}
			},
			(error) => {
				console.error('WebSocket error:', error);
			},
			() => {
				console.log('WebSocket connection closed');
			},
			() => {
				
				let requestData = {
					RequestCode: 15,
					InstrumentCount: instrumentsData.length,
					InstrumentList: instrumentsData.map((instrument) => ({
						ExchangeSegment: instrument.exchange + '_' + instrument.series,
						SecurityId: instrument.securityId,
					})),
				};
				// Subscribe when WebSocket is open
				this.webSocketService.subscribe(requestData);
			}
		);
	},
	beforeDestroy() {
		// Disconnect WebSocket when the component is destroyed
		if (this.webSocketService) {
			this.webSocketService.disconnect();
		}
	},
};
</script>