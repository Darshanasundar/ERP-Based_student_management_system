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
    
    @Autowired
    private com.edumanage.repository.FeeStructureRepository feeStructureRepository;

    @Autowired
    private com.edumanage.repository.StudentFeeRepository studentFeeRepository;

    @GetMapping("/structures")
    public ResponseEntity<List<com.edumanage.model.FeeStructure>> getFeeStructures() {
        return ResponseEntity.ok(feeStructureRepository.findAll());
    }

    @PostMapping("/structures")
    public ResponseEntity<com.edumanage.model.FeeStructure> createFeeStructure(@RequestBody com.edumanage.model.FeeStructure structure) {
        return ResponseEntity.ok(feeStructureRepository.save(structure));
    }

    @GetMapping("/student-fees/{studentId}")
    public ResponseEntity<List<com.edumanage.model.StudentFee>> getStudentFees(@PathVariable String studentId) {
        return ResponseEntity.ok(studentFeeRepository.findByStudentId(studentId));
    }

    @PostMapping("/student-fees")
    public ResponseEntity<com.edumanage.model.StudentFee> assignFeeToStudent(@RequestBody com.edumanage.model.StudentFee studentFee) {
        return ResponseEntity.ok(studentFeeRepository.save(studentFee));
    }

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
