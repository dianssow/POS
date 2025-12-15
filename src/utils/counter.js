import { localDB } from "./localDB"

export async function generateTemporaryInvoice() {
  const year = new Date().getFullYear()
  
  let counter = await localDB.counters
    .where({ type: "tempInvoice", year })
    .first()

  let value = 1

  if (counter) {
    value = counter.value + 1
    await localDB.counters.update(counter.id, { value })
  } else {
    await localDB.counters.add({ type: "tempInvoice", year, value })
  }

  return `T${year}-${String(value).padStart(5, "0")}`
}

