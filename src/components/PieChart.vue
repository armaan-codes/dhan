<template>
	<highcharts :options="chartOptions" />
</template>
<script>
import { Chart } from "highcharts-vue";

export default {
	components: { highcharts: Chart },
	props: {
		options: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			chartOptions: {
				title: null,
				legend: { enabled: false },
				credits: { enabled: false },
				chart: {
					type: "pie",
					backgroundColor: "transparent",
				},
				lang: {
					decimalPoint: ".",
					thousandsSep: ",",
				},
				accessibility: {
					enabled: false,
				},
				plotOptions: {
					pie: {
						dataLabels: {
							enabled: true,
							format: "<b>{point.name}</b>: {point.percentage:.1f} %",
							style: {
								color: "#000",
								textOutline: "none",
								fontSize: "12px",
							},
						},
					},
				},
				series: [],
			},
		};
	},
	watch: {
		options: {
			immediate: true,
			handler(newOptions) {
				// Dynamically update the series data from the prop
				if (newOptions && newOptions.series) {
					this.chartOptions.series = newOptions.series;
				}
			},
		},
	},
};
</script>
