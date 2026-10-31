import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, FileText, Printer, Download, Loader2, Pill, Stethoscope, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Modal from './ui/Modal';

const PrescriptionModal = ({ isOpen, onClose, appointment, userRole }) => {
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen && appointment) {
      const fetchPrescription = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${backendUrl}/api/prescriptions/${appointment.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data) {
            setMedicines(res.data.medicines);
            setInstructions(res.data.instructions);
          }
        } catch (err) {
          setMedicines('');
          setInstructions('');
        }
      };
      fetchPrescription();
    }
  }, [isOpen, appointment, backendUrl]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${backendUrl}/api/prescriptions`, 
        { appointmentId: appointment.id, medicines, instructions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Prescription Saved Successfully!");
      onClose();
    } catch (err) {
      toast.error("Failed to save prescription.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verified Digital Prescription"
      subtitle="UNESCO Horizon Care Network • Certified Clinical Rx"
      size="lg"
    >
      <div className="space-y-5 print:p-6 print:bg-white print:text-black">
        {/* Prescription Header / Seal */}
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center shadow-glow-cyan">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-[var(--text-primary)] print:text-black">
                AegisGlobal Electronic Prescription
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] print:text-gray-600 font-mono">
                Rx ID: #{appointment?.id || '0000'} • Tamper-Evident Digital Health Record
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
            <ShieldCheck className="h-4 w-4" /> Verified
          </div>
        </div>

        {/* Patient & Doctor Meta Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs print:bg-gray-50 print:border-gray-200">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-gray-500">Patient</p>
            <p className="font-semibold text-sm text-[var(--text-primary)] print:text-black">{appointment?.patient_name || "Valued Patient"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-gray-500">Date</p>
            <p className="font-semibold text-sm text-[var(--text-primary)] print:text-black">
              {appointment?.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="col-span-2 pt-2 border-t border-[var(--border-subtle)] print:border-gray-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] print:text-gray-500">Attending Specialist</p>
            <p className="font-semibold text-sm text-cyan-400 print:text-black">
              {userRole === 'doctor' ? 'Dr. ' + (appointment?.doctor_name || 'You') : `Dr. ${appointment?.doctor_name || 'Practitioner'}`}
            </p>
          </div>
        </div>

        {/* Medicines */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 print:text-black">
            <Pill className="h-3.5 w-3.5 text-emerald-500" /> Prescribed Formulations & Dosage
          </label>
          {userRole === 'doctor' ? (
            <textarea
              className="glass-input w-full min-h-[110px] resize-none text-xs leading-relaxed font-mono" 
              placeholder="e.g. Paracetamol 500mg — 1 Tab TDS after meals x 3 days&#10;Cetirizine 10mg — 1 Tab HS x 5 days" 
              value={medicines}
              onChange={(e) => setMedicines(e.target.value)}
            />
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs sm:text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-mono print:text-black print:bg-white print:border-gray-300">
              {medicines || "No medications prescribed yet."}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 print:text-black">
            <Stethoscope className="h-3.5 w-3.5 text-cyan-500" /> Clinical Instructions & Follow-up
          </label>
          {userRole === 'doctor' ? (
            <textarea
              className="glass-input w-full min-h-[90px] resize-none text-xs leading-relaxed"
              placeholder="e.g. Maintain hydration, avoid direct cold exposure, follow-up after 5 days if fever persists."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          ) : (
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed print:text-black print:bg-white print:border-gray-300">
              {instructions || "Maintain regular rest and follow general wellness recommendations."}
            </div>
          )}
        </div>

        {/* Actions Strip */}
        <div className="flex flex-wrap gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider glass border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>

          {userRole === 'doctor' && (
            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider gradient-primary text-white shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Issuing Rx...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Issue & Sign Prescription</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PrescriptionModal;
