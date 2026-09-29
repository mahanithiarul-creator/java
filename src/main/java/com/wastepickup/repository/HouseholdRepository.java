package com.wastepickup.repository;

import com.wastepickup.entity.Household;
import com.wastepickup.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HouseholdRepository extends JpaRepository<Household, Long> {

    List<Household> findByZone(Zone zone);

    List<Household> findByFlaggedTrue();
}
