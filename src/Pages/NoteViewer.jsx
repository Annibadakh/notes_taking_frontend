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
  DocumentTextIcon
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

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notes/getnote/${id}`);
    //   console.log(response.data);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{note.title}</h1>
            
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
            onClick={() => navigate(`/notes/edit/${note.id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Edit Note
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