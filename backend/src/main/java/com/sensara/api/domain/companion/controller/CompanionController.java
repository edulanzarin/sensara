package com.sensara.api.domain.companion.controller;

import com.sensara.api.domain.companion.dto.CompanionCreateDto;
import com.sensara.api.domain.companion.dto.CompanionUpdateDto;
import com.sensara.api.domain.companion.model.Companion;
import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.companion.specification.CompanionSpecification;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.sensara.api.domain.user.model.User;
import com.sensara.api.domain.user.model.UserRole;
import com.sensara.api.domain.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/companions")
@RequiredArgsConstructor
public class CompanionController {

    private final CompanionRepository companionRepository;
    private final UserRepository userRepository;

    @PostMapping("/{userId}")
    public ResponseEntity<Companion> createProfile(
            @PathVariable UUID userId,
            @RequestBody @Valid CompanionCreateDto dto) {

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        var companion = Companion.builder()
                .user(user)
                .nickname(dto.nickname())
                .bio(dto.bio())
                .age(dto.age())
                .height(dto.height())
                .weight(dto.weight())
                .ethnicity(dto.ethnicity())
                .hairColor(dto.hairColor())
                .eyeColor(dto.eyeColor())
                .state(dto.state())
                .city(dto.city())
                .neighborhood(dto.neighborhood())
                .whatsapp(dto.whatsapp())
                .basePrice(dto.basePrice())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(companionRepository.save(companion));
    }

    @GetMapping
    public ResponseEntity<Page<Companion>> search(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String ethnicity,
            Pageable pageable) {

        var spec = CompanionSpecification.filter(state, city, minAge, maxAge, maxPrice, ethnicity);
        return ResponseEntity.ok(companionRepository.findAll(spec, pageable));
    }

    @PutMapping("/{companionId}")
    public ResponseEntity<Companion> updateProfile(
            @PathVariable UUID companionId,
            @RequestBody CompanionUpdateDto dto,
            @AuthenticationPrincipal User loggedUser) {

        // companionId == userId por causa do @MapsId
        if (!loggedUser.getId().equals(companionId) && loggedUser.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile");
        }

        var companion = companionRepository.findById(companionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Companion not found"));

        if (dto.nickname() != null)
            companion.setNickname(dto.nickname());
        if (dto.bio() != null)
            companion.setBio(dto.bio());
        if (dto.age() != null)
            companion.setAge(dto.age());
        if (dto.height() != null)
            companion.setHeight(dto.height());
        if (dto.weight() != null)
            companion.setWeight(dto.weight());
        if (dto.ethnicity() != null)
            companion.setEthnicity(dto.ethnicity());
        if (dto.hairColor() != null)
            companion.setHairColor(dto.hairColor());
        if (dto.eyeColor() != null)
            companion.setEyeColor(dto.eyeColor());
        if (dto.state() != null)
            companion.setState(dto.state());
        if (dto.city() != null)
            companion.setCity(dto.city());
        if (dto.neighborhood() != null)
            companion.setNeighborhood(dto.neighborhood());
        if (dto.whatsapp() != null)
            companion.setWhatsapp(dto.whatsapp());
        if (dto.basePrice() != null)
            companion.setBasePrice(dto.basePrice());

        return ResponseEntity.ok(companionRepository.save(companion));
    }

    @GetMapping("/me")
    public ResponseEntity<Companion> getMyProfile(@AuthenticationPrincipal User loggedUser) {
        // @MapsId garante que companion.id == user.id, então findById funciona
        var companion = companionRepository.findById(loggedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil não encontrado"));

        return ResponseEntity.ok(companion);
    }
}