import TaskForm from './TaskForm';

const TaskEditForm = ({
  formData,
  errors,
  isSubmitting,
  projects,
  projectMembers,
  currentProject,
  onChange,
  onSubmit,
  onCancel
}) => {
  return (
    <TaskForm
      formData={formData}
      errors={errors}
      isSubmitting={isSubmitting}
      projects={projects}
      projectMembers={projectMembers}
      currentProject={currentProject}
      onChange={onChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitText="Save Changes"
      isCreating={false}
    />
  );
};

export default TaskEditForm;
