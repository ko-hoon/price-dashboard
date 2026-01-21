// 날짜 필터 컴포넌트
class DateRangeFilter {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            defaultRange: options.defaultRange || "1Y",
            dataEndDate: options.dataEndDate || null,
            onFilter: options.onFilter || (() => {}),
            customRanges: options.customRanges || {
                "3M": { label: "3개월", months: 3 },
                "6M": { label: "6개월", months: 6 },
                "1Y": { label: "1년", months: 12 },
                "3Y": { label: "3년", months: 36 },
                ALL: { label: "전체", months: null },
            },
        };

        this.currentRange = this.options.defaultRange;
        this.customStartDate = null;
        this.customEndDate = null;

        this.render();
        this.setRange(this.options.defaultRange);
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const today = new Date();
        const maxDate = today.toISOString().split("T")[0];

        const rangeCount = Object.keys(this.options.customRanges).length;

        let html = `
            <div class="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                <div class="space-y-4">
                    <!-- 빠른 선택 버튼 -->
                    <div>
                        <label class="block text-sm md:text-base font-medium text-gray-900 mb-2">필터</label>
                        <div class="grid grid-cols-3 md:grid-cols-${rangeCount} gap-2">
                            ${Object.entries(this.options.customRanges)
                                .map(
                                    ([key, range]) => `
                                <button 
                                    class="date-range-btn px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all
                                        ${
                                            this.currentRange === key
                                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                        }"
                                    data-range="${key}">
                                    ${range.label}
                                </button>
                            `
                                )
                                .join("")}
                        </div>
                    </div>
                    
                    <!-- 직접 선택 -->
                    <div>
                        <div class="flex flex-col gap-3">
                            <!-- 날짜 입력 -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div class="flex items-center gap-2">
                                    <input 
                                        type="date" 
                                        id="${this.containerId}-start-date"
                                        class="w-full px-3 py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg 
                                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        max="${maxDate}"
                                        placeholder="시작일">
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-400 font-medium hidden sm:inline">~</span>
                                    <input 
                                        type="date" 
                                        id="${this.containerId}-end-date"
                                        class="w-full px-3 py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg 
                                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        max="${maxDate}"
                                        placeholder="종료일">
                                </div>
                            </div>
                            <!-- 조회 버튼 -->
                            <button 
                                id="${this.containerId}-apply-custom"
                                class="w-full sm:w-auto px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg 
                                       hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm 
                                       hover:shadow-md whitespace-nowrap">
                                조회하기
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

        container.querySelectorAll(".date-range-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const range = e.target.dataset.range;
                this.setRange(range);
            });
        });

        const applyBtn = document.getElementById(
            `${this.containerId}-apply-custom`
        );
        if (applyBtn) {
            applyBtn.addEventListener("click", () => {
                this.applyCustomRange();
            });
        }

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

        const dateRange = this.calculateDateRange(rangeKey);

        const container = document.getElementById(this.containerId);
        container.querySelectorAll(".date-range-btn").forEach((btn) => {
            if (btn.dataset.range === rangeKey) {
                btn.className =
                    "date-range-btn px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all bg-blue-600 text-white border-blue-600 shadow-md";
            } else {
                btn.className =
                    "date-range-btn px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50";
            }
        });

        const startInput = document.getElementById(
            `${this.containerId}-start-date`
        );
        const endInput = document.getElementById(
            `${this.containerId}-end-date`
        );

        if (startInput && endInput) {
            startInput.value = dateRange.startDate.toISOString().split("T")[0];
            endInput.value = dateRange.endDate.toISOString().split("T")[0];
        }

        this.options.onFilter(dateRange);
    }

    calculateDateRange(rangeKey) {
        const endDate = this.options.dataEndDate
            ? new Date(this.options.dataEndDate)
            : new Date();
        let startDate = new Date(endDate);

        const rangeConfig = this.options.customRanges[rangeKey];

        if (rangeConfig.months === null) {
            startDate = new Date("2011-01-01");
        } else {
            startDate.setMonth(startDate.getMonth() - rangeConfig.months);
        }

        return {
            startDate,
            endDate,
            rangeType: rangeKey,
        };
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

        const container = document.getElementById(this.containerId);
        container.querySelectorAll(".date-range-btn").forEach((btn) => {
            btn.className =
                "date-range-btn px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50";
        });

        this.options.onFilter({
            startDate: new Date(this.customStartDate),
            endDate: new Date(this.customEndDate),
            rangeType: "CUSTOM",
        });
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

        return this.calculateDateRange(this.currentRange);
    }

    getCurrentFilter() {
        return {
            range: this.currentRange,
            dateRange: this.getDateRange(),
        };
    }

    setDataEndDate(endDate) {
        this.options.dataEndDate = endDate;
        this.setRange(this.currentRange);
    }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = DateRangeFilter;
}