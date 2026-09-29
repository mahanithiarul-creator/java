package com.wastepickup.service;

import com.wastepickup.dto.CreateHouseholdRequest;
import com.wastepickup.entity.Household;
import com.wastepickup.entity.Zone;
import com.wastepickup.exception.ResourceNotFoundException;
import com.wastepickup.repository.HouseholdRepository;
import com.wastepickup.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final ZoneRepository zoneRepository;

    public HouseholdService(HouseholdRepository householdRepository, ZoneRepository zoneRepository) {
        this.householdRepository = householdRepository;
        this.zoneRepository = zoneRepository;
    }

    @Transactional
    public Household createHousehold(CreateHouseholdRequest request) {
        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + request.getZoneId()));

        Household household = new Household();
        household.setHouseholdName(request.getHouseholdName());
        household.setAddress(request.getAddress());
        household.setZone(zone);
        household.setFlagged(false);

        return householdRepository.save(household);
    }

    @Transactional(readOnly = true)
    public Household getHouseholdById(Long householdId) {
        return householdRepository.findById(householdId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with id: " + householdId));
    }

    @Transactional(readOnly = true)
    public List<Household> getAllHouseholds() {
        return householdRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Household> getHouseholdsByZone(Long zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + zoneId));
        return householdRepository.findByZone(zone);
    }

    @Transactional(readOnly = true)
    public List<Household> getFlaggedHouseholds() {
        return householdRepository.findByFlaggedTrue();
    }
}
