const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Funktion zum Speichern des Layouts in Supabase
async function saveLayout(layoutData) {
    const { roomNumber, seatCounts, seatsData } = layoutData;

    if (!roomNumber || seatCounts.length === 0 || seatsData.length === 0) {
        throw new Error('Fehlende Layout-Daten');
    }

    try {
        // 1. Raum in die Tabelle 'room' speichern
        const { data: roomDataResponse, error: roomError } = await supabase
            .from('room')
            .upsert([{
                room_id: roomNumber,  // room_id wird nun auf roomNumber gesetzt
                capacity: seatCounts.reduce((total, count) => total + count, 0)  // Berechne die Kapazität als Summe der Sitzplätze
            }], { onConflict: ['room_id'] });

        if (roomError) {
            throw new Error(roomError.message);
        }

        const roomId = roomDataResponse[0].room_id; // room_id wird direkt der Raum-Nummer zugewiesen

        // 2. Reihen in die Tabelle 'rows' speichern
        const rows = seatCounts.map((seat_count, index) => ({
            room_id: roomId,
            seat_count: seat_count,
            row_number: index + 1 // Reihen beginnen bei 1
        }));

        const { data: rowDataResponse, error: rowError } = await supabase
            .from('rows')
            .upsert(rows, { onConflict: ['row_id'] });

        if (rowError) {
            throw new Error(rowError.message);
        }

        // 3. Sitzplätze in die Tabelle 'seat' speichern
        const seats = [];
        rowDataResponse.forEach((row, rowIndex) => {
            const rowSeats = seatsData[rowIndex].map(seat => ({
                room_id: roomId,
                row_id: row.row_id,
                category: seat.category,
                status: seat.status,
                show_id: seat.show_id,
                reserved_at: seat.reserved_at
            }));
            seats.push(...rowSeats);
        });

        const { data: seatDataResponse, error: seatError } = await supabase
            .from('seat')
            .upsert(seats, { onConflict: ['seat_id'] });

        if (seatError) {
            throw new Error(seatError.message);
        }

        return {
            room: roomDataResponse,
            rows: rowDataResponse,
            seats: seatDataResponse
        };
    } catch (err) {
        throw new Error(`Fehler beim Speichern des Layouts: ${err.message}`);
    }
}

// Endpunkt zum Speichern des Layouts
router.post('/api/save-layout', async (req, res) => {
    const { roomNumber, seatCounts, seatsData } = req.body;

    try {
        const savedLayout = await saveLayout({ roomNumber, seatCounts, seatsData });
        res.status(200).json({
            message: 'Layout erfolgreich gespeichert',
            data: savedLayout
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
