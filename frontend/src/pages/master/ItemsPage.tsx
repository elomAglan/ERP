import React, { useState, useEffect, useCallback, useMemo } from "react";
import AddItemModal from "../../components/itemcompo/AddItemModal";
import EditItemModal from "../../components/itemcompo/EditItemModal";
import { FaEdit, FaTrash, FaSpinner, FaSortUp, FaSortDown, FaSort, FaSearch, FaPlus, FaFilter, FaCheck, FaTimes } from "react-icons/fa";

interface Item {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
}

const API_URL = "http://localhost:5000/api/items";
const ITEMS_PER_PAGE = 10;

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Item; direction: "ascending" | "descending" } | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const showFeedback = useCallback((message: string, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(null), 5000);
  }, []);

  const fetchItems = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Échec du chargement des articles");
      const data: Item[] = await res.json();
      setItems(data);
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : "Échec du chargement des articles", true);
    } finally {
      setIsRefreshing(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = useCallback(async (newItemData: Omit<Item, "id">): Promise<Item> => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur du serveur : ${res.statusText}`);

      await fetchItems();
      showFeedback("Article ajouté avec succès !");
      return data;
    } catch (err: any) {
      console.error("Erreur lors de l'ajout de l'article :", err);
      showFeedback(err.message, true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, showFeedback]);

  const handleEditItem = useCallback(async (updatedItem: Omit<Item, 'salePrice'> & { salePrice?: number }) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/${updatedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur du serveur : ${res.statusText}`);

      await fetchItems();
      setItemToEdit(null);
      setIsEditModalOpen(false);
      showFeedback("Article mis à jour avec succès !");
    } catch (err: any) {
      console.error("Erreur lors de la modification de l'article :", err);
      showFeedback(err.message, true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, showFeedback]);

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedItems.length) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.length} article(s) ?`)) return;

    setIsLoading(true);
    const failedDeletions: string[] = [];

    for (const id of selectedItems) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          failedDeletions.push(`ID ${id}: ${data.error || res.statusText}`);
        }
      } catch (err) {
        console.error(`Erreur lors de la suppression de l'article ID ${id}:`, err);
        failedDeletions.push(`ID ${id}: Erreur réseau ou du serveur.`);
      }
    }

    if (failedDeletions.length > 0) {
      showFeedback(`Échec de la suppression de certains articles :\n${failedDeletions.join("\n")}`, true);
    } else {
      await fetchItems();
      setSelectedItems([]);
      showFeedback("Article(s) supprimé(s) avec succès !");
    }
    setIsLoading(false);
  }, [selectedItems, fetchItems, showFeedback]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
    return ["all", ...uniqueCategories];
  }, [items]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null || bVal == null) return 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "ascending" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortConfig.direction === "ascending" ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const filteredItems = useMemo(
    () =>
      sortedItems.filter(
        item =>
          (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterCategory === "all" || item.category === filterCategory)
      ),
    [sortedItems, searchTerm, filterCategory]
  );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredItems, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedItems([]);
  }, []);

  const renderSortIcon = (key: keyof Item) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === "ascending" ? (
        <FaSortUp className="inline-block ml-1" />
      ) : (
        <FaSortDown className="inline-block ml-1" />
      );
    }
    return <FaSort className="inline-block ml-1 text-gray-400" />;
  };

  const isItemSelected = useCallback((itemId: number) => selectedItems.includes(itemId), [selectedItems]);

  const handleToggleSelection = useCallback((itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleToggleAllSelection = useCallback(() => {
    setSelectedItems(
      selectedItems.length === currentItems.length && currentItems.length > 0 ? [] : currentItems.map(item => item.id)
    );
  }, [selectedItems.length, currentItems]);

  const handleRowClick = useCallback((e: React.MouseEvent, itemId: number) => {
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    handleToggleSelection(itemId);
  }, [handleToggleSelection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {isRefreshing && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <FaSpinner className="animate-spin text-blue-600 text-3xl mb-2" />
            <p className="text-gray-700">Chargement des articles...</p>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center animate-fade-in ${feedback.isError ? "bg-red-500" : "bg-green-500"}`}>
          {feedback.isError ? <FaTimes className="mr-2" /> : <FaCheck className="mr-2" />}
          {feedback.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <svg className="w-8 h-8 mr-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"></path></svg>
            Gestion des Articles
          </h1>
          <p className="text-gray-600 mt-2">Ajoutez, modifiez et gérez votre inventaire.</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-2/3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom ou catégorie..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  aria-label="Search for items"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  value={filterCategory}
                  onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition"
                  aria-label="Filter by category"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "Toutes les catégories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full justify-end mb-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              disabled={isLoading}
              aria-label="Add new item"
            >
              <FaPlus className="mr-2" /> Nouvel Article
            </button>

            {selectedItems.length > 0 && (
              <>
                <button
                  onClick={() => {
                    const itemToEditId = selectedItems[0];
                    const item = items.find(i => i.id === itemToEditId);
                    if (item) {
                      setItemToEdit({ ...item, salePrice: item.salePrice ?? 0 });
                      setIsEditModalOpen(true);
                    }
                  }}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-50"
                  disabled={selectedItems.length !== 1 || isLoading}
                  aria-label="Edit selected item"
                >
                  <FaEdit className="mr-2" /> Modifier
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:opacity-50"
                  disabled={isLoading}
                  aria-label={`Delete ${selectedItems.length} selected item(s)`}
                >
                  <FaTrash className="mr-2" /> Supprimer ({selectedItems.length})
                </button>
              </>
            )}
            {isLoading && <FaSpinner className="animate-spin text-blue-600 text-2xl" />}
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                      onChange={handleToggleAllSelection}
                      aria-label="Select all items on current page"
                    />
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:bg-gray-100 transition" onClick={() => setSortConfig({ key: "name", direction: sortConfig?.key === "name" && sortConfig.direction === "ascending" ? "descending" : "ascending" })} aria-sort={sortConfig?.key === "name" ? sortConfig.direction : "none"}>
                    <div className="flex items-center"><span>Nom</span>{renderSortIcon("name")}</div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:bg-gray-100 transition" onClick={() => setSortConfig({ key: "category", direction: sortConfig?.key === "category" && sortConfig.direction === "ascending" ? "descending" : "ascending" })} aria-sort={sortConfig?.key === "category" ? sortConfig.direction : "none"}>
                    <div className="flex items-center"><span>Catégorie</span>{renderSortIcon("category")}</div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:bg-gray-100 transition" onClick={() => setSortConfig({ key: "purchasePrice", direction: sortConfig?.key === "purchasePrice" && sortConfig.direction === "ascending" ? "descending" : "ascending" })} aria-sort={sortConfig?.key === "purchasePrice" ? sortConfig.direction : "none"}>
                    <div className="flex items-center"><span>Prix d'achat (CFA)</span>{renderSortIcon("purchasePrice")}</div>
                  </th>
                  <th className="p-3 text-left cursor-pointer hover:bg-gray-100 transition" onClick={() => setSortConfig({ key: "salePrice", direction: sortConfig?.key === "salePrice" && sortConfig.direction === "ascending" ? "descending" : "ascending" })} aria-sort={sortConfig?.key === "salePrice" ? sortConfig.direction : "none"}>
                    <div className="flex items-center"><span>Prix de vente (CFA)</span>{renderSortIcon("salePrice")}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 && !isLoading && !isRefreshing ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"></path></svg>
                        <p className="text-lg font-medium mb-1">Aucun article trouvé</p>
                        <p className="text-gray-500">Essayez de modifier vos critères de recherche ou ajoutez un nouvel article.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map(item => (
                    <tr
                      key={item.id}
                      className={`border-t border-gray-100 ${isItemSelected(item.id) ? "bg-blue-50" : "hover:bg-gray-50"} transition cursor-pointer`}
                      onClick={(e) => handleRowClick(e, item.id)}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isItemSelected(item.id)}
                          onChange={() => handleToggleSelection(item.id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select item ${item.name}`}
                        />
                      </td>
                      <td className="p-3 font-medium text-sm">{item.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{item.purchasePrice.toFixed(2)}</td>
                      <td className="p-3 text-sm">{item.salePrice != null ? `${item.salePrice.toFixed(2)}` : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredItems.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              {filteredItems.length} article(s) trouvé(s)
              {selectedItems.length > 0 && ` | ${selectedItems.length} sélectionné(s)`}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                Précédent
              </button>
              <span className="px-4 py-2 font-medium text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddItem} isLoading={isLoading} />
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditItem}
        itemToEdit={itemToEdit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ItemsPage;