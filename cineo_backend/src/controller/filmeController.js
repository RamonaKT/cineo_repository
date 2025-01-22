const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const routerFilme = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());
// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

routerFilme.get('/:movieId', async (req, res) => {
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



routerFilme.get('/', async (req, res) => {

    const now = new Date().toISOString(); // Aktuelles Datum und Uhrzeit

    // Abrufen der movie_id's aus der shows-Tabelle
    const { data: showsData, error: showsError } = await supabase
        .from('shows')
        .select('movie_id')
        .gte('date', now);
    //  .neq('movie_id', null); // Sicherstellen, dass movie_id in der shows-Tabelle nicht null ist

    if (showsError) {
        return res.status(500).json({ error: showsError.message });
    }

    if (!showsData || showsData.length === 0) {
        return res.status(404).json({ error: 'Keine Shows gefunden' });
    }

    // Holen der movie_ids aus der shows-Tabelle
    const movieIds = showsData.map(show => show.movie_id);

    // Abrufen der Filme aus der movies-Tabelle, deren movie_id in der shows-Tabelle vorhanden ist
    const { data, error } = await supabase
        .from('movies')
        .select('movie_id, title, image, duration')
        .in('movie_id', movieIds); // Filtern der Filme, die in der shows-Tabelle existieren

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Keine Filme mit Vorstellungen gefunden' });
    }

    res.json(data);
});

module.exports=routerFilme;