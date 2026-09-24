import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Car,
  Bus,
  Train,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  BusRouteItem,
  TrainScheduleItem,
} from '../../types/adminTypes';

export const AdminTransportationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'bus-routes';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // State
  const [busRoutes, setBusRoutes] = useState<BusRouteItem[]>([]);
  const [trainSchedules, setTrainSchedules] = useState<TrainScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Editing
  const [busModalOpen, setBusModalOpen] = useState(false);
  const [trainModalOpen, setTrainModalOpen] = useState(false);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [editingTrainId, setEditingTrainId] = useState<string | null>(null);

  // Forms
  const [busForm, setBusForm] = useState<Partial<BusRouteItem>>({
    busNumber: '',
    routeName: '',
    origin: '',
    destination: '',
    departureTime: '06:00 AM',
    arrivalTime: '09:30 AM',
    operatingDays: 'Daily',
    fare: 450,
    status: 'Active',
  });

  const [trainForm, setTrainForm] = useState<Partial<TrainScheduleItem>>({
    trainNumber: '',
    trainName: '',
    origin: '',
    destination: '',
    departureTime: '05:55 AM',
    arrivalTime: '09:15 AM',
    trainType: 'Intercity Express',
    operatingDays: 'Daily',
    fare: 1000,
    status: 'Active',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      if (currentTab === 'train-schedules') {
        const data = await adminService.fetchTrainSchedules();
        setTrainSchedules(data);
      } else {
        const data = await adminService.fetchBusRoutes();
        setBusRoutes(data);
      }
    } catch (err) {
      console.error('Failed to load transportation data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTab]);

  // Bus Handlers
  const handleOpenAddBus = () => {
    setEditingBusId(null);
    setBusForm({
      busNumber: '',
      routeName: '',
      origin: '',
      destination: '',
      departureTime: '06:00 AM',
      arrivalTime: '09:30 AM',
      operatingDays: 'Daily',
      fare: 450,
      status: 'Active',
    });
    setBusModalOpen(true);
  };

  const handleOpenEditBus = (bus: BusRouteItem) => {
    setEditingBusId(bus.id);
    setBusForm({ ...bus });
    setBusModalOpen(true);
  };

  const handleSaveBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busForm.busNumber || !busForm.origin || !busForm.destination) return;
    try {
      if (editingBusId) {
        await adminService.updateBusRoute(editingBusId, busForm);
      } else {
        await adminService.createBusRoute(busForm);
      }
      setBusModalOpen(false);
      setEditingBusId(null);
      setBusForm({
        busNumber: '',
        routeName: '',
        origin: '',
        destination: '',
        departureTime: '06:00 AM',
        arrivalTime: '09:30 AM',
        operatingDays: 'Daily',
        fare: 450,
        status: 'Active',
      });
      loadData();
    } catch (err) {
      alert('Failed to save bus route.');
    }
  };

  const handleToggleBusStatus = async (bus: BusRouteItem) => {
    const newStatus = bus.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminService.updateBusRoute(bus.id, { ...bus, status: newStatus });
      setBusRoutes((prev) =>
        prev.map((b) => (b.id === bus.id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert('Failed to update bus route status.');
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (!window.confirm('Delete this bus route?')) return;
    try {
      await adminService.deleteBusRoute(id);
      loadData();
    } catch (err) {
      alert('Failed to delete bus route.');
    }
  };

  // Train Handlers
  const handleOpenAddTrain = () => {
    setEditingTrainId(null);
    setTrainForm({
      trainNumber: '',
      trainName: '',
      origin: '',
      destination: '',
      departureTime: '05:55 AM',
      arrivalTime: '09:15 AM',
      trainType: 'Intercity Express',
      operatingDays: 'Daily',
      fare: 1000,
      status: 'Active',
    });
    setTrainModalOpen(true);
  };

  const handleOpenEditTrain = (train: TrainScheduleItem) => {
    setEditingTrainId(train.id);
    setTrainForm({ ...train });
    setTrainModalOpen(true);
  };

  const handleSaveTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainForm.trainNumber || !trainForm.origin || !trainForm.destination) return;
    try {
      if (editingTrainId) {
        await adminService.updateTrainSchedule(editingTrainId, trainForm);
      } else {
        await adminService.createTrainSchedule(trainForm);
      }
      setTrainModalOpen(false);
      setEditingTrainId(null);
      setTrainForm({
        trainNumber: '',
        trainName: '',
        origin: '',
        destination: '',
        departureTime: '05:55 AM',
        arrivalTime: '09:15 AM',
        trainType: 'Intercity Express',
        operatingDays: 'Daily',
        fare: 1000,
        status: 'Active',
      });
      loadData();
    } catch (err) {
      alert('Failed to save train schedule.');
    }
  };

  const handleToggleTrainStatus = async (train: TrainScheduleItem) => {
    const newStatus = train.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await adminService.updateTrainSchedule(train.id, { ...train, status: newStatus });
      setTrainSchedules((prev) =>
        prev.map((t) => (t.id === train.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert('Failed to update train schedule status.');
    }
  };

  const handleDeleteTrain = async (id: string) => {
    if (!window.confirm('Delete this train schedule?')) return;
    try {
      await adminService.deleteTrainSchedule(id);
      loadData();
    } catch (err) {
      alert('Failed to delete train schedule.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            Transportation Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage database-backed public bus & train timetables.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'bus-routes', label: 'Bus Routes', icon: Bus },
          { id: 'train-schedules', label: 'Train Schedules', icon: Train },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#16A6A1] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 3: BUS ROUTES */}
      {currentTab === 'bus-routes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#0B3A53] font-heading">
              Public Bus Routes & Highway Express Services
            </h2>
            <button
              onClick={handleOpenAddBus}
              className="px-4 py-2.5 bg-[#16A6A1] hover:bg-[#146C86] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bus Route</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-5">Bus No</th>
                    <th className="py-4 px-5">Route Name</th>
                    <th className="py-4 px-5">Origin</th>
                    <th className="py-4 px-5">Destination</th>
                    <th className="py-4 px-5">Departure / Arrival</th>
                    <th className="py-4 px-5">Fare</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {busRoutes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">No bus routes configured.</td>
                    </tr>
                  ) : (
                    busRoutes.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-5 font-mono font-black text-[#0B3A53]">{b.busNumber}</td>
                        <td className="py-4 px-5 font-extrabold text-slate-800">{b.routeName}</td>
                        <td className="py-4 px-5 text-slate-600">{b.origin}</td>
                        <td className="py-4 px-5 text-slate-600">{b.destination}</td>
                        <td className="py-4 px-5 text-slate-700 font-medium">
                          {b.departureTime} → {b.arrivalTime}
                        </td>
                        <td className="py-4 px-5 font-black text-[#146C86]">LKR {b.fare}</td>
                        <td className="py-4 px-5">
                          <button
                            type="button"
                            onClick={() => handleToggleBusStatus(b)}
                            title={`Click to switch status to ${b.status === 'Active' ? 'Inactive' : 'Active'}`}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs hover:opacity-90 hover:scale-105 active:scale-95 ${
                              b.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{b.status}</span>
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditBus(b)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#16A6A1] hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Edit bus route"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBus(b.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove bus route"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRAIN SCHEDULES */}
      {currentTab === 'train-schedules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#0B3A53] font-heading">
              Sri Lanka Railways Timetables & Observation Cars
            </h2>
            <button
              onClick={handleOpenAddTrain}
              className="px-4 py-2.5 bg-[#16A6A1] hover:bg-[#146C86] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Train Schedule</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-5">Train No</th>
                    <th className="py-4 px-5">Name & Line</th>
                    <th className="py-4 px-5">Origin</th>
                    <th className="py-4 px-5">Destination</th>
                    <th className="py-4 px-5">Timing</th>
                    <th className="py-4 px-5">Type</th>
                    <th className="py-4 px-5">Fare</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {trainSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">No train schedules configured.</td>
                    </tr>
                  ) : (
                    trainSchedules.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-5 font-mono font-black text-[#0B3A53]">{t.trainNumber}</td>
                        <td className="py-4 px-5 font-extrabold text-slate-800">{t.trainName}</td>
                        <td className="py-4 px-5 text-slate-600">{t.origin}</td>
                        <td className="py-4 px-5 text-slate-600">{t.destination}</td>
                        <td className="py-4 px-5 text-slate-700 font-medium">
                          {t.departureTime} → {t.arrivalTime}
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800">
                            {t.trainType}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-black text-[#146C86]">LKR {t.fare}</td>
                        <td className="py-4 px-5">
                          <button
                            type="button"
                            onClick={() => handleToggleTrainStatus(t)}
                            title={`Click to switch status to ${t.status === 'Active' ? 'Inactive' : 'Active'}`}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs hover:opacity-90 hover:scale-105 active:scale-95 ${
                              t.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span>{t.status || 'Active'}</span>
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditTrain(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#16A6A1] hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Edit train schedule"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTrain(t.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove train schedule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BUS MODAL (ADD & EDIT) */}
      {busModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveBus} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-[#0B3A53]">
                {editingBusId ? 'Edit Public Bus Route' : 'Add Public Bus Route'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setBusModalOpen(false);
                  setEditingBusId(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bus Number (e.g. 01)</label>
                  <input
                    type="text"
                    required
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fare (LKR)</label>
                  <input
                    type="number"
                    value={busForm.fare}
                    onChange={(e) => setBusForm({ ...busForm, fare: parseFloat(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Route Name</label>
                <input
                  type="text"
                  required
                  value={busForm.routeName}
                  onChange={(e) => setBusForm({ ...busForm, routeName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                  placeholder="Colombo - Kandy AC Highway Express"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Origin Station</label>
                  <input
                    type="text"
                    required
                    value={busForm.origin}
                    onChange={(e) => setBusForm({ ...busForm, origin: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Colombo Bastian Mawatha"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination Station</label>
                  <input
                    type="text"
                    required
                    value={busForm.destination}
                    onChange={(e) => setBusForm({ ...busForm, destination: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Kandy Goodshed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Departure Time</label>
                  <input
                    type="text"
                    value={busForm.departureTime}
                    onChange={(e) => setBusForm({ ...busForm, departureTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="06:00 AM"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arrival Time</label>
                  <input
                    type="text"
                    value={busForm.arrivalTime}
                    onChange={(e) => setBusForm({ ...busForm, arrivalTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="09:30 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Operating Days</label>
                  <input
                    type="text"
                    value={busForm.operatingDays || 'Daily'}
                    onChange={(e) => setBusForm({ ...busForm, operatingDays: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Daily"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={busForm.status || 'Active'}
                    onChange={(e) => setBusForm({ ...busForm, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBusModalOpen(false);
                  setEditingBusId(null);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#16A6A1] hover:bg-[#146C86] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                {editingBusId ? 'Update Bus Route' : 'Save Bus Route'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRAIN MODAL (ADD & EDIT) */}
      {trainModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveTrain} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-[#0B3A53]">
                {editingTrainId ? 'Edit Train Timetable Schedule' : 'Add Train Timetable Schedule'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setTrainModalOpen(false);
                  setEditingTrainId(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Train Number (e.g. 1005)</label>
                  <input
                    type="text"
                    required
                    value={trainForm.trainNumber}
                    onChange={(e) => setTrainForm({ ...trainForm, trainNumber: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Train Name</label>
                  <input
                    type="text"
                    required
                    value={trainForm.trainName}
                    onChange={(e) => setTrainForm({ ...trainForm, trainName: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Podi Menike"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Origin Station</label>
                  <input
                    type="text"
                    required
                    value={trainForm.origin}
                    onChange={(e) => setTrainForm({ ...trainForm, origin: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Colombo Fort"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination Station</label>
                  <input
                    type="text"
                    required
                    value={trainForm.destination}
                    onChange={(e) => setTrainForm({ ...trainForm, destination: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Badulla / Ella"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Departure Time</label>
                  <input
                    type="text"
                    value={trainForm.departureTime}
                    onChange={(e) => setTrainForm({ ...trainForm, departureTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="05:55 AM"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Arrival Time</label>
                  <input
                    type="text"
                    value={trainForm.arrivalTime}
                    onChange={(e) => setTrainForm({ ...trainForm, arrivalTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="09:15 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Train Type</label>
                  <select
                    value={trainForm.trainType}
                    onChange={(e) => setTrainForm({ ...trainForm, trainType: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Intercity Express">Intercity Express</option>
                    <option value="Express">Express</option>
                    <option value="Tourist Observation Saloon">Observation Saloon (Ella Odyssey)</option>
                    <option value="Night Mail">Night Mail</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fare (LKR)</label>
                  <input
                    type="number"
                    value={trainForm.fare}
                    onChange={(e) => setTrainForm({ ...trainForm, fare: parseFloat(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Operating Days</label>
                  <input
                    type="text"
                    value={trainForm.operatingDays || 'Daily'}
                    onChange={(e) => setTrainForm({ ...trainForm, operatingDays: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Daily"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={trainForm.status || 'Active'}
                    onChange={(e) => setTrainForm({ ...trainForm, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTrainModalOpen(false);
                  setEditingTrainId(null);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#16A6A1] hover:bg-[#146C86] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                {editingTrainId ? 'Update Train Schedule' : 'Save Train Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
