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
    let { room_id, show_id } = req.body;

    // Sicherstellen, dass room_id und show_id als Zahlen verarbeitet werden
    room_id = parseInt(room_id, 10);
    show_id = parseInt(show_id, 10);

    if (isNaN(room_id) || isNaN(show_id)) {
        console.log(`Ungültige Eingaben - room_id: ${room_id}, show_id: ${show_id}`);
        return res.status(400).json({ error: 'room_id und show_id müssen gültige Zahlen sein.' });
    }

    try {
        // Sitzplätze abrufen
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

        // Sitzplätze vorbereiten
        const newSeats = existingSeats.map(seat => {
            const seatNumber = seat.seat_id.toString().slice(-3);
            const newSeatId = show_id * 10000000 + seat.seat_id;

            return {
                seat_id: newSeatId,
                room_id: seat.room_id,
                row_id: seat.row_id,
                category: seat.category,
                status: 0,
                show_id: show_id,
                seat_number: seatNumber,
                reserved_at: null,
                reserved_by: seat.reserved_by,
            };
        });

        console.log('Zu erstellende Sitzplätze:', newSeats);

        // Sitzplätze einfügen oder aktualisieren
        const { data: upsertData, error: upsertError } = await supabase
            .from('seat')
            .upsert(newSeats, { onConflict: ['seat_id'] });

        if (upsertError) {
            console.error('Fehler beim Upsert der Sitzplätze:', upsertError);
            return res.status(503).json({ error: 'Fehler beim Upsert der Sitzplätze.', details: upsertError.message });
        }

        res.status(200).json({
            message: 'Sitzplätze erfolgreich erstellt.',
            data,
        });

    } catch (error) {
        console.error('Fehler beim Erstellen der Sitzplätze:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen oder Updaten der Sitzplätze.', details: error.message });
    }
});

module.exports = routerCreateShowSeats;

