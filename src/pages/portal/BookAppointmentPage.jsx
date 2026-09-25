
import { useSearchParams } from 'react-router-dom';
import PortalCardPage from '../../components/portal/PortalCardPage';
import BookAppointmentShared from '../../components/portal/BookAppointmentShared';
import { Stethoscope, FlaskConical } from 'lucide-react';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const presetHospitalId = searchParams.get('hospitalId') || '';
  const initialTab = searchParams.get('tab') === 'manage' ? 'manage' : 'book';
  const isLab = searchParams.get('service') === 'lab' || Boolean(searchParams.get('test'));

  return (
    <PortalCardPage
      icon={isLab ? FlaskConical : Stethoscope}
      title={isLab ? 'Book Diagnostic Lab Test' : 'Book an Appointment'}
      subtitle={
        isLab
          ? 'Book NABL accredited diagnostic blood tests & health checkups with complimentary home sample collection.'
          : 'Fill in the details and the hospital you choose will confirm your visit.'
      }
      wide
    >
      <BookAppointmentShared initialTab={initialTab} presetHospitalId={presetHospitalId} />
    </PortalCardPage>
  );
}