import React, { useState } from 'react';
import { FaDollarSign, FaShoppingCart, FaChartLine, FaRegCreditCard } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- Interfaces (à importer d'un fichier partagé si possible) ---

interface SaleLine {
    itemId: number;
    quantity: number;
    unitPrice: number;
}

interface Sale {
    id: number;
    saleDate: string;
    customer: string;
    totalAmount: number;
    items: SaleLine[];
    isPaid: boolean;
}

interface PurchaseItem {
    itemId: number;
    quantity: number;
}

interface Purchase {
    id: number;
    purchaseDate: string;
    supplier: string;
    totalAmount: number; // Propriété ajoutée pour le calcul du total
    items: PurchaseItem[];
    isPaid: boolean;
}

// --- Données factices pour la démonstration (remplacez par des données réelles) ---

const mockSales: Sale[] = [
    { id: 201, saleDate: '2025-08-24', customer: 'Client Alpha', totalAmount: 400000, items: [{ itemId: 1, quantity: 1, unitPrice: 350000 }], isPaid: true },
    { id: 202, saleDate: '2025-08-23', customer: 'Client Beta', totalAmount: 150000, items: [{ itemId: 2, quantity: 1, unitPrice: 150000 }], isPaid: false },
    { id: 203, saleDate: '2025-08-22', customer: 'Client Gamma', totalAmount: 2500000, items: [{ itemId: 3, quantity: 1, unitPrice: 2500000 }], isPaid: true },
];

const mockPurchases: Purchase[] = [
    // Ajout d'une propriété totalAmount pour chaque achat
    { id: 101, purchaseDate: '2025-08-21', supplier: 'Tech Solutions', totalAmount: 1800000, items: [{ itemId: 1, quantity: 10 }, { itemId: 3, quantity: 5 }], isPaid: true },
    { id: 102, purchaseDate: '2025-08-20', supplier: 'Office Depot', totalAmount: 600000, items: [{ itemId: 5, quantity: 50 }], isPaid: false },
];

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);

// NOUVELLE FONCTION: Formate les grands nombres en Millions/Milliards
const formatLargeCurrency = (amount: number): string => {
    if (amount >= 1e9) {
        return (amount / 1e9).toFixed(1) + 'Md XOF';
    }
    if (amount >= 1e6) {
        return (amount / 1e6).toFixed(1) + 'M XOF';
    }
    return formatCurrency(amount);
};

const DashboardPage: React.FC = () => {
    const [sales] = useState<Sale[]>(mockSales);
    const [purchases] = useState<Purchase[]>(mockPurchases);

    // --- Calcul des KPIs ---
    // Utilisation de 0 comme valeur initiale pour éviter NaN
    const totalSalesValue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalPurchasesValue = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    const outstandingPaymentsValue = sales.filter(s => !s.isPaid).reduce((sum, sale) => sum + sale.totalAmount, 0);

    const kpis = [
        {
            title: 'Total des Ventes',
            value: formatLargeCurrency(totalSalesValue),
            icon: <FaDollarSign className="text-green-500" />,
            change: '+5% ce mois'
        },
        {
            title: 'Total des Achats',
            value: formatLargeCurrency(totalPurchasesValue),
            icon: <FaShoppingCart className="text-blue-500" />,
            change: '+10% cette semaine'
        },
        {
            title: 'Paiements en Attente',
            value: formatLargeCurrency(outstandingPaymentsValue),
            icon: <FaRegCreditCard className="text-purple-500" />,
            change: '2 factures en retard'
        },
    ];

    // --- Mélange des activités récentes (ventes et achats) ---
    const allActivities = [
        ...sales.map(s => ({
            id: s.id,
            type: 'Vente',
            description: `Vente #${s.id} pour ${s.customer}`,
            date: s.saleDate,
            amount: formatCurrency(s.totalAmount)
        })),
        ...purchases.map(p => ({
            id: p.id,
            type: 'Achat',
            description: `Achat #${p.id} de ${p.supplier}`,
            date: p.purchaseDate,
            amount: formatCurrency(p.totalAmount)
        }))
    ];

    // Trier les activités par date (plus récentes en premier)
    allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentActivities = allActivities.slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 min-h-screen bg-gray-100 text-gray-900"
        >
            <h1 className="text-4xl font-bold mb-8 text-blue-700">Tableau de Bord</h1>

            {/* --- Section KPIs --- */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Indicateurs Clés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kpis.map((kpi, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between w-full mb-3">
                                <div className="text-3xl p-3 bg-gray-100 rounded-full">{kpi.icon}</div>
                                <p className="text-sm text-gray-500 font-medium">{kpi.title}</p>
                            </div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{kpi.value}</h3>
                            <p className="text-sm text-gray-600">{kpi.change}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- Section Graphiques (Exemple) --- */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Tendances & Analyse</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-md p-6 h-80 flex items-center justify-center"
                    >
                        <FaChartLine className="text-blue-500 text-6xl opacity-50" />
                        <p className="text-gray-500 ml-4">Graphique des ventes (À intégrer)</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-md p-6 h-80 flex items-center justify-center"
                    >
                        <FaChartLine className="text-purple-500 text-6xl opacity-50" />
                        <p className="text-gray-500 ml-4">Mouvement du stock (À intégrer)</p>
                    </motion.div>
                </div>
            </section>

            {/* --- Section Activité Récente --- */}
            <section>
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Activité Récente</h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-md p-6"
                >
                    {recentActivities.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {recentActivities.map((activity, index) => (
                                <li key={index} className="py-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-lg font-medium text-gray-800">
                                            <span className={`font-bold ${activity.type === 'Vente' ? 'text-green-600' : 'text-blue-600'}`}>
                                                {activity.type}:
                                            </span> {activity.description}
                                        </p>
                                        <p className="text-sm text-gray-500">{activity.date}</p>
                                    </div>
                                    {activity.amount && (
                                        <span className={`text-lg font-bold ${activity.type === 'Vente' ? 'text-green-600' : 'text-blue-600'}`}>
                                            {activity.amount}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center py-8">Aucune activité récente à afficher.</p>
                    )}
                </motion.div>
            </section>
        </motion.div>
    );
};

export default DashboardPage;