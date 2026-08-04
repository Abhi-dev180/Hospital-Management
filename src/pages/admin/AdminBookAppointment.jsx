import DashboardLayout from '../../components/DashboardLayout';
import BookAppointmentShared from '../../components/portal/BookAppointmentShared';

export default function AdminBookAppointment() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-4">Book Appointment (Admin)</h2>
        <BookAppointmentShared initialTab="book" presetHospitalId="" />
      </div>
    </DashboardLayout>
  );
}
