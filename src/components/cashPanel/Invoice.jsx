import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import api from "../../api";
import { getSales, getVersements } from "../../utils/dataService"
import { localDB } from "../../utils/localDB"
import { setItems } from "../../features/cart"
import InvoiceMessage from "./InvoiceMessage"

const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

function Invoice({ closeModal }) {
    const [currentSessionSales, setCurrentSessionSales] = useState([])
    const [currentSessionVersements, setCurrentSessionVersements] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSale, setSelectedSale] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [errorMessage, setErrorMessage]= useState("")
    
    // États pour les modales
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showConfirmEdit, setShowConfirmEdit] = useState(false) // Nouvelle modale confirmation

    const token = useSelector(state => state.loginPage.token)
    const user = useSelector((state) => state.loginPage.user)
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const sales = await getSales()
                const currentShift = await localDB.shifts
                    .where('status')
                    .equals('OPEN')
                    .first()

                if (!currentShift) {
                    console.log("Aucune session ouverte")
                    setCurrentSessionSales([])
                    return
                }

                const current = sales.filter(sale => {
                    if (sale.synced === false) return true
                    return sale.shiftId === currentShift.id ||
                        sale.shift?.id === currentShift.id ||
                        sale.shift?.status === "OPEN"
                })
                setCurrentSessionSales(current);

            } catch (error) {
                console.error("Erreur de recuperation de la vente :", error)
                setCurrentSessionSales([])
            }
        }
        fetchSales()
        window.addEventListener('online', fetchSales)
        return () => window.removeEventListener('online', fetchSales)
    }, [])

    const filteredCurrentSales = currentSessionSales.filter((sale) => {
        if (!searchTerm.trim()) return true
        return sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    })

    useEffect(() => {
        const fetchVersements = async () => {
            try {
                const versements = await getVersements()
                const currentShift = await localDB.shifts
                    .where('status')
                    .equals('OPEN')
                    .first()

                if (!currentShift) {
                    setCurrentSessionVersements([])
                    return
                }

                const current = versements.filter(versement => {
                    if (versement.synced === false) return true
                    return versement.shiftId === currentShift.id ||
                        versement.shift?.id === currentShift.id ||
                        versement.shift?.status === "OPEN"
                })
                setCurrentSessionVersements(current);
            } catch (error) {
                console.error("Erreur de recuperation versements :", error)
                setCurrentSessionVersements([])
            }
        }
        fetchVersements()
        window.addEventListener("online", fetchVersements)
        return () => window.removeEventListener("online", fetchVersements)
    }, [])

    const filteredCurrentVersements = currentSessionVersements.filter((versement) => {
        if (!searchTerm.trim()) return true
        return versement.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    })


    const handleDelete = async () => {
        if (user.role !== "admin") {
            
            setErrorMessage("seul un admin peut retirer une facture")
            return
        }

        if (!selectedSale) {
            setErrorMessage("Veuillez sélectionner une facture à supprimer")
            return
        }

        if(!window.confirm("Supprimer cette facture définitivement ?")) return;

        setIsDeleting(true)

        if (selectedSale) {
            try {
                const response = await api.delete(`/api/sale/${selectedSale.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (response.data.success) {
                    try {
                        await localDB.sales.delete(selectedSale.id)
                    } catch (dbError) {
                        console.warn(" Facture introuvable dans la DB locale")
                    }

                    setCurrentSessionSales(prevSales => 
                     prevSales.filter(sale => sale.id !== selectedSale.id)
                    )
    
    
                    setSelectedSale(null)
                  
                }
                else {
                    console.error("erreur de suppression du Produit")
                }

            } catch (error) {
                console.error("erreur de suppression du Produit", error)
            }
            finally {
                setSelectedSale(null)
                setIsDeleting(false)
                setErrorMessage("")

            }
        }
    }


    const handleEditClick = () => {
        if (!selectedSale) {
            setErrorMessage("Veuillez sélectionner une facture à modifier")
            return
        }
        setShowConfirmEdit(true)
    }

    const performEdit = async () => {
        setShowConfirmEdit(false) 
        setIsEditing(true)

        try {
            const response = await api.put(
                `/api/sale/edit/${selectedSale.id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.data.success) {
                try { await localDB.sales.delete(selectedSale.id) } catch (e) { }

                  setCurrentSessionSales(prev => prev.filter(s => s.id !== selectedSale.id))

                const cartItems = selectedSale.items.map(item => ({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    unit: item.unit,
                    wholesalePrice: item.wholesalePrice
                }))

                dispatch(setItems(cartItems))
                if (closeModal) closeModal()

            } else {
                setErrorMessage("Erreur lors de la modification")
            }

        } catch (error) {
            console.log(error.response?.data?.message || "Erreur serveur")
        } finally {
            setIsEditing(false)
        }
    }


    const handleViewDetails = () => {
        if (selectedSale) {
            setShowDetailsModal(true);
        }
    }

    return (
        <div className="relative h-full">
            <div className="flex justify-between mb-2">
                <input
                    type="text"
                    placeholder="Rechercher Une Facture..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[40%] text-black bg-gray-200 p-2 border shadow-sm rounded focus:outline-none focus:ring-0"
                />
                <div className="flex gap-2" >
                    <button
                        onClick={handleViewDetails}
                        disabled={!selectedSale}
                        className={`px-3 py-2 rounded flex items-center gap-2 ${!selectedSale ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        title="Voir les détails"
                    >
                        <EyeIcon /> Voir
                    </button>

                    <button
                        onClick={handleEditClick}
                        disabled={!selectedSale || isEditing || isDeleting}
                        className="px-3 py-2 rounded text-black bg-gray-300"> 
                        {isEditing ? "Modification..." : "Modifier"}
                    </button>
                    
                    <button
                        onClick={handleDelete}
                        disabled={!selectedSale || isEditing || isDeleting || user.role !== "admin"}
                        className="px-4 py-2 rounded text-black bg-gray-300">
                        {isDeleting ? "Suppression..." : "Retirer"}
                    </button>
                </div>
            </div>

            <div className="max-h-60 overflow-y-auto min-h-60 scrollbar-hide">
                <table className="w-full text-left border-collapse text-white">
                    <thead className="sticky top-0 bg-slate-700/90 z-10">
                        <tr >
                            <th className="px-4 py-2 border-b text-center">Client</th>
                            <th className="px-4 py-2 border-b">Type</th>
                            <th className="px-4 py-2 border-b">Total</th>
                            <th className="px-4 py-2 border-b">Heure</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredCurrentSales.map((sale) => (
                            <tr key={sale.id}
                                onClick={() => setSelectedSale(sale)}
                                onDoubleClick={handleViewDetails}
                                className={`cursor-pointer ${selectedSale?.id === sale.id ? 'bg-slate-200 text-slate-950' : ""}`}
                            >
                                <td className="px-4 py-2 text-center">{sale.customer?.name || "--"} </td>
                                <td className="px-4 py-2">{sale.paymentType} </td>
                                <td className="px-4 py-2 font-bold">{sale.totalAmount.toLocaleString("fr-FR")} </td>
                                <td className="px-4 py-2">{new Date(sale.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })} </td>
                            </tr>
                        ))}

                        {filteredCurrentVersements.map((versement) => (
                            <tr key={versement.id} className="cursor-pointer bg-orange-100/90 text-black" >
                                <td className="px-4 py-2 text-center">{versement.customer?.name || "--"} </td>
                                <td className="px-4 py-2"> Versement </td>
                                <td className="px-4 py-2">{versement.amount.toLocaleString("fr-FR")} </td>
                                <td className="px-4 py-2">{new Date(versement.createdAt).toLocaleTimeString("fr-FR")} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODALE DE CONFIRMATION (REMPLACE window.confirm) --- */}
            {showConfirmEdit && selectedSale && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white text-black w-full max-w-sm rounded-lg shadow-2xl p-6">
                        
                        <h3 className="text-xl font-bold mb-4 text-gray-800"> Confirmation</h3>
                        
                        <div className="text-gray-700 mb-6 text-sm leading-relaxed">
                            <p className="font-medium mb-3 text-lg">
                                Modifier la facture de {selectedSale.customer?.name || "ce client"} ?
                            </p>
                            
                            <p className="font-semibold text-red-600 mb-1">Cette action est irreverssible</p>
                            <p className="font-semibold text-gray-800 mb-1">Cette action va :</p>
                            <ul className="list-disc list-inside pl-1 space-y-1 text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                                <li>Annuler la facture actuelle</li>
                                <li>Restaurer le stock</li>
                                <li>Créer un mouvement de correction</li>
                                <li>Recharger les produits dans le panier</li>
                            </ul>
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t">
                            <button 
                                onClick={() => setShowConfirmEdit(false)}
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={performEdit}
                                className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 font-medium shadow-sm"
                            >
                                Confirmer Modification
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <InvoiceMessage 
            errorMessage={errorMessage}
            successMessage={successMessage}
            onClose={() => {
            setErrorMessage("")
            setSuccessMessage("")
            }}
            />

            {/* --- MODALE DE DÉTAILS --- */}
            {showDetailsModal && selectedSale && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
                    <div className="bg-slate-800 text-black w-11/12 md:w-3/4 h-[100%] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                        <div className="bg-slate-800 text-white px-4 py-2 flex justify-between items-center shrink-0">
                            <div className="flex gap-4 items-baseline">
                                <h3 className="text-lg font-bold">Facture {selectedSale.invoiceNumber}</h3>
                                <p className="text-sm text-slate-300">{new Date(selectedSale.createdAt).toLocaleString("fr-FR")}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-red-500 hover:text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 bg-white">
                            <div className="mb-2 p-3 bg-gray-100 rounded text-sm">
                                <p><strong>Client :</strong> {selectedSale.customer?.name || "Client Passager"}</p>
                                <p><strong>Paiement :</strong> {selectedSale.paymentType}</p>
                            </div>

                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-gray-200 text-black">
                                    <tr>
                                        <th className="p-2 text-left">Nom</th>
                                        <th className="p-2 text-center">Qté</th>
                                        <th className="p-2 text-center">Unité</th>
                                        <th className="p-2 text-right">Prix U.</th>
                                        <th className="p-2 text-right">Total(GNF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSale.items?.map((item, index) => (
                                        <tr key={index} className="border-b text-black hover:bg-gray-50">
                                            <td className="p-2">{item.name}</td>
                                            <td className="p-2 text-center font-bold">{item.quantity}</td>
                                            <td className="p-2 text-center text-xs text-gray-500">{item.unit}</td>
                                            <td className="p-2 text-right">{item.price?.toLocaleString()}</td>
                                            <td className="p-2 text-right font-bold">{(item.price * item.quantity)?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-2 bg-slate-700/90 border-t flex justify-between items-center text-lg shrink-0">
                            <span className="font-semibold text-white">Total Facture :</span>
                            <span className="font-bold text-blue-400 text-xl">
                                {selectedSale.totalAmount?.toLocaleString("fr-FR")} GNF
                            </span>
                        </div>
                        <div className="px-4 pb-4 bg-slate-700/90 flex justify-end gap-4 text-sm">
                            <span className="text-green-400 font-bold">Payé: {selectedSale.givenAmount?.toLocaleString()}</span>
                            {(selectedSale.paymentType === "Espèces" ?
                                <span className="text-red-400 font-bold"> Monnaie: {Math.abs(selectedSale.reste)?.toLocaleString()}</span> :
                                <span className="text-red-400 font-bold">Reste: {selectedSale.reste?.toLocaleString()}</span>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Invoice
