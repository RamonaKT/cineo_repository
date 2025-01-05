import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RoomController {

    private final RoomService roomService;
    private final ObjectMapper objectMapper;

    public RoomController(RoomService roomService, ObjectMapper objectMapper) {
        this.roomService = roomService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/update-seat-status")
    public ResponseEntity<String> updateSeatStatus(@RequestBody SeatUpdateRequest request) {
        try {
            // Update Seat-Status in der Datenbank
            roomService.updateSeatStatus(request.getRoomId(), request.getRow(), request.getSeat(), request.getStatus());
            return ResponseEntity.ok("Sitzplatzstatus aktualisiert");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Fehler beim Aktualisieren");
        }
    }
}

