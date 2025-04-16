
import { useState } from "react";
import { format, addDays, subDays, isWithinInterval, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { toast } from "@/hooks/use-toast";

interface PeriodDay {
  date: Date;
  notes?: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEndDate, setIsEndDate] = useState(false);
  const [activeCycle, setActiveCycle] = useState<PeriodCycle | null>(null);

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
      notes
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
        notes
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
    } else {
      setSelectedDay(null);
      setNotes("");
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
          {/* Calendar Card - Now on the left */}
          <Card className="col-span-1 shadow-lg border-femme-taupe border-opacity-50">
            <CardHeader>
              <CardTitle className="text-femme-burgundy text-2xl">Track Your Cycle</CardTitle>
              <CardDescription className="text-femme-burgundy/70">
                Log your period days by selecting dates on the calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center items-center gap-6">
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
                    
                    return (
                      <div className={`relative h-full w-full flex items-center justify-center ${isPeriod ? 'text-femme-burgundy' : ''}`}>
                        {props.date.getDate()}
                        {isPeriod && (
                          <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-femme-burgundy"></div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-femme-pink hover:bg-femme-burgundy text-white">
                    Add Period Day
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
            </CardFooter>
          </Card>

          {/* Cycle Info and Recent Entries - Now on the right side (2-column span) */}
          <div className="col-span-1 lg:col-span-2">
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
                        ? Math.floor((getCurrentCycle()!.endDate!.getTime() - getCurrentCycle()!.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
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
                        {day.notes && <div className="text-sm text-femme-burgundy/70 mt-1">{day.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-femme-burgundy/70 text-center py-4">
                    No entries yet. Start tracking your period by selecting dates on the calendar.
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
