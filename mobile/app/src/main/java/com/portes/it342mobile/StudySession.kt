package com.portes.it342mobile

data class StudySession(
    val id: Long? = null,
    val topic: String,
    val location: String,
    val date: String,
    val time: String,
    // Ensure these match the Spring Boot variable names exactly
    val maxParticipants: Int,
    val currentParticipants: Int = 0
)