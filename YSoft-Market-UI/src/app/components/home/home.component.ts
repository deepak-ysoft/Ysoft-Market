import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  SlickCarouselComponent,
  SlickCarouselModule,
} from 'ngx-slick-carousel';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { HomeService } from '../../services/home.service';
import { News } from '../../Models/News.model';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  imports: [DatePipe, CommonModule, ReactiveFormsModule, SlickCarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('formAnimation', [
      state('hidden', style({ opacity: 0, height: '0px', overflow: 'hidden' })), // Hidden form
      state('visible', style({ opacity: 1, height: '*' })), // Visible form
      transition('hidden <=> visible', [animate('400ms ease-in-out')]),
    ]),
    trigger('sectionMove', [
      state('up', style({ transform: 'translateY(0)' })), // Normal position
      state('down', style({ transform: 'translateY(0)' })), // Move down
      transition('up <=> down', [animate('400ms ease-in-out')]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  private baseUrl = environment.apiURL;
  newsImage: string;
  homeService = inject(HomeService);
  AuthService = inject(AuthService);
  FeaturedNewsLargeList: News[] = [];
  FeaturedNewsMediumList: News[] = [];
  FeaturedNewsSmallList: News[] = [];
  LatestNewsLargeList: News[] = [];
  LatestNewsSmallList: News[] = [];
  PopularNewsLargeList: News[] = [];
  PopularNewsSmallList: News[] = [];
  EditNews: News = new News();
  router = inject(Router);
  isLoggedIn = false;
  showForm = false;
  isShowDelete = false;

  newsForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder
  ) {
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
    this.isShowDelete = false;
    this.isLoggedIn = this.AuthService.isLoggedIn();
    this.GetAllNews();
  }

  scrollToTopAndEdit(news: News) {
    this.isShowDelete = true;
    this.EditNews = news;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.isLoggedIn) {
      this.showForm = true;
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
  }

  deleteNews() {
    this.homeService.DeleteNews(this.EditNews.id).subscribe((res: any) => {
      if (res.success) {
        this.GetAllNews();
        this.showForm = false; // Hide form after submission
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

  toggleForm() {
    this.showForm = !this.showForm;
  }

  GetAllNews() {
    this.homeService.GetAllNews().subscribe((res: any) => {
      debugger;
      this.FeaturedNewsLargeList = res.featuredNewsLarge;
      this.FeaturedNewsMediumList = res.featuredNewsMedium;
      this.FeaturedNewsSmallList = res.featuredNewsSmall;
      this.LatestNewsLargeList = res.latestNewsLarge;
      this.LatestNewsSmallList = res.latestNewsSmall;
      this.PopularNewsLargeList = res.popularNewsLarge;
      this.PopularNewsSmallList = res.popularNewsSmall;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.newsForm.patchValue({ photo: file });
    }
  }

  submitForm() {
    if (this.newsForm.valid && this.isLoggedIn) {
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
            this.isShowDelete = false;
            this.GetAllNews();
            this.showForm = false; // Hide form after submission
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

  logos = [
    { src: 'assets/icons/logo1.svg', alt: 'logo1' },
    { src: 'assets/icons/logo2.svg', alt: 'logo2' },
    { src: 'assets/icons/logo3.svg', alt: 'logo3' },
    { src: 'assets/icons/logo4.svg', alt: 'logo4' },
    { src: 'assets/icons/logo5.svg', alt: 'logo5' },
    { src: 'assets/icons/logo6.svg', alt: 'logo6' },
    { src: 'assets/icons/logo7.svg', alt: 'logo7' },
  ];

  slideConfig = {
    slidesToShow: 5, // Number of logos visible at a time
    slidesToScroll: 1, // How many to scroll at a time
    autoplay: true, // Enable auto-sliding
    autoplaySpeed: 0, // Remove delays between slides
    speed: 6000, // Control smoothness of scrolling
    infinite: true, // Infinite loop
    cssEase: 'linear', // Continuous linear movement
    arrows: false, // Hide navigation arrows
    dots: false, // Hide navigation dots
    pauseOnHover: false, // Prevent pausing when hovered
  };
  // Safely access localStorage only in the browser
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  logOut() {
    if (this.isBrowser()) {
      localStorage.removeItem('authToken');
      localStorage.clear();
      this.isLoggedIn = this.AuthService.isLoggedIn();
    }
  }
}
