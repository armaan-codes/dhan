<template>
  <div>
    <highcharts :options="chartOptions" />
  </div>
</template>

<script>
import { Chart } from 'highcharts-vue';

export default {
  components: { highcharts: Chart },
  data() {
    return {
      chartOptions: {
        title: null,
        legend: { enabled: false },
        credits: { enabled: false },
        chart: {
          type: 'pie',
          backgroundColor: 'transparent'
        },
        series: [{
          name: 'Market Share',
          data: [
            { name: 'Product A', y: 45 },
            { name: 'Product B', y: 30 }
          ]
        }]
      }
    };
  },
  mounted() {
    setInterval(() => {
      this.chartOptions.series[0].data = [
        Math.random() * 100,
        Math.random() * 100,
      ];
    }, 2000);
  }
};
</script>