import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Upload, ChevronUp, ChevronDown, PieChart as PieChartIcon, BarChart as BarChartIcon, DollarSign, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF66B2'];

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Transaction[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' } | null>(null);
  const [cardType, setCardType] = useState<string>('Statement Summary');
  const [currency, setCurrency] = useState<string>('$');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      try {
        const response = await axios.post('http://localhost:8000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.status === 'success') {
          setData(response.data.data);
          if (response.data.card_type) setCardType(response.data.card_type);
          if (response.data.currency_symbol) setCurrency(response.data.currency_symbol);
        } else {
          alert('Error: ' + response.data.message);
        }
      } catch (error) {
        console.error("Upload error", error);
        alert('Upload failed. Ensure backend is running.');
      }
      setLoading(false);
    }
  };

  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const expenses = data.filter(d => d.type === 'expense');
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const categoryData = useMemo(() => {
    const acc: Record<string, number> = {};
    expenses.forEach(tx => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    });
    return Object.keys(acc).map(category => ({
      name: category,
      value: acc[category]
    }));
  }, [expenses]);
  
  const dailyData = useMemo(() => {
    const acc: Record<string, number> = {};
    expenses.forEach(tx => {
      acc[tx.date] = (acc[tx.date] || 0) + tx.amount;
    });
    return Object.keys(acc).map(date => ({
      date,
      amount: acc[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center">
              <CreditCard className="mr-3 h-10 w-10 text-indigo-600" />
              Expenditure App
            </h1>
            <p className="mt-2 text-gray-500">Analyze your credit & debit card statements seamlessly. {data.length > 0 && <span className="ml-2 font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{cardType}</span>}</p>
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-indigo-600 text-white hover:bg-indigo-700 h-10 py-2 px-4">
              <Upload className="mr-2 h-4 w-4" />
              {loading ? 'Processing...' : 'Upload PDF Statement'}
              <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={loading} />
            </label>
          </div>
        </div>

        {data.length > 0 && (
          <>
            {/* KPI Cards */}{currency}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="tracking-tight text-sm font-medium text-gray-500">Total Expenses</h3>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-3xl font-bold">{currency}{totalExpense.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">Based on uploaded statement</p>
              </div>
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="tracking-tight text-sm font-medium text-gray-500">Transactions Found</h3>
                  <CreditCard className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-3xl font-bold">{data.length}</div>
                <p className="text-xs text-gray-500 mt-1">Total recognized entries</p>
              </div>
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between pb-2">
                  <h3 className="tracking-tight text-sm font-medium text-gray-500">Top Category</h3>
                  <PieChartIcon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-3xl font-bold">
                  {categoryData.length > 0 ? [...categoryData].sort((a,b)=>b.value - a.value)[0].name : 'N/A'}
                </div>
                <p className="text-xs text-gray-500 mt-1">Highest spending area</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <BarChartIcon className="mr-2 h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-semibold">Spending over Time</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => `${currency}${value}`} />
                      <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5 text-indigo-600" />
                  <h3 className="text-xl font-semibold">Expenses by Category</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${currency}${Number(value).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600 font-medium">
                    <tr>
                      <th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort('date')}>
                        <div className="flex items-center">
                          Date
                          {sortConfig?.key === 'date' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />) : <ChevronUp className="w-4 h-4 ml-1 opacity-20" />}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort('description')}>
                        <div className="flex items-center">
                          Description
                          {sortConfig?.key === 'description' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />) : <ChevronUp className="w-4 h-4 ml-1 opacity-20" />}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort('category')}>
                        <div className="flex items-center">
                          Category
                          {sortConfig?.key === 'category' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />) : <ChevronUp className="w-4 h-4 ml-1 opacity-20" />}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 cursor-pointer select-none hover:bg-gray-200 text-right" onClick={() => handleSort('amount')}>
                        <div className="flex items-center justify-end">
                          Amount
                          {sortConfig?.key === 'amount' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />) : <ChevronUp className="w-4 h-4 ml-1 opacity-20" />}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{item.date}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.description}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                            ${item.category === 'Food & Dining' ? 'bg-orange-100 text-orange-800' : 
                              item.category === 'Transport' ? 'bg-blue-100 text-blue-800' :
                              item.category === 'Shopping' ? 'bg-pink-100 text-pink-800' :
                              item.category === 'Entertainment' ? 'bg-purple-100 text-purple-800' :
                              item.category === 'Health' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right whitespace-nowrap font-medium ${item.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                          {item.type === 'income' ? '+' : '-'}{currency}{Math.abs(item.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {data.length === 0 && !loading && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center bg-gray-50">
            <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No data available</h3>
            <p className="mt-1 text-sm text-gray-500">Upload a PDF statement to see your expenditure dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
