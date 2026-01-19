
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
    if (!item?.url) return;

    const absoluteUrl = item.url.startsWith('http')
      ? item.url
      : new URL(item.url, window.location.origin).toString();

    // Extract real filename from URL: Clipboard_tool.exe
    const filename = decodeURIComponent(new URL(absoluteUrl).pathname.split('/').pop() || 'download');

    const a = document.createElement('a');
    a.href = absoluteUrl;
    a.download = filename;     // IMPORTANT: keep original filename + extension
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();

    this.db.incrementDownload(id);
  }

  handleRate(evt: {id: number, val: number}) {
    this.db.rateItem(evt.id, evt.val);
  }
}
