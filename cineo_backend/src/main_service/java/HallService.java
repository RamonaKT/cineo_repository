package com.cineo.main_service;

import com.cineo.database_connection.HallRepository;
import com.cineo.database_connection.SeatRepository;
import com.cineo.models.Hall;
import com.cineo.models.Seat;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HallService {
    private final HallRepository hallRepository;
    private final SeatRepository seatRepository;

    public HallService(HallRepository hallRepository, SeatRepository seatRepository) {
        this.hallRepository = hallRepository;
        this.seatRepository = seatRepository;
    }

    public List<Hall> getAllHalls() {
        return hallRepository.findAll();
    }

    public Hall getHallById(Long hallId) {
        return hallRepository.findById(hallId).orElseThrow(() -> new RuntimeException("Hall not found"));
    }

    public List<Seat> getSeatsByHallId(Long hallId) {
        return seatRepository.findByHallId(hallId);
    }

    public Hall createHall(Hall hall) {
        return hallRepository.save(hall);
    }
}
