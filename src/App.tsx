/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserRound, 
  Calendar, 
  CreditCard, 
  Pill, 
  Building2, 
  Database as DbIcon, 
  TrendingUp,
  LayoutDashboard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'patients' | 'doctors' | 'appointments' | 'billing' | 'pharmacy' | 'sql';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<any>({
    patients: [],
    doctors: [],
    appointments: [],
    billing: [],
    medicines: [],
    stats: { revenue: 0, docStats: [] }
  });
  const [loading, setLoading] = useState(true);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM Patient');
  const [sqlResult, setSqlResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patients, doctors, appointments, billing, medicines, revenue, docStats] = await Promise.all([
        fetch('/api/patients').then(res => res.json()),
        fetch('/api/doctors').then(res => res.json()),
        fetch('/api/appointments').then(res => res.json()),
        fetch('/api/billing').then(res => res.json()),
        fetch('/api/medicines').then(res => res.json()),
        fetch('/api/stats/revenue').then(res => res.json()),
        fetch('/api/stats/doctor-appointments').then(res => res.json())
      ]);

      setData({
        patients,
        doctors,
        appointments,
        billing,
        medicines,
        stats: { revenue: revenue.TotalRevenue || 0, docStats }
      });
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const runQuery = async () => {
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery })
      });
      const result = await res.json();
      setSqlResult(result);
    } catch (err: any) {
      setSqlResult({ success: false, error: err.message });
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const Card = ({ children, title, icon: Icon, className = "" }: any) => (
    <div className={`bg-white rounded-3xl border border-slate-100 p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {Icon && <Icon className="text-blue-600" size={24} />}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Activity className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-blue-900 uppercase">MediCare+</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="patients" icon={UserRound} label="Patients" />
          <NavItem id="doctors" icon={Users} label="Doctors" />
          <NavItem id="appointments" icon={Calendar} label="Appointments" />
          <NavItem id="billing" icon={CreditCard} label="Billing" />
          <NavItem id="pharmacy" icon={Pill} label="Pharmacy" />
          <div className="my-4 border-t border-slate-100" />
          <NavItem id="sql" icon={DbIcon} label="SQL Console" />
        </nav>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Status</div>
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Database Online
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight capitalize">{activeTab}</h2>
            <p className="text-slate-500">MediCare Plus Centralized Database Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              />
            </div>
            <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors">
              <Users size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card title="Total Revenue" icon={TrendingUp}>
                <div className="text-4xl font-black text-slate-900">${data.stats.revenue.toLocaleString()}</div>
                <p className="text-sm text-slate-500 mt-2">Aggregated from all branches</p>
              </Card>
              <Card title="Total Patients" icon={UserRound}>
                <div className="text-4xl font-black text-slate-900">{data.patients.length}</div>
                <p className="text-sm text-slate-500 mt-2">Active database records</p>
              </Card>
              <Card title="Active Doctors" icon={Users}>
                <div className="text-4xl font-black text-slate-900">{data.doctors.length}</div>
                <p className="text-sm text-slate-500 mt-2">Across 5 branches</p>
              </Card>
              <Card title="Medicine Stock" icon={Pill}>
                <div className="text-4xl font-black text-slate-900">
                  {data.medicines.reduce((acc: number, cur: any) => acc + cur.StockQty, 0)}
                </div>
                <p className="text-sm text-slate-500 mt-2">Items currently in inventory</p>
              </Card>

              <div className="md:col-span-2 space-y-6">
                <Card title="Recent Appointments" className="h-full">
                  <div className="space-y-4">
                    {data.appointments.slice(0, 5).map((appComp: any) => (
                      <div key={appComp.AppointmentID} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{appComp.PatientName}</div>
                            <div className="text-xs text-slate-500">{appComp.DoctorName} • {appComp.Specialization}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{appComp.AppointmentDate}</div>
                          <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${
                            appComp.Status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                            appComp.Status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {appComp.Status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card title="Branch Distribution" icon={Building2} className="h-full">
                  <div className="space-y-4">
                    {data.stats.docStats.map((doc: any, i: number) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-bold">{doc.DoctorName}</span>
                          <span className="text-slate-500">{doc.TotalAppointments} Load</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full transition-all duration-1000" 
                            style={{ width: `${(doc.TotalAppointments / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'patients' && (
            <motion.div 
              key="patients"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Phone</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Address</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">DOB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.patients.map((p: any) => (
                    <tr key={p.PatientID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">#{p.PatientID}</td>
                      <td className="px-6 py-4 font-bold">{p.PatientName}</td>
                      <td className="px-6 py-4 text-slate-600">{p.Phone}</td>
                      <td className="px-6 py-4 text-slate-600">{p.Address}</td>
                      <td className="px-6 py-4 text-slate-500">{p.DOB}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'doctors' && (
            <motion.div 
              key="doctors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {data.doctors.map((d: any) => (
                <div key={d.DoctorID} className="bg-white rounded-3xl border border-slate-100 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-slate-100 p-4 rounded-2xl text-blue-600">
                    <UserRound size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{d.DoctorName}</h3>
                    <p className="text-blue-600 font-medium text-sm">{d.Specialization}</p>
                    <div className="flex items-center gap-2 text-slate-400 mt-4 text-xs">
                      <Building2 size={14} />
                      {d.BranchName}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'pharmacy' && (
            <motion.div 
              key="pharmacy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.medicines.map((m: any) => (
                  <Card key={m.MedicineID} title={m.MedicineName} icon={Pill}>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-2xl font-black">${m.Price.toFixed(2)}</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Unit Price</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${m.StockQty < 200 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {m.StockQty}
                        </div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Stock Level</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                       <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">Restock</button>
                       <button className="flex-1 border border-slate-200 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">History</button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div 
              key="appointments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Patient</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Doctor</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.appointments.map((a: any) => (
                    <tr key={a.AppointmentID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">#{a.AppointmentID}</td>
                      <td className="px-6 py-4 font-bold">{a.PatientName}</td>
                      <td className="px-6 py-4 text-slate-600">{a.DoctorName} <span className="text-xs text-slate-400 block">{a.Specialization}</span></td>
                      <td className="px-6 py-4 text-slate-600">{a.AppointmentDate}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                          a.Status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                          a.Status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {a.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div 
              key="billing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Bill ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Patient</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest italic">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.billing.map((b: any) => (
                    <tr key={b.BillID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">#{b.BillID}</td>
                      <td className="px-6 py-4 font-bold">{b.PatientName}</td>
                      <td className="px-6 py-4 text-slate-600">{b.AppointmentDate}</td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">${b.Amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                          {b.PaymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
          {activeTab === 'sql' && (
            <motion.div 
              key="sql"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-6">
                <Card title="SQL Playground" icon={Terminal}>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                       {[
                         { label: 'All Patients', q: 'SELECT * FROM Patient' },
                         { label: 'Cardiologists', q: "SELECT * FROM Doctor WHERE Specialization = 'Cardiology'" },
                         { label: 'Revenue Sum', q: 'SELECT SUM(Amount) as TotalRev FROM Billing' },
                         { label: 'Avg Med Price', q: 'SELECT AVG(Price) as AvgPrice FROM Medicine' },
                         { label: 'Join Appointments', q: 'SELECT p.PatientName, d.DoctorName, a.AppointmentDate FROM Appointment a JOIN Patient p ON a.PatientID = p.PatientID JOIN Doctor d ON a.DoctorID = d.DoctorID' }
                       ].map(preset => (
                         <button 
                           key={preset.label}
                           onClick={() => setSqlQuery(preset.q)}
                           className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                         >
                           {preset.label}
                         </button>
                       ))}
                    </div>
                    <textarea 
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      className="w-full h-48 bg-slate-900 text-emerald-400 p-4 font-mono text-sm rounded-2xl resize-none focus:outline-none ring-offset-4 focus:ring-2 focus:ring-blue-500/20"
                      spellCheck={false}
                    />
                    <button 
                      onClick={runQuery}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    >
                      <ArrowRight size={18} />
                      Execute Query
                    </button>
                  </div>
                </Card>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 italic text-amber-900 text-sm">
                  <div className="font-bold flex items-center gap-2 mb-2">
                    <Clock size={16} />
                    Transactions Demo
                  </div>
                  The database uses SQLite transactions to ensure data integrity during billing and stock updates. Click 'Execute' to simulate a complex relational update.
                </div>
              </div>

              <div className="lg:col-span-2">
                <Card title="Query Result" icon={DbIcon} className="min-h-[400px]">
                  {!sqlResult ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 italic">
                      <DbIcon size={48} className="mb-4 opacity-20" />
                      Run a query to see results here...
                    </div>
                  ) : sqlResult.success ? (
                    <div className="overflow-auto max-h-[500px]">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            {sqlResult.data.length > 0 && Object.keys(sqlResult.data[0]).map(key => (
                              <th key={key} className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest italic">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sqlResult.data.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              {Object.values(row).map((val: any, j: number) => (
                                <td key={j} className="px-4 py-3 text-sm font-medium">{String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-mono text-sm">
                      {sqlResult.error}
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
