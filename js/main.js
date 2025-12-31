// 공통 유틸리티 함수
const BASE_PATH = location.hostname === 'localhost'
    || location.hostname === '127.0.0.1'
    ? ''
    : '/price-dashboard';

// 숫자 포맷팅 (천 단위 콤마)
function formatNumber(num) {
    if (!num) return '-';
    return Number(num).toLocaleString('ko-KR');
}

// 날짜 포맷팅
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 변화율 계산
function calculateChange(current, previous) {
    if (!current || !previous) return { value: 0, percent: 0 };
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    return {
        value: diff,
        percent: percent,
        isPositive: diff >= 0
    };
}

// 변화율 HTML 생성
function getChangeHTML(change) {
    const color = change.isPositive ? 'text-red-500' : 'text-blue-500';
    const arrow = change.isPositive ? '▲' : '▼';
    return `<span class="${color}">${arrow} ${Math.abs(change.value).toFixed(2)} (${Math.abs(change.percent).toFixed(2)}%)</span>`;
}

// CSV 파일 로드
async function loadCSV(filename) {
    try {
        const response = await fetch(`${BASE_PATH}/data/${filename}`);
        const text = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
}

// 날짜 범위 필터링
function filterDataByDateRange(data, startDate, endDate, dateField = '일자') {
    return data.filter(row => {
        const rowDate = new Date(row[dateField]);
        return rowDate >= startDate && rowDate <= endDate;
    });
}

// 최신 데이터 가져오기
function getLatestData(data, dateField = '일자') {
    if (!data || data.length === 0) return null;
    
    // 날짜 기준 정렬
    const sorted = [...data].sort((a, b) => {
        return new Date(b[dateField]) - new Date(a[dateField]);
    });
    
    return sorted[0];
}

// 차트 색상 팔레트
const CHART_COLORS = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    copper: '#b87333',
    aluminum: '#a8a9ad',
    zinc: '#7f8c8d',
    lead: '#2c3e50',
    nickel: '#95a5a6',
    tin: '#c0c0c0'
};

// 차트 기본 옵션
function getChartOptions(title, yAxisLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: yAxisLabel
                }
            },
            x: {
                title: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };
}

// 로딩 표시
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>';
    }
}

// 에러 표시
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="text-center text-red-500 p-4">${message}</div>`;
    }
}

// 데이터 다운로드
function downloadData() {
    const files = [
        'monthly_metal_data.csv',
        'daily_no_metal_data.csv',
        'daily_oil_data.csv',
        'dollar_won_rate_data.csv'
    ];
    
    files.forEach(file => {
        const link = document.createElement('a');
        link.href = `${BASE_PATH}/data/${file}`;
        link.download = file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// 모바일 체크
function isMobile() {
    return window.innerWidth < 768;
}

// 반응형 차트 높이
function getChartHeight() {
    return isMobile() ? 250 : 400;
}