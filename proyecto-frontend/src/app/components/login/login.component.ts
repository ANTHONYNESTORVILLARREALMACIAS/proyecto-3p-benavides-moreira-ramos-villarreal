import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = { username: '', password: '' };
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  async login() {
    if (!this.loginForm.username || !this.loginForm.password) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      setTimeout(() => (this.errorMessage = ''), 3500);
      return;
    }
    try {
      const response = await this.apiService.login(this.loginForm).toPromise();
      console.log('Login response:', response);
      if (response.ok && response.token) {
        await this.router.navigate(['/subjects']);
      } else {
        this.errorMessage = response.msg || 'Error en el inicio de sesión';
        setTimeout(() => (this.errorMessage = ''), 3500);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      this.errorMessage = err.message || 'Error en el inicio de sesión';
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }
}
