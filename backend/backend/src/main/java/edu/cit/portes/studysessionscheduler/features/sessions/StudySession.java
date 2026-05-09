package edu.cit.portes.studysessionscheduler.features.sessions;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;
import java.util.HashSet;

@Entity
@Data
public class StudySession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // This must be the ID

    private String topic;
    private String location;
    private String date;
    private String time;
    private int maxParticipants; 
    private int currentParticipants = 0;
    private String createdBy; 

    // Proper mapping for the participants set
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "session_participants", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "username")
    private Set<String> participantUsernames = new HashSet<>();
}