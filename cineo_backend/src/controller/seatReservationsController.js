const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const routerSeatReservations = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// API-Endpunkt zum Laden der Sitzplatzdaten
routerSeatReservations.get('/seats', async (req, res) => {
    const { show_id } = req.query;
    try {
        const { data: seats, error } = await supabase
            .from('seat')
            .select('*')
            .eq('show_id', show_id);

        if (error) {
            return res.status(500).json({ message: 'Fehler beim Laden der Sitzplätze', error });
        }

        if (!seats || seats.length === 0) {
            return res.status(404).json({ message: 'Keine Sitzplätze gefunden' });
        }          

        return res.json(seats);
    } catch (error) {
        return res.status(500).json({ message: 'Fehler beim Abrufen der Sitzplatzdaten', error: error.message });
    }
});

// API-Endpunkt zum Reservieren eines Sitzplatzes
routerSeatReservations.post('/reserve', async (req, res) => {
    const { seat_id, session_id } = req.body;
    const reservedAt = new Date().toISOString();    

    try {
        // Update des Sitzplatzes nur, wenn er verfügbar ist (status 0)
        const { error, status } = await supabase
            .from('seat')
            .update({
                status: 1,
                reserved_by: session_id,
                reserved_at: reservedAt
            })
            .eq('seat_id', seat_id)
            .eq('status', 0);

            if (!seat) {
                return res.status(404).json({ message: 'Sitzplatz nicht gefunden' });
              }
              

        // Überprüfen, ob der Update-Vorgang fehlgeschlagen ist oder nichts aktualisiert wurde
        if (error ||  status !== (201||204)) {
            return res.status(409).json({ message: 'Sitzplatz bereits reserviert oder nicht mehr verfügbar.' });
        }

        return res.json({ message: 'Sitzplatz erfolgreich reserviert' });

    } catch (error) {
        
        return res.status(500).json({ message: 'Fehler beim Reservieren des Sitzplatzes', error: error.message });
    }
});

// API-Endpunkt zum Freigeben eines Sitzplatzes
routerSeatReservations.post('/release', async (req, res) => {
    const { seat_id, session_id } = req.body;

    try {
        const { error } = await supabase
            .from('seat')
            .update({ status: 0, reserved_by: null, reserved_at: null })
            .eq('seat_id', seat_id)
            .eq('reserved_by', session_id);

        if (error) {
            return res.status(500).json({ message: 'Fehler beim Freigeben des Sitzplatzes', error });
        }

        if (!seat) {
            return res.status(404).json({ message: 'Sitzplatz nicht gefunden' });
        }

        return res.json({ message: 'Sitzplatz erfolgreich freigegeben' });
    } catch (error) {
        return res.status(500).json({ message: 'Fehler beim Freigeben des Sitzplatzes', error: error.message });
    }
});

// API-Endpunkt zum Freigeben eines Sitzplatzes
routerSeatReservations.post('/check', async (req, res) => {
    const { selectedSeats, sessionId } = req.body;

    try {
        // Überprüfen, ob `selectedSeats` ein Array ist und Elemente enthält
        if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
            return res.status(400).json({ message: 'Ungültige Sitzplatzauswahl' });
        }

        // Hole alle Sitzplätze mit den angegebenen IDs
        const { data, error } = await supabase
            .from('seat')
            .select('seat_id, reserved_by')
            .in('seat_id', selectedSeats);

        if (error) {
            
            return res.status(500).json({ message: 'Fehler beim Abrufen der Sitzplatzdaten' });
        }

        // Prüfen, ob jeder Sitz von der gegebenen sessionId reserviert wurde
        const allReservedBySession = data.every(seat => seat.reserved_by === sessionId);

        return res.json({ allReserved: allReservedBySession });

    } catch (error) {
        
        return res.status(500).json({ message: 'Fehler beim Überprüfen der Sitzplatzreservierungen' });
    }
});

module.exports = routerSeatReservations;