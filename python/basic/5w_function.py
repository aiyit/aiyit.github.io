'''
1. 함수(Function)란?

함수(Function)란 특정 작업을 수행하도록 만들어 놓은 코드의 묶음.

쉽게 말하면 필요할 때마다 불러서 사용할 수 있는 프로그램의 부품(모듈).

예를 들어 학생의 평균을 계산하는 코드가 여러 곳에서 필요하다면 매번 작성하는 대신 평균 계산 함수를 만들어 사용

2. 함수를 사용하는 이유

함수를 사용하는 가장 큰 이유는 코드의 재사용성, 가독성, 유지보수성 향상.

장점	        설명
코드 재사용	    같은 코드를 여러 번 작성하지 않음
가독성 향상	    프로그램 구조를 이해하기 쉬움
유지보수 용이	한 곳만 수정하면 전체에 반영
모듈화	        기능별로 나누어 개발 가능
협업	        여러 사람이 기능별 개발 가능

3. 문법 형식
def 함수이름(매개변수):
    실행문
    return 반환값
| 요소              | 설명              |
| ---------------   | ---------        |
| `def`             | 함수 정의 키워드   |
| 함수이름           | 함수의 이름       |
| 매개변수(Parameter)| 입력값            |
| return            | 결과 반환         |

def hello():
    print("안녕하세요.")
hello()

#매개변수
def hello(name):
    print(name, "님 반갑습니다.")
hello("홍길동")
hello("김철수")

#여러 매개변수
def add(a, b):
    print(a+b)

add(10,20)
#반환값 :
def add(a,b):
    return a+b

result = add(10,20)

print(result)

#기본 매개변수
def greet(name="학생"):
    print(name,"환영합니다.")

greet()
greet("홍길동")

#키워드 인수
def student(name,age):

    print(name)
    print(age)

student(age=20,name="홍길동")

#지역 변수와 전역 변수
x=100
def test():
    x=50
    print(x)

test()

def test():
    print(x)

test()

#여러개의 반환값
def calc(a,b):
    return a+b,a-b,a*b

x,y,z=calc(20,10)

print(x)
print(y)
print(z)
print(x,y,z)

#함수와 반복문
def star():
    for i in range(5):
        print("*"*5)

star()
#함수와 조건문
def grade(score):

    if score>=90:
        return "A"
    elif score>=80:
        return "B"
    elif score>=70:
        return "C"
    elif score>=60:
        return "D"
    else:
        return "F"

print(grade(87))

#리스트 전달 함수
def average(score):
    return sum(score)/len(score)

score=[90,80,100]

print(average(score))
#리스트 전달 함수2
def student_info(name,major,grade):

    print("="*35)
    print("학생 정보")
    print("="*35)
    print("이름 :",name)
    print("학과 :",major)
    print("학년 :",grade)
    print("="*35)

student_info("홍길동","AI소프트웨어과",1)

#함수 실습 : 학생 성적
def average(scores):
    return sum(scores)/len(scores)

def grade(avg):

    if avg>=90:
        return "A"
    elif avg>=80:
        return "B"
    elif avg>=70:
        return "C"
    elif avg>=60:
        return "D"
    else:
        return "F"

name=input("이름 : ")

scores=[]

for i in range(3):
    score=int(input(f"{i+1}번째 점수 : "))
    scores.append(score)

avg=average(scores)

print("="*35)
print("학생 성적")
print("="*35)
print("이름 :",name)
print("평균 :",round(avg,2))
print("학점 :",grade(avg))
print("="*35)

# 내장함수
| 함수       | 기능     |
| -------- | ------ |
| print()  | 출력     |
| input()  | 입력     |
| len()    | 길이     |
| sum()    | 합계     |
| max()    | 최대값    |
| min()    | 최소값    |
| abs()    | 절댓값    |
| round()  | 반올림    |
| type()   | 자료형 확인 |
| sorted() | 정렬     |

score=[90,80,100]

print(sum(score))
print(max(score))
print(min(score))
print(len(score))

#자주사용하는 내장함수
| 함수          | 입력       | 반환값     | 활용 분야  |
| ----------- | --------    | ------- | ------ |
| print()     | 출력할 값    | 없음      | 출력          |
| input()     | 안내문        | 문자열     | 입력         |
| len()       | 문자열, 리스트 | 길이      | 개수 계산     |
| sum()       | 리스트         | 합계      | 총점     |
| max()       | 리스트       | 최대값     | 최고 점수  |
| min()       | 리스트       | 최소값     | 최저 점수  |
| abs()       | 숫자         | 절댓값     | 수학 계산  |
| round()     | 숫자         | 반올림     | 평균 계산  |
| sorted()    | 리스트       | 정렬된 리스트 | 데이터 정렬 |
| enumerate() | 반복 객체     | 인덱스와 값  | 반복문    |
| zip()       | 여러 리스트   | 묶음      | 데이터 결합 |

###실습 과제
#과제 1

이름을 입력받아 출력하는 hello() 함수를 작성하세요.

#과제 2

두 수를 입력받아 더하는 add() 함수를 작성하세요.

예시

10 + 20 = 30
#과제 3

원의 넓이를 계산하는 함수를 작성하세요.

def circle_area(radius):
공식:넓이=π×r^2 (π는 3.141592를 사용)

#과제 4
세 과목의 점수를 입력받아 평균을 계산하는 함수를 작성하세요.
average(kor, eng, python)
#과제 5
숫자를 입력받아 짝수인지 홀수인지 판별하는 함수를 작성하세요.
#과제 6
리스트를 입력받아 최대값과 최소값을 반환하는 함수를 작성하세요.
예시 : score=[90,75,88,100]
max_min(score)
#과제 7
학생 이름과 점수를 입력받아 학점을 반환하는 함수를 작성하세요.
#과제 8
구구단을 출력하는 함수를 작성하세요.
예시:gugudan(7)
출력
7 × 1 = 7
...
7 × 9 = 63
#과제 9
계산기 함수를 작성하세요.
calculator(a,b,op)
#과제 10
리스트를 입력받아 값의 평균과 학점을 동시에 반환하는 함수를 작성하세요.
예시
score=[95,88,91]
avg, grade = student(score)

'''
