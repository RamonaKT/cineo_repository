const express = require('express');

const app = express();
const path = require('path');
const port = 4000;
/*const mysql = require('mysql2/promise');*/
const mysql = require('mysql2');

// MySQL-Verbindung
const db = mysql.createConnection({
    host: 'localhost',
    user: 'granate',
    password: 'cineo4life*',  // Gebt hier euer MySQL-Passwort ein
    database: 'cineo'
});

/*
// MySQL-Verbindung mit Connection Pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'granate',
    password: 'cineo4life*', // Gebt hier euer MySQL-Passwort ein
    database: 'cineo'
});*/


/*
// Verbindung testen
async function testDbConnection() {
    try {
        // Verbindung aus dem Pool holen und Abfrage ausführen
        const [rows, fields] = await db.query('SELECT 1');
        console.log('Datenbankverbindung erfolgreich getestet:', rows);
    } catch (err) {
        console.error('Fehler beim Testen der Datenbankverbindung:', err);
    }
}

// Verbindung testen
testDbConnection();
*/


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

/*
// Alle Filme abrufen
app.get('/api/filme', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Filme');
        res.json(rows); // Erfolgreiche Antwort
    } catch (err) {
        console.error('Fehler beim Abrufen der Filme:', err);
        res.status(500).json({ error: 'Fehler beim Abrufen der Filme' }); // JSON-Fehler
    }
});*/


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


/*
// Alle Showtimes für einen bestimmten Film abrufen
app.get('/api/showtimes/:showtimeId', (req, res) => {
    const showtimeId = req.params.showtimeId;
    const query = 'SELECT * FROM Showtimes WHERE showtime_id = ?';
    db.query(query, [showtimeId], (err, result) => {
        if (err) {
            res.status(500).send('Fehler beim Abrufen der Showtimes');
        } else {
            res.json(result[0]);
        }
    });
});*/

/*
app.get('/api/showtimes/:filme_id', async (req, res) => {
    const filme_id = req.params.filme_id;
    console.log('API-Aufruf mit filme_id:', filme_id); // Logge die angefragte ID

    try {
        // Datenbankabfrage im Promise-Stil
        const [rows] = await db.query('SELECT * FROM showtimes WHERE filme_id = ?', [filme_id]);
        console.log('Datenbank-Ergebnisse:', rows);

        if (!rows || rows.length === 0) {
            console.warn('Keine Vorstellungen gefunden für filme_id:', filme_id);
            return res.status(404).json({ error: 'Keine Vorstellungen gefunden.' });
        }

        res.json(rows); // Sende die Ergebnisse zurück
    } catch (err) {
        console.error('Fehler bei der Abfrage:', err);
        res.status(500).json({ error: 'Interner Serverfehler.' });
    }
});*/


/*
// Ticket buchen
app.post('/api/tickets', (req, res) => {
    const { movie_id, showtime_id, seat_id, ticket_type } = req.body;
    const query = 'INSERT INTO Tickets (movie_id, showtime_id, seat_id, ticket_type) VALUES (?, ?, ?, ?)';
    db.query(query, [movie_id, showtime_id, seat_id, ticket_type], (err, results) => {
        if (err) {
            res.status(500).send('Fehler beim Buchen des Tickets');
        } else {
            res.status(201).json({ message: 'Ticket gebucht', ticketId: results.insertId });
        }
    });
});*/

/*
// Ticket buchen
app.post('/api/tickets', (req, res) => {
    const { movie_id, showtime_id, seat_id, ticket_type } = req.body;
    
    // Preis je nach Tickettyp festlegen
    let price;
    switch (ticket_type) {
        case 'Adult':
            price = 10.00;  // Beispielpreis für Erwachsene
            break;
        case 'Child':
            price = 5.00;  // Beispielpreis für Kinder
            break;
        case 'Student':
            price = 8.00;  // Beispielpreis für Studenten
            break;
        case 'VIP':
            price = 15.00;  // Beispielpreis für VIP
            break;
        default:
            return res.status(400).send('Ungültiger Tickettyp');
    }

    // Ticket in die Tickets-Tabelle einfügen
    const query = 'INSERT INTO Tickets (showtime_id, seat_id, ticket_type, price, created_at) VALUES (?, ?, ?, ?, NOW())';
    
    db.query(query, [showtime_id, seat_id, ticket_type, price], (err, result) => {
        if (err) {
            res.status(500).send('Fehler beim Buchen des Tickets');
        } else {
            // Sitzplatz als reserviert markieren
            const updateSeatQuery = 'UPDATE Seats SET is_reserved = TRUE WHERE seat_id = ?';
            db.query(updateSeatQuery, [seat_id], (err2, result2) => {
                if (err2) {
                    res.status(500).send('Fehler beim Aktualisieren des Sitzplatzes');
                } else {
                    res.status(201).json({ message: 'Ticket erfolgreich gebucht' });
                }
            });
        }
    });
});
*/

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
