const express = require('express');
const router = express.Router();
const roomService = require('../services/roomService');

// POST Route zum Speichern des Layouts
router.post('/saveLayout', async (req, res) => {
    const { roomNumber, seatCounts, seatsData } = req.body;

    try {
        await roomService.saveRoomLayout(roomNumber, seatCounts, seatsData);
        res.status(200).json({ message: "Layout erfolgreich gespeichert!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Fehler beim Speichern des Layouts." });
    }
});

// GET Route zum Abrufen der Sitzplätze eines Raumes
router.get('/seats/:roomId', async (req, res) => {
    const roomId = req.params.roomId;

    try {
        const seats = await roomService.getSeatsForRoom(roomId);
        res.status(200).json(seats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Fehler beim Abrufen der Sitzplätze." });
    }
});

module.exports = router;
