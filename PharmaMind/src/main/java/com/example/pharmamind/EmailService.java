package com.example.pharmamind;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationCode(String toEmail, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Code de vérification");

            String htmlContent = "<html><body>"
                    + "<h2>Bonjour </h2>"
                    + "<p>Votre code de vérification est : <b style='color:blue;font-size:20px'>" + code + "</b></p>"
                    + "<p>Merci d’utiliser notre plateforme </p>"
                    + "<img src='cid:logoImage' width='320' height='120'/>"
                    + "</body></html>";

            helper.setText(htmlContent, true);

            FileSystemResource image = new FileSystemResource(new File("src/main/resources/static/logo.png"));
            helper.addInline("logoImage", image);

            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace(); // ou log
        }
    }


    public void sendAcceptationEmail(String toEmail, String nom) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Votre compte a été accepté");

            String htmlContent = "<html><body>"
                    + "<h2>Bonjour " + nom + "</h2>"
                    + "<p>🎉 Votre compte a été <b>accepté</b>. Vous pouvez maintenant accéder à la plateforme.</p>"
                    + "<p>Cordialement,<br>L'équipe <b>Pharmamind</b></p>"
                    + "<img src='cid:logoImage' width='320' height='120'/>"
                    + "</body></html>";

            helper.setText(htmlContent, true);

            FileSystemResource image = new FileSystemResource(new File("src/main/resources/static/logo.png"));
            helper.addInline("logoImage", image);

            mailSender.send(message);

        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}
