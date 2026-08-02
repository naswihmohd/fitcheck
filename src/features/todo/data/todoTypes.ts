import { Timestamp } from 'firebase/firestore';

export interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Timestamp;
}

export interface TodoProject {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
  createdBy: string; // Auth User ID
  tasks: TodoTask[];
}
