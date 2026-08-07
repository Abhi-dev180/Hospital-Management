import { useEffect } from 'react';
import PublicFeedbackForm from '../../components/portal/PublicFeedbackForm';  

export default function FeedbackPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PublicFeedbackForm />
      </div>
    </div>
  );
}