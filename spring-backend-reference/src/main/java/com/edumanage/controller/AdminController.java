package com.edumanage.controller;

import com.edumanage.repository.StudentRepository;
import com.edumanage.service.ExcelUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4173") // Or "*" for dev
@RequiredArgsConstructor
public class AdminController {

    private final ExcelUploadService excelUploadService;
    private final StudentRepository studentRepository;

    @PostMapping("/students/upload")
    public ResponseEntity<Map<String, String>> uploadStudentsFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        
        if (file.isEmpty()) {
            response.put("message", "Please upload a valid Excel file!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            excelUploadService.saveStudentsFromExcel(file);
            response.put("message", "Students uploaded successfully!");
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response.put("message", "Could not upload the file: " + file.getOriginalFilename() + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(response);
        }
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalStudents = studentRepository.count();
        BigDecimal pendingFees = studentRepository.getTotalPendingFees();
        if (pendingFees == null) {
            pendingFees = BigDecimal.ZERO;
        }

        // We can add mock values here for remaining stats just for dashboard completeness
        stats.put("totalStudents", totalStudents);
        stats.put("totalFaculty", 6); // Mocked for now
        stats.put("subjects", 60);    // Mocked for now
        stats.put("pendingFees", "₹" + pendingFees.toPlainString());

        return ResponseEntity.ok(stats);
    }
}
