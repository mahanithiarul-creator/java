package com.wastepickup.service;

import com.wastepickup.dto.AverageScoreResponse;
import com.wastepickup.entity.Household;
import com.wastepickup.entity.Zone;
import com.wastepickup.exception.ResourceNotFoundException;
import com.wastepickup.repository.HouseholdRepository;
import com.wastepickup.repository.PickupLogRepository;
import com.wastepickup.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {

    private final HouseholdRepository householdRepository;
    private final ZoneRepository zoneRepository;
    private final PickupLogRepository pickupLogRepository;

    public AnalyticsService(
            HouseholdRepository householdRepository,
            ZoneRepository zoneRepository,
            PickupLogRepository pickupLogRepository) {
        this.householdRepository = householdRepository;
        this.zoneRepository = zoneRepository;
        this.pickupLogRepository = pickupLogRepository;
    }

    @Transactional(readOnly = true)
    public AverageScoreResponse getHouseholdAverageScore(Long householdId) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with id: " + householdId));
        Double averageScore = pickupLogRepository
                .findAverageSegregationScoreByHouseholdId(householdId)
                .orElse(null);

        return new AverageScoreResponse(household.getId(), household.getHouseholdName(), averageScore);
    }

    @Transactional(readOnly = true)
    public AverageScoreResponse getZoneAverageScore(Long zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + zoneId));
        Double averageScore = pickupLogRepository
                .findAverageSegregationScoreByZoneId(zoneId)
                .orElse(null);

        return new AverageScoreResponse(zone.getId(), zone.getZoneName(), averageScore);
    }
}
