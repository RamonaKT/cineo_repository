package com.cineo.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primärschlüssel für den Saal

    @Column(name = "name", nullable = false)
    private String name; // Name des Saals (z.B. "Saal 1", "VIP Lounge")

    @Column(name = "capacity", nullable = false)
    private Integer capacity; // Maximale Anzahl von Sitzplätzen

    @Column(name = "layout", columnDefinition = "TEXT")
    private String layout; // JSON oder String, der die Anordnung der Sitzplätze beschreibt

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Seat> seats; // Verknüpfte Sitzplätze

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Show> shows; // Verknüpfte Vorstellungen im Saal

    // Standardkonstruktor (für JPA erforderlich)
    public Room() {}

    // Parameterisierter Konstruktor
    public Room(String name, Integer capacity, String layout) {
        this.name = name;
        this.capacity = capacity;
        this.layout = layout;
    }

    // Getter und Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public List<Seat> getSeats() {
        return seats;
    }

    public void setSeats(List<Seat> seats) {
        this.seats = seats;
    }

    public List<Show> getShows() {
        return shows;
    }

    public void setShows(List<Show> shows) {
        this.shows = shows;
    }

    // Zusätzliche Methoden
    public void addSeat(Seat seat) {
        seats.add(seat);
        seat.setRoom(this);
    }

    public void removeSeat(Seat seat) {
        seats.remove(seat);
        seat.setRoom(null);
    }
}
