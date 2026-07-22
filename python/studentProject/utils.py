def log(message, filename="output/log.txt"):
    with open(filename, "a", encoding="utf-8") as f:
        f.write(message + "\n")
