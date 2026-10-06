package com.edumanage.repository;

import com.edumanage.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    // Custom query to get total pending fees (Total Fee - Paid Fee)
    @Query("SELECT SUM(s.feeTotal - s.feePaid) FROM Student s WHERE s.feeTotal > s.feePaid")
    BigDecimal getTotalPendingFees();
}
