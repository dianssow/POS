import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    items: [],
    selected: null,
    enteredQuantityForPrice: "",
    enteredQuantityForQuantity: "",
    enteredBuffer: "",
    isReturnMode: false,
    isWholesaleMode: false,
    enteredGivenAmount:"",
    enteredPaymentBuffer: "",
    
} 

export const cartSlice = createSlice({
    name: "cart",
    initialState, 
    reducers:  {
        addToCart: (state, action) => {
            const item = action.payload
            const id =item.id 
            const existing = state.items.find(el => el.id === id)
            let unit = "piece"
            if(state.isWholesaleMode || item.price === item.wholesalePrice){
                unit = "carton"
            }
            const price = state.isReturnMode ? -Math.abs(item.price) : item.price

            if(!existing){
            state.items.push({
                ...item,
                 id:id,
                price: price,
                unit: unit,
                quantity: item.quantity ?? 1
                }) 
            }
            else {
                existing.quantity += item.quantity ?? 1

                if(item.price !== undefined && item.price !== existing.price) {
                    existing.price = price
                    existing.unit = unit
                }
            }
            state.isReturnMode = false
            state.isWholesaleMode = false
            
        },
        setEnteredBuffer: (state, action) => {
             state.enteredBuffer = action.payload
        },
        setEnteredQuantityForPrice: (state, action) => {
            state.enteredQuantityForPrice = action.payload
       },
        setEnteredQuantityForQuantity: (state, action) => {
            state.enteredQuantityForQuantity = action.payload
       },
       setEnteredGivenAmount: (state, action) => {
        state.enteredGivenAmount = action.payload
       },
        setEnteredPaymentBuffer: (state, action) => {
        state.enteredPaymentBuffer = action.payload
       },
        
        updateQuantity: (state,action) => {
            const {id, quantity} = action.payload
            const item = state.items.find(el => el.id === id)
            if(item) { item.quantity = quantity
                if(state.selected?.id === id) {
                    state.selected = {...item} 
                }
            }
        },    
        setSelected :  (state, action) => {
            state.selected = action.payload
        },
        clearCart(state) {
            state.items = []
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload)
            if(state.selected && state.selected.id === action.payload) {
                state.selected = null
            }

        },
        toggleReturnMode: (state) => {
        state.isReturnMode = !state.isReturnMode;
        },
        toggleWholesaleMode: (state) => {
        state.isWholesaleMode = !state.isWholesaleMode;
}
        
    }
})





export const {addToCart,updateQuantity,setSelected, clearCart, removeFromCart,setEnteredQuantityForQuantity,setEnteredQuantityForPrice, setEnteredBuffer,setEnteredGivenAmount, toggleReturnMode, toggleWholesaleMode,  setEnteredPaymentBuffer} = cartSlice.actions
export default cartSlice.reducer