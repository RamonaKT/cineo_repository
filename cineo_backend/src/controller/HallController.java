package com.cineo.controller;

import com.cineo.main_service.HallService;
import com.cineo.models.Hall;
import com.cineo.models.Seat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/halls")
public class HallController {
    private final HallService hallService;

    public HallController(HallService hallService) {
        this.hallService = hallService;
    }

    @GetMapping
    public List<Hall> getAllHalls() {
        return hallService.getAllHalls();
    }

    @GetMapping("/{hallId}")
    public ResponseEntity<Hall> getHallById(@PathVariable Long hallId) {
        Hall hall = hallService.getHallById(hallId);
        return ResponseEntity.ok(hall);
    }

    @GetMapping("/{hallId}/seats")
    public List<Seat> getSeatsByHallId(@PathVariable Long hallId) {
        return hallService.getSeatsByHallId(hallId);
    }

    @PostMapping
    public ResponseEntity<Hall> createHall(@RequestBody Hall hall) {
        Hall newHall = hallService.createHall(hall);
        return ResponseEntity.ok(newHall);
    }
}
