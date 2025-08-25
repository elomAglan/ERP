import React from "react";
import { FaFileDownload } from "react-icons/fa";

interface Sale {
    id: number;
    item: string;
    customer: string;
    date: string;
    amount: number;
    document: string | null;
    status: "pending_payment" | "paid";
}

const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'long', year: 'numeric' }).format(
        new Date(date)
    );

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'XOF' }).format(amount);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
        case 'paid': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const SaleDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
}> = ({ isOpen, onClose, sale }) => {
    if (!isOpen || !sale) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Sale Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Item</p>
                        <p className="text-lg font-semibold text-gray-800">{sale.item}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Customer</p>
                        <p className="text-lg font-semibold text-gray-800">{sale.customer}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="text-lg font-semibold text-gray-800">{formatDate(sale.date)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Amount</p>
                        <p className="text-lg font-semibold text-gray-800">{formatCurrency(sale.amount)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(sale.status)}`}>
                            {sale.status === 'pending_payment' && 'Pending Payment'}
                            {sale.status === 'paid' && 'Paid'}
                        </span>
                    </div>
                    {sale.document && (
                        <div>
                            <p className="text-sm font-medium text-gray-500">Document</p>
                            <a 
                                href="#" 
                                onClick={(e) => e.preventDefault()}
                                className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
                            >
                                <FaFileDownload />
                                {sale.document}
                            </a>
                        </div>
                    )}
                </div>
                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleDetailModal;