document.addEventListener('DOMContentLoaded', () => {
    // Filme laden
    fetch('/api/filme')
        .then(response => response.json())
        .then(data => {
            const filmSelect = document.getElementById('film');
            data.forEach(film => {
                const option = document.createElement('option');
                option.value = film.id;
                option.textContent = `${film.titel} (${film.jahr})`;
                filmSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Fehler beim Laden der Filme:', error));

    // Ticketbuchung
    document.getElementById('ticketForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const filmId = document.getElementById('film').value;
        const sitznummer = document.getElementById('sitznummer').value;

        fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ film_id: filmId, sitznummer: sitznummer })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('buchungStatus').textContent = `Ticket gebucht: ${data.message}`;
        })
        .catch(error => {
            document.getElementById('buchungStatus').textContent = 'Fehler bei der Buchung';
        });
    });
});
