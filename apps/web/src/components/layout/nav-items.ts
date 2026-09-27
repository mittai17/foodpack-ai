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
  Activity,
} from 'lucide-react';

export interface NavItem {
  /** Translation key under the 'navigation' namespace */
  translationKey: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { translationKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { translationKey: 'newAnalysis', href: '/analysis/new', icon: PlusCircle },
  { translationKey: 'iotSensors', href: '/iot', icon: Activity },
  { translationKey: 'myProjects', href: '/projects', icon: FolderKanban },
  { translationKey: 'foodDatabase', href: '/foods', icon: Sprout },
  { translationKey: 'packagingMaterials', href: '/materials', icon: Layers },
  { translationKey: 'reports', href: '/reports', icon: FileText },
  { translationKey: 'saved', href: '/saved', icon: Bookmark },
  { translationKey: 'learn', href: '/learn', icon: BookOpen },
  { translationKey: 'settings', href: '/settings', icon: Settings },
];

