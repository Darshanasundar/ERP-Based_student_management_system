package com.edumanage.config;

import com.edumanage.model.Faculty;
import com.edumanage.model.FeeTransaction;
import com.edumanage.model.Student;
import com.edumanage.model.Subject;
import com.edumanage.repository.FacultyRepository;
import com.edumanage.repository.FeeTransactionRepository;
import com.edumanage.repository.StudentRepository;
import com.edumanage.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final FeeTransactionRepository feeTransactionRepository;
    private final StudentRepository studentRepository;

    @Override
    public void run(String... args) throws Exception {
        seedFaculty();
        seedSubjects();
        seedFees();
        seedStudents();
    }

    private void seedFaculty() {
        if (facultyRepository.count() == 0) {
            java.util.List<Faculty> faculties = new java.util.ArrayList<>();
            String[] depts = {"CSE", "ECE", "MECH", "CIVIL", "IT"};
            String[] designations = {"Professor", "Associate Professor", "Assistant Professor"};
            
            for (int i = 1; i <= 10; i++) {
                Faculty f = new Faculty();
                f.setEmployeeId(String.format("FAC%03d", i));
                f.setName("Faculty " + i);
                f.setDepartment(depts[i % depts.length]);
                f.setDesignation(designations[i % designations.length]);
                f.setEmail("faculty" + i + "@gec.edu");
                faculties.add(f);
            }
            facultyRepository.saveAll(faculties);
            System.out.println("Seeded 10 Faculty Data");
        }
    }

    private void seedSubjects() {
        if (subjectRepository.count() == 0) {
            Subject s1 = new Subject();
            s1.setSubjectCode("CS301");
            s1.setSubjectName("Data Structures and Algorithms");
            s1.setDepartment("CSE");
            s1.setSemester("3");
            s1.setCredits(4);

            Subject s2 = new Subject();
            s2.setSubjectCode("EC402");
            s2.setSubjectName("Digital Signal Processing");
            s2.setDepartment("ECE");
            s2.setSemester("4");
            s2.setCredits(3);

            Subject s3 = new Subject();
            s3.setSubjectCode("ME201");
            s3.setSubjectName("Engineering Thermodynamics");
            s3.setDepartment("MECH");
            s3.setSemester("2");
            s3.setCredits(4);

            subjectRepository.saveAll(List.of(s1, s2, s3));
            System.out.println("Seeded Subject Data");
        }
    }

    private void seedFees() {
        if (feeTransactionRepository.count() == 0) {
            FeeTransaction ft1 = new FeeTransaction();
            ft1.setTransactionId("TXN26001");
            ft1.setRollNo("7376211CS101");
            ft1.setName("Arjun Reddy");
            ft1.setAmount(85000.00);
            ft1.setDate(LocalDate.now().minusDays(10));
            ft1.setStatus("Success");

            FeeTransaction ft2 = new FeeTransaction();
            ft2.setTransactionId("TXN26002");
            ft2.setRollNo("7376211EC145");
            ft2.setName("Neha Gupta");
            ft2.setAmount(45000.00);
            ft2.setDate(LocalDate.now().minusDays(2));
            ft2.setStatus("Pending");

            feeTransactionRepository.saveAll(List.of(ft1, ft2));
            System.out.println("Seeded Fee Transaction Data");
        }
    }
    
    private void seedStudents() {
        if (studentRepository.count() == 0) {
            java.util.List<Student> students = new java.util.ArrayList<>();
            String[] depts = {"CSE", "ECE", "MECH", "CIVIL", "IT"};
            String[] years = {"1", "2", "3", "4"};
            
            for (int i = 1; i <= 50; i++) {
                Student st = new Student();
                st.setStudentId(String.format("7376211%s%03d", depts[i % depts.length], i));
                st.setName("Student " + i);
                st.setDepartment(depts[i % depts.length]);
                st.setYear(years[i % years.length]);
                st.setEmail("student" + i + "@gec.edu");
                
                // Assign some fees
                java.math.BigDecimal total = java.math.BigDecimal.valueOf(100000);
                java.math.BigDecimal paid = java.math.BigDecimal.valueOf((i % 5) * 25000);
                st.setFeeTotal(total);
                st.setFeePaid(paid);
                
                students.add(st);
            }
            studentRepository.saveAll(students);
            System.out.println("Seeded 50 Student Data");
        }
    }
}
