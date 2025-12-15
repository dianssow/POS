import { useState, useEffect } from "react";
import { getCustomers } from "../utils/dataService";
export default function Client({ onSelect, onClose }) {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const allCustomers =  await getCustomers()
        setCustomers(allCustomers)
      } catch (error) {
        console.error("Erreur chargement clients", error)
        setCustomers([])
      }
    };
    fetchCustomers()
    window.addEventListener('online', fetchCustomers)
    return () => window.removeEventListener('online', fetchCustomers)
    }, [])

  

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed flex inset-0 bg-black bg-opacity-40 justify-center items-center">
      <div className="bg-slate-700/80 p-6 block rounded-xl  w-[450px] shadow-lg">
        <h2 className="text-xl text-center font-serif mb-4">SELECTIONNER UN CLIENT</h2>

        <input
          type="text"
          placeholder="Rechercher client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-black p-2 border shadow-sm rounded mb-4 focus:outline-none focus:ring-0"
        />
        

        <div className="max-h-60 overflow-y-auto min-h-60">
          {filteredCustomers.length > 0 ? (
          filteredCustomers.map((c) => (
            <div
              key={c._id}
              onClick={() => {
                onSelect(c);
                onClose();
              }}
              className="p-2 border-b cursor-pointer hover:bg-gray-200"
            >
              <div
              onClick={onClose}
               className="font-semibold">{c.name} <span className="text-orange-200">{c.address}</span></div>
            </div>
          ))
        ) : (
          <div className="text-white text-center p-2 italic">Aucun Client trouvé</div>
        )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
