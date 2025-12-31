// 대시보드 데이터 로드 및 표시

async function loadDashboardData() {
    try {
        // 모든 CSV 파일 로드
        const [exchangeData, oilData, copperData] = await Promise.all([
            loadCSV("dollar_won_rate_data.csv"),
            loadCSV("daily_oil_data.csv"),
            loadCSV("daily_no_metal_data.csv"),
        ]);

        // 최신 데이터 추출
        const latestExchange = getLatestData(exchangeData, "일자");
        const latestOil = getLatestData(oilData, "일자");
        const latestCopper = getLatestData(copperData, "일자");

        // 금리 및 KORIBOR 표시
        if (latestExchange) {
            document.getElementById("koribor-rate").textContent =
                latestExchange["KORIBOR"] + "%";
            document.getElementById("koribor-date").textContent = formatDate(
                latestExchange["일자"]
            );
        }

        // 금리 표시
        if (latestExchange) {
            document.getElementById("interest-rate").textContent =
                latestExchange["금리"] + "%";
            document.getElementById("interest-date").textContent = formatDate(
                latestExchange["일자"]
            );
        }

        // 유가 표시
        if (latestOil) {
            document.getElementById("oil-price").textContent =
                formatNumber(latestOil["전국"]) + " 원";
            document.getElementById("oil-date").textContent = formatDate(
                latestOil["일자"]
            );
        }

        // 구리 가격 표시
        if (latestCopper) {
            document.getElementById("copper-price").textContent = formatNumber(
                latestCopper["구리 (달러/톤)"]
            );
            document.getElementById("copper-date").textContent = formatDate(
                latestCopper["일자"]
            );
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
async function loadNonMetalData() {
    try {
        showLoading("nonmetal-chart");
        const data = await loadCSV("daily_no_metal_data.csv");

        if (!data || data.length === 0) {
            showError("nonmetal-chart", "데이터를 불러올 수 없습니다.");
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
        createNonMetalChart(filteredData);

        // 테이블 생성
        createNonMetalTable(data);
    } catch (error) {
        console.error("비철금속 데이터 로드 실패:", error);
        showError("nonmetal-chart", "데이터 로드 중 오류가 발생했습니다.");
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
