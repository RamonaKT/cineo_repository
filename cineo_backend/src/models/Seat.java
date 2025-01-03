package com.cineo.models;

import jakarta.persistence.*;

@Entity
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "hall_id", nullable = false)
    private Hall hall;

    private String type; // "vip", "standard", "economy"
    private Boolean reserved;
    private Integer rowNumber;
    private Integer columnNumber;

    // Getter und Setter
}
