package edu.cit.portes.studysessionscheduler.factory;

import edu.cit.portes.studysessionscheduler.features.sessions.StudySession;

public class SessionFactory {

    public static StudySession createDefaultSession(
            String topic,
            String location,
            String date,
            String time,
            int maxParticipants,
            String createdBy,
            String imageUrl
    ) {

        StudySession session = new StudySession();

        session.setTopic(topic);
        session.setLocation(location);
        session.setDate(date);
        session.setTime(time);
        session.setMaxParticipants(maxParticipants);
        session.setCurrentParticipants(0);
        session.setCreatedBy(createdBy);

        // ✅ Save image URL properly
        session.setImageUrl(imageUrl);

        return session;
    }
}