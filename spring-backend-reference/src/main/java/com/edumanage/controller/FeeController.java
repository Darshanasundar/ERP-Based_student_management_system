package com.edumanage.controller;

import com.edumanage.model.FeeTransaction;
import com.edumanage.repository.FeeTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/fees")
@CrossOrigin(origins = "*")
public class FeeController {

    @Autowired
    private FeeTransactionRepository feeTransactionRepository;

    @GetMapping
    public List<FeeTransaction> getAllFees() {
        return feeTransactionRepository.findAll();
    }

    @PostMapping
    public FeeTransaction createFee(@RequestBody FeeTransaction fee) {
        return feeTransactionRepository.save(fee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFee(@PathVariable Long id) {
        return feeTransactionRepository.findById(id)
                .map(fee -> {
                    feeTransactionRepository.delete(fee);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
