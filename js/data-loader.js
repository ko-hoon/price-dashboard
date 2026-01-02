// 대시보드 데이터 로드 및 표시
async function loadDashboardData() {
    try {
        // 모든 CSV 파일 로드
        const [exchangeData, oilData, noMetalData] = await Promise.all([
            loadCSV("dollar_won_rate_data.csv"),
            loadCSV("daily_oil_data.csv"),
            loadCSV("daily_no_metal_data.csv"),
        ]);

        // 최신 데이터 추출
        const latestExchange = getLatestData(exchangeData, "일자");
        const latestOil = getLatestData(oilData, "일자");
        const latestNoMetal = getLatestData(noMetalData, "일자");

        // 금리 및 KORIBOR 표시 (기존 유지)
        if (latestExchange) {
            document.getElementById("koribor-rate").textContent =
                latestExchange["KORIBOR"];
            document.getElementById("koribor-date").textContent = formatDate(
                latestExchange["일자"]
            );
            document.getElementById("interest-rate").textContent =
                latestExchange["금리"];
            document.getElementById("interest-date").textContent = formatDate(
                latestExchange["일자"]
            );
        }

        // 30일 변화량 계산
        const oilChanges = calculateDailyChanges(oilData, "일자", "전국", 30);
        const copperChanges = calculateDailyChanges(
            noMetalData,
            "일자",
            "구리 (달러/톤)",
            30
        );
        const aluminumChanges = calculateDailyChanges(
            noMetalData,
            "일자",
            "알루미늄 (달러/톤)",
            30
        );
        const nickelChanges = calculateDailyChanges(
            noMetalData,
            "일자",
            "니켈 (달러/톤)",
            30
        );

        // 유가 표시 + 미니 차트
        if (latestOil && oilChanges.length > 0) {
            const latestChange = oilChanges[oilChanges.length - 1];
            document.getElementById("oil-price").innerHTML = `
                ${formatNumber(latestOil["전국"])}
                <span class="text-sm ${
                    latestChange.change >= 0 ? "text-green-500" : "text-red-500"
                }">
                    ${latestChange.change >= 0 ? "▲" : "▼"} ${Math.abs(
                latestChange.change
            ).toFixed(2)}
                </span>
            `;
            // 유가 미니 차트 생성
            createMiniChart("oil-mini-chart", oilChanges, "#F97316");
        }

        // 구리 가격 표시 + 미니 차트
        if (latestNoMetal && copperChanges.length > 0) {
            const latestChange = copperChanges[copperChanges.length - 1];
            document.getElementById("copper-price").innerHTML = `
                ${formatNumber(latestNoMetal["구리 (달러/톤)"])}
                <span class="text-sm ${
                    latestChange.change >= 0 ? "text-green-500" : "text-red-500"
                }">
                    ${latestChange.change >= 0 ? "▲" : "▼"} ${Math.abs(
                latestChange.change
            ).toFixed(0)}
                </span>
            `;
            // 구리 미니 차트 생성
            createMiniChart("copper-mini-chart", copperChanges, "#F59E0B");
        }

        // 알루미늄 가격 표시 + 미니 차트
        if (latestNoMetal && aluminumChanges.length > 0) {
            const latestChange = aluminumChanges[aluminumChanges.length - 1];
            document.getElementById("aluminum-price").innerHTML = `
                ${formatNumber(latestNoMetal["알루미늄 (달러/톤)"])}
                <span class="text-sm ${
                    latestChange.change >= 0 ? "text-green-500" : "text-red-500"
                }">
                    ${latestChange.change >= 0 ? "▲" : "▼"} ${Math.abs(
                latestChange.change
            ).toFixed(0)}
                </span>
            `;
            // 알루미늄 미니 차트 생성
            createMiniChart("aluminum-mini-chart", aluminumChanges, "#10B981");
        }

        // 니켈 가격 표시 + 미니 차트
        if (latestNoMetal && nickelChanges.length > 0) {
            const latestChange = nickelChanges[nickelChanges.length - 1];
            document.getElementById("nickel-price").innerHTML = `
                ${formatNumber(latestNoMetal["니켈 (달러/톤)"])}
                <span class="text-sm ${
                    latestChange.change >= 0 ? "text-green-500" : "text-red-500"
                }">
                    ${latestChange.change >= 0 ? "▲" : "▼"} ${Math.abs(
                latestChange.change
            ).toFixed(0)}
                </span>
            `;
            // 니켈 미니 차트 생성
            createMiniChart("nickel-mini-chart", nickelChanges, "#8B5CF6");
        }

        // 최종 업데이트 시간
        const lastUpdateDate = latestExchange
            ? latestExchange["일자"]
            : new Date().toISOString().split("T")[0];
        document.getElementById(
            "lastUpdate"
        ).textContent = `최종 업데이트: ${formatDate(lastUpdateDate)}`;
    } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
    }
}

