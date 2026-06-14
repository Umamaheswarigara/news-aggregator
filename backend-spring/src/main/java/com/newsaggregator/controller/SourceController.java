package com.newsaggregator.controller;

import com.newsaggregator.model.Source;
import com.newsaggregator.repository.SourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/sources")
public class SourceController {

    @Autowired
    private SourceRepository sourceRepository;

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping
    public ResponseEntity<List<Source>> getAllSources() {
        return ResponseEntity.ok(sourceRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createSource(@RequestBody Source source) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Admin role required");
        }
        if (source.getSourceName() == null || source.getSourceName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Source name is required");
        }
        Optional<Source> existing = sourceRepository.findBySourceName(source.getSourceName());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Source name already exists");
        }
        Source saved = sourceRepository.save(source);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSource(@PathVariable Long id, @RequestBody Source sourceDetails) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Admin role required");
        }
        Optional<Source> sourceOpt = sourceRepository.findById(id);
        if (sourceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Source source = sourceOpt.get();
        source.setSourceName(sourceDetails.getSourceName());
        source.setWebsite(sourceDetails.getWebsite());
        Source updated = sourceRepository.save(source);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSource(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Admin role required");
        }
        if (!sourceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sourceRepository.deleteById(id);
        return ResponseEntity.ok("Source deleted successfully");
    }
}
