const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const mainRouter = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());
// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

mainRouter.get('/alleVorstellungen', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('shows')
            .select('show_id, date, time, movie_title, room_id');

        if (error) {
            return res.status(500).json({ message: 'Fehler beim Abrufen der Vorstellungen', error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Keine Vorstellungen gefunden' });
        }

        res.json(data);
    } catch (error) {
        console.error('Fehler beim Abrufen der Vorstellungen:', error);
        res.status(500).json({ message: 'Serverfehler', error: error.message });
    }
});

// API-Endpunkt, um alle Filme abzurufen
mainRouter.get('/alleFilme', async (req, res) => {
    const { data, error } = await supabase
        .from('movies')
        .select('movie_id, title, image, duration'); // Füge "movie_id" zu den abgerufenen Feldern hinzu

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Keine Filme gefunden' });
    }

    res.json(data); // Gibt die Filmdaten zurück, inklusive movie_id
});

mainRouter.get('/rooms', async (req, res) => {
    const { date, time, movie_id } = req.query;

    if (!date || !time || !movie_id) {
        return res.status(400).json({ message: 'Datum, Uhrzeit und Film erforderlich!' });
    }

    try {
        // Holen der Filmdauer aus der movies-Tabelle
        const { data: movieData, error: movieError } = await supabase
            .from('movies')
            .select('duration')
            .eq('movie_id', movie_id)
            .single();

        if (movieError || !movieData) {
            return res.status(404).json({ message: 'Film nicht gefunden!' });
        }

        const movieDuration = movieData.duration;

        // Berechnung der Endzeit des Films basierend auf der Startzeit und Filmdauer
        const endTime = calculateEndTime(time, movieDuration);

        console.log(`Überprüfe Räume für: ${date} ${time} - Endzeit: ${endTime}`);

        // Überprüfen, ob der Raum bereits für das angegebene Datum und die Zeitspanne gebucht ist
        const { data: bookedRooms, error: bookedError } = await supabase
            .from('shows')
            .select('room_id, time, end_time')
            .eq('date', date)
            .filter('time', 'lt', endTime) // Startzeit der bestehenden Vorstellung muss vor der Endzeit des neuen Films liegen
            .filter('end_time', 'gt', time); // Endzeit der bestehenden Vorstellung muss nach der Startzeit des neuen Films liegen

        if (bookedError) {
            console.error('Fehler beim Abrufen der gebuchten Räume:', bookedError);
            throw bookedError;
        }

        const bookedRoomIds = bookedRooms.map(room => room.room_id);

        // Räume abrufen, die noch verfügbar sind
        const { data: availableRooms, error: availableError } = await supabase
            .from('rooms')
            .select('*')
            .not('room_id', 'in', `(${bookedRoomIds.join(',')})`);

        if (availableError) {
            console.error('Fehler beim Abrufen der verfügbaren Räume:', availableError);
            throw availableError;
        }

        res.json(availableRooms);
    } catch (error) {
        console.error('Fehler beim Abrufen der Räume:', error);
        res.status(500).json({ message: 'Öffnungszeiten werden überschritten', error: error.message });
    }
});

