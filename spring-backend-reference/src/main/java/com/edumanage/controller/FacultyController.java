package com.edumanage.controller;

import com.edumanage.model.Attendance;
import com.edumanage.model.Mark;
import com.edumanage.model.Student;
import com.edumanage.repository.AttendanceRepository;
import com.edumanage.repository.MarkRepository;
import com.edumanage.repository.StudentRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "http://localhost:4173")
@RequiredArgsConstructor
public class FacultyController {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final com.edumanage.service.RiskPredictionService riskPredictionService;

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getStudentsByCourse(@RequestParam("courseId") String courseId) {
        // In a real app, you'd filter by course enrollment. Here we return all for simplicity
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @PostMapping("/attendance")
    public ResponseEntity<Map<String, String>> submitAttendance(@RequestBody AttendanceRequest request) {
        List<Attendance> records = request.getStudentStatuses().stream().map(status -> {
            Attendance a = new Attendance();
            a.setDate(request.getDate());
            a.setCourseId(request.getCourseId());
            a.setStudentId(status.getStudentId());
            a.setStatus(Attendance.AttendanceStatus.valueOf(status.getStatus().toUpperCase()));
            return a;
        }).collect(Collectors.toList());

        attendanceRepository.saveAll(records);
        return ResponseEntity.ok(Map.of("message", "Attendance saved successfully"));
    }

    @PostMapping("/marks")
    public ResponseEntity<Map<String, String>> submitMarks(@RequestBody MarkRequest request) {
        List<Mark> records = request.getStudentScores().stream().map(score -> {
            Mark m = new Mark();
            m.setExamName(request.getExamName());
            m.setCourseId(request.getCourseId());
            m.setStudentId(score.getStudentId());
            m.setScore(score.getScore());
            m.setMaxScore(request.getMaxScore());
            return m;
        }).collect(Collectors.toList());

        markRepository.saveAll(records);
        return ResponseEntity.ok(Map.of("message", "Marks saved successfully"));
    }

    @GetMapping("/student-risk/{studentId}")
    public ResponseEntity<com.edumanage.service.RiskPredictionService.RiskResponse> getStudentRisk(@PathVariable("studentId") String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        // Fee Ratio
        double feePendingRatio = 0.0;
        if (student.getFeeTotal() != null && student.getFeeTotal().compareTo(java.math.BigDecimal.ZERO) > 0) {
            java.math.BigDecimal paid = student.getFeePaid() != null ? student.getFeePaid() : java.math.BigDecimal.ZERO;
            feePendingRatio = student.getFeeTotal().subtract(paid).doubleValue() / student.getFeeTotal().doubleValue();
        }

        // Attendance Percentage
        long present = attendanceRepository.countPresentByStudentId(studentId);
        long totalDays = attendanceRepository.countTotalWorkingDaysByStudentId(studentId);
        double attendancePercentage = totalDays > 0 ? (double) present / totalDays * 100 : 100.0;

        // Marks Average
        List<Mark> marks = markRepository.findByStudentId(studentId);
        double marksAvg = 100.0;
        if (!marks.isEmpty()) {
            double sum = marks.stream().mapToDouble(m -> 
                m.getScore().doubleValue() / m.getMaxScore().doubleValue() * 100
            ).sum();
            marksAvg = sum / marks.size();
        }

        com.edumanage.service.RiskPredictionService.RiskResponse response = riskPredictionService.predictRisk(attendancePercentage, marksAvg, feePendingRatio);
        return ResponseEntity.ok(response);
    }

    // DTOs
    @Data
    public static class AttendanceRequest {
        private LocalDate date;
        private String courseId;
        private List<StudentAttendance> studentStatuses;
    }

    @Data
    public static class StudentAttendance {
        private String studentId;
        private String status;
    }

    @Data
    public static class MarkRequest {
        private String examName;
        private String courseId;
        private java.math.BigDecimal maxScore;
        private List<StudentScore> studentScores;
    }

    @Data
    public static class StudentScore {
        private String studentId;
        private java.math.BigDecimal score;
    }
}
