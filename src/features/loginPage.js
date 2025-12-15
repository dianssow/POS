import { createSlice } from "@reduxjs/toolkit"

    const storedUser = localStorage.getItem("pos-user")
    const storedToken = localStorage.getItem("pos-token")
    const initialState = {
        user: storedUser ? JSON.parse(storedUser) : null ,
        token: storedToken || null
    }
    



const loginPageSlice = createSlice ({
    name:"loginPage",
    initialState,

    reducers: {
        login: (state, action) => {
            const {userData, token } =action.payload
            state.user = userData
            state.token = token

            localStorage.setItem("pos-user", JSON.stringify(userData))
            localStorage.setItem("pos-token", token)
        },
        logout: (state) => {
            state.user = null
            state.token = null

            localStorage.removeItem("pos-user")
            localStorage.removeItem("pos-token")
        }
    }
})

export const {login, logout} = loginPageSlice.actions
export default loginPageSlice.reducer