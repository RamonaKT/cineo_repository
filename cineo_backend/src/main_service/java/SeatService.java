package com.cineo.services;

import com.cineo.models.Seat;
import com.cineo.repositories.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    public List<Seat> getSeatsByShow(Long showId) {
        return seatRepository.findByShowId(showId);
    }

    public Seat getSeatById(Long seatId) {
        return seatRepository.findById(seatId).orElseThrow(() -> new RuntimeException("Seat not found"));
    }

    public Seat createSeat(Seat seat) {
        return seatRepository.save(seat);
    }

    public Seat reserveSeat(Long seatId) {
        Seat seat = getSeatById(seatId);
        if (seat.getReserved()) {
            throw new RuntimeException("Seat already reserved");
        }
        seat.setReserved(true);
        return seatRepository.save(seat);
    }

    public void deleteSeat(Long seatId) {
        seatRepository.deleteById(seatId);
    }
}
