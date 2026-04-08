package com.sensara.api.domain.interaction.model;

import com.sensara.api.domain.companion.model.Companion;
import com.sensara.api.domain.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contact_clicks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactClick {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "companion_id", nullable = false)
    private Companion companion;

    // pode ser nulo caso o cliente não esteja logado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private User client;

    @Column(name = "clicked_at", updatable = false)
    private LocalDateTime clickedAt;

    @PrePersist
    protected void onCreate() {
        this.clickedAt = LocalDateTime.now();
    }
}