<template>
	<div className="grid grid-cols-1 gap-4">
		<div className="p-4">
			<PieChart :options="chartRocPercentageOptions" />
		</div>
	</div>
    <div class="p-4 text-[#1a1a1a]">
        <table class="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-100">
                    <th
                        class="border border-gray-300 px-4 py-2 cursor-pointer"
                        @click="sortTable('name')"
                    >
                        Name
                        <span v-if="sortKey === 'name'">
                            {{ sortOrder === 'asc' ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th
                        class="border border-gray-300 px-4 py-2 cursor-pointer"
                        @click="sortTable('ltp')"
                    >
                        Last Traded Price (LTP)
                        <span v-if="sortKey === 'ltp'">
                            {{ sortOrder === 'asc' ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th
                        class="border border-gray-300 px-4 py-2 cursor-pointer"
                        @click="sortTable('weightage')"
                    >
                        Weightage
                        <span v-if="sortKey === 'weightage'">
                            {{ sortOrder === 'asc' ? '▲' : '▼' }}
                        </span>
                    </th>
					<th
                        class="border border-gray-300 px-4 py-2 cursor-pointer"
                        @click="sortTable('rocPercentage')"
                    >
                        ROC %
                        <span v-if="sortKey === 'rocPercentage'">
                            {{ sortOrder === 'asc' ? '▲' : '▼' }}
                        </span>
                    </th>
                    <th
                        class="border border-gray-300 px-4 py-2 cursor-pointer"
                        @click="sortTable('rocPercentageWeightage')"
                    >
                        ROC % + Weightage
                        <span v-if="sortKey === 'rocPercentageWeightage'">
                            {{ sortOrder === 'asc' ? '▲' : '▼' }}
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="instrument in sortedInstruments"
                    :key="instrument.securityId"
                    class="hover:bg-gray-50"
                >
                    <td class="border border-gray-300 text-center px-4 py-2">{{ instrument.name }}</td>
                    <td class="border border-gray-300 text-center px-4 py-2">{{ instrument.ltp }}</td>
                    <td class="border border-gray-300 text-center px-4 py-2">{{ instrument.weightage }}</td>
                    <td class="border border-gray-300 text-center px-4 py-2">{{ instrument.rocPercentage.toFixed(2) }}%</td>
                    <td class="border border-gray-300 text-center px-4 py-2">
                        {{ (instrument.rocPercentageWeightage).toFixed(2) }}%
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import PieChart from './components/PieChart.vue';
import WebSocketService from './services/WebSocketService';
import instrumentsData from './n50-instruments.json';
import debounce from 'lodash/debounce';

export default {
	components: { PieChart },
	data() {
		return {
			chartRocOptions: {
				series: [
					{
						name: 'Nifty 50 (ROC)',
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
						name: 'Nifty 50',
						data: [
							{ name: 'Bears', y: 0 },
							{ name: 'Bulls', y: 0 },
						],
					},
				],
			},
			instrumentsData: instrumentsData,
            sortKey: 'name',
            sortOrder: 'asc',
			webSocketService: null,
		};
	},
    computed: {
        // Computed property to return sorted instruments
        sortedInstruments() {
            return [...this.instrumentsData].sort((a, b) => {
                let modifier = this.sortOrder === 'asc' ? 1 : -1;
                if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier;
                if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier;
                return 0;
            });
        },
    },
	methods: {
        sortTable(key) {
            if (this.sortKey === key) {
                // Toggle sort order if the same key is clicked
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                // Set new sort key and default to ascending order
                this.sortKey = key;
                this.sortOrder = 'asc';
            }
        },
		// Debounced method to update chart data
		synchronizeChartData: debounce(function () {
			let positiveRocCount = 0;
			let negativeRocCount = 0;

			let positiveRocPercentageCount = 0;
			let negativeRocPercentageCount = 0;

			this.instrumentsData.forEach((instrument) => {
				if (instrument.roc > 0) {
					positiveRocCount += instrument.roc * instrument.weightage;
				} else if (instrument.roc < 0) {
					negativeRocCount += instrument.roc * instrument.weightage;
				}

				if (instrument.rocPercentage > 0) {
					positiveRocPercentageCount += instrument.rocPercentage * instrument.weightage;
				} else if (instrument.rocPercentage < 0) {
					negativeRocPercentageCount += instrument.rocPercentage * instrument.weightage;
				}
			});

			// Update the chart data
			this.chartRocOptions.series[0].data[0].y = parseFloat(
				((Math.abs(negativeRocCount) / (Math.abs(positiveRocCount) + Math.abs(negativeRocCount))) * 100).toFixed(2)
			);
			this.chartRocOptions.series[0].data[1].y = parseFloat(
				((Math.abs(positiveRocCount) / (Math.abs(positiveRocCount) + Math.abs(negativeRocCount))) * 100).toFixed(2)
			);

			this.chartRocPercentageOptions.series[0].data[0].y = parseFloat(
				((Math.abs(negativeRocPercentageCount) / (Math.abs(positiveRocPercentageCount) + Math.abs(negativeRocPercentageCount))) * 100).toFixed(2)
			);
			this.chartRocPercentageOptions.series[0].data[1].y = parseFloat(
				((Math.abs(positiveRocPercentageCount) / (Math.abs(positiveRocPercentageCount) + Math.abs(negativeRocPercentageCount))) * 100).toFixed(2)
			);
		}, 500), // Debounce with a 500ms delay

		// Reconnect WebSocket logic
		reconnectWebSocket() {
			console.log('Reconnecting WebSocket...');
			this.webSocketService.disconnect();
			this.initializeWebSocket();
		},

		// Initialize WebSocket connection
		initializeWebSocket() {
			this.webSocketService = new WebSocketService('wss://api-feed.dhan.co?version=2&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzQ4NTQ4MTE4LCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTEwMzE3NTg2MCJ9.RM86VJkdpuHwxF-3xT1FPMk__sHG7GrQtCbKGh_uAiSCCi6MRNWF5FCtL1-MtglC42us5hnkKKkl6g6NXEGIoA&clientId=1103175860&authType=2');

			this.webSocketService.connect(
				(data) => {
					if (data.type === 'TickerPacket' || data.type === 'PrevClosePacket') {
						let instrumentIndex = this.instrumentsData.findIndex(
							(instrument) => instrument.securityId == data.securityId
						);

						if (instrumentIndex === -1) {
							console.error(`Instrument with securityId ${data.securityId} not found`);
							return;
						}

						if (data.type === 'TickerPacket') {
							this.instrumentsData[instrumentIndex].ltp = parseFloat(data.lastTradedPrice.toFixed(2));
						} else if (data.type === 'PrevClosePacket') {
							this.instrumentsData[instrumentIndex].prevClosePrice = parseFloat(data.previousClosePrice.toFixed(2));
						}

						if (
							this.instrumentsData[instrumentIndex].ltp > 0 &&
							this.instrumentsData[instrumentIndex].prevClosePrice > 0
						) {
							this.instrumentsData[instrumentIndex].roc =
								this.instrumentsData[instrumentIndex].ltp -
								this.instrumentsData[instrumentIndex].prevClosePrice;
							this.instrumentsData[instrumentIndex].rocPercentage =
								(this.instrumentsData[instrumentIndex].roc /
									this.instrumentsData[instrumentIndex].prevClosePrice) *
								100;
							this.instrumentsData[instrumentIndex].rocPercentageWeightage = 
								(this.instrumentsData[instrumentIndex].rocPercentage *
									this.instrumentsData[instrumentIndex].weightage);

							this.synchronizeChartData();
						}
					}
				},
				(error) => {
					console.error('WebSocket error:', error);
					// Attempt reconnection on error
					setTimeout(this.reconnectWebSocket, 5000);
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
	},
	mounted() {
		this.initializeWebSocket();
	},
	beforeDestroy() {
		// Disconnect WebSocket when the component is destroyed
		if (this.webSocketService) {
			this.webSocketService.disconnect();
		}
	},
};
</script>