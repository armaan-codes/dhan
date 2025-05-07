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
			validator(value) {
				// Validate that options has a series array
				return value && Array.isArray(value.series) && value.series.length > 0;
			},
		},
	},
	data() {
		return {
			chartOptions: {
				title: {
					text: this.options.series[0]?.name || "Default Title", // Fallback for undefined name
				},
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
				series: this.options.series || [], // Initialize with prop data
			},
		};
	},
	watch: {
		options: {
			immediate: true,
			handler(newOptions) {
				if (newOptions && newOptions.series) {
					// Update only the necessary parts of chartOptions
					this.chartOptions.series = newOptions.series;
					this.chartOptions.title.text = newOptions.series[0]?.name || "Default Title"; // Update title dynamically
				}
			},
		},
	},
};
</script>