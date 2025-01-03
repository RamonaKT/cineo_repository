package com.cineo.main_service;

import com.cineo.database_connection.HallRepository;
import com.cineo.database_connection.SeatRepository;
import com.cineo.models.Hall;
import com.cineo.models.Seat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HallServiceTest {

    @Mock
    private HallRepository hallRepository;

    @Mock
    private SeatRepository seatRepository;

    @InjectMocks
    private HallService hallService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllHalls_shouldReturnAllHalls() {
        // Arrange
        List<Hall> mockHalls = new ArrayList<>();
        mockHalls.add(new Hall());
        mockHalls.add(new Hall());
        when(hallRepository.findAll()).thenReturn(mockHalls);

        // Act
        List<Hall> result = hallService.getAllHalls();

        // Assert
        assertEquals(2, result.size());
        verify(hallRepository, times(1)).findAll();
    }

    @Test
    void getHallById_shouldReturnHall_whenIdExists() {
        // Arrange
        Hall mockHall = new Hall();
        mockHall.setId(1L);
        when(hallRepository.findById(1L)).thenReturn(Optional.of(mockHall));

        // Act
        Hall result = hallService.getHallById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(hallRepository, times(1)).findById(1L);
    }

    @Test
    void getHallById_shouldThrowException_whenIdDoesNotExist() {
        // Arrange
        when(hallRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> hallService.getHallById(1L));
        assertEquals("Hall not found", exception.getMessage());
        verify(hallRepository, times(1)).findById(1L);
    }

    @Test
    void getSeatsByHallId_shouldReturnSeats_whenHallExists() {
        // Arrange
        List<Seat> mockSeats = new ArrayList<>();
        mockSeats.add(new Seat());
        mockSeats.add(new Seat());
        when(seatRepository.findByHallId(1L)).thenReturn(mockSeats);

        // Act
        List<Seat> result = hallService.getSeatsByHallId(1L);

        // Assert
        assertEquals(2, result.size());
        verify(seatRepository, times(1)).findByHallId(1L);
    }

    @Test
    void createHall_shouldSaveAndReturnHall() {
        // Arrange
        Hall mockHall = new Hall();
        mockHall.setName("Test Hall");
        when(hallRepository.save(mockHall)).thenReturn(mockHall);

        // Act
        Hall result = hallService.createHall(mockHall);

        // Assert
        assertNotNull(result);
        assertEquals("Test Hall", result.getName());
        verify(hallRepository, times(1)).save(mockHall);
    }
}
