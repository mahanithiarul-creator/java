package com.wastepickup.service;

import com.wastepickup.dto.CreateScheduleRequest;
import com.wastepickup.entity.Schedule;
import com.wastepickup.entity.Zone;
import com.wastepickup.exception.InvalidScheduleException;
import com.wastepickup.exception.ResourceNotFoundException;
import com.wastepickup.repository.ScheduleRepository;
import com.wastepickup.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ZoneRepository zoneRepository;

    public ScheduleService(ScheduleRepository scheduleRepository, ZoneRepository zoneRepository) {
        this.scheduleRepository = scheduleRepository;
        this.zoneRepository = zoneRepository;
    }

    @Transactional
    public Schedule createSchedule(CreateScheduleRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null
                || !request.getStartTime().isBefore(request.getEndTime())) {
            throw new InvalidScheduleException("Schedule start time must be before end time");
        }

        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + request.getZoneId()));

        Schedule schedule = new Schedule();
        schedule.setZone(zone);
        schedule.setDayOfWeek(request.getDayOfWeek());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());

        return scheduleRepository.save(schedule);
    }

    @Transactional(readOnly = true)
    public List<Schedule> getSchedulesByZone(Long zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + zoneId));
        return scheduleRepository.findByZone(zone);
    }

    @Transactional(readOnly = true)
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Schedule> getSchedulesByZoneAndDay(Zone zone, DayOfWeek dayOfWeek) {
        return scheduleRepository.findByZoneAndDayOfWeek(zone, dayOfWeek);
    }
}
