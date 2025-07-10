package com.example.pharmamind.controller;

import com.example.pharmamind.CodeVerificationService;
import com.example.pharmamind.EmailService;
import com.example.pharmamind.Entites.InscriptionAdminPharmacieRequest;
import com.example.pharmamind.Entites.Pharmacie;
import com.example.pharmamind.Entites.Utilisateur;
import com.example.pharmamind.Entites.Role;
import com.example.pharmamind.JwtUtil;
import com.example.pharmamind.Repo.PharmacieRepo;
import com.example.pharmamind.Repo.UtilisateurRepo;
import com.example.pharmamind.Services;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.pharmamind.Entites.LoginRequest;

import java.util.*;
import java.util.Base64;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UtilisateurRepo utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PharmacieRepo pharmacieRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CodeVerificationService codeVerificationService;
    @Autowired
    private Services serviceGlobal;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utilisateur utilisateur) {
        // Vérifier si email existe déjà
        if (utilisateurRepository.existsByEmail(utilisateur.getEmail())) {
            return ResponseEntity.badRequest().body("Email déjà utilisé");
        }

        // Encoder le mot de passe
        utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));

        // Si aucun rôle précisé, définir CLIENT par défaut
        if (utilisateur.getRole() == null) {
            utilisateur.setRole(Role.CLIENT);
        }

        // Sauvegarder l'utilisateur
        utilisateurRepository.save(utilisateur);

        return ResponseEntity.ok("Inscription réussie !");
    }
    @PostMapping(value = "/inscription-admin-pharmacie", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> inscrireAdminPharmacie(
            @RequestPart("data") InscriptionAdminPharmacieRequest request,
            @RequestPart(value = "diplome", required = false) MultipartFile diplome,
            @RequestPart(value = "carte", required = false) MultipartFile carte,
            @RequestPart(value = "autorisation", required = false) MultipartFile autorisation) {

        Pharmacie pharmacie = new Pharmacie();
        pharmacie.setNom(request.getNomPharmacie());
        pharmacie.setAdresse(request.getAdressePharmacie());
        pharmacie.setVille(request.getVille());
        pharmacie.setGouvernorat(request.getGouvernorat());
        pharmacie.setCodePostal(request.getCodePostal());
        pharmacie.setTelephone(request.getTelephonePh());
        pharmacie.setLatitude(request.getLatitude());
        pharmacie.setLongitude(request.getLongitude());

        // Correction : stocker le contenu des fichiers (byte[]) et non le nom
        try {
            pharmacie.setDiplome(diplome != null ? diplome.getBytes() : null);
            pharmacie.setCarte(carte != null ? carte.getBytes() : null);
            pharmacie.setAutorisation(autorisation != null ? autorisation.getBytes() : null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la lecture des fichiers.");
        }

        pharmacieRepo.save(pharmacie);

        Utilisateur user = new Utilisateur();
        user.setNom(request.getNom());
        user.setEmail(request.getEmail());
        user.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        user.setAdresse(request.getAdresse());
        user.setVille(request.getVille());
        user.setRole(Role.ADMINPH);
        user.setPharmacie(pharmacie);
        user.setCin(request.getCin());
        user.setDateNaissance(request.getDateNaissance());
        user.setTelephone(request.getTelephone());

        utilisateurRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Inscription enregistrée avec succès !");
        return ResponseEntity.ok(response);
    }

    public String generateVerificationCode() {
        Random random = new Random();
        int code = 1000 + random.nextInt(9000);
        return String.valueOf(code);
    }
    @PostMapping("/send-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email manquant");
        }

        String code = generateVerificationCode();
        codeVerificationService.saveCode(email, code);
        emailService.sendVerificationCode(email, code);
        return ResponseEntity.ok("Code envoyé");
    }


    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body("Champs email ou code manquants");
        }

        boolean isValid = codeVerificationService.verifyCode(email, code);
        if (isValid) {
            return ResponseEntity.ok("Code valide");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Code invalide");
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<Utilisateur> optionalUtilisateur = utilisateurRepository.findByEmail(loginRequest.getEmail());

        if (optionalUtilisateur.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email non trouvé");
        }

        Utilisateur utilisateur = optionalUtilisateur.get();

        // Ajout de la condition isActive
        if (!utilisateur.isActive()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Votre compte n'est pas encore activé.");
        }

        boolean passwordMatch = passwordEncoder.matches(loginRequest.getMotDePasse(), utilisateur.getMotDePasse());

        if (!passwordMatch) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe incorrect");
        }

        // Préparation des claims JWT
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", utilisateur.getId());
        claims.put("email", utilisateur.getEmail());
        claims.put("role", utilisateur.getRole() != null ? utilisateur.getRole().name() : null);
        Long pharmacieId = (utilisateur.getPharmacie() != null) ? utilisateur.getPharmacie().getId() : null;
        claims.put("pharmacie_id", pharmacieId);

        String token = jwtUtil.generateToken(claims, utilisateur.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", utilisateur.getId());
        response.put("nom", utilisateur.getNom());
        response.put("email", utilisateur.getEmail());
        response.put("role", utilisateur.getRole() != null ? utilisateur.getRole().name() : null);
        response.put("ville", utilisateur.getVille());
        response.put("isActive", utilisateur.isActive());
        response.put("pharmacie_id", pharmacieId);
        response.put("cin", utilisateur.getCin());
        response.put("dateNaissance", utilisateur.getDateNaissance());
        response.put("telephone", utilisateur.getTelephone());

        return ResponseEntity.ok(response);
    }

    // DTO pour exposer les infos utilisateur + images pharmacie
    public static class UtilisateurInactifDTO {
        public Long id;
        public String nom;
        public String email;
        public String ville;
        public boolean isActive;
        public String role;
        public PharmacieDTO pharmacie;

        public UtilisateurInactifDTO(Utilisateur u) {
            this.id = u.getId();
            this.nom = u.getNom();
            this.email = u.getEmail();
            this.ville = u.getVille();
            this.isActive = u.isActive();
            this.role = u.getRole() != null ? u.getRole().name() : null;
            if (u.getPharmacie() != null) {
                this.pharmacie = new PharmacieDTO(u.getPharmacie());
            }
        }
    }

    public static class PharmacieDTO {
        public Long id;
        public String nom;
        public String adresse;
        public String ville;
        public String gouvernorat;
        public String codePostal;
        public String telephone;
        public double latitude;
        public double longitude;
        public String diplome;
        public String carte;
        public String autorisation;

        public PharmacieDTO(Pharmacie p) {
            this.id = p.getId();
            this.nom = p.getNom();
            this.adresse = p.getAdresse();
            this.ville = p.getVille();
            this.gouvernorat = p.getGouvernorat();
            this.codePostal = p.getCodePostal();
            this.telephone = p.getTelephone();
            this.latitude = p.getLatitude();
            this.longitude = p.getLongitude();
            this.diplome = (p.getDiplome() != null) ? Base64.getEncoder().encodeToString(p.getDiplome()) : null;
            this.carte = (p.getCarte() != null) ? Base64.getEncoder().encodeToString(p.getCarte()) : null;
            this.autorisation = (p.getAutorisation() != null) ? Base64.getEncoder().encodeToString(p.getAutorisation()) : null;
        }
    }

    @GetMapping("/utilisateurs/inactifs")
    public ResponseEntity<List<UtilisateurInactifDTO>> getUtilisateursInactifs() {
        List<Utilisateur> inactifs = utilisateurRepository.findByIsActiveFalse();
        List<UtilisateurInactifDTO> dtos = new ArrayList<>();
        for (Utilisateur u : inactifs) {
            dtos.add(new UtilisateurInactifDTO(u));
        }
        return ResponseEntity.ok(dtos);
    }
    @PostMapping("/utilisateurs/activer")
    public ResponseEntity<?> activerUtilisateur(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().body("ID utilisateur manquant.");
        }

        Optional<Utilisateur> optionalUser = utilisateurRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé.");
        }

        Utilisateur utilisateur = optionalUser.get();
        utilisateur.setActive(true);
        utilisateurRepository.save(utilisateur);

        return ResponseEntity.ok("Utilisateur activé avec succès.");
    }
    @PostMapping("/send-acceptation-email")
    public ResponseEntity<?> sendAcceptationEmail(@RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        if (userId == null) {
            return ResponseEntity.badRequest().body("ID utilisateur manquant.");
        }

        Optional<Utilisateur> optionalUser = utilisateurRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé.");
        }

        Utilisateur utilisateur = optionalUser.get();
        String email = utilisateur.getEmail();
        String nom = utilisateur.getNom();

        try {
            emailService.sendAcceptationEmail(email, nom);
            return ResponseEntity.ok("Email d'acceptation envoyé avec succès.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'envoi de l'email.");
        }
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Pour JWT stateless, il suffit de supprimer le token côté front-end
        return ResponseEntity.ok("Déconnexion réussie");
    }


}
