export type Job = {
  id: string;
  title: string;
  company: string;
  category?: string;
  location: string;
  remote: boolean;
  experience: string;
  salary?: string;
  url: string;
  source: string;
  publishedAt?: string;
  deadline?: string;
  skills: string[];
  description?: string;
};
