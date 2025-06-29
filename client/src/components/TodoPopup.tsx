import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TodoPopup = ({ isOpen, onClose }: TodoPopupProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Reset selected index when todos change
  useEffect(() => {
    if (selectedIndex >= todos.length) {
      setSelectedIndex(todos.length - 1);
    }
  }, [todos, selectedIndex]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Global keyboard navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < todos.length - 1 ? prev + 1 : prev;
          return newIndex;
        });
        // Blur input to allow navigation
        if (inputRef.current && document.activeElement === inputRef.current) {
          inputRef.current.blur();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > -1 ? prev - 1 : -1;
          return newIndex;
        });
        // Blur input to allow navigation
        if (inputRef.current && document.activeElement === inputRef.current) {
          inputRef.current.blur();
        }
      } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < todos.length) {
        e.preventDefault();
        toggleTodo(todos[selectedIndex].id);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen, todos, selectedIndex, toggleTodo]);

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false
      };
      setTodos([...todos, newTodo]);
      setNewTodoText('');
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[480px] h-[450px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Todo
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* New Todo Input */}
          <div className="px-6 py-4">
            <input
              ref={inputRef}
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Add a new todo item..."
              className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 w-full pl-3 px-1 py-0.5"
            />
          </div>

          {/* Todo List */}
          <div className="flex-1 overflow-hidden">
            <div className="px-6 pb-4 h-full overflow-y-auto">
              <div className="pt-4">
                {todos.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center text-gray-500 text-sm">
                      <div className="mb-2"><Check className="w-6 h-6 mx-auto" /></div>
                      <div>No todos yet. Add one above!</div>
                    </div>
                  </div>
                ) : (
                <div className="space-y-1">
                  {todos.map((todo, index) => (
                    <div
                      key={todo.id}
                      className={`group py-1 transition-all rounded ${
                        index === selectedIndex
                          ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0 w-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                          {index + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              onClick={() => toggleTodo(todo.id)}
                              className={`text-sm cursor-pointer ${
                                todo.completed
                                  ? 'line-through text-gray-500 dark:text-gray-400'
                                  : 'text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
                              }`}
                            >
                              {todo.text}
                            </span>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition-all ml-2"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {todos.filter(t => !t.completed).length} remaining, {todos.filter(t => t.completed).length} completed
            </span>
            <div className="flex gap-2">
              <Button
                onClick={addTodo}
                size="sm"
                className="h-7 px-3 text-xs"
                disabled={!newTodoText.trim()}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPopup;