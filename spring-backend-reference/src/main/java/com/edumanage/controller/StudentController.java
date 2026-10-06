package com.edumanage.controller;

import com.edumanage.model.Mark;
import com.edumanage.repository.AttendanceRepository;
import com.edumanage.repository.MarkRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:4173")
@RequiredArgsConstructor
public class StudentController {

    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;

    @GetMapping("/my-academics")
    public ResponseEntity<StudentAcademicDTO> getMyAcademics(
            // In a real scenario, extract this from the JWT token via SecurityContextHolder
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        // Mock extracting student ID from JWT token
        String studentId = "STU001"; // Default mockup

        long presentCount = attendanceRepository.countPresentByStudentId(studentId);
        long totalDays = attendanceRepository.countTotalWorkingDaysByStudentId(studentId);
        
        double attendancePercentage = totalDays > 0 ? ((double) presentCount / totalDays) * 100 : 93.0; // Mocking 93.0 if no data
        
        List<Mark> recentMarks = markRepository.findByStudentId(studentId);

        StudentAcademicDTO response = new StudentAcademicDTO();
        response.setAttendancePercentage(Math.round(attendancePercentage * 100.0) / 100.0);
        response.setCurrentCgpa(7.73); // Mock CGPA logic for now
        response.setRecentMarks(recentMarks);

        return ResponseEntity.ok(response);
    }

    @Data
    public static class StudentAcademicDTO {
        private double attendancePercentage;
        private double currentCgpa;
        private List<Mark> recentMarks;
    }
}
