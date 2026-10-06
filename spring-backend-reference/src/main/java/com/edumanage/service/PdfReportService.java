package com.edumanage.service;

import com.edumanage.model.Mark;
import com.edumanage.model.Student;
import com.edumanage.repository.MarkRepository;
import com.edumanage.repository.StudentRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfReportService {

    private final StudentRepository studentRepository;
    private final MarkRepository markRepository;

    private final String INSTITUTION_NAME = "Global Engineering College";

    public byte[] generateFeeReceipt(String studentId, String transactionId, double amount) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph(INSTITUTION_NAME, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 14);
            Paragraph subTitle = new Paragraph("Fee Payment Receipt", subTitleFont);
            subTitle.setAlignment(Element.ALIGN_CENTER);
            subTitle.setSpacingAfter(20);
            document.add(subTitle);

            Student student = studentRepository.findAll().stream()
                    .filter(s -> s.getStudentId().equals(studentId))
                    .findFirst().orElse(null);

            String studentName = student != null ? student.getName() : "Unknown Student";
            String department = student != null ? student.getDepartment() : "Unknown Dept";

            document.add(new Paragraph("Receipt No: " + transactionId));
            document.add(new Paragraph("Date: " + LocalDate.now().toString()));
            document.add(new Paragraph("Student ID: " + studentId));
            document.add(new Paragraph("Student Name: " + studentName));
            document.add(new Paragraph("Department: " + department));
            document.add(new Paragraph("Amount Paid: ₹" + amount));
            
            Paragraph footer = new Paragraph("\n\nThis is a computer generated receipt and requires no signature.");
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating fee receipt PDF", e);
        }

        return out.toByteArray();
    }

    public byte[] generateReportCard(String studentId) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph(INSTITUTION_NAME, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 14);
            Paragraph subTitle = new Paragraph("Academic Transcript", subTitleFont);
            subTitle.setAlignment(Element.ALIGN_CENTER);
            subTitle.setSpacingAfter(20);
            document.add(subTitle);

            Student student = studentRepository.findAll().stream()
                    .filter(s -> s.getStudentId().equals(studentId))
                    .findFirst().orElse(null);

            String studentName = student != null ? student.getName() : "Unknown Student";
            
            document.add(new Paragraph("Student ID: " + studentId));
            document.add(new Paragraph("Student Name: " + studentName));
            document.add(new Paragraph("Date: " + LocalDate.now().toString()));
            document.add(new Paragraph("\n"));

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            
            PdfPCell hcell;
            hcell = new PdfPCell(new Phrase("Course Code", headFont));
            hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(hcell);

            hcell = new PdfPCell(new Phrase("Exam Name", headFont));
            hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(hcell);

            hcell = new PdfPCell(new Phrase("Score", headFont));
            hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(hcell);

            List<Mark> marks = markRepository.findByStudentId(studentId);
            
            for (Mark mark : marks) {
                PdfPCell cell;

                cell = new PdfPCell(new Phrase(mark.getCourseId()));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(mark.getExamName()));
                cell.setPaddingLeft(5);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                table.addCell(cell);

                cell = new PdfPCell(new Phrase(String.valueOf(mark.getScore()) + " / " + String.valueOf(mark.getMaxScore())));
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating report card PDF", e);
        }

        return out.toByteArray();
    }
}
