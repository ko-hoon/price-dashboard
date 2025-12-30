// KPI 카드
Papa.parse("data/summary.csv", {
  download: true,
  header: true,
  complete: (res) => {
    const container = document.getElementById("kpi");

    res.data.forEach(r => {
      const color = r.change.startsWith("-") ? "text-blue-400" : "text-red-400";
      container.innerHTML += `
        <div class="bg-neutral-800 rounded-xl p-4">
          <p class="text-sm text-gray-400">${r.name}</p>
          <p class="text-2xl font-bold">${r.value}</p>
          <p class="text-sm ${color}">${r.change}</p>
        </div>
      `;
    });
  }
});

// 환율 차트
Papa.parse("data/fx.csv", {
  download: true,
  header: true,
  complete: (res) => {
    const dates = res.data.map(r => r.date);
    const values = res.data.map(r => Number(r.value));

    const chart = echarts.init(document.getElementById("fxChart"));
    chart.setOption({
      xAxis: { type: "category", data: dates },
      yAxis: { type: "value" },
      series: [{
        type: "line",
        data: values,
        smooth: true,
        areaStyle: {}
      }],
      backgroundColor: "transparent"
    });
  }
});

// 철강 차트
Papa.parse("data/metals.csv", {
  download: true,
  header: true,
  complete: (res) => {
    const names = res.data.map(r => r.name);
    const values = res.data.map(r => Number(r.value));

    const chart = echarts.init(document.getElementById("steelChart"));
    chart.setOption({
      xAxis: { type: "category", data: names },
      yAxis: { type: "value" },
      series: [{
        type: "bar",
        data: values
      }],
      backgroundColor: "transparent"
    });
  }
});
