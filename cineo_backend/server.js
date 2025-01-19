require('dotenv').config({ path: '../cineo_backend/.env' });


const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Für TMDB Verbindung
const axios = require('axios');

// ** Router Import**
const routerLayout = require('./src/controller/showLayoutController'); // Importiere den Router
const routerCreateShowSeats = require('./src/controller/createshowseatsController');
const routerSeatReservations = require('./src/controller/seatReservationsController');

app.use(cors({
    origin: '*',  // Alle Ursprünge zulassen (oder hier den spezifischen Ursprung angeben)
}));

app.use(express.json());

// ** Router verwenden**
//app.use(showLayoutController); 
app.use('/api/saveLayout', routerLayout);             // Registriere den Router in der App
app.use('/api/sitzplaetzeErstellen', routerCreateShowSeats);        // Registriere den Router in der App

app.use('/api/seatReservations', routerSeatReservations)

app.use((err, req, res, next) => {
    console.error(err.stack); // Detaillierte Fehlerausgabe
    res.status(500).send('Etwas ist schief gelaufen!');
});



// Alle 1 Minute abgelaufene Sitzplatzreservierungen bereinigen
setInterval(async () => {
    try {
        const response = await fetch('http://localhost:4000/api/seatReservations/expire', {
            method: 'POST'
        });
        const result = await response.json();
        console.log('Abgelaufene Reservierungen geprüft:', result.message);
    } catch (error) {
        console.error('Fehler beim Bereinigen abgelaufener Reservierungen:', error.message);
    }
}, 60 * 1000); // Alle 1 Minute prüfen



const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Für TMDB Verbindung
const tmdbApiKey = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';


// Überprüfe, ob die Umgebungsvariablen korrekt geladen wurden
if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase URL:', supabaseUrl);  // Gibt die URL aus
    console.log('Supabase Key:', supabaseKey);  // Gibt den Key aus
    console.error('Supabase URL oder Schlüssel fehlen!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);



// Funktion zum Abrufen beliebter Filme von einer bestimmten Seite
async function fetchPopularMovies(page = 1) {
    console.log(`Rufe Filme für Seite ${page} ab...`);
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: tmdbApiKey,
                language: 'de-DE',
                page,
            },
        });

        const movies = response.data.results.map((movie) => ({
            id: movie.id,
            title: movie.title,
            runtime: null,
            genre_ids: movie.genre_ids,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
        }));
        return movies;
    } catch (error) {
        console.error(`Fehler beim Abrufen der Filme für Seite ${page}:`, error);
        return [];
    }
}

// Funktion zum Abrufen der Details eines Films
async function fetchMovieDetails(movieId) {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
            params: { api_key: tmdbApiKey, language: 'de-DE' },
        });
        return {
            runtime: response.data.runtime,
            genres: response.data.genres.map((genre) => genre.name),
        };
    } catch (error) {
        console.error(`Fehler beim Abrufen der Details für Film ${movieId}:`, error);
        return { runtime: null, genres: [] };
    }
}

// Zentrale Funktion zum Abrufen von Filmen der ersten beiden Seiten und deren Details
async function fetchMovies() {
    try {
        // Abrufen der Filme von Seite 1 und 2
        const page1Movies = await fetchPopularMovies(1);
        const page2Movies = await fetchPopularMovies(2);

        const allMovies = [...page1Movies, ...page2Movies];
        console.log(`Abgerufene Filme: ${allMovies.length} Filme`);

        const detailedMovies = [];
        for (const movie of allMovies) {
            if (movie.overview) {
                const details = await fetchMovieDetails(movie.id);
                movie.runtime = details.runtime;
                movie.genres = details.genres;

                const releaseYear = movie.release_date
                    ? movie.release_date.split('-')[0]
                    : 'Unbekannt';
                movie.year = releaseYear;

                detailedMovies.push(movie);
            }
        }
        return detailedMovies;
    } catch (error) {
        console.error('Fehler beim Abrufen der Filme:', error);
        return [];
    }
}

// Funktion zum Überprüfen, ob ein Film bereits in der Datenbank existiert
async function movieExists(movieId) {
    try {
        const { data, error } = await supabase
            .from('movies')
            .select('tmdb_id')
            .eq('tmdb_id', movieId);

        if (error) {
            console.error('Fehler bei der Überprüfung, ob der Film existiert:', error);
            return false;
        }
        return data.length > 0;
    } catch (error) {
        console.error('Fehler bei der Existenzprüfung des Films:', error);
        return false;
    }
}

