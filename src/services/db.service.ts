
import { Injectable, signal, inject } from '@angular/core';
import { SqlService } from './sql.service';
import { firstValueFrom } from 'rxjs';

export interface DownloadItem {
  id: number;
  name: string;
  type: 'App' | 'Game' | 'Driver';
  icon: string;
  rating: number; 
  ratingCount: number;
  downloads: number;
  releaseDate: string;
  description: string;
  url: string;
  likes: number;
  dislikes: number;
}

export interface SiteStats {
  visitors: number;
  totalDownloads: number;
}

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private sql = inject(SqlService);

  // Reactive State (Signals)
  items = signal<DownloadItem[]>([]);
  stats = signal<SiteStats>({ visitors: 0, totalDownloads: 0 });
  aboutContent = signal<string>('');
  siteTitle = signal<string>('');

  constructor() {
    this.refreshData();
    
    // Poll for updates every 15 seconds
    setInterval(() => {
      this.sql.incrementVisitor().subscribe();
      this.refreshData();
    }, 15000);
  }

  refreshData() {
    this.sql.getAllData().subscribe(data => {
      this.items.set(data.items);
      this.stats.set(data.stats);
      this.aboutContent.set(data.aboutContent);
      this.siteTitle.set(data.config.siteTitle);
    });
  }

  async addItem(newItem: Omit<DownloadItem, 'id' | 'rating' | 'ratingCount' | 'downloads' | 'likes' | 'dislikes'>) {
    const item: DownloadItem = {
      ...newItem,
      id: Date.now(), // Temp ID, server will assign real one (or we use this for fallback)
      rating: 0,
      ratingCount: 0,
      downloads: 0,
      likes: 0,
      dislikes: 0
    };
    
    await firstValueFrom(this.sql.insertItem(item));
    this.refreshData();
  }

  async updateItem(id: number, data: Partial<DownloadItem>) {
    await firstValueFrom(this.sql.updateItem({ id, ...data }));
    this.refreshData();
  }

  incrementDownload(id: number) {
    this.sql.incrementDownload(id).subscribe(() => this.refreshData());
  }

  rateItem(id: number, rating: number) {
    // one-id-per-browser
    const key = 'osama_user_id';
    let userId = localStorage.getItem(key);
    if (!userId) {
      // simple unique id
      userId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      localStorage.setItem(key, userId);
    }

    this.sql.rateItem(id, rating, userId).subscribe((res: any) => {
      if (res?.alreadyRated) {
        alert('You already rated this item.');
        return;
      }
      if (res?.success) {
        this.refreshData();
      } else {
        alert('Rating failed.');
      }
    });
  }
  deleteItem(id: number) {
    this.sql.deleteItem(id).subscribe(() => this.refreshData());
  }

  resetItemStats(id: number) {
     // Implementation would require API endpoint
     console.log('Reset Item Stats not implemented in API yet');
  }

  resetSiteStats() {
    // Implementation would require API endpoint
    console.log('Reset Site Stats not implemented in API yet');
  }
  
  updateAboutContent(content: string) {
    this.sql.updateConfig({ aboutContent: content }).subscribe(() => this.refreshData());
  }
}
