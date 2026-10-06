package com.edumanage.repository;

import com.edumanage.model.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    
    List<Mark> findByStudentId(String studentId);
    
    List<Mark> findByStudentIdAndCourseId(String studentId, String courseId);
}
