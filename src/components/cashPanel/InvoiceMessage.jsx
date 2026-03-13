
function InvoiceMessage({successMessage, errorMessage,onClose}) {

    if(!successMessage && !errorMessage) return null


  return (
    
         <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white text-black w-full max-w-sm rounded-lg shadow-2xl p-6">
                        <div>
                        {errorMessage && (
                           
                            <div className="text-red-600 text-lg justify-center items-center mt-auto">
                                  <button
                                 onClick={onClose}
                                className="text-red-500 hover:text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
                                {errorMessage}</div>
                        )} 
                        {successMessage && (

                            <div className="text-green-400 text-lg justify-center items-center mt-auto">
                                 <button
                                 onClick={onClose}
                                className="text-red-500 hover:text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
                                {successMessage}</div>
                        )}
                        </div>
                        </div></div>

  )
}
export default InvoiceMessage