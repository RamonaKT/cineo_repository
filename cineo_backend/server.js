require('dotenv').config({ path: '../cineo_backend/.env' });


const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Für TMDB Verbindung
const axios = require('axios');


app.use(cors());

app.use(express.json());


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
        console.log('Filme mit Details:', movies);
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



// API-Endpunkt, um alle Filme abzurufen
app.get('/api/filme', async (req, res) => {
    const { data, error } = await supabase
        .from('movies')
        .select('movie_id, title, image'); // Füge "movie_id" zu den abgerufenen Feldern hinzu

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Keine Filme gefunden' });
    }

    res.json(data); // Gibt die Filmdaten zurück, inklusive movie_id
});


app.post('/api/tickets', async (req, res) => {
    const { show_id, ticket_type, price } = req.body;
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
            .insert([{ show_id, ticket_type, price }])
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



