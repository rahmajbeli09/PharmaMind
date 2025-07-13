import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterModule } from '@angular/router';
import { ViewportScroller, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  showDropdown = false;
  isScrolled = false;
  isMenuOpen = false;
  activeSection = 'top';
  
  // Propriétés de recherche
  searchQuery = '';
  filters = {
    inStock: false,
    nearMe: false,
    distance: '5'
  };

  constructor(private router: Router, private viewportScroller: ViewportScroller) {}

  ngOnInit() {
    // Gestion du défilement pour les ancres
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const tree = this.router.parseUrl(this.router.url);
        if (tree.fragment) {
          setTimeout(() => {
            this.viewportScroller.scrollToAnchor(tree.fragment);
          }, 0);
        }
      }
    });
    
    // Vérifier l'état initial de défilement
    this.onWindowScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 50;
    this.updateActiveSection();
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = sectionId;
      // Mettre à jour l'URL sans recharger la page
      history.pushState(null, '', `#${sectionId}`);
    }
  }

  updateActiveSection() {
    const sections = ['top', 'about', 'services'];
    const scrollPosition = window.scrollY + 100; // Ajouter un offset pour la navbar

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          this.activeSection = section;
          break;
        }
      }
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Méthode pour fermer le menu déroulant lors d'un clic à l'extérieur
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && this.showDropdown) {
      this.showDropdown = false;
    }
  }
  
  // Search methods
  onSearch() {
    if (!this.searchQuery.trim()) return;
    
    // Implement search logic here
    console.log('Searching for:', this.searchQuery);
    console.log('Filters:', this.filters);
    
    // Example: Navigate to search results
    // this.router.navigate(['/search'], { 
    //   queryParams: { 
    //     q: this.searchQuery,
    //     ...this.filters
    //   } 
    // });
  }
  
  setSearchQuery(query: string) {
    this.searchQuery = query;
    this.onSearch();
  }
}
