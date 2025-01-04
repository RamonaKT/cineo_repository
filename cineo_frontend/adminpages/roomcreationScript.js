document.getElementById("createRoomForm").addEventListener("submit", async function (e) {
    e.preventDefault();
  
    const roomName = document.getElementById("roomName").value;
    const rowCount = document.getElementById("rowCount").value;
    const columnCount = document.getElementById("columnCount").value;
  
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: roomName, rowCount: parseInt(rowCount), columnCount: parseInt(columnCount) }),
    });
  
    const message = document.getElementById("roomMessage");
    if (response.ok) {
      message.textContent = "Raum erfolgreich erstellt!";
      message.style.color = "green";
    } else {
      message.textContent = "Fehler beim Erstellen des Raums.";
      message.style.color = "red";
    }
  });
  