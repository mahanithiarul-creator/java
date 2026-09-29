package com.wastepickup.service;

import com.wastepickup.dto.CreateScheduleRequest;
import com.wastepickup.exception.InvalidScheduleException;
import com.wastepickup.repository.ScheduleRepository;
import com.wastepickup.repository.ZoneRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private ZoneRepository zoneRepository;

    @InjectMocks
    private ScheduleService scheduleService;

    @Test
    void rejectsScheduleWhenStartTimeIsNotBeforeEndTime() {
        CreateScheduleRequest request = new CreateScheduleRequest();
        request.setStartTime(LocalTime.of(11, 0));
        request.setEndTime(LocalTime.of(11, 0));

        assertThrows(InvalidScheduleException.class, () -> scheduleService.createSchedule(request));

        verifyNoInteractions(scheduleRepository, zoneRepository);
    }
}
