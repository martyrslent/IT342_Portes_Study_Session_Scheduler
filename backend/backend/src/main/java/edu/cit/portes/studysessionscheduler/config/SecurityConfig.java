package edu.cit.portes.studysessionscheduler.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // This fulfills the BCrypt requirement
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configure(http)) // 1. Add this to enable CORS support in Security
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll() 
            .requestMatchers("/api/sessions/**").permitAll() // 2. Allow browsing sessions
            .anyRequest().authenticated() 
             );
         return http.build();
    }
}