import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface NamesPreviewProps {
  names: string[];
  onConfirm: (names: string[]) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function NamesPreview({
  names,
  onConfirm,
  onCancel,
  isLoading = false,
}: NamesPreviewProps) {
  const [editableNames, setEditableNames] = useState<string[]>(names);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(editableNames[index]);
  };

  const handleSaveEdit = (index: number) => {
    if (editValue.trim()) {
      const updated = [...editableNames];
      updated[index] = editValue.trim();
      setEditableNames(updated);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleRemove = (index: number) => {
    const updated = editableNames.filter((_, i) => i !== index);
    setEditableNames(updated);
  };

  const handleAddNew = () => {
    setEditableNames([...editableNames, '']);
    setEditingIndex(editableNames.length);
    setEditValue('');
  };

  const handleConfirm = () => {
    const validNames = editableNames.filter((name) => name.trim().length > 0);
    onConfirm(validNames);
  };

  if (names.length === 0) {
    return null;
  }

  return (
    <Card
      title="Prévia dos Nomes"
      subtitle={`${editableNames.length} nome${editableNames.length !== 1 ? 's' : ''} pronto${editableNames.length !== 1 ? 's' : ''} para cadastrar`}
      variant="elevated"
      className="mt-4"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
          {editableNames.map((name, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
            >
              {editingIndex === index ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(index);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                    autoFocus
                    placeholder="Digite o nome"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSaveEdit(index)}
                      className="flex-1 text-xs"
                    >
                      ✓
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="flex-1 text-xs"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white text-sm flex-1 truncate">
                    {name || <span className="text-gray-400 dark:text-gray-500 italic">Nome vazio</span>}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => handleStartEdit(index)}
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                      title="Editar nome"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Remover nome"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddNew}
            disabled={isLoading}
          >
            + Adicionar Nome
          </Button>
          <div className="flex gap-3">
            {onCancel && (
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={isLoading}
              disabled={editableNames.filter((n) => n.trim()).length === 0}
            >
              Confirmar Cadastro
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

