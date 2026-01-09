// Excel 다운로드 유틸리티
// SheetJS 라이브러리 사용 (CDN으로 로드 필요)

/**
 * 필터링된 데이터를 Excel 파일로 다운로드
 * @param {Array} data - 다운로드할 데이터 배열
 * @param {String} filename - 저장할 파일명 (확장자 제외)
 * @param {String} sheetName - Excel 시트명
 * @param {Object} options - 추가 옵션
 */
function downloadFilteredDataAsExcel(
    data,
    filename,
    sheetName = "Sheet1",
    options = {}
) {
    if (!data || data.length === 0) {
        alert("다운로드할 데이터가 없습니다.");
        return;
    }

    try {
        // 워크북 생성
        const wb = XLSX.utils.book_new();

        // 데이터를 워크시트로 변환
        const ws = XLSX.utils.json_to_sheet(data, {
            header: options.header || Object.keys(data[0]),
            skipHeader: false,
        });

        // 컬럼 너비 자동 조정
        if (options.autoWidth !== false) {
            const colWidths = autoFitColumns(data);
            ws["!cols"] = colWidths;
        }

        // 헤더 스타일 적용 (옵션)
        if (options.headerStyle !== false) {
            applyHeaderStyle(ws, data);
        }

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // 파일 다운로드
        const timestamp = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");
        const fullFilename = `${filename}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, fullFilename);

        console.log(`✓ Excel 파일 다운로드 완료: ${fullFilename}`);
    } catch (error) {
        console.error("Excel 다운로드 실패:", error);
        alert("Excel 파일 생성 중 오류가 발생했습니다.");
    }
}

/**
 * 통계 정보 추가한 Excel 생성 (단일 데이터셋)
 */
function downloadWithStatistics(data, filename, sheetName, dateRange) {
    if (!data || data.length === 0) {
        alert("다운로드할 데이터가 없습니다.");
        return;
    }

    try {
        const wb = XLSX.utils.book_new();

        // 1. 데이터 시트
        const ws = XLSX.utils.json_to_sheet(data);
        const colWidths = autoFitColumns(data);
        ws["!cols"] = colWidths;
        applyHeaderStyle(ws, data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // 2. 요약 정보 시트
        const summary = createSummarySheet(data, dateRange, sheetName);
        const summaryWs = XLSX.utils.aoa_to_sheet(summary);
        summaryWs["!cols"] = [{ wch: 20 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, "요약정보");

        // 파일 다운로드
        const timestamp = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");
        const fullFilename = `${filename}_${timestamp}.xlsx`;

        XLSX.writeFile(wb, fullFilename);

        console.log(`✓ Excel 파일 다운로드 완료: ${fullFilename}`);
    } catch (error) {
        console.error("Excel 다운로드 실패:", error);
        alert("Excel 파일 생성 중 오류가 발생했습니다.");
    }
}

/**
 * 컬럼 너비 자동 조정
 */
function autoFitColumns(data) {
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]);
    const colWidths = keys.map((key) => {
        // 헤더 길이
        let maxWidth = key.length;

        // 데이터 중 최대 길이 찾기 (최대 100개 샘플)
        const sampleSize = Math.min(100, data.length);
        for (let i = 0; i < sampleSize; i++) {
            const value = String(data[i][key] || "");
            maxWidth = Math.max(maxWidth, value.length);
        }

        // 한글은 2배, 최소 10, 최대 50
        const width = Math.min(Math.max(maxWidth * 1.2, 10), 50);
        return { wch: width };
    });

    return colWidths;
}

/**
 * 헤더 스타일 적용 (간단한 스타일)
 */
function applyHeaderStyle(ws, data) {
    if (!data || data.length === 0) return;

    const keys = Object.keys(data[0]);
    const range = XLSX.utils.decode_range(ws["!ref"]);

    // 첫 행(헤더)에 스타일 적용
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;

        // 셀 스타일 설정
        ws[address].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "CCCCCC" } },
            alignment: { horizontal: "center", vertical: "center" },
        };
    }
}

/**
 * 요약 정보 시트 생성
 */
function createSummarySheet(data, dateRange, dataType) {
    const summary = [
        ["항목", "내용"],
        ["데이터 유형", dataType],
        ["다운로드 일시", new Date().toLocaleString("ko-KR")],
        [
            "데이터 범위",
            `${formatDate(dateRange.startDate)} ~ ${formatDate(
                dateRange.endDate
            )}`,
        ],
        ["데이터 건수", `${data.length}건`],
        [""],
        ["※ 본 데이터는 원자재 가격 모니터링 시스템에서 생성되었습니다."],
    ];

    return summary;
}

/**
 * 데이터 정리 함수 - 다운로드 전 데이터 포맷 정리
 */
function prepareDataForExcel(data, columnMapping = {}) {
    if (!data || data.length === 0) return [];

    return data.map((row) => {
        const newRow = {};

        Object.keys(row).forEach((key) => {
            // 컬럼명 매핑 (한글명 등으로 변경)
            const newKey = columnMapping[key] || key;
            let value = row[key];

            // 숫자 타입 변환 (문자열로 된 숫자를 실제 숫자로)
            if (typeof value === "string") {
                // 쉼표 제거 후 숫자 변환 시도
                const cleanValue = value.replace(/,/g, "");
                const parsed = parseFloat(cleanValue);
                if (!isNaN(parsed) && cleanValue !== "") {
                    value = parsed;
                }
            }

            newRow[newKey] = value;
        });

        return newRow;
    });
}

// SheetJS 라이브러리 로드 확인
function checkSheetJSLibrary() {
    if (typeof XLSX === "undefined") {
        console.error("SheetJS 라이브러리가 로드되지 않았습니다.");
        console.log("다음 스크립트를 HTML에 추가하세요:");
        console.log(
            '<script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>'
        );
        return false;
    }
    return true;
}

// 전역으로 export
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        downloadFilteredDataAsExcel,
        downloadWithStatistics,
        prepareDataForExcel,
        checkSheetJSLibrary,
    };
}
