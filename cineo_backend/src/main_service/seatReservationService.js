const supabase = require('./database_connection');

// Funktion, um die Sitzplatz-Reservierungen zu bestätigen
async function confirmReservation(seatIds, roomId) {
    const { data, error } = await supabase
        .from('seat')
        .update({ status: 'booked' })
        .in('seat_id', seatIds);
    if (error) {
        throw error;
    }
    return data;
}

module.exports = { confirmReservation };