// Funktion zum Einfügen von Filmen in die Datenbank
async function insertMoviesIntoDatabase(movies) {
    const newMovies = [];

    for (const movie of movies) {
        const exists = await movieExists(movie.id);
        if (!exists) {
            newMovies.push({
                title: movie.title,
                duration: movie.runtime,
                genre: movie.genres.join('/ '),
                description: movie.overview,
                year: movie.year,
                image: movie.poster_path,
                tmdb_id: movie.id,
            });
        } else {
            console.log(`Film "${movie.title}" existiert bereits in der Datenbank.`);
        }
    }

    if (newMovies.length > 0) {
        const { data, error } = await supabase.from('movies').insert(newMovies);
        if (error) {
            console.error('Fehler beim Einfügen in die Datenbank:', error);
        } else {
            console.log('Neue Filme erfolgreich in die Datenbank eingefügt:', data);
        }
    } else {
        console.log('Keine neuen Filme zum Hinzufügen.');
    }
}

// Hauptlogik für den Ablauf
async function main() {
    try {
        const movies = await fetchMovies();
        // console.log('Filme mit Details:', movies);
        await insertMoviesIntoDatabase(movies);
    } catch (error) {
        console.error('Fehler im Hauptablauf:', error);
    }
}

main();


app.get('/api/filme/:movieId', async (req, res) => {
    const movieId = req.params.movieId;

    const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('movie_id', movieId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    console.log("Daten:", data);  // Protokolliert die zurückgegebenen Daten

    if (data.length === 0) {
        return res.status(404).json({ error: 'Film nicht gefunden' });
    }

    res.json(data[0]);
});


app.get('/api/vorstellungen/:movieId', async (req, res) => {
    const movieId = req.params.movieId;

    const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('movie_id', movieId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    console.log("Daten:", data);  // Protokolliert die zurückgegebenen Daten

    if (data.length === 0) {
        return res.status(404).json({ error: 'Shows dieses Filmes nicht gefunden' });
    }

    res.json(data);

});



app.post('/api/vorstellungen', async (req, res) => {
    const { movie_id, date, time, end_time, room_id, movie_duration } = req.body;

    // Überprüfen, ob alle erforderlichen Daten vorhanden sind
    if (!movie_id || !date || !time || !room_id || !movie_duration) {
        return res.status(400).json({ message: 'Fehlende Daten: movie_id, date, time, room_id und movie_duration sind erforderlich' });
    }

    try {
        // Holen des Filmtitels aus der 'movies'-Tabelle basierend auf movie_id
        const { data: movieData, error: movieError } = await supabase
            .from('movies')
            .select('title')
            .eq('movie_id', movie_id)
            .single();

        if (movieError || !movieData) {
            return res.status(404).json({ message: 'Film nicht gefunden' });
        }

        const movieTitle = movieData.title; // Titel des Films

        // Erstellen eines neuen Eintrags in der 'shows'-Tabelle
        const { data, error } = await supabase
            .from('shows')
            .insert([
                {
                    movie_id,
                    movie_title: movieTitle,  // Den Filmtitel speichern
                    date: date,
                    time: time,
                    end_time,
                    room_id,
                    movie_duration
                }
            ])
            .select('show_id')
            .single();

        if (error) {
            return res.status(500).json({ message: 'Fehler beim Hinzufügen der Vorstellung', error: error.message });
        }
        res.status(201).json({ message: 'Vorstellung erfolgreich hinzugefügt', data });
    } catch (error) {
        console.error('Fehler beim Erstellen der Vorstellung:', error);
        res.status(500).json({ message: 'Serverfehler', error: error.message });
    }
});


app.get('/api/alleVorstellungen', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('shows')
            .select('show_id, date, time, movie_title, room_id');

        if (error) {
            return res.status(500).json({ message: 'Fehler beim Abrufen der Vorstellungen', error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Keine Vorstellungen gefunden' });
        }

        res.json(data);
    } catch (error) {
        console.error('Fehler beim Abrufen der Vorstellungen:', error);
        res.status(500).json({ message: 'Serverfehler', error: error.message });
    }
});



app.delete('/api/vorstellungen/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('shows')
            .delete()
            .eq('show_id', id);

        if (error) {
            return res.status(500).json({ message: 'Fehler beim Löschen der Vorstellung', error: error.message });
        }

        res.status(200).json({ message: 'Vorstellung erfolgreich gelöscht' });
    } catch (error) {
        console.error('Fehler beim Löschen der Vorstellung:', error);
        res.status(500).json({ message: 'Serverfehler', error: error.message });
    }
});


