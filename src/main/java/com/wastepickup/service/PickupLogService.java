package com.wastepickup.service;

import com.wastepickup.dto.CreatePickupRequest;
import com.wastepickup.entity.Household;
import com.wastepickup.entity.PickupLog;
import com.wastepickup.entity.Schedule;
import com.wastepickup.exception.InvalidPickupException;
import com.wastepickup.exception.ResourceNotFoundException;
import com.wastepickup.repository.HouseholdRepository;
import com.wastepickup.repository.PickupLogRepository;
import com.wastepickup.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class PickupLogService {

    private final PickupLogRepository pickupLogRepository;
    private final HouseholdRepository householdRepository;
    private final ScheduleRepository scheduleRepository;
    private final double minimumAverageScore;

    public PickupLogService(
            PickupLogRepository pickupLogRepository,
            HouseholdRepository householdRepository,
            ScheduleRepository scheduleRepository,
            @Value("${wastepickup.minimum-average-score}") double minimumAverageScore) {
        this.pickupLogRepository = pickupLogRepository;
        this.householdRepository = householdRepository;
        this.scheduleRepository = scheduleRepository;
        this.minimumAverageScore = minimumAverageScore;
    }

    @Transactional
    public PickupLog recordPickup(CreatePickupRequest request) {
        validateSegregationScore(request.getSegregationScore());
        if (request.getPickupDateTime() == null) {
            throw new InvalidPickupException("Pickup date and time are required");
        }

        Household household = householdRepository.findById(request.getHouseholdId())
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with id: " + request.getHouseholdId()));

        List<Schedule> schedules = scheduleRepository.findByZoneAndDayOfWeek(
                household.getZone(), request.getPickupDateTime().getDayOfWeek());
        LocalTime pickupTime = request.getPickupDateTime().toLocalTime();

        boolean withinScheduledWindow = schedules.stream()
                .anyMatch(schedule -> isWithinScheduleWindow(pickupTime, schedule));
        if (!withinScheduledWindow) {
            throw new InvalidPickupException("Pickup must occur within the household zone's scheduled time window");
        }

        PickupLog pickupLog = new PickupLog();
        pickupLog.setHousehold(household);
        pickupLog.setPickupDateTime(request.getPickupDateTime());
        pickupLog.setSegregationScore(request.getSegregationScore());
        PickupLog savedPickupLog = pickupLogRepository.save(pickupLog);

        double averageScore = pickupLogRepository
                .findAverageSegregationScoreByHouseholdId(household.getId())
                .orElse(0.0);
        household.setFlagged(averageScore < minimumAverageScore);
        householdRepository.save(household);

        return savedPickupLog;
    }

    @Transactional(readOnly = true)
    public List<PickupLog> getAllPickupLogs() {
        return pickupLogRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<PickupLog> getPickupLogsByHousehold(Long householdId) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with id: " + householdId));
        return pickupLogRepository.findByHousehold(household);
    }

    private void validateSegregationScore(Integer segregationScore) {
        if (segregationScore == null || segregationScore < 0 || segregationScore > 100) {
            throw new InvalidPickupException("Segregation score must be between 0 and 100");
        }
    }

    private boolean isWithinScheduleWindow(LocalTime pickupTime, Schedule schedule) {
        return !pickupTime.isBefore(schedule.getStartTime()) && !pickupTime.isAfter(schedule.getEndTime());
    }
}
