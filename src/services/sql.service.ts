import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DownloadItem, SiteStats } from './db.service';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

interface ServerConfig {
  adminPass: string;
  siteTitle: string;
  aboutContent?: string;
}

interface ServerSchema {
  items: DownloadItem[];
  stats: SiteStats;
  config: ServerConfig;
  aboutContent: string;
}

interface GetAllResponse {
  items?: DownloadItem[];
  stats?: SiteStats;
  config?: ServerConfig;
}

@Injectable({
  providedIn: 'root'
})
export class SqlService {
  private http: HttpClient = inject(HttpClient);
  
  // URL to the PHP backend script
  private readonly API_URL = '/api.php'; 
  
  // Direct paths to the Flat Files (Read-Only access for Frontend)
  private readonly FILE_PATHS = {
    items: '/material/items.txt',
    stats: '/material/stats.txt',
    config: '/material/config.txt'
  };

  constructor() {}

  // --- Core Data Fetching ---

  getAllData(): Observable<ServerSchema> {
    // Strategy:
    // 1. Try to read the Flat Files directly. This proves data is server-side.
    // 2. If files are missing (404), call PHP API to seed/create them.
    
    return forkJoin({
      items: this.http.get<DownloadItem[]>(this.FILE_PATHS.items).pipe(catchError(() => of(null))),
      stats: this.http.get<SiteStats>(this.FILE_PATHS.stats).pipe(catchError(() => of(null))),
      config: this.http.get<ServerConfig>(this.FILE_PATHS.config).pipe(catchError(() => of(null)))
    }).pipe(
      switchMap(results => {
        // If any file is missing, we need to initialize via PHP
        if (!results.items || !results.stats || !results.config) {
          console.log('Flat files missing, calling Server API to seed defaults...');
          return this.fetchFromApi();
        }

        // Return data read directly from text files
        return of({
          items: results.items,
          stats: results.stats,
          config: {
            adminPass: results.config.adminPass,
            siteTitle: results.config.siteTitle
          },
          aboutContent: results.config.aboutContent || ''
        } as ServerSchema);
      })
    );
  }

  private fetchFromApi(): Observable<ServerSchema> {
    return this.http.get<GetAllResponse>(`${this.API_URL}?action=get_all`).pipe(
      map((response: any) => ({
        items: response.items || [],
        stats: response.stats || { visitors: 0, totalDownloads: 0 },
        config: {
          adminPass: response.config?.adminPass || '',
          siteTitle: response.config?.siteTitle || 'Osama Flash'
        },
        aboutContent: response.config?.aboutContent || ''
      }))
    );
  }

  // --- Action Methods (Write to Server) ---

  insertItem(item: DownloadItem): Observable<any> {
    return this.http.post(`${this.API_URL}?action=add_item`, item);
  }

  updateItem(item: Partial<DownloadItem>): Observable<any> {
    return this.http.post(`${this.API_URL}?action=update_item`, item);
  }

  deleteItem(id: number): Observable<any> {
     return this.http.post(`${this.API_URL}?action=delete_item`, { id });
  }

  incrementDownload(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}?action=increment_download`, { id });
  }

  incrementVisitor(): Observable<any> {
    return this.http.post(`${this.API_URL}?action=increment_visitor`, {});
  }

  verifyAdmin(password: string): Observable<boolean> {
    return this.http.post<{success: boolean}>(`${this.API_URL}?action=login`, { password }).pipe(
      map((res: any) => res.success),
      catchError(() => of(false))
    );
  }

  updateConfig(config: Partial<ServerConfig> | { aboutContent: string }): Observable<any> {
    return this.http.post(`${this.API_URL}?action=update_config`, config);
  }
}