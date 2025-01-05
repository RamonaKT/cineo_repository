// Erforderliche Module laden
require('dotenv').config({ path: '../cineo_backend/.env' });
const cors = require('cors');
const express = require('express');  // Verwende require anstelle von import
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// ** Router Import**
const showLayoutController = require('./src/controller/showLayoutController'); // Importiere den Router

const app = express();

// CORS konfigurieren
app.use(cors({
    origin: '*',  // Alle Ursprünge zulassen (oder hier den spezifischen Ursprung angeben)
}));

app.use(bodyParser.json());
app.use(express.json());

// ** Router verwenden**
app.use(showLayoutController);  // Registriere den Router in der App

app.use((err, req, res, next) => {
    console.error(err.stack); // Detaillierte Fehlerausgabe
    res.status(500).send('Etwas ist schief gelaufen!');
});

// Konfigurationen aus der .env-Datei einlesen
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const tmdbApiKey = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Überprüfen, ob die Umgebungsvariablen korrekt geladen wurden
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

// Routen-Handler
app.get('/api/filme/:movieId', async (req, res) => {
    const movieId = req.params.movieId;

    const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('movie_id', movieId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
        return res.status(404).json({ error: 'Film nicht gefunden' });
    }

    res.json(data[0]);
});

// Weitere Routen folgen ...

// Statische Dateien bereitstellen (für Bilder)
app.use('/images', express.static(path.join(__dirname, '../cineo_frontend/images')));
app.use(express.static(path.join(__dirname, '../cineo_frontend')));

// 1. Static Files aus dem Frontend-Ordner bereitstellen
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/homepageStructure.html'));
});

// Starten des Servers
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});


