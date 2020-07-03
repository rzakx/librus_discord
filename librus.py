import requests
import json
import sekrecik
from datetime import *

host = "https://api.librus.pl/" #link do API librusa
naglowki={'Authorization': "Basic Mjg6ODRmZGQzYTg3YjAzZDNlYTZmZmU3NzdiNThiMzMyYjE="} #jedyny oficjalny token do autoryzacji synergii z API
print("Loguję")
cosiek = requests.post(host + "OAuth/Token", data={"username": sekrecik.user, "password": sekrecik.passy, "librus_long_term_token": "1", "grant_type": "password"}, headers=naglowki) #logowanie na własne konto librus
if cosiek.ok:
	naglowki["Authorization"] = "Bearer " + cosiek.json()["access_token"] #jesli logowanie udane zapisz token zalogowanego konta dla nastepnych requestów
else:
	print("Błąd podczas logowania z Librusem. Sprawdz sekrecik.py") #jesli nieudane wyswietl błąd
def wybierz(): #przygotowanie funkcji
	wynik = requests.get(host + "2.0/", headers=naglowki) #sprawdzenie czy mamy dostep do głównego folderu API
	if wynik.ok:
		print("Zalogowany")
		try: #sprobuj otworzyc zapisane wczesniej zadania
			with open('zadania.json') as f:
				zadaniawczesniej = json.load(f)
		except:
			print("Brak pliku zadania.json, Uruchom pierwszyraz.py")
		try: #sprobuj otworzyc zapisane wczesniej id przedmiotow z nazwa ładną i nauczycielem prowadzacym przedmiot 
			with open('przedmioty.json') as nau:
				lekcjezbior = json.load(nau)
				print("\n\nPrzedmioty.json: ", lekcjezbior)
		except:
			print("Brak pliku przedmioty.json, Uruchom pierwszyraz.py")
			
		print("\n\nzadaniawczesniej: ", zadaniawczesniej)
		
		zadanka = requests.get(host + "2.0/HomeWorkAssignments", headers=naglowki) #wyslij żądanie aby uzyskac "zadania domowe"
		zadaniasyf = zadanka.json()["HomeWorkAssignments"] #otrzymana zawartosc z zapytania ma duzo niepotrzebnych rzeczy ktorych sie pozbedziemy
		zadania = {} #tworzymy pusta liste dla ładniejszej wersji zadan
		for y in zadaniasyf:
			if y['DueDate'] < str(date.today()): #sprawdz czy data zadania jest przestarzała
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
						id = id_raw['Id'] #zapis nauczyciela jest w postaci ID
						zapytanie = requests.get(host + "2.0/Users/" + str(id), headers=naglowki).json() #zapytajmy o wszystkei dane z profilu o tym ID
						nauczyciel = zapytanie['User']['FirstName'] + " " + zapytanie['User']['LastName'] #zapiszmy sobie tylko Imie i Nazwisko nauczyciela
					elif x == "Lesson":
						id_raw = y[x]
						id = id_raw['Id']
						nazwalekcji = lekcjezbior[str(id)]['Temat'] #zapis przedmiotu jest w postaci ID, my mamy juz nazwe ładną w pliku przedmioty.json
					elif x == "AddedFiles": #czy w zadaniu są jakieś załączniki?
						if y[x] == True:
							zalacznik = "Tak"
						if y[x] == False:
							zalacznik = "Nie"
					elif x == 'MustSendAttachFile': #czy odpowiedz wymagana jest do załączenia na librusie?
						if y[x] == True:
							odeslanie = "Tak"
						if y[x] == False:
							odeslanie = "Nie"
				#zapiszmy to wszystko ładnie w jedną liste i dodajmy tą listę do głównej listy
				zadania[idzadania] = {"Nauczyciel": nauczyciel, "Przedmiot": nazwalekcji, "Temat": temacior, "Tekst": tekscior, "Wstawione": od, "Termin oddania": do, "Zalaczone": zalacznik, "Odeslanie": odeslanie}
		for x in zadaniawczesniej: #sprawdzmy czy przed chwila dokonane sprawdzenie zadan rozni sie z zapisanymi w poprzednium uruchomieniu skryptu
			idprzedmiot = str(x)
			try:
				del(zadania[idprzedmiot]) #sprobuj usunac zadanie z poprzedniego uruchomienia w tym sprawdzeniu
			except:
				print("zadanie już po terminie") #zadanie w tym sprawdzeniu nie znajduje sie na liscie lub jest przestarzałe
		if len(zadania) > 0: #sprawdz czy lista nowych zadań ma jakiekolwiek elementy
			print("\n\nNowe zadania: ", zadania)
			with open('nowezad.json', 'w', encoding='utf-8') as fF: #zapisz je do pliku nowezad.json
				json.dump(zadania, fF, ensure_ascii=False, indent=4)
		else:
			print("\n\nBrak nowych zadan")
wybierz() #uruchomienie funkcji