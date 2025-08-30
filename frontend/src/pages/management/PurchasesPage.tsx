import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AddPurchaseModal from "../../components/purchasecompo/AddPurchaseModal";
import ReceptionModal from "../../components/purchasecompo/ReceptionModal";

import {
  FaFilter,
  FaSortUp,
  FaSortDown,

  FaFilePdf,
} from "react-icons/fa";

interface Item {
  id: number;
  name: string;
}
interface Store {
  id: number;
  name: string;
}
interface Purchase {
  id: number;
  supplier_name: string;
  total_amount: number;
  date: string;
  receipt_url?: string;
  items?: any[];
}

interface SortOptions {
  key: keyof Purchase | null;
  direction: "asc" | "desc";
}

interface FilterOptions {
  status: "all" | "completed" | "pending";
  dateRange: {
    from: string | null;
    to: string | null;
  };
}

export default function PurchasesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchases, setSelectedPurchases] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceptionModal, setShowReceptionModal] = useState<Purchase | null>(
    null
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  // J'ai renommé et changé le type pour mieux gérer les états de chargement
  const [uploadingReceipt, setUploadingReceipt] = useState<{
    [key: number]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    key: "date",
    direction: "desc",
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "all",
    dateRange: { from: "", to: "" },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [itemsRes, storesRes, purchasesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/items"),
        axios.get("http://localhost:5000/api/stores"),
        axios.get("http://localhost:5000/api/purchases"),
      ]);
      setItems(itemsRes.data);
      setStores(storesRes.data);
      setPurchases(purchasesRes.data);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Impossible de charger les données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAndSortedPurchases = useMemo(() => {
    let filtered = purchases;
    if (searchTerm) {
      filtered = filtered.filter(
        (purchase) =>
          purchase.supplier_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          purchase.id.toString().includes(searchTerm)
      );
    }
    if (filterOptions.status === "completed") {
      filtered = filtered.filter((p) => p.receipt_url);
    } else if (filterOptions.status === "pending") {
      filtered = filtered.filter((p) => !p.receipt_url);
    }
    if (filterOptions.dateRange.from) {
      const fromDate = new Date(filterOptions.dateRange.from).getTime();
      filtered = filtered.filter((p) => new Date(p.date).getTime() >= fromDate);
    }
    if (filterOptions.dateRange.to) {
      const toDate = new Date(filterOptions.dateRange.to).getTime();
      filtered = filtered.filter((p) => new Date(p.date).getTime() <= toDate);
    }

    if (sortOptions.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortOptions.key!];
        const bValue = b[sortOptions.key!];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (aValue < bValue) return sortOptions.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOptions.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [purchases, searchTerm, sortOptions, filterOptions]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedPurchases.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(
    filteredAndSortedPurchases.length / itemsPerPage
  );

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedPurchases([]);
  };

  const toggleSelect = (id: number) => {
    setSelectedPurchases((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentItemsIds = currentItems.map((p) => p.id);
    const allSelectedOnPage =
      selectedPurchases.length === currentItemsIds.length &&
      currentItemsIds.every((id) => selectedPurchases.includes(id));

    if (allSelectedOnPage) {
      setSelectedPurchases((prev) =>
        prev.filter((id) => !currentItemsIds.includes(id))
      );
    } else {
      setSelectedPurchases((prev) => {
        const newSelection = new Set(prev);
        currentItemsIds.forEach((id) => newSelection.add(id));
        return Array.from(newSelection);
      });
    }
  };

  const handleSort = (key: keyof Purchase) => {
    setSortOptions((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "status") {
      setFilterOptions((prev) => ({ ...prev, status: value as any }));
    } else {
      setFilterOptions((prev) => ({
        ...prev,
        dateRange: { ...prev.dateRange, [name]: value },
      }));
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterOptions({
      status: "all",
      dateRange: { from: "", to: "" },
    });
    setSortOptions({ key: "date", direction: "desc" });
    setCurrentPage(1);
  };

  const handleDownloadPDF = () => {
    selectedPurchases.forEach((id) => {
      window.open(`http://localhost:5000/api/purchases/${id}/pdf`, "_blank");
    });
  };

  const handleReception = () => {
    if (selectedPurchases.length === 1) {
      const p = purchases.find((p) => p.id === selectedPurchases[0]);
      if (p) setShowReceptionModal(p);
    } else {
      setError("Veuillez sélectionner un seul achat pour la réception.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // NOUVELLE FONCTION pour l'upload automatique d'un seul reçu
  const handleUploadReceiptForPurchase = async (
    purchaseId: number,
    file: File
  ) => {
    setUploadingReceipt((prev) => ({ ...prev, [purchaseId]: true }));
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.put(
        `http://localhost:5000/api/purchases/${purchaseId}/receipt`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setSuccessMessage("Reçu téléversé avec succès !");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData(); // Rafraîchit les données pour afficher le lien du reçu
    } catch (err) {
      console.error("Erreur upload reçu :", err);
      setError("Erreur lors de l'upload du reçu.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploadingReceipt((prev) => ({ ...prev, [purchaseId]: false }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Chargement des achats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Achats
          </h1>
          <p className="text-gray-600">Gérez vos achats et suivez les réceptions</p>
        </div>
        <button
          className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          <span className="mr-2">+</span> Créer un achat
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-center">
          <span className="text-red-700 mr-2">⚠️</span>
          <span className="text-red-700 flex-grow">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md flex items-center">
          <span className="text-green-700 mr-2">✓</span>
          <span className="text-green-700 flex-grow">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Rechercher par fournisseur ou ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaFilter />
              Filtres
            </button>
            <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full self-center">
              {filteredAndSortedPurchases.length} achats
            </span>
            {selectedPurchases.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full self-center">
                {selectedPurchases.length} sélectionnés
              </span>
            )}
          </div>
        </div>

        {selectedPurchases.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="text-blue-800 font-medium mb-2 md:mb-0">
              {selectedPurchases.length} achat(s) sélectionné(s)
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Le bouton de téléversement en masse a été supprimé pour éviter la confusion */}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                onClick={handleDownloadPDF}
              >
                <span className="mr-2">
                  <FaFilePdf />
                </span>{" "}
                Télécharger BC
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                onClick={handleReception}
              >
                <span className="mr-2">📦</span> Réception
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedPurchases.length === currentItems.length &&
                      currentItems.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("id")}
                >
                  ID
                  {sortOptions.key === "id" &&
                    (sortOptions.direction === "asc" ? (
                      <FaSortUp className="inline ml-1" />
                    ) : (
                      <FaSortDown className="inline ml-1" />
                    ))}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("supplier_name")}
                >
                  Fournisseur
                  {sortOptions.key === "supplier_name" &&
                    (sortOptions.direction === "asc" ? (
                      <FaSortUp className="inline ml-1" />
                    ) : (
                      <FaSortDown className="inline ml-1" />
                    ))}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("total_amount")}
                >
                  Montant
                  {sortOptions.key === "total_amount" &&
                    (sortOptions.direction === "asc" ? (
                      <FaSortUp className="inline ml-1" />
                    ) : (
                      <FaSortDown className="inline ml-1" />
                    ))}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("date")}
                >
                  Date
                  {sortOptions.key === "date" &&
                    (sortOptions.direction === "asc" ? (
                      <FaSortUp className="inline ml-1" />
                    ) : (
                      <FaSortDown className="inline ml-1" />
                    ))}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reçu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((p) => (
                  <tr
                    key={p.id}
                    className={
                      selectedPurchases.includes(p.id)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPurchases.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                        #{p.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {p.supplier_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(p.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>
                    {/* Le code de la cellule "Reçu" a été modifié ici */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.receipt_url ? (
                        <a
                          href={`http://localhost:5000${p.receipt_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <span className="mr-1">📄</span> Voir le reçu
                        </a>
                      ) : (
                        <label className="flex items-center cursor-pointer text-gray-600">
                          {uploadingReceipt[p.id] ? (
                            <span className="animate-spin h-5 w-5 border-t-2 border-green-500 rounded-full mr-2"></span>
                          ) : (
                            <>
                              <span className="mr-1">📁</span> Choisir un fichier
                            </>
                          )}
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files ? e.target.files[0] : null;
                              if (file) {
                                handleUploadReceiptForPurchase(p.id, file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          p.receipt_url
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {p.receipt_url ? "Complété" : "En attente"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <span className="text-3xl mb-2">📋</span>
                      {searchTerm
                        ? "Aucun achat ne correspond à votre recherche"
                        : "Aucun achat enregistré"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAndSortedPurchases.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            <div className="flex items-center">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-4 py-2 text-sm font-medium ${
                      page === currentPage
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPurchaseModal
          items={items}
          stores={stores}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            fetchData();
            setSuccessMessage("Achat créé avec succès !");
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}

      {showReceptionModal && (
        <ReceptionModal
          purchase={showReceptionModal}
          onClose={() => setShowReceptionModal(null)}
          onReceived={() => {
            fetchData();
            setSuccessMessage("Réception enregistrée avec succès !");
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 bg-white w-96 max-w-full m-4 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Filtres & Tri
            </h2>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowFilterModal(false)}
            >
              <span className="text-xl">×</span>
            </button>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Statut
              </label>
              <select
                name="status"
                value={filterOptions.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="all">Tous</option>
                <option value="completed">Complétés</option>
                <option value="pending">En attente</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Période de date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="from"
                  value={filterOptions.dateRange.from || ""}
                  onChange={handleFilterChange}
                  className="w-1/2 border border-gray-300 rounded-lg p-2"
                />
                <input
                  type="date"
                  name="to"
                  value={filterOptions.dateRange.to || ""}
                  onChange={handleFilterChange}
                  className="w-1/2 border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Trier par
              </label>
              <select
                value={sortOptions.key || ""}
                onChange={(e) => handleSort(e.target.value as keyof Purchase)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="id">ID</option>
                <option value="date">Date</option>
                <option value="total_amount">Montant Total</option>
                <option value="supplier_name">Fournisseur</option>
              </select>
              <div className="mt-2 flex gap-4">
                <button
                  onClick={() =>
                    setSortOptions((prev) => ({ ...prev, direction: "asc" }))
                  }
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                    sortOptions.direction === "asc"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaSortUp /> Croissant
                </button>
                <button
                  onClick={() =>
                    setSortOptions((prev) => ({ ...prev, direction: "desc" }))
                  }
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                    sortOptions.direction === "desc"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaSortDown /> Décroissant
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={clearFilters}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}