import api from "../api.js"
import { localDB } from "./localDB.js"

 

export  const checkSessionAndSync = async (token) => {
  if (!navigator.onLine) {
   const openShift = await localDB.shifts.where({ status: "OPEN" }).first()
   return !!openShift
  }

  try {
    const response = await api.get("/api/cash/summary", {
      headers: { Authorization: `Bearer ${token}` }
    })

    const status = response.data.shift?.status || "CLOSED"
    const shiftData = response.data.shift
    if(shiftData && status === "OPEN"){

      await localDB.shifts.put({ 
        id: shiftData.id, 
        status: "OPEN",
        synced: true,
        openingAmount: shiftData.openingAmount,
        openedAt: shiftData.openedAt
     })
    } else {
      await localDB.shifts.clear()
    }
    console.log("checkSession API response:", response.data)
    return status === "OPEN"
  } catch (error) {
    console.warn("Erreur API, utilisation du localDB", error)
    const openShift = await localDB.shifts.where({status: "OPEN"}).first()
    return !!openShift
  }
}