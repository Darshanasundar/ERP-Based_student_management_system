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
            Faculty f1 = new Faculty();
            f1.setEmployeeId("FAC101");
            f1.setName("Dr. Ananya Sharma");
            f1.setDepartment("CSE");
            f1.setDesignation("Professor & HOD");
            f1.setEmail("ananya.sharma@gec.edu");

            Faculty f2 = new Faculty();
            f2.setEmployeeId("FAC102");
            f2.setName("Prof. Rajesh Kumar");
            f2.setDepartment("ECE");
            f2.setDesignation("Associate Professor");
            f2.setEmail("rajesh.kumar@gec.edu");

            Faculty f3 = new Faculty();
            f3.setEmployeeId("FAC103");
            f3.setName("Dr. Priya Venkatesh");
            f3.setDepartment("MECH");
            f3.setDesignation("Assistant Professor");
            f3.setEmail("priya.venkatesh@gec.edu");

            facultyRepository.saveAll(List.of(f1, f2, f3));
            System.out.println("Seeded Faculty Data");
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
            Student st1 = new Student();
            st1.setStudentId("7376211CS101");
            st1.setName("Arjun Reddy");
            st1.setDepartment("CSE");
            st1.setYear("4");
            st1.setSemester("7");
            st1.setEmail("arjun.reddy@gec.edu");

            Student st2 = new Student();
            st2.setStudentId("7376211EC145");
            st2.setName("Neha Gupta");
            st2.setDepartment("ECE");
            st2.setYear("3");
            st2.setSemester("5");
            st2.setEmail("neha.gupta@gec.edu");

            studentRepository.saveAll(List.of(st1, st2));
            System.out.println("Seeded Student Data");
        }
    }
}
