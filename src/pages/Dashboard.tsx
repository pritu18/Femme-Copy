import { useState } from "react";
import { format, addDays, subDays, isWithinInterval, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Smile } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { toast } from "@/hooks/use-toast";

interface PeriodDay {
  date: Date;
  notes?: string;
  flow?: "light" | "medium" | "heavy";
  mood?: {
    emotion: "happy" | "neutral" | "sad" | "angry" | "anxious" | "tired";
    intensity: 1 | 2 | 3 | 4 | 5;
    symptoms?: string[];
    notes?: string;
  };
}

interface PeriodCycle {
  startDate: Date;
  endDate?: Date;
  notes?: string;
  days: PeriodDay[];
}

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [periodCycles, setPeriodCycles] = useState<PeriodCycle[]>([]);
  const [selectedDay, setSelectedDay] = useState<PeriodDay | null>(null);
  const [notes, setNotes] = useState("");
  const [flow, setFlow] = useState<"light" | "medium" | "heavy">("medium");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEndDate, setIsEndDate] = useState(false);
  const [activeCycle, setActiveCycle] = useState<PeriodCycle | null>(null);
  
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<"happy" | "neutral" | "sad" | "angry" | "anxious" | "tired">("neutral");
  const [emotionIntensity, setEmotionIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [moodNotes, setMoodNotes] = useState("");

  const getAllPeriodDays = (): PeriodDay[] => {
    return periodCycles.flatMap(cycle => cycle.days);
  };

  const isPeriodDay = (day: Date | undefined) => {
    if (!day) return false;
    
    return periodCycles.some(cycle => {
      if (cycle.endDate) {
        return isWithinInterval(day, { start: cycle.startDate, end: cycle.endDate });
      }
      return isSameDay(day, cycle.startDate);
    });
  };

  const getPeriodDay = (day: Date): PeriodDay | undefined => {
    return getAllPeriodDays().find(periodDay => 
      periodDay.date.toDateString() === day.toDateString()
    );
  };

  const getCurrentCycle = (): PeriodCycle | null => {
    const cyclesWithoutEnd = periodCycles.filter(cycle => !cycle.endDate);
    if (cyclesWithoutEnd.length > 0) {
      return cyclesWithoutEnd[cyclesWithoutEnd.length - 1];
    }
    
    if (periodCycles.length > 0) {
      return periodCycles[periodCycles.length - 1];
    }
    
    return null;
  };

  const handleAddPeriodDay = () => {
    if (!date) return;
    
    const dateString = date.toDateString();
    
    const existingDayIndex = getAllPeriodDays().findIndex(
      day => day.date.toDateString() === dateString
    );
    
    const dayData: PeriodDay = { 
      date: new Date(date), 
      notes, 
      flow 
    };
    
    const currentCycle = getCurrentCycle();
    
    if (isEndDate && currentCycle && !currentCycle.endDate) {
      const updatedCycles = [...periodCycles];
      const currentCycleIndex = updatedCycles.indexOf(currentCycle);
      
      updatedCycles[currentCycleIndex] = {
        ...currentCycle,
        endDate: new Date(date)
      };
      
      setPeriodCycles(updatedCycles);
      toast({
        title: "Period end date saved",
        description: `End date for current cycle set to ${format(date, "MMMM d, yyyy")}.`,
      });
    } else if (existingDayIndex >= 0) {
      const allDays = getAllPeriodDays();
      const updatedDay = {
        ...allDays[existingDayIndex],
        notes,
        flow
      };
      
      for (let i = 0; i < periodCycles.length; i++) {
        const dayIndex = periodCycles[i].days.findIndex(
          day => day.date.toDateString() === dateString
        );
        
        if (dayIndex >= 0) {
          const updatedCycles = [...periodCycles];
          updatedCycles[i].days[dayIndex] = updatedDay;
          setPeriodCycles(updatedCycles);
          break;
        }
      }
      
      toast({
        title: "Period data updated",
        description: `Data for ${format(date, "MMMM d, yyyy")} has been updated.`,
      });
    } else {
      if (currentCycle && !currentCycle.endDate) {
        const updatedCycles = [...periodCycles];
        const currentCycleIndex = updatedCycles.indexOf(currentCycle);
        
        updatedCycles[currentCycleIndex] = {
          ...currentCycle,
          days: [...currentCycle.days, dayData]
        };
        
        setPeriodCycles(updatedCycles);
      } else {
        setPeriodCycles([
          ...periodCycles, 
          { 
            startDate: new Date(date), 
            days: [dayData] 
          }
        ]);
      }
      
      toast({
        title: "Period data saved",
        description: `Data for ${format(date, "MMMM d, yyyy")} has been saved.`,
      });
    }
    
    setNotes("");
    setFlow("medium");
    setIsEndDate(false);
    setIsDialogOpen(false);
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    
    setDate(day);
    const periodDay = getPeriodDay(day);
    
    if (periodDay) {
      setSelectedDay(periodDay);
      setNotes(periodDay.notes || "");
      setFlow(periodDay.flow || "medium");
    } else {
      setSelectedDay(null);
      setNotes("");
      setFlow("medium");
    }
    
    const currentCycle = getCurrentCycle();
    if (currentCycle && !currentCycle.endDate && 
        day.getTime() > currentCycle.startDate.getTime()) {
      setIsEndDate(true);
    } else {
      setIsEndDate(false);
    }
    
    setIsDialogOpen(true);
  };

  const handleQuickLog = (daysOffset: number) => {
    if (!date) return;
    
    const targetDate = daysOffset === 0 ? new Date() : 
                     daysOffset > 0 ? addDays(new Date(), daysOffset) : 
                     subDays(new Date(), Math.abs(daysOffset));
    
    const currentCycle = getCurrentCycle();
    const dayData: PeriodDay = { 
      date: new Date(targetDate), 
      flow 
    };
    
    if (currentCycle && !currentCycle.endDate) {
      const updatedCycles = [...periodCycles];
      const currentCycleIndex = updatedCycles.indexOf(currentCycle);
      
      const existingDayIndex = currentCycle.days.findIndex(
        day => day.date.toDateString() === targetDate.toDateString()
      );
      
      if (existingDayIndex >= 0) {
        updatedCycles[currentCycleIndex].days[existingDayIndex] = {
          ...updatedCycles[currentCycleIndex].days[existingDayIndex],
          flow
        };
      } else {
        updatedCycles[currentCycleIndex] = {
          ...currentCycle,
          days: [...currentCycle.days, dayData]
        };
      }
      
      setPeriodCycles(updatedCycles);
    } else {
      setPeriodCycles([
        ...periodCycles, 
        { 
          startDate: new Date(targetDate), 
          days: [dayData] 
        }
      ]);
    }
    
    toast({
      title: "Period day logged",
      description: `Quick logged ${format(targetDate, "MMMM d, yyyy")} with ${flow} flow.`,
    });
  };

  const handleMoodLog = () => {
    if (!date) return;
    
    const dateString = date.toDateString();
    const existingDayIndex = getAllPeriodDays().findIndex(
      day => day.date.toDateString() === dateString
    );
    
    const mood = {
      emotion: selectedEmotion,
      intensity: emotionIntensity,
      symptoms: selectedSymptoms,
      notes: moodNotes
    };
    
    if (existingDayIndex >= 0) {
      const allDays = getAllPeriodDays();
      const updatedDay = {
        ...allDays[existingDayIndex],
        mood
      };
      
      for (let i = 0; i < periodCycles.length; i++) {
        const dayIndex = periodCycles[i].days.findIndex(
          day => day.date.toDateString() === dateString
        );
        
        if (dayIndex >= 0) {
          const updatedCycles = [...periodCycles];
          updatedCycles[i].days[dayIndex] = updatedDay;
          setPeriodCycles(updatedCycles);
          break;
        }
      }
      
      toast({
        title: "Mood logged",
        description: `Mood data for ${format(date, "MMMM d, yyyy")} has been updated.`,
      });
    } else {
      const dayData: PeriodDay = { 
        date: new Date(date), 
        flow,
        mood 
      };
      
      const currentCycle = getCurrentCycle();
      
      if (currentCycle && !currentCycle.endDate) {
        const updatedCycles = [...periodCycles];
        const currentCycleIndex = updatedCycles.indexOf(currentCycle);
        
        updatedCycles[currentCycleIndex] = {
          ...currentCycle,
          days: [...currentCycle.days, dayData]
        };
        
        setPeriodCycles(updatedCycles);
      } else {
        setPeriodCycles([
          ...periodCycles, 
          { 
            startDate: new Date(date), 
            days: [dayData] 
          }
        ]);
      }
      
      toast({
        title: "Mood logged",
        description: `Mood data for ${format(date, "MMMM d, yyyy")} has been saved.`,
      });
    }
    
    setMoodDialogOpen(false);
    resetMoodForm();
  };

  const resetMoodForm = () => {
    setSelectedEmotion("neutral");
    setEmotionIntensity(3);
    setSelectedSymptoms([]);
    setMoodNotes("");
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const commonSymptoms = [
    "Cramps", "Bloating", "Headache", "Backache", "Breast tenderness", 
    "Nausea", "Fatigue", "Insomnia", "Food cravings", "Mood swings"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-femme-beige to-femme-pink-light">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Logo className="h-10" />
          <div className="flex items-center gap-4">
            <span className="text-femme-burgundy font-medium">Welcome, Jane</span>
            <Button variant="outline" className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy">Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-1 lg:col-span-2 shadow-lg border-femme-taupe border-opacity-50">
            <CardHeader>
              <CardTitle className="text-femme-burgundy text-2xl">Track Your Cycle</CardTitle>
              <CardDescription className="text-femme-burgundy/70">
                Log your period days and moods by selecting dates on the calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-start items-start md:items-center gap-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDaySelect}
                className="p-3 pointer-events-auto rounded-md bg-white shadow-md w-full max-w-[275px]"
                modifiers={{
                  periodDay: periodCycles.flatMap(cycle => {
                    if (cycle.endDate) {
                      const dates = [];
                      let currentDate = new Date(cycle.startDate);
                      while (currentDate <= cycle.endDate) {
                        dates.push(new Date(currentDate));
                        currentDate = addDays(currentDate, 1);
                      }
                      return dates;
                    }
                    return cycle.days.map(d => d.date);
                  })
                }}
                modifiersStyles={{
                  periodDay: {
                    backgroundColor: "#EFA8A8",
                    color: "#7D1F27",
                    fontWeight: "bold"
                  }
                }}
                components={{
                  DayContent: (props) => {
                    const day = props.date;
                    const isPeriod = isPeriodDay(day);
                    const periodDay = getPeriodDay(day);
                    
                    return (
                      <div className={`relative h-full w-full flex items-center justify-center ${isPeriod ? 'text-femme-burgundy' : ''}`}>
                        {props.date.getDate()}
                        {isPeriod && (
                          <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-femme-burgundy"></div>
                        )}
                        {periodDay?.mood && (
                          <div className="absolute -top-1 right-0 h-2 w-2 rounded-full bg-femme-pink"></div>
                        )}
                      </div>
                    );
                  }
                }}
              />
              
              <div className="bg-white p-4 rounded-md shadow-md w-full max-w-[275px]">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-femme-burgundy text-lg font-medium mb-3">Quick Log</h3>
                    <p className="text-femme-burgundy/70 text-sm mb-4">Log your period days for the current cycle quickly:</p>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light"
                        onClick={() => handleQuickLog(-1)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Yesterday
                      </Button>
                      
                      <Button 
                        className="bg-femme-pink hover:bg-femme-burgundy text-white"
                        onClick={() => handleQuickLog(0)}
                      >
                        Today
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light"
                        onClick={() => handleQuickLog(1)}
                      >
                        Tomorrow
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Custom
                      </Button>
                      
                      <Button 
                        className="bg-femme-pink hover:bg-femme-burgundy text-white"
                        onClick={() => {
                          resetMoodForm();
                          setMoodDialogOpen(true);
                        }}
                      >
                        <Smile className="h-4 w-4 mr-2" />
                        Log Mood
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-femme-taupe/20">
                    <h3 className="text-femme-burgundy text-lg font-medium mb-3">Mood Log</h3>
                    <p className="text-femme-burgundy/70 text-sm mb-4">Track how you're feeling and symptoms:</p>
                    
                    <Button 
                      className="w-full bg-femme-pink hover:bg-femme-burgundy text-white"
                      onClick={() => {
                        resetMoodForm();
                        setMoodDialogOpen(true);
                      }}
                    >
                      <Smile className="h-4 w-4 mr-2" />
                      Log Your Mood
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-femme-burgundy/70 text-sm mb-2">Flow intensity for quick logging:</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant={flow === "light" ? "default" : "outline"}
                        className={flow === "light" ? "bg-femme-pink text-femme-burgundy hover:bg-femme-pink/90" : "border-femme-pink text-femme-burgundy hover:bg-femme-pink-light"}
                        onClick={() => setFlow("light")}
                      >
                        Light
                      </Button>
                      <Button 
                        size="sm"
                        variant={flow === "medium" ? "default" : "outline"}
                        className={flow === "medium" ? "bg-femme-pink text-femme-burgundy hover:bg-femme-pink/90" : "border-femme-pink text-femme-burgundy hover:bg-femme-pink-light"}
                        onClick={() => setFlow("medium")}
                      >
                        Medium
                      </Button>
                      <Button 
                        size="sm"
                        variant={flow === "heavy" ? "default" : "outline"}
                        className={flow === "heavy" ? "bg-femme-pink text-femme-burgundy hover:bg-femme-pink/90" : "border-femme-pink text-femme-burgundy hover:bg-femme-pink-light"}
                        onClick={() => setFlow("heavy")}
                      >
                        Heavy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-femme-pink hover:bg-femme-burgundy text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Period Day
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white border-femme-taupe">
                  <DialogHeader>
                    <DialogTitle className="text-femme-burgundy">
                      {selectedDay 
                        ? "Update Period Data" 
                        : isEndDate 
                          ? "Set Period End Date" 
                          : "Add Period Day"
                      }
                    </DialogTitle>
                    <DialogDescription className="text-femme-burgundy/70">
                      {date && format(date, "MMMM d, yyyy")}
                      {isEndDate && " (End date for current cycle)"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-femme-burgundy">Flow</h4>
                      <div className="flex gap-4">
                        <Button 
                          variant={flow === "light" ? "default" : "outline"}
                          className={flow === "light" ? "bg-femme-pink text-femme-burgundy hover:bg-femme-pink/90" : "border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy"}
                          onClick={() => setFlow("light")}
                        >
                          Light
                        </Button>
                        <Button 
                          variant={flow === "medium" ? "default" : "outline"}
                          className={flow === "medium" ? "bg-femme-pink text-femme-burgundy hover:bg-femme-pink/90" : "border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy"}
                          onClick={() => setFlow("medium")}
                        >
                          Medium
                        </Button>
                        <Button 
                          variant={flow === "heavy" ? "default" : "outline"}
                          className={flow === "heavy" ? "bg-femme-pink text-femme-burgundy hover:bg-femme-pink/90" : "border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy"}
                          onClick={() => setFlow("heavy")}
                        >
                          Heavy
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-femme-burgundy">Notes</h4>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How do you feel today? Any symptoms?"
                        className="min-h-[100px] border-femme-taupe/50 focus:border-femme-pink focus:ring-femme-pink"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      className="bg-femme-pink hover:bg-femme-burgundy text-white"
                      onClick={handleAddPeriodDay}
                    >
                      {isEndDate ? "Set End Date" : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={moodDialogOpen} onOpenChange={setMoodDialogOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white border-femme-taupe">
                  <DialogHeader>
                    <DialogTitle className="text-femme-burgundy">
                      How are you feeling?
                    </DialogTitle>
                    <DialogDescription className="text-femme-burgundy/70">
                      {date && format(date, "MMMM d, yyyy")}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-femme-burgundy">Emotion</h4>
                      <RadioGroup 
                        className="grid grid-cols-3 gap-3" 
                        value={selectedEmotion}
                        onValueChange={(value) => setSelectedEmotion(value as any)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Label 
                            htmlFor="happy" 
                            className={`text-center p-3 rounded-md cursor-pointer flex flex-col items-center ${selectedEmotion === 'happy' ? 'bg-femme-pink/20' : 'hover:bg-femme-pink/10'}`}
                          >
                            <span role="img" aria-label="happy" className="text-2xl">😊</span>
                            <span className="mt-1 text-sm">Happy</span>
                            <RadioGroupItem value="happy" id="happy" className="sr-only" />
                          </Label>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <Label 
                            htmlFor="neutral" 
                            className={`text-center p-3 rounded-md cursor-pointer flex flex-col items-center ${selectedEmotion === 'neutral' ? 'bg-femme-pink/20' : 'hover:bg-femme-pink/10'}`}
                          >
                            <span role="img" aria-label="neutral" className="text-2xl">😐</span>
                            <span className="mt-1 text-sm">Neutral</span>
                            <RadioGroupItem value="neutral" id="neutral" className="sr-only" />
                          </Label>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <Label 
                            htmlFor="sad" 
                            className={`text-center p-3 rounded-md cursor-pointer flex flex-col items-center ${selectedEmotion === 'sad' ? 'bg-femme-pink/20' : 'hover:bg-femme-pink/10'}`}
                          >
                            <span role="img" aria-label="sad" className="text-2xl">😔</span>
                            <span className="mt-1 text-sm">Sad</span>
                            <RadioGroupItem value="sad" id="sad" className="sr-only" />
                          </Label>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <Label 
                            htmlFor="angry" 
                            className={`text-center p-3 rounded-md cursor-pointer flex flex-col items-center ${selectedEmotion === 'angry' ? 'bg-femme-pink/20' : 'hover:bg-femme-pink/10'}`}
                          >
                            <span role="img" aria-label="angry" className="text-2xl">😠</span>
                            <span className="mt-1 text-sm">Angry</span>
                            <RadioGroupItem value="angry" id="angry" className="sr-only" />
                          </Label>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <Label 
                            htmlFor="anxious" 
                            className={`text-center p-3 rounded-md cursor-pointer flex flex-col items-center ${selectedEmotion === 'anxious' ? 'bg-femme-pink/20' : 'hover:bg-femme-pink/10'}`}
                          >
                            <span role="img" aria-label="anxious" className="text-2xl">😰</span>
                            <span className="mt-1 text-sm">Anxious</span>
                            <RadioGroupItem value="anxious" id="anxious" className="sr-only" />
                          </Label>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <Label 
                            htmlFor="tired" 
                            className={`text-center p-3 rounded-md cursor-pointer flex flex-col items-center ${selectedEmotion === 'tired' ? 'bg-femme-pink/20' : 'hover:bg-femme-pink/10'}`}
                          >
                            <span role="img" aria-label="tired" className="text-2xl">😴</span>
                            <span className="mt-1 text-sm">Tired</span>
                            <RadioGroupItem value="tired" id="tired" className="sr-only" />
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-femme-burgundy">Intensity (1-5)</h4>
                      <div className="flex justify-between">
                        <span className="text-xs text-femme-burgundy/70">Mild</span>
                        <span className="text-xs text-femme-burgundy/70">Strong</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <Button
                            key={level}
                            type="button"
                            size="sm"
                            className={`h-10 w-10 ${
                              emotionIntensity === level
                                ? "bg-femme-pink text-femme-burgundy"
                                : "bg-white border border-femme-pink/30 text-femme-burgundy/70 hover:bg-femme-pink/10"
                            }`}
                            onClick={() => setEmotionIntensity(level as 1 | 2 | 3 | 4 | 5)}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-femme-burgundy">Symptoms</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {commonSymptoms.map((symptom) => (
                          <Button
                            key={symptom}
                            type="button"
                            variant="outline"
                            className={`justify-start h-auto py-2 px-3 ${
                              selectedSymptoms.includes(symptom)
                                ? "bg-femme-pink/20 border-femme-pink"
                                : "border-femme-pink/30 hover:bg-femme-pink/10"
                            }`}
                            onClick={() => toggleSymptom(symptom)}
                          >
                            {symptom}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-femme-burgundy">Notes</h4>
                      <Textarea
                        value={moodNotes}
                        onChange={(e) => setMoodNotes(e.target.value)}
                        placeholder="How are you feeling today? Any specific triggers?"
                        className="min-h-[80px] border-femme-taupe/50 focus:border-femme-pink focus:ring-femme-pink"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      className="bg-femme-pink hover:bg-femme-burgundy text-white"
                      onClick={handleMoodLog}
                    >
                      Save Mood
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <div className="col-span-1">
            <Card className="shadow-lg border-femme-taupe border-opacity-50 mb-8">
              <CardHeader>
                <CardTitle className="text-femme-burgundy text-xl">Current Cycle</CardTitle>
              </CardHeader>
              <CardContent>
                {getCurrentCycle() ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-femme-burgundy/70">
                      <CalendarIcon className="h-5 w-5 text-femme-pink" />
                      <span>Started: {format(getCurrentCycle()!.startDate, "MMMM d, yyyy")}</span>
                    </div>
                    {getCurrentCycle()?.endDate && (
                      <div className="flex items-center gap-2 text-femme-burgundy/70">
                        <CalendarIcon className="h-5 w-5 text-femme-pink" />
                        <span>Ended: {format(getCurrentCycle()!.endDate!, "MMMM d, yyyy")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-femme-burgundy/70">
                      <CalendarIcon className="h-5 w-5 text-femme-pink" />
                      <span>Days: {getCurrentCycle()?.endDate 
                        ? Math.floor((getCurrentCycle()!.endDate!.getTime() - getCurrentCycle()!.startDate.getTime()) / (1000 * 60 *
                      60 * 24)) + 1
                        : getCurrentCycle()?.days.length || 1}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-femme-burgundy/70 text-center py-4">
                    No active cycle. Start tracking your period by selecting dates on the calendar.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-femme-taupe border-opacity-50">
              <CardHeader>
                <CardTitle className="text-femme-burgundy text-xl">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {getAllPeriodDays().length > 0 ? (
                  <div className="space-y-4">
                    {getAllPeriodDays().slice(-3).reverse().map((day, index) => (
                      <div key={index} className="border-b border-femme-taupe/30 pb-3 last:border-0">
                        <div className="font-medium text-femme-burgundy">{format(day.date, "MMMM d, yyyy")}</div>
                        <div className="text" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-femme-burgundy/70 text-center py-4">
                    No recent entries.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
