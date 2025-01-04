package com.cineo.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primärschlüssel der Tabelle

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // Zeitstempel für die Erstellung des Sitzplatzes

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room; // Verknüpfung mit der Raum-Tabelle (Room)

    @Column(name = "row_id", nullable = false)
    private Integer rowId; // Zeilen-ID für die Sitzplatzanordnung

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private SeatCategory category; // Sitzplatzkategorie (z.B. VIP, STANDARD)

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SeatStatus status; // Sitzplatzstatus (z.B. AVAILABLE, RESERVED)

    @Column(name = "reserved_at")
    private LocalDateTime reservedAt; // Zeitpunkt der letzten Reservierung

    @ManyToOne
    @JoinColumn(name = "show_id", nullable = false)
    private Show show; // Verknüpfung mit einer spezifischen Vorstellung (Show)

    // Standardkonstruktor
    public Seat() {}

    // Parameterisierter Konstruktor
    public Seat(Room room, Integer rowId, SeatCategory category, SeatStatus status, Show show) {
        this.createdAt = LocalDateTime.now();
        this.room = room;
        this.rowId = rowId;
        this.category = category;
        this.status = status;
        this.show = show;
    }

    // Getter und Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public Integer getRowId() {
        return rowId;
    }

    public void setRowId(Integer rowId) {
        this.rowId = rowId;
    }

    public SeatCategory getCategory() {
        return category;
    }

    public void setCategory(SeatCategory category) {
        this.category = category;
    }

    public SeatStatus getStatus() {
        return status;
    }

    public void setStatus(SeatStatus status) {
        this.status = status;
    }

    public LocalDateTime getReservedAt() {
        return reservedAt;
    }

    public void setReservedAt(LocalDateTime reservedAt) {
        this.reservedAt = reservedAt;
    }

    public Show getShow() {
        return show;
    }

    public void setShow(Show show) {
        this.show = show;
    }

    // Methoden zur Sitzplatzverwaltung
    public void reserveSeat() {
        if (this.status == SeatStatus.AVAILABLE) {
            this.status = SeatStatus.RESERVED;
            this.reservedAt = LocalDateTime.now();
        } else {
            throw new IllegalStateException("Seat is not available for reservation.");
        }
    }

    public void releaseSeat() {
        this.status = SeatStatus.AVAILABLE;
        this.reservedAt = null;
    }
}
