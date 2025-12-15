import { localDB } from "./localDB"


export async function saveCashMovementOffline(rawMovement) {
    

    const currentShift = await localDB.shifts.where({ status: "OPEN" }).first()
    
    if (!currentShift) {
        throw new Error("Impossible d'enregistrer le mouvement: Aucune session ouverte.")
    }

    const localId = `local_mov_${Date.now()}`
    
    const offlineMovement = {
        ...rawMovement,
        id: localId, 
        shiftId: currentShift.id, 
        synced: false,
        createdAt: new Date().toISOString(),
    }

    // 2. Sauvegarde du mouvement dans la table locale des mouvements de caisse
    await localDB.cashMovements.put(offlineMovement)

    // 3. Ajout de la requête à la file d'attente de synchronisation
    await localDB.pendingRequests.add({
        url: "/api/cash/movement/add", 
        method: "POST",
        data: offlineMovement,
        headers: rawMovement.headers || {}, // Pour l'authentification (token)
        synced: false,
        date: new Date().toISOString(),
    })
    
    console.log(`Mouvement de caisse enregistré hors ligne. ID local: ${localId}`)

    return offlineMovement
}