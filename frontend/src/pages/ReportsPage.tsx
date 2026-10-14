import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import api from '../services/api';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string>('students');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports?type=${reportType}`);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    if (!reportData?.data || reportData.data.length === 0) return;

    const columns = reportData.columns.map((c: any) => c.label);
    const keys = reportData.columns.map((c: any) => c.key);

    const csvRows = [
      columns.join(','),
      ...reportData.data.map((row: any) =>
        keys.map((k: string) => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredRows = reportData?.data?.filter((row: any) =>
    Object.values(row).some((val: any) =>
      String(val).toLowerCase().includes(searchFilter.toLowerCase())
    )
  );

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              Audit & Operational Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export official hostel administration records, occupancy matrices, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-print">
        {[
          { id: 'students', label: 'Student Master Roster' },
          { id: 'occupancy', label: 'Room Occupancy Matrix' },
          { id: 'visitors', label: 'Visitor Access Logs' },
          { id: 'complaints', label: 'Complaints & Grievances' },
          { id: 'maintenance', label: 'Maintenance Queue Log' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              reportType === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Report Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        {/* Printable Document Title */}
        <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
              {reportData?.title || 'Report Records'}
            </h3>
            <span className="text-xs text-slate-400">
              Generated: {reportData?.generatedAt || new Date().toLocaleString()} • Total Records: {reportData?.totalRecords || 0}
            </span>
          </div>

          <div className="relative w-64 no-print">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search table rows..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Generating tabular report data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  {reportData?.columns?.map((col: any) => (
                    <th key={col.key} className="py-2.5 px-3">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    {reportData?.columns?.map((col: any) => (
                      <td key={col.key} className="py-2 px-3 text-slate-700 whitespace-nowrap">
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
