const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Beispiel: Async-Funktion deklarieren
async function getRoomData() {
    const { data: roomData, error: roomCheckError } = await supabase.from('room').select('*');
    if (roomCheckError) {
        throw new Error(roomCheckError.message);
    }
    return roomData;
}

// Aufruf der Funktion
getRoomData().then(roomData => {
    console.log(roomData);
}).catch(error => {
    console.error(error);
});


async function fetchRoomAndSeatsData() {
    try {
        // Abrufen der Reihen-Daten
        const { data: rowData, error: rowCheckError } = await supabase.from('rows').select('*');
        if (rowCheckError) {
            console.error('Fehler beim Abrufen der Reihen:', rowCheckError);
        } else {
            console.log("Aktuelle Reihen:", rowData);
        }

        // Abrufen der Sitzplätze-Daten
        const { data: seatData, error: seatCheckError } = await supabase.from('seat').select('*');
        if (seatCheckError) {
            console.error('Fehler beim Abrufen der Sitzplätze:', seatCheckError);
        } else {
            console.log("Aktuelle Sitzplätze:", seatData);
        }
    } catch (error) {
        console.error('Fehler beim Abrufen von Reihen und Sitzplätzen:', error);
    }
}

// Aufruf der Async-Funktion
fetchRoomAndSeatsData();

// Funktion zum Speichern des Layouts in Supabase
async function saveLayout(layoutData) {
    const { roomNumber, seatCounts, seatsData } = layoutData;
    const now = new Date().toISOString();

    try {
        console.log("Speichere Raum:", { roomNumber, seatCounts });
        const { error: roomError } = await supabase
            .from('room')
            .upsert([{
                room_id: roomNumber,
                created_at: now,
                capacity: seatCounts.reduce((total, count) => total + count, 0)
            }], { onConflict: ['room_id'] });

        if (roomError) {
            console.error("Fehler beim Speichern des Raums:", roomError);
            throw new Error(roomError.message);
        }

        console.log("Speichere Reihen:");
        const rows = seatCounts.map((seat_count, index) => ({
            row_id: roomNumber * 1000 + (index + 1),
            created_at: now,
            seat_count,
            row_number: index + 1,
        }));
        console.log("Generierte Reihen:", rows);

        const { error: rowError } = await supabase
            .from('rows')
            .upsert(rows, { onConflict: ['row_id'] });

        if (rowError) {
            console.error("Fehler beim Speichern der Reihen:", rowError);
            throw new Error(rowError.message);
        }

        console.log("Speichere Sitzplätze:");
        const seats = [];
        seatsData.forEach((row, rowIndex) => {
            row.forEach((seat, seatIndex) => {
                seats.push({
                    seat_id: roomNumber * 1000000 + (rowIndex + 1) * 1000 + (seatIndex + 1),
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
        console.log("Generierte Sitzplätze:", seats);

        const { error: seatError } = await supabase
            .from('seat')
            .upsert(seats, { onConflict: ['seat_id'] });

        if (seatError) {
            console.error("Fehler beim Speichern der Sitzplätze:", seatError);
            throw new Error(seatError.message);
        }

        console.log("Layout erfolgreich gespeichert!");
        return { message: 'Layout erfolgreich gespeichert' };
    } catch (err) {
        console.error("Fehler in saveLayout:", err.message, err.stack);
        throw new Error(err.message);
    }
}

// Endpunkt zum Speichern des Layouts
router.post('/api/saveLayout', async (req, res) => {
    console.log("Empfangene Daten:", req.body); // Logge die empfangenen Daten
    const { roomNumber, seatCounts, seatsData } = req.body;

    // Validierung
    if (!Number.isInteger(roomNumber) || roomNumber <= 0) {
        console.error("Ungültige Raumnummer:", roomNumber);
        return res.status(400).json({ error: 'Ungültige Raumnummer.' });
    }

    if (!Array.isArray(seatCounts) || seatCounts.length === 0) {
        console.error("Ungültige Sitzanzahl:", seatCounts);
        return res.status(400).json({ error: 'Ungültige Sitzanzahl.' });
    }

    if (!Array.isArray(seatsData) || seatsData.length !== seatCounts.length) {
        console.error("Ungültige Sitzdaten:", seatsData);
        return res.status(400).json({ error: 'Ungültige Sitzdaten.' });
    }

    try {
        const result = await saveLayout({ roomNumber, seatCounts, seatsData });
        console.log("Erfolgreiches Ergebnis:", result); // Logge das Ergebnis
        return res.status(200).json(result);
    } catch (err) {
        console.error("Fehler beim Speichern des Layouts: :(((Controller)", err.message, err.stack); // Detaillierte Fehlerausgabe
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
