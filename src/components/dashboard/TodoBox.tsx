import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare2 } from '../common/focusIcons';
import { useLearning } from '../../context/LearningContext';

export const TodoBox: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompletedTodos } = useLearning();
  const [input, setInput] = useState('');

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    addTodo(trimmed);
    setInput('');
  };

  return (
    <div className="bg-white border-[2.5px] sm:border-[3px] border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#111111] sm:shadow-[4px_4px_0px_#111111]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FFE600] border-2 border-[#111111] flex items-center justify-center shadow-[1.5px_1.5px_0px_#111111]">
            <CheckSquare2 className="w-3.5 h-3.5 text-[#111111] stroke-[2.5]" />
          </div>
          <h2 className="text-sm font-display font-black uppercase tracking-tight text-[#111111]">
            TO-DO LIST
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="bg-[#FEF08A] text-[#111111] border-2 border-[#111111] text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#111111]">
            {completedCount}/{totalCount} DONE
          </span>
          {completedCount > 0 && (
            <button
              onClick={clearCompletedTodos}
              className="text-[10px] font-bold text-gray-400 hover:text-red-600 transition-colors uppercase cursor-pointer ml-1"
              title="Clear completed tasks"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a study goal or task..."
          className="flex-1 min-w-0 bg-[#FDFBF7] border-2 border-[#111111] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#111111] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:bg-white shadow-[2px_2px_0px_#111111] transition-all"
          maxLength={120}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-[#FFE600] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#111111] px-3 py-1.5 rounded-xl font-display font-black text-xs uppercase shadow-[2px_2px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center shrink-0"
          title="Add task"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </button>
      </form>

      {/* List items */}
      {todos.length === 0 ? (
        <div className="py-4 text-center border-2 border-dashed border-gray-300 rounded-xl bg-[#FDFBF7]/60">
          <p className="text-xs font-bold text-[#111111]">No tasks yet!</p>
          <p className="text-[11px] font-mono text-gray-500 mt-0.5">
            Add today's study priorities or reminders above.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border-2 border-[#111111] transition-all group ${
                todo.completed
                  ? 'bg-gray-100/80 shadow-[1px_1px_0px_#111111]'
                  : 'bg-[#FDFBF7] hover:bg-white shadow-[2px_2px_0px_#111111]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleTodo(todo.id)}
                className={`w-4 h-4 rounded border-2 border-[#111111] flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                  todo.completed
                    ? 'bg-[#22C55E] text-white shadow-[1px_1px_0px_#111111]'
                    : 'bg-white hover:bg-yellow-100'
                }`}
                title={todo.completed ? 'Mark uncompleted' : 'Mark completed'}
              >
                {todo.completed && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-2.5 h-2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>

              <span
                onClick={() => toggleTodo(todo.id)}
                className={`text-xs select-none break-words flex-1 cursor-pointer leading-tight ${
                  todo.completed
                    ? 'line-through text-gray-400 font-medium'
                    : 'text-[#111111] font-bold'
                }`}
              >
                {todo.text}
              </span>

              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 opacity-70 group-hover:opacity-100"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
