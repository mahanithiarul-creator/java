package com.wastepickup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateZoneRequest {

    @NotBlank
    @Size(max = 100)
    private String zoneName;

    public CreateZoneRequest() {
    }

    public String getZoneName() {
        return zoneName;
    }

    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }
}
