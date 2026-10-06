package com.edumanage.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "fee_transactions")
public class FeeTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String transactionId;

    private String rollNo;
    private String name;
    private Double amount;
    private LocalDate date;
    private String status;
}
