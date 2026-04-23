import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Plus, Trash2, FileText, HelpCircle,
  BookOpen, Save, Edit2, X, Video, Check, AlertCircle, ChevronUp, ChevronDown,
  Upload, CheckCircle,
} from 'lucide-react';
import { GlassContainer } from '../../components/ui/GlassContainer';
import { ActionButton } from '../../components/ui/ActionButton';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useCourse } from '../../hooks/useCourses';
import { useCourseModules, useCreateModule, useUpdateModule, useDeleteModule } from '../../hooks/useModules';
import { moduleService } from '../../services/moduleService';
import { questionService } from '../../services/questionService';
import type { Module, QuizQuestion, QuestionRequest } from '../../types';
import { useEffect } from 'react';
import { Search } from 'lucide-react';

/** ── File Upload Zone ── */
interface FileUploadZoneProps {
  accept: string;
  label: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ accept, label, currentUrl, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl || '');
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    setProgress(0);
    try {
      const url = await moduleService.uploadFile(file, setProgress);
      setUploadedUrl(url);
      onUpload(url);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const getFileName = (url: string) => {
    const segments = url.split('/');
    return segments[segments.length - 1];
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
        {label}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5 scale-[1.01]'
            : uploadedUrl
              ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5'
              : 'border-slate-200 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 hover:border-emerald-400 dark:hover:border-emerald-500/30 hover:bg-emerald-50/20 dark:hover:bg-emerald-500/5'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Uploading... {progress}%
            </p>
            <div className="w-full max-w-xs h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </>
        ) : uploadedUrl ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">File uploaded</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-full">
              {getFileName(uploadedUrl)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click or drag to replace</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Drop your file here or <span className="text-emerald-600 dark:text-emerald-400">browse</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {accept === '.pdf' ? 'PDF documents' : 'MP4, WebM, MOV, AVI, MKV videos'}
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-500 ml-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
};

/** ── Visual Quiz Question Editor ── */
interface QuizEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ questions, onChange }) => {
  const addQuestion = () => {
    onChange([
      ...questions,
      { question: '', options: ['', '', '', ''], correct: 0, difficultyLevel: 'MEDIUM' },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    onChange(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    onChange(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length >= 6) return;
    updated[qIndex].options.push('');
    onChange(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) return;
    updated[qIndex].options.splice(oIndex, 1);
    if (updated[qIndex].correct >= updated[qIndex].options.length) {
      updated[qIndex].correct = 0;
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qIdx) => (
        <GlassContainer key={qIdx} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Question {qIdx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeQuestion(qIdx)}
              disabled={questions.length <= 1}
              className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors rounded-lg"
              title="Remove question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2">
                <Input
                  label="Question Text"
                  placeholder="e.g., What is the primary goal of software architecture?"
                  value={q.question}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(qIdx, 'question', e.target.value)}
                  required
                />
             </div>
             <Select
                label="Difficulty"
                value={q.difficultyLevel || 'MEDIUM'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateQuestion(qIdx, 'difficultyLevel', e.target.value)}
                options={[
                  { value: 'EASY', label: 'Easy' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HARD', label: 'Hard' },
                ]}
             />
             <Input
                label="Category (Optional)"
                placeholder="e.g., Fundamentals"
                value={q.category || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(qIdx, 'category', e.target.value)}
             />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
              Answer Options — click the radio to mark as correct
            </label>
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuestion(qIdx, 'correct', oIdx)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    q.correct === oIdx
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300 dark:border-white/20 hover:border-emerald-400'
                  }`}
                  title={q.correct === oIdx ? 'Correct answer' : 'Mark as correct'}
                >
                  {q.correct === oIdx && <Check className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="text"
                  value={opt}
                  onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                  placeholder={`Option ${oIdx + 1}`}
                  className="flex-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeOption(qIdx, oIdx)}
                  disabled={q.options.length <= 2}
                  className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-20 transition-colors rounded-lg"
                  title="Remove option"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {q.options.length < 6 && (
              <button
                type="button"
                onClick={() => addOption(qIdx)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline ml-8"
              >
                + Add option
              </button>
            )}
          </div>
        </GlassContainer>
      ))}

      <ActionButton type="button" variant="secondary" onClick={addQuestion}>
        <Plus className="w-4 h-4" /> Add Question
      </ActionButton>
    </div>
  );
};

/** ── Content Editor (switches between text, file upload, and quiz) ── */
interface ContentEditorProps {
  type: string;
  contentUrl: string;
  onContentChange: (url: string) => void;
  threshold?: string;
  onThresholdChange?: (val: string) => void;
  questions?: QuizQuestion[];
  onQuestionsChange?: (q: QuizQuestion[]) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  type, contentUrl, onContentChange, threshold, onThresholdChange, questions, onQuestionsChange
}) => {
  if (type === 'quiz' && onThresholdChange && onQuestionsChange && questions) {
    return (
      <>
        <Input
          label="Passing Threshold (%)"
          type="number"
          placeholder="50"
          value={threshold || '50'}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onThresholdChange(e.target.value)}
          required
        />
        <QuizEditor questions={questions} onChange={onQuestionsChange} />
      </>
    );
  }

  if (type === 'pdf') {
    return (
      <FileUploadZone
        accept=".pdf"
        label="PDF Document"
        currentUrl={contentUrl}
        onUpload={onContentChange}
      />
    );
  }

  if (type === 'video') {
    return (
      <FileUploadZone
        accept=".mp4,.webm,.mov,.avi,.mkv"
        label="Video File"
        currentUrl={contentUrl}
        onUpload={onContentChange}
      />
    );
  }

  // Default: text content
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
        Content
      </label>
      <textarea
        className="w-full h-32 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
        placeholder="Enter the content for this module..."
        value={contentUrl}
        onChange={e => onContentChange(e.target.value)}
      />
    </div>
  );
};

/** ── Inline Module Edit Form ── */
interface ModuleEditFormProps {
  module: Module;
  onSave: (moduleId: string, data: any) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

const ModuleEditForm: React.FC<ModuleEditFormProps> = ({ module, onSave, onCancel, saving }) => {
  const [title, setTitle] = useState(module.title);
  const [content, setContent] = useState(module.contentUrl || '');
  const [threshold, setThreshold] = useState(module.threshold?.toString() || '50');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (module.type === 'quiz') {
      const fetchQuestions = async () => {
        setLoadingQuestions(true);
        try {
          const data = await questionService.getQuestions(module.id);
          if (data && data.length > 0) {
            setQuestions(data.map(q => ({
              id: q.id,
              question: q.statement,
              options: q.options,
              correct: q.correctAnswer,
              difficultyLevel: q.difficultyLevel,
              category: q.category
            })));
          } else {
            setQuestions([{ question: '', options: ['', '', '', ''], correct: 0, difficultyLevel: 'MEDIUM' }]);
          }
        } catch (err) {
          console.error('Failed to load questions:', err);
          setQuestions([{ question: '', options: ['', '', '', ''], correct: 0, difficultyLevel: 'MEDIUM' }]);
        } finally {
          setLoadingQuestions(false);
        }
      };
      fetchQuestions();
    }
  }, [module.id, module.type]);

  const validate = (): string | null => {
    if (!title.trim()) return 'Module title is required.';
    if (module.type === 'quiz') {
      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].question.trim()) return `Question ${i + 1} text is empty.`;
        const emptyOpts = questions[i].options.filter(o => !o.trim());
        if (emptyOpts.length > 0) return `Question ${i + 1} has empty options.`;
      }
      const t = parseInt(threshold);
      if (isNaN(t) || t < 0 || t > 100) return 'Threshold must be between 0 and 100.';
    }
    if ((module.type === 'pdf' || module.type === 'video') && !content) {
      return `Please upload a ${module.type === 'pdf' ? 'PDF document' : 'video file'}.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return;

    const payload: any = { title };
    if (module.type === 'quiz') {
      payload.threshold = parseInt(threshold);
      // We save questions individually now
      try {
        await Promise.all(questions.map(q => {
          const req: QuestionRequest = {
            statement: q.question,
            options: q.options,
            correctAnswer: q.correct,
            difficultyLevel: q.difficultyLevel,
            category: q.category
          };
          return q.id 
            ? questionService.updateQuestion(q.id, req)
            : questionService.createQuestion(module.id, req);
        }));
      } catch (err) {
        console.error('Failed to save some questions', err);
      }
    } else {
      payload.contentUrl = content;
    }
    await onSave(module.id, payload);
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="pt-5 mt-5 border-t border-slate-200 dark:border-white/10 space-y-5"
    >
      <Input
        label="Module Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        required
      />

      {loadingQuestions ? (
        <LoadingSpinner size="sm" label="Loading questions..." />
      ) : (
        <ContentEditor
          type={module.type}
          contentUrl={content}
          onContentChange={setContent}
          threshold={threshold}
          onThresholdChange={setThreshold}
          questions={questions}
          onQuestionsChange={setQuestions}
        />
      )}

      <div className="flex gap-3">
        <ActionButton type="submit" disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </ActionButton>
        <ActionButton type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </ActionButton>
      </div>
    </motion.form>
  );
};

/** ── Main Course Builder ── */
export const CourseBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: course, isLoading: courseLoading } = useCourse(id);
  const { data: modules = [], isLoading: modulesLoading } = useCourseModules(id);
  const { mutate: createModule, isPending: moduleCreating } = useCreateModule();
  const { mutate: updateModule, isPending: moduleUpdating } = useUpdateModule();
  const { mutate: deleteModule } = useDeleteModule();

  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [error, setError] = useState('');

  // New module form state
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('text');
  const [newContent, setNewContent] = useState('');
  const [newThreshold, setNewThreshold] = useState('50');
  const [newQuestions, setNewQuestions] = useState<QuizQuestion[]>([
    { question: '', options: ['', '', '', ''], correct: 0, difficultyLevel: 'MEDIUM' },
  ]);

  const loading = courseLoading || modulesLoading;
  const saving = moduleCreating;
  const editSaving = moduleUpdating;

  const validateNewModule = (): string | null => {
    if (!newTitle.trim()) return 'Module title is required.';
    if (newType === 'quiz') {
      for (let i = 0; i < newQuestions.length; i++) {
        if (!newQuestions[i].question.trim()) return `Question ${i + 1} text is empty.`;
        const emptyOpts = newQuestions[i].options.filter(o => !o.trim());
        if (emptyOpts.length > 0) return `Question ${i + 1} has empty options.`;
      }
      const t = parseInt(newThreshold);
      if (isNaN(t) || t < 0 || t > 100) return 'Threshold must be between 0 and 100.';
    }
    if ((newType === 'pdf' || newType === 'video') && !newContent) {
      return `Please upload a ${newType === 'pdf' ? 'PDF document' : 'video file'}.`;
    }
    return null;
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validateNewModule();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!id) return;

    const modulePayload: Partial<Module> = {
      title: newTitle,
      type: newType as Module['type'],
      order: modules.length + 1,
    };

    createModule({ courseId: id, data: modulePayload }, {
      onSuccess: async (created) => {
        try {
          if (newType === 'quiz') {
            await moduleService.update(created.id, { threshold: parseInt(newThreshold) || 50 });
            await Promise.all(newQuestions.map(q => {
              const req: QuestionRequest = {
                statement: q.question,
                options: q.options,
                correctAnswer: q.correct,
                difficultyLevel: q.difficultyLevel,
                category: q.category
              };
              return questionService.createQuestion(created.id, req);
            }));
          } else if (newContent.trim()) {
            await moduleService.setResource(created.id, newContent);
          }
          setNewTitle('');
          setNewType('text');
          setNewContent('');
          setNewThreshold('50');
          setNewQuestions([{ question: '', options: ['', '', '', ''], correct: 0 }]);
          setShowAdd(false);
        } catch {
          setError('Module created but failed to save content/quiz.');
        }
      },
      onError: () => setError('Failed to create module.')
    });
  };

