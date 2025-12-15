import Dexie from "dexie";

export const localDB = new Dexie("POS_DB");

localDB.version(3).stores({
  pendingRequests: "++id, url, method,data, synced, date",
  
  sales: "id, synced, tempInvoiceNumber, date",
  cashMovements: "id,shiftId, synced, date",
  shifts: "id, status, synced",
  stock: "id, quantity",
  counters: "++id, type,year",
  products: "id, name",
  customers: "id,name",
  users: "id, name",
  sessions: "id, status",
  categories: "id, name"
})