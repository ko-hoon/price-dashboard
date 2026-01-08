async function drawOilMap() {
    try {
        // GeoJSON 파일과 유가 CSV 파일 동시 로드
        const [geoData, csvText] = await Promise.all([
            d3.json("map/skorea_provinces_geo.json"),
            d3.text("data/daily_oil_data.csv"),
        ]);

        // CSV 파싱
        const csvData = Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
        }).data;

        // 최신 데이터 (가장 마지막 행)
        const latestData = csvData[csvData.length - 1];

        // 시도명 매핑 (CSV 컬럼명 -> GeoJSON properties.name)
        const nameMapping = {
            서울: "서울특별시",
            경기: "경기도",
            인천: "인천광역시",
            강원: "강원도",
            충북: "충청북도",
            충남: "충청남도",
            전북: "전라북도",
            전남: "전라남도",
            경북: "경상북도",
            경남: "경상남도",
            세종: "세종시",
            대전: "대전광역시",
            대구: "대구광역시",
            부산: "부산광역시",
            광주: "광주광역시",
            울산: "울산광역시",
            제주: "제주도",
        };

        // 시도별 유가 데이터 객체 생성
        const oilPriceData = {};
        Object.keys(nameMapping).forEach((csvName) => {
            const fullName = nameMapping[csvName];
            oilPriceData[fullName] = latestData[csvName];
        });

        // 전국 평균
        const avgPrice = latestData["전국"];

        // 색상 결정 함수
        function getColor(price) {
            const diff = ((price - avgPrice) / avgPrice) * 100;

            if (diff >= 1) return "rgba(239, 68, 68, 1)";
            if (diff >= 0.5) return "rgba(239, 68, 68, 0.7)";
            if (diff > 0) return "rgba(239, 68, 68, 0.4)";
            if (diff <= -1) return "rgba(59, 130, 246, 1)";
            if (diff <= -0.5) return "rgba(59, 130, 246, 0.7)";
            if (diff < 0) return "rgba(59, 130, 246, 0.4)";
            return "#e5e7eb";
        }

        // SVG 설정
        const container = document.getElementById("oil-map");
        if (!container) {
            console.error("oil-map 컨테이너를 찾을 수 없습니다!");
            return;
        }

        const width = container.clientWidth;
        const isMobile = window.innerWidth < 768;
        const height = isMobile ? width * 1 : width * 1;

        // 컨테이너 높이 설정
        container.style.height = height + "px";

        // 기존 SVG 제거
        d3.select("#oil-map").selectAll("*").remove();

        const svg = d3
            .select("#oil-map")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("background", "#ffffff");

        // 투영 설정 (한국 중심) - 반응형
        const projection = d3
            .geoMercator()
            .center([128.2, 36])
            .scale(width * 8.4)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // 툴팁 - 한 번만 생성하고 재사용
        let tooltip = d3.select(".map-tooltip");
        if (tooltip.empty()) {
            tooltip = d3
                .select("body")
                .append("div")
                .attr("class", "map-tooltip")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background", "rgba(31, 41, 55, 0.95)")
                .style("color", "white")
                .style("padding", "12px 16px")
                .style("border-radius", "8px")
                .style("font-size", "14px")
                .style("pointer-events", "none")
                .style("z-index", "1000")
                .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
                .style("backdrop-filter", "blur(4px)");
        }

        // 지도 그리기 - GPU 가속 활성화
        svg.style("will-change", "transform");

        const mapGroup = svg.append("g");

        const paths = mapGroup
            .selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d) => {
                const name = d.properties.name;
                const price = oilPriceData[name];
                return price ? getColor(price) : "#e5e7eb";
            })
            .attr("stroke", "#dddddd")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .style("transition", "opacity 0.15s ease") // CSS transition 사용
            .on("mouseenter", function (event, d) {
                const name = d.properties.name;
                const price = oilPriceData[name];
                const diff = price
                    ? (((price - avgPrice) / avgPrice) * 100).toFixed(2)
                    : "N/A";

                // opacity는 CSS로 처리
                this.style.opacity = "0.7";

                // 툴팁 위치 계산
                const tooltipWidth = 200;
                const isRightSide = event.pageX > window.innerWidth / 2;
                const leftPos = isRightSide
                    ? event.pageX - tooltipWidth - 10
                    : event.pageX + 10;

                tooltip
                    .html(
                        `<strong>${name}</strong><br/>
                         가격: ${
                             price ? price.toLocaleString() + "원/L" : "N/A"
                         }<br/>
                         전국평균: ${avgPrice.toLocaleString()}원/L<br/>
                         차이: ${
                             price ? (diff > 0 ? "+" : "") + diff + "%" : "N/A"
                         }`
                    )
                    .style("left", leftPos + "px")
                    .style("top", event.pageY - 28 + "px")
                    .style("visibility", "visible");
            })
            .on("mouseleave", function () {
                this.style.opacity = "1";
                tooltip.style("visibility", "hidden");
            });
    } catch (error) {
        console.error("지도 로드 실패:", error);
        const container = document.getElementById("oil-map");
        if (container) {
            container.innerHTML =
                '<div class="flex items-center justify-center h-full text-gray-400">지도 데이터를 불러올 수 없습니다: ' +
                error.message +
                "</div>";
        }
    }
}

// 리사이즈 최적화 - debounce 시간 증가 및 리사이즈 중 플래그 설정
let resizeTimer;
let isResizing = false;

window.addEventListener("resize", () => {
    isResizing = true;
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        drawOilMap();
        isResizing = false;
    }, 250); // 250ms로 증가
});

// 스크롤 성능 최적화를 위한 passive 리스너
window.addEventListener(
    "scroll",
    () => {
        // 스크롤 중에는 지도 업데이트 방지
    },
    { passive: true }
);
