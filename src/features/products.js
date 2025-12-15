import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    items: undefined
}

export const products = createSlice({
    name: "products",
    initialState, 
    reducers:  {
        addProducts: (state, action) => {
            state.items = action.payload
        } 
    }   
})

export const {addProducts} = products.actions
export default products.reducer