import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";

interface Zone {
    id: number;
    code: string;
    name: string;
}

interface EditZoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (zone: Zone) => void;
    zoneToEdit: Zone | null;
}

const EditZoneModal: React.FC<EditZoneModalProps> = ({ isOpen, onClose, onSave, zoneToEdit }) => {
    // Le code n'est plus dans le formData car il ne sera pas modifiable
    const [name, setName] = useState("");

    useEffect(() => {
        if (zoneToEdit) {
            setName(zoneToEdit.name);
        }
    }, [zoneToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!zoneToEdit) return;
        onSave({
            ...zoneToEdit,
            name: name,
        });
        onClose();
    };

    if (!isOpen || !zoneToEdit) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-10">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">Edit Zone</h3>
                    <p className="text-gray-600 mt-1">Modify the details of the selected zone.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                        <input
                            type="text"
                            value={zoneToEdit.code}
                            readOnly // Rendre le champ non modifiable
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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

export default EditZoneModal;