import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";

interface Store {
    id: number;
    code: string;
    name: string;
    zone: string[]; // La zone est maintenant un tableau de chaînes de caractères
}

interface EditStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (store: Store) => void;
    storeToEdit: Store | null;
}

const availableZones = [
    "North Zone",
    "South Zone",
    "East Zone",
    "West Zone",
    "Central Zone",
];

const EditStoreModal: React.FC<EditStoreModalProps> = ({ isOpen, onClose, onSave, storeToEdit }) => {
    const [formData, setFormData] = useState<Omit<Store, 'id'>>({ code: "", name: "", zone: [] });

    useEffect(() => {
        if (storeToEdit) {
            setFormData({
                code: storeToEdit.code,
                name: storeToEdit.name,
                zone: storeToEdit.zone,
            });
        }
    }, [storeToEdit]);

    const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData({ ...formData, zone: selectedOptions });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeToEdit) return;
        onSave({
            ...storeToEdit,
            ...formData,
        });
        onClose();
    };

    if (!isOpen || !storeToEdit) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-10">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">Edit Store</h3>
                    <p className="text-gray-600 mt-1">Modify the details of the selected store.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone(s)</label>
                        <select
                            multiple
                            required
                            value={formData.zone}
                            onChange={handleZoneChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                        >
                            {availableZones.map((zone) => (
                                <option key={zone} value={zone}>
                                    {zone}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple zones.</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaEdit className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStoreModal;