package com.sensara.api.domain.plan.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer durationDays;

    @Column(nullable = false)
    private Integer priorityLevel;

    @Column(nullable = false)
    private Integer maxPhotos;

    @Column(nullable = false)
    private Integer maxVideos;

    @Builder.Default
    @Column(nullable = false)
    private Boolean canPostStories = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean hasTopSearchPriority = false; // Fica no topo da busca?
}