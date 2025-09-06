import React, { useState, useEffect, useMemo, type ChangeEvent } from "react";
import axios from "axios";
import {
  FaPlus,
  FaFilePdf,
  FaSpinner,
  FaDollarSign,
  FaCheck,
  FaTimes,
  FaUndo,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// Interface definitions...
interface Store {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
}

interface SaleItem {
  id?: number;
  product_id: number;
  store_id: number;
  quantity: number;
  unit_price: number;
}

interface Sale {
  id: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  total_amount: number;
  date: string;
  items?: SaleItem[];
}

interface NewSale {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: SaleItem[];
}

const API_SALES = "http://localhost:5000/api/sales";
const API_ITEMS = "http://localhost:5000/api/items";
const API_STORES = "http://localhost:5000/api/stores";
const SALES_PER_PAGE = 10;

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [itemsList, setItemsList] = useState<Item[]>([]);
  const [storesList, setStoresList] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [addSaleModalOpen, setAddSaleModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [newSale, setNewSale] = useState<NewSale>({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    items: [{ product_id: 0, store_id: 0, quantity: 1, unit_price: 0 }],
  });

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnSaleId, setReturnSaleId] = useState<number | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<
    Record<number, number>
  >({});

  const showFeedback = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(message);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 5000); // 5 seconds
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [salesRes, itemsRes, storesRes] = await Promise.all([
        axios.get(API_SALES),
        axios.get(API_ITEMS),
        axios.get(API_STORES),
      ]);
      setSales(salesRes.data);
      setItemsList(itemsRes.data);
      setStoresList(storesRes.data);
      setCurrentPage(1); // Reset to first page on data refresh
      setSelectedSaleId(null);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      showFeedback("Impossible de charger les données. Veuillez réessayer.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof SaleItem,
    value: string | number
  ) => {
    const newItems = [...newSale.items];
    if (["quantity", "unit_price", "store_id", "product_id"].includes(field)) {
      newItems[index][field] = Number(value);
    }
    setNewSale({ ...newSale, items: newItems });
  };

  const addItem = () =>
    setNewSale({
      ...newSale,
      items: [
        ...newSale.items,
        { product_id: 0, store_id: 0, quantity: 1, unit_price: 0 },
      ],
    });

  const calculateTotal = useMemo(() => {
    return newSale.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  }, [newSale.items]);

  const handleCreateSale = async () => {
    try {
      const res = await axios.post(API_SALES, newSale);
      if (res.status === 201) {
        showFeedback("Vente créée avec succès !");
        setNewSale({
          customer_name: "",
          customer_phone: "",
          customer_address: "",
          items: [{ product_id: 0, store_id: 0, quantity: 1, unit_price: 0 }],
        });
        fetchData();
        setAddSaleModalOpen(false);
      }
    } catch (err: any) {
      console.error(err);
      showFeedback(
        err.response?.data?.error || "Erreur lors de la création de la vente.",
        true
      );
    }
  };

  const handleSelectSale = (id: number) => {
    setSelectedSaleId(selectedSaleId === id ? null : id);
  };

  const handleDownloadReceipt = (id: number) => {
    window.open(`${API_SALES}/${id}/receipt`, "_blank");
    showFeedback("Téléchargement du reçu initié.");
  };

  const handleReturnAction = (id: number) => {
    openReturnModal(id);
  };

  const openReturnModal = (saleId: number) => {
    setReturnSaleId(saleId);
    setReturnQuantities({});
    setReturnModalOpen(true);
  };

  const handleReturnSubmit = async () => {
    if (!returnSaleId) return;
    const returns = Object.entries(returnQuantities)
      .map(([itemId, quantity]) => ({
        item_id: Number(itemId),
        quantity: quantity,
      }))
      .filter((r) => r.quantity > 0);

    if (returns.length === 0) {
      showFeedback("Aucune quantité renseignée pour retour !", true);
      return;
    }

    try {
      const res = await axios.post(
        `${API_SALES}/${returnSaleId}/return`,
        { returns }
      );
      if (res.status === 200) {
        showFeedback("Retour(s) enregistré(s) !");
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      showFeedback(
        err.response?.data?.error || "Erreur lors de l'enregistrement du retour.",
        true
      );
    }

    setReturnModalOpen(false);
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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedSaleId(null);
  };

  const totalPages = Math.ceil(sales.length / SALES_PER_PAGE);
  const displayedSales = sales.slice(
    (currentPage - 1) * SALES_PER_PAGE,
    currentPage * SALES_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center py-12 bg-white rounded-xl shadow-sm w-80">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-3" />
          <p className="text-gray-600">Chargement des ventes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
            <FaDollarSign className="mr-3 text-indigo-600" /> Gestion des Ventes
          </h1>
          <button
            onClick={() => setAddSaleModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
          >
            <FaPlus className="mr-2" /> Ajouter une vente
          </button>
        </div>

        {error && (
          <div className="fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center animate-fade-in bg-red-500">
            <FaTimes className="mr-2" />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center animate-fade-in bg-green-500">
            <FaCheck className="mr-2" />
            {successMessage}
          </div>
        )}

        {selectedSaleId !== null && (
          <div className="bg-white p-4 rounded-xl shadow-sm mb-4 flex flex-wrap gap-2 items-center justify-center">
            <span className="font-semibold text-gray-700">
              Actions pour la vente sélectionnée #{selectedSaleId}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownloadReceipt(selectedSaleId)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
              >
                <FaFilePdf className="mr-2" /> Télécharger Reçu
              </button>
              <button
                onClick={() => handleReturnAction(selectedSaleId)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
              >
                <FaUndo className="mr-2" /> Effectuer un retour
              </button>
            </div>
          </div>
        )}

        {/* ---- LISTE DES VENTES ---- */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaDollarSign className="mr-2 text-indigo-600" /> Liste des Ventes
          </h2>

          {sales.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedSales.map((sale) => (
                      <tr
                        key={sale.id}
                        className={`hover:bg-gray-50 ${
                          selectedSaleId === sale.id ? "bg-indigo-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded-sm"
                            checked={selectedSaleId === sale.id}
                            onChange={() => handleSelectSale(sale.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                            #{sale.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {sale.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {sale.customer_phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {formatCurrency(sale.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {formatDate(sale.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        currentPage === index + 1
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-500 py-12">
              <FaDollarSign className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Aucune vente n'est enregistrée pour le moment.
              </h3>
            </div>
          )}
        </div>
      </div>

      {addSaleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl transform transition-transform scale-100">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaPlus className="mr-2 text-green-600" /> Nouvelle Vente
              </h3>
              <button
                onClick={() => setAddSaleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nom du client"
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSale.customer_name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewSale({ ...newSale, customer_name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Téléphone du client"
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSale.customer_phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewSale({ ...newSale, customer_phone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Adresse du client"
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={newSale.customer_address}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewSale({ ...newSale, customer_address: e.target.value })
                }
              />
            </div>

            <div className="space-y-4 mb-4">
              {newSale.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row gap-2 items-start md:items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Produit
                    </label>
                    <select
                      value={item.product_id}
                      onChange={(e) =>
                        handleItemChange(idx, "product_id", Number(e.target.value))
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={0}>Sélectionnez un produit</option>
                      {itemsList.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Magasin
                    </label>
                    <select
                      value={item.store_id}
                      onChange={(e) =>
                        handleItemChange(idx, "store_id", Number(e.target.value))
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={0}>Sélectionnez un magasin</option>
                      {storesList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      placeholder="Qté"
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, "quantity", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Prix Unitaire
                    </label>
                    <input
                      type="number"
                      placeholder="Prix unitaire"
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleItemChange(idx, "unit_price", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={addItem}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
              >
                <FaPlus className="mr-2" /> Ajouter un article
              </button>
              <p className="text-xl font-bold text-gray-800">
                Total: {formatCurrency(calculateTotal)}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setAddSaleModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateSale}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
              >
                Créer Vente
              </button>
            </div>
          </div>
        </div>
      )}

      {returnModalOpen && returnSaleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl transform transition-transform scale-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Retour Articles - Vente #{returnSaleId}
            </h3>
            {sales.find((s) => s.id === returnSaleId)?.items?.length === 0 ? (
              <p className="text-gray-500">
                Aucun article n'a été trouvé pour cette vente.
              </p>
            ) : (
              sales.find((s) => s.id === returnSaleId)?.items?.map((item) => {
                const productName =
                  itemsList.find((i) => i.id === item.product_id)?.name ||
                  "Produit inconnu";
                const storeName =
                  storesList.find((s) => s.id === item.store_id)?.name ||
                  "Magasin inconnu";
                const quantityReturned = returnQuantities[item.id!] || 0;
                const lineTotal = (item.quantity * item.unit_price).toFixed(2);

                return (
                  <div
                    key={item.id}
                    className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-gray-900">
                        {productName}
                      </p>
                      <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {storeName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Qté vendue: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-700">
                      Prix unitaire: {formatCurrency(item.unit_price)}
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      Total ligne: {formatCurrency(Number(lineTotal))}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <label
                        htmlFor={`return-qty-${item.id}`}
                        className="text-sm text-gray-700 font-medium"
                      >
                        Quantité à retourner:
                      </label>
                      <input
                        id={`return-qty-${item.id}`}
                        type="number"
                        min={0}
                        max={item.quantity}
                        className="border border-gray-300 rounded-lg p-2 w-20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={quantityReturned}
                        onChange={(e) =>
                          setReturnQuantities((prev) => ({
                            ...prev,
                            [item.id!]: Math.min(
                              Number(e.target.value),
                              item.quantity
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                );
              })
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                onClick={() => setReturnModalOpen(false)}
              >
                Annuler
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                onClick={handleReturnSubmit}
              >
                Valider le retour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;