import { HiHome, HiUserGroup, HiCalendar, HiCollection, HiClipboardList } from 'react-icons/hi';
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
        id: 'follow-ups',
        title: 'Follow-ups',
        icon: HiCalendar,
        path: '/follow-ups',
    },
    {
        id: 'leads',
        title: 'Leads',
        icon: HiUserGroup,
        path: '/leads',
    },
    {
        id: 'groups',
        title: 'Groups',
        icon: HiCollection,
        path: '/groups',
    },
    {
        id: 'todo',
        title: 'Todo',
        icon: HiClipboardList,
        path: '/todo',
    },
];
