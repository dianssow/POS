import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import Quantity from "../Quantity"
import { addSale } from "../../features/sale"
import api from "../../api.js"
import { setEnteredGivenAmount, setEnteredPaymentBuffer } from "../../features/cart.js"
import { localDB } from "../../utils/localDB.js" // IndexedDB via Dexie
import { v4 as uuidv4 } from "uuid"

export default function PaymentPanel({ onCancel, onConfirm, selectedClient }) {

    // Variables d'état et Redux (inchangées)
    const totalAmount = useSelector(state => state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
    const [paymentType, setPaymentType] = useState("Espèces")
    const [confirmationData, setConfirmationData] = useState(null)
    const [errorMessage, setErrorMessage] = useState("")

    const givenAmount = useSelector(state => state.cart.enteredGivenAmount)
    const cartItems = useSelector(state => state.cart.items)
    const token = useSelector(state => state.loginPage.token)
    const dispatch = useDispatch()
    
    // handleValidate reste inchangé
    const handleValidate = () => {
        if (totalAmount < 0 && paymentType !== "Retour") {
            setErrorMessage("Sélectionnez le bon type de payment")
            return
        }

        if ((paymentType !== "Espèces" && paymentType !== "Retour") && !selectedClient) {
            setErrorMessage("Sélectionnez un client.")
            return
        }

        const donné = Number(givenAmount || 0)
        if (isNaN(donné) || donné < 0) {
            setErrorMessage("Ajoutez un montant valide.")
            return
        }

        if (paymentType === "Espèces" && donné < totalAmount) {
            setErrorMessage("Montant insuffisant pour payer en espèces.")
            return
        }

        if (paymentType === "Retour" && totalAmount >= 0) {
            setErrorMessage("Le montant pour un Retour doit etre negatif .")
            return
        }

        setErrorMessage("")

        const reste = totalAmount - donné
        setConfirmationData({
            selectedClient,
            paymentType,
            totalAmount,
            givenAmount: donné,
            reste,
            date: new Date().toISOString(),
            items: cartItems
        })
    }
    
    // 🛑 Fonction de confirmation harmonisée (gère Online/Offline via Intercepteur)
    const handleConfirm = async () => {
        if (!confirmationData) return

        // 1. Préparation des données de vente
        const saleData = {
            customerId: confirmationData.selectedClient?.id || null,
            items: confirmationData.items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                unit: item.unit
            })),
            paymentType: confirmationData.paymentType,
            totalAmount: confirmationData.totalAmount,
            givenAmount: confirmationData.givenAmount,
            reste: confirmationData.reste,
            date: confirmationData.date
        }
        
        // 2. Générer l'ID local unique pour l'enregistrement local et la synchronisation
        const localId = uuidv4()
        const saleDataWithLocalId = { ...saleData, id: `local_${localId}` }
        
        // 3. Préparer l'objet de la vente pour l'enregistrement immédiat dans l'historique local
        const localSale = {
            ...saleDataWithLocalId,
            id: `local_${localId}`, // Clé primaire locale (ex: "local_9f3b...")
            synced: 0,
            createdAt: new Date().toISOString()
        }

        try {
            // 4. Tentative d'envoi API (l'intercepteur s'en charge si la connexion échoue)
            const res = await api.post("/api/sale/add", saleDataWithLocalId, {
                headers: { Authorization: `Bearer ${token}` }
            })

            let finalSale;

            if (res.data.offline) {
                // 🛑 SCÉNARIO HORS LIGNE (Réponse de l'intercepteur)
                // L'intercepteur a mis la requête dans pendingRequests.
                // On enregistre la vente dans notre historique local (`localDB.sales`).
                await localDB.sales.add(localSale)
                finalSale = localSale
                console.log("Vente enregistrée hors ligne et ajoutée à la file d'attente.")

            } else if (res.data.success) {
                // SCÉNARIO EN LIGNE (Réponse réelle du serveur)
                finalSale = res.data.sale
                console.log("Vente réussie sur le serveur.")
                
            } else {
                 setErrorMessage(res.data.message || "Erreur inconnue de l'API.")
                 return
            }
            
            // 5. Mise à jour de l'UI (commun aux deux scénarios)
            dispatch(addSale(finalSale))
            onConfirm?.(finalSale)

            // Cleanup
            dispatch(setEnteredPaymentBuffer(""))
            dispatch(setEnteredGivenAmount(""))
            setConfirmationData(null)

        } catch (err) {
            console.error("Erreur enregistrement vente :", err)
            setErrorMessage("Erreur critique lors de l'enregistrement de la vente.")
        }
    }
  return (
    <div className="w-[100%] fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ">
        <div className="flex  bg-slate-700/80 w-[60%] h-[80%] rounded shadow-lg overflow-hidden ">
    
    <div className="flex-1 flex flex-col p-6 gap-4 relative">
        <h1 className="text-2xl font-extrabold font-serif flex justify-center border-b pb-2 text-slate-50 tracking-wide "> PAIEMENT</h1>

        <div>
            <label className="text-sm text-white font-bold">CLIENT</label>
            <input type="text"
            value={selectedClient?.name || "-"}
            readOnly
            className=" w-full font-serif border px-2 py-2 mt-1 rounded"
            />
        </div>

        <div>
            <label className="text-sm text-white font-bold">VERSEMENT</label>
            <input 
            type="number"
            value={givenAmount}
            onChange={(e) => dispatch(setEnteredGivenAmount(e.target.value))}
            className="w-full font-bold   border px-2 py-2 mt-1 rounded"
            />
            
        </div>
            {/* ------Retravailler------- */}
        {/* {paymentType === "Chèque" && 
        (
            <div className="mt-2">
                <label  className="text-sm font-medium"> Numéro de chèque</label>
                <input type="text" 
                value={chequeNumber}
                className="w-[250px] border px-4 py-1 mt-1 rounded "
                onChange={(e) => setChequeNumber(e.target.value)}
                />
            </div>
        )} */}



        <div>
            <label  
            className=" text-sm text-white font-bold ">Mode de Paiement :</label>
            <div className="flex font-serif gap-2 mt-2">
                {["Espèces", "Crédit", "Chèque", "Retour"].map((type) => (
                    <button
                    key={type}
                    onClick={() => setPaymentType(type)}
                    className={`px-3 py-2 rounded ${
                    paymentType === type 
                    ? "bg-green-500 text-white"
                    :"bg-gray-200"
                    }` }
                    >
                        {type}

                    </button>
                    
                ))}
                
        {errorMessage && (
                <div className="text-red-500 text-lg mt-auto flex justify-end items-center ">{errorMessage}</div>
            )}
            </div>
            
        </div>

        <div className="mt-auto flex justify-end items-center pt-4 border-t border-gray-300">
            <div className="text-lg font-semibold">
            Montant total : {" "}

            <span className="text-green-600">
                {totalAmount.toLocaleString('fr-GN')}
            </span>
        </div>
        </div>

          

        <div className="mt-auto flex justify-between">
            <button
            onClick={() => {
              dispatch(setEnteredPaymentBuffer(""))
              dispatch(setEnteredGivenAmount(""))
              onCancel?.()}}
            className="bg-gray-300 px-4 py-2 rounded"
            >
                Annuler

            </button>
            <button
            onClick={handleValidate}
            className="bg-green-500 px-4 py-2 rounded text-white"
            >
                Valider le Paiement

            </button>
        </div>
        </div>
        </div>
        <div className="w-[25%] h-[40%] bg-slate-700 p-3">
            <Quantity mode="payment"/>
        </div>
       
         {confirmationData && (
             <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-6 w-[400px] text-center shadow">
                    <h2 className="text-xl font-bold mb-4 text-green-700"> Paiement reussi</h2>
                    <p> <strong>Client :</strong> {confirmationData.selectedClient?.name || "-"}</p>
                    <p> <strong>Total :</strong> {parseInt(confirmationData.totalAmount).toLocaleString('fr-GN')}</p>
                    <p> <strong>Versement:</strong> {parseInt(confirmationData.givenAmount).toLocaleString('fr-GN')}</p>
                    <p> <strong>Reste :</strong> {parseInt(confirmationData.reste).toLocaleString('fr-GN')}</p>
                 
                    <button 
                    onClick={handleConfirm}
                    className="mt-4 px-4 py-2 bg-green-700 text-white rounded"
                    >
                        Terminer
                    </button> 
                </div>
             </div>
        )}

        </div>
    
  )
 }