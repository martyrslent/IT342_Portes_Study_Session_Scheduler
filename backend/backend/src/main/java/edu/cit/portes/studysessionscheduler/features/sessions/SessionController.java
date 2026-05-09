package edu.cit.portes.studysessionscheduler.features.sessions;

import edu.cit.portes.studysessionscheduler.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:5173") 
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public List<StudySession> getAllSessions() {
        return sessionService.getAllSessions();
    }

    @PostMapping
    public StudySession createSession(@RequestBody StudySession session) {
        return sessionService.createSession(session);
    }

    @DeleteMapping("/{id}")
    public void deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
    }

    // UPDATED: Now accepts the username and returns a proper Response
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinSession(@PathVariable Long id, @RequestBody String username) {
        try {
            // Remove extra quotes if the frontend sends the string as "username"
            String cleanUsername = username.replace("\"", "");
            StudySession updatedSession = sessionService.joinSession(id, cleanUsername);
            return ResponseEntity.ok(updatedSession);
        } catch (RuntimeException e) {
            // This sends your "Already joined" or "Session full" message to the frontend
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}