// 대시보드 차트 로드
async function loadDashboardCharts() {
    try {
        const [exchangeData, metalData] = await Promise.all([
            loadCSV("dollar_won_rate_data.csv"),
            loadCSV("monthly_metal_data.csv"),
        ]);

        // 최근 30일 환율 데이터
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const recentExchange = filterDataByDateRange(
            exchangeData,
            startDate,
            endDate,
            "일자"
        );

        // 최근 3개월 철강 데이터
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const recentMetal = filterDataByDateRange(
            metalData,
            threeMonthsAgo,
            endDate,
            "날짜"
        );

        createDashboardExchangeChart(recentExchange);
        createDashboardMetalChart(recentMetal);
    } catch (error) {
        console.error("대시보드 차트 로드 실패:", error);
    }
}

// 철강 가격 데이터 로드
async function loadMetalData() {
    try {
        showLoading("metal-chart");
        const data = await loadCSV("monthly_metal_data.csv");

        if (!data || data.length === 0) {
            showError("metal-chart", "데이터를 불러올 수 없습니다.");
            return;
        }

        // 차트 생성
        createMetalChart(data);

        // 테이블 생성
        createMetalTable(data);
    } catch (error) {
        console.error("철강 데이터 로드 실패:", error);
        showError("metal-chart", "데이터 로드 중 오류가 발생했습니다.");
    }
}

// 비철금속 가격 데이터 로드
async function loadNoMetalData() {
    try {
        showLoading("nometal-chart");
        const data = await loadCSV("daily_no_metal_data.csv");

        if (!data || data.length === 0) {
            showError("nometal-chart", "데이터를 불러올 수 없습니다.");
            return;
        }

        // 최근 30일 데이터만 사용
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const filteredData = filterDataByDateRange(
            data,
            startDate,
            endDate,
            "일자"
        );

        // 차트 생성
        createNoMetalChart(filteredData);

        // 테이블 생성
        createNoMetalTable(data);
    } catch (error) {
        console.error("비철금속 데이터 로드 실패:", error);
        showError("nometal-chart", "데이터 로드 중 오류가 발생했습니다.");
    }
}

// 유가 데이터 로드
async function loadOilData() {
    try {
        showLoading("oil-chart");
        const data = await loadCSV("daily_oil_data.csv");

        if (!data || data.length === 0) {
            showError("oil-chart", "데이터를 불러올 수 없습니다.");
            return;
        }

        // 최근 30일 데이터
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const filteredData = filterDataByDateRange(
            data,
            startDate,
            endDate,
            "일자"
        );

        // 차트 생성
        createOilChart(filteredData);

        // 지역별 최신 가격 테이블
        createOilTable(data);
    } catch (error) {
        console.error("유가 데이터 로드 실패:", error);
        showError("oil-chart", "데이터 로드 중 오류가 발생했습니다.");
    }
}

