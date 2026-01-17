
import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SqlService } from './sql.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private sql = inject(SqlService);
  private router: Router = inject(Router);
  
  isAdmin = signal<boolean>(false);

  constructor() {
    if (sessionStorage.getItem('osama_admin_auth') === 'true') {
      this.isAdmin.set(true);
    }
  }

  async login(user: string, pass: string): Promise<boolean> {
    if (user === 'admin') {
      const isValid = await firstValueFrom(this.sql.verifyAdmin(pass));
      if (isValid) {
        this.isAdmin.set(true);
        sessionStorage.setItem('osama_admin_auth', 'true');
        return true;
      }
    }
    return false;
  }

  updatePassword(newPass: string) {
    if (this.isAdmin()) {
        this.sql.updateConfig({ adminPass: newPass }).subscribe();
    }
  }

  logout() {
    this.isAdmin.set(false);
    sessionStorage.removeItem('osama_admin_auth');
    this.router.navigate(['/']);
  }
}
