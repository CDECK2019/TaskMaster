import React, { createContext, useContext, useState, useEffect } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

// Import all the icons we'll need for different themes
import { Home, List, Calendar, BarChart3, Settings, CheckSquare, LogOut, Plus, TrendingUp, Clock, Users, Target, Star, Edit3, Search, Filter, User, Tag, Flag, X, Mail, Lock, LogIn, UserPlus, Moon, Sun, MoreVertical, Trash2, FolderOpen, Workflow, Layers, CheckCircle, Circle, GripVertical, Monitor, Folder, FileText, PieChart, Cog, Square, Power, PlusCircle, Activity, Timer, UserCheck, Crosshair, Bookmark, Edit, Zap, Sliders, UserX, Hash, AlertTriangle, XCircle, AtSign, Key, DoorOpen, UserMinus, CloudMoon, CloudSun, Menu, Delete, Archive, GitBranch, Database, Disc, MousePointer, Grid3X3, Tv, HardDrive, CassetteTape as Cassette, Radio, Gamepad2, Box, Zap as Lightning, PlusCircle as CirclePlus, Cpu, Hourglass, Notebook as Robot, Radar, Heart, Pen, Sparkles, Equal as Equalizer, Ghost, Music, Flame, XSquare, Headphones, Microwave as Microchip, LogOut as Exit, UserCog, Eclipse, Sunrise, AlignJustify, Trash, Package, Network, HardDriveIcon, Disc3, Joystick, Blocks, Minus, Dot, ArrowRight, ArrowUp, ArrowDown, ArrowLeft, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, MoreHorizontal, Eye, EyeOff, Check, Slash, Move, Maximize, Minimize, RotateCcw, Smile, Heart as Love, Coffee, Zap as Bolt, Sparkles as Magic, Gift, Palette, Gamepad, PartyPopper, Cake, Candy, Crown, Diamond, Gem, Rainbow, Rocket, Wand2, Popcorn as Unicorn } from 'lucide-react';

export type IconTheme = 'modern' | 'retro90s' | 'retro80s' | 'minimal' | 'playful' | 'pepicons' | 'pixelart';

interface IconMapping {
  // Navigation
  home: LucideIcon;
  projects: LucideIcon;
  tasks: LucideIcon;
  timeline: LucideIcon;
  workstreams: LucideIcon;
  settings: LucideIcon;
  
  // Actions
  add: LucideIcon;
  edit: LucideIcon;
  delete: LucideIcon;
  search: LucideIcon;
  filter: LucideIcon;
  more: LucideIcon;
  close: LucideIcon;
  logout: LucideIcon;
  
  // Status & Progress
  completed: LucideIcon;
  pending: LucideIcon;
  starred: LucideIcon;
  trending: LucideIcon;
  clock: LucideIcon;
  target: LucideIcon;
  
  // User & Social
  user: LucideIcon;
  users: LucideIcon;
  mail: LucideIcon;
  login: LucideIcon;
  signup: LucideIcon;
  
  // Content
  folder: LucideIcon;
  workflow: LucideIcon;
  layers: LucideIcon;
  tag: LucideIcon;
  flag: LucideIcon;
  
  // Theme
  darkMode: LucideIcon;
  lightMode: LucideIcon;
  
  // Misc
  calendar: LucideIcon;
  lock: LucideIcon;
  grip: LucideIcon;
}

