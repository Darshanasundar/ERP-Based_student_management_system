package com.edumanage.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "faculty_assignments")
@Data
public class FacultyAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String employeeId;
    
    @Column(nullable = false)
    private String subjectCode;
    
    @Column(nullable = false)
    private String academicYear;
    
    @Column(nullable = false)
    private String semester;
}
