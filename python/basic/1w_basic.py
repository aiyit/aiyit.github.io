'''
1. python 개요
파이썬(Python)은 1991년 귀도 반 로섬(Guido van Rossum)이 개발한 고급 프로그래밍 언어(High-Level Language). 
문법이 간결하고 읽기 쉬워 초보자부터 전문가까지 가장 많이 사용하는 언어 중 하나이며, 
현재는 인공지능(AI), 데이터 분석, 웹 개발, 자동화, IoT 등 거의 모든 분야에서 활용

2.파이썬의 특징
특징	            설명
쉬운 문법	        영어 문장처럼 읽기 쉬운 문법 사용
무료(Open Source)	누구나 무료로 사용 가능
플랫폼 독립성	    Windows, macOS, Linux 모두 지원
인터프리터 언어	    컴파일 없이 바로 실행 가능
객체지향 지원	    클래스와 객체를 이용한 개발 가능
다양한 라이브러리	수십만 개의 라이브러리 제공
생산성 높음	        적은 코드로 많은 기능 구현

3.파이썬의 활용 분야
                Python
                   │
 ┌──────────┬──────────┬──────────┬
 │          │          │          │
AI/ML   데이터분석   웹개발    자동화
 │          │          │          │
TensorFlow Pandas    Django   업무자동화
PyTorch   NumPy      Flask    크롤링
① 인공지능(AI)
대표 라이브러리
TensorFlow,PyTorch,Keras,Scikit-learn
활용
ChatGPT,이미지 인식,음성인식,추천 시스템

② 데이터 분석
대표 라이브러리
Pandas,NumPy,Matplotlib,Plotly
활용
통계 분석,데이터 전처리,시각화,머신러닝 데이터 준비

③ 웹 개발
프레임워크
Django,Flask,FastAPI
활용
홈페이지,쇼핑몰,REST API,관리자 시스템
④ 업무 자동화
엑셀 자동화,파일 정리,이메일 발송,웹 크롤링
라이브러리
openpyxl,Selenium,BeautifulSoup,requests
⑤ IoT 및 임베디드
활용
Raspberry Pi,Arduino 연동,센서 제어,스마트홈

4. 왜 AI에서 파이썬을 사용할까?

AI 개발의 표준 언어로 자리 잡은 이유
이유	                설명
풍부한 AI 라이브러리	TensorFlow, PyTorch 등
쉬운 문법	            알고리즘 구현에 집중 가능
개발 속도	            프로토타입 제작이 빠름
커뮤니티	            전 세계 개발자들이 활발히 지원
GPU 지원	            대규모 딥러닝 학습 가능

5. 기본 자료형
자료형	        예시	    설명
int	            100	        정수
float	        3.14	    실수
str	            "Python"	문자열
bool	        True	    참/거짓
list	        [1,2,3]	    여러 데이터 저장
tuple	        (1,2,3)	    수정 불가 데이터
dict	        {"name":"Kim"}	키-값 저장
set	            {1,2,3}	중복 제거 집합

6. 파이썬의 실행 과정
소스코드(.py)
      │
      ▼
Python Interpreter
      │
      ▼
바이트코드(.pyc)
      │
      ▼
Python Virtual Machine(PVM)
      │
      ▼
실행 결과

파이썬은 인터프리터 언어이지만, 내부적으로는 바이트코드(.pyc)로 변환한 뒤 Python Virtual Machine(PVM)에서 실행

7. 다른 언어와 비교
항목	    Python  	C	         Java
배우기  	★★★★★	★★    	    ★★★
실행속도	★★★	    ★★★★★	    ★★★★
개발속도	★★★★★	★★	        ★★★
AI 개발	    ★★★★★	★	        ★★
데이터 분석	★★★★★	★	        ★★
웹 개발	    ★★★★★	★	        ★★★★

8.대표 라이브러리
분야	        라이브러리
데이터 분석 	Pandas, NumPy
시각화	        Matplotlib, Plotly
AI	            TensorFlow, PyTorch
머신러닝	    Scikit-learn
웹	            Django, Flask, FastAPI
크롤링	        BeautifulSoup, Selenium
이미지 처리	     OpenCV, Pillow
게임	        Pygame

9. 학습 로드맵
Python 기초
      │
      ▼
자료형
      │
      ▼
조건문
      │
      ▼
반복문
      │
      ▼
함수
      │
      ▼
리스트·튜플·딕셔너리
      │
      ▼
클래스(Object)
      │
      ▼
파일 입출력
      │
      ▼
모듈
      │
      ▼
프로젝트
      │
      ▼
AI · 데이터 분석 · 웹 개발


python 설정 과정
1. https://www.python.org/ 다운로드
2. 설치 과정에서 Add Python 3.x to PATH 체크   
☑ Add Python to PATH
☑ Install launcher for all users
3. 설치 완료 후 cmd 창에서 python 입력하여 버전 확인
python --version 
4. https://marketplace.visualstudio.com/
python extension 설치, debugger 설치,pylance 설치
5. github repository 에서 python 폴더 생성
6. python 폴더에서 basic01.py 파일 생성
# python 파일은 .py 확장자를 가진다.
7. 터미널 열기
Ctrl + ~
8. 가상환경 python -m venv venv
'''
#문자 출력하기
print("hello world")
print("AI Software")
#숫자 출력
print(100)
print(3.14)
print("100") #문자
print(100)
#따옴표
print("Python")
print('Python')
print("'Python'")
#escape \
print("I'm \"James\".")
#줄바꿈
print("Python\nAI\nProgramming")
#Tap
print("이름\t점수")
print("홍길동\t95")
print("김철수\t88")
#\ 역슬래시 출력
print("C:\\Python")
# 긴문자열
print("""
Python
AI
Machine Learning
Deep Learning
""")
#문자열 연결
print("Python" + " Programming")
#문자열 반복
print("=" * 30)
#여러값 출력
print("이름:", "홍길동", "나이:", 20)
#sep 옵션
print(10,20,30)
print(10,20,30, sep=",")
print(10,20,30, sep="-")
print(10,20,30, sep="!")
#end 줄 바꿈 없음
print("Hello", end=" ")
print("Python")
#문자열 포맷
name="홍길동"
age=20

