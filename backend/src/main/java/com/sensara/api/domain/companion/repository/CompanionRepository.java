package com.sensara.api.domain.companion.repository;

import com.sensara.api.domain.companion.model.Companion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.UUID;

public interface CompanionRepository extends JpaRepository<Companion, UUID>, JpaSpecificationExecutor<Companion> {
}