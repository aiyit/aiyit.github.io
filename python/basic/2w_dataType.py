'''
1. 자료형(Data Type)이란?

자료형(Data Type)이란 프로그램에서 데이터를 저장하고 처리하는 방식을 의미. 
컴퓨터는 모든 데이터를 0과 1의 이진수로 처리하지만, 
프로그래밍 언어에서는 데이터를 효율적으로 다루기 위해 정수, 실수, 문자열, 논리값 등 다양한 자료형을 제공.

예를 들어,

나이 → 정수(int)
키 → 실수(float)
이름 → 문자열(str)
합격 여부 → 논리형(bool)

2. 자료형 종류
자료의 종류에 따라 적절한 자료형을 선택
| 자료형 | 의미   | 예시             |
| ----- | ----   | --------------    |
| int   | 정수   | 10, -5, 1000     |
| float | 실수   | 3.14, -2.5       |
| str   | 문자열  | "Python", "AI"  |
| bool  | 논리형  | True, False     |
| list  | 리스트  | [10,20,30]       |
| tuple | 튜플   | (10,20,30)       |
| dict  | 딕셔너리 | {"이름":"홍길동"}   |
| set   | 집합   | {1,2,3}           |

# 정수형
a = 100
b = -25
c = 0

print(a)
print(b)
print(c)

# 연산
a = 20
b = 7

print(a+b)
print(a-b)
print(a*b)
print(a/b)
print(a//b)
print(a%b)
print(a**b)

# 실수
height = 175.3
weight = 68.5

print(height)
print(weight)

pi = 3.141592

print(pi)
print(round(pi,2))
#문자열 반복과 길이, 인덱스,슬라이싱
print("*"*20)

text="Python"
print(len(text))

word="Python"

print(word[0])
print(word[1])
print(word[-1])
print(word[0:3])
print(word[2:])
print(word[:4])
#논리형
a=10
b=20

print(a>b)
print(a<b)
print(a==b)

#리스트 :여러 개의 데이터를 저장하는 가장 많이 사용하는 자료형
score=[90,85,100,95]
print(score)
print(score[0])
print(score[3])
score[1]=88
print(score)

score.append(77)
print(score)
score.remove(95)
print(score)

#튜플(Tuple) : 리스트와 비슷하지만 수정이 불가능

color=("red","green","blue")
print(color)
color[0]="black"  #에러 발생

# 딕셔너리(Dictionary) : 키(Key)-값(Value) 형태
student={
    "이름":"홍길동",
    "학년":1,
    "평점":4.2
}

print(student)

print(student["이름"])# 값 가져오기
student["학과"]="AI" # 추가
student["학년"]=2 # 수정

# 집합(Set) :중복을 허용하지 않음
num={1,2,3,3,2,1}

print(num)
num.add(5) #추가
num.remove(2) #삭제

#자료형 확인
a=100
b=3.14
c="Python"
d=True

print(type(a))
print(type(b))
print(type(c))
print(type(d))

#자료형 변환
a="100"
print(int(a)+50)
a=100
print(str(a)+"점")
print(float(100))
print(int(3.99))

# 종합예제
student={
    "이름":"홍길동",
    "학과":"AI소프트웨어과",
    "학년":1,
    "평점":4.35,
    "과목":["Python","AI","Web"],
    "장학금":True
}

print("="*35)
print("학생 정보")
print("="*35)
print("이름 :",student["이름"])
print("학과 :",student["학과"])
print("학년 :",student["학년"])
print("평점 :",student["평점"])
print("과목 :",student["과목"])
print("장학금 :",student["장학금"])
print("="*35)

과제 1 (기초)

다음 자료형을 각각 변수에 저장하고 출력하세요.

이름
나이
키
몸무게
졸업여부(True/False)

과제2 문자열
AI Software

첫 번째 문자
마지막 문자
"Software"만 출력
문자열 길이 출력
#과제 3 리스트
score=[80,90,95,88]
첫 번째 점수 출력
마지막 점수 출력
점수 하나 추가
두 번째 점수 수정
평균 점수 출력 (sum()과 len() 활용)
#과제 4 튜플
fruit=("사과","배","포도","복숭아")
첫 번째 과일 출력
마지막 과일 출력
튜플은 수정할 수 없는 이유를 설명.

#과제5 딕셔너리
다음 정보를 저장하고 출력.

이름
학번
학과
학년
평균평점

추가로 "전화번호" 항목을 추가

#고급 과제

# ============================================
# 학생 정보관리 프로그램
# 작성자 : AI소프트웨어과
# ============================================

# -----------------------------
# 기본 정보
# -----------------------------
student = {
    "학번": "20260001",
    "이름": "홍길동",
    "학과": "AI소프트웨어과",
    "학년": 1,
    "평점": 4.35,
    "장학금": True
}

# -----------------------------
# 튜플(생년월일)
# -----------------------------
birthday = (2007, 5, 12)

# -----------------------------
# 리스트(수강과목)
# -----------------------------
subjects = [
    "Python",
    "웹프로그래밍",
    "인공지능개론",
    "데이터분석"
]

# -----------------------------
# 집합(동아리)
# 중복 자동 제거
# -----------------------------
clubs = {
    "AI",
    "드론",
    "AI",
    "드론",
    "축구"
}

# -----------------------------
# 출력
# -----------------------------
print("="*45)
print("         학생 정보 관리 시스템")
print("="*45)

print(f"학번      : {student['학번']}")
print(f"이름      : {student['이름']}")
print(f"학과      : {student['학과']}")
print(f"학년      : {student['학년']}")
print(f"평점      : {student['평점']:.2f}")
print(f"장학금    : {student['장학금']}")

print("-"*45)

print(f"생년월일  : {birthday[0]}년 {birthday[1]}월 {birthday[2]}일")

print("-"*45)

print("수강 과목")

for subject in subjects:
    print("  ●", subject)

print("-"*45)

print("동아리")

for club in clubs:
    print("  ■", club)

print("="*45)
'''
#사용자 입력
student = {}

student["학번"] = input("학번 : ")
student["이름"] = input("이름 : ")
student["학과"] = input("학과 : ")
student["학년"] = int(input("학년 : "))
student["평점"] = float(input("평점 : "))

print("\n" + "="*40)
print("입력된 학생 정보")
print("="*40)

for key, value in student.items():
    print(f"{key:8} : {value}")

print("="*40)
