import { createSlice } from "@reduxjs/toolkit";
import type { UserProps } from "../data/userTypes";
import type { CompanyProps } from "../data/companyTypes";

interface AuthState {
    user: UserProps | null;
    companyData: CompanyProps | null;
    companyId: string | null;
    branchId: string | null;
}


const initialState: AuthState = {
    user: null,
    companyData: null,
    companyId: null,
    branchId: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setCompanyData: (state, action) => {
            state.companyData = action.payload;
        },
        setBranchId: (state, action) => {
            state.branchId = action.payload;
        },
        setCompanyId: (state, action) => {
            state.companyId = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
            state.companyData = null;
            state.companyId = null;
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
    setCompanyData,
    setCompanyId,
} = userSlice.actions;