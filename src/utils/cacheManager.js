

import { localDB } from "./localDB"
import api from "../api"
import { getCategories, getCustomers, getProducts,getSales, getVersements } from "./dataService"


export async function initialDataCaching() {
    try {
        const lasSync = localStorage.getItem('pos-last-sync')
        const today = new Date().toISOString().slice(0,10)

        if(lasSync === today){
            console.log("Initial Cache deja fait aujourdhui");
            return
            
        }
        console.log("Mise en cache des données...")
            
        await Promise.all([
            getProducts(),
            getCategories(),
            getCustomers(),
            getSales(),
            getVersements()
        ])
        const shiftsRes = await api.get('/api/cash/shifts?status=OPEN') 
        // await localDB.shifts.clear()

        if (Array.isArray(shiftsRes.data) && shiftsRes.data.length > 0) {
            await localDB.shifts.bulkPut(shiftsRes.data)
            console.log("Mise en cache réussie. Données disponibles hors ligne.")
        }

        console.log("Mise en cache Complet reussi");

        
        

      localStorage.setItem('pos-last-sync', today)
    } catch (error) {
        console.error("Erreur lors de la mise en cache initiale:", error)
    }
}

