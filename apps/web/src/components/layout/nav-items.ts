import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Sprout,
  Layers,
  FileText,
  Bookmark,
  BookOpen,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New Analysis', href: '/analysis/new', icon: PlusCircle },
  { label: 'My Projects', href: '/projects', icon: FolderKanban },
  { label: 'Food Database', href: '/foods', icon: Sprout },
  { label: 'Packaging Materials', href: '/materials', icon: Layers },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Saved', href: '/saved', icon: Bookmark },
  { label: 'Learn', href: '/learn', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];
