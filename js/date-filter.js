// 날짜 필터 컴포넌트
class DateRangeFilter {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            defaultRange: options.defaultRange || "3M", // '1M', '3M', '6M', '1Y', 'ALL'
            dataEndDate: options.dataEndDate || null, // 데이터의 최신 날짜 (있으면 이 날짜 기준으로 계산)
            onFilter: options.onFilter || (() => {}),
            customRanges: options.customRanges || {
                "1M": { label: "1개월", months: 1 },
                "3M": { label: "3개월", months: 3 },
                "6M": { label: "6개월", months: 6 },
                "1Y": { label: "1년", months: 12 },
                ALL: { label: "전체", months: null },
            },
        };

        this.currentRange = this.options.defaultRange;
        this.customStartDate = null;
        this.customEndDate = null;

        this.render();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const today = new Date();
        const maxDate = today.toISOString().split("T")[0];

        let html = `
            <div class="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4">
                <div class="flex flex-col gap-3">
                    <!-- 기본 범위 버튼 -->
                    <div class="grid grid-cols-3 md:grid-cols-${
                        Object.keys(this.options.customRanges).length
                    } gap-2">
                        ${Object.entries(this.options.customRanges)
                            .map(
                                ([key, range]) => `
                            <button 
                                class="date-range-btn px-3 py-2 text-sm rounded-lg border transition-colors
                                    ${
                                        this.currentRange === key
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }"
                                data-range="${key}">
                                ${range.label}
                            </button>
                        `
                            )
                            .join("")}
                    </div>
                    
                    <!-- 현재 선택된 기간 표시 -->
                    <div id="${
                        this.containerId
                    }-current-range" class="text-xs text-gray-600 text-center bg-blue-50 rounded px-3 py-2">
                        조회 기간을 선택해주세요
                    </div>
                    
                    <!-- 커스텀 날짜 선택 -->
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <label class="text-sm text-gray-600 whitespace-nowrap sm:mr-2">직접 선택:</label>
                        <div class="flex items-center gap-2 flex-1">
                            <input 
                                type="date" 
                                id="${this.containerId}-start-date"
                                class="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                max="${maxDate}">
                            <span class="text-gray-500">~</span>
                            <input 
                                type="date" 
                                id="${this.containerId}-end-date"
                                class="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                max="${maxDate}">
                            <button 
                                id="${this.containerId}-apply-custom"
                                class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                                적용
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEvents();
    }

    attachEvents() {
        const container = document.getElementById(this.containerId);

        // 기본 범위 버튼 이벤트
        container.querySelectorAll(".date-range-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const range = e.target.dataset.range;
                this.setRange(range);
            });
        });

        // 커스텀 날짜 적용 버튼
        const applyBtn = document.getElementById(
            `${this.containerId}-apply-custom`
        );
        if (applyBtn) {
            applyBtn.addEventListener("click", () => {
                this.applyCustomRange();
            });
        }

        // 날짜 입력 필드에서 엔터키 처리
        const startInput = document.getElementById(
            `${this.containerId}-start-date`
        );
        const endInput = document.getElementById(
            `${this.containerId}-end-date`
        );

        [startInput, endInput].forEach((input) => {
            if (input) {
                input.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        this.applyCustomRange();
                    }
                });
            }
        });
    }

    setRange(rangeKey) {
        this.currentRange = rangeKey;
        this.customStartDate = null;
        this.customEndDate = null;

        // 버튼 활성화 상태 업데이트
        const container = document.getElementById(this.containerId);
        container.querySelectorAll(".date-range-btn").forEach((btn) => {
            if (btn.dataset.range === rangeKey) {
                btn.className =
                    "date-range-btn px-3 py-2 text-sm rounded-lg border transition-colors bg-blue-600 text-white border-blue-600";
            } else {
                btn.className =
                    "date-range-btn px-3 py-2 text-sm rounded-lg border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
            }
        });

        // 커스텀 날짜 입력 초기화
        document.getElementById(`${this.containerId}-start-date`).value = "";
        document.getElementById(`${this.containerId}-end-date`).value = "";

        // 현재 선택된 기간 표시 업데이트
        this.updateCurrentRangeDisplay();

        // 필터 콜백 실행
        this.options.onFilter(this.getDateRange());
    }

    applyCustomRange() {
        const startInput = document.getElementById(
            `${this.containerId}-start-date`
        );
        const endInput = document.getElementById(
            `${this.containerId}-end-date`
        );

        const startDate = startInput.value;
        const endDate = endInput.value;

        if (!startDate || !endDate) {
            alert("시작일과 종료일을 모두 선택해주세요.");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert("시작일은 종료일보다 이전이어야 합니다.");
            return;
        }

        this.customStartDate = startDate;
        this.customEndDate = endDate;
        this.currentRange = "CUSTOM";

        // 모든 버튼 비활성화
        const container = document.getElementById(this.containerId);
        container.querySelectorAll(".date-range-btn").forEach((btn) => {
            btn.className =
                "date-range-btn px-3 py-2 text-sm rounded-lg border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
        });

        // 현재 선택된 기간 표시 업데이트
        this.updateCurrentRangeDisplay();

        // 필터 콜백 실행
        this.options.onFilter(this.getDateRange());
    }

    getDateRange() {
        if (
            this.currentRange === "CUSTOM" &&
            this.customStartDate &&
            this.customEndDate
        ) {
            return {
                startDate: new Date(this.customStartDate),
                endDate: new Date(this.customEndDate),
                rangeType: "CUSTOM",
            };
        }

        // 데이터의 최신 날짜가 지정되어 있으면 그 날짜 기준으로 계산
        const endDate = this.options.dataEndDate
            ? new Date(this.options.dataEndDate)
            : new Date();
        let startDate = new Date(endDate);

        const rangeConfig = this.options.customRanges[this.currentRange];

        if (rangeConfig.months === null) {
            // 전체 범위
            startDate = new Date("2000-01-01");
        } else {
            startDate.setMonth(startDate.getMonth() - rangeConfig.months);
        }

        return {
            startDate,
            endDate,
            rangeType: this.currentRange,
        };
    }

    // 현재 선택된 기간 표시 업데이트
    updateCurrentRangeDisplay() {
        const displayElement = document.getElementById(
            `${this.containerId}-current-range`
        );
        if (!displayElement) return;

        const dateRange = this.getDateRange();
        const startStr = formatDate(dateRange.startDate);
        const endStr = formatDate(dateRange.endDate);

        displayElement.innerHTML = `📅 조회 기간: <strong>${startStr}</strong> ~ <strong>${endStr}</strong>`;
    }

    // 현재 필터 상태 가져오기
    getCurrentFilter() {
        return {
            range: this.currentRange,
            dateRange: this.getDateRange(),
        };
    }
}

// 전역으로 사용할 수 있도록 export
if (typeof module !== "undefined" && module.exports) {
    module.exports = DateRangeFilter;
}
