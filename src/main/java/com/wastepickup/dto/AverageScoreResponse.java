package com.wastepickup.dto;

public class AverageScoreResponse {

    private Long id;
    private String name;
    private Double averageScore;

    public AverageScoreResponse() {
    }

    public AverageScoreResponse(Long id, String name, Double averageScore) {
        this.id = id;
        this.name = name;
        this.averageScore = averageScore;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }
}
