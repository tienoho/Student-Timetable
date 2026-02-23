import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Clock, AlignLeft, Palette, Trash2, Save, Pencil, Apple, Book, Calculator, FlaskConical, Globe, Music, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import format from 'date-fns/format';
import { motion, AnimatePresence } from 'motion/react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: any;
  selectedSlot: { start: Date; end: Date } | null;
  userId: string;
  isPrimarySchool: boolean;
  onSuccess: () => void;
}

const COLORS = [
  { value: '#ef4444', label: 'Đỏ' },
  { value: '#f97316', label: 'Cam' },
  { value: '#eab308', label: 'Vàng' },
  { value: '#22c55e', label: 'Xanh lá' },
  { value: '#06b6d4', label: 'Xanh dương nhạt' },
  { value: '#3b82f6', label: 'Xanh dương' },
  { value: '#8b5cf6', label: 'Tím' },
  { value: '#ec4899', label: 'Hồng' },
];

const ICONS = [
  { value: 'book', label: 'Sách vở', icon: Book },
  { value: 'pencil', label: 'Ghi chép', icon: Pencil },
  { value: 'apple', label: 'Nghỉ ngơi', icon: Apple },
  { value: 'calculator', label: 'Toán học', icon: Calculator },
  { value: 'science', label: 'Khoa học', icon: FlaskConical },
  { value: 'globe', label: 'Ngoại ngữ', icon: Globe },
  { value: 'music', label: 'Âm nhạc', icon: Music },
  { value: 'palette', label: 'Mỹ thuật', icon: Palette },
  { value: 'trophy', label: 'Thể thao', icon: Trophy },
];

export default function TaskModal({
  isOpen,
  onClose,
  selectedEvent,
  selectedSlot,
  userId,
  isPrimarySchool,
  onSuccess,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'fixed' | 'personal'>('personal');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState(COLORS[5].value);
  const [notes, setNotes] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isReadOnly = selectedEvent?.type === 'fixed';

  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setType(selectedEvent.type);
      setStartTime(format(selectedEvent.start, "yyyy-MM-dd'T'HH:mm"));
      setEndTime(format(selectedEvent.end, "yyyy-MM-dd'T'HH:mm"));
      setColor(selectedEvent.color || COLORS[5].value);
      setNotes(selectedEvent.notes || '');
      setSubjectIcon(selectedEvent.subject_icon || '');
    } else if (selectedSlot) {
      setStartTime(format(selectedSlot.start, "yyyy-MM-dd'T'HH:mm"));
      setEndTime(format(selectedSlot.end, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [selectedEvent, selectedSlot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    setIsLoading(true);

    const scheduleData = {
      user_id: userId,
      title,
      type,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      color,
      notes,
      subject_icon: subjectIcon || null,
    };

    try {
      if (selectedEvent) {
        const { error } = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('id', selectedEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('schedules')
          .insert([scheduleData]);
        if (error) throw error;
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Có lỗi xảy ra khi lưu lịch học.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isReadOnly || !selectedEvent) return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch này không?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('schedules')
          .delete()
          .eq('id', selectedEvent.id);
        if (error) throw error;
        onSuccess();
        onClose();
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Có lỗi xảy ra khi xóa lịch học.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
              "bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10",
              isPrimarySchool && "border-4 border-indigo-100"
            )}
          >
            <div className={cn(
              "flex items-center justify-between px-6 py-4 border-b border-slate-100",
              isPrimarySchool ? "bg-indigo-50" : "bg-white"
            )}>
              <h3 className={cn(
                "font-bold text-slate-900",
                isPrimarySchool ? "text-2xl text-indigo-900" : "text-lg"
              )}>
                {selectedEvent ? (isReadOnly ? 'Chi tiết lịch học' : 'Chỉnh sửa lịch') : 'Thêm lịch mới'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={cn("block font-medium text-slate-700 mb-1", isPrimarySchool ? "text-lg" : "text-sm")}>
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isReadOnly}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
                      isPrimarySchool && "text-lg py-3"
                    )}
                    placeholder="Ví dụ: Học Toán, Làm bài tập Tiếng Anh..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={cn("block font-medium text-slate-700 mb-1 flex items-center gap-1.5", isPrimarySchool ? "text-lg" : "text-sm")}>
                      <Clock className="w-4 h-4 text-slate-400" /> Bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      disabled={isReadOnly}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
                        isPrimarySchool && "text-base py-3"
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn("block font-medium text-slate-700 mb-1 flex items-center gap-1.5", isPrimarySchool ? "text-lg" : "text-sm")}>
                      <Clock className="w-4 h-4 text-slate-400" /> Kết thúc
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      disabled={isReadOnly}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500",
                        isPrimarySchool && "text-base py-3"
                      )}
                    />
                  </div>
                </div>

                {isPrimarySchool && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-2 text-lg flex items-center gap-1.5">
                      <Palette className="w-5 h-5 text-slate-400" /> Màu sắc
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          disabled={isReadOnly}
                          onClick={() => setColor(c.value)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed",
                            color === c.value ? "border-slate-900 scale-110 shadow-md" : "border-transparent hover:scale-110"
                          )}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className={cn("block font-medium text-slate-700 mb-2 flex items-center gap-1.5", isPrimarySchool ? "text-lg" : "text-sm")}>
                    Biểu tượng môn học
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => setSubjectIcon('')}
                      className={cn(
                        "px-4 py-2 rounded-xl border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                        subjectIcon === '' ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      Không có
                    </button>
                    {ICONS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setSubjectIcon(item.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                          subjectIcon === item.value ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={cn("block font-medium text-slate-700 mb-1 flex items-center gap-1.5", isPrimarySchool ? "text-lg" : "text-sm")}>
                    <AlignLeft className="w-4 h-4 text-slate-400" /> Ghi chú
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isReadOnly}
                    rows={3}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500",
                      isPrimarySchool && "text-base py-3"
                    )}
                    placeholder="Thêm ghi chú chi tiết..."
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              {selectedEvent && !isReadOnly ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-2.5 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              ) : (
                <div></div>
              )}
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 font-medium rounded-xl transition-colors"
                >
                  Đóng
                </button>
                {!isReadOnly && (
                  <button
                    type="submit"
                    form="task-form"
                    disabled={isLoading}
                    className={cn(
                      "bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-70",
                      isPrimarySchool ? "px-8 py-3 rounded-2xl text-lg shadow-md" : "px-6 py-2.5 rounded-xl"
                    )}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Lưu
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
