export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'society';
  password?: string;
};

export type Category = 'Music' | 'Tech' | 'Art' | 'Sports' | 'Workshop' | 'Social' | 'Conference' | 'Party';

export type Event = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  date: string;
  time: string;
  location: string;
  club: string;
  category: Category;
  participants: number;
  isTrending?: boolean;
};
