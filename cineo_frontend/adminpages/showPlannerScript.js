document.addEventListener('DOMContentLoaded', async () => {
    const movieDropdown = document.getElementById('movieId');
    const roomDropdown = document.getElementById('room_id');
    const dateInput = document.getElementById('date');
    const timeDropdown = document.getElementById('time');
    const form = document.getElementById('show-form');
    const responseMessage = document.getElementById('response-message');

    const showList = document.getElementById('show-list');
    const deleteButton = document.getElementById('delete-show-button');
    const deleteResponseMessage = document.getElementById('delete-response-message');
    let selectedShowId = null;

    let allShows = []; // Enthält alle Vorstellungen
    let filteredShows = []; // Enthält gefilterte Vorstellungen


    async function loadMovies() {
        try {
            const response = await fetch('/api/alleFilme'); // API-Endpunkt für Filme
            const movies = await response.json();

            if (response.ok) {
                // Filme nach Titel alphabetisch sortieren
                movies.sort((a, b) => a.title.localeCompare(b.title, 'de', { sensitivity: 'base' }));

                // Speichert alle Filme für die Suche
                const movieSearchInput = document.getElementById('movieSearch');
                const movieDropdown = document.getElementById('movieId');
                movieDropdown.innerHTML = '<option value="">Film auswählen</option>'; // Reset Dropdown

                // Funktion zum Hinzufügen von Filmen zum Dropdown
                const addMoviesToDropdown = (filteredMovies) => {
                    movieDropdown.innerHTML = '<option value="">Film auswählen</option>';
                    filteredMovies.forEach(movie => {
                        const option = document.createElement('option');
                        option.value = movie.movie_id;
                        option.textContent = movie.title;
                        option.dataset.duration = movie.duration;
                        movieDropdown.appendChild(option);
                    });
                };

                // Initiales Dropdown befüllen
                addMoviesToDropdown(movies);

                // Filter-Funktion basierend auf Eingabe
                movieSearchInput.addEventListener('input', () => {
                    const searchTerm = movieSearchInput.value.toLowerCase();
                    const filteredMovies = movies.filter(movie =>
                        movie.title.toLowerCase().includes(searchTerm)
                    );
                    addMoviesToDropdown(filteredMovies);
                });

                // Klick auf Suchfeld zeigt alle Optionen
                movieSearchInput.addEventListener('focus', () => {
                    movieDropdown.size = movies.length > 4 ? 4 : movies.length; // Zeige maximal 5 Optionen
                    movieDropdown.classList.add("small-dropdown");
                });

                // Dropdown schließen bei Blur
                movieSearchInput.addEventListener('blur', () => {
                    setTimeout(() => movieDropdown.size = 1, 200); // Kleiner Delay für UX
                });

            } else {
                console.error('Fehler beim Abrufen der Filme:', movies.message);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Filme:', error);
        }
    }



    // Funktion, um Räume basierend auf Datum, Uhrzeit und ausgewähltem Film zu laden
    async function loadRooms() {
        const date = dateInput.value;
        const time = timeDropdown.value;
        const movieId = movieDropdown.value;

        if (!date || !time || !movieId) {
            roomDropdown.innerHTML = '<option value="">Bitte wählen</option>';
            return;
        }

        try {
            const response = await fetch(`/api/rooms?date=${date}&time=${time}&movie_id=${movieId}`); // API-Endpunkt für verfügbare Räume
            const rooms = await response.json();

            if (!response.ok) {
                console.error('Öffnungszeiten werden überschritten:', rooms.message);
                responseMessage.textContent = `Fehler: ${rooms.message}`;
                responseMessage.style.color = 'red';
                return;
            }

            if (rooms.length === 0) {
                roomDropdown.innerHTML = '<option value="">Keine verfügbaren Räume gefunden</option>';
            } else {
                roomDropdown.innerHTML = '<option value="">Raum auswählen</option>'; // Reset der Dropdown-Optionen
                rooms.sort((a, b) => a.room_id - b.room_id); // Räume nach Nummer sortieren
                rooms.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.room_id; // Speichert die room_id
                    option.textContent = `Raum ${room.room_id}`; // Zeigt die Raum-Nummer an
                    roomDropdown.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Fehler beim Laden der Räume:', error);
            responseMessage.textContent = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
            responseMessage.style.color = 'red';
        }
    }



    // Event-Listener für Änderungen bei Datum und Uhrzeit
    dateInput.addEventListener('change', loadRooms);
    timeDropdown.addEventListener('change', loadRooms);

    // Funktion zum Berechnen der Endzeit basierend auf Filmdauer
    function calculateEndTime(startTime, duration) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const totalMinutes = startHour * 60 + startMinute + duration;

        // Runden auf die nächste Viertelstunde
        const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
        const endHour = Math.floor(roundedMinutes / 60);
        const endMinute = roundedMinutes % 60;

        return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    }

    // Formular absenden und Vorstellung erstellen
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const movieId = movieDropdown.value;
        const date = dateInput.value;
        const time = timeDropdown.value;
        const roomId = roomDropdown.value;

        if (!movieId || !date || !time || !roomId) {
            responseMessage.textContent = 'Bitte fülle alle Felder aus!';
            responseMessage.style.color = 'red';
            return;
        }

        // Holen der Filmdauer aus dem Dropdown (data-Attribut)
        const movieDuration = parseInt(movieDropdown.selectedOptions[0]?.dataset.duration || 0);
        if (!movieDuration) {
            responseMessage.textContent = 'Fehler: Dauer des Films nicht gefunden!';
            responseMessage.style.color = 'red';
            return;
        }

        // Berechnung der Endzeit basierend auf Startzeit und Dauer
        const endTime = calculateEndTime(time, movieDuration);

        const showData = {
            movie_id: movieId,
            date,
            time,
            end_time: endTime,  // Die berechnete Endzeit wird übergeben
            room_id: roomId,
            movie_duration: movieDuration // Die Filmdauer wird auch übergeben
        };

        let response;
        try {
            const showResponse = await fetch('/api/vorstellungen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(showData),
            });
    
            const result = await showResponse.json();
    
            if (showResponse.ok) {
                responseMessage.textContent = 'Vorstellung erfolgreich hinzugefügt!';
                responseMessage.style.color = '#5afff5';
                form.reset();
                roomDropdown.innerHTML = '<option value="">Bitte wählen</option>';

                //const showId = result.data?.show_id;
                const showId = parseInt(result.data.show_id, 10); // show_id als Integer
                const roomIdInt = parseInt(roomId, 10);  // room_id als Integer
    
                // Payload-Daten mit sicherem Integer
                const payloadData = {
                    room_id: roomIdInt, // room_id als Integer gesetzt
                    show_id: showId     // show_id als Integer gesetzt
                };

                try {
                    // Debug-Ausgabe der finalen Daten vor dem Senden
                    console.log("Daten, die gesendet werden:", JSON.stringify(payloadData, null, 2));
            
                    const seatCreationResult = await createSeats(payloadData);
            
                    if (seatCreationResult || seatCreationResult.status === 'success') {
                        console.log("Sitzplätze erfolgreich gespeichert");
                        responseMessage.textContent += ' ' + seatCreationResult.message;
                    } else {
                        alert(`Fehler: ${seatCreationResult.statusText || 'Unbekannter Fehler'}`);
                        responseMessage.textContent += ' ' + seatCreationResult.message;
                        responseMessage.style.color = 'red';
                    }
                } catch (error) {
                    console.error("Fehler beim Absenden der Erstellung:", error);
                    alert(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
                }
                

            } else {
                responseMessage.textContent = `Fehler: ${result.message}`;
                responseMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Fehler beim Erstellen der Vorstellung:', error);
            responseMessage.textContent = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
            responseMessage.style.color = 'red';
        }
    });

    // Setze das Mindestdatum auf heute
    function setMinDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${year}-${month}-${day}`;
    }

    // Füge erlaubte Uhrzeiten zum Dropdown hinzu basierend auf den Öffnungszeiten
    function populateTimeDropdown() {
        const timeDropdown = document.getElementById('time');
        const dateInput = document.getElementById('date');

        // Funktion, um erlaubte Zeiten für einen Wochentag zu generieren
        function getAllowedTimes(day) {
            let startHour, endHour;
            if (day >= 1 && day <= 5) { // Montag bis Freitag
                startHour = 10;
                endHour = 23;
            } else if (day === 6) { // Samstag
                startHour = 12;
                endHour = 24;
            } else if (day === 0) { // Sonntag
                startHour = 12;
                endHour = 22;
            }
            return { startHour, endHour };
        }

        // Funktion, um die Uhrzeiten zu generieren
        function generateTimes(startHour, endHour) {
            const times = [];
            for (let hour = startHour; hour <= endHour; hour++) {
                if (hour < endHour) {
                    times.push(`${String(hour).padStart(2, '0')}:00`);
                    times.push(`${String(hour).padStart(2, '0')}:15`);
                    times.push(`${String(hour).padStart(2, '0')}:30`);
                    times.push(`${String(hour).padStart(2, '0')}:45`);
                } else if (hour === endHour && endHour !== 24) {
                    times.push(`${String(hour).padStart(2, '0')}:00`);
                }
            }
            return times;
        }

        // Event-Listener für Änderungen am Datum
        dateInput.addEventListener('change', () => {
            const selectedDate = new Date(dateInput.value);
            if (isNaN(selectedDate.getTime())) {
                timeDropdown.innerHTML = '<option value="">Bitte Datum auswählen</option>';
                return;
            }
            const day = selectedDate.getDay(); // Wochentag (0=Sonntag, 1=Montag, ..., 6=Samstag)
            const { startHour, endHour } = getAllowedTimes(day);

            // Generiere die erlaubten Zeiten für den ausgewählten Tag
            const times = generateTimes(startHour, endHour);

            // Dropdown befüllen
            timeDropdown.innerHTML = '<option value="">Uhrzeit auswählen</option>';
            times.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeDropdown.appendChild(option);
            });
        });
    }



    // Funktion, um Vorstellungen zu laden
    async function loadShows() {
        try {
            const response = await fetch('/api/alleVorstellungen'); // Endpunkt für alle Vorstellungen
            const shows = await response.json();

            if (response.ok) {
                const now = new Date(); // Aktuelles Datum und Uhrzeit
                const germanDateTimeFormat = new Intl.DateTimeFormat('de-DE', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                });

                // Filtere Vorstellungen ab heute und sortiere sie
                allShows = shows
                    .filter(show => {
                        const showDateTime = new Date(`${show.date}T${show.time}`);
                        return showDateTime >= now;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(`${a.date}T${a.time}`);
                        const dateB = new Date(`${b.date}T${b.time}`);
                        return dateA - dateB;
                    });

                filteredShows = [...allShows]; // Anfangs alle anzeigen
                renderShowList(); // Initiale Darstellung
            } else {
                deleteResponseMessage.textContent = `Fehler: ${shows.message}`;
                deleteResponseMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Fehler beim Laden der Vorstellungen:', error);
            deleteResponseMessage.textContent = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
            deleteResponseMessage.style.color = 'red';
        }
    }

    // Funktion, um die Liste der Vorstellungen anzuzeigen
    function renderShowList() {
        const showList = document.getElementById('show-list');
        showList.innerHTML = ''; // Vorherige Inhalte leeren

        const germanDateTimeFormat = new Intl.DateTimeFormat('de-DE', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        filteredShows.forEach(show => {
            const listItem = document.createElement('li');
            const showDateTime = new Date(`${show.date}T${show.time}`);
            listItem.textContent = `${germanDateTimeFormat.format(showDateTime)} - ${show.movie_title} (Raum ${show.room_id})`;

            listItem.dataset.showId = show.show_id;
            listItem.addEventListener('click', () => {
                // Markiere die ausgewählte Vorstellung
                document.querySelectorAll('#show-list li').forEach(item => item.classList.remove('selected'));
                listItem.classList.add('selected');
                selectedShowId = listItem.dataset.showId;
                deleteButton.disabled = false;
            });
            showList.appendChild(listItem);
        });
    }

    // Funktion für die Suche
    function filterShows(searchTerm) {
        filteredShows = allShows.filter(show => {
            const lowerCaseSearch = searchTerm.toLowerCase();
            return (
                show.movie_title.toLowerCase().includes(lowerCaseSearch) || // Nach Filmtitel suchen
                show.room_id.toString().includes(lowerCaseSearch) // Nach Raum suchen
            );
        });
        renderShowList(); // Aktualisiere die Anzeige
    }

    // Event-Listener für die Suchleiste
    document.getElementById('show-search').addEventListener('input', event => {
        const searchTerm = event.target.value;
        filterShows(searchTerm);
    });

    // Funktion, um eine Vorstellung zu löschen
    async function deleteShow() {
        if (!selectedShowId) return;

        try {
            const response = await fetch(`/api/vorstellungen/${selectedShowId}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (response.ok) {
                deleteResponseMessage.textContent = 'Vorstellung erfolgreich gelöscht!';
                deleteResponseMessage.style.color = '#5afff5';
                loadShows(); // Aktualisiere die Liste
                deleteButton.disabled = true;
                selectedShowId = null;
            } else {
                deleteResponseMessage.textContent = `Fehler: ${result.message}`;
                deleteResponseMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Fehler beim Löschen der Vorstellung:', error);
            deleteResponseMessage.textContent = 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
            deleteResponseMessage.style.color = 'red';
        }
    }



    // Event Listener für den Löschbutton
    deleteButton.addEventListener('click', deleteShow);

    // Lade die Vorstellungen beim Start
    loadShows();

    // Initiale Setups
    setMinDate();
    populateTimeDropdown();
    loadMovies();
});



/**
 * Funktion zum Erstellen von Sitzplätzen durch API-Aufruf
 * @param {string} roomId - Die ID des Raums
 * @param {string} showId - Die ID der Vorstellung
 * @returns {Promise<object>} - Erfolgsmeldung oder Fehlernachricht
 */
async function createSeats(payloadData) {
    let response;
    try {
        // Der Payload wird direkt aus den übergebenen Daten (payloadData) genutzt
        response = await fetch('/api/sitzplaetzeErstellen/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadData)  // Payload wird direkt übergeben
        });

        if (!response.ok) {
            const errorResult = await response.json();
            return { success: false, message: `Fehler beim Erstellen der Sitzplätze: ${errorResult.message}` };
        }

        const result = await response.json();
        return { success: true, message: 'Sitzplätze erfolgreich erstellt', data: result };

    } catch (error) {
        console.error('Fehler beim Erstellen der Sitzplätze.', error);
        return { success: false, message: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' };
    }
}