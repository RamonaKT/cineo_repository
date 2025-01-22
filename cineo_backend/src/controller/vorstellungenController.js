const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const routerVorstellungen = express.Router();
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());
// Supabase-Client initialisieren
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


routerVorstellungen.get('/:movieId', async (req, res) => {
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

routerVorstellungen.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('shows')
            .delete()
            .eq('show_id', id);

        if (error) {
            return res.status(500).json({ message: 'Fehler beim Löschen der Vorstellung', error: error.message });
        }

        res.status(200).json({ message: 'Vorstellung erfolgreich gelöscht' });
    } catch (error) {
        console.error('Fehler beim Löschen der Vorstellung:', error);
        res.status(500).json({ message: 'Serverfehler', error: error.message });
    }
});

routerVorstellungen.post('/', async (req, res) => {
    const { movie_id, date, time, end_time, room_id, movie_duration } = req.body;

    // Überprüfen, ob alle erforderlichen Daten vorhanden sind
    if (!movie_id || !date || !time || !room_id || !movie_duration) {
        return res.status(400).json({ message: 'Fehlende Daten: movie_id, date, time, room_id und movie_duration sind erforderlich' });
    }

    try {
        // Holen des Filmtitels aus der 'movies'-Tabelle basierend auf movie_id
        const { data: movieData, error: movieError } = await supabase
            .from('movies')
            .select('title')
            .eq('movie_id', movie_id)
            .single();

        if (movieError || !movieData) {
            return res.status(404).json({ message: 'Film nicht gefunden' });
        }

        const movieTitle = movieData.title; // Titel des Films

        // Erstellen eines neuen Eintrags in der 'shows'-Tabelle
        const { data, error } = await supabase
            .from('shows')
            .insert([
                {
                    movie_id,
                    movie_title: movieTitle,  // Den Filmtitel speichern
                    date: date,
                    time: time,
                    end_time,
                    room_id,
                    movie_duration
                }
            ])
            .select('show_id')
            .single();

        if (error) {
            return res.status(500).json({ message: 'Fehler beim Hinzufügen der Vorstellung', error: error.message });
        }
        res.status(201).json({ message: 'Vorstellung erfolgreich hinzugefügt', data });
    } catch (error) {
        console.error('Fehler beim Erstellen der Vorstellung:', error);
        res.status(500).json({ message: 'Serverfehler', error: error.message });
    }
});

module.exports=routerVorstellungen;