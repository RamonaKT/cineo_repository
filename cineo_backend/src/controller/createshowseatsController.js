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
            console.error('Fehler beim Abrufen der Sitzplätze:', selectError);
            return res.status(500).json({ error: 'Fehler beim Abrufen der Sitzplätze.', details: selectError.message });
        }

        if (!existingSeats || existingSeats.length === 0) {
            console.log('Keine Sitzplätze zum Erstellen gefunden.');
            return res.status(404).json({ message: 'Keine Sitzplätze zum Erstellen gefunden.' });
        }

        // Neue Sitzplätze vorbereiten (alle Spalten außer 'seat_id' werden übernommen)
        const newSeats = existingSeats.map(seat => {
            const seatNumber = seat.seat_id.toString().slice(-3); // Extrahiere die letzten 3 Ziffern der seat_id
            const newSeatId = show_id * 100000 + seat.seat_id; // Neue seat_id erstellen

            // Logge die neuen Seat-Daten zur Überprüfung
            console.log('Neue Seat-Daten:', {
                seat_id: newSeatId,
                room_id: seat.room_id,
                row_id: seat.row_id,
                category: seat.category,
                status: 0,
                show_id: show_id,
                seat_number: seatNumber,
                reserved_at: null,
                reserved_by: seat.reserved_by,
                created_at: seat.created_at,
            });

            return {
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
            };
        });

        // Logge die neuen Sitzplätze zur Fehlerbehebung
        console.log('Zu erstellende Sitzplätze:', newSeats);

        // Upsert: Sitzplätze in die Datenbank einfügen oder aktualisieren
        const { data, status, statusText, error: upsertError } = await supabase
            .from('seat')
            .upsert(newSeats, { onConflict: ['seat_id'] });

        if (upsertError) {
            console.error('Fehler beim Upsert der Sitzplätze:'+ upsertError.message,upsertError);
            return res.status(500).json({ error: 'Fehler beim Upsert der Sitzplätze.', details: upsertError.message });
        }
       
        // Erfolgreiche Antwort zurück an den Client
        console.log('Upserted Daten:', data); // Zeigt die eingefügten oder aktualisierten Daten
        console.log('Status:', status); // Statuscode der Antwort
        console.log('StatusText:', statusText); // StatusText der Antwort

        res.status(status).json({
            message: 'Sitzplätze erfolgreich erstellt oder aktualisiert.',
            data: data, // Rückgabe der upserted Daten
            status: status,
            statusText: statusText
        });

    } catch (error) {
        console.error('Fehler beim Erstellen oder Updaten der Sitzplätze:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen oder Updaten der Sitzplätze.', details: error.message });
    }
});

module.exports = routerCreateShowSeats;

