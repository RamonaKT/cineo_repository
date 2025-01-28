Willkommen im Read me von unserem CINEO-Projekt. 
Dieses Repository ist das Ergebnis eines Gruppenprojekts von 5 Studenten, der DHBW Mannheim. 

Aufgaben und Ziele des Projekts:

Die Aufgabe des Projektes ist es ein funktionierendes Kinoticketbuchungsystem zu entwickeln, welches Frontend, Backend, Datenbank und einen Server mit konfigurierter CI/CD-Pipeline beinhaltet.

Ziel ist eine Kinoseite, welche auf einem Server gehostet wird und von der beliebig Tickets für abstrakte Vorstellungen und Sitzplätze gebucht werden können. 

Der Hauptfokus liegt darauf Doppelbuchungen zu vermeiden, sodass bereits reservierte Sitzplätze für eine Vorstellung nicht erneut gebucht werden können und kein 
Ticket mehr als einmal vergeben wird.

Eine weitere Anforderung, ist das Abdecken des Backend-Codes mit Unit Tests. Es soll eine ungefähre Code-Coverage von 60%-80% vorliegen. Der Fokus liegt auf der Logik der Backends, also
das saubere Beschaffen, Speichern und Verarbeiten von Daten. 

Sinn des Projekts:

Das Projekt dient dem Erlernen von grundlegenden Programmier- und Projektorganisationsfähigkeiten. Es geht ganz nach dem Motto 'learning by doing' und bietet den Studenten die Möglichkeit 
ein eigenes Projekt von Grund auf, selbstständig in die Hand zu nehmen und zu planen. 

Es gab bezüglich den genutzten Hard- und Softwarekomponenten keine bestimmten Vorgaben.
Abgesehen von den oben genannten Anforderungen, war die weitere Gestaltung und Ausarbeitung den Studenten überlassen und wurde frei nach Belieben priorisiert.



Aufbau des Projekts:

Das Projekt besteht aus Frontend, Backend, Datenbank und Server mit CI/CD. 
Die Ordnerstruktur ergibt sich aus: cineo_frontend, cineo_backend, images und cineo_tests.

Das Frontend ist mit HTML, CSS und Java Script erstellt. Dabei wurde alles bezüglich des Frondends in den cineo_frontend und images-Ordner hinzugefügt. Das Frontend wurde in Mainpages, Specialpages und 
Infopages unterteilt. Das dient der Ordnung und Priorisierung des Frontends. Die Mainpages dienen dem Hauptablauf der Ticketbuchung und sind unser Walking Skeleton für dieses Projekt.
Die Specialpages und Infopages sind nicht Teil des Walking-Skeletons, sondern eine freiwillige Erweiterung des Frontends, um weitere User Storys mit einzubinden und um eine abgeschlossene
Anwendererfahrung bieten zu können. 

Das Backend ist mit Node.js programmiert und ermöglicht den Austausch und die Verarbeitung der Daten zwischen Frontend und Datenbank.
Für diese Kommunikation werden URLs und API-Keys benötigt, die jeweils in einer gemeinsamen env-Datei gespeichert werden. Diese ist nicht im Github-Repository zu finden. 
Sämtliche Backend-bezogenen Dateien wurden im cineo_backend-Ordner abgelegt und API Anfragen (GET, POST, DELETE etc.) liegen im Ordner Controller. Die darin enthaltenen Controller sind in der server.js-Datei registriert und werden durch sie aufgerufen. Abgesehen von den registrierten Controllern enthält die server.js Datei Funktionen, um Daten aus der TMDB ("The Movie Database") abzurufen und in die Supabase Datenbank einzufügen. Hier werden die Filmdaten der ersten beiden "Popular"-Seiten der TMDB aufgerufen und in die eigene Datenbank eingetragen. 
Insgesamt bietet die Struktur Platz für weitere Dateien und Ordner, um die Ordnung zu erhalten.

Der Ordner cineo_tests entält alle Tests. Momentan wird nur backend getestet, aber die Struktur bietet Platz für frontend-Tests und ordnet die Tests zu dem jeweiligen Bereich der zu testenden Datei zu. Innerhalb des cineo_tests-Ordner wird daher grob die Projektstruktur nachgezeichnet. Test-Dateien haben den gleichen Namen wie die zu testende Datei, nur die Endung ist mit ".test.js" angepasst.

Der Server ist ein von Digital Ocean bereitgestellter Ubunto Server und ist nicht direkt in die Projektstruktur eingebunden, sondern mit dem Repository auf GitHub verknüpft. 
Die CICD läuft unter GitHubs Actions und wurde als Workflow in die Datei 'CICD-pipline.yml' eingebunden. 



Hilfe und Infos zum Projekt:

Hier finden Sie die benötigten Schritte um mit dem Projekt arbeiten zu können:
  1. Clonen des Repositories. - das Repository ist public und kann dementsprechend einfach mit dem HTTPS-Schlüssel: https://github.com/RamonaKT/cineo_repository.git geclont werden.
  2. Einrichten einer .env Datei. - um Zugriff auf die Datenbank auf Supabase zu erhalten, wird eine .env Datei mit dem SSH-Key benötigt. Diese wird aus Sicherheitsgründen durch die .gitignore
     Datei verborgen. Die .env Datei wird unter cineo_backend/src/ angelegt, mit der Bezeichnung '.env'. Der Schlüssel ist nur auf Anfrage bei den Mitwirkenden erhältlich, alternativ kann auch eine eigene 
     Datenbank eingebunden werden.
  3. Zusätzliche Installationen. -Um das Projekt zu öffnen navigieren Sie in die server.js Datei, welche im Ordner cineo_backend liegt. Diese Datei muss aufgeführt werden mit einem Klick
     auf den RUN button. Zu Begin werden verschiedene Fehlermeldungen kommen, da verschiedenen Abhängigkeiten installiert werden müssen. Die Konsole gibt Ihnen an um welche
     Abhängigkeiten es sich handelt. Navigieren Sie über die Konsole in den cineo_backend Ordner und starten sie die Installationen mit npm install. Danach klicken Sie erneut auf RUN
     und es werden ihnen weitere Abhängigkeiten, wie cors, axios, express und @supabase/supabase-js angegeben. Nach jeder Installation einmal erneut den RUN button klicken und das nächste
     Modul installieren, bis es klappt und die Daten aus der DB geladen werden. Dann einmal ganz nach oben in der Konsole scollen und auf den Link: "Server läuft auf http://localhost:4000" klicken.
     Nun sollte sich ein Fenster im Browser öffnen, in welchem die Startseite (homepageStrukture.html) des Projekts angezeigt wird. Eine weitere Option ist es den Browser mit dem Link "http://localhost:4000"
     manuell zu öffnen. Beim Starten des Servers, wird das Projekt nach einem Reload der Seite automatisch angezeigt.

     Nun kann mit dem Projekt gearbeitet und getestet werden.
     Viel Spass :)




Wer verwaltet das Projekt und trägt dazu bei?

Das Projekt wird von der Repositorybesitzerin RamonaKT verwaltet und weitere Mitwirkende sind die User: monika2611P, WeibchenL, thispauli und tomwbr650.



Wer kann an diesem Projekt mitwirken?

Außenstehende Mitwirkende sind für dieses Projekt nicht vorgesehen. Nach Belieben kann das öffentliche Repository gecloned und mit dem Code privat gearbeitet werden. 
