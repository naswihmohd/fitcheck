import { FiArrowDownRight, FiArrowUpRight, FiCalendar, FiEdit2, FiPaperclip, FiTrash2 } from 'react-icons/fi';
import { isCreditType, type TransactionProps } from '../../data/transactionTypes';
import {
  formatSignedAmount,
  formatTransactionDate,
  getAmountTextClass,
  getCofounderLabel,
  getTransactionTypeLabel,
  getTypeBadgeClass,
  getTypeIconWrapClass,
} from '../utils/transactionHelpers';

interface TransactionCardProps {
  transaction: TransactionProps;
  onEdit: (transaction: TransactionProps) => void;
  onDelete: (transactionId: string) => void;
  onViewDetail: (transaction: TransactionProps) => void;
}

function TransactionCard({ transaction, onEdit, onDelete, onViewDetail }: TransactionCardProps) {
  const dateLabel = formatTransactionDate(transaction.date);
  const isCredit = isCreditType(transaction.type);
  const partnerLabel = getCofounderLabel(transaction.partner);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetail(transaction)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left transition-all hover:opacity-80 active:scale-[0.98]"
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getTypeIconWrapClass(transaction.type)}`}
          >
            {isCredit ? (
              <FiArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <FiArrowDownRight className="h-3.5 w-3.5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-semibold text-gray-900">
              {transaction.note}
              {transaction.attachmentUrl && (
                <FiPaperclip className="ml-1 inline h-3 w-3 text-gray-400" />
              )}
            </h3>
            <p className={`text-[11px] font-bold ${getAmountTextClass(transaction.type)}`}>
              {formatSignedAmount(transaction.amount, transaction.type)}
            </p>
            {partnerLabel && (
              <p className="truncate text-[10px] text-gray-500">{partnerLabel}</p>
            )}
          </div>
        </button>

        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${getTypeBadgeClass(transaction.type)}`}
        >
          {getTransactionTypeLabel(transaction.type)}
        </span>
      </div>

      {dateLabel && (
        <div className="mt-2 flex items-center gap-1 border-t border-gray-100 pt-2 text-[11px] text-gray-600">
          <FiCalendar className="h-3 w-3 shrink-0 text-gray-400" />
          <span>{dateLabel}</span>
        </div>
      )}

      <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={() => onEdit(transaction)}
          className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
          title="Edit Transaction"
          aria-label="Edit transaction"
        >
          <FiEdit2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(transaction.id)}
          className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
          title="Delete Transaction"
          aria-label="Delete transaction"
        >
          <FiTrash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default TransactionCard;
