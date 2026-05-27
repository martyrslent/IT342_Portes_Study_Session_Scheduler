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

        // ✅ Pass imageUrl into the factory now
        StudySession validatedSession = SessionFactory.createDefaultSession(
            sessionRequest.getTopic(),
            sessionRequest.getLocation(),
            sessionRequest.getDate(),
            sessionRequest.getTime(),
            sessionRequest.getMaxParticipants(),
            sessionRequest.getCreatedBy(),
            sessionRequest.getImageUrl()
        );

        return sessionRepository.save(validatedSession);
    }

    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    public StudySession joinSession(Long id, String username) {

        StudySession session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Session not found"));

        // Prevent duplicate joins
        if (session.getParticipantUsernames().contains(username)) {
            throw new RuntimeException("You have already joined this session!");
        }

        // Prevent over-capacity
        if (session.getCurrentParticipants() >= session.getMaxParticipants()) {
            throw new RuntimeException("Session is already full!");
        }

        session.getParticipantUsernames().add(username);
        session.setCurrentParticipants(session.getParticipantUsernames().size());

        return sessionRepository.save(session);
    }
}