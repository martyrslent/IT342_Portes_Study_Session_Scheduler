package edu.cit.portes.studysessionscheduler.features.admin;

import edu.cit.portes.studysessionscheduler.features.auth.User;
import edu.cit.portes.studysessionscheduler.features.auth.UserRepository;
import edu.cit.portes.studysessionscheduler.repository.SessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000") // Connects cleanly with your React port
public class AdminController {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;

    // Constructor Injection matching your project's clean style guidelines
    public AdminController(UserRepository userRepository, SessionRepository sessionRepository) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
    }

    /**
     * 1. View all registered students
     * Journey 3, Step 2
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllStudents() {
        List<User> students = userRepository.findAll();
        return ResponseEntity.ok(students);
    }

    /**
     * 2. Manage user access / Toggle Account Suspension
     * Journey 3, Step 5
     */
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        return userRepository.findById(id).map(user -> {
            user.setActive(!user.isActive()); // Flips account state
            userRepository.save(user);
            
            response.put("status", "success");
            response.put("username", user.getUsername());
            response.put("active", user.isActive());
            return ResponseEntity.ok(response);
        }).orElseGet(() -> {
            response.put("message", "Target student record not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        });
    }

    /**
     * 3. Global Moderation Overrides - Delete any study session
     * Journey 3, Step 4 / Acceptance Criteria AC-4
     */
    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Map<String, String>> moderateSession(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();

        if (!sessionRepository.existsById(id)) {
            response.put("message", "Target session resource could not be found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        sessionRepository.deleteById(id);
        
        // Returns a clean 204 or an explicit JSON response depending on client wrapper preferences
        response.put("status", "success");
        response.put("message", "Study session successfully purged by administrator moderation.");
        return ResponseEntity.ok(response);
    }
}