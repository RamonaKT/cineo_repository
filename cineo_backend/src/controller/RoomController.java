package com.cineo.controllers;

import com.cineo.models.Room;
import com.cineo.models.Seat;
import com.cineo.repositories.RoomRepository;
import com.cineo.repositories.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeatRepository seatRepository;

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody RoomRequest roomRequest) {
        try {
            // Raum erstellen
            Room room = new Room();
            room.setCapacity(roomRequest.getCapacity());
            roomRepository.save(room);

            // Sitze generieren
            List<Seat> seats = new ArrayList<>();
            int rowCount = roomRequest.getRowCount();
            int columnCount = roomRequest.getColumnCount();
            String[] categories = roomRequest.getCategories(); // z. B. ["VIP", "Standard", "Economy"]

            for (int row = 1; row <= rowCount; row++) {
                for (int col = 1; col <= columnCount; col++) {
                    Seat seat = new Seat();
                    seat.setRoom(room);
                    seat.setRowId(row);
                    seat.setSeatNumber(col);
                    seat.setCategory(categories[row % categories.length]); // zirkulär durch Kategorien
                    seat.setStatus("available");
                    seats.add(seat);
                }
            }

            seatRepository.saveAll(seats);
            return ResponseEntity.ok("Raum und Sitze erfolgreich erstellt!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Fehler: " + e.getMessage());
        }
    }
}

