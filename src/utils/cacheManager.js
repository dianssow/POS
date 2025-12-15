

import { localDB } from "../localDB"
import api from "../api"


export async function initialDataCaching() {
    try {
        console.log("Mise en cache des données de référence...")

        //  Mise en cache des produits cients session
        const productsRes = await api.get('/api/product/all')
        await localDB.products.clear() 
        await localDB.products.bulkPut(productsRes.data)
        
        
        const customersRes = await api.get('/api/customer/all')
        await localDB.customers.clear()
        await localDB.customers.bulkPut(customersRes.data)
        
        const shiftsRes = await api.get('/api/cash/shifts?status=OPEN') 
        await localDB.shifts.clear()
        if (shiftsRes.data && shiftsRes.data.length > 0) {
            await localDB.shifts.bulkPut(shiftsRes.data)
        }

        console.log("Mise en cache réussie. Données disponibles hors ligne.")

    } catch (error) {
        console.error("Erreur lors de la mise en cache initiale:", error)
    }
}