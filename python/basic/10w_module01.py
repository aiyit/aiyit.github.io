'''
##파이썬 모듈(Module)
1. 모듈(Module)이란?
모듈(Module)은 함수(Function), 클래스(Class), 변수 등을 하나의 파일(.py)에 모아 놓은 것.

자주 사용하는 코드를 재사용하기 위해 만든 파이썬 파일.

다음과 같은 기능을 여러 프로그램에서 사용한다고 가정.

더하기 함수
평균 계산 함수
학생 관리 함수
원 넓이 계산 함수

매번 작성하지 않고 하나의 파일에 저장한 뒤 필요한 곳에서 가져와 사용하는 것이 모듈.

math.py
┌───────────────────────────────┐
│ add()                         │
│ sub()                         │
│ average()                     │
│ circle_area()                 │
└───────────────────────────────┘
필요한 함수만 가져와 사용

#2. 모듈을 사용하는 이유
코드를 재사용할 수 있다.
유지보수가 쉽다.
프로그램을 여러 파일로 분리할 수 있다.
협업이 편하다.

#3. 모듈의 종류
종류	                예
내장 모듈	            math, random, os
표준 라이브러리	        datetime, csv, json
외부 모듈	            numpy, pandas, matplotlib
사용자 모듈         	mymath.py

#4. import : 모듈을 가져오는 명령.

import math

print(math.sqrt(25))


##5. math 모듈
import math

print(math.pi)

print(math.sqrt(16))

print(math.pow(2,5))

##자주 사용하는 함수
함수	    설명
pi	        원주율
sqrt()	    제곱근
pow()	    거듭제곱
ceil()	    올림
floor()	    내림
factorial()	팩토리얼

##6. random 모듈 : 난수를 생성.
import random
print(random.randint(1,10))



##리스트에서 하나 선택
fruit=["사과","배","포도"]
print(random.choice(fruit))

##섞기
number=[1,2,3,4,5]
random.shuffle(number)
print(number)

###7. datetime 모듈: 현재 날짜

from datetime import datetime
print(datetime.now())

##오늘 날짜
from datetime import date
print(date.today())

####8. os 모듈:현재 위치

import os
print(os.getcwd())

#현재 폴더 파일 보기
print(os.listdir())

#폴더 생성
os.mkdir("test")


##9. sys 모듈:파이썬 버전

import sys
print(sys.version)

#현재 경로
print(sys.path)
##10. time 모듈
import time
print("시작")

time.sleep(3)
print("끝")



####11. csv 모듈:CSV 저장

import csv
with open("output/score.csv","w",newline="",encoding="utf-8-sig") as f:

    writer = csv.writer(f)
    writer.writerow(["이름","Python","AI"])
    writer.writerow(["홍길동",95,90])
    writer.writerow(["김철수",88,84])

#읽기
import csv
with open("output/score.csv","r",encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

####12. json 모듈 :JSON 저장

import json
student = {
    "이름":"홍길동",
    "점수":95
}

with open("output/student.json","w",encoding="utf-8") as f:
    json.dump(student,f,ensure_ascii=False,indent=4)

##읽기
with open("output/student.json","r",encoding="utf-8") as f:
    student=json.load(f)

print(student)

###13. import 방법
##방법1
import math
print(math.pi)
##방법2
from math import pi
print(pi)
##방법3  권장하지 않음 어떤 함수가 어디에서 왔는지 알기 어렵고 이름 충돌이 발생
from math import *
print(sqrt(16))

#방법4
import math as m
print(m.pi)

##14. 사용자 모듈 만들기
##mymath.py
def add(a,b):
    return a+b
#ad = add(3,5)
#print(ad)
def sub(a,b):
    return a-b
#subt = sub(5,3)
#print(subt)

##다른 파일
#import mymath
#print(mymath.add(10,20))

#또는
###from mymath import add
##print(add(10,20))
'''
###15. 학생 관리 모듈
##student.py  파일 생성하기
'''
def average(a,b,c):

    return (a+b+c)/3

def grade(avg):

    if avg>=90:
        return "A"

    elif avg>=80:
        return "B"

    else:
        return "C"

##사용 방법

import student

avg = student.average(95,90,88)

print(avg)

print(student.grade(avg))
'''
###16. 패키지(Package):모듈 여러 개를 하나의 폴더로 관리하는 것
##school/
##├── student.py
##├── teacher.py
##├── score.py
##└── main.py

##from school import student
##17. 외부 모듈 설치


pip install numpy

##사용
import numpy as np
'''
##18. 자주 사용하는 모듈
모듈	용도
math	수학 계산
random	난수 생성
datetime	날짜/시간 처리
time	시간 제어
os	파일·폴더 관리
pathlib	경로 처리(권장)
sys	시스템 정보
csv	CSV 파일 처리
json	JSON 데이터 처리
statistics	평균, 중앙값 계산
shutil	파일 복사·이동
sqlite3	데이터베이스
tkinter	GUI 개발
19. import 구조
프로그램(main.py)

        │

     import

        │

┌──────────────────┐

│ math.py          │

│ random.py        │

│ student.py       │

└──────────────────┘
20. 실무에서 많이 사용하는 외부 모듈
모듈	활용 분야
NumPy	수치 계산
Pandas	데이터 분석
Matplotlib	그래프
OpenPyXL	Excel
Requests	웹 API
BeautifulSoup	웹 크롤링
Flask / FastAPI	웹 서비스
TensorFlow / PyTorch	AI 개발
💻 실습 과제
과제 1

math 모듈을 이용하여 다음을 계산하세요.

√64
π 출력
2⁸ 계산
과제 2

random 모듈을 이용하여 1~100 사이의 난수 10개를 출력하세요.

과제 3

리스트에서 임의의 학생 한 명을 선택하세요.

students = ["홍길동","김철수","이영희","박민수"]
과제 4

datetime 모듈을 이용하여 현재 날짜와 시간을 출력하세요.

과제 5

os 모듈을 이용하여

현재 작업 폴더 출력
현재 폴더의 파일 목록 출력
과제 6

csv 모듈을 이용하여 학생 성적을 score.csv 파일에 저장하세요.

과제 7

json 모듈을 이용하여 학생 정보를 student.json 파일에 저장하고 다시 읽어 출력하세요.

과제 8

calculator.py 모듈을 직접 작성하세요.

def add(a,b):
   
def sub(a,b):
   
def mul(a,b):
    

def div(a,b):
   

main.py에서 불러와 사용하세요.

과제 9

student.py 모듈을 작성하여 평균과 학점을 계산하는 함수를 구현하고 다른 파일에서 사용하세요.

과제 10

pathlib를 이용하여 output 폴더를 생성하고, 그 안에 result.txt 파일을 생성하여 "Python Module Practice"를 저장하세요.

🚀 종합 프로젝트
학생 성적 관리 시스템 (모듈 분리 버전)
프로젝트 구조
StudentProject/
│
├── main.py          # 메인 메뉴
├── student.py       # 학생 클래스
├── score.py         # 평균, 학점 계산
├── fileio.py        # 파일 저장/읽기
├── menu.py          # 메뉴 출력
├── utils.py         # 공통 함수
└── output/
    ├── students.csv
    └── log.txt
요구사항
학생 등록
학생 조회
학생 검색
평균 계산
CSV 저장
JSON 저장
프로그램 종료

각 기능을 별도의 모듈로 분리하여 구현하세요.


'''