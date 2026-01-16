import os
import csv
import subprocess
import urllib
import requests
from datetime import datetime, timedelta
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import re

# 환경 변수에서 API 키 가져오기
# KOREA_BANK_API_KEY = os.getenv("KOREA_BANK_API_KEY")
# OPINET_API_KEY = os.getenv("OPINET_API_KEY")
# PUBLIC_DATA_CENTER_API_KEY = os.getenv("PUBLIC_DATA_CENTER_API_KEY")
# LME_PRICE_BOARD_URL = os.getenv("LME_PRICE_BOARD_URL")
# LME_PRICE_LIST_URL = os.getenv("LME_PRICE_LIST_URL")

KOREA_BANK_API_KEY = "VH5HVPX7V38DUY6Y35OZ"
OPINET_API_KEY = "F260116063"
PUBLIC_DATA_CENTER_API_KEY = "OOCJbRX4ng%2FOUZs9PphW5mStymTHtN%2BmQp6gdj3OIDrl3jdYADTKdjm%2BhFLD%2FE2bhrkIoubjnnS8nJoA9P44NQ%3D%3D"
LME_PRICE_BOARD_URL = "https://www.pps.go.kr/bichuk/bbs/view.do"
LME_PRICE_LIST_URL = "https://www.pps.go.kr/bichuk/bbs/list.do"



# 중복이 아니면 True, 중복값이면 False 반환
def date_today_duplicate_check(file_path, file_name, today_date):
    try:
        with open(
            f"{file_path}/{file_name}", mode="r", newline="", encoding="utf-8-sig"
        ) as file:
            last_row = list(csv.reader(file))[-1]
            if last_row[0] == today_date:
                print(f"{file_name}의 데이터가 {today_date} 일자에 중복")
                return False
        print(f"{today_date} 일자의 {file_name} 데이터 수집 시작")
        return True
    except FileNotFoundError:
        print(f"{file_name}이(가) 존재하지 않아 새로 만듭니다.")
        return True
    except Exception as e:
        print(f"날짜 중복 체크 중 에러 발생: {e}")
        return False


# Requests를 통한 데이터 가져오기
def fetch_data(url, params=None, encoding=None):
    try:
        if params:
            params = urllib.parse.urlencode(params, safe="#':()+%=").encode("utf-8")
        response = requests.get(url, params=params)
        response.encoding = encoding if encoding else response.apparent_encoding
        if response.status_code == 200:
            print(f"url 주소 읽어오기 완료")
            return response
        else:
            raise Exception(f"url 주소 읽어오기 실패")
    except Exception as e:
        print(f"데이터 가져오기 중 에러 발생: {e}")
        return None


# 날짜 포맷 변환 함수
def format_date(date, input_format, output_format):
    return datetime.strptime(date, input_format).strftime(output_format)


# 데이터 초기화 함수
def initialize_data():
    return {
        "no_metal_prices": {
            "일자": None,
            "구리": None,
            "알루미늄": None,
            "아연": None,
            "납": None,
            "니켈": None,
            "주석": None,
        },
        "dollar_won_rate": {"일자": None, "환율": None, "금리": None, "KORIBOR": None},
        "oil_price": {
            "일자": None,
            "전국": None,
            "서울": None,
            "경기": None,
            "인천": None,
            "강원": None,
            "충북": None,
            "충남": None,
            "전북": None,
            "전남": None,
            "경북": None,
            "경남": None,
            "세종": None,
            "대전": None,
            "대구": None,
            "부산": None,
            "광주": None,
            "울산": None,
            "제주": None,
        },
        "metal_price": [],
    }


# 한국은행경제통계시스템에서 달러/원 환율 가져오기
def korea_bank(path, filename, dollar_rate, date):
    try:
        url_head = "http://ecos.bok.or.kr/api/KeyStatisticList"
        url = f"{url_head}/{KOREA_BANK_API_KEY}/json/kr/1/100"
        data = fetch_data(url).json()
        rdata = data["KeyStatisticList"]["row"]
        dollar_rate["환율"] = rdata[18]["DATA_VALUE"]
        dollar_rate["일자"] = date
        dollar_rate["금리"] = rdata[0]["DATA_VALUE"]
        dollar_rate["KORIBOR"] = rdata[2]["DATA_VALUE"]
        print(f"한국은행 Open API로 환율 데이터 가져오기 완료, 날짜: {date}")
        append_row_to_csv(path, filename, dollar_rate)
    except Exception as e:
        print(f"한국은행 데이터 가져오기 중 에러 발생: {e}")


