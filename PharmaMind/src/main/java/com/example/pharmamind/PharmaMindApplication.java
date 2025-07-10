package com.example.pharmamind;

import java.nio.file.Paths;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PharmaMindApplication {

    public static void main(String[] args) {
        // Utilise le chemin absolu pour la clé Google Cloud Vision
        String keyPath = Paths.get("src/main/resources/pharmamindocr-key.json").toAbsolutePath().toString();
        System.setProperty("GOOGLE_APPLICATION_CREDENTIALS", keyPath);
        SpringApplication.run(PharmaMindApplication.class, args);
    }

}
