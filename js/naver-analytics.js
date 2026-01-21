(function () {
    // 중복 로딩 방지
    if (window.__NAVER_ANALYTICS__) return;
    window.__NAVER_ANALYTICS__ = true;

    // wcs_add 설정
    window.wcs_add = window.wcs_add || {};
    window.wcs_add["wa"] = "6727a4a95b6a08";

    // 스크립트 동적 로딩
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://wcs.pstatic.net/wcslog.js";

    s.onload = function () {
        if (window.wcs) {
            window.wcs_do();
        }
    };

    document.head.appendChild(s);
})();
