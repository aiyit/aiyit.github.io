'''
#파이썬 파일 입출력(File Input / Output)
#1. 파일(File)이란?
파일(File)이란 데이터를 영구적으로 저장하는 공간.
프로그램이 종료되면 일반 변수는 모두 사라지지만, 파일에 저장한 데이터는 컴퓨터에 계속 남아 있음.

예를 들어,
학생 성적 저장
회원 정보 저장
로그 기록
설정값 저장  등은 모두 파일을 사용.

#2. 파일 입출력 과정
파일 열기(open)
       │
       ▼
읽기(Read) 또는 쓰기(Write)
       │
       ▼
파일 닫기(close)
#3. open() 함수 :파일을 열 때 사용하는 함수.
#파일객체 = open(파일명, 모드)

f = open("student.txt","r")
#4. 파일 모드
모드	의미	              파일 없으면
"r"	    읽기(Read)	         오류 발생
"w"	    쓰기(Write)	         새 파일 생성
"a"	    추가(Append)	        새 파일 생성
"x"	    새 파일 생성(Create)	이미 있으면 오류
"rb"	바이너리 읽기	        이미지 등
"wb"	바이너리 쓰기	        이미지 등
#5. 파일 쓰기(write)

f = open("output/hello.txt","w")
f.write("안녕하세요.")
f.close()

# output 폴더로 이동하여 hello.txt 확인

#6. 여러 줄 저장
f = open("output/student.txt","w")

f.write("홍길동\n")
f.write("김철수\n")
f.write("이영희\n")

f.close()

#7. 파일 읽기(read)
f = open("output/student.txt","r")
text = f.read()
print(text)
f.close()


#8. 한 줄씩 읽기(readline)
f = open("output/student.txt","r")

print(f.readline())
print(f.readline())
print(f.readline())

f.close()


#9. 모든 줄 읽기(readlines)
f = open("output/student.txt","r")

lines = f.readlines()

print(lines)

f.close()

#10. 반복문으로 읽기
f = open("output/student.txt","r")

for line in f:
    print(line.strip())

f.close()

#strip()은 줄 끝의 \n을 제거.

#11. append():기존 파일 뒤에 추가.

f = open("output/student.txt","a")

f.write("박민수\n")

f.close()

#12. with 문:자동으로 파일을 닫아줌.

with open("output/student.txt","r") as f:
    text = f.read()
print(text)

#close() 를 사용할 필요가 없음 실무에서는 with 문 사용을 권장.


#13. UTF-8 인코딩:한글을 저장할 때는 인코딩을 지정하는 것이 안전.

with open("output/student.txt","w",encoding="utf-8") as f:

    f.write("안녕하세요.")

#읽기

with open("output/student.txt","r",encoding="utf-8") as f:
    print(f.read())
   
#14. 학생 정보 저장
name = input("이름 : ")
score = input("점수 : ")

with open("output/student.txt","a",encoding="utf-8") as f:
    f.write(name+","+score+"\n")

#15. CSV 형태 저장:CSV는 쉼표로 구분된 파일#Excel에서 사용.

with open("output/score.csv","w",encoding="utf-8") as f:
    f.write("이름,Python,AI\n")
    f.write("홍길동,95,90\n")
    f.write("김철수,88,85\n")

#16. 파일 복사
with open("output/student.txt","r",encoding="utf-8") as source:
    with open("output/copy.txt","w",encoding="utf-8") as target:
        target.write(source.read())

#17. 학생 성적 관리
students = [
"홍길동,95",
"김철수,88",
"이영희,100"
]
with open("output/student.txt","w",encoding="utf-8") as f:
    for student in students:
        f.write(student+"\n")
#읽기
with open("output/student.txt","r",encoding="utf-8") as f:
    for line in f:
        name,score=line.strip().split(",")
        print(name,score) 

##18. 예외 처리 ##파일이 없으면 오류가 발생.
try:
    with open("output/test.txt","r") as f:
        print(f.read())
except FileNotFoundError:
    print("파일이 없습니다.")

### 19. 자주 발생하는 오류
###(1) 파일 닫지 않음  #f = open("a.txt","w")

##with open("a.txt","w") as f: (2) 잘못된 경로
##open("abc/test.txt") → 폴더가 없으면 오류

##(3) 인코딩 오류
##UnicodeDecodeError
##encoding="utf-8"  사용권장
## 20. 파일 입출력 흐름

##21. open() 주요 메서드
함수	        설명
open()	        파일 열기
read()	        전체 읽기
readline()	    한 줄 읽기
readlines()	    모든 줄 읽기
write()	        쓰기
writelines()	여러 줄 쓰기
close()	        파일 닫기

### 실습 과제
#과제 1
hello.txt 파일을 생성하고 다음 내용을 저장.

Hello Python
 I am AI Software
##과제 2
학생 이름 5명을 입력받아 student.txt에 저장.
##과제 3
student.txt의 내용을 모두 출력하세요.

##과제 4
사용자의 이름과 나이를 입력받아 member.txt에 저장.
저장 형식
홍길동,20
##과제 5 다음 파일을 생성하고 반복문으로 출력.
fruit.txt
사과
배
포도
복숭아

##과제 6
학생 점수 5개를 입력받아 파일에 저장한 후 평균을 계산하여 출력.

##과제 7  CSV 파일을 생성.

이름,Python,AI,Web
홍길동,95,90,88
김철수,88,84,80
##과제 8 파일을 복사하는 프로그램을 작성.

source.txt
↓
backup.txt
##과제 9
존재하지 않는 파일을 읽을 때 예외 처리(try-except)를 사용하여 "파일이 존재하지 않습니다."를 출력.

#과제 10
학생 정보를 입력받아 파일에 저장하고, 저장된 내용을 다시 읽어 표 형태로 출력.

출력 예시
========================================
이름        점수
========================================
홍길동      95
김철수      88
이영희      100
========================================


'''