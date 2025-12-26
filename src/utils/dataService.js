

import api from "../api"
import { localDB } from "./localDB"


async function urlToBase64(url) {
    try {
        
        const fullUrl = url.startsWith('http') 
            ? url 
            : `${import.meta.env.VITE_API_URL}/${url}`
        
        const response = await fetch(fullUrl)
        const blob = await response.blob()
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error(`Erreur conversion image ${url}:`, error)
        return null
    }
}

export async function getCustomers() {
    if (navigator.onLine) {
        try {
            const response = await api.get("/api/customer") 
            
            const apiCustomers = response.data.customers 
            
            if(Array.isArray(apiCustomers) && apiCustomers.length > 0){

                await localDB.customers.bulkPut(apiCustomers)
                console.log("DataService Clients chargés depuis l'API.")
            }

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



export async function getSales() {

  
  if (navigator.onLine) {
    try {
      const response = await api.get("/api/sale?shiftStatus=OPEN&limit=200")
      const salesData = response.data.sales || []

      if (Array.isArray(salesData)) {
        for (const sale of salesData) {
          await localDB.sales.put({
            ...sale,
            synced: true
          })
        }
      }

      console.log("Ventes API synchronisées")

    } catch (error) {
      console.warn("API ventes indisponible, fallback local")
    }
  }

  
  try {
    const localSales = await localDB.sales
      .orderBy("createdAt")
      .reverse()
      .toArray()

    console.log(`Ventes locales chargées (${localSales.length})`)
    return localSales

  } catch (error) {
    console.error("Erreur lecture localDB.sales", error)
    return []
  }
}

export async function getVersements() {
    if(navigator.onLine){
        try {
             const response = await api.get("/api/versement?limit=50")
             const apiVersements = response.data.versements
             if(Array.isArray(apiVersements) && apiVersements.length > 0){
                await localDB.versements.bulkPut(apiVersements)
                console.log(`DataService-- Versements chargés depuis l'api`);
                
             }
        } catch (error) {
            console.warn("API versements indisponible, fallback local")
            
            
        }
}
    try {
        const localVersements = await localDB.versements.toArray()
        console.log(`DataService -- Clients chargés depuis localDB (${localVersements.length}).`)
        return localVersements
    } catch (dbError) {
        console.error("Impossible de lire localDB.customers:", dbError)
        return []
    }

    
}


export async function getProducts() {
    if (navigator.onLine) {
        try {
            const response = await api.get("/api/product") 
            const apiProducts = response.data.products 
            
            if(Array.isArray(apiProducts) && apiProducts.length > 0){
                console.log("Conversion des images en Base64...")
                
                // Télécharger et convertir les images en Base64
                const productsWithImages = await Promise.all(
                    apiProducts.map(async (product) => {
                        if (product.image && !product.image.startsWith('data:')) {
                            const base64Image = await urlToBase64(product.image)
                            return {
                                ...product,
                                image: base64Image || product.image,
                                imageOriginalUrl: product.image
                            }
                        }
                        return product
                    })
                )
                
                await localDB.products.bulkPut(productsWithImages)
                console.log("DataService Produits + images chargés depuis l'API.")
            }
        } catch (error) {
            console.warn("API Produits échouée ou hors ligne. Lecture du cache local...")
        }
    }

    try {
        const localProducts = await localDB.products.toArray()
        console.log(`DataService Produits chargés depuis localDB (${localProducts.length}).`)
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
            
         
            if (Array.isArray(apiCategories) && apiCategories.length > 0){

                const categoriesWithImages = await Promise.all(
                    apiCategories.map(async (category) => {
                        if(category.image && !category.image.startsWith('data:')){
                            const base64Image = await urlToBase64(category.image)
                            return {
                                ...category,
                                image: base64Image || category.image,
                                imageOriginalUrl: category.image
                            }
                        }
                        return category
                    })
                )
                await localDB.categories.bulkPut(categoriesWithImages)
    
                console.log("DataService Catégories with images  chargées depuis l'API.")
            }

        } catch (error) {
            console.warn("API Catégories échouée ou hors ligne. Lecture du cache local...")
        }
    }

    // Fallback / Lecture Hors Ligne
    try {
        const localCategories = await localDB.categories.toArray()
        console.log(`DataService Catégories chargées depuis localDB (${localCategories.length}).`)
        return localCategories
    } catch (dbError) {
        console.error(" Impossible de lire localDB.categories:", dbError)
        return []
    }
}

