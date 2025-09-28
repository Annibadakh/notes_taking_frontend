import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Utils/toast";
import { 
  ArrowLeftIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ArrowDownOnSquareIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import logo from "../Assets/HDlogo.png";
import api from "../Api";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const editorRef = useRef(null);

  const [note, setNote] = useState({
    title: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const [fontColor, setFontColor] = useState('#000000');

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchNote();
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        editorRef.current.style.color = '#000000';
      }
    }
  }, [id]);

  useEffect(() => {
    updateCharacterCount();
  }, [note.content]);

  useEffect(() => {
    if (!isPreview && editorRef.current && note.content !== undefined) {
      if (editorRef.current.innerHTML !== note.content) {
        editorRef.current.innerHTML = note.content;
      }
    }
  }, [isPreview, note.content]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API_BASE}/notes/getnote/${id}`);
      
      const noteData = {
        title: response.data.data.title,
        content: response.data.data.content || ""
      };
      
      if (response.data.meta) {
        if (response.data.meta.fontColor) {
          setFontColor(response.data.meta.fontColor);
        }
      }
      
      setNote(noteData);
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = noteData.content;
          editorRef.current.style.color = '#000000';
        }
      }, 0);
      
    } catch (error) {
      toast.error("Failed to fetch note");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateCharacterCount = () => {
    const textContent = note.content.replace(/<[^>]*>/g, '');
    setCharacterCount(textContent.length);
  };

  const handleSave = async () => {
    if (!note.title.trim()) {
      toast.error("Please enter a title for your note");
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        title: note.title,
        content: note.content,
        meta: {
          characterCount: characterCount,
          lastModified: new Date().toISOString(),
          fontColor: fontColor
        },
      };

      if (isEditing) {
        await api.put(`/notes/save/${id}`, payload);
        toast.success("Note updated successfully");
      } else {
        await api.post(`/notes/create`, payload);
        toast.success("Note created successfully");
      }
      
      setLastSaved(new Date());
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
        // console.log(error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} note`);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    setNote(prev => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (e) => {
    if (e && e.isComposing) return;
    
    requestAnimationFrame(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        setNote(prev => ({ ...prev, content }));
      }
    });
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleFontColorChange = (color) => {
    setFontColor(color);
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      formatText('foreColor', color);
    } else {
      toast.info("Please select text to change color");
    }
    
    editorRef.current.focus();
  };

  const handlePreviewToggle = () => {
    if (!isPreview) {
      if (editorRef.current) {
        const currentContent = editorRef.current.innerHTML;
        setNote(prev => ({ ...prev, content: currentContent }));
      }
    }
    setIsPreview(!isPreview);
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <div className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit Note' : 'Create Note'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-gray-500">
                {lastSaved && `Saved ${lastSaved.toLocaleTimeString()}`}
              </div>
              <button
                onClick={handlePreviewToggle}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                <EyeIcon className="h-4 w-4" />
                {isPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !note.title.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownOnSquareIcon className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <input
              type="text"
              placeholder="Enter note title..."
              value={note.title}
              onChange={handleTitleChange}
              className="w-full text-2xl font-semibold text-gray-900 placeholder-gray-400 border-none outline-none"
            />
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
              <div>{getCurrentDateTime()}</div>
              <div>•</div>
              <div>{characterCount} characters</div>
              {isEditing && (
                <>
                  <div>•</div>
                  <div>Last modified: {new Date().toLocaleDateString()}</div>
                </>
              )}
            </div>
          </div>

          {!isPreview && (
            <div className="border-b border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => handleFontColorChange(e.target.value)}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    title="Select text to apply color"
                  />
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <button
                  onClick={() => formatText('bold')}
                  className="p-2 hover:bg-gray-100 rounded transition-all"
                  title="Bold"
                >
                  <BoldIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => formatText('italic')}
                  className="p-2 hover:bg-gray-100 rounded transition-all"
                  title="Italic"
                >
                  <ItalicIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => formatText('underline')}
                  className="p-2 hover:bg-gray-100 rounded transition-all"
                  title="Underline"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            {isPreview ? (
              <div
                className="prose max-w-none min-h-96"
                dangerouslySetInnerHTML={{ __html: note.content || '<p class="text-gray-400">No content to preview</p>' }}
              />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                className="min-h-96 outline-none text-gray-900 leading-relaxed focus:outline-none"
                suppressContentEditableWarning={true}
                data-placeholder="Start writing your note..."
                style={{ color: '#000000' }}
              />
            )}
          </div>
        </div>

        <div className="lg:hidden mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !note.title.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownOnSquareIcon className="h-5 w-5" />
            {saving ? 'Saving...' : `${isEditing ? 'Update' : 'Create'} Note`}
          </button>
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;