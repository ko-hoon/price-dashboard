// 유가 페이지 전용 필터 관리
class OilPageFilter {
    constructor() {
        this.dataCache = null;
        this.filteredData = null;
        this.dateFilter = null;
        this.currentDateRange = null;
    }

    // 초기화
    async init() {
        try {
            // SheetJS 라이브러리 확인
            if (typeof XLSX === "undefined") {
                console.error("SheetJS 라이브러리가 로드되지 않았습니다.");
                alert(
                    "Excel 다운로드 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요."
                );
                return false;
            }

            // 데이터 로드
            console.log("유가 데이터 로딩 시작...");
            this.dataCache = await loadCSV("daily_oil_data.csv");
            console.log("로드된 전체 데이터:", this.dataCache.length, "건");

            if (!this.dataCache || this.dataCache.length === 0) {
                alert("데이터를 불러올 수 없습니다.");
                return false;
            }

            // 데이터의 최신 날짜 찾기
            const latestDate = this.getLatestDataDate();
            console.log("데이터 최신 날짜:", latestDate);

            // 날짜 필터 초기화
            this.dateFilter = new DateRangeFilter("oil-date-filter", {
                defaultRange: "1M",
                dataEndDate: latestDate,
                onFilter: (dateRange) => {
                    console.log("필터 변경:", dateRange);
                    this.updateDisplay(dateRange);
                },
                customRanges: {
                    "1M": { label: "1개월", months: 1 },
                    "3M": { label: "3개월", months: 3 },
                    "6M": { label: "6개월", months: 6 },
                    "1Y": { label: "1년", months: 12 },
                    ALL: { label: "전체", months: null },
                },
            });

            // 초기 표시
            this.updateDisplay(this.dateFilter.getDateRange());

            // Excel 다운로드 버튼 이벤트
            this.attachDownloadEvent();

            return true;
        } catch (error) {
            console.error("초기화 중 오류:", error);
            alert("페이지 초기화 중 오류가 발생했습니다.");
            return false;
        }
    }

    // 데이터의 최신 날짜 찾기
    getLatestDataDate() {
        if (!this.dataCache || this.dataCache.length === 0) return null;

        const dates = this.dataCache
            .map((row) => {
                const dateStr = row["일자"];
                if (!dateStr) return null;
                return new Date(dateStr);
            })
            .filter((date) => date && !isNaN(date.getTime()));

        if (dates.length === 0) return null;

        return new Date(Math.max(...dates));
    }

    // 데이터 필터링 및 차트/테이블 업데이트
    updateDisplay(dateRange) {
        if (!this.dataCache) return;

        this.currentDateRange = dateRange;

        // 날짜 범위로 데이터 필터링
        this.filteredData = filterDataByDateRange(
            this.dataCache,
            dateRange.startDate,
            dateRange.endDate,
            "일자"
        );

        console.log("필터링된 데이터:", this.filteredData.length, "건");

        // 차트 업데이트
        if (typeof createOilChart === "function") {
            createOilChart(this.filteredData);
        }

        // 테이블 업데이트
        if (typeof createOilTable === "function") {
            createOilTable(this.filteredData);
        }
    }

    // Excel 다운로드 이벤트 연결
    attachDownloadEvent() {
        const downloadBtn = document.getElementById("download-oil-excel");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => {
                this.downloadExcel();
            });
        }
    }

    // Excel 다운로드
    downloadExcel() {
        if (!this.filteredData || this.filteredData.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }

        console.log("다운로드할 데이터:", this.filteredData.length, "건");

        // 데이터 준비 - 모든 지역 포함
        const preparedData = this.filteredData.map((row) => {
            return {
                일자: formatDate(row["일자"]),
                "전국 (원/L)": parseFloat(row["전국"]) || 0,
                "서울 (원/L)": parseFloat(row["서울"]) || 0,
                "경기 (원/L)": parseFloat(row["경기"]) || 0,
                "인천 (원/L)": parseFloat(row["인천"]) || 0,
                "강원 (원/L)": parseFloat(row["강원"]) || 0,
                "충북 (원/L)": parseFloat(row["충북"]) || 0,
                "충남 (원/L)": parseFloat(row["충남"]) || 0,
                "전북 (원/L)": parseFloat(row["전북"]) || 0,
                "전남 (원/L)": parseFloat(row["전남"]) || 0,
                "경북 (원/L)": parseFloat(row["경북"]) || 0,
                "경남 (원/L)": parseFloat(row["경남"]) || 0,
                "세종 (원/L)": parseFloat(row["세종"]) || 0,
                "대전 (원/L)": parseFloat(row["대전"]) || 0,
                "대구 (원/L)": parseFloat(row["대구"]) || 0,
                "부산 (원/L)": parseFloat(row["부산"]) || 0,
                "광주 (원/L)": parseFloat(row["광주"]) || 0,
                "울산 (원/L)": parseFloat(row["울산"]) || 0,
                "제주 (원/L)": parseFloat(row["제주"]) || 0,
            };
        });

        // 통계 정보와 함께 다운로드
        if (typeof downloadWithStatistics === "function") {
            downloadWithStatistics(
                preparedData,
                "경유가격정보",
                "경유가격데이터",
                this.currentDateRange
            );
        }
    }
}

// 페이지 로드 시 자동 실행
let oilPageFilter = null;

window.addEventListener("DOMContentLoaded", async () => {
    oilPageFilter = new OilPageFilter();
    await oilPageFilter.init();
});
