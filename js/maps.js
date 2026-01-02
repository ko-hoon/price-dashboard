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

            if (diff >= 1) return "rgba(36, 99, 235, 1)";
            if (diff >= 0) return "rgba(36, 99, 235, 0.5)";
            if (diff <= -1) return "rgba(235,30,45,1)";
            if (diff < 0) return "rgba(235,30,45,0.5)";
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
        const height = isMobile ? width * 1 : width * 1.1;

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
            .center([128, 36])
            .scale(width * 8) // 화면 크기 기반 스케일
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // 툴팁
        const tooltip = d3
            .select("body")
            .append("div")
            .attr(
                "class",
                "absolute hidden bg-gray-800 text-white px-3 py-2 rounded text-sm pointer-events-none"
            )
            .style("z-index", "1000");

        // 지도 그리기
        const paths = svg
            .selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d) => {
                const name = d.properties.name;
                const price = oilPriceData[name];
                const color = price ? getColor(price) : "#e5e7eb";
                return color;
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                const name = d.properties.name;
                const price = oilPriceData[name];
                const diff = price
                    ? (((price - avgPrice) / avgPrice) * 100).toFixed(2)
                    : "N/A";

                d3.select(this).attr("opacity", 0.7);

                // 툴팁 위치 계산 (화면 우측이면 왼쪽에 표시)
                const tooltipWidth = 200; // 툴팁 예상 너비
                const isRightSide = event.pageX > window.innerWidth / 2;
                const leftPos = isRightSide
                    ? event.pageX - tooltipWidth - 10
                    : event.pageX + 10;

                tooltip
                    .html(
                        `<strong>${name}</strong><br/>
             가격: ${price ? price.toLocaleString() + "원/L" : "N/A"}<br/>
             전국평균: ${avgPrice.toLocaleString()}원/L<br/>
             차이: ${price ? (diff > 0 ? "+" : "") + diff + "%" : "N/A"}`
                    )
                    .style("left", leftPos + "px")
                    .style("top", event.pageY - 28 + "px")
                    .classed("hidden", false);
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
                tooltip.classed("hidden", true);
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
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        drawOilMap();
    }, 250); // 250ms 후에 다시 그리기
});
