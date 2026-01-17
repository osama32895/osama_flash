
import { Component, inject } from '@angular/core';
import { DbService } from '../../services/db.service';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-12 flex justify-center">
      <div class="glass-panel max-w-2xl w-full rounded-2xl p-8 relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-osama-green opacity-10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-osama-blue opacity-10 rounded-full blur-3xl"></div>

        <div class="text-center mb-8">
          <div class="w-24 h-24 bg-gradient-to-br from-osama-green to-blue-600 rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-black mb-4 shadow-[0_0_20px_rgba(0,255,65,0.4)]">
            O
          </div>
          
          <!-- Dynamic Content -->
          <div [innerHTML]="db.aboutContent()"></div>
        </div>

        <div class="mt-10 flex justify-center gap-6">
          <a href="#" class="w-12 h-12 rounded-full bg-white/5 hover:bg-blue-600 flex items-center justify-center text-white transition-all transform hover:scale-110">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="#" class="w-12 h-12 rounded-full bg-white/5 hover:bg-blue-400 flex items-center justify-center text-white transition-all transform hover:scale-110">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="#" class="w-12 h-12 rounded-full bg-white/5 hover:bg-pink-600 flex items-center justify-center text-white transition-all transform hover:scale-110">
            <i class="fab fa-instagram"></i>
          </a>
          <a href="#" class="w-12 h-12 rounded-full bg-white/5 hover:bg-gray-700 flex items-center justify-center text-white transition-all transform hover:scale-110">
            <i class="fab fa-github"></i>
          </a>
        </div>
        
        <div class="mt-8 text-center text-xs text-gray-500">
          &copy; 2023 Osama Flash. All rights reserved.
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {
  db = inject(DbService);
}
