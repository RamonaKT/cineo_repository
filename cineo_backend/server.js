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
const routerFilme = require('./src/controller/filmeController');
const routerVorstellungen = require('./src/controller/vorstellungenController');

app.use(cors({
    origin: '*',  // Alle Ursprünge zulassen (oder hier den spezifischen Ursprung angeben)
}));

app.use(express.json());

// ** Router verwenden**
app.use('/api/saveLayout', routerLayout);             // Registriere den Router in der App
app.use('/api/sitzplaetzeErstellen', routerCreateShowSeats);        // Registriere den Router in der App
app.use('/api/seatReservations', routerSeatReservations);
app.use('/api/filme', routerFilme);
app.use('/api/vorstellungen', routerVorstellungen);

const mainRouter = require ('./src/controller/mainController');
const { Server } = require('http');
app.use('/api', mainRouter); //für die Reste xD

app.use((err, req, res, next) => {
    console.error(err.stack); // Detaillierte Fehlerausgabe
    res.status(500).send('Etwas ist schief gelaufen!');
});



// Alle 1 Minute abgelaufene Sitzplatzreservierungen bereinigen
setInterval(async () => {
    try {
        const response = await fetch('http://46.101.251.202:4000/api/seatReservations/expire', {
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


/*
// API-Endpunkt zum Laden der Sitzplatzdaten
app.get('/api/seatReservationsTest/seats', async (req, res) => {
    const { show_id } = req.query;

    console.log(`[DEBUG] Request received: show_id=${show_id}`); // Eingabedaten prüfen

    try {
        const { data: seats, error } = await supabase
            .from('seat')
            .select('*')
            .eq('show_id', show_id);

        console.log(`[DEBUG] Query result: `, { seats, error }); // Ergebnis der Abfrage prüfen

        if (error) {
            console.error(`[ERROR] Supabase error: `, error);
            return res.status(500).json({ message: 'Fehler bei der Datenbankabfrage', error });
        }

        if (!seats || seats.length === 0) {
            console.log(`[INFO] Keine Sitzplätze gefunden für show_id=${show_id}`);
            return res.status(404).json({ message: 'Keine Sitzplätze gefunden' });
        }

        console.log(`[DEBUG] Returning seats: `, seats); // Erfolgreiche Daten ausgeben
        return res.json(seats);
    } catch (error) {
        console.error(`[ERROR] Fehler im API-Endpunkt: `, error.message);
        return res.status(500).json({ message: 'Fehler beim Abrufen der Sitzplatzdaten', error: error.message });
    }
});
*/


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
if (require.main === module) {
    app.listen(4000, () => {
      console.log('Server läuft auf http://localhost:4000');
    });
  }


module.exports=app;
module.exports={app,Server,main,insertMoviesIntoDatabase,movieExists,fetchPopularMovies,fetchMovies,fetchMovieDetails};
