import React, { useState } from 'react';
import { FiDownload, FiSettings, FiCalendar, FiBarChart2, FiChevronDown, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ReportsPage: React.FC = () => {
  // States for report generation parameters
  const [reportType, setReportType] = useState<string | ''>('');
  const [selectedYear, setSelectedYear] = useState<string | ''>('');
  const [selectedWeek, setSelectedWeek] = useState<string | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [periodType, setPeriodType] = useState<'year' | 'week' | 'range'>('year');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Available report type options
  const reportTypeOptions = [
    { id: 'sales_summary', name: 'Sales Summary', icon: <FiBarChart2 className="mr-2" /> },
    { id: 'purchase_summary', name: 'Purchase Summary', icon: <FiBarChart2 className="mr-2" /> },
    { id: 'inventory_overview', name: 'Inventory Overview', icon: <FiBarChart2 className="mr-2" /> },
    { id: 'financial_statement', name: 'Financial Statement', icon: <FiBarChart2 className="mr-2" /> },
    { id: 'customer_analysis', name: 'Customer Analysis', icon: <FiBarChart2 className="mr-2" /> },
    { id: 'supplier_performance', name: 'Supplier Performance', icon: <FiBarChart2 className="mr-2" /> },
  ];

  // Generate a list of years for selection
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const yearOptions = generateYearOptions();

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportType) {
      alert("Please specify the report type.");
      return;
    }

    let reportPeriodDescription = '';
    if (periodType === 'year') {
      if (!selectedYear) {
        alert("Please select a year.");
        return;
      }
      reportPeriodDescription = `for the year ${selectedYear}`;
    } else if (periodType === 'week') {
      if (!selectedWeek) {
        alert("Please select a week.");
        return;
      }
      reportPeriodDescription = `for the week ${selectedWeek}`;
    } else {
      if (!startDate || !endDate) {
        alert("Please specify both start and end dates.");
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after end date.");
        return;
      }
      reportPeriodDescription = `for the period from ${startDate} to ${endDate}`;
    }

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const selectedReportName = reportTypeOptions.find(opt => opt.id === reportType)?.name;
      alert(`Report "${selectedReportName}" ${reportPeriodDescription} generated successfully!`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Advanced Report Generator
          </h1>
          <p className="text-gray-600 mt-2">Create detailed business reports with custom parameters</p>
        </motion.div>

        {/* Report Form Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-blue-50 mr-3">
                <FiCalendar className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Report Parameters</h2>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <div className="flex items-center">
                      {reportType ? (
                        <>
                          {reportTypeOptions.find(opt => opt.id === reportType)?.icon}
                          {reportTypeOptions.find(opt => opt.id === reportType)?.name}
                        </>
                      ) : (
                        <span className="text-gray-500">Select a report type...</span>
                      )}
                    </div>
                    <FiChevronDown className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                      >
                        {reportTypeOptions.map((option) => (
                          <div
                            key={option.id}
                            onClick={() => {
                              setReportType(option.id);
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            {option.icon}
                            <span className="flex-1">{option.name}</span>
                            {reportType === option.id && <FiCheck className="text-blue-600" />}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Period Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Period
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPeriodType('year')}
                    className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${periodType === 'year' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span>By Year</span>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPeriodType('week')}
                    className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${periodType === 'week' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span>By Week</span>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPeriodType('range')}
                    className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${periodType === 'range' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span>Date Range</span>
                  </motion.button>
                </div>
              </div>

              {/* Conditional period inputs */}
              <AnimatePresence mode="wait">
                {periodType === 'year' && (
                  <motion.div
                    key="year-input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="" disabled>Select a year...</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {periodType === 'week' && (
                  <motion.div
                    key="week-input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Week
                    </label>
                    <input
                      type="week"
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </motion.div>
                )}

                {periodType === 'range' && (
                  <motion.div
                    key="range-input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={isGenerating}
                  whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-6 py-4 rounded-xl text-white font-medium text-lg transition-colors flex items-center justify-center gap-3 shadow-lg
                    ${isGenerating 
                      ? 'bg-gradient-to-r from-blue-300 to-purple-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <FiSettings />
                      </motion.div>
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FiDownload />
                      Generate Report
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>


      </div>
    </motion.div>
  );
};

export default ReportsPage;