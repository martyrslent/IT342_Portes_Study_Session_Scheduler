package edu.cit.portes.studysessionscheduler.service;

import edu.cit.portes.studysessionscheduler.factory.SessionFactory;
import edu.cit.portes.studysessionscheduler.features.sessions.StudySession;
import edu.cit.portes.studysessionscheduler.repository.SessionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public List<StudySession> getAllSessions() {
        return sessionRepository.findAll();
    }

    public StudySession createSession(StudySession sessionRequest) {
        // Updated to pass createdBy from the request to the Factory
        StudySession validatedSession = SessionFactory.createDefaultSession(
            sessionRequest.getTopic(),
            sessionRequest.getLocation(),
            sessionRequest.getDate(),
            sessionRequest.getTime(),
            sessionRequest.getMaxParticipants(),
            sessionRequest.getCreatedBy() 
        );

        return sessionRepository.save(validatedSession);
    }

    public void deleteSession(Long id) {
        // Simple delete for Phase 3. 
        // Logic check is handled by the UI (hiding the button).
        sessionRepository.deleteById(id);
    }
    
    public StudySession joinSession(Long id, String username) {
    StudySession session = sessionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Session not found"));

    // SAFEGUARD 1: Check if already joined
    if (session.getParticipantUsernames().contains(username)) {
        throw new RuntimeException("You have already joined this session!");
    }

    // SAFEGUARD 2: Check if full
    if (session.getCurrentParticipants() >= session.getMaxParticipants()) {
        throw new RuntimeException("Session is already full!");
    }

    // Logic: Add user and increment count
    session.getParticipantUsernames().add(username);
    session.setCurrentParticipants(session.getParticipantUsernames().size());
    
    return sessionRepository.save(session);
}

}