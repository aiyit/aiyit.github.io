'''
#1. 클래스(Class)란?
클래스(Class)는 객체(Object)를 만들기 위한 설계도(Template 또는 Blueprint).
현실 세계를 예로 들면, 자동차를 만들기 전에 자동차 설계도가 필요하듯이, 
프로그램에서도 객체를 만들기 위한 설계도가 클래스.

클래스(Class) → 설계도 📐
객체(Object) → 실제 만들어진 제품 
인스턴스(Instance) → 클래스로부터 생성된 객체
실생활 예시
             자동차 설계도(Class)
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼
   자동차1       자동차2       자동차3
 (Object)      (Object)      (Object)

학생(Student) 클래스를 만들면,
홍길동 학생
김철수 학생
이영희 학생
을 각각 객체(인스턴스)로 생성.

#2. 객체지향 프로그래밍(OOP)
객체지향 프로그래밍(Object-Oriented Programming)은 데이터를 객체 단위로 관리하는 프로그래밍 방법.

개념	        설명
클래스(Class)	객체를 만들기 위한 설계도
객체(Object)	클래스로 생성된 실제 데이터
인스턴스(Instance)	생성된 객체
속성(Attribute)	객체가 가지는 데이터
메서드(Method)	객체가 수행하는 기능(함수)
#3. 클래스 만들기
#class 클래스이름:
    def 메서드(self):
        실행문

class Student:
    def hello(self):
        print("안녕하세요.")
#객체 생성
s = Student()
s.hello()

#4. 생성자(Constructor):객체가 생성될 때 자동으로 실행되는 메서드를 생성자.
생성자는 __init__() 메서드를 사용.
class Student:
    def __init__(self):
        print("학생 객체 생성")
#객체 생성
s = Student()

#5. 속성(Attribute):객체의 데이터를 저장하는 변수.
class Student:
    def __init__(self):
        self.name = "홍길동"
        self.score = 95
student = Student()

print(student.name)
print(student.score)

#6. 매개변수를 사용하는 생성자
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

#객체 생성
s1 = Student("홍길동",95)
s2 = Student("김철수",88)

print(s1.name)
print(s2.score)

#7. 메서드(Method):클래스 안에 정의된 함수를 메서드(Method).
class Student:
    def __init__(self,name):
        self.name=name
    def hello(self):
        print(self.name,"학생 안녕하세요.")

student = Student("홍길동")
student.hello()

#8. self:self는 현재 객체 자신을 가리키는 참조 변수입니다.
class Student:
    def __init__(self,name):
        self.name = name

s = Student("홍길동")

#여기서 self.name은 s.name과 같음.

#9. 여러 개의 객체 생성
class Student:
    def __init__(self,name):
        self.name=name
students=[Student("홍길동"),Student("김철수"),Student("이영희")]

for student in students:
    print(student.name)

#10. 학생 성적 클래스
class Student:
    def __init__(self,name,python,ai):
        self.name=name
        self.python=python
        self.ai=ai

    def average(self):
        return (self.python+self.ai)/2
student=Student("홍길동",95,90)
print(student.average())

#11. 여러 메서드
class Calculator:
    def add(self,a,b):
        return a+b
    def sub(self,a,b):
        return a-b
    def mul(self,a,b):
        return a*b

calc=Calculator()

print(calc.add(10,20))
print(calc.sub(20,10))

#12. 클래스와 리스트
students=[]
students.append(Student("홍길동",95,90))
students.append(Student("김철수",88,80))
students.append(Student("이영희",100,98))

for student in students:
    print(student.name, student.average())

#13. 클래스 상속(Inheritance):상속은 기존 클래스의 기능을 물려받는 기능.
class Person:
    def hello(self):
        print("안녕하세요.")
#상속
class Student(Person):
    pass

student=Student()
student.hello()

#14. 메서드 오버라이딩:부모 클래스의 메서드를 자식 클래스에서 재정의.
class Animal:
    def sound(self):
        print("동물 소리")
class Dog(Animal):
    def sound(self):
        print("멍멍")
dog=Dog()
dog.sound()

#15. 클래스 다이어그램(UML)
+---------------------------+
|         Student           |
+---------------------------+
| - name : str              |
| - python : int            |
| - ai : int                |
+---------------------------+
| + average() : float       |
| + print_info() : void     |
+---------------------------+

#16. 학생 관리 프로그램
class Student:
    def __init__(self,name,python,ai,web):
        self.name=name
        self.python=python
        self.ai=ai
        self.web=web
    def average(self):
        return (self.python+self.ai+self.web)/3
    def grade(self):
        avg=self.average()
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
    def print_info(self):
        print("="*40)
        print("이름 :",self.name)
        print("Python :",self.python)
        print("AI :",self.ai)
        print("Web :",self.web)
        print("평균 :",round(self.average(),2))
        print("학점 :",self.grade())

students=[
Student("홍길동",95,90,88),
Student("김철수",88,84,80),
Student("이영희",100,98,99)
]

for student in students:
    student.print_info()

17. 클래스와 딕셔너리 비교
항목	        딕셔너리	    클래스
데이터 저장	    가능	        가능
함수 포함	    불가능	         가능(메서드)
재사용성	    낮음	       높음
대규모 프로그램	부적합	        적합
객체 생성	    불가능	       가능

#실습 과제
과제 1
Person 클래스를 작성하고 이름을 출력하는 introduce() 메서드를 구현.
과제 2
사칙연산을 수행하는 Calculator 클래스를 작성.
add()
sub()
mul()
div()
과제 3
Rectangle 클래스를 작성하여 가로와 세로를 입력받고 면적과 둘레를 계산하는 메서드를 구현.
과제 4
Circle 클래스를 작성하여 반지름을 입력받고 원의 넓이와 둘레를 계산.
과제 5
Car 클래스를 작성.
속성 : 제조사,모델명,연식,속도
메서드:accelerate(),brake(),info()
과제 6
학생 클래스를 작성하여 이름과 세 과목 점수를 저장하고 평균을 계산.
과제 7
학생 5명의 객체를 리스트에 저장하고 평균이 높은 순으로 출력.
과제 8
은행 계좌(BankAccount) 클래스를 작성.
메서드:입금,출금,잔액조회
과제 9
도서(Book) 클래스를 작성.
속성:제목,저자,가격
메서드:정보 출력
과제 10
Animal 클래스를 부모 클래스로 만들고 
Dog, Cat, Bird 클래스를 상속받아 각각 다른 울음소리를 출력하도록 구현.
'''