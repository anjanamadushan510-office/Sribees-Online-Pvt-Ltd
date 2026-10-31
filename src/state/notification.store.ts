import { create } from 'zustand';
import { Notification, NotificationType } from '@/interfaces/notification.interface';

interface NotificationUIStore {
  isDropdownOpen: boolean;
  openDropdown: () => void;
  closeDropdown: () => void;
  toggleDropdown: () => void;
  setDropdownOpen: (isOpen: boolean) => void;
  
  activeTab: NotificationType;
  setActiveTab: (tab: NotificationType) => void;
  
  selectedNotification: Notification | null;
  setSelectedNotification: (notification: Notification | null) => void;
}

export const useNotificationStore = create<NotificationUIStore>((set) => ({
  isDropdownOpen: false,
  openDropdown: () => set({ isDropdownOpen: true }),
  closeDropdown: () => set({ isDropdownOpen: false, selectedNotification: null }),
  toggleDropdown: () => set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),
  setDropdownOpen: (isOpen) => set({ isDropdownOpen: isOpen }),

  activeTab: 'all',
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedNotification: null,
  setSelectedNotification: (notification) => set({ selectedNotification: notification }),
}));
