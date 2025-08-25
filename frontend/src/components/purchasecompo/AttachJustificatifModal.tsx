import { useState } from "react";

// Interface for modal props
interface AttachProofModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAttach: (purchaseId: number, documentName: string) => void;
    purchase: { id: number; item: string } | null; // Simplified props
}

const AttachProofModal: React.FC<AttachProofModalProps> = ({ isOpen, onClose, onAttach, purchase }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (purchase && selectedFile) {
            onAttach(purchase.id, selectedFile.name);
            setSelectedFile(null); // Reset state
            onClose();
        }
    };

    if (!isOpen || !purchase) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Add a proof of purchase</h3>
                <p className="text-gray-600">
                    For: **"{purchase.item}"**
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select the file (invoice/receipt)
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {selectedFile && (
                            <p className="mt-1 text-sm text-gray-500">
                                Selected file: **{selectedFile.name}**
                            </p>
                        )}
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
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={!selectedFile}
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttachProofModal;