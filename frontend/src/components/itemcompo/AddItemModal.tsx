import React, { useState, useCallback } from "react";
// Replaced react-icons with inline SVG to avoid the build error.

// Defines the "Item" object interface.
// "salePrice" is now required, which is crucial for type consistency.
interface Item {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
}

// Defines the required props for the AddItemModal component.
interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<Item, 'id'>) => Promise<Item>;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  // Manages the form state. Values are strings for the inputs.
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    purchasePrice: "",
    salePrice: "",
  });
  // Manages the loading state during form submission.
  const [isLoading, setIsLoading] = useState(false);
  // Manages error messages.
  const [error, setError] = useState<string | null>(null);

  // Uses useCallback to memoize the change handler function,
  // which optimizes performance by preventing unnecessary function recreations.
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handles form submission, with validation and error handling.
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation to ensure required fields are filled.
    if (!formData.name || !formData.category || !formData.purchasePrice) {
      setError("Please fill in all required fields.");
      return;
    }

    // Converts prices to numbers, handling cases where conversion fails.
    const parsedPurchasePrice = parseFloat(formData.purchasePrice);
    const parsedSalePrice = parseFloat(formData.salePrice);

    // Checks if the purchase price is a valid number.
    if (isNaN(parsedPurchasePrice)) {
      setError("The purchase price must be a valid number.");
      return;
    }

    // Creates the new item object for sending.
    // If salePrice is not a number, it defaults to 0.
    const newItemData: Omit<Item, 'id'> = {
      name: formData.name,
      category: formData.category,
      purchasePrice: parsedPurchasePrice,
      salePrice: isNaN(parsedSalePrice) ? 0 : parsedSalePrice,
    };

    setIsLoading(true);

    try {
      // Calls the onAdd prop with the new item data.
      await onAdd(newItemData);
      // Resets the form and closes the modal after a successful addition.
      setFormData({ name: "", category: "", purchasePrice: "", salePrice: "" });
      onClose();
    } catch (err) {
      // Displays error messages if submission fails.
      setError(err instanceof Error ? err.message : "Failed to add item.");
    } finally {
      // Ensures the loading state is turned off, regardless of the outcome.
      setIsLoading(false);
    }
  }, [formData, onAdd, onClose]);

  // If the modal is not open, display nothing.
  if (!isOpen) {
    return null;
  }

  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 fill-current"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
  );

  const SpinnerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 animate-spin fill-current"><path d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48V0h96V48zm100.86 52.86l-20.19 12.3c-14.65-24.01-44.5-35.15-71.18-29.08L289 127.84c-3.15 16.51-14.18 30.58-29.35 38.35L240 178.6c-.66 12.72-2.3 25.32-4.99 37.66l44.3 22.82c16.33-14.99 35.8-25.13 57.07-29.34l12.18-20.3c2.72-4.54 1.34-10.46-3.19-13.19l-44.32-22.82c-15.68-8.11-26.6-22.13-31.56-38.31-2.92-9.69-4.52-19.6-5.02-29.62zM32.55 125.79l22.82 44.32c-2.72 4.54-1.34 10.46 3.19 13.19l44.3 22.82c14.99-16.33 25.13-35.8 29.34-57.07l20.3-12.18c4.54-2.72 10.46-1.34 13.19 3.19l22.82 44.32c8.11 15.68 22.13 26.6 38.31 31.56 9.69 2.92 19.6 4.52 29.62 5.02l44.3 22.82c2.72 4.54 1.34 10.46-3.19 13.19l-22.82 44.32c-8.11 15.68-22.13 26.6-38.31 31.56-9.69 2.92-19.6 4.52-29.62 5.02l-44.3 22.82c-2.72 4.54-10.46 1.34-13.19-3.19l-22.82-44.32c-8.11-15.68-22.13-26.6-38.31-31.56-9.69-2.92-19.6-4.52-29.62-5.02l-44.3-22.82c-2.72-4.54-1.34-10.46 3.19-13.19l22.82-44.32c15.68-8.11 26.6-22.13 31.56-38.31 2.92-9.69 4.52-19.6 5.02-29.62zM256 464c0 26.51-21.49 48-48 48s-48-21.49-48-48V416h96V464zm-144-8.86l20.19-12.3c14.65 24.01 44.5 35.15 71.18 29.08L223 384.16c3.15-16.51 14.18-30.58 29.35-38.35L272 333.4c.66-12.72 2.3-25.32 4.99-37.66l-44.3-22.82c-16.33 14.99-35.8 25.13-57.07 29.34l-12.18 20.3c-2.72 4.54-1.34 10.46 3.19 13.19l44.32 22.82c15.68 8.11 26.6 22.13 31.56 38.31 2.92 9.69 4.52 19.6 5.02 29.62zM489.45 386.21l-22.82-44.32c2.72-4.54 1.34-10.46-3.19-13.19l-44.3-22.82c-14.99 16.33-25.13 35.8-29.34 57.07l-20.3 12.18c-4.54 2.72-10.46 1.34-13.19-3.19l-22.82-44.32c-8.11-15.68-22.13-26.6-38.31-31.56-9.69-2.92-19.6-4.52-29.62-5.02l-44.3-22.82c-2.72-4.54-1.34-10.46 3.19-13.19l22.82 44.32c8.11 15.68 22.13 26.6 38.31 31.56 9.69 2.92 19.6 4.52 29.62 5.02l44.3 22.82c2.72 4.54 1.34 10.46-3.19 13.19z"/></svg>
  );
  
  const TimesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-5 h-5 fill-current"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
  );

  // Renders the modal with Tailwind CSS styles.
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Button to close the modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close modal"
          disabled={isLoading}
        >
          <TimesIcon />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Item</h2>
        
        {/* Displays the error message if an error occurs */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Add item form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input 
            name="name" 
            placeholder="Name *" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
            required
            aria-label="Item name"
          />
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
            aria-label="Item category"
          >
            <option value="">Select a category *</option>
            <option value="Sale">Sale</option>
            <option value="Active Purchase">Active Purchase</option>
            <option value="Passive Purchase">Passive Purchase</option>
          </select>
          <input 
            name="purchasePrice" 
            placeholder="Purchase Price (CFA) *" 
            type="number" 
            step="0.01" 
            value={formData.purchasePrice} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
            aria-label="Purchase price"
          />
          <input 
            name="salePrice" 
            placeholder="Sale Price (CFA) (Optional)" 
            type="number" 
            step="0.01" 
            value={formData.salePrice} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-label="Sale price"
          />

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition disabled:opacity-50" 
              disabled={isLoading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed" 
              disabled={isLoading}
            >
              {isLoading ? <SpinnerIcon /> : <PlusIcon />} 
              {isLoading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
