"use client";
import React, { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Activity, Search, Plus, X, Edit, Trash2, Loader2 } from "lucide-react";

interface HospitalItem {
  _id: string;
  hospitalName: string;
  branch?: string;
  pocName?: string;
  telephoneNumber: string;
  address: {
    state: string;
    district: string;
    city: string;
    pincode: string;
    village?: string;
    doorNo?: string;
    completeAddress?: string;
  };
  labs?: { _id: string; labName: string }[];
}

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<HospitalItem | null>(
    null,
  );

  // Form states
  const [hospitalName, setHospitalName] = useState("");
  const [branch, setBranch] = useState("");
  const [pocName, setPocName] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [village, setVillage] = useState("");
  const [doorNo, setDoorNo] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [labs, setLabs] = useState<string[]>([""]);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl("/api/admin/hospitals"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
      }
    } catch (err) {
      console.error("Error loading hospitals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingHospital
        ? getApiUrl(`/api/admin/hospitals/${editingHospital._id}`)
        : getApiUrl("/api/admin/hospitals");

      const method = editingHospital ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalName,
          branch,
          pocName,
          telephoneNumber,
          address: {
            state: stateName,
            district,
            city,
            pincode,
            village,
            doorNo,
            completeAddress,
          },
          labs: labs.filter((l) => l.trim() !== ""),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddOpen(false);
        resetForm();
        loadHospitals();
      }
    } catch (err) {
      console.error("Failed saving hospital", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingHospital(null);
    setHospitalName("");
    setBranch("");
    setPocName("");
    setTelephoneNumber("");
    setStateName("");
    setDistrict("");
    setCity("");
    setPincode("");
    setVillage("");
    setDoorNo("");
    setCompleteAddress("");
    setLabs([""]);
  };

  const handleEditClick = (hosp: HospitalItem) => {
    setEditingHospital(hosp);
    setHospitalName(hosp.hospitalName || "");
    setBranch(hosp.branch || "");
    setPocName(hosp.pocName || "");
    setTelephoneNumber(hosp.telephoneNumber || "");
    setStateName(hosp.address?.state || "");
    setDistrict(hosp.address?.district || "");
    setCity(hosp.address?.city || "");
    setPincode(hosp.address?.pincode || "");
    setVillage(hosp.address?.village || "");
    setDoorNo(hosp.address?.doorNo || "");
    setCompleteAddress(hosp.address?.completeAddress || "");
    setLabs(
      hosp.labs && hosp.labs.length > 0
        ? hosp.labs.map((l) => l.labName)
        : [""],
    );
    setIsAddOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this hospital?"))
      return;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(getApiUrl(`/api/admin/hospitals/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        loadHospitals();
      }
    } catch (err) {
      console.error("Failed deleting hospital", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.telephoneNumber?.includes(searchQuery),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hospital Partners
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage hospital centers and locations.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Register New B2B Hospital
        </button>
      </div>

      {/* List Table */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by hospital name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-xs font-bold text-slate-600 uppercase">
                  Hospital Name
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-600 uppercase">
                  Phone Number
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-600 uppercase">
                  City / Village
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-600 uppercase">
                  State
                </th>
                <th className="py-3 px-6 text-xs font-bold text-slate-600 uppercase text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHospitals.length > 0 ? (
                filteredHospitals.map((hosp) => (
                  <tr
                    key={hosp._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-6 text-sm font-bold text-slate-900">
                      <div>{hosp.hospitalName}</div>
                      {hosp.branch && (
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                          Branch: {hosp.branch}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-600">
                      {hosp.telephoneNumber}
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-600">
                      {hosp.address?.city}
                      {hosp.address?.village && ` / ${hosp.address.village}`}
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-600">
                      {hosp.address?.state}
                    </td>
                    <td className="py-3 px-6 text-sm text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(hosp)}
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(hosp._id)}
                        className="p-1.5 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-500 font-medium text-sm"
                  >
                    No hospital partners registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-5xl w-full rounded-xl shadow-2xl relative border border-slate-200 my-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingHospital ? "Update" : "Register New"} Hospital
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Left Column: Basic Info & Lab Facilities */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-slate-400">
                        Basic Information
                      </h4>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          Hospital Name *
                        </label>
                        <input
                          type="text"
                          value={hospitalName}
                          onChange={(e) =>
                            setHospitalName(capitalizeWords(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          Branch
                        </label>
                        <input
                          type="text"
                          value={branch}
                          onChange={(e) =>
                            setBranch(capitalizeWords(e.target.value))
                          }
                          placeholder="e.g. City Center, Jubilee Hills"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          Point of Contact Name
                        </label>
                        <input
                          type="text"
                          value={pocName}
                          onChange={(e) =>
                            setPocName(capitalizeWords(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          Telephone Number
                        </label>
                        <input
                          type="tel"
                          value={telephoneNumber}
                          onChange={(e) => setTelephoneNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Labs */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase text-slate-400">
                          Lab Facilities
                        </h4>
                        <button
                          type="button"
                          onClick={() => setLabs([...labs, ""])}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Another Lab
                        </button>
                      </div>
                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                        {labs.map((lab, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={`Lab Name ${index + 1}`}
                              value={lab}
                              onChange={(e) => {
                                const newLabs = [...labs];
                                newLabs[index] = capitalizeWords(
                                  e.target.value,
                                );
                                setLabs(newLabs);
                              }}
                              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                            />
                            {labs.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setLabs(labs.filter((_, i) => i !== index))
                                }
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Address Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-slate-400">
                        Address Details
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">
                            State *
                          </label>
                          <input
                            type="text"
                            value={stateName}
                            onChange={(e) =>
                              setStateName(capitalizeWords(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">
                            District *
                          </label>
                          <input
                            type="text"
                            value={district}
                            onChange={(e) =>
                              setDistrict(capitalizeWords(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">
                            City
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) =>
                              setCity(capitalizeWords(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">
                            Village
                          </label>
                          <input
                            type="text"
                            value={village}
                            onChange={(e) =>
                              setVillage(capitalizeWords(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">
                            Door Number
                          </label>
                          <input
                            type="text"
                            value={doorNo}
                            onChange={(e) => setDoorNo(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          Complete Address
                        </label>
                        <textarea
                          value={completeAddress}
                          onChange={(e) => setCompleteAddress(e.target.value)}
                          rows={3}
                          placeholder="Enter complete address..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded font-bold text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-sm transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : editingHospital ? (
                      "Save Changes"
                    ) : (
                      "Confirm Register"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
