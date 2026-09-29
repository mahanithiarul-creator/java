package com.wastepickup.controller;

import com.wastepickup.dto.CreateScheduleRequest;
import com.wastepickup.dto.ScheduleResponse;
import com.wastepickup.entity.Schedule;
import com.wastepickup.service.ScheduleService;
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
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody CreateScheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(scheduleService.createSchedule(request)));
    }

    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules().stream().map(this::toResponse).toList());
    }

    @GetMapping("/zone/{zoneId}")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByZone(@PathVariable Long zoneId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByZone(zoneId).stream().map(this::toResponse).toList());
    }

    private ScheduleResponse toResponse(Schedule schedule) {
        return new ScheduleResponse(
                schedule.getId(),
                schedule.getZone().getId(),
                schedule.getDayOfWeek(),
                schedule.getStartTime(),
                schedule.getEndTime());
    }
}
