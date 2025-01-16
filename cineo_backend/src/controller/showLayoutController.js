const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const routerLayout = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Funktion zum Speichern des Layouts in Supabase
async function saveLayout(layoutData) {
    const { roomNumber, seatCounts, seatsData } = layoutData;
    const now = new Date().toISOString();

    try {
        const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .upsert([{
                room_id: roomNumber,
                created_at: now,
                capacity: seatCounts.reduce((total, count) => total + count, 0)
            }], { onConflict: ['room_id'] });

        // Logge die Antwort von Supabase (Raum)
        if (roomError) {
           
            throw new Error(roomError.message);
        } else {

        }

        // Logge und speichere Reihen
        
        const rows = seatCounts.map((seat_count, index) => ({
            row_id: roomNumber * 1000 + (index + 1),
            created_at: now,
            seat_count,
            row_number: index + 1,
        }));

        for (const row of rows) {
            const { data: rowData, error: rowError } = await supabase
                .from('rows')
                .upsert(row, { onConflict: ['row_id'] });

            // Logge die Antwort von Supabase (Reihe)
            if (rowError) {
                
                throw new Error(rowError.message);
            } else {
                
            }
        }

        // Logge und speichere Sitzplätze
        
        for (const [rowIndex, row] of seatsData.entries()) {
            for (const [seatIndex, seat] of row.entries()) {
                const seatData = {
                    seat_id: roomNumber * 1000000 + (rowIndex + 1) * 1000 + (seatIndex + 1),
                    created_at: now,
                    room_id: roomNumber,
                    row_id: roomNumber * 1000 + (rowIndex + 1),
                    category: seat.category,
                    status: 0,
                    show_id: null,
                    seat_number: (seatIndex +1),
                    reserved_at: null,
                };

                const { data: seatDataResponse, error: seatError } = await supabase
                    .from('seat')
                    .upsert(seatData, { onConflict: ['seat_id'] });

                // Logge die Antwort von Supabase (Sitzplatz)
                if (seatError) {
                    
                    throw new Error(seatError.message);
                } else {
                    
                }
            }
        }

        
        return { message: 'Layout erfolgreich gespeichert', status: 'success' };
    } catch (err) {
        
        return { error: err.message, status: 'error' };  // Gib die Fehlernachricht zurück
    }
}

// Endpunkt zum Speichern des Layouts
routerLayout.post('/save', async (req, res) => {
    
    const { roomNumber, seatCounts, seatsData } = req.body;

    // Validierung der Eingaben
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

        // Wenn das Ergebnis einen Fehler enthält, gebe ihn zurück
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Rückgabe der erfolgreichen Antwort
        return res.status(200).json(result); 
    } catch (err) {
        
        return res.status(500).json({ error: err.message });
    }
});


module.exports = {
    saveLayout,
    routerLayout,
};

module.exports = routerLayout;
