
import { Component, input, output, computed } from '@angular/core';
import { DownloadItem } from '../../services/db.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel group relative p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-white/5 border-l-4"
         [class.border-l-osama-green]="item().type === 'App'"
         [class.border-l-osama-blue]="item().type === 'Game'"
         [class.border-l-purple-500]="item().type === 'Driver'">
      
      <!-- Type Badge -->
      <div class="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded bg-black/50 border border-white/10"
           [class.text-osama-green]="item().type === 'App'"
           [class.text-osama-blue]="item().type === 'Game'"
           [class.text-purple-400]="item().type === 'Driver'">
        {{ item().type }}
      </div>

      <!-- Icon & Header -->
      <div class="flex items-center gap-4 mb-3">
        <div class="w-16 h-16 rounded-lg overflow-hidden bg-black/50 border border-white/10 flex-shrink-0">
          <img [src]="item().icon" alt="icon" class="w-full h-full object-cover">
        </div>
        <div class="overflow-hidden">
          <h3 class="font-bold text-lg truncate text-white group-hover:text-osama-green transition-colors">
            {{ item().name }}
          </h3>
          <div class="flex text-yellow-400 text-sm">
            @for (star of stars(); track $index) {
              <i class="fas fa-star" [class.text-gray-600]="!star"></i>
            }
            <span class="text-gray-500 ml-1 text-xs">({{ item().ratingCount }})</span>
          </div>
        </div>
		<div class="mt-1 text-xs text-gray-400 line-clamp-2 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-16 transition-all duration-200">
			{{ item().description }}
		</div>
      </div>

      <!-- Stats -->
      <div class="flex justify-between items-center text-sm text-gray-400 mb-3 px-1">
        <div class="flex items-center gap-1" title="Downloads">
          <i class="fas fa-download text-osama-blue"></i>
          {{ item().downloads | number }}
        </div>
        <div class="flex items-center gap-1" title="Release Date">
          <i class="fas fa-calendar-alt"></i>
          {{ item().releaseDate }}
        </div>
      </div>

      <!-- Action Area -->
      <div class="mt-2">
        <button (click)="onDownload()" 
                class="w-full bg-osama-green-dim hover:bg-osama-green text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_10px_rgba(0,255,65,0.2)] hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]">
          <i class="fas fa-download"></i> DOWNLOAD
        </button>
      </div>

      <!-- Rating Interaction (Simulated) -->
      <div class="mt-2 pt-2 border-t border-white/5 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="text-xs text-gray-500 mr-2">Rate:</span>
        @for (i of [1,2,3,4,5]; track i) {
          <button (click)="onRate(i)" class="text-gray-600 hover:text-yellow-400 text-xs transition-colors">
            <i class="fas fa-star"></i>
          </button>
        }
      </div>

    </div>
  `
})
export class ItemCardComponent {
  item = input.required<DownloadItem>();
  download = output<number>();
  rate = output<{id: number, val: number}>();
  
  stars = computed(() => {
    const r = Math.round(this.item().rating);
    return Array(5).fill(false).map((_, i) => i < r);
  });

  onDownload() {
    this.download.emit(this.item().id);
    // alert(`Downloading ${this.item().name}...`);
  }

  onRate(val: number) {
    this.rate.emit({ id: this.item().id, val });
    alert(`You rated ${this.item().name} ${val} stars!`);
  }
}
