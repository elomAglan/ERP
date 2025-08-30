// StoresPage.tsx
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaMapMarkerAlt,
  FaTimes,
  FaCheck,
  FaSpinner,
  FaStore,
} from "react-icons/fa";

type Store = {
  id: number;
  code: string;
  name: string;
  zone: string[];
};

const API_URL = "http://localhost:5000";

const StoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Form states (for creating/editing store name)
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Row selection state
  const [selectedStores, setSelectedStores] = useState<number[]>([]);

  // Zone management modal states
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [currentStoreForZones, setCurrentStoreForZones] = useState<Store | null>(null);
  const [newZoneInput, setNewZoneInput] = useState("");

  const showFeedback = (message: string, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/stores`);
      if (!res.ok) throw new Error("Échec du chargement des magasins.");
      const data: Store[] = await res.json();
      setStores(data);
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const clearForm = () => {
    setName("");
    setEditingId(null);
  };

  const handleCreateOrUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    
    if (!name.trim()) {
        showFeedback("Le nom du magasin est requis.", true);
        setIsFormLoading(false);
        return;
    }

    const storeData = { name };
    const method = editingId ? "PUT" : "POST";
    const url = `${API_URL}/api/stores${editingId ? `/${editingId}` : ""}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur lors de l'enregistrement du magasin.`);

      clearForm();
      fetchStores();
      showFeedback(`Magasin ${editingId ? "mis à jour" : "ajouté"} avec succès !`);
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleSelectStore = (storeId: number) => {
    setSelectedStores(prevSelected =>
      prevSelected.includes(storeId)
        ? prevSelected.filter(id => id !== storeId)
        : [...prevSelected, storeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStores.length === stores.length) {
      setSelectedStores([]);
    } else {
      setSelectedStores(stores.map(store => store.id));
    }
  };

  const handleEditSelected = () => {
    if (selectedStores.length === 1) {
      const storeToEdit = stores.find(store => store.id === selectedStores[0]);
      if (storeToEdit) {
        setEditingId(storeToEdit.id);
        setName(storeToEdit.name);
        setSelectedStores([]);
      }
    }
  };

  const handleManageZonesSelected = () => {
    if (selectedStores.length === 1) {
      const storeToManage = stores.find(store => store.id === selectedStores[0]);
      if (storeToManage) {
        handleOpenZoneModal(storeToManage);
        setSelectedStores([]);
      }
    }
  };

  const isEditDisabled = selectedStores.length !== 1;
  const isZoneManageDisabled = selectedStores.length !== 1;

  // --- Zone modal handlers ---
  const handleOpenZoneModal = (store: Store) => {
    setCurrentStoreForZones(store);
    setIsZoneModalOpen(true);
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStoreForZones || !newZoneInput.trim()) return;
    const zoneToAdd = newZoneInput.trim();

    try {
      const store = currentStoreForZones;
      if (store.zone.includes(zoneToAdd)) {
        showFeedback("Cette zone existe déjà.", true);
        return;
      }

      const updatedZones = [...store.zone, zoneToAdd];
      const res = await fetch(`${API_URL}/api/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...store, zone: updatedZones }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'ajout de la zone.");
      
      fetchStores();
      setNewZoneInput("");
      setCurrentStoreForZones({...store, zone: updatedZones});
      showFeedback("Zone ajoutée avec succès !");
    } catch (err: any) {
      showFeedback(err.message, true);
    }
  };
  
  const handleRemoveZone = async (zoneToRemove: string) => {
    if (!currentStoreForZones) return;

    try {
      const store = currentStoreForZones;
      const updatedZones = store.zone.filter(z => z !== zoneToRemove);
      const res = await fetch(`${API_URL}/api/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...store, zone: updatedZones }),
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression de la zone.");
      
      fetchStores();
      setCurrentStoreForZones({...store, zone: updatedZones});
      showFeedback("Zone supprimée avec succès !");
    } catch (err: any) {
      showFeedback(err.message, true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaStore className="mr-3 text-indigo-600" /> Gestion des Magasins
          </h1>
          <p className="text-gray-600 mt-2">Créez, modifiez et gérez les zones de service de vos points de vente.</p>
        </div>

        {/* Feedback Messages */}
        {feedback && (
          <div className={`fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center animate-fade-in ${feedback.isError ? "bg-red-500" : "bg-green-500"}`}>
            {feedback.isError ? <FaTimes className="mr-2" /> : <FaCheck className="mr-2" />}
            {feedback.message}
          </div>
        )}

        {/* --- Create/Update Store Form --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaPlus className="text-indigo-600 mr-2" />
            {editingId ? "Mettre à jour le magasin" : "Nouveau magasin"}
          </h2>
          <form onSubmit={handleCreateOrUpdateStore} className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 w-full">
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">Nom du magasin</label>
              <input
                id="storeName"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Magasin A"
              />
            </div>
            <button
              type="submit"
              disabled={isFormLoading || !name.trim()}
              className="w-full md:w-auto bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {isFormLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
              {editingId ? "Mettre à jour" : "Ajouter"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                className="w-full md:w-auto bg-gray-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-600 transition"
              >
                Annuler
              </button>
            )}
          </form>
        </div>

        {/* --- Store List Table --- */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaStore className="text-2xl text-indigo-600" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                Liste des magasins ({stores.length})
              </h2>
              <p className="text-sm text-gray-500">
                Sélectionnez un ou plusieurs magasins pour effectuer des actions.
              </p>
            </div>
          </div>

          {/* Selection Actions Bar */}
          {selectedStores.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100 p-4 rounded-lg mb-4 space-y-2 md:space-y-0">
              <span className="text-gray-700 font-medium">
                {selectedStores.length} magasin(s) sélectionné(s)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditSelected}
                  disabled={isEditDisabled}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center justify-center ${isEditDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  <FaEdit className="mr-2" />
                  Modifier
                </button>
                <button
                  onClick={handleManageZonesSelected}
                  disabled={isZoneManageDisabled}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center justify-center ${isZoneManageDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <FaMapMarkerAlt className="mr-2" />
                  Gérer les zones
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-10">
              <FaSpinner className="animate-spin text-indigo-600 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">Chargement des magasins...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Aucun magasin n'est encore enregistré.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedStores.length === stores.length && stores.length > 0}
                        className="h-4 w-4 text-indigo-600 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Zones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stores.map(store => (
                    <tr
                      key={store.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedStores.includes(store.id) ? 'bg-indigo-50' : ''}`}
                      onClick={() => handleSelectStore(store.id)}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(store.id)}
                          onChange={() => handleSelectStore(store.id)}
                          onClick={e => e.stopPropagation()}
                          className="h-4 w-4 text-indigo-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-2 max-w-sm">
                          {store.zone.slice(0, 3).map((z, idx) => (
                            <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">{z}</span>
                          ))}
                          {store.zone.length > 3 && (
                            <span className="text-gray-500 text-xs font-medium px-2 py-1 rounded-full">...</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* --- Zone Management Modal --- */}
      {isZoneModalOpen && currentStoreForZones && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4 z-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Gérer les zones pour <span className="text-indigo-600">{currentStoreForZones.name}</span>
              </h3>
              <button onClick={() => setIsZoneModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Zones actuelles</h4>
                <div className="flex flex-wrap gap-2">
                  {currentStoreForZones.zone.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucune zone pour ce magasin.</p>
                  ) : (
                    currentStoreForZones.zone.map((zone, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                        {zone}
                        <button onClick={() => handleRemoveZone(zone)} className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors"><FaTimes /></button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleAddZone}>
                <h4 className="font-medium text-gray-700 mb-2">Ajouter une nouvelle zone</h4>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newZoneInput}
                    onChange={e => setNewZoneInput(e.target.value)}
                    placeholder="Entrez le nom de la nouvelle zone"
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <button type="submit" className="bg-indigo-600 text-white p-3 rounded-r-lg hover:bg-indigo-700 transition-colors">
                    <FaPlus />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresPage;