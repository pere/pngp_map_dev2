//@ts-nocheck
//@ts-ignore
export default {
  chart: {
    type: "bar",
    backgroundColor: 'transparent',

    plotBorderWidth: 0, // Remove plot border
    // Remove default margins if needed
    events: {
      load: function () {
        return false;
        var dataLabelsOfPoints = this.series[0].points,
          correctedPosition;
        console.log("dataLabelsOfPoints", dataLabelsOfPoints);
        dataLabelsOfPoints.forEach(function (el, inx) {
          if (el.graphic.element.attributes[3].value > el.dataLabel.x) {
            correctedPosition = parseInt($(el.dataLabel.div).css("top"));
            correctedPosition -= 25;
            correctedPosition = correctedPosition + "px";

            $(el.dataLabel.div).css("top", correctedPosition);
          }
        });
      },
    },
  },
  title: {
    text: "",
  },
  subtitle: {
    text: "",
    /*  'Source: <a target="_blank" ' +
      'href="https://www.indexmundi.com/agriculture/?commodity=corn">indexmundi</a>', */
  },
  xAxis: {
    categories: [],
    gridLineWidth: 0,
    lineWidth: 0,
    minorGridLineWidth: 0,
    tickWidth: 0,
    minorTickWidth: 0,
    labels: {
      enabled: true,
      style: {
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "10px",
        fontWeight: "thin",
        fontStyle: "normal", // 'normal', 'italic', 'oblique'
        color: "#333333",
        textDecoration: "none", // 'none', 'underline', 'overline', 'line-through'
        textTransform: "uppercase", // 'none', 'capitalize', 'uppercase', 'lowercase'
        textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
      },
    },

    title: {
      text: "",
    },
    crosshair: true,
    accessibility: {
      description: "",
    },
  },
  yAxis: {
    gridLineWidth: 0,
    lineWidth: 0,
    minorGridLineWidth: 0,
    tickWidth: 0,
    minorTickWidth: 0,
    labels: {
      enabled: false,
    },
    title: {
      text: "",
    },
  },
  credits: {
    enabled: false,
  },
  tooltip: {
    enabled: true,
    formatter: function () {
      console.log("this", this.point);
      return (
        "<b>" +
        this.point.category +
        "</b><br/>" +
        "<b>" +
        this.y.toLocaleString() +
        " records</b>"
      );
    },
  },
  legend: {
    enabled: false, // hide legend
  },
  plotOptions: {
    bar: {
      borderWidth: 0,
      borderRadius: 0,
      pointPadding: 0.1,
      groupPadding: 0.1,
      colorByPoint: false,
      colors: ["#FF6B6B"],
      dataLabels: {
        enabled: true,
        inside: false,
        /* x: 35,
        align: "right", */
        verticalAlign: "center",
        style: {
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "10px",
          fontWeight: "thin",
          fontStyle: "normal", // 'normal', 'italic', 'oblique'
          color: "#333333",
          textDecoration: "none", // 'none', 'underline', 'overline', 'line-through'
          textTransform: "uppercase", // 'none', 'capitalize', 'uppercase', 'lowercase'

          textOutline: "none",
        },
        formatter: function () {
          // Display both category name and value
          return (
            /*    '<span style="font-size: 12px;">' +
            this.point.category +
            "</span>" + */
            '<span style="font-size: 12px;">' +
            this.y.toLocaleString() +
            "</span>"
          );
        },
      },
    },
  },
  series: [],
};