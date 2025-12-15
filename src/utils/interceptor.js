

import { localDB } from "./localDB" 
import { v4 as uuidv4 } from "uuid"


async function handleNetworkFailure(error) {

    if (error.response) {
        return Promise.reject(error)
    }

    // Erreur réseau (timeout, pas de connexion)
    const req = error.config
    
    if (req.method !== 'get') {
        
        console.log(`Offline Interceptor ,Échec réseau détecté pour ${req.url}. Sauvegarde locale...`)

        // Détecter si la requête a déjà un ID local unique (ventes, mouvements)
        // La vente dans PaymentPanel ajoute déjà l'ID local (uuid) au payload data.
        const payloadData = req.data ? JSON.parse(req.data) : {}
        
        //  Ready for pendingRequests
        const pendingRequest = {
            id: uuidv4(), 
            url: req.url,
            method: req.method,
            data: payloadData, 
            synced: 0, 
            date: new Date().toISOString(),
            headers: req.headers,
        }

        try {
            await localDB.pendingRequests.add(pendingRequest)
            console.log(`Offline Interceptor, Requête ${req.url} ajoutée à pendingRequests.`)
            
            //  Offline Response simulation 
            return Promise.resolve({ 
                data: { success: true, message: "Requête enregistrée localement pour synchronisation.", offline: true },
                status: 200, 
                config: req 
            })

        } catch (dbError) {
            console.error(" Échec de la sauvegarde locale dans pendingRequests:", dbError)
            // Si même la sauvegarde échoue, on rejette l'erreur initiale.
            return Promise.reject(error)
        }
    }
    
    // Si c'est une requête GET, ou une requête non-GET sans gestion spécifique
    return Promise.reject(error)
}

export function setupOfflineInterceptor(apiInstance) {
    
    apiInstance.interceptors.response.use(
        (res) => res, 
        handleNetworkFailure 
    )

   
    
}
