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
    private final com.edumanage.repository.UserRepository userRepository;

    private String getAuthenticatedStudentId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        com.edumanage.model.User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getReferenceId();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardDTO> getStudentDashboard() {
        String studentId = getAuthenticatedStudentId();
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
    public ResponseEntity<StudentDashboardDTO> getMyAcademics() {
        return getStudentDashboard();
    }

    @GetMapping("/attendance/detailed")
    public ResponseEntity<List<com.edumanage.model.Attendance>> getDetailedAttendance() {
        return ResponseEntity.ok(attendanceRepository.findByStudentId(getAuthenticatedStudentId()));
    }

    @GetMapping("/marks")
    public ResponseEntity<List<Mark>> getDetailedMarks() {
        return ResponseEntity.ok(markRepository.findByStudentId(getAuthenticatedStudentId()));
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
