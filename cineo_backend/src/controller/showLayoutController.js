const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Funktion zum Speichern des Layouts in Supabase
async function saveLayout(layoutData, userId) {
    try {
        // Speichern des Layouts in der Tabelle 'layouts'
        const { data, error } = await supabase
            .from('layouts') // Stelle sicher, dass diese Tabelle existiert
            .upsert([{ user_id: userId, layout_data: layoutData }]); // Upsert, um entweder zu aktualisieren oder zu speichern

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (err) {
        throw new Error(`Fehler beim Speichern des Layouts: ${err.message}`);
    }
}

// Endpunkt zum Speichern des Layouts
router.post('/api/save-layout', async (req, res) => {
    const { layoutData, userId } = req.body;

    // Überprüfen, ob Layout-Daten und userId vorhanden sind
    if (!layoutData || !userId) {
        return res.status(400).json({ error: 'Fehlende Layout-Daten oder Benutzer-ID' });
    }

    try {
        const savedLayout = await saveLayout(layoutData, userId);
        res.status(200).json({ message: 'Layout erfolgreich gespeichert', data: savedLayout });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Weitere bestehende Endpunkte für Sitzplätze und Reservierungen (bleiben unverändert)
const { getSeatsForRoom } = require('./roomService');
const { confirmReservation } = require('./seatReservationService');

// Endpunkt zum Abrufen der Sitzplätze
router.get('/api/room/:roomId/seats', async (req, res) => {
    try {
        const seats = await getSeatsForRoom(req.params.roomId);
        res.json(seats);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpunkt zum Bestätigen der Reservierung
router.post('/api/confirm-reservation', async (req, res) => {
    try {
        const { seatIds, roomId } = req.body;
        const result = await confirmReservation(seatIds, roomId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
