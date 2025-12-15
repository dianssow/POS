

import api from "../api"
import { localDB } from "./localDB"

export async function getCustomers() {
    if (navigator.onLine) {
        try {
            const response = await api.get("/api/customer") 
            
            const apiCustomers = response.data.customers 
            
        
            await localDB.customers.clear()
            await localDB.customers.bulkPut(apiCustomers)

            console.log("DataService Clients chargés depuis l'API.")
            return apiCustomers

        } catch (error) {
            console.warn("API Clients échouée ou hors ligne. Lecture du cache local...")
        }
    }

    //  Fallback / Lecture Hors Ligne 
    try {
        const localCustomers = await localDB.customers.toArray()
        console.log(`DataService -- Clients chargés depuis localDB (${localCustomers.length}).`)
        return localCustomers
    } catch (dbError) {
        console.error(" Impossible de lire localDB.customers:", dbError)
        return []
    }
}


export async function getProducts() {
    if (navigator.onLine) {
        try {
            const response = await api.get("/api/product") 

            const apiProducts =  response.data.products 
            
            await localDB.products.clear()
            await localDB.products.bulkPut(apiProducts)

            console.log("DataService (Produits chargés depuis l'API.)")
            return apiProducts

        } catch (error) {
            console.warn("API Produits échouée ou hors ligne. Lecture du cache local...")
        }
    }

    // 2. Fallback / Lecture Hors Ligne
    try {
        const localProducts = await localDB.products.toArray()
        console.log(`DataService (Produits chargés depuis localDB) (${localProducts.length}).`)
        return localProducts
    } catch (dbError) {
        console.error(" Impossible de lire localDB.products:", dbError)
        return []
    }
}

export async function getCategories() {
    if (navigator.onLine) {
        try {
            const response = await api.get("/api/category") 
            const apiCategories = response.data.categories
            
            // Mise à jour du cache local
       
            await localDB.categories.clear() 
            await localDB.categories.bulkPut(apiCategories)

            console.log("[DataService] Catégories chargées depuis l'API.")
            return apiCategories

        } catch (error) {
            console.warn("API Catégories échouée ou hors ligne. Lecture du cache local...")
        }
    }

    // Fallback / Lecture Hors Ligne
    try {
        const localCategories = await localDB.categories.toArray()
        console.log(`[DataService] Catégories chargées depuis localDB (${localCategories.length}).`)
        return localCategories
    } catch (dbError) {
        console.error(" Impossible de lire localDB.categories:", dbError)
        return []
    }
}

