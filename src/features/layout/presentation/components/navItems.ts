import { HiHome, HiCash } from 'react-icons/hi';
import type { IconType } from 'react-icons';

export interface NavItem {
    id: string;
    title: string;
    icon: IconType;
    path: string;
}

export const navigationItems: NavItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: HiHome,
        path: '/',
    },
    {
        id: 'transactions',
        title: 'Transactions',
        icon: HiCash,
        path: '/transactions',
    },
];
