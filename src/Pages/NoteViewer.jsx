import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Utils/toast";
import { 
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ShareIcon,
  CalendarIcon,
  DocumentTextIcon,
  StarIcon,
  ArchiveBoxIcon,
  ArchiveBoxArrowDownIcon
} from "@heroicons/react/24/outline";
import logo from "../Assets/HDlogo.png";
import api from "../Api";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const NoteViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    pin: false,
    archive: false
  });

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notes/getnote/${id}`);
      setNote(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch note");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    try {
      await api.delete(`/notes/delete-note/${id}`);
      
      toast.success("Note deleted successfully");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleToggleArchive = async () => {
    setActionLoading(prev => ({ ...prev, archive: true }));
    try {
      const response = await api.patch(`/notes/${id}/archive`);
      toast.success(response.data.message);
      fetchNote();
    } catch (error) {
      toast.error("Failed to archive/unarchive note");
    } finally {
      setActionLoading(prev => ({ ...prev, archive: false }));
    }
  };

  const handleTogglePin = async () => {
    setActionLoading(prev => ({ ...prev, pin: true }));
    try {
      const response = await api.patch(`/notes/${id}/pin`);
      toast.success(response.data.message);
      fetchNote();
    } catch (error) {
      toast.error("Failed to pin/unpin note");
    } finally {
      setActionLoading(prev => ({ ...prev, pin: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCharacterCount = (content) => {
    if (!content) return 0;
    return content.replace(/<[^>]*>/g, '').length;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
          url: window.location.href
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Note link copied to clipboard");
      } catch (error) {
        toast.error("Failed to share note");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Note not found</h2>
          <p className="text-gray-600 mb-4">The note you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <img src={logo} alt="HD" className="h-6 w-6" />
                <div className="text-lg font-medium text-gray-900">View Note</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Share"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleTogglePin}
                disabled={actionLoading.pin}
                className={`p-2 rounded-lg transition-all ${
                  note.isPinned
                    ? 'text-yellow-600 hover:bg-yellow-50'
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                } ${actionLoading.pin ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={note.isPinned ? 'Unpin note' : 'Pin note'}
              >
                {actionLoading.pin ? (
                  <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <StarIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={handleToggleArchive}
                disabled={actionLoading.archive}
                className={`p-2 rounded-lg transition-all ${
                  note.isArchived
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                } ${actionLoading.archive ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={note.isArchived ? 'Unarchive note' : 'Archive note'}
              >
                {actionLoading.archive ? (
                  <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : note.isArchived ? (
                  <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                ) : (
                  <ArchiveBoxIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={() => navigate(`/notes/edit/${note.id}`)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200">
          <header className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{note.title}</h1>
              <div className="flex gap-2 ml-4">
                {note.isPinned && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                    Pinned
                  </span>
                )}
                {note.isArchived && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                    Archived
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Created: {formatDate(note.createdAt)}</span>
              </div>
              
              {note.updatedAt !== note.createdAt && (
                <div className="flex items-center gap-1">
                  <span>Updated: {formatDate(note.updatedAt)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <DocumentTextIcon className="h-4 w-4" />
                <span>{getCharacterCount(note.content)} characters</span>
              </div>
            </div>
          </header>

          <div className="p-6">
            {note.content ? (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">This note is empty</p>
              </div>
            )}
          </div>
        </article>

        <div className="lg:hidden mt-6 flex gap-3">
          <button
            onClick={handleTogglePin}
            disabled={actionLoading.pin}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              note.isPinned
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${actionLoading.pin ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {actionLoading.pin ? (
              <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                <StarIcon className="h-5 w-5" />
                {note.isPinned ? 'Unpin' : 'Pin'}
              </>
            )}
          </button>
          
          <button
            onClick={handleToggleArchive}
            disabled={actionLoading.archive}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              note.isArchived
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${actionLoading.archive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {actionLoading.archive ? (
              <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <>
                {note.isArchived ? (
                  <>
                    <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <ArchiveBoxIcon className="h-5 w-5" />
                    Archive
                  </>
                )}
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate(`/notes/edit/${note.id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Edit
          </button>
          
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-all"
          >
            <TrashIcon className="h-5 w-5" />
            Delete
          </button>
        </div>
      </main>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Note</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNote}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteViewer;