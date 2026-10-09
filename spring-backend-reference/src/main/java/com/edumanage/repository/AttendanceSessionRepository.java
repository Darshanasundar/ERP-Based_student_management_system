package com.edumanage.repository;

import com.edumanage.model.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByEmployeeIdAndSessionDate(String employeeId, LocalDate sessionDate);
}