mainRouter.post('/tickets', async (req, res) => {
    const { show_id, ticket_type, price, discount_name, user_mail } = req.body;
    console.log(req.body);

    if (!show_id || !ticket_type || !price) {
        return res.status(400).json({ error: "Fehlende Ticketdaten" });
    }

    try {
        // Schritt 1: Hole die Raumkapazität der Show
        const { data: showData, error: showError } = await supabase
            .from('shows')
            .select('room_id')
            .eq('show_id', show_id)
            .single();

        console.log('Show-Daten:', showData);

        if (showError || !showData) {
            throw new Error('Vorstellung nicht gefunden');
        }

        const roomId = showData.room_id;
        console.log('Gefundene room_id für Show', show_id, ':', roomId);


        console.log('room_id:', roomId);


        // Schritt 2: Hole die Kapazität des Raums
        const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .select('capacity')
            .eq('room_id', roomId)
            .single();

        // Debugging
        console.log('Raum-Daten:', roomData);

        if (roomError || !roomData) {
            throw new Error('Raumkapazität nicht gefunden');
        }

        const roomCapacity = roomData.capacity;


        // Schritt 3: Berechne die bereits verkauften Tickets für die Show
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select('ticket_id')
            .eq('show_id', show_id);


        // Debugging
        console.log('Tickets-Daten für show_id', show_id, ':', ticketsData);


        if (ticketsError) {
            throw ticketsError;
        }

        //const soldTicketsCount = ticketsData.length;
        const soldTicketsCount = ticketsData ? ticketsData.length : 0;
        console.log('Bereits verkaufte Tickets:', soldTicketsCount);


        // Schritt 4: Prüfe, ob ein weiteres Ticket die Kapazität überschreiten würde
        if (soldTicketsCount >= roomCapacity) {
            return res.status(400).json({ error: "Kapazität überschritten" });
        }

        // Schritt 5: Füge das Ticket hinzu
        const { data: newTicket, error: insertError } = await supabase
            .from('tickets')
            .insert([{ show_id, ticket_type, price, discount_name, user_mail }])
            .single();

        if (insertError) {
            throw insertError;
        }

        res.status(201).json({
            message: "Ticket erfolgreich gespeichert",
            ticket: newTicket
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

mainRouter.get('/tickets', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        console.error("Fehlende E-Mail in der Anfrage");
        return res.status(400).json({ error: 'E-Mail wird benötigt' });
    }

    try {
        // Schritt 1: Hole alle Tickets des Benutzers
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('tickets')
            .select('ticket_id, show_id, ticket_type, price, discount_name')
            .eq('user_mail', email);

        if (ticketsError) {
            throw new Error('Fehler beim Abrufen der Tickets: ' + ticketsError.message);
        }

        if (!ticketsData || ticketsData.length === 0) {
            console.log("Keine Tickets gefunden für:", email);
            return res.status(200).json([]); // Leere Liste zurückgeben
        }

        // Debugging
        console.log("Gefundene Tickets:", ticketsData);

        // Schritt 2: Hole die Details zu den Shows
        const showIds = ticketsData.map(ticket => ticket.show_id);

        const { data: showsData, error: showsError } = await supabase
            .from('shows')
            .select('show_id, movie_title, room_id, date, time')
            .in('show_id', showIds); // Nutze die Liste der `show_id`

        if (showsError) {
            throw new Error('Fehler beim Abrufen der Show-Daten: ' + showsError.message);
        }

        // Debugging
        console.log("Gefundene Shows:", showsData);

        // Schritt 3: Verknüpfe die Daten
        const ticketsWithShowDetails = ticketsData.map(ticket => {
            const showDetails = showsData.find(show => show.show_id === ticket.show_id);
            return {
                ...ticket,
                movie_title: showDetails?.movie_title || 'Unbekannt',
                room_id: showDetails?.room_id || 'Unbekannt',
                date: showDetails?.date || 'Unbekannt',
                time: showDetails?.time || 'Unbekannt'
            };
        });

        // Debugging
        console.log("Tickets mit Show-Details:", ticketsWithShowDetails);

        res.status(200).json(ticketsWithShowDetails);
    } catch (err) {
        console.error("Serverfehler:", err.message);
        res.status(500).json({ error: 'Fehler beim Abrufen der Tickets: ' + err.message });
    }
});

// User registration
mainRouter.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Alle Felder müssen ausgefüllt werden." });

    try {
        const { data, error } = await supabase.from("users").insert([{ email, password }]);
        if (error) throw error;
        res.status(200).json({ message: "Registration successful!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User login
mainRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Alle Felder müssen ausgefüllt werden." });

    try {
        const { data } = await supabase.from("users").select("*").eq("email", email).eq("password", password);
        if (data.length === 0) return res.status(401).json({ error: "Ungültige Zugangsdaten." });

        res.status(200).json({
            message: "Login successful!",
            role: email.endsWith("@cineo.com") ? "employee" : "customer",
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Guest login
mainRouter.post("/guest", (req, res) => {
    const { email } = req.body;

    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: "Ungültiges E-Mail Format." });

    res.status(200).json({ message: "Guest login successful!" });
});

// API-Endpoint zum Abrufen und Speichern der IBAN
mainRouter.get('/iban', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'E-Mail wird benötigt' });
    }

    const { data, error } = await supabase
        .from('users')
        .select('iban')
        .eq('email', email)
        .single();

    if (error) {
        return res.status(500).json({ error: 'Fehler beim Abrufen der IBAN' });
    }

    res.json(data);
});


mainRouter.post('/iban', async (req, res) => {
    const { email, iban } = req.body;

    if (!email || !iban) {
        return res.status(400).json({ error: 'E-Mail und IBAN sind erforderlich' });
    }

    const { error } = await supabase
        .from('users')
        .update({ iban })
        .eq('email', email);

    if (error) {
        return res.status(500).json({ error: 'Fehler beim Speichern der IBAN' });
    }

    res.json({ message: 'IBAN erfolgreich gespeichert' });
});

// API-Endpunkt, um Ticketpreise und Rabatte abzurufen
mainRouter.get('/ticketpreise', async (req, res) => {
    try {
        // Ticketpreise aus der Tabelle 'ticket_categories' abrufen
        const { data: ticketpreise, error: ticketError } = await supabase
            .from('ticket_categories')
            .select('ticket_id, ticket_price, ticket_name');

        if (ticketError) {
            throw ticketError;
        }

        // Rabatte aus der Tabelle 'ticket_discount' abrufen
        const { data: rabatte, error: rabattError } = await supabase
            .from('ticket_discount')
            .select('name, type, value');

        if (rabattError) {
            throw rabattError;
        }

        res.json({ ticketpreise, rabatte });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// API-Endpunkt, um einen Rabatt zu löschen
mainRouter.delete('/ticketrabatt/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const { error } = await supabase
            .from('ticket_discount')
            .delete()
            .eq('name', name);

        if (error) throw error;

        res.json({ message: `Rabatt mit dem Namen "${name}" wurde gelöscht.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// API-Endpunkt, um Grundpreise zu aktualisieren
mainRouter.put('/ticketpreise/:ticket_id', async (req, res) => {
    const { ticket_id } = req.params;
    const { ticket_price } = req.body;

    try {
        const { error } = await supabase
            .from('ticket_categories')
            .update({ ticket_price })
            .eq('ticket_id', ticket_id);

        if (error) throw error;

        res.json({ message: 'Ticketpreis aktualisiert' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// API-Endpunkt, um Rabatte hinzuzufügen (ohne Update-Prüfung)
mainRouter.post('/ticketrabatt', async (req, res) => {
    const { name, type, value } = req.body;

    try {
        // Einfach neuen Rabatt hinzufügen, ohne auf Duplikate zu prüfen
        const { error: insertError } = await supabase
            .from('ticket_discount')
            .insert([{ name, type, value }]);

        if (insertError) {
            throw insertError;
        }

        res.json({ message: 'Rabatt hinzugefügt' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


module.exports=mainRouter;