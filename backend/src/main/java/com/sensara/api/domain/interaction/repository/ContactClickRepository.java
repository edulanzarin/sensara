package com.sensara.api.domain.interaction.repository;

import com.sensara.api.domain.interaction.model.ContactClick;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ContactClickRepository extends JpaRepository<ContactClick, UUID> {
    long countByCompanionId(UUID companionId);
}