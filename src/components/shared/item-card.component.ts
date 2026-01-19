import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadItem } from '../../services/db.service';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="glass-panel p-4 rounded-xl border border-white/10 hover:border-osama-green/40 transition-all duration-200 group"
    >
      <!-- Header -->
      <div class="flex items-start gap-3">
        <img
          [src]="item().icon"
          [alt]="item().name"
          class="w-14 h-14 rounded bg-black/50 object-cover flex-shrink-0"
        />

        <div class="min-w-0 flex-1">
          <!-- Name -->
          <div class="font-bold text-white leading-tight break-words">
            {{ item().name }}
          </div>

          <!-- Description (shows on hover under the name) -->
          <div
            class="mt-1 text-xs text-gray-400 overflow-hidden opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-16 transition-all duration-200"
            title="{{ item().description }}"
          >
            {{ item().description }}
          </div>

          <!-- Meta -->
          <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <div class="flex items-center gap-1" title="Type">
              <i class="fas fa-tag"></i>
              {{ item().type }}
            </div>

            <div class="flex items-center gap-1" title="Rating">
              <i class="fas fa-star text-yellow-400"></i>
              {{ item().rating | number:'1.1-1' }}
              <span class="text-gray-500">({{ item().ratingCount | number }})</span>
            </div>

            <div class="flex items-center gap-1" title="Downloads">
              <i class="fas fa-download text-osama-blue"></i>
              {{ item().downloads | number }}
            </div>

            <div class="flex items-center gap-1" title="Release Date">
              <i class="fas fa-calendar-alt"></i>
              {{ item().releaseDate }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Area -->
      <div class="mt-3">
        <button
          (click)="onDownload()"
          class="w-full bg-osama-green-dim hover:bg-osama-green text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm shadow-[0_0_10px_rgba(0,255,65,0.2)] hover:shadow-[0_0_15px_rgba(0,255,65,0.5)]"
        >
          <i class="fas fa-download"></i> DOWNLOAD
        </button>
      </div>

      <!-- Rating Interaction -->
      <div
        class="mt-2 pt-2 border-t border-white/5 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
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
  rate = output<{ id: number; val: number }>();

  stars = computed(() => {
    const r = Math.round(this.item().rating);
    return Array(5)
      .fill(false)
      .map((_, i) => i < r);
  });

  onDownload() {
    this.download.emit(this.item().id);
  }

  onRate(val: number) {
    this.rate.emit({ id: this.item().id, val });
  }
}