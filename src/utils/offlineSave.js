// import { localDB } from "./localDB";
// import api from "../api";

// //Synchronise toutes les requêtes locales non synchronisées
// export async function syncOfflineData() {
//   syncLocalSales()
// syncLocalStock()
// syncLocalShifts()
//   const unsynced = await localDB.pendingRequests.where("synced").equals(false).toArray();

//   if (unsynced.length === 0) return;

//   console.log(`Synchronisation de ${unsynced.length} requêtes locales...`);

//   for (const req of unsynced) {
//     try {
//       await api({
//         method: req.method,
//         url: req.url,
//         data: req.data,
//         headers: req.headers,
//       });

//       await localDB.pendingRequests.update(req.id, { synced: true });
//       console.log(`✅ Synchronisé : ${req.url}`);
//     } catch (err) {
//       console.error(`❌ Échec de synchronisation pour ${req.url} (${err.message})`);
//       break; 
//     }
//   }
// }

// //Intercepteur Axios pour gérer le mode hors ligne
// export function setupOfflineInterceptor(apiInstance) {
//   apiInstance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
      
//       if (!error.response) {
//         const originalRequest = error.config;

//         try {
//           await localDB.pendingRequests.add({
//             url: originalRequest.url,
//             method: originalRequest.method,
//             data: originalRequest.data ? JSON.parse(originalRequest.data) : null,
//             headers: originalRequest.headers,
//             synced: false,
//             date: new Date().toISOString(),
//           });

//           console.warn("🟡 Requête sauvegardée localement :", originalRequest.url);

//           return Promise.resolve({
//             data: {
//               offlineSaved: true,
//               message: "Enregistré localement (mode hors ligne)",
//             },
//           });
//         } catch (err) {
//           console.error(" Erreur stockage local :", err);
//         }
//       }

//       return Promise.reject(error);
//     }
//   );
// }

// // Écouteur pour détecter quand l'utilisateur revient en ligne
// export function setupOnlineSync() {
//   window.addEventListener("online", () => {
//     console.log("🔄 Connexion rétablie : synchronisation des données locales...");
//     syncOfflineData();
//   });
// }


