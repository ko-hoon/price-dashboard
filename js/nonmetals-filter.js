// 비철금속 페이지 전용 필터 관리
class NonMetalsPageFilter {
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
            console.log("비철금속 데이터 로딩 시작...");
            this.dataCache = await loadCSV("daily_no_metal_data.csv");
            console.log("로드된 전체 데이터:", this.dataCache.length, "건");

            if (!this.dataCache || this.dataCache.length === 0) {
                alert("데이터를 불러올 수 없습니다.");
                return false;
            }

            // 데이터의 최신 날짜 찾기
            const latestDate = this.getLatestDataDate();
            console.log("데이터 최신 날짜:", latestDate);

            // 날짜 필터 초기화
            this.dateFilter = new DateRangeFilter("nonmetal-date-filter", {
                defaultRange: "3M",
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
        if (typeof createNonMetalChart === "function") {
            createNonMetalChart(this.filteredData);
        }

        // 테이블 업데이트
        if (typeof createNonMetalTable === "function") {
            createNonMetalTable(this.filteredData);
        }
    }

    // Excel 다운로드 이벤트 연결
    attachDownloadEvent() {
        const downloadBtn = document.getElementById("download-nonmetal-excel");
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

        // 데이터 준비 (비철금속 컬럼에 맞게 수정)
        const preparedData = this.filteredData.map((row) => {
            return {
                일자: formatDate(row["일자"]),
                "구리 (달러/톤)": parseFloat(row["구리 (달러/톤)"]) || 0,
                "알루미늄 (달러/톤)":
                    parseFloat(row["알루미늄 (달러/톤)"]) || 0,
                "아연 (달러/톤)": parseFloat(row["아연 (달러/톤)"]) || 0,
                "납 (달러/톤)": parseFloat(row["납 (달러/톤)"]) || 0,
                "니켈 (달러/톤)": parseFloat(row["니켈 (달러/톤)"]) || 0,
                "주석 (달러/톤)": parseFloat(row["주석 (달러/톤)"]) || 0,
            };
        });
        // 통계 정보와 함께 다운로드
        if (typeof downloadWithStatistics === "function") {
            downloadWithStatistics(
                preparedData,
                "비철금속가격정보",
                "비철금속가격데이터",
                this.currentDateRange
            );
        }
    }
}

// 페이지 로드 시 자동 실행
let nonMetalsPageFilter = null;

window.addEventListener("DOMContentLoaded", async () => {
    nonMetalsPageFilter = new NonMetalsPageFilter();
    await nonMetalsPageFilter.init();
});
