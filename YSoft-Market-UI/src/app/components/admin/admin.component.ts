import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { News } from '../../Models/News.model';
import { environment } from '../../../environments/environment';
import { HomeService } from '../../services/home.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  showOptions = true;
  selectedNewsType = '';
  selectedNews: number[] = [];
  newsList: News[] = [];
  EditNews: News = new News();

  largeNewsList: News[] = [];
  mediumNewsList: News[] = [];
  smallNewsList: News[] = [];
  deletedNews: News[] = [];
  selectedFile: File | null = null;

  private baseUrl = environment.apiURL;
  newsImage: string;
  homeService = inject(HomeService);
  newsForm: FormGroup;
  currentLength: number = 0;
  currentCommentLength: number = 0;

  isEdit = false;
  isDeleted = false;

  constructor(private fb: FormBuilder) {
    this.newsForm = this.fb.group({
      id: [0], // Hidden or auto-generated ID
      type: ['', Validators.required], // Type is required
      subType: ['', Validators.required],
      content: ['', [Validators.required, Validators.minLength(10)]], // Min 10 chars
      date: [new Date(), Validators.required], // Default to today
      comments: [''], // Optional comments
      imagePath: [''], // Image URL (if applicable)
      photo: [null], // File input (handled separately)
    });
    this.newsImage = `${this.baseUrl}` + `uploads/newsImg/`;
  }

  ngOnInit(): void {
    this.isDeleted = false;
    this.showOptions = true;
    this.newsForm.get('content')?.valueChanges.subscribe((value) => {
      this.currentLength = value ? value.length : 0;
    });
    this.newsForm.get('comments')?.valueChanges.subscribe((value) => {
      this.currentCommentLength = value ? value.length : 0;
    });
    const storedNewsType = localStorage.getItem('selectedNewsType');

    if (storedNewsType) {
      this.selectNewsType(storedNewsType);
    }
  }

  GetAllNews() {
    debugger;

    this.homeService.GetAllNews().subscribe((res: any) => {
      this.newsList = res.allNews;
      this.deletedNews = res.allDeletedNews;

      const storedNewsType = localStorage.getItem('selectedNewsType');

      if (storedNewsType) {
        this.selectNewsType(storedNewsType);
      }
    });
  }
  GetDeleted() {
    this.isDeleted = true;
    this.isEdit = false;
    this.newsList = this.deletedNews;
    this.selectNewsType(this.selectedNewsType);
  }

  GetLists(newsType: string) {
    // Store the selected news type in local storage
    localStorage.setItem('selectedNewsType', newsType);
    this.GetAllNews();
    this.showOptions = false;
  }
  // Function to handle selection
  selectNewsType(newsType: string) {
    this.selectedNewsType = newsType;

    // Filter news based on selected type and subType
    this.largeNewsList = this.newsList
      .filter((n) => n.type === newsType && n.subType === 'Large')
      .sort((a, b) => b.id - a.id); // Sorting by ID in descending order

    if (newsType === 'Featured News') {
      this.mediumNewsList = this.newsList
        .filter((n) => n.type === newsType && n.subType === 'Medium')
        .sort((a, b) => b.id - a.id); // Sorting by ID in descending order
    }

    this.smallNewsList = this.newsList
      .filter((n) => n.type === newsType && n.subType === 'Small')
      .sort((a, b) => b.id - a.id); // Sorting by ID in descending order
  }

  scrollToTopAndEdit(news: News) {
    this.EditNews = news;
    this.isEdit = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.newsForm.patchValue({
      id: news.id,
      type: news.type,
      subType: news.subType,
      content: news.content,
      date: news.date,
      comments: news.comments,
      photo: null,
    });
  }

  toggleForm() {
    this.isEdit = false;
    this.newsForm.reset(); // Reset form
    this.newsForm.markAsPristine();
    this.newsForm.markAsUntouched();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.newsForm.patchValue({ photo: file });
    }
  }

  submitForm() {
    if (this.newsForm.valid) {
      const formData = new FormData();
      if (this.newsForm.get('id')?.value == null) {
        formData.append('id', 0 || '0');
      } else {
        formData.append('id', this.newsForm.get('id')?.value || '0');
      }
      formData.append('type', this.newsForm.get('type')?.value || '');
      formData.append('subType', this.newsForm.get('subType')?.value || '');
      formData.append('content', this.newsForm.get('content')?.value || '');
      formData.append('date', this.newsForm.get('date')?.value || '');
      formData.append('comments', this.newsForm.get('comments')?.value || '');
      formData.append('photo', this.selectedFile || '');

      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
      this.homeService.AddUpdateNews(formData).subscribe({
        next: (res: any) => {
          if (
            res.success &&
            res.message == 'News added/updated successfully.'
          ) {
            this.isEdit = false;
            this.isDeleted = false;
            this.GetAllNews();
            debugger;

            this.newsForm.reset(); // Reset form
            this.newsForm.markAsPristine();
            this.newsForm.markAsUntouched();
          } else if (!res.success) {
            Swal.fire({
              text: res.message,
              icon: 'error',
              timer: 5000, // Auto-close after 2 seconds
              timerProgressBar: true,
            });
          }
        },
        error: (err: any) => {
          // Handle validation errors from the server
          if (err.status === 400) {
            const validationErrors = err.error.errors;
            for (const field in validationErrors) {
              const formControl = this.newsForm.get(
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
  }

  deleteNews() {
    this.homeService.DeleteNews(this.EditNews.id).subscribe((res: any) => {
      if (res.success) {
        this.GetAllNews();
        this.isEdit = false;
      } else {
        Swal.fire({
          text: res.message,
          icon: 'error',
          timer: 3000, // Auto-close after 2 seconds
          timerProgressBar: true,
        });
      }
    });
  }

  updateCharacterCount() {
    this.currentLength = this.newsForm.get('content')?.value?.length || 0;
  }

  updateCharacterCommentCount() {
    this.currentCommentLength =
      this.newsForm.get('comments')?.value?.length || 0;
  }

  backToList() {
    this.isDeleted = false;
    this.isEdit = false;
    this.GetAllNews();
  }

  // Function to go back to options
  goBackOptions() {
    this.newsForm.reset(); // Reset form
    this.newsForm.markAsPristine();
    this.newsForm.markAsUntouched();
    this.showOptions = true;
    this.isEdit = false;
    this.isDeleted = false;
    this.selectedNewsType = '';
  }

  toggleSelection(newsId: number) {
    this.homeService.UpdateSelected(newsId).subscribe({
      next: (res: any) => {
        if (res.success) {
          console.log('Update Selected message', res.message);
        } else {
          Swal.fire({
            text: res.message,
            icon: 'error',
            timer: 5000,
            timerProgressBar: true,
          });
        }
      },
      error: (error) => console.error('Update API Error:', error),
    });
  }
}
