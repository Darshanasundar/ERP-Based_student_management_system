package com.edumanage.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "faculty")
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeId;

    @Column(nullable = false)
    private String name;

    private String department;
    private String designation;
    private String email;
}
