package com.edumanage.repository;

import com.edumanage.model.FeeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeeTransactionRepository extends JpaRepository<FeeTransaction, Long> {
}
