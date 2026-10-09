package com.edumanage.controller;

import com.edumanage.model.Announcement;
import com.edumanage.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "http://localhost:4173")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    @GetMapping("/{audience}")
    public ResponseEntity<List<Announcement>> getAnnouncements(@PathVariable String audience) {
        // e.g. audience could be 'STUDENT'
        // We fetch announcements for the specific audience + 'ALL'
        return ResponseEntity.ok(announcementRepository.findByTargetAudienceInOrderByPostedAtDesc(List.of(audience.toUpperCase(), "ALL")));
    }

    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        announcement.setPostedAt(LocalDateTime.now());
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }
}
