package edu.cit.portes.studysessionscheduler.service;

import edu.cit.portes.studysessionscheduler.factory.SessionFactory;
import edu.cit.portes.studysessionscheduler.model.StudySession;
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
        // APPLYING FACTORY PATTERN:
        // Instead of directly saving the input, we pass the data through our Factory.
        // This ensures business rules (like currentParticipants starting at 0) are enforced.
        StudySession validatedSession = SessionFactory.createDefaultSession(
            sessionRequest.getTopic(),
            sessionRequest.getLocation(),
            sessionRequest.getDate(),
            sessionRequest.getTime(),
            sessionRequest.getMaxParticipants(),
            sessionRequest.getCurrentParticipants()
        );

        return sessionRepository.save(validatedSession);
    }
}