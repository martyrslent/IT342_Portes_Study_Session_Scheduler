// src/main/java/edu/cit/portes/studysessionscheduler/config/SecurityConfig.java
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
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .csrf(csrf -> csrf.disable()) // Disabled for local REST environment testing
            .authorizeHttpRequests(auth -> auth
                // 1. Explicitly allow public authentication entry points
                .requestMatchers("/api/auth/**").permitAll() 
                
                // 2. Allow public access to session feeds for student viewing
                .requestMatchers("/api/sessions/**").permitAll() 
                
                // 3. Keep administrative controls fully open for development testing
                .requestMatchers("/api/admin/**").permitAll() 
                
                // 4. Fallback condition for everything else
                .anyRequest().permitAll() 
            );
        return http.build();
    }
}