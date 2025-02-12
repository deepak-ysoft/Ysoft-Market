import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  submitted = false;
  show = false;

  onLoginForm: FormGroup = new FormGroup({
    email: new FormControl('Admin@gmail.com', [Validators.required]),
    password: new FormControl('Admin@123', [Validators.required]),
  });

  ngOnInit(): void {
    this.submitted = false;
    this.show = false;
  }

  onlogin() {
    this.submitted = true;
    this.authService.loginService(this.onLoginForm.value).subscribe({
      next: (response: any) => {
        if (response.success) {
          debugger;
          this.authService.storeToken(response.token);
          this.onLoginForm.reset();
          this.onLoginForm.markAsPristine();
          this.onLoginForm.markAsUntouched();
          this.submitted = false;

          this.router.navigateByUrl('/index');
        } else {
          Swal.fire({
            title: 'Wrong info! &#128544;',
            text: 'Email or password is wrong :)',
            icon: 'error',
            timer: 2000, // Auto-close after 2 seconds
            timerProgressBar: true,
          });
        }
      },
      error: (err: any) => {
        // Handle validation errors from the server
        if (err.status === 400) {
          const validationErrors = err.error.errors;
          for (const field in validationErrors) {
            const formControl = this.onLoginForm.get(
              field.charAt(0).toLowerCase() + field.slice(1)
            );
            if (formControl) {
              formControl.setErrors({
                serverError: validationErrors[field].join(' '),
              });
            }
          }
        }
      },
    });
  }
  Show() {
    this.show = !this.show;
  }
  // show server side error if client-side not working
  shouldShowError(controlName: string): boolean {
    const control = this.onLoginForm.get(controlName);
    return (control?.invalid && (control.touched || this.submitted)) ?? false;
  }
}