// 환율/금리 데이터 로드
async function loadExchangeData() {
    try {
        showLoading("exchange-chart");
        const data = await loadCSV("dollar_won_rate_data.csv");

        if (!data || data.length === 0) {
            showError("exchange-chart", "데이터를 불러올 수 없습니다.");
            return;
        }

        // 최근 30일 데이터
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const filteredData = filterDataByDateRange(
            data,
            startDate,
            endDate,
            "일자"
        );

        // 차트 생성
        createExchangeChart(filteredData);

        // 테이블 생성
        createExchangeTable(data);
    } catch (error) {
        console.error("환율 데이터 로드 실패:", error);
        showError("exchange-chart", "데이터 로드 중 오류가 발생했습니다.");
    }
}

// 최근 N일간의 일별 변화량 계산
function calculateDailyChanges(data, dateField, valueField, days = 30) {
    // 날짜 기준 정렬 (최신순)
    const sortedData = [...data].sort(
        (a, b) => new Date(b[dateField]) - new Date(a[dateField])
    );

    // 필요한 데이터: 30일 변화량 + 1일 (기준값)
    const recentData = sortedData.slice(0, days + 1);

    if (recentData.length < 2) {
        return [];
    }

    // 변화량 계산 (오래된 순서로 뒤집기)
    const changes = [];
    for (let i = recentData.length - 1; i > 0; i--) {
        const current = parseFloat(recentData[i - 1][valueField]);
        const previous = parseFloat(recentData[i][valueField]);
        const change = current - previous;

        changes.push({
            date: recentData[i - 1][dateField],
            value: current,
            change: change,
            changePercent:
                previous !== 0 ? ((change / previous) * 100).toFixed(2) : 0,
        });
    }

    return changes;
}

// 미니 차트 생성 (카드 내부용)
function createMiniChart(canvasId, changes, color = "#3B82F6") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // 기존 차트가 있으면 제거
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
        existingChart.destroy();
    }

    const labels = changes.map((item) => formatDate(item.date));
    const data = changes.map((item) => item.change);

    // 각 구간별로 색상을 결정하기 위해 segment 사용
    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    borderWidth: 2,
                    pointRadius: 1,
                    pointHoverRadius: 3,
                    pointBackgroundColor: data.map((val) =>
                        val >= 0 ? "rgba(36,99,235,0.8)" : "rgba(235,30,45,0.8)"
                    ),
                    pointBorderColor: data.map((val) =>
                        val >= 0 ? "rgba(36,99,235,1)" : "rgba(235,30,45,1)"
                    ),
                    pointBorderWidth: 0,
                    tension: 0.3,
                    fill: false,
                    segment: {
                        borderColor: (ctx) => {
                            const value = ctx.p1.parsed.y;
                            return value >= 0
                                ? "rgba(36,99,235,1)"
                                : "rgba(235,30,45,1)";
                        },
                    },
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    position: "nearest",
                    callbacks: {
                        title: function (context) {
                            return formatDate(
                                changes[context[0].dataIndex].date
                            );
                        },
                        label: function (context) {
                            const change = context.parsed.y;
                            const item = changes[context.dataIndex];
                            return `가격: ${formatNumber(item.value)} (${
                                change >= 0 ? "+" : ""
                            }${formatNumber(change)})`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: false,
                    grid: { display: false },
                },
                y: {
                    display: true,
                    position: "right",
                    grid: {
                        display: true,
                        drawTicks: false,
                        color: function (context) {
                            // 0 라인만 진하게 표시
                            if (context.tick.value === 0) {
                                return "rgba(100, 100, 100, 0.5)";
                            }
                            return "rgba(200, 200, 200, 0.2)";
                        },
                        lineWidth: function (context) {
                            if (context.tick.value === 0) {
                                return 1;
                            }
                            return 1;
                        },
                    },
                    ticks: {
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                },
            },
        },
    });
}