// API-Endpunkt, um alle Filme abzurufen
app.get('/api/alleFilme', async (req, res) => {
    const { data, error } = await supabase
        .from('movies')
        .select('movie_id, title, image, duration'); // Füge "movie_id" zu den abgerufenen Feldern hinzu

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Keine Filme gefunden' });
    }

    res.json(data); // Gibt die Filmdaten zurück, inklusive movie_id
});





app.get('/api/filme', async (req, res) => {

    const now = new Date().toISOString(); // Aktuelles Datum und Uhrzeit



    // Abrufen der movie_id's aus der shows-Tabelle
    const { data: showsData, error: showsError } = await supabase
        .from('shows')
        .select('movie_id')
        .gte('date', now);
    //  .neq('movie_id', null); // Sicherstellen, dass movie_id in der shows-Tabelle nicht null ist

    if (showsError) {
        return res.status(500).json({ error: showsError.message });
    }

    if (!showsData || showsData.length === 0) {
        return res.status(404).json({ error: 'Keine Shows gefunden' });
    }

    // Holen der movie_ids aus der shows-Tabelle
    const movieIds = showsData.map(show => show.movie_id);

    // Abrufen der Filme aus der movies-Tabelle, deren movie_id in der shows-Tabelle vorhanden ist
    const { data, error } = await supabase
        .from('movies')
        .select('movie_id, title, image, duration')
        .in('movie_id', movieIds); // Filtern der Filme, die in der shows-Tabelle existieren

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Keine Filme mit Vorstellungen gefunden' });
    }

    res.json(data);
});





app.get('/api/rooms', async (req, res) => {
    const { date, time, movie_id } = req.query;

    if (!date || !time || !movie_id) {
        return res.status(400).json({ message: 'Datum, Uhrzeit und Film erforderlich!' });
    }

    try {
        // Holen der Filmdauer aus der movies-Tabelle
        const { data: movieData, error: movieError } = await supabase
            .from('movies')
            .select('duration')
            .eq('movie_id', movie_id)
            .single();

        if (movieError || !movieData) {
            return res.status(404).json({ message: 'Film nicht gefunden!' });
        }

        const movieDuration = movieData.duration;

        // Berechnung der Endzeit des Films basierend auf der Startzeit und Filmdauer
        const endTime = calculateEndTime(time, movieDuration);

        console.log(`Überprüfe Räume für: ${date} ${time} - Endzeit: ${endTime}`);

        // Überprüfen, ob der Raum bereits für das angegebene Datum und die Zeitspanne gebucht ist
        const { data: bookedRooms, error: bookedError } = await supabase
            .from('shows')
            .select('room_id, time, end_time')
            .eq('date', date)
            .filter('time', 'lt', endTime) // Startzeit der bestehenden Vorstellung muss vor der Endzeit des neuen Films liegen
            .filter('end_time', 'gt', time); // Endzeit der bestehenden Vorstellung muss nach der Startzeit des neuen Films liegen

        if (bookedError) {
            console.error('Fehler beim Abrufen der gebuchten Räume:', bookedError);
            throw bookedError;
        }

        const bookedRoomIds = bookedRooms.map(room => room.room_id);

        // Räume abrufen, die noch verfügbar sind
        const { data: availableRooms, error: availableError } = await supabase
            .from('rooms')
            .select('*')
            .not('room_id', 'in', `(${bookedRoomIds.join(',')})`);

        if (availableError) {
            console.error('Fehler beim Abrufen der verfügbaren Räume:', availableError);
            throw availableError;
        }

        res.json(availableRooms);
    } catch (error) {
        console.error('Fehler beim Abrufen der Räume:', error);
        res.status(500).json({ message: 'Öffnungszeiten werden überschritten', error: error.message });
    }
});



// Funktion zum Berechnen der Endzeit basierend auf Filmdauer und Startzeit
function calculateEndTime(startTime, duration) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + duration;

    // Runden auf die nächste Viertelstunde
    const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
    const endHour = Math.floor(roundedMinutes / 60);
    const endMinute = roundedMinutes % 60;

    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}



