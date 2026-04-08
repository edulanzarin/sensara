package com.sensara.api.domain.plan.repository;

import com.sensara.api.domain.plan.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PlanRepository extends JpaRepository<Plan, UUID> {
}