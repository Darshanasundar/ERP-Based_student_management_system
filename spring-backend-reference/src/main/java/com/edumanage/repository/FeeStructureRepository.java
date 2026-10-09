package com.edumanage.repository;

import com.edumanage.model.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findByDepartmentCodeAndAcademicYear(String departmentCode, String academicYear);
}
