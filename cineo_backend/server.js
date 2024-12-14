require('dotenv').config({ path: './cineo_backend/.env' });  // Lade die Variablen aus der .env-Datei

const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// CORS Middleware aktivieren
app.use(cors());

// Lese die Variablen aus der .env-Datei
//const supabaseUrl = process.env.SUPABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Überprüfe, ob die Umgebungsvariablen korrekt geladen wurden
if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL oder Schlüssel fehlen!');
    process.exit(1);  // Beendet das Programm, wenn eine der Variablen fehlt
}

console.log('Supabase URL:', supabaseUrl);  // Gibt die URL aus
console.log('Supabase Key:', supabaseKey);  // Gibt den Key aus

const supabase = createClient(supabaseUrl, supabaseKey);



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

// API-Endpunkt, um alle Filme abzurufen
app.get('/api/filme', async (req, res) => {
    const { data, error } = await supabase
        .from('movies') // Greift auf die "movies"-Tabelle zu
        .select('movie_id, title, image'); // Füge "movie_id" zu den abgerufenen Feldern hinzu

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Keine Filme gefunden' });
    }

    res.json(data); // Gibt die Filmdaten zurück, inklusive movie_id
});

/*
// Alle Filme abrufen
app.get('/api/filme', (req, res) => {
    db.query('SELECT * FROM Filme', (err, results) => {
        if (err) {
            res.status(500).send('Fehler beim Abrufen der Filme');
            return;
        }
        res.json(results);
    });
});*/

// Statische Dateien bereitstellen (für Bilder)
app.use('/images', express.static(path.join(__dirname, '../cineo_frontend/images')));

// 1. Static Files aus dem Frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../cineo_frontend/mainpages')));


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


// Den Server starten
app.listen(4000, () => console.log('Server läuft auf http://localhost:4000'));





/*
const express = require('express');

const app = express();
const path = require('path');
const port = 4000;

const mysql = require('mysql2');

// MySQL-Verbindung
const db = mysql.createConnection({
    host: 'localhost',
    user: 'granate',
    password: 'cineo4life*',  // Gebt hier euer MySQL-Passwort ein
    database: 'cineo'
});


db.connect((err) => {
    if (err) {
        console.error('Fehler bei der Verbindung zur Datenbank:', err);
        return;
    }
    console.log('Mit der Datenbank verbunden');
});

// Middleware zum Parsen von JSON
app.use(express.json());

// Statische Dateien bereitstellen (für Bilder)
app.use('/images', express.static(path.join(__dirname, '../cineo_frontend/images')));


// 1. Static Files aus dem Frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../cineo_frontend/mainpages')));

app.use(express.static(path.join(__dirname, '../cineo_frontend/specialpages')));


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


// Alle Filme abrufen
app.get('/api/filme', (req, res) => {
    db.query('SELECT * FROM Filme', (err, results) => {
        if (err) {
            res.status(500).send('Fehler beim Abrufen der Filme');
            return;
        }
        res.json(results);
    });
});




app.get('/api/filme/:filme_id', (req, res) => {
    const movieId = req.params.filme_id;
    // Angenommen, du holst den Film mit der ID aus der DB
    const query = `SELECT * FROM filme WHERE filme_id = ?`;
    
    
    db.query(query, [movieId], (err, result) => {
      if (err) {
        res.status(500).send('Error fetching movie details');
      } else {
        res.json(result[0]); // Sende den ersten Film als Antwort
      }
    });
  });


  app.get('/api/showtimes/:filme_id', (req, res) => {
    const filmeId = req.params.filme_id;

    const query = 'SELECT * FROM showtimes WHERE filme_id = ?';

    // Hier verwenden wir den Callback-Ansatz, der typisch für die MySQL2-Callback-API ist
    db.query(query, [filmeId], (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Showtimes:', err);
            res.status(500).json({ error: 'Interner Serverfehler' });
            return;
        }

        if (results.length === 0) {
            // Wenn keine Showtimes gefunden wurden
            return res.status(404).json({ error: 'Keine Vorstellungen gefunden für diesen Film.' });
        }

        // Zeige die Ergebnisse als JSON zurück
        res.json(results);
    });
});


app.post('/api/tickets', (req, res) => {
    const { showtime_id, ticket_type, price } = req.body;

    if (!showtime_id || !ticket_type || !price) {
        return res.status(400).json({ error: 'Ungültige Daten' });
    }

    const query = 'INSERT INTO tickets (showtime_id, ticket_type, price) VALUES (?, ?, ?)';
    db.query(query, [showtime_id, ticket_type, price], (err, result) => {
        if (err) {
            console.error('Fehler bei der Ticketbuchung:', err);
            return res.status(500).json({ error: 'Serverfehler' });
        }
        res.status(201).json({ message: 'Ticket erfolgreich gebucht' });
    });
});



// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
*/