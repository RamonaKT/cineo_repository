package com.cineo.controllers;

import com.cineo.models.Seat;
import com.cineo.services.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    @Autowired
    private SeatService seatService;

    // GET: Alle Sitzplätze für eine bestimmte Show abrufen
    @GetMapping("/show/{showId}")
    public ResponseEntity<List<Seat>> getSeatsByShow(@PathVariable Long showId) {
        List<Seat> seats = seatService.getSeatsByShow(showId);
        return ResponseEntity.ok(seats);
    }

    // GET: Status eines einzelnen Sitzplatzes abrufen
    @GetMapping("/{seatId}")
    public ResponseEntity<Seat> getSeatById(@PathVariable Long seatId) {
        Seat seat = seatService.getSeatById(seatId);
        return ResponseEntity.ok(seat);
    }

    // POST: Einen neuen Sitzplatz erstellen (optional, nur für Admins)
    @PostMapping
    public ResponseEntity<Seat> createSeat(@RequestBody Seat seat) {
        Seat createdSeat = seatService.createSeat(seat);
        return ResponseEntity.ok(createdSeat);
    }

    // PUT: Sitzplatzstatus aktualisieren (z. B. Reservierung setzen)
    @PutMapping("/{seatId}/reserve")
    public ResponseEntity<Seat> reserveSeat(@PathVariable Long seatId) {
        Seat updatedSeat = seatService.reserveSeat(seatId);
        return ResponseEntity.ok(updatedSeat);
    }

    // DELETE: Sitzplatz löschen (optional, nur für Admins)
    @DeleteMapping("/{seatId}")
    public ResponseEntity<Void> deleteSeat(@PathVariable Long seatId) {
        seatService.deleteSeat(seatId);
        return ResponseEntity.noContent().build();
    }
}

