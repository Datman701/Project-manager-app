import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetMembersQuery, useAddMemberMutation, useRemoveMemberMutation } from '../../store/api/projectsApi';
import { addToast } from '../../store/slices/uiSlice.js';

const MemberManagementModal = ({ isOpen, onClose, project }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [memberEmail, setMemberEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API queries and mutations
  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError
  } = useGetMembersQuery(project?.project?._id || project?._id, {
    skip: (!project?.project?._id && !project?._id) || !isOpen
  });

  const [addMember] = useAddMemberMutation();
  const [removeMember] = useRemoveMemberMutation();

  // Handle members data - extract the actual project from the response
  const actualProject = project?.project || project;
  // Use members from project data instead of separate API call
  const allMembers = actualProject?.members || [];
  const projectOwner = actualProject?.createdBy;

  // Filter out the owner from members list to avoid duplication
  const members = allMembers.filter(member =>
    member._id !== projectOwner?._id &&
    member.email !== projectOwner?.email
  );



  // Check if current user is project owner
  const isProjectOwner = user && actualProject && (
    user._id === actualProject.createdBy?._id ||
    user._id === actualProject.createdBy
  );

  // Handle add member
  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!memberEmail.trim()) {
      setErrors({ email: 'Email address is required' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await addMember({
        projectId: actualProject._id,
        userData: { email: memberEmail.toLowerCase().trim() }
      }).unwrap();

      setMemberEmail('');
      setErrors({});

      // Show success toast
      dispatch(addToast({
        type: 'success',
        message: 'Member added successfully!'
      }));

    } catch (error) {
      console.error('Failed to add member:', error);
      setErrors({
        submit: error?.data?.message || 'Failed to add member. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (member) => {
    if (window.confirm(`Remove ${member.name || member.email} from this project?\n\nNote: This will also delete all tasks assigned to or created by this user in this project.`)) {
      try {
        const result = await removeMember({
          projectId: actualProject._id,
          userData: { userId: member._id }
        }).unwrap();

        // Show success toast with task cleanup info
        const tasksDeleted = result?.tasksDeleted || 0;
        const message = tasksDeleted > 0
          ? `Member removed successfully! ${tasksDeleted} task(s) were also deleted.`
          : 'Member removed successfully!';

        dispatch(addToast({
          type: 'success',
          message: message
        }));

      } catch (error) {
        console.error('Failed to remove member:', error);
        setErrors({
          submit: error?.data?.message || 'Failed to remove member. Please try again.'
        });
      }
    }
  };

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle close
  const handleClose = () => {
    setMemberEmail('');
    setErrors({});
    onClose();
  };

  // Get member avatar
  const getMemberAvatar = (member) => {
    if (!member) return 'U';
    const name = member.name || member.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  if (!isOpen || !actualProject) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Project Members</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{actualProject.title || actualProject.name}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Error Alert */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Add Member Form - Only show to project owner */}
          {isProjectOwner && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Member</h4>
              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Enter email address..."
                    value={memberEmail}
                    onChange={(e) => {
                      setMemberEmail(e.target.value);
                      if (errors.email) setErrors({});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Member
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Members List */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Current Members ({(projectOwner ? 1 : 0) + members.length})
            </h4>

            {membersLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : membersError ? (
              <div className="text-center py-4 text-red-600">
                <p className="text-sm">Failed to load members</p>
                <p className="text-xs text-gray-500 mt-1">
                  {membersError?.data?.message || membersError?.message || 'Unknown error'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Debug: {JSON.stringify(membersError)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Project Owner */}
                {projectOwner && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {getMemberAvatar(projectOwner)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {projectOwner?.name || projectOwner?.email || 'Project Owner'}
                        </p>
                        <p className="text-sm text-gray-600">{projectOwner?.email}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Owner
                    </span>
                  </div>
                )}

                {/* Members */}
                {members.map((member) => {
                  return (
                    <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium">
                          {getMemberAvatar(member)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name || member.email}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          Member
                        </span>
                        {/* Show delete button only for project owners */}
                        {isProjectOwner && (
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 hover:border-red-300 transition-colors"
                            title="Remove member from project"
                          >
                            Delete Member
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {members.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="text-sm">No additional members yet</p>
                    {isProjectOwner && (
                      <p className="text-xs text-gray-400 mt-1">Add members by email above</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info for non-owners */}
          {!isProjectOwner && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Only the project owner can add or remove members.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberManagementModal;
