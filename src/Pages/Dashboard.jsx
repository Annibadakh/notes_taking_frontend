import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Utils/toast";
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  ArchiveBoxArrowDownIcon,
  StarIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import logo from "../Assets/HDlogo.png";
import api from "../Api";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalNotes: 0,
    archivedNotes: 0,
    pinnedNotes: 0,
    totalCharacters: 0,
    totalWords: 0
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const notesPerPage = 6;

  useEffect(() => {
    fetchNotes();
    fetchStats();
  }, [currentPage, searchTerm, showArchived]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notes/get-notes`, {
        params: {
          page: currentPage,
          limit: notesPerPage,
          search: searchTerm,
          archived: showArchived
        }
      });

      setNotes(response.data.data.notes);
      setTotalPages(response.data.data.totalPages);
      setTotalNotes(response.data.data.total);
    } catch (error) {
      toast.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/notes/stats`);
      // console.log(response.data.data);
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/delete-note/${noteId}`);
      
      toast.success("Note deleted successfully");
      setDeleteModalOpen(false);
      setNoteToDelete(null);
      fetchNotes();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleToggleArchive = async (noteId, e) => {
    e.stopPropagation();
    try {
      const response = await api.patch(`/notes/${noteId}/archive`);
      toast.success(response.data.message);
      fetchNotes();
      fetchStats();
    } catch (error) {
      toast.error("Failed to archive/unarchive note");
    }
  };

  const handleTogglePin = async (noteId, e) => {
    e.stopPropagation();
    try {
      const response = await api.patch(`/notes/${noteId}/pin`);
      toast.success(response.data.message);
      fetchNotes();
      fetchStats();
    } catch (error) {
      toast.error("Failed to pin/unpin note");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleArchivedView = () => {
    setShowArchived(!showArchived);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  const getCharacterCount = (content) => {
    return content.replace(/<[^>]*>/g, '').length;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="HD" className="h-8 w-8" />
              <div className="text-xl font-semibold text-gray-900">HD Notes</div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowStatsModal(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-all"
              >
                <ChartBarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Stats</span>
              </button>
              <button
                onClick={logout}
                className="text-sm text-red-600 underline hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.username}!
          </h1>
          <h1 className="text-xl sm:text-lg text-gray-900 mb-2">
            Email: {user?.email}
          </h1>
          <p className="text-gray-600">
            You have {totalNotes} {showArchived ? 'archived' : 'active'} {totalNotes === 1 ? 'note' : 'notes'} in your collection
          </p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${showArchived ? 'archived' : ''} notes...`}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={toggleArchivedView}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showArchived 
                  ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showArchived ? (
                <>
                  <EyeIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">View Active</span>
                </>
              ) : (
                <>
                  <ArchiveBoxIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">View Archived</span>
                </>
              )}
            </button>
            
            {!showArchived && (
              <button
                onClick={() => navigate('/notes/create')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Create Note</span>
              </button>
            )}
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showArchived ? 'No archived notes found' : 'No notes found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : showArchived 
                  ? "You haven't archived any notes yet"
                  : "Get started by creating your first note"
              }
            </p>
            {!showArchived && (
              <button
                onClick={() => navigate('/notes/create')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer relative ${
                    note.isPinned ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                  } ${note.isArchived ? 'opacity-75' : ''}`}
                  onClick={() => navigate(`/notes/${note.id}`)}
                >
                  {note.isPinned && (
                    <div className="absolute top-2 right-2 z-10">
                      <StarIconSolid className="h-4 w-4 text-yellow-500" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                        {note.title}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => handleTogglePin(note.id, e)}
                          className={`p-1.5 rounded-md transition-all ${
                            note.isPinned
                              ? 'text-yellow-600 hover:bg-yellow-100'
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={note.isPinned ? 'Unpin note' : 'Pin note'}
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => handleToggleArchive(note.id, e)}
                          className={`p-1.5 rounded-md transition-all ${
                            note.isArchived
                              ? 'text-orange-600 hover:bg-orange-100'
                              : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                          }`}
                          title={note.isArchived ? 'Unarchive note' : 'Archive note'}
                        >
                          {note.isArchived ? (
                            <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                          ) : (
                            <ArchiveBoxIcon className="h-4 w-4" />
                          )}
                        </button>
                        
                        {!note.isArchived && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/notes/edit/${note.id}`);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="Edit note"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNoteToDelete(note);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                          title="Delete note"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {note.content ? truncateContent(note.content) : "No content"}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatDate(note.updatedAt)}</span>
                      <div className="flex items-center gap-2">
                        <span>{getCharacterCount(note.content || "")} chars</span>
                        {note.isArchived && (
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * notesPerPage) + 1} to{' '}
                  {Math.min(currentPage * notesPerPage, totalNotes)} of {totalNotes} {showArchived ? 'archived' : ''} notes
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return page === 1 || 
                               page === totalPages || 
                               Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm rounded-md transition-all ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Notes Statistics</h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Notes</span>
                <span className="font-semibold text-blue-600">{stats.totalNotes}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Pinned Notes</span>
                <span className="font-semibold text-yellow-600">{stats.pinnedNotes}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Archived Notes</span>
                <span className="font-semibold text-orange-600">{stats.archivedNotes}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Characters</span>
                <span className="font-semibold text-green-600">{formatNumber(stats.totalCharacters)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Total Words</span>
                <span className="font-semibold text-purple-600">{formatNumber(stats.totalWords)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Note</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{noteToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setNoteToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(noteToDelete.id)}
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

export default Dashboard;