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
            return res.status(500).json({ message: 'Fehler beim Abrufen der Sitzplätze.' });
        }

        if (!existingSeats || existingSeats.length === 0) {
            return res.status(404).json({ message: 'Keine Sitzplätze zum Erstellen gefunden.' });
        }

        // Sitzplätze aktualisieren und einer Vorstellung zuweisen
        const newSeats = existingSeats.map(seat => ({
            ...seat,
            show_id,
            reserved_at: null, // Optional zurücksetzen
        }));

        // Sitzplätze in der Datenbank aktualisieren
        const { error: insertError } = await supabase.from('seat').upsert(newSeats, {
            returning: 'minimal', // Nur zur Optimierung, falls keine Rückgabe erforderlich
        });

        if (insertError) {
            console.error('Fehler beim Einfügen der Sitzplätze:', insertError);
            return res.status(500).json({ message: 'Fehler beim Einfügen der Sitzplätze.' });
        }

        res.status(201).json({ message: 'Sitzplätze erfolgreich erstellt.' });
    } catch (error) {
        console.error('Fehler beim Erstellen der Sitzplätze:', error);
        res.status(500).json({ message: 'Fehler beim Erstellen der Sitzplätze.' });
    }
});

module.exports = routerCreateShowSeats;
