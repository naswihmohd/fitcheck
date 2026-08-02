import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { TodoProject, TodoTask } from '../data/todoTypes';

export interface TodoState {
  projects: TodoProject[];
  loadingProjects: boolean;
  error: string | null;
}

const initialState: TodoState = {
  projects: [],
  loadingProjects: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'todo/fetchProjects',
  async ({ userId }: { userId: string }) => {
    try {
      const q = query(
        collection(db, 'todo_projects'),
        where('createdBy', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const projects: TodoProject[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          tasks: data.tasks || [],
        } as TodoProject);
      });

      // Sort client-side by createdAt desc to avoid composite index requirement
      projects.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      return projects;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
);

export const createProject = createAsyncThunk(
  'todo/createProject',
  async ({ name, userId }: { name: string; userId: string }) => {
    try {
      const projectsRef = collection(db, 'todo_projects');
      const newProjectDoc = doc(projectsRef);
      const projectData = {
        name,
        createdBy: userId,
        createdAt: Timestamp.now(),
        tasks: [],
      };
      await setDoc(newProjectDoc, projectData);
      return {
        id: newProjectDoc.id,
        ...projectData,
      } as TodoProject;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'todo/deleteProject',
  async ({ projectId }: { projectId: string }) => {
    try {
      await deleteDoc(doc(db, 'todo_projects', projectId));
      return projectId;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
);

export const addTask = createAsyncThunk(
  'todo/addTask',
  async ({ projectId, title }: { projectId: string; title: string }) => {
    try {
      const taskId = Math.random().toString(36).substring(2, 9);
      const newTask: TodoTask = {
        id: taskId,
        title,
        completed: false,
        createdAt: Timestamp.now(),
      };

      const projectRef = doc(db, 'todo_projects', projectId);
      await updateDoc(projectRef, {
        tasks: arrayUnion(newTask)
      });

      return { projectId, task: newTask };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
);

export const toggleTask = createAsyncThunk(
  'todo/toggleTask',
  async ({ projectId, taskId, completed }: { projectId: string; taskId: string; completed: boolean }) => {
    try {
      const projectRef = doc(db, 'todo_projects', projectId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        const tasks = (projectData.tasks || []) as TodoTask[];
        const updatedTasks = tasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, completed };
          }
          return task;
        });
        await updateDoc(projectRef, { tasks: updatedTasks });
      }
      return { projectId, taskId, completed };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'todo/deleteTask',
  async ({ projectId, taskId }: { projectId: string; taskId: string }) => {
    try {
      const projectRef = doc(db, 'todo_projects', projectId);
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        const tasks = (projectData.tasks || []) as TodoTask[];
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        await updateDoc(projectRef, { tasks: updatedTasks });
      }
      return { projectId, taskId };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
);

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loadingProjects = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<TodoProject[]>) => {
        state.loadingProjects = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loadingProjects = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })

      // Create Project
      .addCase(createProject.fulfilled, (state, action: PayloadAction<TodoProject>) => {
        state.projects.unshift(action.payload);
      })

      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })

      // Add Task
      .addCase(addTask.fulfilled, (state, action) => {
        const project = state.projects.find((p) => p.id === action.payload.projectId);
        if (project) {
          project.tasks.push(action.payload.task);
        }
      })

      // Toggle Task
      .addCase(toggleTask.fulfilled, (state, action) => {
        const project = state.projects.find((p) => p.id === action.payload.projectId);
        if (project) {
          const task = project.tasks.find((t) => t.id === action.payload.taskId);
          if (task) {
            task.completed = action.payload.completed;
          }
        }
      })

      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        const project = state.projects.find((p) => p.id === action.payload.projectId);
        if (project) {
          project.tasks = project.tasks.filter((t) => t.id !== action.payload.taskId);
        }
      });
  },
});

export default todoSlice.reducer;
