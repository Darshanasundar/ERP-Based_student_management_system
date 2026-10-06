package com.edumanage.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String department;

    @Column(name = "academic_year", nullable = false)
    private String year;

    @Column(name = "fee_total", precision = 10, scale = 2)
    private BigDecimal feeTotal;

    @Column(name = "fee_paid", precision = 10, scale = 2)
    private BigDecimal feePaid;

    @Column(name = "profile_image_url")
    private String profileImageUrl;
}
