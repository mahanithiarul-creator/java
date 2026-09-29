package com.wastepickup.dto;

import java.time.LocalDateTime;

public class PickupLogResponse {

    private Long id;
    private Long householdId;
    private LocalDateTime pickupDateTime;
    private Integer segregationScore;

    public PickupLogResponse(Long id, Long householdId, LocalDateTime pickupDateTime, Integer segregationScore) {
        this.id = id;
        this.householdId = householdId;
        this.pickupDateTime = pickupDateTime;
        this.segregationScore = segregationScore;
    }

    public Long getId() {
        return id;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public LocalDateTime getPickupDateTime() {
        return pickupDateTime;
    }

    public Integer getSegregationScore() {
        return segregationScore;
    }
}
