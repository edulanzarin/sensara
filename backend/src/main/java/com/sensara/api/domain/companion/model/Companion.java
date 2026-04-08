package com.sensara.api.domain.companion.model;

import com.sensara.api.domain.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "companions", indexes = {
        @Index(name = "idx_comp_location", columnList = "state, city"),
        @Index(name = "idx_comp_verified", columnList = "verified")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Companion {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(nullable = false, length = 100)
    private String nickname;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Integer age;
    private Double height;
    private Double weight;

    @Column(length = 50)
    private String ethnicity;

    @Column(length = 50)
    private String hairColor;

    @Column(length = 50)
    private String eyeColor;

    @Column(nullable = false, length = 2)
    private String state;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 100)
    private String neighborhood;

    @Column(length = 20)
    private String whatsapp;

    private BigDecimal basePrice;

    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = false;

    @Builder.Default
    private Integer profileViews = 0;
}