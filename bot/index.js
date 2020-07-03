'use strict';
const fs = require('fs'); //zaimportowanie biblioteki do operowania na plikach
const { Client, MessageEmbed } = require('discord.js'); //zaimportowanie biblioteki discord.js
const client = new Client();
var zmienne = {}; //zmienne globalne, aby kazda funkcja miala do tego dostep bez potrzeby przekazywania w nawiasie parametrow
zmienne.dzisduze = new Date();
zmienne.month = zmienne.dzisduze.getUTCMonth() + 1;
zmienne.day = zmienne.dzisduze.getUTCDate();
zmienne.year = zmienne.dzisduze.getUTCFullYear();
zmienne.dzis  = zmienne.year + "-" + ('0' + zmienne.month).slice(-2) + "-" + ('0' + zmienne.day).slice(-2);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);  //komunikat o pomyslnym logowaniu
	const channel = client.channels.cache.get('idkanalutekstowego'); //wprowadz id kanału tekstowego
	setInterval(function () {  //funkcja powtarzajaca sie w okreslonym czasie
		try { //sprobuj zrobic to:
			if(fs.existsSync("../nowezad.json")){ //jesli istnieje plik nowezad.json w folderze nadrzędnym to:
				zmienne.zadanska = require("../zadania.json"); //odczytaj wszystkie zadania wczesniejsze zapisane przez pythona
				zmienne.nowezad = require("../nowezad.json"); //odczytaj nowe zadania zapisane przez pythona
				console.log("Nowe zadanko!");
				channel.send("@everyone Nowe zadanko!"); //oznacz wszystkich aby dostali powiadomienie i powiedz ze jest nowe zadanie
				//petla dla kazdego nowego zadania (bo istnieje szansa ze moze byc kilka nowych zadan w pliku nowezad, nie tylko jedne
				for(var ajdi in zmienne.nowezad) {
					var zadanie = zmienne.nowezad[ajdi]; //wyciagniecie tabeli z dynamicznej tabeli za pomoca klucza glownego
					var tekscior = zadanie['Tekst']; //odwolanie sie do klucza Tekst w wyciagnietej tabeli
					var roznica = (new Date(zadanie['Termin oddania']) - new Date(zmienne.dzis)) / (24 * 3600 * 1000); //obliczenie roznicy terminu oddania z dniem dzisiejszym
					if(roznica <= 1){ //jesli oddac trzeba dzis lub jutro: kolor czerwony
						var kolorek = "#FF0000";
					}
					if(roznica > 1 && roznica <= 3){ //jesli oddac trzeba za 2-3 dni: kolor zolty
						var kolorek = "#FFFF00";
					}
					if(roznica > 3){ //jesli oddac trzeba za wiecej niz 3 dni: kolor zielony
						var kolorek = "#00FF00";
					}
					console.log(roznica);
					if(tekscior.length < 900){ //discord ma limit dlugosci znakow dla jednej wiadomosci, tu sprawdza czy zadanie nie przekracza wartosci i wysyla cale
						const embed = new MessageEmbed()
      							.setTitle(zadanie['Przedmiot'])
							.setAuthor(zadanie['Nauczyciel'])
      							.setColor(kolorek)
							.addField(zadanie['Temat'], tekscior)
							.addField("Wstawione", zadanie['Wstawione'], true)
							.addField("Termin oddania", zadanie["Termin oddania"])
							.addField("Załączone pliki", zadanie["Zalaczone"])
							.addField("Opcja odesłania na librusie", zadanie["Odeslanie"]);
						channel.send(embed);//wyslanie calej wiadomosci
					} else { //jesli zadanie ma cala zawartosc powyzej 900 znakow, trzeba je rozbic i wyslac w 2 wiadomosciach
						var polowa = Math.round(tekscior.length/2); //indeks dla polowy wiadomosci
						while(tekscior.charAt(polowa) != 0){ //unikniecie podzielenia wiadomosci na wyrazie (np. hej wszystkim, mogloby byc wyslane jako: 1) hej wsz 2) ystkim )
							polowa = polowa - 1; //odejmuj indeks az znajdzie spacje na ktorej mozna podzielic wiadomosc
						}
						var tekst1 = tekscior.substr(0, polowa); //przypisanie 1 czesci tekstu dla 1 wiadomosci
						var tekst2 = tekscior.substr(polowa); //przypisanie 2 czesci tekstu dla 2 wiadomosci
						const embed = new MessageEmbed()
							.setTitle(zadanie['Przedmiot'])
							.setAuthor(zadanie['Nauczyciel'])
							.setColor(kolorek)
							.addField(zadanie['Temat'], tekst1);
						channel.send(embed); //wyslanie 1 wiadomosci
						const embed2 = new MessageEmbed()
							.addField("ciąg dalszy górnego:", tekst2)
							.setColor(kolorek)
							.addField("Wstawione", zadanie['Wstawione'], true)
							.addField("Termin oddania", zadanie["Termin oddania"])
							.addField("Załączone pliki", zadanie["Zalaczone"])
							.addField("Opcja odesłania na librusie", zadanie["Odeslanie"]);
						channel.send(embed2); //wyslanie 2 wiadomosci
					}
				}
				var wszystkie = Object.assign(zmienne.zadanska, zmienne.nowezad); //scalenie nowych zadan ze starymi
				var wszystkiejson = JSON.stringify(wszystkie); //zamienienie tabeli na strukture json
				fs.writeFile("../zadania.json", wszystkiejson, 'utf8', function (err) { //zapisanie do pliku
					if(err){
						console.error(err);
					}
				});
				zmienne.zadanska.length = 0; //zresetowanie zmiennej zadan wczesniejszych dla skryptu
				zmienne.nowezad.length = 0; //zresetowanie zmiennej nowych zadan dla skryptu
			}
			fs.unlinkSync("../nowezad.json"); //usun plik nowezad.json aby bot się nie odpalał, zadania zostaly juz wczesniej scalone i nie wysyłał tego samego znowu
		} catch {
			//jesli nie ma pliku nowezad.json, nie rob nic :)
		}
	}, 60000); //okreslenie czestotliwosci sprawdzania przez BOTa, w tym przypadku 1 minuta
});