# 조달 데이터 가져오기
def lme_price(path, filename, prices):
    try:
        html = fetch_data(f"{LME_PRICE_BOARD_URL}?key=00823").text
        soup = BeautifulSoup(html, "html.parser")
        today = datetime.now().strftime("%Y-%m-%d")
        date_check = 0
        soup_div = soup.find("div", "board_list").find("tbody")
        date_check_list = soup_div.find_all("tr")
        for i in date_check_list:
            if today == i.find_all("td")[4].get_text(strip=True):
                date_check += 1
        links = soup.find_all("a", onclick=re.compile(r"goView\("))[:date_check]
        for link in links:
            bbsSn = re.search(r"goView\('(\d+)',\s*'(\d+)'\)", link["onclick"]).group(1)
            LME_DETAIL_PRICE_URL = f"{LME_PRICE_LIST_URL}?bbsSn={bbsSn}&key=00823"
            html = fetch_data(LME_DETAIL_PRICE_URL).text
            soup = BeautifulSoup(html, "html.parser")
            # 1. 날짜 자동 추출 (두 번째 행의 <th>들 중 마지막 날짜)
            thead = soup.select_one("table.tstyle_a thead")
            date_ths = thead.select("tr")[1].find_all("th")
            prices["일자"] = (
                date_ths[5].get_text(strip=True).split()[0]
            )  # '2025-06-09' 추출

            # 2. 가격 추출
            rows = soup.select("table.tstyle_a tbody tr")
            for i in range(0, len(rows), 2):  # CASH는 짝수 행
                row = rows[i]
                th = row.find("th")
                tds = row.find_all("td")
                if len(tds) >= 6 and tds[0].get_text(strip=True) == "CASH":
                    metal = th.get_text(strip=True)
                    price = tds[5].get_text(strip=True).replace(",", "")
                    prices[metal] = price
            print(f"LME 비철금속 데이터 가져오기 완료, 날짜: {prices['일자']}")
            append_row_to_csv(path, filename, prices)
    except Exception as e:
        print(f"LME 데이터 가져오기 중 에러 발생: {e}")


# 오피넷 데이터 가져오기
def opinet_oil(path, filename, prices, date):
    try:
        base_url = "http://www.opinet.co.kr/api/"
        prices["일자"] = date
        # 전국 지역별 유가 정보 가져오기
        url = f"{base_url}avgSidoPrice.do"
        params = {"out": "json", "code": OPINET_API_KEY, "prodcd": "D047"}
        oil_datas = fetch_data(url, params).json()["RESULT"]["OIL"]
        if len(oil_datas) > 1:
            for oil_data in oil_datas:
                sido = oil_data["SIDONM"]
                if sido in prices:
                    prices[sido] = oil_data["PRICE"]
                else:
                    print(f"입력되지 않은 지역 {sido}이 있습니다")
            print(f"Opinet API로 유가 데이터 가져오기 완료, 날짜: {prices['일자']}")
            append_row_to_csv(path, filename, prices)
        else:
            print("불러온 유가 정보가 단일 항목입니다.")
            opinet_oil(path, filename, prices, date)
    except Exception as e:
        print(f"Opinet 데이터 가져오기 중 에러 발생: {e}")


# 공공 데이터 포탈 데이터 가져오기
def public_data_center(prices):
    try:
        url = "http://api.odcloud.kr/api/3039951/v1/uddi:b6699de8-3b19-4ab7-8ed7-894636ad6c6d_202004071625"
        params = {
            "page": "1",
            "perPage": "200",
            "returnType": "json",
            "serviceKey": PUBLIC_DATA_CENTER_API_KEY,
        }
        data = fetch_data(url, params).json()
        last_date = data["data"][0]["기간"]
        for i in data["data"]:
            prices_entry = {
                "날짜": i["기간"] + "-01",
                "철근 (천원/톤)": i["철근(천원_톤)"],
                "철광석 (달러/톤)": i["철광석(달러_톤)"],
                "유연탄 (달러/톤)": i["유연탄(달러_톤)"],
                "스크랩 (달러/톤)": i["철스크랩(달러_톤)"],
            }
            prices.append(prices_entry)
        print(
            f"공공데이터포탈 API로 철강원자재 데이터 가져오기 완료\n 업데이트 최종 날짜: {last_date}"
        )
    except Exception as e:
        print(f"공공데이터포탈 데이터 가져오기 중 에러 발생: {e}")


# CSV 파일에 새로운 행 추가
def append_row_to_csv(file_path, file_name, data):
    try:
        with open(
            f"{file_path}/{file_name}", mode="a", newline="", encoding="utf-8-sig"
        ) as file:
            writer = csv.writer(file)
            writer.writerow(data.values())
        print(f"{file_name}에 새 행 추가 완료")
    except Exception as e:
        print(f"CSV 파일에 행 추가 중 에러 발생: {e}")


