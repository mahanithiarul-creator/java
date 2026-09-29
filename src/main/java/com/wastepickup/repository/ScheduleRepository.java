package com.wastepickup.repository;

import com.wastepickup.entity.Schedule;
import com.wastepickup.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByZone(Zone zone);

    List<Schedule> findByZoneAndDayOfWeek(Zone zone, DayOfWeek dayOfWeek);
}
