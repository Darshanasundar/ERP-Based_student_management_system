package com.edumanage.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "enrollments")
@Data
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String studentId;
    
    @Column(nullable = false)
    private String subjectCode;
    
    @Column(nullable = false)
    private String academicYear;
    
    @Column(nullable = false)
    private String semester;
}
