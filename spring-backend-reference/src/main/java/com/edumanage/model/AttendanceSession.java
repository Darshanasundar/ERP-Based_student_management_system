package com.edumanage.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_sessions")
@Data
public class AttendanceSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String subjectCode;
    
    @Column(nullable = false)
    private String employeeId;
    
    @Column(nullable = false)
    private LocalDate sessionDate;
    
    private LocalTime startTime;
    private LocalTime endTime;
}
