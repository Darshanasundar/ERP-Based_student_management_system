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
    private final com.edumanage.repository.FacultyRepository facultyRepository;
    private final com.edumanage.repository.SubjectRepository subjectRepository;

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

    @GetMapping("/students")
    public ResponseEntity<java.util.List<com.edumanage.model.Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @PostMapping("/students")
    public ResponseEntity<com.edumanage.model.Student> addStudent(@RequestBody com.edumanage.model.Student student) {
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @GetMapping("/faculty")
    public ResponseEntity<java.util.List<com.edumanage.model.Faculty>> getAllFaculty() {
        return ResponseEntity.ok(facultyRepository.findAll());
    }

    @PostMapping("/faculty")
    public ResponseEntity<com.edumanage.model.Faculty> addFaculty(@RequestBody com.edumanage.model.Faculty faculty) {
        return ResponseEntity.ok(facultyRepository.save(faculty));
    }

    @GetMapping("/subjects")
    public ResponseEntity<java.util.List<com.edumanage.model.Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @PostMapping("/subjects")
    public ResponseEntity<com.edumanage.model.Subject> addSubject(@RequestBody com.edumanage.model.Subject subject) {
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();
        long totalSubjects = subjectRepository.count();
        BigDecimal pendingFees = studentRepository.getTotalPendingFees();
        if (pendingFees == null) {
            pendingFees = BigDecimal.ZERO;
        }

        stats.put("totalStudents", totalStudents);
        stats.put("totalFaculty", totalFaculty);
        stats.put("subjects", totalSubjects);
        stats.put("pendingFees", "₹" + pendingFees.toPlainString());

        return ResponseEntity.ok(stats);
    }
}
