const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Funktion zum Speichern des Layouts in Supabase
async function saveLayout(layoutData) {
    const { roomNumber, seatCounts, seatsData } = layoutData;

    if (!roomNumber || !Array.isArray(seatCounts) || seatCounts.length === 0 || !Array.isArray(seatsData)) {
        throw new Error('Fehlende oder ungültige Layout-Daten');
    }

    try {
        const now = new Date().toISOString();

        // 1. Raum speichern
        const { error: roomError } = await supabase
            .from('room')
            .upsert([{
                room_id: roomNumber,
                created_at: now,
                capacity: seatCounts.reduce((total, count) => total + count, 0)
            }], { onConflict: ['room_id'] });

        if (roomError) throw new Error(roomError.message);

        // 2. Reihen speichern
        const rows = seatCounts.map((seat_count, index) => ({
            row_id: roomNumber * 1000 + (index + 1), // Numerischer Schlüssel
            created_at: now,
            seat_count,
            row_number: index + 1,
        }));

        const { error: rowError } = await supabase
            .from('rows')
            .upsert(rows, { onConflict: ['row_id'] });

        if (rowError) throw new Error(rowError.message);

        // 3. Sitzplätze speichern
        const seats = [];
        seatsData.forEach((row, rowIndex) => {
            row.forEach((seat, seatIndex) => {
                seats.push({
                    seat_id: roomNumber * 1000000 + (rowIndex + 1) * 1000 + (seatIndex + 1), // Numerischer Schlüssel
                    created_at: now,
                    room_id: roomNumber,
                    row_id: roomNumber * 1000 + (rowIndex + 1),
                    category: seat.category,
                    status: 0,
                    reserved_at: null,
                    show_id: null
                });
            });
        });

        const { error: seatError } = await supabase
            .from('seat')
            .upsert(seats, { onConflict: ['seat_id'] });

        if (seatError) throw new Error(seatError.message);

        return { message: 'Layout erfolgreich gespeichert' };
    } catch (err) {
        console.error('Fehler beim Speichern des Layouts:', err.message);
        throw new Error(err.message);
    }
}

// Endpunkt zum Speichern des Layouts
router.post('/api/saveLayout', async (req, res) => {
    const { roomNumber, seatCounts, seatsData } = req.body;

    if (!Number.isInteger(roomNumber) || roomNumber <= 0) {
        return res.status(400).json({ error: 'Ungültige Raumnummer.' });
    }

    if (!Array.isArray(seatCounts) || seatCounts.length === 0) {
        return res.status(400).json({ error: 'Ungültige Sitzanzahl.' });
    }

    if (!Array.isArray(seatsData) || seatsData.length !== seatCounts.length) {
        return res.status(400).json({ error: 'Ungültige Sitzdaten.' });
    }

    try {
        const result = await saveLayout({ roomNumber, seatCounts, seatsData });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
