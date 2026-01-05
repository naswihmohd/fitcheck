import { createSlice } from "@reduxjs/toolkit";
import type { UserProps } from "../data/userTypes";
import type { BranchProps } from "../../superAdmin/addBranch/data/branchTypes";

interface AuthState {
    user: UserProps | null;
    branchData: BranchProps | null;
    branchId: string | null;
}


const initialState: AuthState = {
    user: null,
    branchData: null,
    branchId: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setBranchData: (state, action) => {
            state.branchData = action.payload;
        },
        setBranchId: (state, action) => {
            state.branchId = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
            state.branchData = null;
            state.branchId = null;
        },
    },
    // extraReducers: (builder) => {
    //   builder
    //     .addCase(googleSignIn.fulfilled, (state, action: PayloadAction<string>) => {
    //       state.userId = action.payload;
    //     });
    // },
});



export default userSlice.reducer;
export const {
    setUser,
    clearUser,
    setBranchId,
    setBranchData,
} = userSlice.actions;