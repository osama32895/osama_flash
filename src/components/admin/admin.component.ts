
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService, DownloadItem } from '../../services/db.service';
import { SqlService } from '../../services/sql.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  auth = inject(AuthService);
  db = inject(DbService);
  sql = inject(SqlService);

  // Login Form
  username = '';
  password = '';
  loginError = '';
  isLoggingIn = false;

  // Dashboard State
  activeTab = 'dashboard';
  editingId: number | null = null;
  
  // Settings State
  aboutEditText = '';
  serverAdminPass = '';
  serverSiteTitle = '';

  // Add/Edit Item Form
  newItem = {
    name: '',
    type: 'App' as 'App'|'Game'|'Driver',
    icon: '',
    releaseDate: '',
    description: '',
    url: ''
  };

  constructor() {
    this.resetForm();
    this.aboutEditText = this.db.aboutContent();
    
    // We can't synchronously get config anymore, so we subscribe once
    this.sql.getAllData().subscribe(data => {
        this.serverAdminPass = data.config.adminPass;
        this.serverSiteTitle = data.config.siteTitle;
    });
  }

  resetForm() {
    this.newItem = {
      name: '',
      type: 'App',
      icon: '',
      releaseDate: new Date().toISOString().split('T')[0],
      description: '',
      url: ''
    };
  }

  async attemptLogin() {
    this.isLoggingIn = true;
    try {
      if (await this.auth.login(this.username, this.password)) {
        this.loginError = '';
      } else {
        this.loginError = 'Invalid credentials or Server Error.';
      }
    } finally {
      this.isLoggingIn = false;
    }
  }

  resetAndOpenAdd() {
    this.editingId = null;
    this.resetForm();
    this.activeTab = 'add';
  }

  startEdit(item: DownloadItem) {
    this.editingId = item.id;
    this.newItem = {
      name: item.name,
      type: item.type,
      icon: item.icon,
      releaseDate: item.releaseDate,
      description: item.description,
      url: item.url
    };
    this.activeTab = 'add';
    window.scrollTo(0,0);
  }

  cancelEdit() {
    this.editingId = null;
    this.resetForm();
    this.activeTab = 'manage';
  }

  submitNewItem() {
    if (!this.newItem.name || !this.newItem.icon) {
      alert('Name and Icon URL are required');
      return;
    }
    
    if (!this.newItem.url) {
        const safeName = this.newItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        this.newItem.url = `/material/downloadables/${safeName}.zip`;
    }

    if (this.editingId) {
      this.db.updateItem(this.editingId, {
        name: this.newItem.name,
        type: this.newItem.type,
        icon: this.newItem.icon,
        releaseDate: this.newItem.releaseDate,
        description: this.newItem.description,
        url: this.newItem.url
      });
      alert('Item Updated!');
      this.editingId = null;
    } else {
      this.db.addItem({
        name: this.newItem.name,
        type: this.newItem.type,
        icon: this.newItem.icon,
        releaseDate: this.newItem.releaseDate,
        description: this.newItem.description,
        url: this.newItem.url
      });
      alert('Item Added!');
    }

    this.resetForm();
    this.activeTab = 'manage';
  }

  deleteItem(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure? This will delete the item from the database.')) {
      this.db.deleteItem(id);
    }
  }

  resetItemStats(id: number, event: Event) {
    event.stopPropagation();
    this.db.resetItemStats(id);
  }

  resetWebsiteStatus() {
    this.db.resetSiteStats();
  }

  saveAboutPage() {
    this.db.updateAboutContent(this.aboutEditText);
    alert('About page updated.');
  }
  
  saveGeneralSettings() {
    if (this.serverAdminPass) {
        this.auth.updatePassword(this.serverAdminPass);
    }
    if (this.serverSiteTitle) {
        this.sql.updateConfig({ siteTitle: this.serverSiteTitle }).subscribe();
    }
    alert('Server configuration updated.');
  }

  onFileSelected(event: Event) {
    alert('File selected. In production, this uploads to /material/downloadables/');
  }
}
