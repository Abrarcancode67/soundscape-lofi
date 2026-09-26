import React, { useState, useEffect } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { DocumentEntry } from '../../types/fas';
import { FolderTree, Plus, Trash2, Edit2, Search, Filter, RefreshCw } from 'lucide-react';

export const DbTab: React.FC = () => {
  const [collection, setCollection] = useState('posts');
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentEntry | null>(null);

  const refresh = () => {
    setDocuments(fasSdk.getDocuments(collection));
  };

  useEffect(() => {
    refresh();
  }, [collection]);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    fasSdk.createDocument(collection, {
      title: newTitle.trim(),
      body: newBody.trim(),
      votes: 0
    });
    setNewTitle('');
    setNewBody('');
    refresh();
  };

  const handleDelete = (id: string) => {
    fasSdk.deleteDocument(collection, id);
    refresh();
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const filteredDocs = filterOwner
    ? documents.filter(d => d.owner.toLowerCase().includes(filterOwner.toLowerCase()))
    : documents;

  return (
    <div className="space-y-6">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.db (Document Collections Store)</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Public queryable document store. Writes require authentication and attach the caller as owner.
            </p>
          </div>
          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)]">
            Limits: 10,000 docs · 64KB per doc
          </span>
        </div>

        {/* Collection Selector & Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted)]">Collection:</span>
            {['posts', 'todos', 'feedback'].map(col => (
              <button
                key={col}
                onClick={() => setCollection(col)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-code transition ${
                  collection === col
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--panel-secondary)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter by owner ID..."
              value={filterOwner}
              onChange={e => setFilterOwner(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-lg text-[var(--ink)] font-mono-code"
            />
            <button
              onClick={refresh}
              className="p-1.5 rounded-lg bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Grid: List & Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Document List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--muted)] font-mono-code">
              <span>{filteredDocs.length} documents in "{collection}"</span>
              <span>fas.db.collection('{collection}').query()</span>
            </div>

            <div className="border border-[var(--line)] rounded-xl overflow-hidden divide-y divide-[var(--line)] bg-[var(--panel)] max-h-96 overflow-y-auto">
              {filteredDocs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--muted)]">
                  No documents in collection. Create one on the right!
                </div>
              ) : (
                filteredDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 transition cursor-pointer text-xs space-y-2 ${
                      selectedDoc?.id === doc.id ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--panel-secondary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[var(--ink-strong)]">
                        {doc.data.title || 'Untitled Document'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code text-[10px] text-[var(--muted)] bg-[var(--line)]/50 px-1.5 py-0.5 rounded">
                          {doc.id}
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--muted)] line-clamp-2">
                      {doc.data.body || doc.data.content || JSON.stringify(doc.data)}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--line)]/50 font-mono-code">
                      <span>Owner: {doc.owner}</span>
                      <span>{new Date(doc.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Document Creator / Inspector */}
          <div className="lg:col-span-5 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-[var(--ink-strong)] flex items-center justify-between">
              <span>{selectedDoc ? 'Document Inspector' : 'Create Document (posts.create)'}</span>
              {selectedDoc && (
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-xs text-[var(--accent)] font-semibold hover:underline"
                >
                  + New
                </button>
              )}
            </div>

            {selectedDoc ? (
              <div className="space-y-3 text-xs font-mono-code">
                <div>
                  <span className="text-[var(--muted)]">Document ID:</span>
                  <div className="p-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)] mt-1">
                    {selectedDoc.id}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Raw Document JSON:</span>
                  <pre className="p-3 bg-[#090d16] text-slate-200 rounded-lg overflow-x-auto text-[11px] mt-1 max-h-56">
                    {JSON.stringify(selectedDoc, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Title</label>
                  <input
                    type="text"
                    placeholder="Document title..."
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)]">Content / Body</label>
                  <textarea
                    rows={4}
                    placeholder="Enter document payload..."
                    value={newBody}
                    onChange={e => setNewBody(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
                  />
                </div>
                <button
                  onClick={handleCreate}
                  className="w-full py-2 bg-[var(--accent)] text-white font-bold text-xs rounded-lg hover:opacity-95 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>await posts.create(...)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
