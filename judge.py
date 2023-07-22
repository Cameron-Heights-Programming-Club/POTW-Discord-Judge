import requests
from bs4 import BeautifulSoup
import json

with open('problemSets.json') as f:
  data = json.load(f)

user = input()

URL = "https://dmoj.ca/user/" + user + "/solved"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

fulltable = soup.find(id="submissions-table")

table = fulltable.find_all("div", class_="submission-row")

solved_list = []
score = 0
problems = {"10":0, "30":0, "60":0}
print(f"Summary of user {user}:\nProblems solved")
for element in table:
    clear = element.find("div", class_="sub-result AC")
    if clear:
        problem_data = "https://dmoj.ca" + element.find("div", class_="sub-main").find("div", class_="sub-info").find("div", class_="name").find("a").prettify().replace('"', "").split('href=')[1].split(">")[0]
        print(problem_data, "Full points")
        for key in data.keys():
            if problem_data in data[key]:
                score += int(key)
                problems[key] += 1
    else:
        partial = element.find("div", class_="sub-result TLE")
        if not(partial):
            partial = element.find("div", class_="sub-result WA")
        problem_data = "https://dmoj.ca" + element.find("div", class_="sub-main").find("div", class_="sub-info").find("div", class_="name").find("a").prettify().replace('"', "").split('href=')[1].split(">")[0]
        s = element.find("div", class_="score").prettify().split(">")[1].split("<")[0].replace("\n", "").replace(" ", "")
        print(problem_data, s)
        for key in data.keys():
            if problem_data in data[key]:
                score += int(key) * eval(s)
        #print(f"Partial points evaluated to be {int(key) * eval(s)}")
print()
for key in problems.keys():
    print(f"Number of {key}-point problems: {problems[key]}")
print(f"Score: {score}")