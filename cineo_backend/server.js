require('dotenv').config({ path: './cineo_backend/.env' });  // Lade die Variablen aus der .env-Datei

const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// CORS Middleware aktivieren
app.use(cors());

app.use(express.json());

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

/*
app.get('/api/vorstellungen/:showId', async (req, res) => {
    const showId = req.params.showId;

    const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('show_id', showId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    console.log("Daten:", data);  // Protokolliert die zurückgegebenen Daten

    if (data.length === 0) {
        return res.status(404).json({ error: 'Vorstellung nicht gefunden' });
    }

    res.json(data[0]);
});*/

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


/*
app.get('/api/vorstellungen/:movieId', (req, res) => {
    const movieId = req.params.movieId;

    const query = 'SELECT * FROM shows WHERE movie_id = ?';

    // Hier verwenden wir den Callback-Ansatz, der typisch für die MySQL2-Callback-API ist
    db.query(query, [movieId], (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Shows:', err);
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
});*/



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
app.post('/api/tickets', async (req, res) => {
    const { show_id, ticket_type, price } = req.body;
    console.log(req.body);

    if (!show_id || !ticket_type || !price) {
        return res.status(400).json({ error: "Fehlende Ticketdaten" });
    }

    try {
        const { data, error } = await supabase
            .from('tickets')
            .insert([{ show_id, ticket_type, price }]);

        if (error) {
            throw error;
        }

        res.status(201).json({ message: "Ticket erfolgreich gespeichert", ticket: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
*/

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

        // Debugging: Zeige die Raum-Daten
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

        // Debugging: Zeige die zurückgegebenen Ticket-Daten
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

app.get('/shows', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/showsStructure.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/confrimationpageStructure.html'));
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