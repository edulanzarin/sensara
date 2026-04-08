package com.sensara.api.domain.plan.repository;

import com.sensara.api.domain.plan.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByCompanionIdAndActiveTrue(UUID companionId);
}