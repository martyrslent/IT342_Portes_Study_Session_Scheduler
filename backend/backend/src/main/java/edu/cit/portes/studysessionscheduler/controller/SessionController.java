package edu.cit.portes.studysessionscheduler.controller;

import edu.cit.portes.studysessionscheduler.model.StudySession;
import edu.cit.portes.studysessionscheduler.repository.SessionRepository;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:3000")
public class SessionController {

    private final SessionRepository sessionRepository;

    public SessionController(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    // This fulfills the "View available sessions" requirement
    @GetMapping
    public List<StudySession> getAllSessions() {
        return sessionRepository.findAll();
    }

    // This fulfills the "Add study sessions" requirement
    @PostMapping
    public StudySession createSession(@RequestBody StudySession session) {
        return sessionRepository.save(session);
    }
}