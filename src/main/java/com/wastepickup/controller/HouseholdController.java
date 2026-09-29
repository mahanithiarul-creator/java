package com.wastepickup.controller;

import com.wastepickup.dto.CreateHouseholdRequest;
import com.wastepickup.dto.HouseholdResponse;
import com.wastepickup.entity.Household;
import com.wastepickup.service.HouseholdService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/households")
public class HouseholdController {

    private final HouseholdService householdService;

    public HouseholdController(HouseholdService householdService) {
        this.householdService = householdService;
    }

    @PostMapping
    public ResponseEntity<HouseholdResponse> createHousehold(@Valid @RequestBody CreateHouseholdRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(householdService.createHousehold(request)));
    }

    @GetMapping
    public ResponseEntity<List<HouseholdResponse>> getAllHouseholds() {
        return ResponseEntity.ok(householdService.getAllHouseholds().stream().map(this::toResponse).toList());
    }

    @GetMapping("/zone/{zoneId}")
    public ResponseEntity<List<HouseholdResponse>> getHouseholdsByZone(@PathVariable Long zoneId) {
        return ResponseEntity.ok(householdService.getHouseholdsByZone(zoneId).stream().map(this::toResponse).toList());
    }

    @GetMapping("/flagged")
    public ResponseEntity<List<HouseholdResponse>> getFlaggedHouseholds() {
        return ResponseEntity.ok(householdService.getFlaggedHouseholds().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HouseholdResponse> getHouseholdById(@PathVariable Long id) {
        return ResponseEntity.ok(toResponse(householdService.getHouseholdById(id)));
    }

    private HouseholdResponse toResponse(Household household) {
        return new HouseholdResponse(
                household.getId(),
                household.getHouseholdName(),
                household.getAddress(),
                household.isFlagged(),
                household.getZone().getId());
    }
}
