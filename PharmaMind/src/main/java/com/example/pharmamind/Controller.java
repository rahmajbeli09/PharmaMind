package com.example.pharmamind;
import com.example.pharmamind.Repo.MedicamentRepo;
import com.example.pharmamind.Services;
import com.example.pharmamind.Entites.*;
import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import io.jsonwebtoken.Claims;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class Controller {
    @Autowired
    private Services serviceGlobal;
    @Autowired
    private MedicamentRepo medicamentRepository;
    @Autowired
    private JwtUtil jwtUtil;

    // --- Medicament ---
    @GetMapping("/medicaments")
    public List<Medicament> getAllMedicaments() {
        return serviceGlobal.getAllMedicaments();
    }

    @PostMapping("/medicaments")
    public Medicament saveMedicament(@RequestBody Medicament medicament) {
        return serviceGlobal.saveMedicament(medicament);
    }

    @PutMapping("/medicaments/{id}")
    public ResponseEntity<Medicament> updateMedicament(@PathVariable Long id, @RequestBody Medicament medicament) {
        Medicament updated = serviceGlobal.updateMedicament(id, medicament);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/medicaments/{id}")
    public void deleteMedicament(@PathVariable Long id) {
        serviceGlobal.deleteMedicament(id);
    }

    @PostMapping("/medicaments/import-csv-line")
    public ResponseEntity<?> importCsvLine(@RequestBody Medicament medicament) {
        medicamentRepository.save(medicament);
        return ResponseEntity.ok().build();
    }
    // --- Utilisateur ---
    @GetMapping("/utilisateurs")
    public List<Utilisateur> getAllUtilisateurs() {
        return serviceGlobal.getAllUtilisateurs();
    }

    @GetMapping("/utilisateurs/{id}/nom")
    public ResponseEntity<?> getNomUtilisateur(@PathVariable Long id) {
        return serviceGlobal.getUtilisateurById(id)
                .map((Utilisateur utilisateur) -> ResponseEntity.ok(Map.of("nom", utilisateur.getNom())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/utilisateurs")
    public Utilisateur saveUtilisateur(@RequestBody Utilisateur utilisateur) {
        return serviceGlobal.saveUtilisateur(utilisateur);
    }

    @DeleteMapping("/utilisateurs/{id}")
    public void deleteUtilisateur(@PathVariable Long id) {
        serviceGlobal.deleteUtilisateur(id);
    }

    // Récupérer les utilisateurs par pharmacie_id
    @GetMapping("/utilisateurs/by-pharmacie/{pharmacieId}")
    public List<Utilisateur> getUtilisateursByPharmacie(@PathVariable Long pharmacieId) {
        List<Utilisateur> all = serviceGlobal.getUtilisateursByPharmacieId(pharmacieId);
        List<Utilisateur> pharmaciens = new ArrayList<>();
        for (Utilisateur u : all) {
            if (u.getRole() != null && u.getRole().name().equalsIgnoreCase("PHARMACIEN")) {
                pharmaciens.add(u);
            }
        }
        return pharmaciens;
    }

    // Ajouter un utilisateur à une pharmacie existante
    @PostMapping("/utilisateurs/add-to-pharmacie/{pharmacieId}")
    public ResponseEntity<Utilisateur> addUtilisateurToPharmacie(@RequestBody Utilisateur utilisateur, @PathVariable Long pharmacieId) {
        Utilisateur saved = serviceGlobal.addUtilisateurToPharmacie(utilisateur, pharmacieId);
        if (saved == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(saved);
    }

    // --- Pharmacie ---
    @GetMapping("/pharmacies")
    public List<Pharmacie> getAllPharmacies() {
        return serviceGlobal.getAllPharmacies();
    }

    // Ajout d'une pharmacie avec upload d'images
    @PostMapping(value = "/pharmacies", consumes = {"multipart/form-data"})
    public ResponseEntity<Pharmacie> savePharmacie(
            @RequestPart("pharmacie") Pharmacie pharmacie,
            @RequestPart(value = "diplome", required = false) MultipartFile diplome,
            @RequestPart(value = "autorisation", required = false) MultipartFile autorisation,
            @RequestPart(value = "carte", required = false) MultipartFile carte
    ) {
        try {
            // Stocker le contenu des fichiers (byte[]) et non le nom
            if (diplome != null) pharmacie.setDiplome(diplome.getBytes());
            if (autorisation != null) pharmacie.setAutorisation(autorisation.getBytes());
            if (carte != null) pharmacie.setCarte(carte.getBytes());
            Pharmacie saved = serviceGlobal.savePharmacie(pharmacie);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/pharmacies/{id}")
    public void deletePharmacie(@PathVariable Long id) {
        serviceGlobal.deletePharmacie(id);
    }

    // Upload des images pour une pharmacie
    @PostMapping("/pharmacies/{id}/upload-images")
    public ResponseEntity<Pharmacie> uploadPharmacieImages(
            @PathVariable Long id,
            @RequestParam(value = "diplome", required = false) MultipartFile diplome,
            @RequestParam(value = "autorisation", required = false) MultipartFile autorisation,
            @RequestParam(value = "carte", required = false) MultipartFile carte
    ) {
        Pharmacie pharmacie = serviceGlobal.getAllPharmacies().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(null);
        if (pharmacie == null) return ResponseEntity.notFound().build();
        try {
            if (diplome != null) pharmacie.setDiplome(diplome.getBytes());
            if (autorisation != null) pharmacie.setAutorisation(autorisation.getBytes());
            if (carte != null) pharmacie.setCarte(carte.getBytes());
            Pharmacie updated = serviceGlobal.savePharmacie(pharmacie);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- MedicamentPrescrit ---
    @GetMapping("/medicaments-prescrits")
    public List<MedicamentPrescrit> getAllMedicamentsPrescrits() {
        return serviceGlobal.getAllMedicamentsPrescrits();
    }

    @PostMapping("/medicaments-prescrits")
    public MedicamentPrescrit saveMedicamentPrescrit(@RequestBody MedicamentPrescrit medicamentPrescrit) {
        return serviceGlobal.saveMedicamentPrescrit(medicamentPrescrit);
    }
    @PostMapping("/scan")
    public ResponseEntity<String> scanOrdonnance(@RequestParam("file") MultipartFile file) throws Exception {
        List<AnnotateImageRequest> requests = new ArrayList<>();
        ByteString imgBytes = ByteString.copyFrom(file.getBytes());

        Image img = Image.newBuilder().setContent(imgBytes).build();
        Feature feat = Feature.newBuilder().setType(Feature.Type.DOCUMENT_TEXT_DETECTION).build();
        AnnotateImageRequest request =
                AnnotateImageRequest.newBuilder().addFeatures(feat).setImage(img).build();
        requests.add(request);

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
            BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
            String text = response.getResponses(0).getFullTextAnnotation().getText();
            return ResponseEntity.ok(text);
        }
    }

    @DeleteMapping("/medicaments-prescrits/{id}")
    public void deleteMedicamentPrescrit(@PathVariable Long id) {
        serviceGlobal.deleteMedicamentPrescrit(id);
    }

    // --- Ordonnance ---
    @GetMapping("/ordonnances")
    public List<Ordonnance> getAllOrdonnances() {
        return serviceGlobal.getAllOrdonnances();
    }

    @PostMapping("/ordonnances")
    public Ordonnance saveOrdonnance(@RequestBody Ordonnance ordonnance) {
        return serviceGlobal.saveOrdonnance(ordonnance);
    }

    @DeleteMapping("/ordonnances/{id}")
    public void deleteOrdonnance(@PathVariable Long id) {
        serviceGlobal.deleteOrdonnance(id);
    }

    // --- Stock ---
    @GetMapping("/stocks")
    public List<Stock> getAllStocks() {
        return serviceGlobal.getAllStocks();
    }

    @PostMapping("/stocks")
    public Stock saveStock(@RequestBody Stock stock) {
        return serviceGlobal.saveStock(stock);
    }

    @DeleteMapping("/stocks/{id}")
    public void deleteStock(@PathVariable Long id) {
        serviceGlobal.deleteStock(id);
    }

    // --- TicketDeCaisse ---
    @GetMapping("/tickets")
    public List<TicketDeCaisse> getAllTickets() {
        return serviceGlobal.getAllTickets();
    }
    @GetMapping("/pharmacie-id-by-user/{userId}")
    public ResponseEntity<Long> getPharmacieId(@PathVariable Long userId) {
        try {
            Long pharmacieId = serviceGlobal.getPharmacieIdByUtilisateurId(userId);
            return ResponseEntity.ok(pharmacieId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/pharmacie-coordonnees-nulles/{userId}")
    public ResponseEntity<Boolean> pharmacieCoordonneesNulles(@PathVariable Long userId) {
        try {
            boolean sontNulles = serviceGlobal.pharmacieCoordonneesSontNulles(userId);
            return ResponseEntity.ok(sontNulles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }


    @GetMapping("/tickets/{pharmacieId}/{date}")
    public ResponseEntity<List<TicketDeCaisse>> getTicketByIdPharmacieEtDate(
            @PathVariable Long pharmacieId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<TicketDeCaisse> tickets = serviceGlobal.getTicketsByDateAndPharmacieId(date, pharmacieId);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PostMapping("/tickets")
    public TicketDeCaisse saveTicket(@RequestBody TicketDeCaisse ticket) {
        return serviceGlobal.saveTicket(ticket);
    }

    @PutMapping("/tickets/{id}")
    public ResponseEntity<TicketDeCaisse> updateTicket(@PathVariable Long id, @RequestBody TicketDeCaisse ticket) {
        TicketDeCaisse updated = serviceGlobal.updateTicket(id, ticket);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/medicaments/{id}/quantite-stock")
    public ResponseEntity<Medicament> updateQuantiteStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        if (!body.containsKey("quantiteStock")) {
            return ResponseEntity.badRequest().build();
        }
        int nouvelleQuantite = body.get("quantiteStock");
        Medicament updated = serviceGlobal.updateQuantiteStock(id, nouvelleQuantite);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/tickets/{id}")
    public void deleteTicket(@PathVariable Long id) {
        serviceGlobal.deleteTicket(id);
    }

    @GetMapping("/{id}/pharmacien")
    public ResponseEntity<String> getNomPharmacienByTicketId(@PathVariable Long id) {
        try {
            String nomPharmacien = serviceGlobal.getNomPharmacienByTicketId(id);
            return ResponseEntity.ok(nomPharmacien);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PutMapping("/{id}/localisation")
    public ResponseEntity<Pharmacie> updateLocalisation(
            @PathVariable Long id,
            @RequestParam double latitude,
            @RequestParam double longitude) {

        Pharmacie updatedPharmacie = serviceGlobal.updateLocation(id, latitude, longitude);
        return ResponseEntity.ok(updatedPharmacie);
    }
}