package com.wastepickup.service;

import com.wastepickup.dto.AverageScoreResponse;
import com.wastepickup.entity.Household;
import com.wastepickup.entity.Zone;
import com.wastepickup.repository.HouseholdRepository;
import com.wastepickup.repository.PickupLogRepository;
import com.wastepickup.repository.ZoneRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private HouseholdRepository householdRepository;

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private PickupLogRepository pickupLogRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void returnsHouseholdAverageScore() {
        Household household = new Household();
        household.setId(1L);
        household.setHouseholdName("Household 1");
        when(householdRepository.findById(1L)).thenReturn(Optional.of(household));
        when(pickupLogRepository.findAverageSegregationScoreByHouseholdId(1L)).thenReturn(Optional.of(80.0));

        AverageScoreResponse response = analyticsService.getHouseholdAverageScore(1L);

        assertEquals(80.0, response.getAverageScore());
    }

    @Test
    void returnsZoneAverageScore() {
        Zone zone = new Zone();
        zone.setId(1L);
        zone.setZoneName("Zone A");
        when(zoneRepository.findById(1L)).thenReturn(Optional.of(zone));
        when(pickupLogRepository.findAverageSegregationScoreByZoneId(1L)).thenReturn(Optional.of(76.5));

        AverageScoreResponse response = analyticsService.getZoneAverageScore(1L);

        assertEquals(76.5, response.getAverageScore());
    }
}
