package com.example.pharmamind;

import com.example.pharmamind.Entites.*;
import com.example.pharmamind.Repo.*;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class Services {

    private final MedicamentRepo medicamentRepo;
    private final UtilisateurRepo utilisateurRepo;
    private final PharmacieRepo pharmacieRepo;
    private final MedicamentPrescritRepo medicamentPrescritRepo;
    private final OrdonnanceRepository ordonnanceRepo;
    private final StockRepository stockRepo;
    private final TicketDeCaisseRepo ticketDeCaisseRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SendCredentialsService sendCredentialsService;

    @Autowired
    public Services(MedicamentRepo medicamentRepo, UtilisateurRepo utilisateurRepo,
                    PharmacieRepo pharmacieRepo, MedicamentPrescritRepo medicamentPrescritRepo,
                    OrdonnanceRepository ordonnanceRepo, StockRepository stockRepo,
                    TicketDeCaisseRepo ticketDeCaisseRepo) {
        this.medicamentRepo = medicamentRepo;
        this.utilisateurRepo = utilisateurRepo;
        this.pharmacieRepo = pharmacieRepo;
        this.medicamentPrescritRepo = medicamentPrescritRepo;
        this.ordonnanceRepo = ordonnanceRepo;
        this.stockRepo = stockRepo;
        this.ticketDeCaisseRepo = ticketDeCaisseRepo;
    }


    // Medicament
    public List<Medicament> getAllMedicaments() { return medicamentRepo.findAll(); }
    public Medicament saveMedicament(Medicament m) { return medicamentRepo.save(m); }
    public void deleteMedicament(Long id) { medicamentRepo.deleteById(id); }

    public Medicament updateMedicament(Long id, Medicament medicamentDetails) {
        Medicament medicament = medicamentRepo.findById(id).orElse(null);
        if (medicament == null) return null;
        medicament.setName(medicamentDetails.getName());
        medicament.setDosage(medicamentDetails.getDosage());
        medicament.setForme(medicamentDetails.getForme());
        medicament.setPresentation(medicamentDetails.getPresentation());
        medicament.setPrice(medicamentDetails.getPrice());
        medicament.setRemboursement(medicamentDetails.getRemboursement());
        medicament.setDci(medicamentDetails.getDci());
        medicament.setCategorie(medicamentDetails.getCategorie());
        medicament.setQuantiteStock(medicamentDetails.getQuantiteStock());
        return medicamentRepo.save(medicament);
    }

    // Nouvelle méthode pour modifier la quantité en stock d'un médicament
    public Medicament updateQuantiteStock(Long id, int nouvelleQuantite) {
        Medicament medicament = medicamentRepo.findById(id).orElse(null);
        if (medicament == null) return null;
        medicament.setQuantiteStock(nouvelleQuantite);
        return medicamentRepo.save(medicament);
    }

    // Utilisateur
    public List<Utilisateur> getAllUtilisateurs() { return utilisateurRepo.findAll(); }
    public Utilisateur saveUtilisateur(Utilisateur u) { return utilisateurRepo.save(u); }
    public void deleteUtilisateur(Long id) { utilisateurRepo.deleteById(id); }

    // Active un utilisateur (isActive à true)
    public Utilisateur activerUtilisateur(Long id) {
        Utilisateur utilisateur = utilisateurRepo.findById(id).orElse(null);
        if (utilisateur == null) return null;
        utilisateur.setActive(true);
        return utilisateurRepo.save(utilisateur);
    }

    // Nouvel ajout : utilisateurs par pharmacie
    public List<Utilisateur> getUtilisateursByPharmacieId(Long pharmacieId) {
        return utilisateurRepo.findByPharmacie_Id(pharmacieId);
    }

    // Ajouter un utilisateur à une pharmacie existante
    public Utilisateur addUtilisateurToPharmacie(Utilisateur utilisateur, Long pharmacieId) {
        Pharmacie pharmacie = pharmacieRepo.findById(pharmacieId).orElse(null);
        if (pharmacie == null) return null;

        // Encoder le mot de passe avant de le sauvegarder
        String rawPassword = utilisateur.getMotDePasse();
        utilisateur.setMotDePasse(passwordEncoder.encode(rawPassword));
        utilisateur.setPharmacie(pharmacie);

        // Sauvegarder l'utilisateur
        Utilisateur savedUser = utilisateurRepo.save(utilisateur);

        // Envoyer les credentials par email
        try {
            sendCredentialsService.sendCredentials(utilisateur.getEmail(), rawPassword);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return savedUser;
    }

    // Pharmacie
    public List<Pharmacie> getAllPharmacies() { return pharmacieRepo.findAll(); }
    public Pharmacie savePharmacie(Pharmacie p) { return pharmacieRepo.save(p); }
    public void deletePharmacie(Long id) { pharmacieRepo.deleteById(id); }

    // MedicamentPrescrit
    public List<MedicamentPrescrit> getAllMedicamentsPrescrits() { return medicamentPrescritRepo.findAll(); }
    public MedicamentPrescrit saveMedicamentPrescrit(MedicamentPrescrit mp) { return medicamentPrescritRepo.save(mp); }
    public void deleteMedicamentPrescrit(Long id) { medicamentPrescritRepo.deleteById(id); }

    // Ordonnance
    public List<Ordonnance> getAllOrdonnances() { return ordonnanceRepo.findAll(); }
    public Ordonnance saveOrdonnance(Ordonnance o) { return ordonnanceRepo.save(o); }
    public void deleteOrdonnance(Long id) { ordonnanceRepo.deleteById(id); }

    // Stock
    public List<Stock> getAllStocks() { return stockRepo.findAll(); }
    public Stock saveStock(Stock s) { return stockRepo.save(s); }
    public void deleteStock(Long id) { stockRepo.deleteById(id); }

    // TicketDeCaisse
    public List<TicketDeCaisse> getAllTickets() { return ticketDeCaisseRepo.findAll(); }
    public TicketDeCaisse saveTicket(TicketDeCaisse t) { return ticketDeCaisseRepo.save(t); }
    public void deleteTicket(Long id) { ticketDeCaisseRepo.deleteById(id); }
    public TicketDeCaisse updateTicket(Long id, TicketDeCaisse ticketDetails) {
        TicketDeCaisse ticket = ticketDeCaisseRepo.findById(id).orElse(null);
        if (ticket == null) return null;
        ticket.setDateSortieTicket(ticketDetails.getDateSortieTicket());
        ticket.setPharmacien(ticketDetails.getPharmacien());
        ticket.setMontantTotal(ticketDetails.getMontantTotal());
        ticket.setMedicamentsSelectionnes(ticketDetails.getMedicamentsSelectionnes());
        return ticketDeCaisseRepo.save(ticket);
    }


    public Optional<Utilisateur> getUtilisateurById(Long id) {
        return utilisateurRepo.findById(id);
    }

    public List<TicketDeCaisse> getTicketsByDateAndPharmacieId(LocalDate date, Long pharmacieId) {
        return ticketDeCaisseRepo.findAllByPharmacieIdAndExactDate(pharmacieId, date);
    }
    public Long getPharmacieIdByUtilisateurId(Long userId) {
        return utilisateurRepo.findPharmacieIdByUtilisateurId(userId);
    }
    public boolean pharmacieCoordonneesSontNulles(Long userId) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepo.findById(userId);

        if (utilisateurOpt.isPresent()) {
            Pharmacie pharmacie = utilisateurOpt.get().getPharmacie();
            if (pharmacie != null) {
                return pharmacie.getLatitude() == 0.0 && pharmacie.getLongitude() == 0.0;
            }
        }

        return false; // soit utilisateur ou pharmacie n'existe pas
    }


    public String getNomPharmacienByTicketId(Long ticketId) {
        Optional<TicketDeCaisse> optionalTicket = ticketDeCaisseRepo.findById(ticketId);
        if (optionalTicket.isPresent()) {
            Utilisateur pharmacien = optionalTicket.get().getPharmacien();
            return pharmacien != null ? pharmacien.getNom() : "Pharmacien non défini";
        } else {
            throw new RuntimeException("Ticket non trouvé avec l'ID : " + ticketId);
        }
    }
    public Pharmacie updateLocation(Long idPharmacie, double latitude, double longitude) {
        Pharmacie pharmacie = pharmacieRepo.findById(idPharmacie)
                .orElseThrow(() -> new RuntimeException("Pharmacie non trouvée avec ID: " + idPharmacie));

        pharmacie.setLatitude(latitude);
        pharmacie.setLongitude(longitude);

        return pharmacieRepo.save(pharmacie);
    }
}