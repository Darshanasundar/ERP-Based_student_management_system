package com.edumanage.controller;

import com.edumanage.model.Faculty;
import com.edumanage.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/faculty")
@CrossOrigin(origins = "*")
public class AdminFacultyController {

    @Autowired
    private FacultyRepository facultyRepository;

    @GetMapping
    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }

    @PostMapping
    public Faculty createFaculty(@RequestBody Faculty faculty) {
        return facultyRepository.save(faculty);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        return facultyRepository.findById(id)
                .map(faculty -> {
                    facultyRepository.delete(faculty);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