client.on('message', msg => { //reagowanie na wiadomosci
	if(msg.content === "@Librusik" || msg.content === "Librusik"){
		msg.reply('co chcesz?');
		msg.channel.send('dawaj zadania - wypisuje zadania z librusa');
	}
	if (msg.content === 'dawaj zadania') {
		zmienne.zadanska = require("../zadania.json");
		var autorr = msg.author; //zapisujemy ID osoby ktora poprosila o zadania, aby nie robic spamu innym uzytkownikom, wysylajac wszystkie zadania na prywatnej wiadomosci
		console.log(autorr);
		for(var ajdi in zmienne.zadanska) {
			var zadanie = zmienne.zadanska[ajdi];
			var tekscior = zadanie['Tekst'];
			var roznica = (new Date(zadanie['Termin oddania']) - new Date(zmienne.dzis)) / (24 * 3600 * 1000);
			if(roznica <= 1){
				var kolorek = "#FF0000";
			}
			if(roznica > 1 && roznica <= 3){
				var kolorek = "#FFFF00";
			}
			if(roznica > 3){
				var kolorek = "#00FF00";
			}
			console.log(roznica);
			if(tekscior.length < 900){
				const embed = new MessageEmbed()
      					.setTitle(zadanie['Przedmiot'])
					.setAuthor(zadanie['Nauczyciel'])
      					.setColor(kolorek)
					.addField(zadanie['Temat'], tekscior)
					.addField("Wstawione", zadanie['Wstawione'], true)
					.addField("Termin oddania", zadanie["Termin oddania"])
					.addField("Załączone pliki", zadanie["Zalaczone"])
					.addField("Opcja odesłania na librusie", zadanie["Odeslanie"]);
				autorr.send(embed);
			} else {
				var polowa = Math.round(tekscior.length/2);
				while(tekscior.charAt(polowa) != 0){
					polowa = polowa - 1;
				}
				var tekst1 = tekscior.substr(0, polowa);
				var tekst2 = tekscior.substr(polowa);
				const embed = new MessageEmbed()
					.setTitle(zadanie['Przedmiot'])
					.setAuthor(zadanie['Nauczyciel'])
					.setColor(kolorek)
					.addField(zadanie['Temat'], tekst1);
				autorr.send(embed);
				const embed2 = new MessageEmbed()
					.addField("ciąg dalszy górnego:", tekst2)
					.setColor(kolorek)
					.addField("Wstawione", zadanie['Wstawione'], true)
					.addField("Termin oddania", zadanie["Termin oddania"])
					.addField("Załączone pliki", zadanie["Zalaczone"])
					.addField("Opcja odesłania na librusie", zadanie["Odeslanie"]);
				autorr.send(embed2);
			}
		}
		msg.channel.send("Wysłano na priv!"); //tam gdzie osoba poprosila o zadania, poinformuj ze wyslano mu je na priv
		autorr.send("To wszystko!");//po wypisaniu wszystkich zadan na priv, oznajmij ze to wszystko
	}
});

client.login('tutaj_trzeba_podac_uniwersalny_token_przy_tworzeniu_konta_bot_z_zakladki_developers_na_stronie_discord');