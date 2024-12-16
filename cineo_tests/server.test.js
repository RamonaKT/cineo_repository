const request = require('supertest'); // Supertest für HTTP-Requests
const app = require('../cineo_backend/server'); // Importiere die Server-App

describe('GET /api/filme/:movieId', () => {
    it('sollte einen Film zurückgeben, wenn er existiert', async () => {
        const response = await request(app).get('/api/filme/1');
        expect(response.status).toBe(200); // HTTP-Status sollte 200 sein
        expect(response.body).toHaveProperty('movie_id', 1); // Beispielprüfung
    });

    it('sollte 404 zurückgeben, wenn der Film nicht existiert', async () => {
        const response = await request(app).get('/api/filme/999');
        expect(response.status).toBe(404); // HTTP-Status sollte 404 sein
        expect(response.body).toHaveProperty('error', 'Film nicht gefunden');
    });
});

describe('POST /api/tickets', () => {
    it('sollte ein Ticket erfolgreich hinzufügen', async () => {
        const payload = {
            show_id: 1,
            ticket_type: 'Standard',
            price: 10
        };

        const response = await request(app)
            .post('/api/tickets')
            .send(payload);

        expect(response.status).toBe(201); // HTTP-Status sollte 201 sein
        expect(response.body).toHaveProperty('message', 'Ticket erfolgreich gespeichert');
        expect(response.body).toHaveProperty('ticket');
    });

    it('sollte 400 zurückgeben, wenn Kapazität überschritten wird', async () => {
        const payload = {
            show_id: 1,
            ticket_type: 'Standard',
            price: 10
        };

        // Simuliere eine Überbuchung (kannst du mit einem Mock der DB steuern)
        const response = await request(app)
            .post('/api/tickets')
            .send(payload);

        expect(response.status).toBe(400); // HTTP-Status sollte 400 sein
        expect(response.body).toHaveProperty('error', 'Kapazität überschritten');
    });
});
