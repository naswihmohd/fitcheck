import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import type { RootState } from '../../../general/redux/store';
import type { BlogProps } from '../data/blogTypes';

const COLLECTION_NAME = 'blogs';
const LIMIT_NUMBER = 10;

export interface BlogsState {
    blogs: BlogProps[];
    lastVisible: any | null;
    hasMore: boolean;
    currentFilter?: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: BlogsState = {
    blogs: [],
    lastVisible: null,
    hasMore: true,
    currentFilter: null,
    loading: false,
    error: null,
};

export const fetchBlogs = createAsyncThunk(
    'blogs/fetchBlogs',
    async ({ searchQuery }: { searchQuery: string | null }, { getState }) => {
        const filterAndQueryTerm = searchQuery || null;

        try {
            const state = getState() as RootState;
            const blogsData = state.blogs;

            // Reset pagination if search query changed
            const shouldReset = blogsData.currentFilter !== filterAndQueryTerm;
            const lastVisible = shouldReset ? null : blogsData.lastVisible;

            const blogsCollectionRef = collection(db, COLLECTION_NAME);

            const blogsQuery = query(
                blogsCollectionRef,
                ...(searchQuery ? [where("keywords", "array-contains", searchQuery.toLowerCase())] : []),
                orderBy("order", "asc"),
                ...(lastVisible ? [startAfter(lastVisible)] : []),
                limit(LIMIT_NUMBER)
            );

            const querySnapshot = await getDocs(blogsQuery);
            const newBlogs: BlogProps[] = querySnapshot.docs.map(d => {
                const data = d.data();
                return {
                    ...data,
                    id: d.id,
                    order: typeof data.order === 'number' ? data.order : 0,
                } as BlogProps;
            });

            return {
                blogs: newBlogs,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
                hasMore: newBlogs.length === LIMIT_NUMBER,
                filterAndQueryTerm,
                shouldReset,
            };

        } catch (error) {
            throw new Error('Failed to fetch blogs: ' + (error as Error).message);
        }
    }
);

export const persistBlogOrder = createAsyncThunk(
    'blogs/persistBlogOrder',
    async (blogs: BlogProps[], { rejectWithValue }) => {
        try {
            const batch = writeBatch(db);
            blogs.forEach((blog, index) => {
                const ref = doc(db, COLLECTION_NAME, blog.id);
                batch.update(ref, { order: index });
            });
            await batch.commit();
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const blogSlice = createSlice({
    name: 'blogs',
    initialState,
    reducers: {
        clearBlogs: state => {
            state.blogs = [];
            state.lastVisible = null;
            state.hasMore = true;
            state.currentFilter = null;
            state.loading = false;
            state.error = null;
        },
        addBlog: (state, action) => {
            const blog = action.payload;
            const exists = state.blogs.some(b => b.id === blog.id);
            if (!exists) {
                state.blogs.push(blog);
                state.blogs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            }
        },
        updateBlog: (state, action) => {
            const blog = action.payload;
            const index = state.blogs.findIndex(b => b.id === blog.id);
            if (index !== -1) {
                state.blogs[index] = {
                    ...state.blogs[index],
                    ...blog,
                };
            }
        },
        removeBlog: (state, action) => {
            const blogId = action.payload;
            state.blogs = state.blogs.filter(b => b.id !== blogId);
        },
        reorderBlogs: (state, action: PayloadAction<BlogProps[]>) => {
            state.blogs = action.payload.map((b, i) => ({ ...b, order: i }));
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchBlogs.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.loading = false;
                const { blogs, lastVisible, hasMore, filterAndQueryTerm, shouldReset } = action.payload;

                if (shouldReset) {
                    state.blogs = [];
                    state.lastVisible = null;
                }

                const uniqueBlogs = blogs.filter(
                    newBlog => !state.blogs.some(blog => blog.id === newBlog.id)
                );
                state.blogs = [...state.blogs, ...uniqueBlogs];

                state.lastVisible = lastVisible;
                state.hasMore = hasMore;
                state.currentFilter = filterAndQueryTerm;
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch blogs';
            })
    },
});

export const { clearBlogs, addBlog, updateBlog, removeBlog, reorderBlogs } = blogSlice.actions;
export default blogSlice.reducer;