  const handleEditModule = async (moduleId: string, data: any) => {
    setError('');
    updateModule({ id: moduleId, data, courseId: id }, {
      onSuccess: async () => {
        setEditingModule(null);
      },
      onError: () => setError('Failed to update module.')
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!id || !window.confirm('Are you sure?')) return;
    setError('');
    deleteModule({ id: moduleId, courseId: id });
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= modules.length) return;

    const reordered = [...modules];
    [reordered[index], reordered[swapIdx]] = [reordered[swapIdx], reordered[index]];

    setError('');
    try {
      await Promise.all(
        reordered.map((mod, idx) => moduleService.update(mod.id, { order: idx + 1 }))
      );
      // Success will trigger a refetch if we invalidate the query key
      // But updateModule mutation doesn't handle multiple updates at once nicely.
      // I'll manually invalidate for reordering.
    } catch {
      setError('Failed to reorder modules.');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading course..." className="mt-32" />;
  }

  if (!course) {
    return (
      <div className="text-center p-16">
        <p className="text-slate-500 dark:text-slate-400 text-lg">Course not found.</p>
        <ActionButton className="mt-4" onClick={() => navigate('/dashboard')}>Go Back</ActionButton>
      </div>
    );
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'quiz': return HelpCircle;
      case 'pdf': return FileText;
      case 'video': return Video;
      default: return BookOpen;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <ActionButton variant="ghost" onClick={() => navigate('/dashboard')}>
          <ChevronLeft className="w-4 h-4" /> Back
        </ActionButton>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">{course.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {modules.length} module{modules.length !== 1 ? 's' : ''} · {course.category}
          </p>
        </div>
        <ActionButton onClick={() => { setShowAdd(!showAdd); setError(''); }}>
          <Plus className="w-4 h-4" /> Add Module
        </ActionButton>
      </div>

      {/* Validation error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Module Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassContainer className="p-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">New Module</h3>
              <form onSubmit={handleAddModule} className="space-y-5">
                <Input
                  label="Module Title"
                  placeholder="e.g., Introduction to Design Patterns"
                  value={newTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                  required
                />
                <Select
                  label="Content Type"
                  value={newType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setNewType(e.target.value);
                    setNewContent('');
                    if (e.target.value === 'quiz') {
                      setNewQuestions([{ question: '', options: ['', '', '', ''], correct: 0 }]);
                    }
                  }}
                  options={[
                    { value: 'text', label: 'Text Content' },
                    { value: 'pdf', label: 'PDF Document' },
                    { value: 'video', label: 'Video' },
                    { value: 'quiz', label: 'Assessment Quiz' },
                  ]}
                />

                <ContentEditor
                  type={newType}
                  contentUrl={newContent}
                  onContentChange={setNewContent}
                  threshold={newThreshold}
                  onThresholdChange={setNewThreshold}
                  questions={newQuestions}
                  onQuestionsChange={setNewQuestions}
                />

                <div className="flex gap-3">
                  <ActionButton type="submit" disabled={saving}>
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Module'}
                  </ActionButton>
                  <ActionButton type="button" variant="ghost" onClick={() => setShowAdd(false)}>
                    Cancel
                  </ActionButton>
                </div>
              </form>
            </GlassContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module List */}
      {modules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No modules yet"
          description="Add your first module to start building this course's curriculum."
        />
      ) : (
        <div className="space-y-3">
          {modules.map((mod, idx) => {
            const Icon = getModuleIcon(mod.type);
            const isEditing = editingModule === mod.id;
            return (
              <GlassContainer key={mod.id} className="p-5">
                <div className="flex items-center gap-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, 'down')}
                      disabled={idx === modules.length - 1}
                      className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{mod.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mt-0.5">
                      {mod.type === 'quiz' ? 'Assessment' : mod.type} · Module {mod.order}
                      {mod.type === 'quiz' && mod.threshold ? ` · ${mod.threshold}% to pass` : ''}
                      {(mod.type === 'pdf' || mod.type === 'video') && mod.contentUrl ? ' · File attached' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ActionButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingModule(isEditing ? null : mod.id)}
                    >
                      {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteModule(mod.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </ActionButton>
                  </div>
                </div>

                {/* Inline Edit Form */}
                <AnimatePresence>
                  {isEditing && (
                    <ModuleEditForm
                      module={mod}
                      onSave={handleEditModule}
                      onCancel={() => setEditingModule(null)}
                      saving={editSaving}
                    />
                  )}
                </AnimatePresence>
              </GlassContainer>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
