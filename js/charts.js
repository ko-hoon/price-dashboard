// 차트 생성 함수들

let chartInstances = {};

// 기존 차트 제거
function destroyChart(chartId) {
    if (chartInstances[chartId]) {
        chartInstances[chartId].destroy();
        delete chartInstances[chartId];
    }
}

// 대시보드 - 환율 차트
function createDashboardExchangeChart(data) {
    destroyChart("exchangeTrendChart");

    const ctx = document.getElementById("exchangeTrendChart");
    if (!ctx) return;

    const labels = data.map((row) => formatDate(row["일자"]).slice(5)); // MM-DD만 표시

    chartInstances["exchangeTrendChart"] = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "환율 (원/달러)",
                    data: data.map((row) => row["환율"]),
                    borderColor: "rgba(59, 130, 246, 1)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString() + "원";
                        },
                    },
                },
            },
        },
    });
}

// 대시보드 - 철강 가격 차트
function createDashboardMetalChart(data) {
    destroyChart("metalTrendChart");

    const ctx = document.getElementById("metalTrendChart");
    if (!ctx || data.length === 0) return;

    // 1. 가로축(Labels) 정의: 각 원자재 항목
    const categories = [
        "철근 (천원/톤)",
        "철광석 (달러/톤)",
        "유연탄 (달러/톤)",
        "스크랩 (달러/톤)",
    ];

    // 2. 데이터셋 구성: 각 날짜(월)가 하나의 범례가 됨
    const datasets = data.map((row, index) => {
        const monthLabel = formatDate(row["날짜"]).slice(0, 7); // YYYY-MM

        // 날짜별로 색상을 다르게 지정 (최신일수록 진하게 표현하면 좋습니다)
        const colors = [
            "rgba(59, 130, 246, 0.5)", // 가장 오래된 달
            "rgba(59, 130, 246, 0.7)",
            "rgba(59, 130, 246, 1.0)", // 가장 최근 달
        ];

        return {
            label: monthLabel,
            data: [
                row["철근 (천원/톤)"],
                row["철광석 (달러/톤)"],
                row["유연탄 (달러/톤)"],
                row["스크랩 (달러/톤)"],
            ],
            backgroundColor: colors[index % colors.length],
            borderWidth: 1,
        };
    });

    chartInstances["metalTrendChart"] = new Chart(ctx, {
        type: "bar",
        data: {
            labels: categories, // 가로축: 철근, 철광석, 유연탄, 스크랩
            datasets: datasets, // 각 막대 그룹: 날짜별 데이터
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    title: { display: true, text: "월" },
                    labels: {
                        usePointStyle: true, // 사각형 대신 포인트 스타일 사용
                        pointStyle: "rect", // 모양을 'circle', 'rectRounded', 'triangle' 등으로 변경 가능
                    },
                },
                tooltip: {
                    mode: "index",
                    intersect: true,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "가격" },
                },
            },
        },
    });
}

// 철강 가격 차트
function createMetalChart(data) {
    destroyChart("metalChart");

    const ctx = document.getElementById("metalChart");
    if (!ctx) return;

    const labels = data.map((row) => formatDate(row["날짜"]));

    chartInstances["metalChart"] = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "철근 (천원/톤)",
                    data: data.map((row) => row["철근 (천원/톤)"]),
                    borderColor: "rgba(59, 130, 246, 1)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                },
                {
                    label: "철광석 (달러/톤)",
                    data: data.map((row) => row["철광석 (달러/톤)"]),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    tension: 0.4,
                },
                {
                    label: "유연탄 (달러/톤)",
                    data: data.map((row) => row["유연탄 (달러/톤)"]),
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    tension: 0.4,
                },
                {
                    label: "스크랩 (달러/톤)",
                    data: data.map((row) => row["스크랩 (달러/톤)"]),
                    borderColor: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    tension: 0.4,
                },
            ],
        },
        options: getChartOptions("철강 원자재 가격 추이", "가격"),
    });
}

// 비철금속 가격 차트
function createNonMetalChart(data) {
    destroyChart("nonmetalChart");

    const ctx = document.getElementById("nonmetalChart");
    if (!ctx) return;

    const labels = data.map((row) => formatDate(row["일자"]));

    chartInstances["nonmetalChart"] = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "구리 (달러/톤)",
                    data: data.map((row) => row["구리 (달러/톤)"]),
                    borderColor: CHART_COLORS.copper,
                    tension: 0.4,
                },
                {
                    label: "알루미늄 (달러/톤)",
                    data: data.map((row) => row["알루미늄 (달러/톤)"]),
                    borderColor: CHART_COLORS.aluminum,
                    tension: 0.4,
                },
                {
                    label: "아연 (달러/톤)",
                    data: data.map((row) => row["아연 (달러/톤)"]),
                    borderColor: CHART_COLORS.zinc,
                    tension: 0.4,
                },
                {
                    label: "납 (달러/톤)",
                    data: data.map((row) => row["납 (달러/톤)"]),
                    borderColor: CHART_COLORS.lead,
                    tension: 0.4,
                },
                {
                    label: "니켈 (달러/톤)",
                    data: data.map((row) => row["니켈 (달러/톤)"]),
                    borderColor: CHART_COLORS.nickel,
                    tension: 0.4,
                },
                {
                    label: "주석 (달러/톤)",
                    data: data.map((row) => row["주석 (달러/톤)"]),
                    borderColor: CHART_COLORS.tin,
                    tension: 0.4,
                },
            ],
        },
        options: getChartOptions("비철금속 가격 추이 (최근 30일)", "달러/톤"),
    });
}

