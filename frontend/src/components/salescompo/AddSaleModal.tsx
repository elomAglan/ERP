import React, { useState } from "react";

// Interface for new sale data
interface NewSale {
    item: string;
    customer: string;
    date: string;
    amount: number;
    document: string | null;
    warehouse: string; // New: Added warehouse to NewSale interface
}

// Interface for modal props
interface AddSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newSale: NewSale) => void;
}

// List of predefined items with their prices
const itemOptions = [
    { name: 'Accounting Software License', price: 350000 },
    { name: 'IT Consultation', price: 150000 },
    { name: 'Application Development', price: 2500000 },
    { name: 'Server Maintenance', price: 80000 },
    { name: 'User Training', price: 120000 },
];

// List of predefined warehouse options
const warehouseOptions = [
    'Main Warehouse',
    'Remote Office Stock',
    'Cloud Services',
    'Digital Assets',
    'Warehouse B',
];

const AddSaleModal: React.FC<AddSaleModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [item, setItem] = useState("");
    const [customer, setCustomer] = useState("");
    const [date, setDate] = useState("");
    const [amount, setAmount] = useState<number | ''>('');
    const [document, setDocument] = useState<File | null>(null);
    const [warehouse, setWarehouse] = useState(""); // New: State for warehouse selection

    const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        const selectedItem = itemOptions.find(option => option.name === selectedName);
        setItem(selectedName);
        if (selectedItem) {
            setAmount(selectedItem.price);
        } else {
            setAmount('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure all required fields, including warehouse, are filled
        if (item && customer && date && amount !== '' && warehouse) {
            const newSale: NewSale = {
                item,
                customer,
                date,
                amount: Number(amount),
                document: document ? document.name : null,
                warehouse, // New: Include warehouse in the new sale object
            };
            onAdd(newSale);
            // Reset the form
            setItem('');
            setCustomer('');
            setDate('');
            setAmount('');
            setDocument(null);
            setWarehouse(''); // New: Reset warehouse state
            onClose();
        } else {
            alert("Please fill in all required fields.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Add a New Sale</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="item" className="block text-sm font-medium text-gray-700">Item</label>
                        <select
                            id="item"
                            value={item}
                            onChange={handleItemChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        >
                            <option value="" disabled>Select an item</option>
                            {itemOptions.map((option) => (
                                <option key={option.name} value={option.name}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer</label>
                        <input
                            type="text"
                            id="customer"
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
                    {/* New: Warehouse selection field */}
                    <div>
                        <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700">Warehouse</label>
                        <select
                            id="warehouse"
                            value={warehouse}
                            onChange={(e) => setWarehouse(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            required
                        >
                            <option value="" disabled>Select a warehouse</option>
                            {warehouseOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (XOF)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                            readOnly
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="document" className="block text-sm font-medium text-gray-700">Document (Optional)</label>
                        <input
                            type="file"
                            id="document"
                            onChange={(e) => setDocument(e.target.files ? e.target.files[0] : null)}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
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
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSaleModal;
