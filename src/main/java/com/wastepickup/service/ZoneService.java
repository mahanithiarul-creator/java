package com.wastepickup.service;

import com.wastepickup.dto.CreateZoneRequest;
import com.wastepickup.entity.Zone;
import com.wastepickup.exception.ResourceNotFoundException;
import com.wastepickup.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ZoneService {

    private final ZoneRepository zoneRepository;

    public ZoneService(ZoneRepository zoneRepository) {
        this.zoneRepository = zoneRepository;
    }

    @Transactional
    public Zone createZone(CreateZoneRequest request) {
        Zone zone = new Zone();
        zone.setZoneName(request.getZoneName());
        return zoneRepository.save(zone);
    }

    @Transactional(readOnly = true)
    public Zone getZoneById(Long zoneId) {
        return zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + zoneId));
    }

    @Transactional(readOnly = true)
    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }
}
