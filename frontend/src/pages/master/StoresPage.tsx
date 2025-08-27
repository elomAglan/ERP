// StoresPage.tsx
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/stores`);
      if (!res.ok) throw new Error("Failed to load stores.");
      const data: Store[] = await res.json();
      setStores(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const showFeedback = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const clearForm = () => {
    setName("");
    setEditingId(null);
  };

  const handleCreateOrUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);
    setError(null);

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
      if (!res.ok) throw new Error(data.error || "Error saving the store.");

      clearForm();
      fetchStores();
      showFeedback(`Store ${editingId ? "updated" : "added"} successfully!`);
    } catch (err: any) {
      showFeedback(err.message, true);
    } finally {
      setIsFormLoading(false);
    }
  };

  // --- Selection and bulk action handlers ---
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

  const handleDeleteSelected = async () => {
    if (selectedStores.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedStores.length} selected store(s)?`)) return;

    setIsFormLoading(true);
    try {
      await Promise.all(selectedStores.map(id => 
        fetch(`${API_URL}/api/stores/${id}`, { method: "DELETE" })
      ));
      setSelectedStores([]);
      fetchStores();
      showFeedback(`${selectedStores.length} store(s) deleted successfully!`);
    } catch (err: any) {
      showFeedback("Error during deletion.", true);
    } finally {
      setIsFormLoading(false);
    }
  };
  
  const isEditDisabled = selectedStores.length !== 1;
  const isZoneManageDisabled = selectedStores.length !== 1;
  const isDeleteDisabled = selectedStores.length === 0;
  
  // --- Zone modal handlers ---
  const handleOpenZoneModal = (store: Store) => {
    setCurrentStoreForZones(store);
    setIsZoneModalOpen(true);
  };

  const handleAddZone = async () => {
    if (!currentStoreForZones || !newZoneInput.trim()) return;
    const zoneToAdd = newZoneInput.trim();

    try {
      const store = currentStoreForZones;
      if (store.zone.includes(zoneToAdd)) {
        showFeedback("This zone already exists.", true);
        return;
      }

      const updatedZones = [...store.zone, zoneToAdd];
      const res = await fetch(`${API_URL}/api/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...store, zone: updatedZones }),
      });
      if (!res.ok) throw new Error("Error adding the zone.");
      
      fetchStores();
      setNewZoneInput("");
      setCurrentStoreForZones({...store, zone: updatedZones});
      showFeedback("Zone added successfully!");
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
      if (!res.ok) throw new Error("Error deleting the zone.");
      
      fetchStores();
      setCurrentStoreForZones({...store, zone: updatedZones});
      showFeedback("Zone deleted successfully!");
    } catch (err: any) {
      showFeedback(err.message, true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Store Management</h1>
          <p className="text-gray-500 mt-2">Create, modify, and manage the service zones for your points of sale.</p>
        </div>
        
        {/* Feedback Messages */}
        {successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 transition-transform duration-500 animate-fade-in-up">
            <FaCheck className="inline mr-2" /> {successMessage}
          </div>
        )}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 transition-transform duration-500 animate-fade-in-up">
            <FaTimes className="inline mr-2" /> {error}
          </div>
        )}

        {/* --- Create Store Form --- */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaPlus className="text-indigo-600 mr-2" />
            New Store
          </h2>
          <form onSubmit={handleCreateOrUpdateStore} className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 w-full">
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                id="storeName"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: Store A"
              />
            </div>
            <button
              type="submit"
              disabled={isFormLoading}
              className="w-full md:w-auto bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
            >
              {isFormLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                className="w-full md:w-auto bg-gray-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* --- Store List Table --- */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-2 mb-2">
            <FaStore className="text-2xl text-indigo-600" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                List of Stores ({stores.length})
              </h2>
              <p className="text-sm text-gray-500">
                Select one or more stores to perform actions.
              </p>
            </div>
          </div>

          {/* Selection Actions Bar */}
          {selectedStores.length > 0 && (
            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-4">
              <span className="text-gray-700 font-medium">
                {selectedStores.length} store(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditSelected}
                  disabled={isEditDisabled}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center ${isEditDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                  <FaEdit className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleManageZonesSelected}
                  disabled={isZoneManageDisabled}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center ${isZoneManageDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <FaMapMarkerAlt className="mr-2" />
                  Manage Zones
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleteDisabled}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center ${isDeleteDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  <FaTrash className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="text-center py-10">
              <FaSpinner className="animate-spin text-indigo-600 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">Loading stores...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No stores registered yet.</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
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
                Manage Zones for <span className="text-indigo-600">{currentStoreForZones.name}</span>
              </h3>
              <button onClick={() => setIsZoneModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Current Zones</h4>
                <div className="flex flex-wrap gap-2">
                  {currentStoreForZones.zone.map((zone, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                      {zone}
                      <button onClick={() => handleRemoveZone(zone)} className="ml-2 text-indigo-500 hover:text-indigo-700"><FaTimes /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Add New Zone</h4>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newZoneInput}
                    onChange={e => setNewZoneInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddZone()}
                    placeholder="Enter the new zone"
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button onClick={handleAddZone} className="bg-indigo-600 text-white p-3 rounded-r-lg hover:bg-indigo-700">
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresPage;