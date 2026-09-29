package com.wastepickup.service;

import com.wastepickup.dto.CreatePickupRequest;
import com.wastepickup.entity.Household;
import com.wastepickup.entity.PickupLog;
import com.wastepickup.entity.Schedule;
import com.wastepickup.entity.Zone;
import com.wastepickup.exception.InvalidPickupException;
import com.wastepickup.repository.HouseholdRepository;
import com.wastepickup.repository.PickupLogRepository;
import com.wastepickup.repository.ScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PickupLogServiceTest {

    @Mock
    private PickupLogRepository pickupLogRepository;

    @Mock
    private HouseholdRepository householdRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    private PickupLogService pickupLogService;
    private Household household;

    @BeforeEach
    void setUp() {
        pickupLogService = new PickupLogService(
                pickupLogRepository, householdRepository, scheduleRepository, 60.0);

        Zone zone = new Zone();
        zone.setId(1L);
        household = new Household();
        household.setId(1L);
        household.setZone(zone);
    }

    @Test
    void recordsPickupInsideScheduledWindowAndKeepsHouseholdUnflaggedAtThreshold() {
        when(householdRepository.findById(1L)).thenReturn(Optional.of(household));
        when(scheduleRepository.findByZoneAndDayOfWeek(any(), any()))
                .thenReturn(List.of(schedule(LocalTime.of(8, 0), LocalTime.of(11, 0))));
        when(pickupLogRepository.save(any(PickupLog.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(pickupLogRepository.findAverageSegregationScoreByHouseholdId(1L)).thenReturn(Optional.of(60.0));

        pickupLogService.recordPickup(request(60, LocalDateTime.of(2026, 9, 28, 9, 30)));

        verify(pickupLogRepository).save(any(PickupLog.class));
        verify(householdRepository).save(household);
        assertFalse(household.isFlagged());
    }

    @Test
    void rejectsPickupOutsideScheduledWindowWithoutSaving() {
        when(householdRepository.findById(1L)).thenReturn(Optional.of(household));
        when(scheduleRepository.findByZoneAndDayOfWeek(any(), any()))
                .thenReturn(List.of(schedule(LocalTime.of(8, 0), LocalTime.of(11, 0))));

        assertThrows(InvalidPickupException.class,
                () -> pickupLogService.recordPickup(request(80, LocalDateTime.of(2026, 9, 28, 13, 0))));

        verify(pickupLogRepository, never()).save(any(PickupLog.class));
    }

    @Test
    void rejectsScoresOutsideAllowedRangeWithoutSaving() {
        assertThrows(InvalidPickupException.class,
                () -> pickupLogService.recordPickup(request(101, LocalDateTime.of(2026, 9, 28, 9, 30))));
        assertThrows(InvalidPickupException.class,
                () -> pickupLogService.recordPickup(request(-1, LocalDateTime.of(2026, 9, 28, 9, 30))));

        verify(householdRepository, never()).findById(anyLong());
        verify(pickupLogRepository, never()).save(any(PickupLog.class));
    }

    @Test
    void flagsHouseholdWhenAverageFallsBelowThreshold() {
        when(householdRepository.findById(1L)).thenReturn(Optional.of(household));
        when(scheduleRepository.findByZoneAndDayOfWeek(any(), any()))
                .thenReturn(List.of(schedule(LocalTime.of(8, 0), LocalTime.of(11, 0))));
        when(pickupLogRepository.save(any(PickupLog.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(pickupLogRepository.findAverageSegregationScoreByHouseholdId(1L)).thenReturn(Optional.of(50.0));

        pickupLogService.recordPickup(request(50, LocalDateTime.of(2026, 9, 28, 9, 30)));

        assertTrue(household.isFlagged());
    }

    private CreatePickupRequest request(int score, LocalDateTime pickupDateTime) {
        CreatePickupRequest request = new CreatePickupRequest();
        request.setHouseholdId(1L);
        request.setPickupDateTime(pickupDateTime);
        request.setSegregationScore(score);
        return request;
    }

    private Schedule schedule(LocalTime startTime, LocalTime endTime) {
        Schedule schedule = new Schedule();
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        return schedule;
    }
}
