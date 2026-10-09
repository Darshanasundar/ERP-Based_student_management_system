package com.edumanage.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "fee_structures")
@Data
public class FeeStructure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String departmentCode;
    
    @Column(nullable = false)
    private String academicYear;
    
    @Column(nullable = false)
    private String feeType;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
}