// Create SVG icon components for Pepicons and Pixelarticons
const createSVGIcon = (svgContent: string, viewBox: string = "0 0 24 24") => {
  return ({ className, ...props }: { className?: string; [key: string]: any }) => (
    <svg
      className={className}
      viewBox={viewBox}
      fill="currentColor"
      {...props}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

// Pepicons SVG content (80s style retro icons)
const pepiconsSVGs = {
  home: createSVGIcon('<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>'),
  projects: createSVGIcon('<path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>'),
  tasks: createSVGIcon('<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'),
  timeline: createSVGIcon('<path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>'),
  workstreams: createSVGIcon('<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>'),
  settings: createSVGIcon('<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>'),
  add: createSVGIcon('<path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>'),
  edit: createSVGIcon('<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="m18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
  delete: createSVGIcon('<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>'),
  search: createSVGIcon('<path d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>'),
  filter: createSVGIcon('<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>'),
  more: createSVGIcon('<path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>'),
  close: createSVGIcon('<path d="m18 6-12 12M6 6l12 12"/>'),
  logout: createSVGIcon('<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>'),
  completed: createSVGIcon('<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'),
  pending: createSVGIcon('<circle cx="12" cy="12" r="10"/>'),
  starred: createSVGIcon('<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'),
  trending: createSVGIcon('<path d="m22 7-8.5 8.5-5-5L2 17"/>'),
  clock: createSVGIcon('<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>'),
  target: createSVGIcon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  user: createSVGIcon('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  users: createSVGIcon('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'),
  mail: createSVGIcon('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
  login: createSVGIcon('<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>'),
  signup: createSVGIcon('<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>'),
  folder: createSVGIcon('<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>'),
  workflow: createSVGIcon('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-6-6-6 6"/>'),
  layers: createSVGIcon('<polygon points="12,2 2,7 12,12 22,7 12,2"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/>'),
  tag: createSVGIcon('<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
  flag: createSVGIcon('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),
  darkMode: createSVGIcon('<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'),
  lightMode: createSVGIcon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'),
  calendar: createSVGIcon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  lock: createSVGIcon('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="7" r="4"/>'),
  grip: createSVGIcon('<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>')
};

// Pixelart SVG content (pixel art style icons)
const pixelartSVGs = {
  home: createSVGIcon('<rect x="2" y="10" width="20" height="12" fill="currentColor"/><polygon points="12,2 2,10 22,10" fill="currentColor"/><rect x="8" y="14" width="3" height="4" fill="white"/><rect x="13" y="14" width="3" height="4" fill="white"/>'),
  projects: createSVGIcon('<rect x="2" y="6" width="20" height="14" fill="currentColor"/><rect x="4" y="8" width="16" height="2" fill="white"/><rect x="4" y="12" width="16" height="2" fill="white"/><rect x="4" y="16" width="16" height="2" fill="white"/>'),
  tasks: createSVGIcon('<rect x="2" y="2" width="20" height="20" fill="currentColor"/><rect x="4" y="4" width="16" height="16" fill="white"/><rect x="6" y="10" width="4" height="4" fill="currentColor"/><rect x="12" y="8" width="6" height="2" fill="currentColor"/><rect x="12" y="12" width="6" height="2" fill="currentColor"/>'),
  timeline: createSVGIcon('<rect x="2" y="4" width="20" height="16" fill="currentColor"/><rect x="4" y="6" width="16" height="2" fill="white"/><rect x="6" y="10" width="2" height="2" fill="white"/><rect x="10" y="10" width="2" height="2" fill="white"/><rect x="14" y="10" width="2" height="2" fill="white"/><rect x="18" y="10" width="2" height="2" fill="white"/>'),
  workstreams: createSVGIcon('<rect x="2" y="2" width="6" height="20" fill="currentColor"/><rect x="10" y="6" width="6" height="16" fill="currentColor"/><rect x="18" y="10" width="4" height="12" fill="currentColor"/>'),
  settings: createSVGIcon('<rect x="10" y="2" width="4" height="20" fill="currentColor"/><rect x="2" y="10" width="20" height="4" fill="currentColor"/><rect x="6" y="6" width="12" height="12" fill="white"/><rect x="8" y="8" width="8" height="8" fill="currentColor"/>'),
  add: createSVGIcon('<rect x="10" y="4" width="4" height="16" fill="currentColor"/><rect x="4" y="10" width="16" height="4" fill="currentColor"/>'),
  edit: createSVGIcon('<rect x="2" y="2" width="16" height="16" fill="currentColor"/><rect x="4" y="4" width="12" height="12" fill="white"/><rect x="16" y="6" width="6" height="2" fill="currentColor"/><rect x="18" y="8" width="4" height="2" fill="currentColor"/>'),
  delete: createSVGIcon('<rect x="6" y="2" width="12" height="4" fill="currentColor"/><rect x="4" y="6" width="16" height="16" fill="currentColor"/><rect x="6" y="8" width="12" height="12" fill="white"/><rect x="8" y="10" width="2" height="8" fill="currentColor"/><rect x="14" y="10" width="2" height="8" fill="currentColor"/>'),
  search: createSVGIcon('<circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2"/><rect x="16" y="16" width="6" height="6" fill="currentColor"/>'),
  filter: createSVGIcon('<polygon points="2,2 22,2 14,10 14,18 10,22 10,10" fill="currentColor"/>'),
  more: createSVGIcon('<rect x="10" y="4" width="4" height="4" fill="currentColor"/><rect x="10" y="10" width="4" height="4" fill="currentColor"/><rect x="10" y="16" width="4" height="4" fill="currentColor"/>'),
  close: createSVGIcon('<rect x="4" y="4" width="4" height="4" fill="currentColor"/><rect x="8" y="8" width="4" height="4" fill="currentColor"/><rect x="12" y="12" width="4" height="4" fill="currentColor"/><rect x="16" y="16" width="4" height="4" fill="currentColor"/><rect x="16" y="4" width="4" height="4" fill="currentColor"/><rect x="12" y="8" width="4" height="4" fill="currentColor"/><rect x="8" y="12" width="4" height="4" fill="currentColor"/><rect x="4" y="16" width="4" height="4" fill="currentColor"/>'),
  logout: createSVGIcon('<rect x="2" y="4" width="12" height="16" fill="currentColor"/><rect x="4" y="6" width="8" height="12" fill="white"/><rect x="16" y="10" width="6" height="4" fill="currentColor"/><polygon points="18,8 22,12 18,16" fill="currentColor"/>'),
  completed: createSVGIcon('<rect x="2" y="2" width="20" height="20" fill="currentColor"/><rect x="4" y="4" width="16" height="16" fill="white"/><rect x="6" y="10" width="4" height="4" fill="currentColor"/><rect x="10" y="12" width="2" height="2" fill="currentColor"/><rect x="12" y="8" width="6" height="2" fill="currentColor"/>'),
  pending: createSVGIcon('<rect x="2" y="2" width="20" height="20" fill="currentColor"/><rect x="4" y="4" width="16" height="16" fill="white"/>'),
  starred: createSVGIcon('<polygon points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9" fill="currentColor"/>'),
  trending: createSVGIcon('<rect x="2" y="18" width="4" height="4" fill="currentColor"/><rect x="8" y="14" width="4" height="8" fill="currentColor"/><rect x="14" y="10" width="4" height="12" fill="currentColor"/><rect x="20" y="6" width="2" height="16" fill="currentColor"/>'),
  clock: createSVGIcon('<rect x="2" y="2" width="20" height="20" fill="currentColor"/><rect x="4" y="4" width="16" height="16" fill="white"/><rect x="11" y="6" width="2" height="6" fill="currentColor"/><rect x="13" y="11" width="4" height="2" fill="currentColor"/>'),
  target: createSVGIcon('<rect x="2" y="2" width="20" height="20" fill="currentColor"/><rect x="6" y="6" width="12" height="12" fill="white"/><rect x="10" y="10" width="4" height="4" fill="currentColor"/>'),
  user: createSVGIcon('<rect x="8" y="4" width="8" height="8" fill="currentColor"/><rect x="4" y="14" width="16" height="8" fill="currentColor"/><rect x="6" y="16" width="12" height="4" fill="white"/>'),
  users: createSVGIcon('<rect x="2" y="4" width="6" height="6" fill="currentColor"/><rect x="16" y="4" width="6" height="6" fill="currentColor"/><rect x="2" y="14" width="20" height="8" fill="currentColor"/><rect x="4" y="16" width="16" height="4" fill="white"/>'),
  mail: createSVGIcon('<rect x="2" y="6" width="20" height="12" fill="currentColor"/><rect x="4" y="8" width="16" height="8" fill="white"/><polygon points="4,8 12,12 20,8" fill="currentColor"/>'),
  login: createSVGIcon('<rect x="2" y="4" width="12" height="16" fill="currentColor"/><rect x="4" y="6" width="8" height="12" fill="white"/><rect x="16" y="10" width="6" height="4" fill="currentColor"/><polygon points="18,8 22,12 18,16" fill="currentColor"/>'),
  signup: createSVGIcon('<rect x="6" y="4" width="8" height="8" fill="currentColor"/><rect x="2" y="14" width="16" height="8" fill="currentColor"/><rect x="4" y="16" width="12" height="4" fill="white"/><rect x="18" y="8" width="4" height="4" fill="currentColor"/><rect x="20" y="6" width="2" height="8" fill="currentColor"/>'),
  folder: createSVGIcon('<rect x="2" y="6" width="20" height="14" fill="currentColor"/><rect x="4" y="8" width="16" height="10" fill="white"/><rect x="2" y="4" width="8" height="4" fill="currentColor"/>'),
  workflow: createSVGIcon('<rect x="2" y="2" width="6" height="6" fill="currentColor"/><rect x="16" y="2" width="6" height="6" fill="currentColor"/><rect x="2" y="16" width="6" height="6" fill="currentColor"/><rect x="16" y="16" width="6" height="6" fill="currentColor"/><rect x="8" y="10" width="8" height="4" fill="currentColor"/>'),
  layers: createSVGIcon('<rect x="4" y="8" width="16" height="4" fill="currentColor"/><rect x="2" y="12" width="20" height="4" fill="currentColor"/><rect x="6" y="16" width="12" height="4" fill="currentColor"/>'),
  tag: createSVGIcon('<polygon points="2,2 12,2 22,12 12,22 2,12" fill="currentColor"/><polygon points="4,4 10,4 18,12 10,20 4,14" fill="white"/><rect x="6" y="6" width="2" height="2" fill="currentColor"/>'),
  flag: createSVGIcon('<rect x="4" y="2" width="2" height="20" fill="currentColor"/><rect x="6" y="2" width="14" height="10" fill="currentColor"/><rect x="8" y="4" width="10" height="6" fill="white"/>'),
  darkMode: createSVGIcon('<path d="M8 2a10 10 0 1010 10A10 10 0 008 2z" fill="currentColor"/>'),
  lightMode: createSVGIcon('<rect x="10" y="2" width="4" height="4" fill="currentColor"/><rect x="10" y="18" width="4" height="4" fill="currentColor"/><rect x="2" y="10" width="4" height="4" fill="currentColor"/><rect x="18" y="10" width="4" height="4" fill="currentColor"/><rect x="4" y="4" width="2" height="2" fill="currentColor"/><rect x="18" y="4" width="2" height="2" fill="currentColor"/><rect x="4" y="18" width="2" height="2" fill="currentColor"/><rect x="18" y="18" width="2" height="2" fill="currentColor"/><rect x="8" y="8" width="8" height="8" fill="currentColor"/>'),
  calendar: createSVGIcon('<rect x="2" y="4" width="20" height="18" fill="currentColor"/><rect x="4" y="6" width="16" height="14" fill="white"/><rect x="6" y="2" width="2" height="6" fill="currentColor"/><rect x="16" y="2" width="2" height="6" fill="currentColor"/><rect x="4" y="10" width="16" height="2" fill="currentColor"/>'),
  lock: createSVGIcon('<rect x="6" y="10" width="12" height="12" fill="currentColor"/><rect x="8" y="12" width="8" height="8" fill="white"/><rect x="8" y="6" width="8" height="6" fill="none" stroke="currentColor" stroke-width="2"/>'),
  grip: createSVGIcon('<rect x="6" y="4" width="2" height="2" fill="currentColor"/><rect x="16" y="4" width="2" height="2" fill="currentColor"/><rect x="6" y="11" width="2" height="2" fill="currentColor"/><rect x="16" y="11" width="2" height="2" fill="currentColor"/><rect x="6" y="18" width="2" height="2" fill="currentColor"/><rect x="16" y="18" width="2" height="2" fill="currentColor"/>')
};

const iconThemes: Record<IconTheme, IconMapping> = {
  modern: {
    home: Home,
    projects: List,
    tasks: CheckSquare,
    timeline: Calendar,
    workstreams: BarChart3,
    settings: Settings,
    add: Plus,
    edit: Edit3,
    delete: Trash2,
    search: Search,
    filter: Filter,
    more: MoreVertical,
    close: X,
    logout: LogOut,
    completed: CheckCircle,
    pending: Circle,
    starred: Star,
    trending: TrendingUp,
    clock: Clock,
    target: Target,
    user: User,
    users: Users,
    mail: Mail,
    login: LogIn,
    signup: UserPlus,
    folder: FolderOpen,
    workflow: Workflow,
    layers: Layers,
    tag: Tag,
    flag: Flag,
    darkMode: Moon,
    lightMode: Sun,
    calendar: Calendar,
    lock: Lock,
    grip: GripVertical
  },
  
  retro90s: {
    home: Monitor,
    projects: Folder,
    tasks: Square,
    timeline: FileText,
    workstreams: PieChart,
    settings: Cog,
    add: PlusCircle,
    edit: Edit,
    delete: Delete,
    search: Zap,
    filter: Sliders,
    more: Menu,
    close: XCircle,
    logout: Power,
    completed: Disc,
    pending: MousePointer,
    starred: Bookmark,
    trending: Activity,
    clock: Timer,
    target: Crosshair,
    user: UserX,
    users: UserCheck,
    mail: AtSign,
    login: DoorOpen,
    signup: UserMinus,
    folder: Archive,
    workflow: GitBranch,
    layers: Database,
    tag: Hash,
    flag: AlertTriangle,
    darkMode: CloudMoon,
    lightMode: CloudSun,
    calendar: Grid3X3,
    lock: Key,
    grip: Menu
  },
  
  retro80s: {
    home: Tv,
    projects: HardDrive,
    tasks: Box,
    timeline: Cassette,
    workstreams: Radio,
    settings: Gamepad2,
    add: CirclePlus,
    edit: Pen,
    delete: Trash,
    search: Sparkles,
    filter: Equalizer,
    more: AlignJustify,
    close: XSquare,
    logout: Exit,
    completed: Disc3,
    pending: Joystick,
    starred: Heart,
    trending: Cpu,
    clock: Hourglass,
    target: Radar,
    user: Ghost,
    users: Robot,
    mail: Headphones,
    login: Microchip,
    signup: UserCog,
    folder: Package,
    workflow: Network,
    layers: HardDriveIcon,
    tag: Music,
    flag: Flame,
    darkMode: Eclipse,
    lightMode: Sunrise,
    calendar: Blocks,
    lock: Lightning,
    grip: AlignJustify
  },
  
  minimal: {
    home: Dot,
    projects: Minus,
    tasks: Check,
    timeline: ArrowRight,
    workstreams: MoreHorizontal,
    settings: Eye,
    add: ChevronUp,
    edit: Move,
    delete: Slash,
    search: Eye,
    filter: EyeOff,
    more: MoreHorizontal,
    close: Minimize,
    logout: ArrowLeft,
    completed: Check,
    pending: Dot,
    starred: ArrowUp,
    trending: ArrowUp,
    clock: RotateCcw,
    target: Dot,
    user: Dot,
    users: MoreHorizontal,
    mail: ArrowRight,
    login: ChevronRight,
    signup: ChevronUp,
    folder: Maximize,
    workflow: ArrowRight,
    layers: MoreHorizontal,
    tag: Minus,
    flag: ArrowUp,
    darkMode: Dot,
    lightMode: ArrowUp,
    calendar: MoreHorizontal,
    lock: Minus,
    grip: MoreHorizontal
  },
  
  playful: {
    home: Smile,
    projects: Gift,
    tasks: Crown,
    timeline: Rainbow,
    workstreams: Palette,
    settings: Gamepad,
    add: Magic,
    edit: Wand2,
    delete: Candy,
    search: Gem,
    filter: Diamond,
    more: PartyPopper,
    close: Love,
    logout: Rocket,
    completed: Cake,
    pending: Coffee,
    starred: Love,
    trending: Bolt,
    clock: Coffee,
    target: Crown,
    user: Smile,
    users: PartyPopper,
    mail: Love,
    login: Rocket,
    signup: Magic,
    folder: Gift,
    workflow: Rainbow,
    layers: Palette,
    tag: Gem,
    flag: Crown,
    darkMode: Love,
    lightMode: Magic,
    calendar: Cake,
    lock: Diamond,
    grip: PartyPopper
  },

  // New Pepicons theme (80s retro style)
  pepicons: pepiconsSVGs,

  // New Pixelart theme (pixel art style)
  pixelart: pixelartSVGs
};

interface IconThemeContextType {
  currentTheme: IconTheme;
  setTheme: (theme: IconTheme) => void;
  icons: IconMapping;
  availableThemes: { id: IconTheme; name: string; description: string; source?: string }[];
}

const IconThemeContext = createContext<IconThemeContextType | undefined>(undefined);

export const useIconTheme = () => {
  const context = useContext(IconThemeContext);
  if (context === undefined) {
    throw new Error('useIconTheme must be used within an IconThemeProvider');
  }
  return context;
};

interface IconThemeProviderProps {
  children: React.ReactNode;
}

export const IconThemeProvider: React.FC<IconThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<IconTheme>(() => {
    const saved = localStorage.getItem('iconTheme');
    return (saved as IconTheme) || 'modern';
  });

  useEffect(() => {
    localStorage.setItem('iconTheme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme: IconTheme) => {
    setCurrentTheme(theme);
  };

  const availableThemes = [
    {
      id: 'modern' as IconTheme,
      name: 'Modern',
      description: 'Clean, contemporary icons for a professional look'
    },
    {
      id: 'retro90s' as IconTheme,
      name: '90s Nostalgia',
      description: 'Chunky, bold icons reminiscent of early computing'
    },
    {
      id: 'retro80s' as IconTheme,
      name: '80s Synthwave',
      description: 'Neon-inspired icons with retro-futuristic vibes'
    },
    {
      id: 'pepicons' as IconTheme,
      name: 'Pepicons Retro',
      description: 'Authentic 80s-style icons with vintage charm',
      source: 'Open Source (CC BY 4.0)'
    },
    {
      id: 'pixelart' as IconTheme,
      name: 'Pixel Art',
      description: 'Classic pixel art icons for that retro gaming feel',
      source: 'Open Source (MIT)'
    },
    {
      id: 'minimal' as IconTheme,
      name: 'Minimal',
      description: 'Ultra-clean, geometric shapes for maximum focus'
    },
    {
      id: 'playful' as IconTheme,
      name: 'Playful',
      description: 'Fun, whimsical icons to brighten your workflow'
    }
  ];

  const value = {
    currentTheme,
    setTheme,
    icons: iconThemes[currentTheme],
    availableThemes
  };

  return (
    <IconThemeContext.Provider value={value}>
      {children}
    </IconThemeContext.Provider>
  );
};