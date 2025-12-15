import { localDB } from "./localDB";
import { generateTemporaryInvoice } from "./invoice";
import { updateLocalStock } from "./stockManager";

export async function saveSaleOffline(rawSale) {

  const tempId = `local_${Date.now()}`;
  const tempInvoice = await generateTemporaryInvoice();

  const offlineSale = {
    ...rawSale,
    id: tempId,
    tempInvoiceNumber: tempInvoice,
    synced: false,
    createdAt: new Date().toISOString(),
  };

  // Sauvegarde dans local sales
  await localDB.sales.put(offlineSale);

  // Mise à jour stock local
  await updateLocalStock(rawSale.items, rawSale.paymentType === "Retour");

  // Ajout file d'attente
  await localDB.pendingRequests.add({
    url: "/api/sale/add",
    method: "POST",
    data: offlineSale,
    headers: rawSale.headers || {},
    synced: false,
    date: new Date().toISOString(),
  });

  return offlineSale;
}

