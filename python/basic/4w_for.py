'''
1. 반복문이란?

반복문(Loop)이란 같은 작업을 여러 번 반복해서 실행하는 문법.

예를 들어,

학생 30명의 점수 출력
1부터 100까지의 합 계산
구구단 출력
파일의 모든 줄 읽기
리스트의 모든 요소 출력

처럼 동일하거나 유사한 작업을 반복 수행할 때 사용.

핵심 개념

반복문은 **반복 횟수가 정해진 경우(for)**와 **조건이 만족하는 동안 반복하는 경우(while)**로 나눔.

2.반복문의 종류
반복문      	설명	                                     사용 시기
for	            정해진 횟수 또는 데이터 개수만큼 반복	       리스트, 문자열, 범위(range) 순회
while	        조건이 참(True)인 동안 반복	                  종료 시점을 조건으로 제어할 때
중첩 반복문	    반복문 안에 반복문 사용	                       구구단, 별 출력, 2차원 데이터 처리

# for
# for 변수 in 반복가능한객체:
        실행문

        
반복 가능한 객체(Iterable)

문자열(str),리스트(list),튜플(tuple),딕셔너리(dict),집합(set),range()
# range() 함수

range()는 일정한 범위의 숫자를 생성하는 함수.

함수	        생성 값
range(5)	    0,1,2,3,4
range(1,6)	    1,2,3,4,5
range(2,11,2)	2,4,6,8,10

for i in range(5):
    print(i)

for i in range(1,6):
    print(i)
#문자열 반복
word = "Python"
#리스트 반복
for ch in word:
    print(ch)
    subjects = ["Python","AI","Web"]

for subject in subjects:
    print(subject)
#튜플 반복
colors = ("Red","Green","Blue")

for color in colors:
    print(color)

#########딕션너리 반복
student = {
    "이름":"홍길동",
    "학년":1,
    "학과":"AI"
}

for key, value in student.items():
    print(key, value)

#합계
total = 0

for i in range(1,11):
    total += i

print(total)
#평균
score = [90,85,100,95]

average = sum(score)/len(score)

print(average)

total = 0

for s in score:
    total += s

print(total/len(score))
############ while 문
while 조건:
    실행문

i = 1

while i <= 5:
    print(i)
    i += 1   
#무한반복  Ctrl+C 종료
while True:
    print("계속 실행") 
#break
for i in range(1,11):

    if i == 6:
        break

    print(i)
#continue : 현재 반복만 건너뛰고 다음 반복을 실행
for i in range(1,6):

    if i == 3:
        continue

    print(i) 
#중첩
for i in range(3):
    for j in range(2):
        print(i, j)  
#구구단
for dan in range(2,10):

    print(f"[{dan}단]")

    for i in range(1,10):
        print(f"{dan} × {i} = {dan*i}")

    print()   
#삼각별모양  
for i in range(1,6):
    print("*"*i)    
#enumerate() :인덱스와 값을 동시에 가져옵
subjects = ["Python","AI","Web"]

for index, subject in enumerate(subjects):
    print(index, subject)
  
#학생성적
students = {
    "홍길동":95,
    "김철수":88,
    "이영희":100
}

print("="*35)

for name, score in students.items():

    print(f"{name:10} {score}")

print("="*35)

#for와 while 비교
항목	for	while
반복 횟수	정해짐	조건에 따라 달라짐
증가값	자동	직접 작성
사용 예	리스트, 문자열, range	메뉴 반복, 게임, 로그인

과제 1 (기초)

1부터 10까지 출력하세요.

과제 2

1부터 100까지의 합을 구하세요.

과제 3

1부터 100까지의 짝수만 출력하세요.

과제 4

구구단 7단을 출력하세요.
과제 5

사용자가 0을 입력할 때까지 숫자를 계속 입력받고, 입력한 숫자의 합을 출력하세요.

예시

숫자 : 10
숫자 : 5
숫자 : 8
숫자 : 0

합계 : 23
과제 5

학생 이름과 점수를 딕셔너리로 저장한 후, 90점 이상인 학생만 출력하세요.

students = {
    "홍길동":95,
    "김철수":88,
    "이영희":100,
    "박민수":75
}
'''


