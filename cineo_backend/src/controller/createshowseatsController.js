const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const routerCreateShowSeats = express.Router();

routerCreateShowSeats.post('/create', async (req, res) => {
    const { room_id, show_id } = req.body;

    try {
        // Sitzplätze ohne zugewiesene Vorstellung abrufen
        const { data: existingSeats, error: selectError } = await supabase
            .from('seat')
            .select('*')
            .eq('room_id', room_id)
            .is('show_id', null);

        if (selectError) {
            console.log('Keine Sitzplätze gefunden');
            console.error('Fehler beim Abrufen der Sitzplätze:', selectError);
            return res.status(500).json({ message: 'Fehler beim Abrufen der Sitzplätze.' });
        }

        if (!existingSeats || existingSeats.length === 0) {
            console.log('Keine Sitzplätze gefunden.');
            return res.status(404).json({ message: 'Keine Sitzplätze zum Erstellen gefunden.' });
        }

        // Neue Sitzplätze vorbereiten (alle Spalten außer 'seat_id' werden übernommen)
        const newSeats = existingSeats.map(seat => {
            // Die letzten 3 Ziffern der seat_id für jeden Sitzplatz extrahieren
            const seatNumber = seat.seat_id.toString().slice(-3);

            // Neue seat_id basierend auf der alten seat_id und der show_id erstellen
            const newSeatId = show_id * 100000 + seat.seat_id;

            // Überprüfung: Console log, um zu sehen, wie die neuen Daten aussehen
            console.log('Neue Seat-Daten:', {
                seat_id: newSeatId,
                room_id: seat.room_id,
                row_id: seat.row_id,
                category: seat.category,
                status: seat.status,
                show_id: show_id, 
                seat_number: seatNumber,
                reserved_at: null, 
                reserved_by: seat.reserved_by,
                created_at: seat.created_at,
            });

            return {
                seat_id: newSeatId,        // Neue seat_id erstellen
                room_id: seat.room_id,
                row_id: seat.row_id,
                category: seat.category,
                status: seat.status,
                show_id: show_id, 
                seat_number: seatNumber,  
                reserved_at: null, 
                reserved_by: seat.reserved_by, 
                created_at: seat.created_at // Optional, wenn du es übernehmen möchtest
            };
        });

        // Fehlerbehebung: Console log der neuen Sitzplätze
        console.log('Zu erstellende Sitzplätze:', newSeats);

        // Upsert: Sitzplätze in der Datenbank einfügen oder aktualisieren (basierend auf seat_id)
        const { data, error: upsertError } = await supabase
            .from('seat')
            .upsert(newSeats, { onConflict: ['seat_id'] });

        // Fehler beim Upsert behandeln
        if (upsertError) {
            console.error('Fehler beim Upsert der Sitzplätze:', upsertError);
            return res.status(500).json({ message: 'Fehler beim Upsert der Sitzplätze.' });
        }

        // Erfolgreiche Antwort zurück an den Client
        console.log('Upserted Daten:', data); // Optional: Überprüfe, was eingefügt oder aktualisiert wurde
        res.status(201).json({ message: 'Sitzplätze erfolgreich erstellt oder aktualisiert.' });

    } catch (error) {
        console.log('Fehler beim Erstellen oder Updaten');
        console.error('Fehler beim Erstellen oder Updaten der Sitzplätze:', error);
        res.status(500).json({ message: 'Fehler beim Erstellen oder Updaten der Sitzplätze.' });
    }
});

module.exports = routerCreateShowSeats;