app.post('/api/tickets', async (req, res) => {
    const { show_id, ticket_type, price, discount_name, user_mail } = req.body;
    console.log(req.body);

    if (!show_id || !ticket_type || !price) {
        return res.status(400).json({ error: "Fehlende Ticketdaten" });
    }

    try {
        // Schritt 1: Hole die Raumkapazität der Show
        const { data: showData, error: showError } = await supabase
            .from('shows')
            .select('room_id')
            .eq('show_id', show_id)
            .single();

        console.log('Show-Daten:', showData);

        if (showError || !showData) {
            throw new Error('Vorstellung nicht gefunden');
        }

        const roomId = showData.room_id;
        console.log('Gefundene room_id für Show', show_id, ':', roomId);


        console.log('room_id:', roomId);


        // Schritt 2: Hole die Kapazität des Raums
        const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .select('capacity')
            .eq('room_id', roomId)
            .single();

        // Debugging
        console.log('Raum-Daten:', roomData);

        if (roomError || !roomData) {
            throw new Error('Raumkapazität nicht gefunden');
        }

        const roomCapacity = roomData.capacity;


        // Schritt 3: Berechne die bereits verkauften Tickets für die Show
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select('ticket_id')
            .eq('show_id', show_id);


        // Debugging
        console.log('Tickets-Daten für show_id', show_id, ':', ticketsData);


        if (ticketsError) {
            throw ticketsError;
        }

        //const soldTicketsCount = ticketsData.length;
        const soldTicketsCount = ticketsData ? ticketsData.length : 0;
        console.log('Bereits verkaufte Tickets:', soldTicketsCount);


        // Schritt 4: Prüfe, ob ein weiteres Ticket die Kapazität überschreiten würde
        if (soldTicketsCount >= roomCapacity) {
            return res.status(400).json({ error: "Kapazität überschritten" });
        }

        // Schritt 5: Füge das Ticket hinzu
        const { data: newTicket, error: insertError } = await supabase
            .from('tickets')
            .insert([{ show_id, ticket_type, price, discount_name, user_mail }])
            .single();

        if (insertError) {
            throw insertError;
        }

        res.status(201).json({
            message: "Ticket erfolgreich gespeichert",
            ticket: newTicket
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tickets', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        console.error("Fehlende E-Mail in der Anfrage");
        return res.status(400).json({ error: 'E-Mail wird benötigt' });
    }

    try {
        // Schritt 1: Hole alle Tickets des Benutzers
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select('ticket_id, show_id, ticket_type, price, discount_name')
            .eq('user_mail', email);

        if (ticketsError) {
            throw new Error('Fehler beim Abrufen der Tickets: ' + ticketsError.message);
        }

        if (!ticketsData || ticketsData.length === 0) {
            console.log("Keine Tickets gefunden für:", email);
            return res.status(200).json([]); // Leere Liste zurückgeben
        }

        // Debugging
        console.log("Gefundene Tickets:", ticketsData);

        // Schritt 2: Hole die Details zu den Shows
        const showIds = ticketsData.map(ticket => ticket.show_id);

        const { data: showsData, error: showsError } = await supabase
            .from('shows')
            .select('show_id, movie_title, room_id, date, time')
            .in('show_id', showIds); // Nutze die Liste der `show_id`

        if (showsError) {
            throw new Error('Fehler beim Abrufen der Show-Daten: ' + showsError.message);
        }

        // Debugging
        console.log("Gefundene Shows:", showsData);

        // Schritt 3: Verknüpfe die Daten
        const ticketsWithShowDetails = ticketsData.map(ticket => {
            const showDetails = showsData.find(show => show.show_id === ticket.show_id);
            return {
                ...ticket,
                movie_title: showDetails?.movie_title || 'Unbekannt',
                room_id: showDetails?.room_id || 'Unbekannt',
                date: showDetails?.date || 'Unbekannt',
                time: showDetails?.time || 'Unbekannt'
            };
        });

        // Debugging
        console.log("Tickets mit Show-Details:", ticketsWithShowDetails);

        res.status(200).json(ticketsWithShowDetails);
    } catch (err) {
        console.error("Serverfehler:", err.message);
        res.status(500).json({ error: 'Fehler beim Abrufen der Tickets: ' + err.message });
    }
});


// User registration
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Alle Felder müssen ausgefüllt werden." });

    try {
        const { data, error } = await supabase.from("users").insert([{ email, password }]);
        if (error) throw error;
        res.status(200).json({ message: "Registration successful!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Alle Felder müssen ausgefüllt werden." });

    try {
        const { data } = await supabase.from("users").select("*").eq("email", email).eq("password", password);
        if (data.length === 0) return res.status(401).json({ error: "Ungültige Zugangsdaten." });

        res.status(200).json({
            message: "Login successful!",
            role: email.endsWith("@cineo.com") ? "employee" : "customer",
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Guest login
app.post("/api/guest", (req, res) => {
    const { email } = req.body;

    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: "Ungültiges E-Mail Format." });

    res.status(200).json({ message: "Guest login successful!" });
});




// API-Endpoint zum Abrufen und Speichern der IBAN
app.get('/api/iban', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'E-Mail wird benötigt' });
    }

    const { data, error } = await supabase
        .from('users')
        .select('iban')
        .eq('email', email)
        .single();

    if (error) {
        return res.status(500).json({ error: 'Fehler beim Abrufen der IBAN' });
    }

    res.json(data);
});


