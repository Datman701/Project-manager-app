import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskCard from './SortableTaskCard';

const DroppableColumn = ({ title, tasks, status, color, onCreateTask, onEdit, onDelete, onStatusChange, onClick, project }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-1 min-w-80">
      <div
        ref={setNodeRef}
        className={`rounded-lg border-2 border-dashed ${color} ${
          isOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
        } h-full min-h-96 transition-colors duration-200`}
      >
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                {tasks.length}
              </span>
            </div>
            <button
              onClick={onCreateTask}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Add task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
            {tasks.length > 0 ? (
              tasks.map(task => (
                <SortableTaskCard
                  key={task._id}
                  task={task}
                  status={status}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                  onClick={onClick}
                  project={project}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-gray-500">No {title.toLowerCase()} tasks</p>
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
};

export default DroppableColumn;
