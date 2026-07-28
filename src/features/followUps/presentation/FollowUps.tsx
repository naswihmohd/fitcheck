import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { motion } from 'framer-motion';
import type { LeadProps } from '../../leadsManagement/data/leadTypes';
import LeadModal from '../../leadsManagement/presentation/components/LeadModal';
import { FOLLOW_UP_TABS } from '../data/followUpTypes';

export interface FollowUpsOutletContext {
  onEditLead: (lead: LeadProps) => void;
}

function FollowUps() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadProps | null>(null);

  const handleEditLead = (lead: LeadProps) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const outletContext: FollowUpsOutletContext = {
    onEditLead: handleEditLead,
  };

  return (
    <div className="min-h-screen space-y-2.5 pb-8 md:space-y-6 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-0.5 md:gap-1"
      >
        <h1 className="text-base font-bold text-gray-900 md:text-xl">Follow-ups</h1>
        <p className="text-xs text-gray-500 md:text-sm">
          Track today&apos;s follow-ups, new leads, and overdue items
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="-mx-1 flex border-b border-gray-200 pb-px md:mx-0 md:gap-1"
      >
        {FOLLOW_UP_TABS.map((tab) => (
          <NavLink
            key={tab.filter}
            to={tab.path}
            className={({ isActive }) =>
              [
                'min-w-0 flex-1 border-b-2 px-1.5 py-2 text-center text-[11px] font-semibold leading-tight transition-colors md:flex-none md:whitespace-nowrap md:px-4 md:py-2.5 md:text-left md:text-sm md:leading-normal',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              ].join(' ')
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </motion.div>

      <Outlet context={outletContext} />

      <LeadModal isOpen={isModalOpen} onClose={handleCloseModal} lead={editingLead} />
    </div>
  );
}

export default FollowUps;
