package com.edumanage.service;

import com.edumanage.model.Student;
import com.edumanage.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelUploadService {

    private final StudentRepository studentRepository;

    public void saveStudentsFromExcel(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            List<Student> students = new ArrayList<>();

            // Iterate through rows, skip the header row (index 0)
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) continue;

                Student student = new Student();
                
                // Assuming columns: 0=StudentId, 1=Name, 2=Email, 3=Department, 4=Year, 5=FeeTotal, 6=FeePaid
                student.setStudentId(getCellValueAsString(row.getCell(0)));
                student.setName(getCellValueAsString(row.getCell(1)));
                student.setEmail(getCellValueAsString(row.getCell(2)));
                student.setDepartment(getCellValueAsString(row.getCell(3)));
                student.setYear(getCellValueAsString(row.getCell(4)));
                student.setFeeTotal(getCellValueAsBigDecimal(row.getCell(5)));
                student.setFeePaid(getCellValueAsBigDecimal(row.getCell(6)));

                students.add(student);
            }

            studentRepository.saveAll(students);
            log.info("Successfully uploaded and saved {} students from Excel.", students.size());

        } catch (Exception e) {
            log.error("Failed to parse Excel file", e);
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return BigDecimal.ZERO;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return new BigDecimal(cell.getStringCellValue().trim());
            } catch (NumberFormatException e) {
                return BigDecimal.ZERO;
            }
        }
        return BigDecimal.ZERO;
    }
}
