const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks(); // Mock für `fetch`

// Importiere deine Funktionen
const { toggleSeatCategory, parseSeatCounts, submitLayout } = require('./roomcreationScript');

// Mock für DOM-Elemente
document.body.innerHTML = `
  <div id="seatLayout"></div>
  <input id="seatCounts" value="3,4,2" />
`;

describe('Room Creation Script', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  // Test für die Funktion toggleSeatCategory
  test('toggleSeatCategory: wechselt zwischen Sitzkategorien', () => {
    const mockSeatDiv = document.createElement('div');
    mockSeatDiv.dataset.rowIndex = '0';
    mockSeatDiv.dataset.seatIndex = '0';
    mockSeatDiv.classList.add('seat', 'available');

    const seatData = [[{ seatNumber: 1, rowNumber: 1, category: 0 }]];
    toggleSeatCategory(mockSeatDiv, seatData);

    expect(seatData[0][0].category).toBe(1); // Parkett -> VIP
    expect(mockSeatDiv.classList.contains('vip')).toBe(true);

    toggleSeatCategory(mockSeatDiv, seatData);
    expect(seatData[0][0].category).toBe(2); // VIP -> Loge
    expect(mockSeatDiv.classList.contains('logen')).toBe(true);

    toggleSeatCategory(mockSeatDiv, seatData);
    expect(seatData[0][0].category).toBe(0); // Loge -> Parkett
    expect(mockSeatDiv.classList.contains('available')).toBe(true);
  });

  // Test für parseSeatCounts
  test('parseSeatCounts: verarbeitet Sitzanzahlen korrekt', () => {
    const seatCountsInput = document.getElementById('seatCounts');
    seatCountsInput.value = '3, 4, 2';
    const seatCounts = parseSeatCounts();

    expect(seatCounts).toEqual([3, 4, 2]); // Erwartet ein Array mit den Sitzanzahlen
  });

  // Test für submitLayout
  test('submitLayout: sendet Layout-Daten erfolgreich', async () => {
    const mockLayoutData = {
      roomNumber: 1,
      seatCounts: [3, 4, 2],
      seatsData: [
        [{ seatNumber: 1, rowNumber: 1, category: 0 }],
        [{ seatNumber: 2, rowNumber: 2, category: 1 }],
      ],
    };

    fetch.mockResponseOnce(JSON.stringify({ message: 'Layout erfolgreich gespeichert' }), { status: 200 });

    const result = await submitLayout(mockLayoutData);

    expect(fetch).toHaveBeenCalledWith('/api/saveLayout/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockLayoutData),
    });

    expect(result.message).toBe('Layout erfolgreich gespeichert');
  });

  // Test für submitLayout mit Fehler
  test('submitLayout: gibt Fehler korrekt zurück', async () => {
    const mockLayoutData = {
      roomNumber: 1,
      seatCounts: [3, 4, 2],
      seatsData: [
        [{ seatNumber: 1, rowNumber: 1, category: 0 }],
        [{ seatNumber: 2, rowNumber: 2, category: 1 }],
      ],
    };

    fetch.mockResponseOnce(JSON.stringify({ message: 'Fehler beim Speichern' }), { status: 400 });

    await expect(submitLayout(mockLayoutData)).rejects.toThrow('Fehler beim Speichern');
  });
});
