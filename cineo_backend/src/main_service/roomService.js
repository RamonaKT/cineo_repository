const supabase = require('./database_connection');
const { Room, Seat, Row } = require('../models'); // Hier nehmen wir die Modelle, die du erstellt hast

// Funktion, um die Sitzplätze eines Raumes zu laden
async function getSeatsForRoom(roomId) {
    const { data, error } = await supabase
        .from('seat')
        .select('*')
        .eq('room_id', roomId);
    if (error) {
        throw error;
    }
    return data;
}

// Funktion, um das Layout eines Raumes zu speichern
async function saveRoomLayout(roomNumber, seatCounts, seatsData) {
    try {
        // Raum speichern
        const room = new Room(null, roomNumber, seatCounts.reduce((acc, count) => acc + count, 0)); // Berechne die Kapazität
        const roomResponse = await supabase.from('room').insert([room]);

        if (roomResponse.error) throw new Error(roomResponse.error.message);

        const roomId = roomResponse.data[0].room_id;

        // Reihen speichern
        let rowId = 1;
        for (const seatCount of seatCounts) {
            const row = new Row(null, roomId, seatCount, rowId);
            const rowResponse = await supabase.from('rows').insert([row]);

            if (rowResponse.error) throw new Error(rowResponse.error.message);

            const currentRowId = rowResponse.data[0].row_id;

            // Sitze speichern
            for (let i = 0; i < seatCount; i++) {
                const seatData = seatsData[i];
                const seat = new Seat(
                    null,
                    roomId,
                    currentRowId,
                    seatData.category,
                    seatData.status,
                    seatData.reservedAt
                );
                const seatResponse = await supabase.from('seat').insert([seat]);

                if (seatResponse.error) throw new Error(seatResponse.error.message);
            }
            rowId++;
        }
    } catch (error) {
        console.error(error);
        throw new Error('Fehler beim Speichern des Layouts');
    }
}

module.exports = { getSeatsForRoom, saveRoomLayout };

