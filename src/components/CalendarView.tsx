import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event, Views, Navigate } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/supabase';
import { cn } from '../lib/utils';
import { Book, Trophy, Music, Palette, Calculator, FlaskConical, Globe, Clock, Calendar as CalendarIcon, Plus, Rocket, GraduationCap, Pencil, Apple, ChevronLeft, ChevronRight, CalendarDays, Loader2, List, Grid } from 'lucide-react';
import TaskModal from './TaskModal';
import { toast } from 'sonner';

const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'fixed' | 'personal';
  color?: string;
  notes?: string;
  subject_icon?: string;
  resource?: any;
}

interface CalendarViewProps {
  profile: Profile;
}

const ICONS: Record<string, React.ElementType> = {
  book: Book,
  trophy: Trophy,
  music: Music,
  palette: Palette,
  calculator: Calculator,
  science: FlaskConical,
  globe: Globe,
  pencil: Pencil,
  apple: Apple,
};

interface GridViewProps {
  events: CalendarEvent[];
  date: Date;
  onSelectEvent: (event: CalendarEvent) => void;
  isPrimarySchool: boolean;
}

const GridView = ({ events, date, onSelectEvent, isPrimarySchool }: GridViewProps) => {
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  }).sort((a, b) => a.start.getTime() - b.start.getTime());

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
          <CalendarIcon className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-xl font-medium text-slate-500">Không có sự kiện nào trong tháng này</p>
        <p className="text-slate-400 mt-2">Hãy thêm lịch học mới để bắt đầu quản lý thời gian!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-4 overflow-y-auto h-full content-start">
      {filteredEvents.map((event) => {
        const Icon = event.subject_icon && ICONS[event.subject_icon] ? ICONS[event.subject_icon] : Book;
        const eventColor = event.color || (event.type === 'fixed' ? '#3b82f6' : '#10b981');
        
        return (
          <div 
            key={event.id}
            onClick={() => onSelectEvent(event)}
            className={cn(
              "group relative bg-white rounded-2xl p-5 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full",
              isPrimarySchool ? "border-orange-100" : "border-slate-200",
              new Date().toDateString() === event.start.toDateString() && "ring-2 ring-offset-2 ring-indigo-500"
            )}
            style={{ borderTopColor: eventColor, borderTopWidth: '4px' }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-slate-100/80 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            
            {new Date().toDateString() === event.start.toDateString() && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10 animate-pulse">
                HÔM NAY
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 w-full">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner shrink-0 transition-transform group-hover:scale-110 duration-300"
                  style={{ backgroundColor: `${eventColor}15`, color: eventColor }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={cn(
                    "font-bold text-slate-900 truncate", 
                    isPrimarySchool ? "text-lg" : "text-base"
                  )} title={event.title}>
                    {event.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium capitalize mt-0.5">
                    {format(event.start, 'EEEE, dd/MM', { locale: vi })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mt-auto">
              <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">
                  {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                </span>
              </div>
              
              {event.notes && (
                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl line-clamp-2 border border-slate-100 italic relative">
                  <span className="absolute -top-2 -left-1 text-2xl text-slate-300 leading-none">"</span>
                  <span className="relative z-10">{event.notes}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <span className={cn(
                "text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                event.type === 'fixed' 
                  ? "bg-blue-50 text-blue-600 border border-blue-100" 
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              )}>
                {event.type === 'fixed' ? 'Cố định' : 'Cá nhân'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function CalendarView({ profile }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<any>('grid');
  const [date, setDate] = useState(new Date());

  const isPrimarySchool = profile.grade_level ? profile.grade_level <= 5 : false;

  useEffect(() => {
    fetchSchedules();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchSchedules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', profile.id);

    if (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Không thể tải lịch học. Vui lòng thử lại sau.');
    } else if (data) {
      const formattedEvents: CalendarEvent[] = data.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        start: new Date(schedule.start_time),
        end: new Date(schedule.end_time),
        type: schedule.type as 'fixed' | 'personal',
        color: schedule.color || undefined,
        notes: schedule.notes || undefined,
        subject_icon: schedule.subject_icon || undefined,
      }));
      setEvents(formattedEvents);
    }
    setIsLoading(false);
  };

  const onEventResize: withDragAndDropProps['onEventResize'] = async (data) => {
    const { event, start, end } = data;
    const typedEvent = event as CalendarEvent;
    
    if (typedEvent.type === 'fixed') {
      toast.warning('Không thể thay đổi lịch cố định của nhà trường!');
      return;
    }

    // Optimistic update
    const oldEvents = [...events];
    setEvents(events.map(e => e.id === typedEvent.id ? { ...e, start: new Date(start), end: new Date(end) } : e));

    const { error } = await supabase
      .from('schedules')
      .update({
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      })
      .eq('id', typedEvent.id);

    if (error) {
      console.error('Error updating schedule:', error);
      toast.error('Có lỗi xảy ra khi cập nhật lịch');
      setEvents(oldEvents); // Revert on error
    } else {
      toast.success('Đã cập nhật thời gian lịch học');
    }
  };

  const onEventDrop: withDragAndDropProps['onEventDrop'] = async (data) => {
    const { event, start, end } = data;
    const typedEvent = event as CalendarEvent;

    if (typedEvent.type === 'fixed') {
      toast.warning('Không thể di chuyển lịch cố định của nhà trường!');
      return;
    }

    // Optimistic update
    const oldEvents = [...events];
    setEvents(events.map(e => e.id === typedEvent.id ? { ...e, start: new Date(start), end: new Date(end) } : e));

    const { error } = await supabase
      .from('schedules')
      .update({
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      })
      .eq('id', typedEvent.id);

    if (error) {
      console.error('Error updating schedule:', error);
      toast.error('Có lỗi xảy ra khi cập nhật lịch');
      setEvents(oldEvents); // Revert on error
    } else {
      toast.success('Đã di chuyển lịch học');
    }
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setSelectedSlot(slotInfo);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event as CalendarEvent);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const eventStyleGetter = (event: Event) => {
    const typedEvent = event as CalendarEvent;
    const backgroundColor = typedEvent.color || (typedEvent.type === 'fixed' ? '#3b82f6' : '#10b981');
    const style = {
      backgroundColor,
      borderRadius: isPrimarySchool ? '16px' : '6px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: isPrimarySchool ? '6px 10px' : '2px 4px',
      fontSize: isPrimarySchool ? '16px' : '12px',
      fontWeight: isPrimarySchool ? '700' : '500',
      boxShadow: isPrimarySchool ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
    };
    return { style };
  };



  const { components } = useMemo(() => ({
    components: {
      event: ({ event }: { event: Event }) => {
        const typedEvent = event as CalendarEvent;
        const Icon = typedEvent.subject_icon && ICONS[typedEvent.subject_icon] ? ICONS[typedEvent.subject_icon] : null;

        return (
          <div className={cn("flex items-center gap-2 h-full overflow-hidden", isPrimarySchool && "py-0.5")}>
            {Icon && <Icon className={cn("shrink-0", isPrimarySchool ? "w-6 h-6" : "w-3.5 h-3.5")} />}
            <span className={cn("truncate", isPrimarySchool && "tracking-wide")}>{typedEvent.title}</span>
          </div>
        );
      },
      toolbar: (toolbar: any) => {
        const goToBack = () => {
          toolbar.onNavigate(Navigate.PREVIOUS);
        };

        const goToNext = () => {
          toolbar.onNavigate(Navigate.NEXT);
        };

        const goToCurrent = () => {
          toolbar.onNavigate(Navigate.TODAY);
        };

        const label = () => {
          const date = toolbar.date;
          return (
            <span className={cn("capitalize", isPrimarySchool ? "text-2xl font-black text-orange-600" : "text-xl font-bold text-slate-800")}>
              {format(date, 'MMMM yyyy', { locale: vi })}
            </span>
          );
        };

        return (
          <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 mb-6", isPrimarySchool ? "bg-orange-50 p-4 rounded-2xl border-2 border-orange-100" : "bg-white p-2 border-b border-slate-100 mb-4")}>
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <button
                onClick={goToBack}
                className={cn(
                  "p-2 rounded-lg transition-colors flex items-center justify-center",
                  isPrimarySchool 
                    ? "bg-white text-orange-600 hover:bg-orange-100 border-2 border-orange-200 font-bold" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
                title="Trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToCurrent}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors text-sm",
                  isPrimarySchool 
                    ? "bg-orange-500 text-white hover:bg-orange-600 font-bold shadow-md" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                )}
              >
                Hôm nay
              </button>
              <button
                onClick={goToNext}
                className={cn(
                  "p-2 rounded-lg transition-colors flex items-center justify-center",
                  isPrimarySchool 
                    ? "bg-white text-orange-600 hover:bg-orange-100 border-2 border-orange-200 font-bold" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
                title="Sau"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="order-1 sm:order-2 flex items-center gap-2">
              <CalendarDays className={cn("w-5 h-5", isPrimarySchool ? "text-orange-500" : "text-slate-400")} />
              {label()}
            </div>

            <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200/50 order-3">
              <button
                onClick={() => toolbar.onView(Views.MONTH)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
                  toolbar.view === 'month' 
                    ? (isPrimarySchool ? "bg-orange-500 text-white shadow-orange-200" : "bg-white text-slate-900 shadow-slate-200") 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
                title="Tháng"
              >
                Tháng
              </button>
              <button
                onClick={() => toolbar.onView(Views.WEEK)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
                  toolbar.view === 'week' 
                    ? (isPrimarySchool ? "bg-orange-500 text-white shadow-orange-200" : "bg-white text-slate-900 shadow-slate-200") 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
                title="Tuần"
              >
                Tuần
              </button>
              <button
                onClick={() => toolbar.onView(Views.DAY)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
                  toolbar.view === 'day' 
                    ? (isPrimarySchool ? "bg-orange-500 text-white shadow-orange-200" : "bg-white text-slate-900 shadow-slate-200") 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
                title="Ngày"
              >
                Ngày
              </button>
              <button
                onClick={() => toolbar.onView(Views.AGENDA)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
                  toolbar.view === 'agenda' 
                    ? (isPrimarySchool ? "bg-orange-500 text-white shadow-orange-200" : "bg-white text-slate-900 shadow-slate-200") 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
                title="Lịch trình"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
                  "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
                title="Dạng lưới"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      }
    },
  }), [isPrimarySchool, view]);

  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  return (
    <div className={cn(
      "h-full flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden relative",
      isPrimarySchool ? "p-6 border-orange-200 shadow-orange-100/50" : "p-4 border-slate-200"
    )}>
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <Loader2 className={cn("w-10 h-10 animate-spin", isPrimarySchool ? "text-orange-500" : "text-indigo-600")} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-3 mb-1">
            <h2 className={cn(
              "font-bold text-slate-900 flex items-center gap-2",
              isPrimarySchool ? "text-2xl" : "text-xl"
            )}>
              <CalendarIcon className={cn("shrink-0", isPrimarySchool ? "w-8 h-8 text-indigo-500" : "w-6 h-6 text-indigo-500")} />
              <span className="truncate">Lịch học của {profile.full_name}</span>
            </h2>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 shrink-0",
              isPrimarySchool 
                ? "bg-orange-100 text-orange-700 border border-orange-200" 
                : "bg-slate-100 text-slate-700 border border-slate-200"
            )}>
              {isPrimarySchool ? <Rocket className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              Lớp {profile.grade_level}
            </span>
          </div>
          <p className={cn("font-medium", isPrimarySchool ? "text-indigo-600 text-lg" : "text-slate-500")}>
            {isPrimarySchool ? "🌟 Chúc bạn một ngày học tập thật vui vẻ!" : "Quản lý thời gian và mục tiêu học tập của bạn."}
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setSelectedSlot({ start: new Date(), end: new Date(new Date().setHours(new Date().getHours() + 1)) });
            setIsModalOpen(true);
          }}
          className={cn(
            "flex items-center justify-center gap-2 text-white transition-colors w-full sm:w-auto shrink-0",
            isPrimarySchool 
              ? "bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-2xl font-bold text-lg shadow-md hover:shadow-lg" 
              : "bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl font-medium text-sm"
          )}
        >
          <Plus className={isPrimarySchool ? "w-6 h-6" : "w-4 h-4"} />
          Thêm lịch mới
        </button>
      </div>

      <div className="flex-1 min-h-[600px] relative z-0">
        <style>{`
          .rbc-calendar { font-family: inherit; border: none; }
          .rbc-header { 
            padding: ${isPrimarySchool ? '16px' : '12px'}; 
            font-weight: ${isPrimarySchool ? '800' : '600'}; 
            color: ${isPrimarySchool ? '#c2410c' : '#475569'}; 
            border-bottom: ${isPrimarySchool ? '3px solid #fdba74' : '1px solid #e2e8f0'};
            background-color: ${isPrimarySchool ? '#fff7ed' : '#f8fafc'};
            font-size: ${isPrimarySchool ? '18px' : '14px'};
            text-transform: ${isPrimarySchool ? 'uppercase' : 'none'};
            border-left: none;
          }
          .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
            border: ${isPrimarySchool ? '2px solid #fed7aa' : '1px solid #e2e8f0'};
            border-radius: ${isPrimarySchool ? '20px' : '12px'};
            overflow: hidden;
            background: white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
          }
          .rbc-today { 
            background-color: ${isPrimarySchool ? '#fff7ed' : '#f8fafc'}; 
          }
          .rbc-day-bg + .rbc-day-bg {
            border-left: ${isPrimarySchool ? '2px solid #fed7aa' : '1px solid #f1f5f9'};
          }
          .rbc-month-row + .rbc-month-row {
            border-top: ${isPrimarySchool ? '2px solid #fed7aa' : '1px solid #f1f5f9'};
          }
          .rbc-event { 
            transition: all 0.2s ease; 
            border-radius: ${isPrimarySchool ? '10px' : '6px'};
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          }
          .rbc-event:hover { 
            transform: translateY(-1px) scale(1.01); 
            z-index: 10; 
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          .rbc-time-header-content { border-left: ${isPrimarySchool ? '2px solid #fed7aa' : '1px solid #e2e8f0'}; }
          .rbc-time-content { border-top: ${isPrimarySchool ? '2px solid #fed7aa' : '1px solid #e2e8f0'}; }
          .rbc-timeslot-group { border-bottom: 1px solid #f1f5f9; }
          .rbc-time-slot { border-top: 1px dashed #f8fafc; }
          
          ${isPrimarySchool ? `
            .rbc-time-slot { min-height: 80px; border-top: 1px dashed #ffedd5; }
            .rbc-timeslot-group { min-height: 160px; border-bottom: 2px solid #ffedd5; }
            .rbc-label { font-size: 16px; font-weight: 700; color: #ea580c; padding: 0 8px; }
            .rbc-time-gutter { background-color: #fff7ed; border-right: 2px solid #fed7aa; }
            .rbc-day-slot .rbc-time-slot { background-color: #fffaf5; }
            .rbc-day-slot .rbc-time-slot:nth-child(even) { background-color: #ffffff; }
          ` : `
            .rbc-time-slot { min-height: 40px; border-top: 1px dashed #f1f5f9; }
            .rbc-timeslot-group { min-height: 80px; border-bottom: 1px solid #e2e8f0; }
            .rbc-label { color: #64748b; font-size: 12px; padding: 0 4px; }
            .rbc-time-gutter { background-color: #f8fafc; border-right: 1px solid #e2e8f0; }
            .rbc-day-slot .rbc-time-slot { background-color: #ffffff; }
            .rbc-day-slot .rbc-time-slot:nth-child(even) { background-color: #fcfcfc; }
          `}
        `}</style>
        
        {view === 'grid' ? (
          <div className="h-full flex flex-col">
            <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 mb-6", isPrimarySchool ? "bg-orange-50 p-4 rounded-2xl border-2 border-orange-100" : "bg-white p-2 border-b border-slate-100 mb-4")}>
              <div className="flex items-center justify-between sm:justify-start gap-2 order-2 sm:order-1 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const newDate = new Date(date);
                    newDate.setMonth(date.getMonth() - 1);
                    setDate(newDate);
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center",
                    isPrimarySchool 
                      ? "bg-white text-orange-600 hover:bg-orange-100 border-2 border-orange-200 font-bold" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  title="Trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDate(new Date())}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors text-sm",
                    isPrimarySchool 
                      ? "bg-orange-500 text-white hover:bg-orange-600 font-bold shadow-md" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                  )}
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => {
                    const newDate = new Date(date);
                    newDate.setMonth(date.getMonth() + 1);
                    setDate(newDate);
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center",
                    isPrimarySchool 
                      ? "bg-white text-orange-600 hover:bg-orange-100 border-2 border-orange-200 font-bold" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  title="Sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="order-1 sm:order-2 flex items-center gap-2">
                <CalendarDays className={cn("w-5 h-5 shrink-0", isPrimarySchool ? "text-orange-500" : "text-slate-400")} />
                <span className={cn("capitalize truncate", isPrimarySchool ? "text-2xl font-black text-orange-600" : "text-xl font-bold text-slate-800")}>
                  {format(date, 'MMMM yyyy', { locale: vi })}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200/50 order-3 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setView(Views.MONTH)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm text-slate-500 hover:text-slate-700 hover:bg-white/50 whitespace-nowrap"
                >
                  Tháng
                </button>
                <button
                  onClick={() => setView(Views.WEEK)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm text-slate-500 hover:text-slate-700 hover:bg-white/50 whitespace-nowrap"
                >
                  Tuần
                </button>
                <button
                  onClick={() => setView(Views.DAY)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm text-slate-500 hover:text-slate-700 hover:bg-white/50 whitespace-nowrap"
                >
                  Ngày
                </button>
                <button
                  onClick={() => setView(Views.AGENDA)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm text-slate-500 hover:text-slate-700 hover:bg-white/50 shrink-0"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('grid')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm shrink-0",
                    isPrimarySchool ? "bg-orange-500 text-white shadow-orange-200" : "bg-white text-slate-900 shadow-slate-200"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
            <GridView events={events} date={date} onSelectEvent={handleSelectEvent} isPrimarySchool={isPrimarySchool} />
          </div>
        ) : (
          <DnDCalendar
            style={{ height: '100%', minHeight: '600px' }}
            localizer={localizer}
            events={events}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            resizable
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            step={30}
            timeslots={2}
            eventPropGetter={eventStyleGetter}
            components={components}
            culture="vi"
            messages={{
              today: 'Hôm nay',
              previous: 'Trước',
              next: 'Sau',
              month: 'Tháng',
              week: 'Tuần',
              day: 'Ngày',
              agenda: 'Lịch trình',
              date: 'Ngày',
              time: 'Thời gian',
              event: 'Sự kiện',
              noEventsInRange: 'Không có sự kiện nào trong khoảng thời gian này.',
            }}
          />
        )}
      </div>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedEvent={selectedEvent}
          selectedSlot={selectedSlot}
          userId={profile.id}
          isPrimarySchool={isPrimarySchool}
          onSuccess={fetchSchedules}
        />
      )}
    </div>
  );
}