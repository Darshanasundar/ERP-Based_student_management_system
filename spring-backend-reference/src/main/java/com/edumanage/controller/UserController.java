package com.edumanage.controller;

import com.edumanage.model.Student;
import com.edumanage.repository.StudentRepository;
import com.edumanage.service.S3FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4173")
@RequiredArgsConstructor
public class UserController {

    private final S3FileStorageService s3FileStorageService;
    private final StudentRepository studentRepository;

    @PostMapping("/{id}/upload-profile")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }

        try {
            // Upload to S3 under 'profiles' folder
            String fileUrl = s3FileStorageService.uploadFile(file, "profiles");
            
            // Assuming 'id' is studentId like "STU001"
            Optional<Student> studentOpt = studentRepository.findAll().stream()
                    .filter(s -> s.getStudentId().equals(id))
                    .findFirst();

            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                
                // Delete old profile picture from S3 if it exists
                if (student.getProfileImageUrl() != null && !student.getProfileImageUrl().isEmpty()) {
                    s3FileStorageService.deleteFile(student.getProfileImageUrl());
                }
                
                student.setProfileImageUrl(fileUrl);
                studentRepository.save(student);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Profile picture updated successfully!",
                    "profileUrl", fileUrl
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Could not upload file: " + ex.getMessage()));
        }
    }
}
