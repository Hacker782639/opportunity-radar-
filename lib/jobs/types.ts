export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  experience: string;
  salary?: string;
  url: string;
  source: string;
  publishedAt?: string;
  skills: string[];
};
