package com.example.pharmamind;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CodeVerificationService {
    private final Map<String, String> emailToCode = new ConcurrentHashMap<>();

    public void saveCode(String email, String code) {
        emailToCode.put(email, code);
    }

    public boolean verifyCode(String email, String code) {
        return code.equals(emailToCode.get(email));
    }
}
