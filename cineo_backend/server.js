require('dotenv').config({ path: '../cineo_backend/.env' });


const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');


app.use(cors());

app.use(express.json());


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;


// Überprüfe, ob die Umgebungsvariablen korrekt geladen wurden
if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase URL:', supabaseUrl);  // Gibt die URL aus
    console.log('Supabase Key:', supabaseKey);  // Gibt den Key aus
    console.error('Supabase URL oder Schlüssel fehlen!');
    process.exit(1);
}





const supabase = createClient(supabaseUrl, supabaseKey);



app.get('/api/filme/:movieId', async (req, res) => {
    const movieId = req.params.movieId;

    const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('movie_id', movieId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    console.log("Daten:", data);  // Protokolliert die zurückgegebenen Daten

    if (data.length === 0) {
        return res.status(404).json({ error: 'Film nicht gefunden' });
    }

    res.json(data[0]);
});


app.get('/api/vorstellungen/:movieId', async (req, res) => {
    const movieId = req.params.movieId;

    const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('movie_id', movieId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    console.log("Daten:", data);  // Protokolliert die zurückgegebenen Daten

    if (data.length === 0) {
        return res.status(404).json({ error: 'Shows dieses Filmes nicht gefunden' });
    }

    res.json(data);

});



// API-Endpunkt, um alle Filme abzurufen
app.get('/api/filme', async (req, res) => {
    const { data, error } = await supabase
        .from('movies')
        .select('movie_id, title, image'); // Füge "movie_id" zu den abgerufenen Feldern hinzu

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Keine Filme gefunden' });
    }

    res.json(data); // Gibt die Filmdaten zurück, inklusive movie_id
});


app.post('/api/tickets', async (req, res) => {
    const { show_id, ticket_type, price } = req.body;
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
            .insert([{ show_id, ticket_type, price }])
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


// User registration
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "All fields are required." });

    try {
        const { data, error } = await supabase.from("users").insert([{ email, password }]);
        if (error) throw error;
        res.status(200).json({ message: "Registration successful!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "All fields are required." });

    try {
        const { data } = await supabase.from("users").select("*").eq("email", email).eq("password", password);
        if (data.length === 0) return res.status(401).json({ error: "Invalid credentials." });

        res.status(200).json({
            message: "Login successful!",
            role: email.endsWith("@cineo.com") ? "employee" : "customer",
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Guest login
app.post("/api/guest", (req, res) => {
    const { email } = req.body;

    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: "Invalid email format." });

    res.status(200).json({ message: "Guest login successful!" });
});




// API-Endpoint zum Abrufen und Speichern der IBAN
app.get('/api/iban', async (req, res) => {
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


app.post('/api/iban', async (req, res) => {
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





// Statische Dateien bereitstellen (für Bilder)
app.use('/images', express.static(path.join(__dirname, '../cineo_frontend/images')));

// 1. Static Files aus dem Frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../cineo_frontend')));


/*
// 1. Static Files aus dem Frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../cineo_frontend/specialpages')));

// 1. Static Files aus dem Frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../cineo_frontend/infopages')));
*/

// 2. HTML-Seiten ausliefern
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/homepageStructure.html'));
});

app.get('/program', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/programpageStructure.html'));
});

app.get('/movie/:id', (req, res) => {
    const movieId = req.params.id;
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/movieStructure.html'));
});

app.get('/specials', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/specialpages/specialpageStructure.html'));
});

app.get('/offers', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/specialpages/offerpageStructure.html'));
});

app.get('/gastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/specialpages/gastropageStructure.html'));
});

app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/specialpages/shoppageStructure.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/loginpageStructure.html'));
});

app.get('/tickets', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/ticketsStructure.html'));
});

app.get('/shows', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/showsStructure.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, '../cineo_frontend/mainpages/confrimationpageStructure.html'));
});


// Server wird gestartet
app.listen(4000, () => console.log('Server läuft auf http://localhost:4000'));


/*
const { ClerkExpressMiddleware } = require("@clerk/clerk-sdk-node");

app.use(ClerkExpressMiddleware());
app.use(express.static('mainpages'));

    
app.get("/protected", (req, res) => {
    const user = req.auth;
    if (user) {
        res.json({ message: `Hallo, ${user.firstName}!` });
    } else {
        res.status(401).send("Nicht autorisiert.");
    }
});
*/