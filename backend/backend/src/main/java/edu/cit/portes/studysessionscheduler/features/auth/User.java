package edu.cit.portes.studysessionscheduler.features.auth;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data // This Lombok annotation creates getters and setters automatically
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // This will store the BCrypt hash

    // --- ADMINISTRATIVE & MODERATION ADDITIONS ---

    @Column(nullable = false)
    private String role = "ROLE_STUDENT"; // Default authorization tier for regular student registrations

    @Column(nullable = false)
    private boolean active = true; // Tracks system suspension status; defaults to allowed access
}