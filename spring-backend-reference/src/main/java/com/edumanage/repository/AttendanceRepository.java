package com.edumanage.repository;

import com.edumanage.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    List<Attendance> findByStudentIdAndCourseId(String studentId, String courseId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.status = 'PRESENT'")
    long countPresentByStudentId(@Param("studentId") String studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.status != 'EXCUSED'")
    long countTotalWorkingDaysByStudentId(@Param("studentId") String studentId);
}
