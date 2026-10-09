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
    private final com.edumanage.repository.StudentRepository studentRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardDTO> getStudentDashboard(
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        // Mock extracting student ID from JWT token. In real production, use SecurityContextHolder.
        // The seeder generates IDs like "7376211CSE001". We will use the first seeded student.
        String studentId = "7376211CSE001"; 

        com.edumanage.model.Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student Profile Not Found"));

        long presentCount = attendanceRepository.countPresentByStudentId(studentId);
        long totalDays = attendanceRepository.countTotalWorkingDaysByStudentId(studentId);
        double attendancePercentage = totalDays > 0 ? ((double) presentCount / totalDays) * 100 : 93.0;
        
        List<Mark> recentMarks = markRepository.findByStudentId(studentId);

        StudentDashboardDTO response = new StudentDashboardDTO();
        response.setStudentId(student.getStudentId());
        response.setName(student.getName());
        response.setDepartment(student.getDepartment());
        response.setYear(student.getYear());
        response.setFeeTotal(student.getFeeTotal());
        response.setFeePaid(student.getFeePaid());
        
        response.setAttendancePercentage(Math.round(attendancePercentage * 100.0) / 100.0);
        response.setCurrentCgpa(7.73); // Mock CGPA
        response.setRecentMarks(recentMarks);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-academics")
    public ResponseEntity<StudentDashboardDTO> getMyAcademics(
            @RequestHeader(value = "Authorization", required = false) String token) {
        return getStudentDashboard(token);
    }

    @Data
    public static class StudentDashboardDTO {
        private String studentId;
        private String name;
        private String department;
        private String year;
        private java.math.BigDecimal feeTotal;
        private java.math.BigDecimal feePaid;
        private double attendancePercentage;
        private double currentCgpa;
        private List<Mark> recentMarks;
    }
}
