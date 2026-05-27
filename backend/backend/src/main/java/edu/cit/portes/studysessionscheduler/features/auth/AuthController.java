package edu.cit.portes.studysessionscheduler.features.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. REGISTER - Unchanged, works perfectly with our updated entity defaults
    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        // Enforce institutional lock at the backend level as a safety guard
        if (user.getEmail() == null || !user.getEmail().endsWith("@cit.edu")) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration is restricted to @cit.edu institutional accounts only.");
            return ResponseEntity.badRequest().body(response);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword())); // BCrypt Encryption
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    // 2. LOGIN - Production upgrade: Validates real database records and accounts
    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody User loginRequest) {
        Map<String, String> response = new HashMap<>();

        // Query targeted account metadata entry matching the string key
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isEmpty()) {
            response.put("message", "Invalid username or password credentials.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        User user = userOpt.get();

        // Account Lockout check matching Journey 3 requirements
        if (!user.isActive()) {
            response.put("message", "Your account access has been suspended by an institutional administrator.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // Verify incoming clear-text string against password database hash
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            response.put("message", "Invalid username or password credentials.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Successful authentication execution payload match for App.js/Login.js
        response.put("status", "success");
        response.put("message", "Login successful!");
        response.put("role", user.getRole()); // Sends either ROLE_STUDENT or ROLE_ADMIN
        response.put("token", "functional-session-token-" + user.getUsername()); // Replace with JWT tool if building formal token objects
        
        return ResponseEntity.ok(response); 
    }

    // 3. GET ME (Protected)
    @GetMapping("/user/me")
    public Object getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getPrincipal(); 
    }
}