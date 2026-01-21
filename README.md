# 원자재 가격 모니터링 대시보드

일별 원자재 가격 정보를 제공하는 웹 대시보드입니다.

## 🚀 기능

- **철강 가격 정보**: 철근, 철광석, 유연탄, 스크랩
- **비철금속 가격**: 구리, 알루미늄, 아연, 납, 니켈, 주석
- **유가 정보**: 전국 및 지역별 경유 가격
- **금융 정보**: 환율, 기준금리, KORIBOR
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 📊 데이터 출처

- 한국은행 경제통계시스템 (환율, 금리)
- Opinet (유가)
- 공공데이터포털 (철강 원자재)
- 조달청 (비철금속)

## 🛠️ 기술 스택

- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **Charts**: Chart.js
- **Data Processing**: PapaParse (CSV 파싱)
- **Backend**: Python (데이터 수집)
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📁 프로젝트 구조

```
price-dashboard/
├── index.html              # 메인 페이지
├── pages/                  # 서브 페이지
│   ├── metals.html
│   ├── nonmetals.html
│   ├── oil.html
│   └── exchange.html
├── js/                     # JavaScript 파일
│   ├── main.js
│   ├── charts.js
│   └── data-loader.js
├── data/                   # CSV 데이터
│   ├── monthly_metal_data.csv
│   ├── daily_no_metal_data.csv
│   ├── daily_oil_data.csv
│   └── dollar_won_rate_data.csv
├── main.py                 # 데이터 수집 스크립트
├── requirements.txt
└── .github/
    └── workflows/
        ├── data-update.yml
        └── pages.yml
```

## 📅 자동 업데이트

GitHub Actions를 통해 **매일 오전 11시(KST)** 에 자동으로 데이터가 업데이트됩니다.

## 📝 라이선스

MIT License

## 👤 작성자

ko-hoon

---

⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!