print(f"이름은 {name}입니다.")
print(f"나이는 {age}살입니다.")
a=10
b=20

print(f"{a}+{b}={a+b}")
#가운데 정렬
print("{:^20}".format("Python"))
#오른쪽 정렬, 왼쪽 정렬
print("{:>20}".format("Python"))
print("{:<20}".format("Python"))
# 표 정렬
print("="*35)
print("이름\t학과\t점수")
print("="*35)
print("홍길동\tAI\t95")
print("김철수\t컴퓨터\t88")
print("="*35)
# 실무예제
name="James"
major="AI소프트웨어과"
grade=1
gpa=4.25

print("="*40)
print("학생 정보")
print("="*40)
print(f"이름   : {name}")
print(f"학과   : {major}")
print(f"학년   : {grade}")
print(f"평점   : {gpa:.2f}")
print("="*40)
'''
#escape  문자 정리
| 문자   | 의미             | 예시                      |
| ---- | -------------- | ----------------------- |
| `\n` | 줄 바꿈           | `print("A\nB")`         |
| `\t` | 탭(들여쓰기)        | `print("이름\t점수")`       |
| `\\` | 역슬래시 출력        | `print("C:\\Python")`   |
| `\"` | 큰따옴표 출력        | `print("\"Python\"")`   |
| `\'` | 작은따옴표 출력       | `print('It\'s Python')` |
| `\r` | 줄의 맨 앞으로 이동    | `print("12345\rABC")`   |
| `\b` | 한 글자 삭제(백스페이스) | `print("ABC\bD")`       |

# 실습 1
안녕하세요.
제 이름은 홍길동입니다.
AI소프트웨어과 학생입니다.
#실습2
**********
#실습3
========================================
학생 정보
========================================
이름 : 홍길동
학과 : AI소프트웨어과
학년 : 1
========================================
#실습4
성적표 출력
----------------------------------------
이름        국어    영어    수학
----------------------------------------
홍길동       95      90      88
김철수       85      80      91
----------------------------------------
#실습5
실습 5. 영수증 출력
==========================
      영 수 증
==========================
아메리카노   2잔   8,000원
케이크       1개   5,500원
--------------------------
합계         13,500원
==========================
'''