import { MdAddIcCall } from 'react-icons/md';
import ProfileAvatar from '../../../../general/components/ProfileAvatar';
import type { CustomerProps } from '../../data/customerType';
import { RiWhatsappFill } from 'react-icons/ri';
import { formatPhoneNumber } from '../../../../general/utils/formatPhoneNumber';
import BlockToggle from './BlockToggle';

interface UserCardProps {
    user: CustomerProps;
}

function formatCreatedDate(user: CustomerProps): string {
    const createdAtDate = user.createdAt?.toDate?.();
    if (!createdAtDate) return '--';

    return createdAtDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function UserCard({ user }: UserCardProps) {
    return (
        <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <ProfileAvatar
                        name={user.name}
                        imageUrl={user.profileImage}
                        size="sm"
                        className="border-2 border-gray-200"
                    />
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                </div>
            </td>
            <td className="px-4 py-3">
                <p className="text-sm text-gray-700">{user.email}</p>
            </td>
            <td className="px-4 py-3">
                <p className="text-sm text-gray-700">
                    <span className="inline-flex items-center text-gray-500" title="Phone">
                        <MdAddIcCall />
                    </span>{' '}
                    {formatPhoneNumber(user.phoneNumber) || '--'}
                </p>
                {user.whatsappNumber && (
                    <p className="text-sm text-gray-700">
                        <span className="inline-flex items-center text-gray-500" title="WhatsApp">
                            <RiWhatsappFill />
                        </span>{' '}
                        {formatPhoneNumber(user.whatsappNumber) || '--'}
                    </p>
                )}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">{formatCreatedDate(user)}</td>
            <td className="px-4 py-3">
                <BlockToggle customer={user} />
            </td>
        </tr>
    );
}

export default UserCard;