# CSV 파일 쓰기
def write_to_csv_file_metal(file_path, file_name, data):
    if not data:  # data가 None이거나 빈 리스트면 그냥 종료
        print(f"{file_name}에 쓸 데이터가 없어 CSV 생성을 건너뜁니다.")
        return

    try:
        with open(
            f"{file_path}/{file_name}", mode="w", newline="", encoding="utf-8-sig"
        ) as file:
            writer = csv.DictWriter(file, fieldnames=data[0].keys())
            writer.writeheader()
            for row in data:
                writer.writerow(row)
        print(f"{file_name}에 CSV 데이터 쓰기 완료")
    except Exception as e:
        print(f"CSV 파일 쓰기 중 에러 발생: {e}")


# Git 저장소에서 최신 정보 가져오기
def git_pull(repo_path):
    # 작업 디렉토리를 Git 저장소 디렉토리로 변경
    os.chdir(repo_path)

    # 최신 정보 가져오기
    subprocess.run(["git", "pull"], check=True)
    print("Git 저장소에서 최신 정보 가져오기 완료")


# Git 저장소에 변경 사항 커밋 및 푸쉬
def git_commit_and_push(repo_path, commit_message):
    try:
        # 작업 디렉토리를 Git 저장소 디렉토리로 변경
        os.chdir(repo_path)

        # 변경 사항 확인
        status_output = (
            subprocess.check_output(["git", "status", "--porcelain"]).decode().strip()
        )
        if status_output:
            subprocess.run(["git", "config", "user.name", "ko-hoon"], check=True)
            subprocess.run(
                ["git", "config", "user.email", "seunghoon_jeon@kolon.com"], check=True
            )
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", commit_message], check=True)

            # 환경 변수에서 GH_TOKEN을 가져옴
            token = os.getenv("GH_TOKEN")
            if not token:
                raise Exception("GH_TOKEN이 설정되지 않았습니다.")

            # 리모트 URL에 토큰 추가 (origin 대신 실제 리모트 이름을 사용)
            remote_url = (
                subprocess.check_output(["git", "config", "--get", "remote.origin.url"])
                .decode()
                .strip()
            )
            token_url = remote_url.replace("https://", f"https://{token}@")

            # 리모트 URL 업데이트
            subprocess.run(
                ["git", "remote", "set-url", "origin", token_url], check=True
            )
            subprocess.run(["git", "push"], check=True)
            print("변경 사항을 Git 저장소에 커밋 및 푸쉬 완료")
        else:
            print("변경 사항이 없어 커밋 및 푸쉬를 생략합니다.")
    except subprocess.CalledProcessError as e:
        if "nothing to commit, working tree clean" in str(e.output):
            print("변경 사항이 없어 커밋 및 푸쉬를 생략합니다.")
        else:
            print(f"Git 커밋 및 푸쉬 중 에러 발생: {e}")
    except Exception as e:
        print(f"Git 작업 중 에러 발생: {e}")


# 메인 함수
def main():
    # 데이터 파일 경로 및 파일명 지정
    repo_path = "./"  # Git 저장소 경로
    write_file_path = os.path.join(repo_path, "data")
    dollar_won_rate_filename = "dollar_won_rate_data.csv"
    no_metal_filename = "daily_no_metal_data.csv"
    oil_price_filename = "daily_oil_data.csv"
    metal_price_filename = "monthly_metal_data.csv"

    # 현재 날짜 및 이전 영업일 계산
    today = datetime.today()
    formatted_today = today.strftime("%Y-%m-%d")
    previous_business_day = (
        today - timedelta(days=3) if today.weekday() == 0 else today - timedelta(days=1)
    )
    formatted_previous_business_day = previous_business_day.strftime("%Y-%m-%d")

    # 데이터 초기화
    data = initialize_data()

    # 각 데이터 수집 및 CSV 파일에 추가
    if date_today_duplicate_check(
        write_file_path, dollar_won_rate_filename, formatted_today
    ):
        korea_bank(
            write_file_path,
            dollar_won_rate_filename,
            data["dollar_won_rate"],
            formatted_today,
        )
    if date_today_duplicate_check(write_file_path, oil_price_filename, formatted_today):
        opinet_oil(
            write_file_path, oil_price_filename, data["oil_price"], formatted_today
        )
    if date_today_duplicate_check(
        write_file_path, no_metal_filename, formatted_previous_business_day
    ):
        lme_price(write_file_path, no_metal_filename, data["no_metal_prices"])

    public_data_center(data["metal_price"])
    write_to_csv_file_metal(
        write_file_path, metal_price_filename, data["metal_price"][::-1]
    )

    # 변경 사항을 Git 저장소에 커밋 및 푸쉬
    git_commit_and_push(repo_path, f"데이터 업데이트: {formatted_today}")


if __name__ == "__main__":
    main()
