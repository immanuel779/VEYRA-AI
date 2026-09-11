import { useState } from 'react';
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, Check, X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  type ConversationDoc,
  groupByDate,
} from '../../services/conversations';

interface Props {
  conversations: ConversationDoc[];
  activeId: string | null;
  loading: boolean;
  search: string;
  onSearchChange: (s: string) => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  conversations,
  activeId,
  loading,
  search,
  onSearchChange,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = search.trim()
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  const { today, yesterday, older } = groupByDate(filtered);

  function startEdit(c: ConversationDoc) {
    setEditingId(c.id);
    setEditValue(c.title);
    setOpenMenuId(null);
  }

  function commitEdit() {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 pb-2 space-y-2">
        <Button
          variant="outline"
          size="md"
          className="justify-start w-full"
          onClick={onNewChat}
        >
          <Plus size={15} className="text-accent" />
          <span>New chat</span>
        </Button>

        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-edge bg-canvas text-xs placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <div className="px-3 py-6 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 rounded-lg bg-edge/40 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-muted/70 italic">
              {search ? 'No matches' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <Group label="Today" items={today} {...{ activeId, editingId, editValue, openMenuId, setEditValue, setEditingId, setOpenMenuId, onSelect, startEdit, commitEdit, onDelete }} />
            )}
            {yesterday.length > 0 && (
              <Group label="Yesterday" items={yesterday} {...{ activeId, editingId, editValue, openMenuId, setEditValue, setEditingId, setOpenMenuId, onSelect, startEdit, commitEdit, onDelete }} />
            )}
            {older.length > 0 && (
              <Group label="Older" items={older} {...{ activeId, editingId, editValue, openMenuId, setEditValue, setEditingId, setOpenMenuId, onSelect, startEdit, commitEdit, onDelete }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface GroupProps {
  label: string;
  items: ConversationDoc[];
  activeId: string | null;
  editingId: string | null;
  editValue: string;
  openMenuId: string | null;
  setEditValue: (v: string) => void;
  setEditingId: (v: string | null) => void;
  setOpenMenuId: (v: string | null) => void;
  onSelect: (id: string) => void;
  startEdit: (c: ConversationDoc) => void;
  commitEdit: () => void;
  onDelete: (id: string) => void;
}

function Group({
  label, items, activeId, editingId, editValue, openMenuId,
  setEditValue, setEditingId, setOpenMenuId,
  onSelect, startEdit, commitEdit, onDelete,
}: GroupProps) {
  return (
    <div className="mt-4 first:mt-2">
      <div className="px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </div>
      <ul className="mt-1 space-y-0.5">
        {items.map((c) => {
          const isActive = c.id === activeId;
          const isEditing = c.id === editingId;
          const isMenuOpen = c.id === openMenuId;

          return (
            <li key={c.id} className="relative group/item">
              {isEditing ? (
                <div className="flex items-center gap-1 px-2 py-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 h-7 px-2 rounded-md border border-accent/60 bg-canvas text-xs focus:outline-none"
                  />
                  <button
                    onClick={commitEdit}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10"
                    aria-label="Save"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:bg-edge/60"
                    aria-label="Cancel"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-1 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent-soft/70'
                      : 'hover:bg-edge/50'
                  }`}
                >
                  <button
                    onClick={() => onSelect(c.id)}
                    className={`flex-1 min-w-0 text-left px-3 py-2 text-[13px] truncate ${
                      isActive
                        ? 'text-accent font-medium'
                        : 'text-ink'
                    }`}
                    title={c.title}
                  >
                    {c.title}
                  </button>

                  <button
                    onClick={() => setOpenMenuId(isMenuOpen ? null : c.id)}
                    className="w-6 h-6 mr-1 rounded-md flex items-center justify-center text-muted hover:bg-edge/80 opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-opacity"
                    aria-label="More options"
                  >
                    <MoreHorizontal size={13} />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-1 top-9 z-40 w-36 rounded-lg border border-edge bg-surface shadow-lg p-1 animate-scale-in origin-top-right">
                        <button
                          onClick={() => startEdit(c)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md hover:bg-edge/60 text-left"
                        >
                          <Pencil size={12} />
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            if (confirm(`Delete "${c.title}"?`)) onDelete(c.id);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md hover:bg-red-500/10 hover:text-red-500 text-left transition-colors"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}