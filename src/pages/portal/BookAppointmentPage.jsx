
import { useSearchParams } from 'react-router-dom';
import PortalCardPage from '../../components/portal/PortalCardPage';
import BookAppointmentShared from '../../components/portal/BookAppointmentShared';
import { Stethoscope } from 'lucide-react';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const presetHospitalId = searchParams.get('hospitalId') || '';
  const initialTab = searchParams.get('tab') === 'manage' ? 'manage' : 'book';

  return (
    <PortalCardPage
      icon={Stethoscope}
      title="Book an Appointment"
      subtitle="Fill in the details and the hospital you choose will confirm your visit."
      wide
    >
      <BookAppointmentShared initialTab={initialTab} presetHospitalId={presetHospitalId} />
    </PortalCardPage>
  );
}