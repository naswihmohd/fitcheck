import { createSlice } from "@reduxjs/toolkit";
import type { UserProps } from "../data/userTypes";

interface AuthState {
    user: UserProps | null;
}

const initialState: AuthState = {
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
});

export default userSlice.reducer;
export const { setUser, clearUser } = userSlice.actions;