// 유가 차트
function createOilChart(data) {
    destroyChart("oilChart");

    const ctx = document.getElementById("oilChart");
    if (!ctx) return;

    const labels = data.map((row) => formatDate(row["일자"]));

    // 주요 지역만 표시
    const regions = ["전국", "서울", "경기", "부산", "대구", "인천"];
    const colors = [
        "#667eea",
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
    ];

    chartInstances["oilChart"] = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: regions.map((region, index) => ({
                label: region,
                data: data.map((row) => row[region]),
                borderColor: colors[index],
                tension: 0.4,
                borderWidth: region === "전국" ? 3 : 2,
            })),
        },
        options: getChartOptions("지역별 경유 가격 추이 (최근 30일)", "원/L"),
    });
}

// 환율/금리 차트
function createExchangeChart(data) {
    destroyChart("exchangeChart");

    const ctx = document.getElementById("exchangeChart");
    if (!ctx) return;

    const labels = data.map((row) => formatDate(row["일자"]));

    chartInstances["exchangeChart"] = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "환율 (원/달러)",
                    data: data.map((row) => row["환율"]),
                    borderColor: "rgba(59, 130, 246, 1)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    yAxisID: "y",
                    tension: 0.4,
                },
                {
                    label: "기준금리 (%)",
                    data: data.map((row) => row["금리"]),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    yAxisID: "y1",
                    tension: 0.4,
                },
                {
                    label: "KORIBOR (%)",
                    data: data.map((row) => row["KORIBOR"]),
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    yAxisID: "y1",
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "환율 및 금리 추이 (최근 30일)",
                    font: { size: 16, weight: "bold" },
                },
                legend: {
                    position: "bottom",
                },
            },
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    title: {
                        display: true,
                        text: "환율 (원/달러)",
                    },
                },
                y1: {
                    type: "linear",
                    display: true,
                    position: "right",
                    title: {
                        display: true,
                        text: "금리 (%)",
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        },
    });
}

// 테이블 생성 함수들
function createMetalTable(data) {
    const tableContainer = document.getElementById("metal-table");
    if (!tableContainer) return;

    // 최근 10개 데이터만 표시
    const recentData = data.slice(-10).reverse();

    let html = `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">철근</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">철광석</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">유연탄</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">스크랩</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
    `;

    recentData.forEach((row) => {
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${formatDate(
                    row["날짜"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["철근 (천원/톤)"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["철광석 (달러/톤)"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["유연탄 (달러/톤)"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["스크랩 (달러/톤)"]
                )}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    tableContainer.innerHTML = html;
}

function createNonMetalTable(data) {
    const tableContainer = document.getElementById("nonmetal-table");
    if (!tableContainer) return;

    const recentData = data.slice(-10).reverse();

    let html = `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">구리</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">알루미늄</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">아연</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">납</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">니켈</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">주석</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
    `;

    recentData.forEach((row) => {
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${formatDate(
                    row["일자"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["구리 (달러/톤)"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["알루미늄 (달러/톤)"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["아연 (달러/톤)"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["납 (달러/톤)"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["니켈 (달러/톤)"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["주석 (달러/톤)"]
                )}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    tableContainer.innerHTML = html;
}

function createOilTable(data) {
    const tableContainer = document.getElementById("oil-table");
    if (!tableContainer) return;

    const latestData = getLatestData(data, "일자");
    if (!latestData) return;

    const regions = [
        "전국",
        "서울",
        "경기",
        "인천",
        "강원",
        "충북",
        "충남",
        "전북",
        "전남",
        "경북",
        "경남",
        "세종",
        "대전",
        "대구",
        "부산",
        "광주",
        "울산",
        "제주",
    ];

    let html = `
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    `;

    regions.forEach((region) => {
        const price = latestData[region];
        html += `
            <div class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="text-sm text-gray-500 mb-1">${region}</div>
                <div class="text-xl font-bold text-gray-900">${formatNumber(
                    price
                )} 원</div>
            </div>
        `;
    });

    html += `</div><div class="mt-4 text-sm text-gray-500">최종 업데이트: ${formatDate(
        latestData["일자"]
    )}</div>`;

    tableContainer.innerHTML = html;
}

function createExchangeTable(data) {
    const tableContainer = document.getElementById("exchange-table");
    if (!tableContainer) return;

    const recentData = data.slice(-10).reverse();

    let html = `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">환율</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">기준금리</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">KORIBOR</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
    `;

    recentData.forEach((row) => {
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${formatDate(
                    row["일자"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${formatNumber(
                    row["환율"]
                )}</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${
                    row["금리"]
                }%</td>
                <td class="px-4 py-3 text-sm text-right text-gray-700">${
                    row["KORIBOR"]
                }%</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    tableContainer.innerHTML = html;
}
