import { localDB } from "./localDB";
import { generateTemporaryInvoice } from "./counter.js";

export async function saveSaleOffline(sale) {
  const localId = `local_${Date.now()}`;
  const invoiceNumber = await generateTemporaryInvoice();

  const offlineSale = {
    ...sale,
    id: localId,
    invoiceNumber,
    synced: false,
    createdAt: new Date().toISOString(),
  };

  await localDB.sales.put(offlineSale);

  await localDB.pendingRequests.add({
    url: "/api/sale/add",
    method: "POST",
    data: offlineSale,
    synced: false,
    date: new Date().toISOString(),
  });

  return offlineSale;
}
