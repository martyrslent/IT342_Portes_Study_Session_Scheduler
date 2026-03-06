package edu.cit.portes.studysessionscheduler.controller;

import edu.cit.portes.studysessionscheduler.model.User;
import edu.cit.portes.studysessionscheduler.repository.UserRepository;

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

    // 1. REGISTER - Updated to return JSON
    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword())); // BCrypt Encryption
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    // 2. LOGIN - Updated to return JSON with a dummy token
    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody User user) {
        // For Lab 1 simplicity, we return a success response if the request arrives
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Login successful!");
        response.put("token", "dummy-jwt-token-for-lab-purposes"); // Android expects this
        
        return ResponseEntity.ok(response); 
    }

    // 3. GET ME (Protected)
    @GetMapping("/user/me")
    public Object getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getPrincipal(); 
    }
}