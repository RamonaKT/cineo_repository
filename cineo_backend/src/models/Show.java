package com.cineo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "show")
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primärschlüssel für die Show

    @Column(name = "title", nullable = false)
    private String title; // Titel der Vorstellung (z. B. Filmname)

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime; // Startzeit der Vorstellung

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime; // Endzeit der Vorstellung

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room; // Verknüpfung mit dem Raum, in dem die Vorstellung stattfindet

    @OneToMany(mappedBy = "show", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Seat> seats; // Sitzplätze, die für diese Vorstellung gelten

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Beschreibung der Vorstellung

    @Column(name = "image_url")
    private String imageUrl; // URL für ein Bild oder Poster zur Vorstellung

    // Standardkonstruktor
    public Show() {}

    // Parameterisierter Konstruktor
    public Show(String title, LocalDateTime startTime, LocalDateTime endTime, Room room, String description, String imageUrl) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    // Getter und Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public List<Seat> getSeats() {
        return seats;
    }

    public void setSeats(List<Seat> seats) {
        this.seats = seats;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}

