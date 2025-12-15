import { createSlice } from "@reduxjs/toolkit"

const waitingSlice = createSlice({
    name: "waiting",
    initialState: {
        waiting1:null,
        waiting2:null,
    },

    reducers: {
        saveToWaiting: (state, action) => {
            const {waiting, cart, client} = action.payload
            state[waiting] ={
             cart,
             client: client || null,   
            } 
        },
        clearWaiting: (state, action) =>  {
            const {waiting} = action.payload
             state[waiting] = null
        }
    }

}) 

export const {saveToWaiting, clearWaiting} = waitingSlice.actions
export default waitingSlice.reducer