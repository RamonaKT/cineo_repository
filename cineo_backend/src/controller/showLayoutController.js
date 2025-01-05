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
        const { error: roomError } = await supabase
            .from('room')
            .upsert([{
                room_id: roomNumber, // room_id wird auf roomNumber gesetzt
                capacity: seatCounts.reduce((total, count) => total + count, 0) // Kapazität als Summe der Sitzplätze
            }], { onConflict: ['room_id'] });

        if (roomError) {
            throw new Error(roomError.message);
        }

        // 2. Reihen in die Tabelle 'rows' speichern
        const rows = seatCounts.map((seat_count, index) => ({
            row_id: `${roomNumber}_${index + 1}`, // row_id generiert als "room_id_row_number"
            room_id: roomNumber,
            seat_count: seat_count,
            row_number: index + 1 // Reihen beginnen bei 1
        }));

        const { error: rowError } = await supabase
            .from('rows')
            .upsert(rows, { onConflict: ['row_id'] });

        if (rowError) {
            throw new Error(rowError.message);
        }

        // 3. Sitzplätze in die Tabelle 'seat' speichern
        const seats = [];
        rows.forEach((row, rowIndex) => {
            const rowSeats = seatsData[rowIndex].map((seat, seatIndex) => ({
                seat_id: `${roomNumber}_${row.row_number}_${seatIndex + 1}`, // seat_id generiert als "room_id_row_number_seat_number"
                room_id: roomNumber,
                row_id: row.row_id,
                category: seat.category,
                status: seat.status,
                show_id: seat.show_id,
                reserved_at: seat.reserved_at
            }));
            seats.push(...rowSeats);
        });

        const { error: seatError } = await supabase
            .from('seat')
            .upsert(seats, { onConflict: ['seat_id'] });

        if (seatError) {
            throw new Error(seatError.message);
        }

        return { message: 'Layout erfolgreich gespeichert' };
    } catch (err) {
        throw new Error(`Fehler beim Speichern des Layouts: ${err.message}`);
    }
}

// Endpunkt zum Speichern des Layouts

router.post('/api/saveLayout', async (req, res) => {
    const { roomNumber, seatCounts, seatsData } = req.body;

    try {
        // 1. Raum speichern
        const { data: roomData, error: roomError } = await supabase
            .from('room')
            .upsert([{ room_number: roomNumber }])
            .select();

        if (roomError) throw new Error(`Fehler beim Speichern des Raums: ${roomError.message}`);
        const roomId = roomData[0].room_id;

        // 2. Reihen speichern
        const rowsToInsert = seatCounts.map((row, index) => ({
            row_number: index + 1,
            seat_count: row,
        }));

        const { data: rowsData, error: rowsError } = await supabase
            .from('rows')
            .insert(rowsToInsert)
            .select();

        if (rowsError) throw new Error(`Fehler beim Speichern der Reihen: ${rowsError.message}`);
        const rowIds = rowsData.map(row => row.row_id);

        // 3. Sitze speichern
        const seatsToInsert = seatsData.map(seat => ({
            room_id: roomId,
            row_id: rowIds[seat.rowNumber - 1], // Mapping basierend auf rowNumber
            category: seat.category,
            status: seat.status,
        }));

        const { data: seatsDataResult, error: seatsError } = await supabase
            .from('seat')
            .insert(seatsToInsert)
            .select();

        if (seatsError) throw new Error(`Fehler beim Speichern der Sitze: ${seatsError.message}`);

        // Erfolgreiches Speichern aller Daten
        res.status(200).json({
            message: 'Layout erfolgreich gespeichert',
            data: {
                room: roomData,
                rows: rowsData,
                seats: seatsDataResult,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
