class Seat {
    constructor(seatId, roomId, rowId, category, status, reservedAt) {
        this.seatId = seatId;
        this.roomId = roomId;
        this.rowId = rowId;
        this.category = category; // 0 = Parkett, 1 = VIP, 2 = Loge
        this.status = status;
        this.reservedAt = reservedAt;
    }
}

module.exports = Seat;
