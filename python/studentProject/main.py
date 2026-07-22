from student import Student
from score import calculate_average, calculate_grade
from fileio import save_csv, save_json
from menu import show_menu
from utils import log

students = []

while True:
    show_menu()
    choice = input("메뉴 선택: ")

    if choice == "1":
        name = input("학생 이름: ")
        scores = list(map(int, input("3과목 점수 입력(공백 구분): ").split()))
        students.append(Student(name, scores))
        log(f"학생 등록: {name}")

    elif choice == "2":
        for s in students:
            print(s)

    elif choice == "3":
        search_name = input("검색할 이름: ")
        found = [s for s in students if s.name == search_name]
        print(found if found else "학생 없음")

    elif choice == "4":
        for s in students:
            avg = calculate_average(s.scores)
            grade = calculate_grade(avg)
            print(f"{s.name} 평균: {avg:.2f}, 학점: {grade}")

    elif choice == "5":
        save_csv(students)
        print("CSV 저장 완료")

    elif choice == "6":
        save_json(students)
        print("JSON 저장 완료")

    elif choice == "7":
        print("프로그램 종료")
        break

    else:
        print("잘못된 입력입니다.")
