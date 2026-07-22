import csv, json

def save_csv(students, filename="output/students.csv"):
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Name", "Scores"])
        for s in students:
            writer.writerow([s.name, s.scores])

def save_json(students, filename="output/students.json"):
    data = [{"name": s.name, "scores": s.scores} for s in students]
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
