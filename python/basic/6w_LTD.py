'''
1. 컬렉션(Collection)이란? List, Tuple, Dictionary

컬렉션(Collection)이란 여러 개의 데이터를 하나의 변수에 저장하는 자료형.

예를 들어 학생 30명의 이름을 저장하려면,

❌ 변수 30개를 만드는 것보다

name1 = "홍길동"
name2 = "김철수"
name3 = "이영희"
...

⭕ 하나의 리스트를 사용하는 것이 훨씬 효율적.

names = ["홍길동", "김철수", "이영희"]

자료형	    특징
List	    순서 O, 수정 O, 중복 O
Tuple	    순서 O, 수정 X, 중복 O
Dictionary	Key-Value 저장

2. 리스트(List)
리스트(List)는 여러 개의 데이터를 순서대로 저장하는 가장 많이 사용하는 자료형.

특징
순서가 있다.
인덱스(Index)를 가진다.
수정 가능
추가 가능
삭제 가능
중복 저장 가능

#리스트 생성
score = [90, 80, 100, 95]
fruit = ["사과", "배", "포도"]
mixed = [100, "Python", 3.14, True]

print(score)

#인덱스(Index):인덱스는 0부터 시작.

인덱스	값
0	    90
1	    80
2	    100
3	    95
score = [90,80,100,95]

print(score[0])
print(score[2])
print(score[-1])

#수정
score = [90,80,100]

score[1] = 85

print(score)

#추가
score.append(95)
print(score)

#삽입
score.insert(1,70)
print(score)

#삭제
score.remove(70)
del score[0]

#길이
print(len(score))

#반복문
for s in score:
    print(s)
#평균
average = sum(score)/len(score)
print(average)

#3. 튜플(Tuple):튜플은 리스트와 거의 같지만 한 번 생성되면 수정할 수 없는 자료형.
#생성

color = ("Red","Green","Blue")
print(color)
#접근
print(color[0])
print(color[2])

#수정 불가
color[0] = "Black"
결과
TypeError
#반복
for c in color:
    print(c)
#튜플 사용하는 이유:변경되면 안 되는 데이터를 저장합니다.
예)주민등록번호,생년월일,GPS 좌표,RGB 색상
#예제
birthday = (2006,5,18)
print(birthday)

5. 딕셔너리(Dictionary)
딕셔너리는 Key(키)와 Value(값)를 한 쌍으로 저장하는 자료형.
실생활의 사전(Dictionary)처럼 단어(Key)를 찾으면 값(Value)를 얻을 수 있음.

#생성
student = {
    "이름":"홍길동",
    "학과":"AI소프트웨어과",
    "학년":1,
    "평점":4.3
}
print(student)
print(student["이름"])

#추가
student["전화"] = "010-1111-2222"
#수정
student["학년"] = 2
#삭제
del student["평점"]
#모든 Key
print(student.keys())
#모든 Value
print(student.values())
#모두 출력
for key, value in student.items():
    print(key, value)

#6. 학생 정보 예제
student = {
    "학번":"20260001",
    "이름":"홍길동",
    "학과":"AI소프트웨어과",
    "학년":1,
    "평점":4.2
}

for key,value in student.items():
    print(f"{key} : {value}")

#7. 리스트 안의 딕셔너리:실무에서 가장 많이 사용하는 구조.
students = [
    {"이름":"홍길동","점수":95},
    {"이름":"김철수","점수":88},
    {"이름":"이영희","점수":100}
]
for student in students:

    print(student["이름"],student["점수"])

#8. 딕셔너리 안의 리스트
student = {
    "이름":"홍길동",
    "과목":["Python","AI","Web"]
}
print(student["과목"])
#9. 리스트와 딕셔너리 함께 활용
students = [
{"이름":"홍길동","점수":95},
{"이름":"김철수","점수":88},
{"이름":"이영희","점수":76}
]
total = 0
for student in students:
    total += student["점수"]

print(total/len(students))

#10. 학생 관리 프로그램
students = [
{"이름":"홍길동","Python":95,"AI":90},
{"이름":"김철수","Python":88,"AI":84},
{"이름":"이영희","Python":100,"AI":98}
]
print("="*40)
for student in students:
    average = (student["Python"] + student["AI"]) / 2
    print(student["이름"])
    print("Python :",student["Python"])
    print("AI :",student["AI"])
    print("평균 :",average)
    print("-"*40)
#실습 과제
과제 1
리스트를 생성하여
["Python","AI","Web","Database"]

다음을 수행.
첫 번째 과목 출력
마지막 과목 출력
"Java" 추가
"Web" 삭제

#과제 2
다음 튜플을 생성.
(2006,8,15)
년도 출력
월 출력
일 출력

#과제 3
학생 정보를 딕셔너리로 저장.

항목
이름
학번
학과
학년
평균평점

#과제 4
다음 리스트의 평균.

score = [95,88,100,75,82]
#과제 5
#리스트를 반복문으로 출력.

fruit = ["사과","배","포도","복숭아"]
#과제 6
다음 딕셔너리에서 모든 Key와 Value를 출력.
student = {
"이름":"홍길동",
"학과":"AI",
"학년":1
}
#과제 7
다음 학생 정보를 리스트 안의 딕셔너리 형태로 저장하고 출력.
이름	Python	AI
홍길동	95	90
김철수	88	85
이영희	100	98
#과제 8
학생 5명의 점수를 리스트에 저장한 후
총점
평균
최고점
최저점

을 출력.

#과제 9
다음 딕셔너리에 "전화번호"와 "이메일"을 추가.
student = {
"이름":"홍길동",
"학과":"AI"
}
#과제 10
학생 3명의 정보를 저장하고 평균 점수를 계산.
예시
students = [
{"이름":"홍길동","점수":95},
{"이름":"김철수","점수":88},
{"이름":"이영희","점수":100}
]

'''