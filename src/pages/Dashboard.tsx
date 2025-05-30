import { useState, useEffect } from "react";
import { format, differenceInDays, isSameDay, isWithinInterval, addDays } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus, CalendarDays, UserRound, ShoppingBag, Stethoscope, BarChart2 } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import MoodSelector, { MoodType, getMoodIcon, getMoodLabel } from "@/components/period/MoodSelector";
import DoctorConsultation from "@/components/doctor/DoctorConsultation";
import SymptomSelector, { SymptomType, getSymptomIcon, getSymptomLabel } from "@/components/period/SymptomSelector";
import SymptomTrackingDialog from "@/components/period/SymptomTrackingDialog";
import CyclePredictions from "@/components/period/CyclePredictions";
import CycleAnalytics from "@/components/period/CycleAnalytics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import WaterIntakeTracker from "@/components/health/WaterIntakeTracker";
import SleepTracker from "@/components/health/SleepTracker";
import HealthInsights from "@/components/education/HealthInsights";
import WeightTracker from "@/components/health/WeightTracker";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";

interface PeriodDay {
  date: Date;
  notes?: string;
  mood?: MoodType;
  symptoms?: SymptomType[];
}

interface PeriodCycle {
  id?: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  days: PeriodDay[];
}

// Define interfaces for cycle and symptom data
interface CycleData {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PeriodDayData {
  id: string;
  cycle_id: string;
  user_id: string;
  date: string;
  mood: string | null;
  symptoms: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SleepData {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  quality: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface WaterIntakeData {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  created_at: string;
  updated_at: string;
}

// Interface for symptom data from API
interface SymptomDataType {
  id: string; 
  name: string;
  count: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [periodCycles, setPeriodCycles] = useState<PeriodCycle[]>([]);
  const [newStartDate, setNewStartDate] = useState<Date | undefined>(undefined);
  const [newEndDate, setNewEndDate] = useState<Date | undefined>(undefined);
  const [newNotes, setNewNotes] = useState("");
  const [showAddPeriodDialog, setShowAddPeriodDialog] = useState(false);
  const [selectedDayForMood, setSelectedDayForMood] = useState<PeriodDay | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType>(undefined);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [selectedDayForSymptoms, setSelectedDayForSymptoms] = useState<PeriodDay | null>(null);
  const [showSymptomDialog, setShowSymptomDialog] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("period");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch cycle data from Supabase
  const { 
    data: cycleData, 
    loading: cycleLoading,
    insertData: insertCycle,
    updateData: updateCycle
  } = useSupabaseData<CycleData>(
    {
      table: "period_cycles",
      column: "user_id",
      value: user?.id,
      orderBy: { column: "start_date", ascending: false }
    },
    [user?.id]
  );

  // Fetch period days data from Supabase
  const { 
    data: periodDaysData, 
    loading: periodDaysLoading,
    insertData: insertPeriodDay,
    updateData: updatePeriodDay
  } = useSupabaseData<PeriodDayData>(
    {
      table: "period_days",
      column: "user_id",
      value: user?.id,
      orderBy: { column: "date", ascending: false }
    },
    [user?.id]
  );

  // Convert Supabase data to local format on initial load
  useEffect(() => {
    if (isInitialLoading && cycleData && periodDaysData && !cycleLoading && !periodDaysLoading) {
      // Process cycle data
      const cycles: PeriodCycle[] = cycleData.map(cycle => {
        const cycleDays = periodDaysData
          .filter(day => day.cycle_id === cycle.id)
          .map(day => ({
            date: new Date(day.date),
            mood: day.mood as MoodType,
            symptoms: day.symptoms as SymptomType[],
            notes: day.notes || undefined
          }));

        return {
          id: cycle.id,
          startDate: new Date(cycle.start_date),
          endDate: cycle.end_date ? new Date(cycle.end_date) : undefined,
          notes: cycle.notes || undefined,
          days: cycleDays
        };
      });

      setPeriodCycles(cycles);
      setIsInitialLoading(false);
    }
  }, [cycleData, periodDaysData, cycleLoading, periodDaysLoading, isInitialLoading]);

  // Save to localStorage as a backup
  useEffect(() => {
    if (!isInitialLoading && periodCycles.length > 0) {
      localStorage.setItem("periodCycles", JSON.stringify(periodCycles));
    }
  }, [periodCycles, isInitialLoading]);

  // Load from localStorage only if no data from Supabase yet
  useEffect(() => {
    const savedPeriodCycles = localStorage.getItem("periodCycles");
    
    // Only use localStorage data if we don't have Supabase data yet
    if (savedPeriodCycles && isInitialLoading && !cycleData?.length) {
      try {
        const parsedCycles = JSON.parse(savedPeriodCycles, (key, value) => {
          // Convert date strings back to Date objects
          if (key === "date" || key === "startDate" || key === "endDate") {
            return value ? new Date(value) : undefined;
          }
          return value;
        });
        setPeriodCycles(parsedCycles);
      } catch (error) {
        console.error("Error parsing saved period cycles:", error);
      }
    }
  }, [isInitialLoading, cycleData]);

  const getAllPeriodDays = () => {
    const allDays: PeriodDay[] = [];
    
    periodCycles.forEach(cycle => {
      if (!cycle.endDate) return;
      
      const daysDiff = differenceInDays(cycle.endDate, cycle.startDate);
      
      for (let i = 0; i <= daysDiff; i++) {
        const date = addDays(cycle.startDate, i);
        const existingDay = cycle.days.find(day => isSameDay(day.date, date));
        
        if (existingDay) {
          allDays.push(existingDay);
        } else {
          allDays.push({ date });
        }
      }
    });
    
    return allDays;
  };

  const getCurrentCycle = () => {
    if (periodCycles.length === 0) return null;
    return periodCycles[0]; // First one since we're sorting by date descending
  };

  const addNewPeriod = async () => {
    if (!newStartDate || !user) {
      toast({
        title: "Missing information",
        description: "Please select a start date for your period or log in.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create new cycle in Supabase
      const { data: newCycleData, error: cycleError } = await insertCycle({
        user_id: user.id,
        start_date: newStartDate.toISOString(),
        end_date: newEndDate ? newEndDate.toISOString() : null,
        notes: newNotes || null,
      });

      if (cycleError) throw cycleError;
      
      if (!newCycleData || !newCycleData[0]) {
        throw new Error("Failed to create period cycle");
      }

      const cycleId = newCycleData[0].id;
      
      // Create period days in Supabase
      if (newEndDate) {
        const daysDiff = differenceInDays(newEndDate, newStartDate);
        
        for (let i = 0; i <= daysDiff; i++) {
          const date = addDays(newStartDate, i);
          
          await insertPeriodDay({
            cycle_id: cycleId,
            user_id: user.id,
            date: date.toISOString(),
          });
        }
      } else {
        await insertPeriodDay({
          cycle_id: cycleId,
          user_id: user.id,
          date: newStartDate.toISOString(),
        });
      }

      // Update local state
      const newCycle: PeriodCycle = {
        id: cycleId,
        startDate: newStartDate,
        endDate: newEndDate,
        notes: newNotes,
        days: [],
      };

      if (newEndDate) {
        const daysDiff = differenceInDays(newEndDate, newStartDate);
        
        for (let i = 0; i <= daysDiff; i++) {
          const date = addDays(newStartDate, i);
          newCycle.days.push({ date });
        }
      } else {
        newCycle.days.push({ date: newStartDate });
      }

      setPeriodCycles(prev => [newCycle, ...prev]);
      
      toast({
        title: "Period logged",
        description: `Your period has been recorded starting on ${format(newStartDate, "MMMM d, yyyy")}${
          newEndDate ? ` ending on ${format(newEndDate, "MMMM d, yyyy")}` : ""
        }.`,
      });
      
      setNewStartDate(undefined);
      setNewEndDate(undefined);
      setNewNotes("");
      setShowAddPeriodDialog(false);
    } catch (error) {
      console.error("Error saving period data:", error);
      toast({
        title: "Error saving data",
        description: "There was an error saving your period data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isPeriodDay = (date: Date) => {
    return periodCycles.some(cycle => {
      if (!cycle.endDate) {
        return isSameDay(cycle.startDate, date);
      }
      
      return isWithinInterval(date, {
        start: cycle.startDate,
        end: cycle.endDate,
      });
    });
  };

  const getDayFromDate = (date: Date): PeriodDay | null => {
    for (const cycle of periodCycles) {
      const day = cycle.days.find(d => isSameDay(d.date, date));
      if (day) {
        return day;
      }
    }
    return null;
  };

  const handleDayClick = (date: Date) => {
    if (!isPeriodDay(date)) return;
    
    const day = getDayFromDate(date);
    if (day) {
      setSelectedDayForMood(day);
      setSelectedMood(day.mood);
      setShowMoodDialog(true);
    }
  };

  const saveMoodForDay = async () => {
    if (!selectedDayForMood || !user) return;

    try {
      // Find the cycle this day belongs to
      let cycleId: string | undefined;
      let dayId: string | undefined;
      
      for (const cycle of periodCycles) {
        const dayIndex = cycle.days.findIndex(day => 
          isSameDay(day.date, selectedDayForMood.date)
        );
        if (dayIndex >= 0) {
          cycleId = cycle.id;
          // Check if this day already exists in Supabase
          const existingDay = periodDaysData?.find(d => 
            isSameDay(new Date(d.date), selectedDayForMood.date) && 
            d.cycle_id === cycleId
          );
          if (existingDay) {
            dayId = existingDay.id;
          }
          break;
        }
      }

      if (!cycleId) {
        throw new Error("Could not find associated cycle");
      }

      if (dayId) {
        // Update existing day
        await updatePeriodDay(dayId, {
          mood: selectedMood,
        });
      } else {
        // Create new day
        await insertPeriodDay({
          cycle_id: cycleId,
          user_id: user.id,
          date: selectedDayForMood.date.toISOString(),
          mood: selectedMood,
        });
      }

      // Update local state
      const updatedCycles = periodCycles.map(cycle => {
        const updatedDays = cycle.days.map(day => {
          if (isSameDay(day.date, selectedDayForMood.date)) {
            return { ...day, mood: selectedMood };
          }
          return day;
        });
        return { ...cycle, days: updatedDays };
      });

      setPeriodCycles(updatedCycles);
      
      toast({
        title: "Mood logged",
        description: `You're feeling ${getMoodLabel(selectedMood, t)} on ${format(selectedDayForMood.date, "MMMM d, yyyy")}`,
      });
      setShowMoodDialog(false);
    } catch (error) {
      console.error("Error saving mood data:", error);
      toast({
        title: "Error saving mood",
        description: "There was an error saving your mood data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMoodForDay = (date: Date): MoodType => {
    const day = getDayFromDate(date);
    return day?.mood;
  };

  const getSymptomsForDay = (date: Date): SymptomType[] => {
    const day = getDayFromDate(date);
    return day?.symptoms || [];
  };

  // Fix for function call error - update handleSymptomTracking to pass a Date
  const handleSymptomTracking = (date: Date) => {
    const day = getDayFromDate(date);
    if (day) {
      setSelectedDayForSymptoms(day);
      setShowSymptomDialog(true);
    }
  };

  const saveSymptoms = async (symptoms: SymptomType[], notes: string) => {
    if (!selectedDayForSymptoms || !user) return;

    try {
      // Find the cycle this day belongs to
      let cycleId: string | undefined;
      let dayId: string | undefined;
      
      for (const cycle of periodCycles) {
        const dayIndex = cycle.days.findIndex(day => 
          isSameDay(day.date, selectedDayForSymptoms.date)
        );
        if (dayIndex >= 0) {
          cycleId = cycle.id;
          // Check if this day already exists in Supabase
          const existingDay = periodDaysData?.find(d => 
            isSameDay(new Date(d.date), selectedDayForSymptoms.date) && 
            d.cycle_id === cycleId
          );
          if (existingDay) {
            dayId = existingDay.id;
          }
          break;
        }
      }

      if (!cycleId) {
        throw new Error("Could not find associated cycle");
      }

      if (dayId) {
        // Update existing day
        await updatePeriodDay(dayId, {
          symptoms,
          notes: notes || null,
        });
      } else {
        // Create new day
        await insertPeriodDay({
          cycle_id: cycleId,
          user_id: user.id,
          date: selectedDayForSymptoms.date.toISOString(),
          symptoms,
          notes: notes || null,
        });
      }

      // Update local state
      const updatedCycles = periodCycles.map(cycle => {
        const updatedDays = cycle.days.map(day => {
          if (isSameDay(day.date, selectedDayForSymptoms.date)) {
            return { 
              ...day, 
              symptoms,
              notes: notes || day.notes 
            };
          }
          return day;
        });
        return { ...cycle, days: updatedDays };
      });

      setPeriodCycles(updatedCycles);
      
      toast({
        title: "Symptoms tracked",
        description: `Symptoms saved for ${format(selectedDayForSymptoms.date, "MMMM d, yyyy")}`,
      });
      setShowSymptomDialog(false);
    } catch (error) {
      console.error("Error saving symptom data:", error);
      toast({
        title: "Error saving symptoms",
        description: "There was an error saving your symptom data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-femme-beige to-femme-pink-light">
      <header className="bg-white shadow-md py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Logo className="h-10" />
          <div className="flex gap-3">
            <LanguageSwitcher />
            <Button variant="outline" asChild className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy">
              <Link to="/profile">
                <UserRound className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t("nav.profile")}</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy">
              <Link to="/store">
                <ShoppingBag className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t("nav.store")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-femme-burgundy">{t("app.hello")}</h1>
          <Button 
            onClick={() => setShowAddPeriodDialog(true)} 
            className="bg-femme-pink hover:bg-femme-pink/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("period.track")}
          </Button>
        </div>
        
        <Tabs 
          defaultValue="period" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="period" className="text-femme-burgundy data-[state=active]:bg-femme-pink data-[state=active]:text-white">
              {t("period.tracker")}
            </TabsTrigger>
            <TabsTrigger value="health" className="text-femme-burgundy data-[state=active]:bg-femme-pink data-[state=active]:text-white">
              {t("health.waterIntake").split(" ")[0]}
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-femme-burgundy data-[state=active]:bg-femme-pink data-[state=active]:text-white">
              {t("period.cycle").split(" ")[0]}
            </TabsTrigger>
            <TabsTrigger value="medical" className="text-femme-burgundy data-[state=active]:bg-femme-pink data-[state=active]:text-white">
              {t("doctor.appointment")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="period">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="shadow-lg border-femme-taupe border-opacity-50">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-femme-burgundy text-xl">{t("period.tracker")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Calendar
                      mode="single"
                      className="rounded-lg border shadow p-3 pointer-events-auto"
                      modifiers={{
                        periodDay: getAllPeriodDays().map(day => day.date),
                      }}
                      modifiersStyles={{
                        periodDay: { 
                          backgroundColor: "#D291BC", 
                          color: "white",
                          borderRadius: "100%" 
                        },
                      }}
                      components={{
                        DayContent: (props) => {
                          const { date } = props;
                          const dateNumber = date.getDate();
                          
                          if (isPeriodDay(date)) {
                            const mood = getMoodForDay(date);
                            const symptoms = getSymptomsForDay(date);
                            
                            return (
                              <div className="flex flex-col items-center">
                                <div>{dateNumber}</div>
                                {mood && (
                                  <div className="mt-1">
                                    {getMoodIcon(mood, 12)}
                                  </div>
                                )}
                                {symptoms && symptoms.length > 0 && (
                                  <div className="text-xs text-white">●</div>
                                )}
                              </div>
                            );
                          }
                          return <>{dateNumber}</>;
                        }
                      }}
                      onDayClick={handleDayClick}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between flex-wrap gap-2">
                    <div className="flex gap-2 items-center text-sm text-femme-burgundy/70">
                      <div className="h-3 w-3 rounded-full bg-femme-pink"></div>
                      <span>{t("period.tracker").split(" ")[0]}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-femme-burgundy"
                        onClick={() => {
                          const today = new Date();
                          handleSymptomTracking(today);
                        }}
                      >
                        {t("period.symptoms")}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>

                <CyclePredictions periodCycles={periodCycles} />

                <Collapsible 
                  open={isStatsOpen} 
                  onOpenChange={setIsStatsOpen}
                  className="shadow-lg border border-femme-taupe border-opacity-50 rounded-lg bg-white"
                >
                  <CollapsibleTrigger asChild>
                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-femme-pink-light/10">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-femme-burgundy" />
                        <h3 className="text-femme-burgundy text-xl font-medium">{t("period.cycle")}</h3>
                      </div>
                      <Button variant="ghost" size="sm">
                        {isStatsOpen ? t("language.changed").split(" ")[0] : t("language.select").split(" ")[0]}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4">
                    <CycleAnalytics periodCycles={periodCycles} />
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="space-y-6">
                <Card className="shadow-lg border-femme-taupe border-opacity-50">
                  <CardHeader>
                    <CardTitle className="text-femme-burgundy text-xl">{t("period.cycle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getCurrentCycle() ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-femme-burgundy mb-2">Period Information</h3>
                          <div className="flex items-center gap-2 text-femme-burgundy/70">
                            <CalendarDays className="h-5 w-5 text-femme-burgundy" />
                            <span>
                              <strong>Period Start Date:</strong> {format(getCurrentCycle()!.startDate, "MMMM d, yyyy")}
                            </span>
                          </div>
                          {getCurrentCycle()!.endDate && (
                            <div className="flex items-center gap-2 mt-2 text-femme-burgundy/70">
                              <CalendarDays className="h-5 w-5 text-femme-burgundy" />
                              <span>
                                <strong>Period End Date:</strong> {format(getCurrentCycle()!.endDate!, "MMMM d, yyyy")}
                              </span>
                            </div>
                          )}
                          {getCurrentCycle()!.endDate && (
                            <div className="mt-2 text-femme-burgundy/70">
                              <strong>Duration:</strong> {differenceInDays(getCurrentCycle()!.endDate!, getCurrentCycle()!.startDate) + 1} days
                            </div>
                          )}
                        </div>

                        {getCurrentCycle()!.notes && (
                          <div>
                            <h3 className="font-medium text-femme-burgundy mb-2">{t("profile.updateSuccess").split(" ")[0]}</h3>
                            <div className="text-femme-burgundy/70 italic bg-femme-pink-light/20 p-3 rounded">
                              {getCurrentCycle()!.notes}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-femme-burgundy">{t("period.symptoms")}</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSymptomTracking(new Date())}
                              className="text-xs"
                            >
                              {t("period.track")}
                            </Button>
                          </div>
                          <div className="text-sm text-femme-burgundy/70 mb-2">
                            {t("period.tracker")}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {["cramps", "headache", "bloating", "fatigue", "acne", "cravings"].map((symptom) => (
                              <div
                                key={symptom}
                                className="flex items-center gap-1 text-xs bg-femme-pink-light/30 text-femme-burgundy rounded-full px-2 py-1"
                              >
                                {getSymptomIcon(symptom as SymptomType, 14)}
                                <span>{getSymptomLabel(symptom as SymptomType)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-femme-burgundy/70 mb-4">{t("period.tracker")}</p>
                        <Button 
                          onClick={() => setShowAddPeriodDialog(true)} 
                          className="bg-femme-pink hover:bg-femme-pink/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("period.track")}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <WeightTracker />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="health">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <WaterIntakeTracker />
                <SleepTracker />
              </div>
              <div className="space-y-6">
                <WeightTracker />
                <HealthInsights />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <CyclePredictions periodCycles={periodCycles} />
                <Collapsible 
                  defaultOpen={true}
                  className="shadow-lg border border-femme-taupe border-opacity-50 rounded-lg bg-white"
                >
                  <CollapsibleTrigger asChild>
                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-femme-pink-light/10">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-femme-burgundy" />
                        <h3 className="text-femme-burgundy text-xl font-medium">{t("period.cycle")}</h3>
                      </div>
                      <Button variant="ghost" size="sm">
                        {t("language.select").split(" ")[0]}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4">
                    <CycleAnalytics periodCycles={periodCycles} />
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <div className="space-y-6">
                <HealthInsights />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="medical">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <DoctorConsultation />
              </div>
              <div className="space-y-6">
                <Card className="shadow-lg border-femme-taupe border-opacity-50">
                  <CardHeader>
                    <CardTitle className="text-femme-burgundy flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-femme-burgundy" />
                      {t("doctor.appointment")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-femme-burgundy/70 mb-4">{t("doctor.location")}</p>
                      <p className="text-sm text-femme-burgundy/60">
                        {t("doctor.findNearby")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Period Dialog */}
      <Dialog open={showAddPeriodDialog} onOpenChange={setShowAddPeriodDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Add Period</DialogTitle>
            <DialogDescription>
              Enter your period details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="start-date" className="text-right text-femme-burgundy">
                Period Start Date
              </label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !newStartDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newStartDate ? format(newStartDate, "PPP") : <span>{t("language.select")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newStartDate}
                      onSelect={setNewStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="end-date" className="text-right text-femme-burgundy">
                Period End Date
              </label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !newEndDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newEndDate ? format(newEndDate, "PPP") : <span>{t("language.select")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newEndDate}
                      onSelect={setNewEndDate}
                      disabled={(date) =>
                        newStartDate ? date < newStartDate : date < new Date()
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="notes" className="text-right text-femme-burgundy">
                {t("profile.updateSuccess").split(" ")[0]}
              </label>
              <Textarea
                id="notes"
                className="col-span-3"
                placeholder="Any notes about this period"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPeriodDialog(false)}>
              {t("auth.cancel")}
            </Button>
            <Button type="submit" onClick={addNewPeriod}>
              {t("profile.save").split(" ")[0]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mood Dialog */}
      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDayForMood 
                ? `${t("period.mood")} ${format(selectedDayForMood.date, "MMMM d, yyyy")}?`
                : t("period.mood")}
            </DialogTitle>
            <DialogDescription>
              {t("language.select")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoodDialog(false)}>{t("auth.login")}</Button>
            <Button onClick={saveMoodForDay}>{t("profile.save").split(" ")[0]}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Symptom Tracking Dialog */}
      <SymptomTrackingDialog
        open={showSymptomDialog}
        onOpenChange={setShowSymptomDialog}
        selectedDay={selectedDayForSymptoms}
        onSave={saveSymptoms}
      />
    </div>
  );
}
