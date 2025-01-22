const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const routerSeatReservations = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());

const cors = require('cors');
const { router } = require('../../server');
app.use(cors({
    origin: '*',  // Alle Ursprünge zulassen (oder hier den spezifischen Ursprung angeben)
}));


// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/*
// API-Endpunkt zum Laden der Sitzplatzdaten
routerSeatReservations.get('/seats', async (req, res) => {
    const { show_id } = req.query;
    try {
        const { data: seats, error } = await supabase
            .from('seat')
            .select('*')
            .eq('show_id', show_id);

        if (!seats || seats.length === 0) {
            return res.status(404).json({ message: 'Keine Sitzplätze gefunden' });
        }          

        return res.json(seats);
    } catch (error) {
        return res.status(500).json({ message: 'Fehler beim Abrufen der Sitzplatzdaten', error: error.message });
    }
});*/


routerSeatReservations.get('/hello' ,(req, res) => {
    res.json({ message: 'Route funktioniert!' });
});



/*
// API-Endpunkt zum Laden der Sitzplatzdaten
routerSeatReservations.get('/seats', async (req, res) => {
    const { show_id } = req.query;

    console.log(`[DEBUG] Request received: show_id=${show_id}`); // Eingabedaten prüfen

    try {
        const { data: seats, error } = await supabase
            .from('seat')
            .select('*')
            .eq('show_id', show_id);

        console.log(`[DEBUG] Query result: `, { seats, error }); // Ergebnis der Abfrage prüfen

        if (error) {
            console.error(`[ERROR] Supabase error: `, error);
            return res.status(500).json({ message: 'Fehler bei der Datenbankabfrage', error });
        }

        if (!seats || seats.length === 0) {
            console.log(`[INFO] Keine Sitzplätze gefunden für show_id=${show_id}`);
            return res.status(404).json({ message: 'Keine Sitzplätze gefunden' });
        }

        console.log(`[DEBUG] Returning seats: `, seats); // Erfolgreiche Daten ausgeben
        return res.json(seats);
    } catch (error) {
        console.error(`[ERROR] Fehler im API-Endpunkt: `, error.message);
        return res.status(500).json({ message: 'Fehler beim Abrufen der Sitzplatzdaten', error: error.message });
    }
});*/



routerSeatReservations.post('/reserve', async (req, res) => {
    const { seat_id, session_id } = req.body;
    const reservedAt = new Date();
    const reservationExpiresAt = new Date(reservedAt.getTime() +  10 * 60 * 1000); // 10 Minuten gültig

    if ((!seat_id) || (!session_id)) {
        return res.status(400).json({ error: 'Fehlende Daten'});
    }

    try {
        // Überprüfen, ob der Sitzplatz verfügbar oder abgelaufen ist
        const { data: seatData, error: seatError } = await supabase
            .from('seat')
            .select('seat_id, status, reserved_at')
            .eq('seat_id', seat_id)
            .single();

        if (seatError) {
            return res.status(500).json({ message: 'Fehler beim Überprüfen des Sitzplatzes.', error: seatError.message });
        }

        // Wenn der Sitzplatz bereits reserviert ist und die Reservierung nicht abgelaufen ist, abbrechen
        if (!(seatData.status === 0)) {
            const reservedAtTimestamp = new Date(seatData.reserved_at).getTime();
            const now = new Date().getTime();
            if (reservedAtTimestamp +  10 *  60 * 1000 > now) {
                return res.status(409).json({ message: 'Sitzplatz bereits reserviert.' });
            }
            if (seatData.status === 2){
                return res.status(409).json({ message: 'Sitzplatz bereits gebucht.' });
            }
        }

        // Aktualisierung der Sitzplatzdaten
        const { error: updateError } = await supabase
            .from('seat')
            .update({
                status: 1,
                reserved_by: session_id,
                reserved_at: reservedAt.toISOString(),
                reservation_expires_at: reservationExpiresAt.toISOString()
            })
            .eq('seat_id', seat_id);

        if (updateError) {
            return res.status(500).json({ message: 'Fehler beim Reservieren des Sitzplatzes.', error: updateError.message });
        }

        return res.json({ message: 'Sitzplatz erfolgreich reserviert' });
    } catch (error) {
        return res.status(500).json({ message: 'Catch - Fehler beim Reservieren des Sitzplatzes.', error: error.message });
    }
});


routerSeatReservations.post('/release', async (req, res) => {
    console.log("Daten empfangen:", req.body);
    const { seat_id, session_id } = req.body;

    try {
        const { error } = await supabase
            .from('seat')
            .update({ status: 0, reserved_by: null, reserved_at: null })
            .eq('seat_id', seat_id)
            .eq('reserved_by', session_id);

        if (error) {
            console.error("Fehler beim Freigeben:", error);
            return res.status(500).json({ message: 'Fehler beim Freigeben des Sitzplatzes', error });
        }

        return res.json({ message: 'Sitzplatz erfolgreich freigegeben' });
    } catch (error) {
        console.error("Fehler beim Backend:", error.message);
        return res.status(500).json({ message: 'Fehler beim Freigeben des Sitzplatzes', error: error.message });
    }
});

// API-Endpunkt zum Freigeben eines Sitzplatzes
routerSeatReservations.post('/check', async (req, res) => {
    const { selectedSeats, sessionId } = req.body;

    try {
        // Überprüfen, ob `selectedSeats` ein Array ist und Elemente enthält
        if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
            return res.status(400).json({ message: 'Ungültige Sitzplatzauswahl' });
        }

        // Hole alle Sitzplätze mit den angegebenen IDs
        const { data, error } = await supabase
            .from('seat')
            .select('seat_id, reserved_by')
            .in('seat_id', selectedSeats);

        if (error) {
            
            return res.status(500).json({ message: 'Fehler beim Abrufen der Sitzplatzdaten' });
        }

        // Prüfen, ob jeder Sitz von der gegebenen sessionId reserviert wurde
        const allReservedBySession = data.every(seat => seat.reserved_by === sessionId);

        return res.json({ allReserved: allReservedBySession });

    } catch (error) {
        
        return res.status(500).json({ message: 'Fehler beim Überprüfen der Sitzplatzreservierungen' });
    }
});


routerSeatReservations.post('/expire', async (req, res) => {
    try {
        const now = new Date().toISOString();

        // Alle abgelaufenen Reservierungen freigeben
        const { error } = await supabase
            .from('seat')
            .update({ status: 0, reserved_by: null, reserved_at: null, reservation_expires_at: null })
            .lt('reservation_expires_at', now)
            .eq('status', 1);

        return res.json({ message: 'Abgelaufene Reservierungen erfolgreich freigegeben.' });
    } catch (error) {
        return res.status(500).json({ message: 'Fehler beim Freigeben abgelaufener Reservierungen.', error: error.message });
    }
});


routerSeatReservations.post('/book', async (req, res) => {
    const { seat_id, user_id } = req.body;

    try {
        // Status auf "gebucht" setzen
        const { error } = await supabase
            .from('seat')
            .update({
                status: 2, // Gebucht
                reserved_by: null,
                reserved_at: null,
                reservation_expires_at: null,
            })
            .eq('seat_id', seat_id)
            .eq('reserved_by', user_id) // Prüfen, ob der Nutzer diesen Sitz reserviert hatte

        if(error){
            return res.status(500);
        }

        return res.json({ message: 'Sitzplatz erfolgreich gebucht' });
    } catch (error) {
        return res.status(500).json({ message: 'Fehler beim Buchen des Sitzplatzes', error: error.message });
    }
});


module.exports = routerSeatReservations;