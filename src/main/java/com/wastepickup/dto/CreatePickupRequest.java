package com.wastepickup.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CreatePickupRequest {

    @NotNull
    private Long householdId;

    @NotNull
    private LocalDateTime pickupDateTime;

    @NotNull
    @Min(0)
    @Max(100)
    private Integer segregationScore;

    public CreatePickupRequest() {
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }

    public LocalDateTime getPickupDateTime() {
        return pickupDateTime;
    }

    public void setPickupDateTime(LocalDateTime pickupDateTime) {
        this.pickupDateTime = pickupDateTime;
    }

    public Integer getSegregationScore() {
        return segregationScore;
    }

    public void setSegregationScore(Integer segregationScore) {
        this.segregationScore = segregationScore;
    }
}
