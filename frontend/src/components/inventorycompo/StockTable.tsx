import React, { useState, useEffect } from "react";
import { FaCheckSquare, FaSquare, FaShoppingCart, FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface ProductStock {
  product_id: number;
  name: string;
  current_stock: number;
}

interface StockTableProps {
  stock: ProductStock[];
  selectedProductIds: number[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<number[]>>;
}

const ROWS_PER_PAGE = 10;

const StockTable: React.FC<StockTableProps> = ({ stock, selectedProductIds, setSelectedProductIds }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(stock.length / ROWS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const endIdx = startIdx + ROWS_PER_PAGE;
  const currentProducts = stock.slice(startIdx, endIdx);

  useEffect(() => {
    // Si la sélection de tous les produits est désactivée, mettre à jour l'état de la case "Tout sélectionner"
    // en fonction des produits de la page courante
    const allProductsOnPageSelected = currentProducts.every(p => selectedProductIds.includes(p.product_id));
    setSelectAll(allProductsOnPageSelected);
  }, [selectedProductIds, currentProducts]);

  const handleCheckboxChange = (productId: number) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Désélectionner tous les produits de la page actuelle
      const productIdsToRemove = currentProducts.map(p => p.product_id);
      setSelectedProductIds(prev => prev.filter(id => !productIdsToRemove.includes(id)));
    } else {
      // Sélectionner tous les produits de la page actuelle
      const productIdsToAdd = currentProducts.map(p => p.product_id);
      setSelectedProductIds(prev => [...new Set([...prev, ...productIdsToAdd])]);
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{stock.length} produit(s) trouvé(s)</span>
        {stock.length > 0 && (
          <button onClick={handleSelectAll} className="flex items-center text-sm text-indigo-600 hover:text-indigo-800">
            {selectAll ? <FaCheckSquare className="mr-1 text-indigo-600" /> : <FaSquare className="mr-1 text-gray-400" />}
            {selectAll ? "Tout désélectionner sur cette page" : "Tout sélectionner sur cette page"}
          </button>
        )}
      </div>
      {stock.length === 0 ? (
        <div className="text-center py-12">
          <FaShoppingCart className="text-gray-300 text-4xl mx-auto mb-3" />
          <p className="text-gray-500">Aucun produit ne correspond à votre recherche</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 w-12"></th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">Produit</th>
                  <th className="p-4 text-right text-sm font-medium text-gray-700">Stock Actuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.map((product) => (
                  <tr key={product.product_id} className={`hover:bg-gray-50 transition ${selectedProductIds.includes(product.product_id) ? 'bg-blue-50' : ''}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.product_id)}
                        onChange={() => handleCheckboxChange(product.product_id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="p-4"><div className="text-sm font-medium text-gray-900">{product.name}</div></td>
                    <td className="p-4 text-right"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{product.current_stock} unités</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 flex justify-end items-center space-x-2 bg-gray-50 border-t">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                <FaArrowLeft />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                <FaArrowRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockTable;