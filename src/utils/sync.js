import { localDB } from "./localDB"
import api from "../api"


// FONCTIONS DE GESTION DES ID LOCAL vers SERVEUR

async function handleSaleSync(tempId, serverId, saleData) {
    
    const newSaleData = { ...saleData }
    
    
    delete newSaleData.tempInvoiceNumber 

    newSaleData.id = serverId
    newSaleData.synced = true
    
    try {
        // Utiliser une transaction pour garantir l'atomicité de la suppression et de l'ajout (changement de clé primaire)
        await localDB.transaction('rw', localDB.sales, async () => {
       
            await localDB.sales.delete(tempId)
            
        
            await localDB.sales.add(newSaleData)
        })
        console.log(`Synchro (Vente) OK: de ${tempId} vers ${serverId}`)
        
    } catch (error) {
        console.error(` DataError (Vente) lors du remplacement d'ID ${tempId}:`, error)
        throw error 
    }
}

// CashMovements
async function handleMovementSync(tempId, serverId, movementData) {
    
    const newMovementData = { ...movementData }

    newMovementData.id = serverId
    newMovementData.synced = true
    
    try {
        await localDB.transaction('rw', localDB.cashMovements, async () => {
            await localDB.cashMovements.delete(tempId)
            await localDB.cashMovements.add(newMovementData)
        })
        console.log(`[SYNCHRO] Mouvement OK: ${tempId} -> ${serverId}`)
        
    } catch (txError) {
        console.error(` DataError (Mouvement) lors du remplacement d'ID ${tempId}:`, txError)
        throw txError
    }
}



export async function syncOfflineData() {
    console.log("Tentative de synchronisation des données hors ligne...")

    let pending = []
    try {
        const allRequests = await localDB.pendingRequests.toArray()
        pending = allRequests.filter(req => req.synced === false || req.synced === 0)
    } catch (err) {
        console.error(" Échec critique de la lecture des requêtes en attente. Abandon de la synchronisation.", err)
        return 
    }

    if (pending.length === 0) {
        console.log("Aucune donnée en attente de synchronisation.")
        return
    }

    // Boucle à travers chaque requête en attente
    for (const req of pending) {
        let isSyncSuccess = false 
        
        try {
            
            const res = await api({
                method: req.method,
                url: req.url,
                data: cleanForServer(req.data),
                headers: req.headers || {},
            })
            
            // 3. GESTION DU REMPLACEMENT D'ID LOCAL PAR L'ID SERVEUR
            
                if (res.data?.sale?.id && req.data?.id?.startsWith("local_")) {
                await handleSaleSync(req.data.id, res.data.sale.id, req.data)
                isSyncSuccess = true
            }
            
            else if (res.data?.movement?.id && req.data?.id?.startsWith("local_mov_")) {
                await handleMovementSync(req.data.id, res.data.movement.id, req.data)
                isSyncSuccess = true
            }
            // Another requests
            else {
                isSyncSuccess = true 
            }

            
            if (isSyncSuccess) {
                await localDB.pendingRequests.update(req.id, { synced: 1 }) 
            }
            
        } catch (err) {
            console.error(`Échec de la synchronisation pour ${req.url} (ID: ${req.id})`, err.message)
        }
    } 
    
    console.log("Fin du processus de synchronisation.")
}


function cleanForServer(data) {
    if (!data) return data
    
    const safe = { ...data }
    
    
    delete safe.tempInvoiceNumber
    delete safe.synced

    
    if (safe.id?.startsWith("local_")) {
        delete safe.id
    }
    
    return safe
}

