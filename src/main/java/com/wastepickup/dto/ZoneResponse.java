package com.wastepickup.dto;

public class ZoneResponse {

    private Long id;
    private String zoneName;

    public ZoneResponse(Long id, String zoneName) {
        this.id = id;
        this.zoneName = zoneName;
    }

    public Long getId() {
        return id;
    }

    public String getZoneName() {
        return zoneName;
    }
}
