import { useState, useEffect, useCallback } from "react";

interface Item {
  id: number;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice?: number;
}

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => Promise<void>;
  itemToEdit: Item | null;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [formData, setFormData] = useState<Omit<Item, "id">>({
    name: "",
    category: "",
    purchasePrice: 0,
    salePrice: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});
  const [globalMessage, setGlobalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Function to reset the form and all states
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      category: "",
      purchasePrice: 0,
      salePrice: undefined,
    });
    setFormErrors({});
    setGlobalMessage(null);
  }, []);

  // Handle closing the modal, including state reset
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // Sync form with the item to edit when the modal opens
  useEffect(() => {
    if (itemToEdit && isOpen) {
      setFormData({
        name: itemToEdit.name,
        category: itemToEdit.category,
        purchasePrice: itemToEdit.purchasePrice,
        salePrice: itemToEdit.salePrice,
      });
      // Ensure states are clean when modal opens
      setFormErrors({});
      setGlobalMessage(null);
    }
  }, [itemToEdit, isOpen]);

  // Handle input changes, clearing specific errors
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === "purchasePrice" || name === "salePrice"
          ? (value === "" ? (name === "salePrice" ? undefined : 0) : parseFloat(value))
          : value
      }));

      // Clear the specific error for this input
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: null }));
      }
    },
    [formErrors]
  );

  // Validate all form fields
  const validateForm = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }
    if (!formData.category.trim()) {
      errors.category = "Category is required.";
    }
    const purchasePriceNum = parseFloat(String(formData.purchasePrice));
    if (formData.purchasePrice === 0 || isNaN(purchasePriceNum) || purchasePriceNum < 0) {
      errors.purchasePrice = "A valid purchase price is required.";
    }
    const salePriceNum = formData.salePrice !== undefined ? parseFloat(String(formData.salePrice)) : undefined;
    if (salePriceNum !== undefined && (isNaN(salePriceNum) || salePriceNum < 0)) {
      errors.salePrice = "Sale price must be a valid number.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setGlobalMessage(null);

      if (!validateForm()) {
        setGlobalMessage({ type: "error", text: "Please correct the errors in the form." });
        return;
      }

      if (!itemToEdit) return; // Should not happen, but for safety

      setIsLoading(true);

      try {
        const updatedItem: Item = {
          ...itemToEdit,
          ...formData,
        };

        await onSave(updatedItem);

        setGlobalMessage({ type: "success", text: "Item updated successfully!" });
        // The modal will be closed by the parent component after success.
      } catch (err: any) {
        setGlobalMessage({ type: "error", text: err.message || "Failed to update item." });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, itemToEdit, onSave, validateForm]
  );

  if (!isOpen || !itemToEdit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative transition-all duration-300 transform scale-100">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Edit Item</h3>
        <p className="text-center text-gray-500 mb-6">Update the details for the selected item.</p>

        {globalMessage && (
          <div
            className={`px-4 py-3 rounded-lg mb-4 text-sm font-medium ${
              globalMessage.type === "error" ? "bg-red-100 border border-red-400 text-red-700" : "bg-green-100 border border-green-400 text-green-700"
            }`}
            role="alert"
          >
            {globalMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              aria-describedby="edit-name-error"
            />
            {formErrors.name && (
              <p id="edit-name-error" className="mt-1 text-xs text-red-600">{formErrors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="edit-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
              aria-describedby="edit-category-error"
            >
              <option value="">Select a category</option>
              <option value="Sale">For Sale</option>
              <option value="Active Purchase">Active Purchase</option>
              <option value="Passive Purchase">Passive Purchase</option>
            </select>
            {formErrors.category && (
              <p id="edit-category-error" className="mt-1 text-xs text-red-600">{formErrors.category}</p>
            )}
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purchase Price */}
            <div>
              <label htmlFor="edit-purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-purchasePrice"
                name="purchasePrice"
                type="number"
                step="1"
                value={formData.purchasePrice}
                onChange={handleChange}
                placeholder="e.g., 50000"
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.purchasePrice ? 'border-red-500' : 'border-gray-300'}`}
                aria-describedby="edit-purchasePrice-error"
              />
              {formErrors.purchasePrice && (
                <p id="edit-purchasePrice-error" className="mt-1 text-xs text-red-600">{formErrors.purchasePrice}</p>
              )}
            </div>

            {/* Sale Price */}
            <div>
              <label htmlFor="edit-salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price (FCFA) (Optional)
              </label>
              <input
                id="edit-salePrice"
                name="salePrice"
                type="number"
                step="1"
                value={formData.salePrice ?? ""}
                onChange={handleChange}
                placeholder="e.g., 75000"
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.salePrice ? 'border-red-500' : 'border-gray-300'}`}
                aria-describedby="edit-salePrice-error"
              />
              {formErrors.salePrice && (
                <p id="edit-salePrice-error" className="mt-1 text-xs text-red-600">{formErrors.salePrice}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row-reverse gap-3 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                   Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
