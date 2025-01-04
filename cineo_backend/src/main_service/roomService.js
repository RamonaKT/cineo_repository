const supabase = require('./database_connection');

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

module.exports = { getSeatsForRoom };
