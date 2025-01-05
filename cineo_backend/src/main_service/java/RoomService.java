import io.supabase.SupabaseClient;
import io.supabase.java.db.SupabaseQueryBuilder;
import org.springframework.stereotype.Service;

@Service
public class RoomService {

    private final SupabaseClient client;

    public RoomService(SupabaseClient client) {
        this.client = client;
    }

    public void updateSeatStatus(int roomId, int row, int seat, String status) {
        // Wir nehmen an, dass die Supabase-Datenbank eine Tabelle 'seat' hat, die den Sitzplatzstatus speichert
        SupabaseQueryBuilder query = client.from("seat")
            .update("status", status)
            .eq("room_id", roomId)
            .eq("row_id", row)
            .eq("seat_number", seat);

        query.execute();
    }
}

 