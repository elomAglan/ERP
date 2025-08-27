import React, { useState, useEffect, useCallback, useMemo } from "react";
import AddItemModal from "../../components/itemcompo/AddItemModal";
import EditItemModal from "../../components/itemcompo/EditItemModal";
import { FaEdit, FaTrash, FaSpinner, FaSortUp, FaSortDown, FaSort, FaSearch, FaPlus, FaFilter } from "react-icons/fa";

interface Item {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  // This line was changed to make salePrice a required number type
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
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchItems = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch items");
      const data: Item[] = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Changed the type of newItemData to match the component's expectations
  const handleAddItem = useCallback(async (newItemData: Omit<Item, "id">): Promise<Item> => {
    setIsLoading(true);
    setError(null);
    try {
      // Ensure salePrice is a number before sending
      const dataToSend = {
        ...newItemData,
        salePrice: newItemData.salePrice ?? 0 // Provide a default value
      };
      
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.status === 409) {
        const data = await res.json();
        setError(data.error || "An identical item already exists.");
        throw new Error(data.error || "Duplicate item");
      }

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);

      const serverItem = await res.json();
      const addedItem: Item = {
        id: serverItem.id ?? Date.now(),
        name: serverItem.name,
        category: serverItem.category,
        purchasePrice: Number(serverItem.purchasePrice),
        // Ensure salePrice is always a number
        salePrice: serverItem.salePrice != null ? Number(serverItem.salePrice) : 0,
      };

      await fetchItems();
      return addedItem;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems]);

  const handleEditItem = useCallback(async (updatedItem: Omit<Item, 'salePrice'> & { salePrice?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Ensure salePrice is a number before sending
      const dataToSend = {
        ...updatedItem,
        salePrice: updatedItem.salePrice ?? 0 // Provide a default value
      };

      const res = await fetch(`${API_URL}/${updatedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();
      if (res.status === 409) {
        throw new Error(data.error || "Another identical item already exists.");
      }

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.statusText}`);
      }

      await fetchItems();
      setItemToEdit(null);
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems]);

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedItems.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) return;

    setIsLoading(true);
    setError(null);
    try {
      await Promise.all(selectedItems.map(id => fetch(`${API_URL}/${id}`, { method: "DELETE" })));
      await fetchItems();
      setSelectedItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete items");
    } finally {
      setIsLoading(false);
    }
  }, [selectedItems, fetchItems]);

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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen relative font-sans">
      {isRefreshing && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50" role="status" aria-label="Loading items">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <FaSpinner className="animate-spin text-blue-600 text-3xl mb-2" />
            <p className="text-gray-700">Loading items...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Item Management</h1>
          <p className="text-gray-600">Add, edit, and manage your inventory.</p>
        </div>

        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg flex justify-between items-center"
            role="alert"
          >
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
              aria-label="Close alert"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-2/3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
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
                  className="pl-10 pr-8 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
                  aria-label="Filter by category"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "All categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full justify-end mb-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              aria-label="Add new item"
            >
              <FaPlus className="mr-1" /> New Item
            </button>
              
            {selectedItems.length > 0 && (
              <>
                <button
                  onClick={() => {
                    const itemToEditId = selectedItems[0];
                    const item = items.find(i => i.id === itemToEditId);
                    if (item) {
                      // Correctly handle the potential null value from the server
                      // by providing a default of 0 before setting the state.
                      const itemForModal = { ...item, salePrice: item.salePrice ?? 0 };
                      setItemToEdit(itemForModal);
                      setIsEditModalOpen(true);
                    }
                  }}
                  className="flex items-center text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-50"
                  disabled={selectedItems.length !== 1}
                  aria-label="Edit selected item"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center text-sm bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:opacity-50"
                  aria-label={`Delete ${selectedItems.length} selected item(s)`}
                >
                  <FaTrash className="mr-1" /> Delete ({selectedItems.length})
                </button>
              </>
            )}
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-4" role="status" aria-label="Processing">
              <FaSpinner className="animate-spin text-blue-600 text-xl mr-2" />
              <span>Processing...</span>
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full">
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
                  <th
                    className="p-3 text-left cursor-pointer hover:bg-gray-100 transition"
                    onClick={() =>
                      setSortConfig({
                        key: "name",
                        direction: sortConfig?.key === "name" && sortConfig.direction === "ascending" ? "descending" : "ascending",
                      })
                    }
                    aria-sort={sortConfig?.key === "name" ? sortConfig.direction : "none"}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {renderSortIcon("name")}
                    </div>
                  </th>
                  <th
                    className="p-3 text-left cursor-pointer hover:bg-gray-100 transition"
                    onClick={() =>
                      setSortConfig({
                        key: "category",
                        direction: sortConfig?.key === "category" && sortConfig.direction === "ascending" ? "descending" : "ascending",
                      })
                    }
                    aria-sort={sortConfig?.key === "category" ? sortConfig.direction : "none"}
                  >
                    <div className="flex items-center">
                      <span>Category</span>
                      {renderSortIcon("category")}
                    </div>
                  </th>
                  <th
                    className="p-3 text-left cursor-pointer hover:bg-gray-100 transition"
                    onClick={() =>
                      setSortConfig({
                        key: "purchasePrice",
                        direction: sortConfig?.key === "purchasePrice" && sortConfig.direction === "ascending" ? "descending" : "ascending",
                      })
                    }
                    aria-sort={sortConfig?.key === "purchasePrice" ? sortConfig.direction : "none"}
                  >
                    <div className="flex items-center">
                      <span>Purchase Price (CFA)</span>
                      {renderSortIcon("purchasePrice")}
                    </div>
                  </th>
                  <th
                    className="p-3 text-left cursor-pointer hover:bg-gray-100 transition"
                    onClick={() =>
                      setSortConfig({
                        key: "salePrice",
                        direction: sortConfig?.key === "salePrice" && sortConfig.direction === "ascending" ? "descending" : "ascending",
                      })
                    }
                    aria-sort={sortConfig?.key === "salePrice" ? sortConfig.direction : "none"}
                  >
                    <div className="flex items-center">
                      <span>Sale Price (CFA)</span>
                      {renderSortIcon("salePrice")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"></path>
                        </svg>
                        <p className="text-lg font-medium mb-1">No items found</p>
                        <p className="text-gray-500">Try changing your search criteria or add a new item.</p>
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
                      {/* Check for null or undefined before rendering */}
                      <td className="p-3 text-sm">{item.salePrice != null ? `${item.salePrice.toFixed(2)}` : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredItems.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              {filteredItems.length} item(s) found
              {selectedItems.length > 0 && ` | ${selectedItems.length} selected`}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddItem} />
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditItem}
        itemToEdit={itemToEdit}
      />
    </div>
  );
};

export default ItemsPage;
