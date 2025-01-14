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
        // Überprüfe zunächst den Status
        const { data: seatData, error: seatError } = await supabase
        .from('seat')
        .select('seat_id, status')
        .eq('seat_id', seat_id)
        .eq('status', 0)
        .single();

        if (seatError || !seatData) {
        return res.status(409).json({ message: 'Sitzplatz bereits reserviert.' });
        }

        // Führe das Update nur aus, wenn der Platz verfügbar ist
        const { error: updateError } = await supabase
        .from('seat')
        .update({ status: 1, reserved_by: session_id, reserved_at: reservedAt })
        .eq('seat_id', seat_id);

        if (updateError) {
        return res.status(500).json({ message: 'Fehler beim Reservieren des Sitzplatzes', error: updateError.message });
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

        return res.json({ message: 'Sitzplatz erfolgreich freigegeben' });
    } catch (error) {
        return res.status(500).json({ message: 'Fehler beim Freigeben des Sitzplatzes', error: error.message });
    }
});

module.exports = routerSeatReservations;