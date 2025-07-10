package com.example.pharmamind;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class SendCredentialsService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendCredentials(String toEmail, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Vos identifiants de connexion");
            String htmlContent = "<html><body>"
                    + "<h2>Bienvenue sur PharmaMind</h2>"
                    + "<p>Votre adresse e-mail : <b>" + toEmail + "</b></p>"
                    + "<p>Votre mot de passe : <b style='color:blue;font-size:20px'>" + password + "</b></p>"
                    + "<p>Merci d'utiliser notre plateforme.</p>"
                    + "</body></html>";
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
