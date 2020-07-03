# librus_discord
Zautomatyzowane zadania z Librusa na Discordzie

# Wymagania:
- Jakikolwiek serwer działający 24/7.
- Wykupiony mobilny dodatek Librus (daje dostęp do API).
- Python3
- NodeJS (NPM, Forever, discord.js)

# Instrukcja:
- Załóż konto bota Discord na stronie discordapp.com w zakładce dla developerów.
- Zaznacz permisje: pisania / czytania / odpowiedzi / oznaczania / wyświetlania kanałów.
- Zaznacz bota jako bot zwykły.
- Skopiuj TOKEN i podmień zawartość ostatniej linii pliku bot/index.js
- Aby bot dołączył na serwer discord trzeba wysłać właścicielowi serwera discord link z zakładki bota "OAuth" z także wybranymi permisjami.
- Teraz wrzuć pliki na serwer oraz zadbaj o to, aby skrypty uruchomiały się automatycznie.

W moim przypadku pomogło mi narzędzie w systemie Linux Debian: crontab.
Do edycji zaplanowanych zdarzeń crontab przechodzimy wpisując: crontab -e

Dodajemy takie wartości:

- */10 * * * * cd /folder_z_pythonem && python3 /folder_z_pythonem/librus.py
- @reboot cd /lokalizacja_bota/ && forever start index.js

Od teraz skrypt pythona będzie się włączał co 10 minut, a skrypt bota od discorda włączy się permanentnie przy samym boot up'ie serwera.
