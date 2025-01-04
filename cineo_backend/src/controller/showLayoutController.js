const express = require('express');
const router = express.Router();
const { getSeatsForRoom } = require('./roomService');
const { confirmReservation } = require('./seatReservationService');

// Endpunkt zum Abrufen der Sitzplätze
router.get('/api/room/:roomId/seats', async (req, res) => {
    try {
        const seats = await getSeatsForRoom(req.params.roomId);
        res.json(seats);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpunkt zum Bestätigen der Reservierung
router.post('/api/confirm-reservation', async (req, res) => {
    try {
        const { seatIds, roomId } = req.body;
        const result = await confirmReservation(seatIds, roomId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
