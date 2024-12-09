const express = require('express');
const mysql = require('mysql2');
const app = express();
const path = require('path');
const port = 4000;

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

// 2. HTML-Seiten ausliefern
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/homepageStructure.html'));
});

app.get('/tickets', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/ticketsStructure.html'));
});

app.get('/program', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/programpageStructure.html'));
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

// Ticket buchen
app.post('/api/tickets', (req, res) => {
    const { film_id, sitznummer } = req.body;
    if (!film_id || !sitznummer) {
        return res.status(400).send('Film-ID und Sitznummer sind erforderlich');
    }

    const query = 'INSERT INTO Tickets (film_id, sitznummer) VALUES (?, ?)';
    db.query(query, [film_id, sitznummer], (err, results) => {
        if (err) {
            res.status(500).send('Fehler bei der Ticketbuchung');
            return;
        }
        res.status(201).json({ message: 'Ticket gebucht', ticketId: results.insertId });
    });
});

// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
