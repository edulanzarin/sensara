package com.sensara.api.domain.plan.controller;

import com.sensara.api.domain.plan.model.Plan;
import com.sensara.api.domain.plan.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanRepository planRepository;

    @GetMapping
    public ResponseEntity<List<Plan>> findAll() {
        return ResponseEntity.ok(planRepository.findAll());
    }
}