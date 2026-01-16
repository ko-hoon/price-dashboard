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
                    label: "철근",
                    data: data.map((row) => row["철근 (천원/톤)"]),
                    borderColor: "rgba(59, 130, 246, 1)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "철광석",
                    data: data.map((row) => row["철광석 (달러/톤)"]),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "유연탄",
                    data: data.map((row) => row["유연탄 (달러/톤)"]),
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "스크랩",
                    data: data.map((row) => row["스크랩 (달러/톤)"]),
                    borderColor: "rgba(239, 68, 68, 1)",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
            ],
        },
        options: getChartOptions("가격"),
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
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "알루미늄 (달러/톤)",
                    data: data.map((row) => row["알루미늄 (달러/톤)"]),
                    borderColor: CHART_COLORS.aluminum,
                    yAxisID: "y1",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "아연 (달러/톤)",
                    data: data.map((row) => row["아연 (달러/톤)"]),
                    borderColor: CHART_COLORS.zinc,
                    yAxisID: "y1",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "납 (달러/톤)",
                    data: data.map((row) => row["납 (달러/톤)"]),
                    borderColor: CHART_COLORS.lead,
                    yAxisID: "y1",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "니켈 (달러/톤)",
                    data: data.map((row) => row["니켈 (달러/톤)"]),
                    borderColor: CHART_COLORS.nickel,
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "주석 (달러/톤)",
                    data: data.map((row) => row["주석 (달러/톤)"]),
                    borderColor: CHART_COLORS.tin,
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
            ],
        },
        options: getChartOptions("달러/톤"),
    });
}
// 유가 차트 - 전체 지역 표시
function createOilChart(data) {
    destroyChart("oilChart");

    const ctx = document.getElementById("oilChart");
    if (!ctx) return;

    const labels = data.map((row) => formatDate(row["일자"]));

    // 전체 18개 지역
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

    // 18개 지역을 위한 구분 가능한 색상 팔레트
    const colors = [
        "#667eea", // 전국 - 보라
        "#3b82f6", // 서울 - 파랑
        "#10b981", // 경기 - 초록
        "#f59e0b", // 인천 - 주황
        "#ef4444", // 강원 - 빨강
        "#8b5cf6", // 충북 - 자주
        "#06b6d4", // 충남 - 청록
        "#ec4899", // 전북 - 핑크
        "#14b8a6", // 전남 - 틸
        "#f97316", // 경북 - 오렌지
        "#84cc16", // 경남 - 라임
        "#a855f7", // 세종 - 보라2
        "#0ea5e9", // 대전 - 하늘
        "#dc2626", // 대구 - 빨강2
        "#2563eb", // 부산 - 파랑2
        "#059669", // 광주 - 초록2
        "#ea580c", // 울산 - 주황2
        "#9333ea", // 제주 - 자주2
    ];

    chartInstances["oilChart"] = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: regions.map((region, index) => ({
                label: region,
                data: data.map((row) => row[region]),
                borderColor: colors[index],
                backgroundColor: colors[index] + "20", // 20% 투명도
                borderWidth: 2,
                pointRadius: 1,
                pointBorderWidth: 0,
                pointHoverRadius: 2,
                tension: 0.3,
                fill: false,
            })),
        },
        options: getChartOptions("원/L"),
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
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "기준금리 (%)",
                    data: data.map((row) => row["금리"]),
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    yAxisID: "y1",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
                {
                    label: "KORIBOR (%)",
                    data: data.map((row) => row["KORIBOR"]),
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    yAxisID: "y1",
                    borderWidth: 2,
                    pointRadius: 1,
                    pointBorderWidth: 0,
                    pointHoverRadius: 2,
                    tension: 0.3,
                },
            ],
        },
        options: getChartOptions("원/L"),
    });
}

// 테이블 생성 함수들
function createMetalTable(data) {
    const tableContainer = document.getElementById("metal-table");
    if (!tableContainer) return;

    // 최근 10개 데이터만 표시
    const recentData = data.reverse();

    let html = `
        <div class="overflow-x-auto">
            
            <div class="text-right">
                <small class="text-gray-600 text-xs md:text-sm italic">단위: 철근(천원/톤), 철근 외(달러/톤)</small>
            </div>
            <table class="min-w-full bg-white border border-gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-blue-600">날짜</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">철근</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">철광석</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">유연탄</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">스크랩</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
    `;

    recentData.forEach((row) => {
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatDate(
                    row["날짜"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
                    row["철근 (천원/톤)"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
                    row["철광석 (달러/톤)"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
                    row["유연탄 (달러/톤)"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
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

    const recentData = data.reverse();

    let html = `
    
        <div class="overflow-x-auto">
            
            <div class="text-right">
                <small class="text-gray-600 text-xs md:text-sm italic">단위: 철근(천원/톤), 철근 외(달러/톤)</small>
            </div>
            <table class="min-w-full bg-white border border-gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-blue-600">날짜</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">구리</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">알루미늄</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">아연</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">납</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">니켈</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-base font-medium text-gray-600">주석</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
    `;

    recentData.forEach((row) => {
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatDate(
                    row["일자"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
                    row["구리 (달러/톤)"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
                    row["알루미늄 (달러/톤)"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
                    row["아연 (달러/톤)"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
                    row["납 (달러/톤)"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
                    row["니켈 (달러/톤)"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-base text-center text-gray-900">${formatNumber(
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

    const recentData = data.slice().reverse();

    let html = `
        <div class="overflow-x-auto">
            <div class="text-right">
                <small class="text-gray-600 text-xs md:text-sm italic">단위: 원/리터</small>
            </div>
            <table class="min-w-full bg-white border border-gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-blue-600">일자</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">전국</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">서울</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">경기</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">인천</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">강원</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">충북</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">충남</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">전북</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">전남</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">경북</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">경남</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">세종</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">대전</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">대구</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">부산</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">광주</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">울산</th>
                        <th class="px-2 py-2 md:px-4 md:py-3 text-center text-xs md:text-sm font-medium text-gray-600">제주</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
    `;

    recentData.forEach((row) => {
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatDate(
                    row["일자"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["전국"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["서울"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["경기"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["인천"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["강원"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["충북"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["충남"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["전북"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["전남"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["경북"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["경남"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["세종"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["대전"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["대구"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["부산"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["광주"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["울산"]
                )}</td>
                <td class="px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm text-center text-gray-900">${formatNumber(
                    row["제주"]
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
