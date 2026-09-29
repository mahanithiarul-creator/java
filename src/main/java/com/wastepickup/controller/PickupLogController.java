package com.wastepickup.controller;

import com.wastepickup.dto.CreatePickupRequest;
import com.wastepickup.dto.PickupLogResponse;
import com.wastepickup.entity.PickupLog;
import com.wastepickup.service.PickupLogService;
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
@RequestMapping("/api/pickups")
public class PickupLogController {

    private final PickupLogService pickupLogService;

    public PickupLogController(PickupLogService pickupLogService) {
        this.pickupLogService = pickupLogService;
    }

    @PostMapping
    public ResponseEntity<PickupLogResponse> createPickup(@Valid @RequestBody CreatePickupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(pickupLogService.recordPickup(request)));
    }

    @GetMapping
    public ResponseEntity<List<PickupLogResponse>> getAllPickups() {
        return ResponseEntity.ok(pickupLogService.getAllPickupLogs().stream().map(this::toResponse).toList());
    }

    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<PickupLogResponse>> getPickupsByHousehold(@PathVariable Long householdId) {
        return ResponseEntity.ok(pickupLogService.getPickupLogsByHousehold(householdId).stream().map(this::toResponse).toList());
    }

    private PickupLogResponse toResponse(PickupLog pickupLog) {
        return new PickupLogResponse(
                pickupLog.getId(),
                pickupLog.getHousehold().getId(),
                pickupLog.getPickupDateTime(),
                pickupLog.getSegregationScore());
    }
}
