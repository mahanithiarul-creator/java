package com.wastepickup.dto;

public class HouseholdResponse {

    private Long id;
    private String householdName;
    private String address;
    private boolean flagged;
    private Long zoneId;

    public HouseholdResponse(Long id, String householdName, String address, boolean flagged, Long zoneId) {
        this.id = id;
        this.householdName = householdName;
        this.address = address;
        this.flagged = flagged;
        this.zoneId = zoneId;
    }

    public Long getId() {
        return id;
    }

    public String getHouseholdName() {
        return householdName;
    }

    public String getAddress() {
        return address;
    }

    public boolean isFlagged() {
        return flagged;
    }

    public Long getZoneId() {
        return zoneId;
    }
}
