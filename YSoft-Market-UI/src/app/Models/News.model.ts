export class News {
  id: number = 0;
  type: string = '';
  subType: string = '';
  content: string = '';
  date?: Date;
  comments: string = '';
  imagePath: string = '';
  photo?: File; // Using File for handling file uploads
}
