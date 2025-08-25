import React, { useState, useMemo } from "react";
import { FaPlus, FaTrash, FaSearch, FaEdit } from "react-icons/fa";
import EditZoneModal from "../../components/zonecompo/EditZoneModal";

interface Zone {
    id: number;
    code: string;
    name: string;
}

const ZonesPage: React.FC = () => {
    const [zones, setZones] = useState<Zone[]>([
        { id: 1, code: "Z-001", name: "North Zone" },
        { id: 2, code: "Z-002", name: "South Zone" },
    ]);

    const [newZoneName, setNewZoneName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedZones, setSelectedZones] = useState<number[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [zoneToEdit, setZoneToEdit] = useState<Zone | null>(null);

    const generateNewCode = (currentCount: number): string => {
        const paddedNumber = String(currentCount + 1).padStart(3, '0');
        return `Z-${paddedNumber}`;
    };

    const handleAdd = () => {
        if (!newZoneName) {
            alert("Please enter a name for the new zone.");
            return;
        }
        const newId = zones.length > 0 ? Math.max(...zones.map(zone => zone.id)) + 1 : 1;
        const newCode = generateNewCode(zones.length);
        const newZone: Zone = {
            id: newId,
            code: newCode,
            name: newZoneName,
        };
        setZones([newZone, ...zones]);
        setNewZoneName("");
    };

    const handleEditZone = (zone: Zone) => {
        setZones(zones.map(z => (z.id === zone.id ? zone : z)));
        setZoneToEdit(null);
        setIsEditModalOpen(false);
    };

    const handleDeleteSelected = () => {
        if (selectedZones.length === 0) {
            alert("Please select at least one zone to delete.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete the selected ${selectedZones.length} zone(s)?`)) {
            setZones(zones.filter(zone => !selectedZones.includes(zone.id)));
            setSelectedZones([]);
        }
    };
    
    const handleEditSelected = () => {
        if (selectedZones.length === 0) {
            alert("Please select a zone to edit.");
            return;
        }
        if (selectedZones.length > 1) {
            alert("Please select only one zone at a time for editing.");
            return;
        }
        const zoneToEdit = zones.find(zone => zone.id === selectedZones[0]);
        if (zoneToEdit) {
            setZoneToEdit(zoneToEdit);
            setIsEditModalOpen(true);
        }
    };

    const handleSort = (key: string) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredZones = useMemo(() => {
        let sortableZones = [...zones];

        // Filter
        if (searchTerm) {
            sortableZones = sortableZones.filter(zone =>
                zone.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                zone.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        if (sortConfig !== null) {
            sortableZones.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Zone];
                const bValue = b[sortConfig.key as keyof Zone];

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableZones;
    }, [zones, searchTerm, sortConfig]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedZones(checked ? sortedAndFilteredZones.map(zone => zone.id) : []);
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedZones(prev => [...prev, id]);
        } else {
            setSelectedZones(prev => prev.filter(zoneId => zoneId !== id));
        }
    };

    const isAllSelected = sortedAndFilteredZones.length > 0 && selectedZones.length === sortedAndFilteredZones.length;

    return (
        <div className="p-6 bg-gray-50 rounded-2xl shadow-lg min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Zone Management</h2>
                    <p className="text-gray-600 mt-1">
                        Manage and track your company's operational zones.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="New Zone Name"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                    />
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus className="w-4 h-4" />
                        Add
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search zones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {selectedZones.length > 0 && (
                    <div className="flex gap-2">
                        {selectedZones.length === 1 && (
                            <button
                                onClick={handleEditSelected}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            >
                                <FaEdit className="w-3 h-3" />
                                Edit
                            </button>
                        )}
                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                            <FaTrash className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
            
            <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-6 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('code')}>
                                <div className="flex items-center">Code</div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Name</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedAndFilteredZones.length > 0 ? (
                            sortedAndFilteredZones.map((zone) => (
                                <tr key={zone.id} className={`hover:bg-gray-50 transition-colors duration-150 ${selectedZones.includes(zone.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedZones.includes(zone.id)}
                                            onChange={(e) => handleSelectItem(zone.id, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="py-2 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{zone.code}</td>
                                    <td className="py-2 px-6 whitespace-nowrap text-sm text-gray-700">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {zone.name}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No zones found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Showing {sortedAndFilteredZones.length} of {zones.length} zones
                </p>
            </div>
            <EditZoneModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditZone}
                zoneToEdit={zoneToEdit}
            />
        </div>
    );
};

export default ZonesPage;