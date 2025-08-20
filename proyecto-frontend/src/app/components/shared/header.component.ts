import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username: string | null = null;
  private authSubscription: Subscription | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.authSubscription = this.apiService.getAuthState().subscribe(({ isLoggedIn, username }) => {
      this.isLoggedIn = isLoggedIn;
      this.username = username;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async logout() {
    try {
      await this.apiService.logout().toPromise();
      await this.router.navigate(['/login']);
    } catch (err: any) {
      console.error('Logout error:', err);
      await this.router.navigate(['/login']);
    }
  }
}
