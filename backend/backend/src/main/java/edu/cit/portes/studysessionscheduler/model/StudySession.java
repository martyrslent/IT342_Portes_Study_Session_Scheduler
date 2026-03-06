package edu.cit.portes.studysessionscheduler.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class StudySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String topic;
    private String location;
    private String date;
    private String time;
    private int maxParticipants; // To prevent overcrowding
    private int currentParticipants = 0;
}