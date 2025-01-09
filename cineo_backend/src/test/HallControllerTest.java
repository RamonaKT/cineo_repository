package com.cineo.controller;

import com.cineo.main_service.HallService;
import com.cineo.models.Hall;
import com.cineo.models.Seat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HallControllerTest {

    @Mock
    private HallService hallService;

    @InjectMocks
    private HallController hallController;

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
        when(hallService.getAllHalls()).thenReturn(mockHalls);

        // Act
        List<Hall> result = hallController.getAllHalls();

        // Assert
        assertEquals(2, result.size());
        verify(hallService, times(1)).getAllHalls();
    }

    @Test
    void getHallById_shouldReturnHall_whenIdExists() {
        // Arrange
        Hall mockHall = new Hall();
        mockHall.setId(1L);
        when(hallService.getHallById(1L)).thenReturn(mockHall);

        // Act
        ResponseEntity<Hall> response = hallController.getHallById(1L);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getBody().getId());
        verify(hallService, times(1)).getHallById(1L);
    }

    @Test
    void getSeatsByHallId_shouldReturnSeats() {
        // Arrange
        List<Seat> mockSeats = new ArrayList<>();
        mockSeats.add(new Seat());
        mockSeats.add(new Seat());
        when(hallService.getSeatsByHallId(1L)).thenReturn(mockSeats);

        // Act
        List<Seat> result = hallController.getSeatsByHallId(1L);

        // Assert
        assertEquals(2, result.size());
        verify(hallService, times(1)).getSeatsByHallId(1L);
    }

    @Test
    void createHall_shouldReturnCreatedHall() {
        // Arrange
        Hall mockHall = new Hall();
        mockHall.setName("Test Hall");
        when(hallService.createHall(mockHall)).thenReturn(mockHall);

        // Act
        ResponseEntity<Hall> response = hallController.createHall(mockHall);

        // Assert
        assertNotNull(response);
        assertEquals("Test Hall", response.getBody().getName());
        verify(hallService, times(1)).createHall(mockHall);
    }
}
