package com.edumanage.controller;

import com.edumanage.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:4173")
@RequiredArgsConstructor
public class ReportController {

    private final PdfReportService pdfReportService;

    @GetMapping("/fee-receipt/{id}")
    public ResponseEntity<byte[]> getFeeReceipt(@PathVariable String id, @RequestParam(defaultValue = "15000.00") double amount) {
        try {
            // using path var 'id' as studentId and a mock transactionId
            String transactionId = "TXN-" + System.currentTimeMillis();
            byte[] pdfBytes = pdfReportService.generateFeeReceipt(id, transactionId, amount);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", "fee-receipt-" + id + ".pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/transcript/{studentId}")
    public ResponseEntity<byte[]> getReportCard(@PathVariable String studentId) {
        try {
            byte[] pdfBytes = pdfReportService.generateReportCard(studentId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", "transcript-" + studentId + ".pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
