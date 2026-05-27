package edu.cit.portes.studysessionscheduler.features.sessions;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter; // 👈 Add this
import com.fasterxml.jackson.annotation.Nulls;      // 👈 Add this
import java.util.Set;
import java.util.HashSet;

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
    private int maxParticipants; 
    private int currentParticipants = 0;
    private String createdBy; 

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "session_participants", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "username")
    private Set<String> participantUsernames = new HashSet<>();

    // 🎯 Force Jackson to use this setter during deserialization
    @JsonSetter(value = "imageUrl", nulls = Nulls.SKIP)
    public void setImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            this.imageUrl = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600";
        } else {
            this.imageUrl = imageUrl.trim();
        }
    }

    // Explicitly define getter so Jackson uses it for serialization
    @JsonProperty("imageUrl")
    public String getImageUrl() {
        return this.imageUrl;
    }
}