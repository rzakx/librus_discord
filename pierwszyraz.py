import requests
import json
import sekrecik
from datetime import *

host = "https://api.librus.pl/"
naglowki={'Authorization': "Basic Mjg6ODRmZGQzYTg3YjAzZDNlYTZmZmU3NzdiNThiMzMyYjE="}

cosiek = requests.post(host + "OAuth/Token", data={"username": sekrecik.user, "password": sekrecik.passy, "librus_long_term_token": "1", "grant_type": "password"}, headers=naglowki)
if cosiek.ok:
	naglowki["Authorization"] = "Bearer " + cosiek.json()["access_token"]

def wybierz():
	print("Loguję")
	wynik = requests.get(host + "2.0/", headers=naglowki)
	if wynik.ok:
		print("Zalogowany")
		lekcyjki = requests.get(host + "2.0/Lessons", headers=naglowki)
		lekcjesyf = lekcyjki.json()["Lessons"]
		lekcjezbior = {}
		for lekcja in lekcjesyf:
			id = str(lekcja['Id'])
			nauczyciel_profil = lekcja['Teacher']['Url']
			zapytanie = requests.get(nauczyciel_profil, headers=naglowki).json()
			nauczyciel = zapytanie['User']['FirstName'] + " " + zapytanie['User']['LastName']
			temat_profil = lekcja['Subject']['Url']
			zapytanie = requests.get(temat_profil, headers=naglowki).json()
			temat = zapytanie['Subject']['Name']
			lekcjezbior[id] = {"Temat": temat, "Nauczyciel": nauczyciel}
		with open('przedmioty.json', 'w', encoding='utf-8') as f:
			json.dump(lekcjezbior, f, ensure_ascii=False, indent=4)
		zadanka = requests.get(host + "2.0/HomeWorkAssignments", headers=naglowki)
		zadaniasyf = zadanka.json()["HomeWorkAssignments"]
		zadania = {}
		for y in zadaniasyf:
			if y['DueDate'] < str(date.today()):
				break
			else:
				for x in y:
					if x == "Student" or x == "Category":
						continue
					elif x == "Id":
						idzadania = str(y[x])
					elif x == "Topic":
						temacior = y[x]
					elif x == "Text":
						tekscior = y[x]
					elif x == "Date":
						od = y[x]
					elif x == "DueDate":
						do = y[x]
					elif x == "Teacher":
						id_raw = y[x]
						id = id_raw['Id']
						zapytanie = requests.get(host + "2.0/Users/" + str(id), headers=naglowki).json()
						nauczyciel = zapytanie['User']['FirstName'] + " " + zapytanie['User']['LastName']
					elif x == "Lesson":
						id_raw = y[x]
						id = id_raw['Id']
						nazwalekcji = lekcjezbior[str(id)]['Temat']
					elif x == "AddedFiles":
						if y[x] == True:
							zalacznik = "Tak"
						if y[x] == False:
							zalacznik = "Nie"
					elif x == 'MustSendAttachFile':
						if y[x] == True:
							odeslanie = "Tak"
						if y[x] == False:
							odeslanie = "Nie"
				zadania[idzadania] = {"Nauczyciel": nauczyciel, "Przedmiot": nazwalekcji, "Temat": temacior, "Tekst": tekscior, "Wstawione": od, "Termin oddania": do, "Zalaczone": zalacznik, "Odeslanie": odeslanie}
		if len(zadania) > 0:
			with open('zadania.json', 'w', encoding='utf-8') as fF:
				json.dump(zadania, fF, ensure_ascii=False, indent=4)
		else:
			print("Brak zadan")
wybierz()