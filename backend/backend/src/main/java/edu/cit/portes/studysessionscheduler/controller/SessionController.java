package edu.cit.portes.studysessionscheduler.controller;

import edu.cit.portes.studysessionscheduler.model.StudySession;
import edu.cit.portes.studysessionscheduler.repository.SessionRepository;
import edu.cit.portes.studysessionscheduler.service.SessionService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:3000")
public class SessionController {

    // BEFORE: private final SessionRepository sessionRepository;
    // AFTER: Using the Service Facade
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
}