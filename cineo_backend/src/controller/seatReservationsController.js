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
        // Versuche den Sitzplatz zu aktualisieren, wenn er verfügbar ist (status = 0)
        const { data, error } = await supabase
            .from('seat')
            .update({
                status: 1,            // Status auf reserviert setzen
                reserved_by: session_id,  // Session-ID als Reservierer
                reserved_at: reservedAt  // Zeitpunkt der Reservierung
            })
            .eq('seat_id', seat_id)      // Sitzplatz ID
            .eq('status', 0)             // Nur aktualisieren, wenn der Status 0 (verfügbar) ist
            .select();                  // Daten nach dem Update zurückgeben

        // Wenn der Sitzplatz nicht gefunden oder der Update nicht durchgeführt wurde
        if (error || data.length === 0) {
            return res.status(409).json({ message: 'Sitzplatz bereits reserviert oder nicht mehr verfügbar.' });
        }

        // Erfolgreiche Reservierung
        return res.json({ message: 'Sitzplatz erfolgreich reserviert' });

    } catch (error) {
        console.error("Fehler beim Reservieren:", error);
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

        return res.json({ message: 'Sitzplatz erfolgreich freigegeben' });
    } catch (error) {
        return res.status(500).json({ message: 'Fehler beim Freigeben des Sitzplatzes', error: error.message });
    }
});

module.exports = routerSeatReservations;