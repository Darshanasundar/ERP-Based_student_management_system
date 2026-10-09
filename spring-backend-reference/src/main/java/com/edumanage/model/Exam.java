package com.edumanage.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "exams")
@Data
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String examCode;
    
    @Column(nullable = false)
    private String examName;
    
    @Column(nullable = false)
    private String subjectCode;
    
    private LocalDate examDate;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal maxMarks;
}
