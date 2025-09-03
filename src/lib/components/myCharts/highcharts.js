import Highcharts from 'highcharts';
//npm install @highcharts/svelte highcharts --save
export default (node, config) => {
  const chart = Highcharts.chart(node, config);

  return {
    update(config) {
      const redraw = true;
      const oneToOne = true;
      chart.update(config, redraw, oneToOne);
    },
    destroy() {
      chart.destroy();
    },
  };
}