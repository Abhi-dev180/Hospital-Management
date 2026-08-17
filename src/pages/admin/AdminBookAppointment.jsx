import DashboardLayout from '../../components/DashboardLayout';
import BookAppointmentShared from '../../components/portal/BookAppointmentShared';
import { Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminBookAppointment() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl shadow-medical-blue/5 border border-gray-100 overflow-hidden"
        >
          {/* Header section similar to PortalCardPage */}
          <div className="bg-gradient-to-br from-medical-dark to-medical-blue p-8 sm:p-10 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 shadow-inner ring-1 ring-white/30">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2">Book an Appointment</h2>
              <p className="text-blue-100 max-w-lg mx-auto leading-relaxed">
                Fill in the details to book an appointment on behalf of a patient.
              </p>
            </div>
          </div>
          
          <div className="p-6 sm:p-10">
            <BookAppointmentShared initialTab="book" presetHospitalId="" isAdminMode={true} />
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