app.post('/api/iban', async (req, res) => {
    const { email, iban } = req.body;

    if (!email || !iban) {
        return res.status(400).json({ error: 'E-Mail und IBAN sind erforderlich' });
    }

    const { error } = await supabase
        .from('users')
        .update({ iban })
        .eq('email', email);

    if (error) {
        return res.status(500).json({ error: 'Fehler beim Speichern der IBAN' });
    }

    res.json({ message: 'IBAN erfolgreich gespeichert' });
});





// server.js - API Endpunkte zur Verwaltung von Ticketpreisen und Rabatten

// API-Endpunkt, um Ticketpreise und Rabatte abzurufen
app.get('/api/ticketpreise', async (req, res) => {
    try {
        // Ticketpreise aus der Tabelle 'ticket_categories' abrufen
        const { data: ticketpreise, error: ticketError } = await supabase
            .from('ticket_categories')
            .select('ticket_id, ticket_price, ticket_name');

        if (ticketError) {
            throw ticketError;
        }

        // Rabatte aus der Tabelle 'ticket_discount' abrufen
        const { data: rabatte, error: rabattError } = await supabase
            .from('ticket_discount')
            .select('name, type, value');

        if (rabattError) {
            throw rabattError;
        }

        res.json({ ticketpreise, rabatte });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// API-Endpunkt, um einen Rabatt zu löschen
app.delete('/api/ticketrabatt/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const { error } = await supabase
            .from('ticket_discount')
            .delete()
            .eq('name', name);

        if (error) throw error;

        res.json({ message: `Rabatt mit dem Namen "${name}" wurde gelöscht.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// API-Endpunkt, um Grundpreise zu aktualisieren
app.put('/api/ticketpreise/:ticket_id', async (req, res) => {
    const { ticket_id } = req.params;
    const { ticket_price } = req.body;

    try {
        const { error } = await supabase
            .from('ticket_categories')
            .update({ ticket_price })
            .eq('ticket_id', ticket_id);

        if (error) throw error;

        res.json({ message: 'Ticketpreis aktualisiert' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// API-Endpunkt, um Rabatte hinzuzufügen (ohne Update-Prüfung)
app.post('/api/ticketrabatt', async (req, res) => {
    const { name, type, value } = req.body;

    try {
        // Einfach neuen Rabatt hinzufügen, ohne auf Duplikate zu prüfen
        const { error: insertError } = await supabase
            .from('ticket_discount')
            .insert([{ name, type, value }]);

        if (insertError) {
            throw insertError;
        }

        res.json({ message: 'Rabatt hinzugefügt' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});




// Statische Dateien bereitstellen (für Bilder)
app.use('/images', express.static(path.join(__dirname, '../cineo_frontend/images')));

// 1. Static Files aus dem Frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../cineo_frontend')));


// 2. HTML-Seiten ausliefern
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/homepageStructure.html'));
});

app.get('/program', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/programpageStructure.html'));
});

app.get('/movie/:id', (req, res) => {
    const movieId = req.params.id;
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/movieStructure.html'));
});

app.get('/specials', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/specialpages/specialpageStructure.html'));
});

app.get('/offers', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/specialpages/offerpageStructure.html'));
});

app.get('/gastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/specialpages/gastropageStructure.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/specialpages/shoppageStructure.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/loginpageStructure.html'));
});

app.get('/tickets', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/ticketsStructure.html'));
});

app.get('/shows', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/showsStructure.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/confrimationpageStructure.html'));
});


// Server wird gestartet
app.listen(4000, () => console.log('Server läuft auf http://localhost:4000'));


/*
const { ClerkExpressMiddleware } = require("@clerk/clerk-sdk-node");

app.use(ClerkExpressMiddleware());
app.use(express.static('mainpages'));

    
app.get("/protected", (req, res) => {
    const user = req.auth;
    if (user) {
        res.json({ message: `Hallo, ${user.firstName}!` });
    } else {
        res.status(401).send("Nicht autorisiert.");
    }
});
*/
