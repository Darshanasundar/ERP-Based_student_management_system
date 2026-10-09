package com.edumanage.service;

import lombok.Data;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@Service
public class RiskPredictionService {

    private final String pythonServiceUrl = "http://localhost:8000/predict-risk";
    private final RestTemplate restTemplate = new RestTemplate();

    public RiskResponse predictRisk(double attendancePercentage, double midtermScoreAvg, double feePendingRatio) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        RiskRequest request = new RiskRequest();
        request.setAttendance_percentage(attendancePercentage);
        request.setMidterm_score_avg(midtermScoreAvg);
        request.setFee_pending_ratio(feePendingRatio);

        HttpEntity<RiskRequest> requestEntity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<RiskResponse> response = restTemplate.postForEntity(pythonServiceUrl, requestEntity, RiskResponse.class);
            return response.getBody();
        } catch (Exception e) {
            // Fallback gracefully if python microservice is down
            RiskResponse fallback = new RiskResponse();
            fallback.setRisk_score(0.0);
            fallback.setRisk_level("Unknown");
            return fallback;
        }
    }

    @Data
    public static class RiskRequest {
        private double attendance_percentage;
        private double midterm_score_avg;
        private double fee_pending_ratio;
    }

    @Data
    public static class RiskResponse {
        private double risk_score;
        private String risk_level;
    }
}
