package edu.cit.portes.studysessionscheduler.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.portes.studysessionscheduler.features.sessions.StudySession;

@Repository
public interface SessionRepository extends JpaRepository<StudySession, Long> {
    // JpaRepository gives you .findAll(), .save(), and .findById() for free!
}