import Dexie from "dexie";

export const localDB = new Dexie("POS_DB");

localDB.version(6).stores({
  pendingRequests: "++id, url, method,data, synced, date",
  
  sales: "id, synced, tempInvoiceNumber,createdAt, date, totalAmount, totalGivenAmount",
  cashMovements: "id,shiftId, synced, date",
  versements: "id, synced, customerId,createdAt",
  shifts: "id, status, synced",
  stock: "id, quantity",
  counters: "++id, type,year",
  products: "id, name",
  customers: "id,name",
  users: "id, name",
  categories: "id, name" ,
  
})