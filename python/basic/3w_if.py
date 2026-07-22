'''1. 조건문이란?

조건문(Conditional Statement)은 주어진 조건의 참(True) 또는 거짓(False)에 따라 
프로그램의 실행 흐름을 결정하는 문법.

예를 들어,

시험 점수가 90점 이상이면 A학점
나이가 19세 이상이면 성인
비가 오면 우산을 가져간다
로그인 정보가 맞으면 로그인 성공

핵심 개념

조건문은 비교 연산자와 논리 연산자를 이용하여 조건식을 만들고, 
그 결과(True/False)에 따라 실행할 코드를 선택.

2. 조건문의 종류
조건문	설명
if	조건이 참이면 실행
if ~ else	참과 거짓을 모두 처리
if ~ elif ~ else	여러 조건 중 하나 선택
중첩 if	조건문 안에 조건문 사용

#들여쓰기(Indentation) 파이썬은 중괄호({}) 대신 들여쓰기(보통 공백 4칸)로 코드 블록을 구분

score = 95

if score >= 90:
    print("A학점")

print("프로그램 종료")
#비교 연산자
비교 연산자
연산자	의미	    예
==	    같다	    a == b
!=  	다르다	    a != b
>	    크다	    a > b
<	    작다	    a < b
>=	    크거나 같다	a >= b
<=	    작거나 같다	a <= b

a = 10
b = 20

print(a == b)
print(a != b)
print(a > b)
print(a < b)

#if 문법
if 조건식:
    실행문

age = 20

if age >= 19:
    print("성인입니다.")
#if else 문법  
if 조건:
    실행문1
else:
    실행문2
score = 85

if score >= 60:
    print("합격")
else:
    print("불합격")
#if elif else 문법 
score = 87

if score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
elif score >= 60:
    print("D")
else:
    print("F")
#논리연산자

연산자      의미
and	        모두 참
or	        하나만 참
not	        참과 거짓 반대

age = 22
member = True

if age >= 20 and member:
    print("입장 가능합니다.")
  
password=input('password:')

if password == "1234":
    print("로그인 성공")
else:
    print("비밀번호 오류")

#중첩 if
age = 25
member = True

if age >= 20:
    if member:
        print("할인 적용")

        #리스트와 조건문
subjects = ["Python","AI","Web"]

if "Python" in subjects:
    print("수강 중입니다.")
#입력문과 조건문
score = int(input("점수를 입력하세요 : "))

if score >= 60:
    print("합격")
else:
    print("불합격")   

#even and odd
num = int(input("숫자 입력 : "))

if num % 2 == 0:
    print("짝수")
else:
    print("홀수") 
#로그인
id = input("아이디 : ")
pw = input("비밀번호 : ")

if id == "admin" and pw == "1234":
    print("로그인 성공")
else:
    print("로그인 실패")


#성적관리
name = input("이름 : ")
score = int(input("점수 : "))

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print("=" * 35)
print("학생 성적")
print("=" * 35)
print(f"이름 : {name}")
print(f"점수 : {score}")
print(f"학점 : {grade}")
print("=" * 35)

### 과제
실습 과제
#과제 1 (기초)

사용자의 나이를 입력받아 다음과 같이 출력하세요.

19세 이상 → 성인
19세 미만 → 미성년자
#과제 2 (짝수/홀수)

정수를 입력받아 짝수인지 홀수인지 출력하세요.

#과제 3 (성적)

점수를 입력받아 학점을 출력하세요.

점수	학점
90~100	A
80~89	B
70~79	C
60~69	D
0~59	F
#과제 4 (윤년 판별)

연도를 입력받아 윤년인지 판별하세요.

힌트: 윤년은 4의 배수이면서 100의 배수가 아니거나, 400의 배수입니다.

#과제 5 (계산기)

두 수와 연산자(+, -, *, /)를 입력받아 계산 결과를 출력하세요.

예시

첫 번째 수 : 20
두 번째 수 : 5
연산자 : *

결과 : 100
'''