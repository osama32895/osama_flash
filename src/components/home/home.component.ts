
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../services/db.service';
import { ItemCardComponent } from '../shared/item-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ItemCardComponent, FormsModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  db = inject(DbService);

  searchQuery = signal('');
  filterType = signal<'All' | 'App' | 'Game' | 'Driver'>('All');
  sortBy = signal<string>('date-desc');
  viewMode = signal<'grid' | 'list'>('grid');

  filteredItems = computed(() => {
    let items = this.db.items();
    const query = this.searchQuery().toLowerCase();
    const type = this.filterType();
    const sort = this.sortBy();

    // 1. Filter by Type
    if (type !== 'All') {
      items = items.filter(i => i.type === type);
    }

    // 2. Filter by Search
    if (query) {
      items = items.filter(i => i.name.toLowerCase().includes(query));
    }

    // 3. Sort
    items = [...items].sort((a, b) => {
      switch (sort) {
        case 'date-desc': return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case 'date-asc': return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'downloads': return b.downloads - a.downloads;
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });

    return items;
  });

  updateSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  updateSort(e: Event) {
    this.sortBy.set((e.target as HTMLSelectElement).value);
  }

  toggleView() {
    this.viewMode.update(m => m === 'grid' ? 'list' : 'grid');
  }

  handleDownload(id: number) {
    const item = this.db.items().find(i => i.id === id);
    if (item && item.url) {
      console.log('Initiating download for:', item.url);
      
      const link = document.createElement('a');
      link.href = item.url;
      link.setAttribute('download', item.name);
      
      // Ensure absolute path if it doesn't start with http/https
      if (!item.url.startsWith('http') && !item.url.startsWith('/')) {
         link.href = '/' + item.url;
      }

      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      this.db.incrementDownload(id);
    } else {
      console.error('Download item not found or URL missing');
    }
  }

  handleRate(evt: {id: number, val: number}) {
    this.db.rateItem(evt.id, evt.val);
  }
}
