package com.wastepickup.controller;

import com.wastepickup.dto.AverageScoreResponse;
import com.wastepickup.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/households/{householdId}/average-score")
    public ResponseEntity<AverageScoreResponse> getHouseholdAverageScore(@PathVariable Long householdId) {
        return ResponseEntity.ok(analyticsService.getHouseholdAverageScore(householdId));
    }

    @GetMapping("/zones/{zoneId}/average-score")
    public ResponseEntity<AverageScoreResponse> getZoneAverageScore(@PathVariable Long zoneId) {
        return ResponseEntity.ok(analyticsService.getZoneAverageScore(zoneId));
    }
}
