const initialState = {
    history: [],
    clients:[]
}

const saleReducer = (state = initialState, action) => {
    switch(action.type) {
        case "sale/addSale":
            const sale= action.payload
            const selectedClient = sale.selectedClient || "-"
            return {
                ...state,
                history: [...state.history, sale],
                clients: {
                    ...state.clients,
                    [selectedClient]: [...(state.clients[selectedClient || "-"] || []), sale]
                }
            }
            default: 
            return state
    }
} 

export const addSale = (sale) => ({
    type: "sale/addSale",
    payload: sale,
})

export default saleReducer;