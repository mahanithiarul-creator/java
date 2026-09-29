package com.wastepickup.repository;

import com.wastepickup.entity.Household;
import com.wastepickup.entity.PickupLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PickupLogRepository extends JpaRepository<PickupLog, Long> {

    List<PickupLog> findByHousehold(Household household);

    @Query("SELECT AVG(p.segregationScore) FROM PickupLog p WHERE p.household.id = :householdId")
    Optional<Double> findAverageSegregationScoreByHouseholdId(@Param("householdId") Long householdId);

    @Query("SELECT AVG(p.segregationScore) FROM PickupLog p WHERE p.household.zone.id = :zoneId")
    Optional<Double> findAverageSegregationScoreByZoneId(@Param("zoneId") Long zoneId);
}
