import {configureStore} from  "@reduxjs/toolkit"
import products from "./features/products"
import cartReducer from "./features/cart"
import loginPageReducer from "./features/loginPage"
import saleReducer from "./features/sale"
import waitingReducer from "./features/waitingButton"

export const store = configureStore({
    reducer: {
        products,
        cart: cartReducer,
        loginPage: loginPageReducer,
        sale: saleReducer,
        waiting: waitingReducer,

    },
})