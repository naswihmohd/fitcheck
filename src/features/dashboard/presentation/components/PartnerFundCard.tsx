import { formatCurrency } from '../../../../general/utils/formatCurrency';
import type { PartnerFundFlow } from '../../redux/dashboardSlice';

interface PartnerFundCardProps {
  flow: PartnerFundFlow;
  index: number;
  loading?: boolean;
}

function PartnerFundCard({ flow, loading }: PartnerFundCardProps) {
  const netClass =
    flow.net < 0 ? 'text-amber-600' : flow.net > 0 ? 'text-sky-700' : 'text-gray-900';

  return (
    <div
      style={{ boxShadow: '0px 0.92px 2.75px 0px #0051AF1A' }}
      className="rounded bg-white p-3 md:p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
      <h4 className="text-sm font-bold text-gray-900 md:text-base">{flow.name}</h4>
        <div className="text-right">
          <p className="text-[10px] font-medium text-gray-400">Net in company</p>
          <p className={`text-sm font-bold md:text-base ${netClass}`}>
            {loading ? '…' : formatCurrency(flow.net)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-sky-50 px-2.5 py-2">
          <p className="text-[10px] font-medium text-sky-700">Invested</p>
          <p className="mt-0.5 text-xs font-bold text-sky-800 md:text-sm">
            {loading ? '…' : formatCurrency(flow.investment)}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 px-2.5 py-2">
          <p className="text-[10px] font-medium text-amber-700">Withdrawn</p>
          <p className="mt-0.5 text-xs font-bold text-amber-800 md:text-sm">
            {loading ? '…' : formatCurrency(flow.withdrawal)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PartnerFundCard;
