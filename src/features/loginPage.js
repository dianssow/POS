import { createSlice } from "@reduxjs/toolkit"



     function safeJSONParse(value) {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    localStorage.removeItem("pos-user")
    return null
  }
}    
    const storedUser = safeJSONParse(localStorage.getItem("pos-user"))
    const storedToken = localStorage.getItem("pos-token")
    const initialState = {
        user: storedUser,
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