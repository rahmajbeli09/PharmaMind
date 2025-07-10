package com.example.pharmamind.controller;

import com.example.pharmamind.SendCredentialsService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/send-credentials")
public class SendCredentialsController {
    @Autowired
    private SendCredentialsService sendCredentialsService;

    @PostMapping
    public ResponseEntity<?> sendCredentials(@RequestParam String email, @RequestParam String password) {
        sendCredentialsService.sendCredentials(email, password);
        return ResponseEntity.ok("Email envoyé avec succès à " + email);
    }
}

