import { notFound } from 'next/navigation';
import DesignPreview from '@/components/ui-design/DesignPreview';
import { designPages, getDesignPage } from '@/lib/ui-design/catalog';
import '../../ui-design/ui-design.css';

export const metadata = {
  title: 'Teacher Dashboard Preview | Jembee Play',
  description: 'Frontend-only Teacher Dashboard design preview with illustrative sample data.',
};

export default function TeacherDashboardPreview() {
  const page = getDesignPage('teacher-dashboard');
  if (!page) notFound();

  return <DesignPreview page={page} allPages={designPages} />;
}
