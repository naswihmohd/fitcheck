import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProps } from "../../superAdminBranches/data/userTypes";
import type { BranchProps, TargetProps } from "../../superAdminBranches/data/branchTypes";

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
        setTarget: (state, action: PayloadAction<{ year: string, target: TargetProps }>) => {
            if (!state.branchData) {
                console.warn("Cannot set target: branchData is null");
                return;
            }
            const { year, target } = action.payload;

            // Ensure branchData exists and initialize targets if needed
            if (!state.branchData.targets) {
                state.branchData.targets = {};
            }

            // Update the target for the given year
            // Use the target as-is since it's already a complete TargetProps
            state.branchData.targets[year] = {
                ...target,
                branchId: state.branchData.id,
                id: year,
            };
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
    setTarget,
} = userSlice.actions;