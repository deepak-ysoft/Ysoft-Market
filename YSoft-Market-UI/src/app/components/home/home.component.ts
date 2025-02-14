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
  imports: [
    RouterLink,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    SlickCarouselModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('zoomInAnimation', [
      state('hidden', style({ transform: 'scale(0)', opacity: 0 })), // Initially hidden
      state('visible', style({ transform: 'scale(1)', opacity: 1 })), // Fully visible
      transition('hidden => visible', [
        animate('800ms ease-in-out'), // Animation duration
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  private baseUrl = environment.apiURL;
  homeService = inject(HomeService);
  FeaturedNewsLargeList: News[] = [];
  FeaturedNewsMediumList: News[] = [];
  FeaturedNewsSmallList: News[] = [];
  LatestNewsLargeList: News[] = [];
  LatestNewsSmallList: News[] = [];
  PopularNewsLargeList: News[] = [];
  PopularNewsSmallList: News[] = [];
  SliderList: News[] = [];
  SliderType = '';
  router = inject(Router);
  animationState = 'hidden'; // Initial state
  isShowSlider = false;
  newsImage: string;
  ngOnInit(): void {
    this.GetAllNews();

    // Trigger the animation after a delay
    setTimeout(() => {
      this.animationState = 'visible';
    }, 200); // Delay to start animation after component loads
  }
  constructor() {
    this.newsImage = `${this.baseUrl}` + `uploads/newsImg/`;
  }
  GetAllNews() {
    debugger;
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
    // Trigger the animation after a delay
    setTimeout(() => {
      this.animationState = 'visible';
    }, 200); // Delay to start animation after component loads
  }

  get filteredFeaturedNewsLargeList() {
    return this.FeaturedNewsLargeList.filter((n) => n.show);
  }
  get filteredFeaturedNewsMediumList() {
    return this.FeaturedNewsMediumList.filter((n) => n.show);
  }
  get filteredFeaturedNewsSmallList() {
    return this.FeaturedNewsSmallList.filter((n) => n.show);
  }
  get filteredLatestNewsLargeList() {
    return this.LatestNewsLargeList.filter((n) => n.show);
  }
  get filteredPopularNewsLargeList() {
    return this.PopularNewsLargeList.filter((n) => n.show);
  }

  clickToSlideMainNews(newsType: string, subType: string) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.isShowSlider = true;
    this.SliderType = newsType;
    if (newsType == 'Featured News' && subType == 'Large') {
      this.SliderList = this.FeaturedNewsLargeList;
    }
    if (newsType == 'Featured News' && subType == 'Medium') {
      this.SliderList = this.FeaturedNewsMediumList;
    }
    if (newsType == 'Featured News' && subType == 'Small') {
      this.SliderList = this.FeaturedNewsSmallList;
    }
    if (newsType == 'Latest News' && subType == 'Large') {
      this.SliderList = this.LatestNewsLargeList;
    }
    if (newsType == 'Latest News' && subType == 'Small') {
      this.SliderList = this.LatestNewsSmallList;
    }
    if (newsType == 'Popular News' && subType == 'Large') {
      this.SliderList = this.PopularNewsLargeList;
    }
    if (newsType == 'Popular News' && subType == 'Small') {
      this.SliderList = this.PopularNewsSmallList;
    }

    this.animationState = 'hidden';
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

  // slideConfigSlide = {
  //   slidesToShow: 4, // Number of logos visible at a time
  //   autoplay: true, // Enable auto-sliding
  //   autoplaySpeed: 0, // Remove delays between slides
  //   speed: 5000, // Control smoothness of scrolling
  //   infinite: true, // Infinite loop
  //   cssEase: 'linear', // Continuous linear movement
  //   arrows: false, // Hide navigation arrows
  //   dots: false, // Hide navigation dots
  //   pauseOnHover: false, // Prevent pausing when hovered
  // };

  slideConfigSlide = {
    slidesToShow: 1,
    speed: 500, // Adjust speed for manual navigation
    infinite: true,
    cssEase: 'linear',
    arrows: false, // We will use custom buttons
    dots: false,
    pauseOnHover: false,
  };

  GoBack() {
    this.isShowSlider = false;
    this.GetAllNews();
  }
}
