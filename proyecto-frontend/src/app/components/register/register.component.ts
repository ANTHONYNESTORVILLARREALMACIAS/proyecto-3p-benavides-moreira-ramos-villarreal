import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = { username: '', password: '', email: '', bornDate: '' };
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  async register() {
    try {
      const response = await this.apiService.register({
        username: this.registerForm.username,
        password: this.registerForm.password,
        email: this.registerForm.email,
        bornDate: this.registerForm.bornDate
      }).toPromise();
      console.log('Register response:', response); // Debug backend response
      if (response.ok && response.token) {
        await this.router.navigate(['/subjects']);
      } else {
        this.errorMessage = response.msg || 'Error en el registro';
        setTimeout(() => (this.errorMessage = ''), 3500);
      }
    } catch (err: any) {
      console.error('Register error:', err);
      this.errorMessage = err.message || 'Error en el registro';
      setTimeout(() => (this.errorMessage = ''), 3500);
    }
  }
}
