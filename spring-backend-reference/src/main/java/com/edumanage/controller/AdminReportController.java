package com.edumanage.controller;

import com.edumanage.model.Faculty;
import com.edumanage.model.FeeTransaction;
import com.edumanage.model.Student;
import com.edumanage.model.Subject;
import com.edumanage.repository.FacultyRepository;
import com.edumanage.repository.FeeTransactionRepository;
import com.edumanage.repository.StudentRepository;
import com.edumanage.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminReportController {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final FeeTransactionRepository feeTransactionRepository;

    @GetMapping("/students.csv")
    public ResponseEntity<byte[]> exportStudents() {
        List<Student> students = studentRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,Name,Department,Year\n");
        for (Student s : students) {
            csv.append(s.getStudentId()).append(",")
               .append(s.getName()).append(",")
               .append(s.getDepartment()).append(",")
               .append(s.getYear()).append("\n");
        }
        return generateCsvResponse(csv.toString(), "student_register.csv");
    }

    @GetMapping("/faculty.csv")
    public ResponseEntity<byte[]> exportFaculty() {
        List<Faculty> faculty = facultyRepository.findAll();
        StringBuilder csv = new StringBuilder("Employee ID,Name,Department,Designation\n");
        for (Faculty f : faculty) {
            csv.append(f.getEmployeeId()).append(",")
               .append(f.getName()).append(",")
               .append(f.getDepartment()).append(",")
               .append(f.getDesignation()).append("\n");
        }
        return generateCsvResponse(csv.toString(), "faculty_workload.csv");
    }

    @GetMapping("/defaulters.csv")
    public ResponseEntity<byte[]> exportDefaulters() {
        List<FeeTransaction> fees = feeTransactionRepository.findAll();
        StringBuilder csv = new StringBuilder("Transaction ID,Roll No,Name,Amount,Date,Status\n");
        for (FeeTransaction f : fees) {
            if ("Pending".equalsIgnoreCase(f.getStatus())) {
                csv.append(f.getTransactionId()).append(",")
                   .append(f.getRollNo()).append(",")
                   .append(f.getName()).append(",")
                   .append(f.getAmount()).append(",")
                   .append(f.getDate()).append(",")
                   .append(f.getStatus()).append("\n");
            }
        }
        return generateCsvResponse(csv.toString(), "fee_defaulters.csv");
    }

    @GetMapping("/subjects.csv")
    public ResponseEntity<byte[]> exportSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        StringBuilder csv = new StringBuilder("Subject Code,Subject Name,Department,Credits\n");
        for (Subject s : subjects) {
            csv.append(s.getSubjectCode()).append(",")
               .append(s.getSubjectName()).append(",")
               .append(s.getDepartment()).append(",")
               .append(s.getCredits()).append("\n");
        }
        return generateCsvResponse(csv.toString(), "syllabus.csv");
    }

    private ResponseEntity<byte[]> generateCsvResponse(String csvData, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("filename", filename);
        return new ResponseEntity<>(csvData.getBytes(), headers, HttpStatus.OK);
    }
}
