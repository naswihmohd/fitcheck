import { useState } from 'react';
import { FiArrowDownRight, FiArrowUpRight, FiEdit2, FiPaperclip, FiTrash2 } from 'react-icons/fi';
import { deleteDoc, doc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { db } from '../../../../firebaseConfig';
import deleteImageFromStorageWithUrl from '../../../../general/utils/deleteImageFromStorageWithUrl';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import { removeTransaction } from '../../redux/transactionSlice';
import { isCreditType, type TransactionProps } from '../../data/transactionTypes';
import TransactionCard from './TransactionCard';
import TransactionDetailsModal from './TransactionDetailsModal';
import {
  formatSignedAmount,
  formatTransactionDate,
  getAmountTextClass,
  getCofounderLabel,
  getTransactionTypeLabel,
  getTypeBadgeClass,
  getTypeIconWrapClass,
} from '../utils/transactionHelpers';

interface TransactionTableProps {
  transactions: TransactionProps[];
  onEdit: (transaction: TransactionProps) => void;
}

function TransactionTable({ transactions, onEdit }: TransactionTableProps) {
  const dispatch = useDispatch();
  const [showDeleteModalId, setShowDeleteModalId] = useState<string | null>(null);
  const [detailedTransaction, setDetailedTransaction] = useState<TransactionProps | null>(null);

  const selectedTransaction = transactions.find((item) => item.id === showDeleteModalId);

  const handleDelete = async () => {
    if (!showDeleteModalId) return;
    try {
      if (selectedTransaction?.attachmentUrl) {
        try {
          await deleteImageFromStorageWithUrl(selectedTransaction.attachmentUrl);
        } catch (storageError) {
          console.error('Error deleting attachment from storage:', storageError);
        }
      }
      await deleteDoc(doc(db, 'transactions', showDeleteModalId));
      dispatch(removeTransaction(showDeleteModalId));
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setShowDeleteModalId(null);
    }
  };

  return (
    <>
      <div className="space-y-2 md:hidden">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={setShowDeleteModalId}
            onViewDetail={setDetailedTransaction}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-[#FAF9F6]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                No
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Note
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {transactions.map((transaction, index) => {
              const isCredit = isCreditType(transaction.type);
              const partnerLabel = getCofounderLabel(transaction.partner);
              return (
                <tr
                  key={transaction.id}
                  className="transition-colors duration-150 hover:bg-[#FAF9F6]/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer hover:bg-slate-50/50"
                    onClick={() => setDetailedTransaction(transaction)}
                    title="View transaction details"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${getTypeIconWrapClass(transaction.type)}`}
                      >
                        {isCredit ? (
                          <FiArrowUpRight className="h-4 w-4" />
                        ) : (
                          <FiArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 max-w-[280px]">
                        <div className="truncate text-sm font-semibold text-gray-900">
                          {transaction.note || '—'}
                          {transaction.attachmentUrl && (
                            <FiPaperclip className="ml-1.5 inline h-3.5 w-3.5 text-gray-400" />
                          )}
                        </div>
                        {partnerLabel && (
                          <div className="text-xs font-medium text-gray-500">{partnerLabel}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getTypeBadgeClass(transaction.type)}`}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td
                    className={`whitespace-nowrap px-6 py-4 text-sm font-bold ${getAmountTextClass(transaction.type)}`}
                  >
                    {formatSignedAmount(transaction.amount, transaction.type)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                    {formatTransactionDate(transaction.date) || (
                      <span className="text-gray-300">Not set</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="rounded-lg p-2 text-blue-600 transition-all duration-200 hover:bg-blue-50"
                        title="Edit Transaction"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModalId(transaction.id)}
                        className="rounded-lg p-2 text-red-600 transition-all duration-200 hover:bg-red-50"
                        title="Delete Transaction"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TransactionDetailsModal
        isOpen={!!detailedTransaction}
        transaction={detailedTransaction}
        onClose={() => setDetailedTransaction(null)}
      />

      {selectedTransaction && showDeleteModalId && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setShowDeleteModalId(null)}
          onConfirm={handleDelete}
          message={`Are you sure you want to delete this ${selectedTransaction.type} of "${selectedTransaction.note}"?`}
        />
      )}
    </>
  );
}

export default TransactionTable;
