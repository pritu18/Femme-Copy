
import { useState } from "react";
import { format, differenceInDays, isSameDay, isWithinInterval } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, CalendarDays, UserRound } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import MoodSelector, { MoodType, getMoodIcon, getMoodLabel } from "@/components/period/MoodSelector";
import DoctorConsultation from "@/components/doctor/DoctorConsultation";

interface PeriodDay {
  date: Date;
  notes?: string;
  mood?: MoodType;
}

interface PeriodCycle {
  startDate: Date;
  endDate?: Date;
  notes?: string;
  days: PeriodDay[];
}

export default function Dashboard() {
  const [periodCycles, setPeriodCycles] = useState<PeriodCycle[]>([]);
  const [newStartDate, setNewStartDate] = useState<Date | undefined>(undefined);
  const [newEndDate, setNewEndDate] = useState<Date | undefined>(undefined);
  const [newNotes, setNewNotes] = useState("");
  const [showAddPeriodDialog, setShowAddPeriodDialog] = useState(false);
  const [selectedDayForMood, setSelectedDayForMood] = useState<PeriodDay | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType>(undefined);
  const [showMoodDialog, setShowMoodDialog] = useState(false);

  const getAllPeriodDays = (): PeriodDay[] => {
    return periodCycles.flatMap(cycle => cycle.days);
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

  const addNewPeriod = () => {
    if (!newStartDate) {
      toast({
        title: "Error",
        description: "Please select a start date for your period",
        variant: "destructive",
      });
      return;
    }

    const days: PeriodDay[] = [];
    
    if (newEndDate) {
      const dayCount = differenceInDays(newEndDate, newStartDate) + 1;
      for (let i = 0; i < dayCount; i++) {
        const currentDate = new Date(newStartDate);
        currentDate.setDate(newStartDate.getDate() + i);
        days.push({ date: currentDate });
      }
    } else {
      days.push({ date: newStartDate });
    }

    const newCycle: PeriodCycle = {
      startDate: newStartDate,
      endDate: newEndDate,
      notes: newNotes || undefined,
      days,
    };

    setPeriodCycles([...periodCycles, newCycle]);
    toast({
      title: "Period added",
      description: "Your period has been successfully tracked",
    });

    setNewStartDate(undefined);
    setNewEndDate(undefined);
    setNewNotes("");
    setShowAddPeriodDialog(false);
  };

  const isPeriodDay = (date: Date) => {
    return periodCycles.some(cycle => {
      if (cycle.endDate) {
        return isWithinInterval(date, { start: cycle.startDate, end: cycle.endDate });
      }
      return isSameDay(date, cycle.startDate);
    });
  };

  const getDayFromDate = (date: Date): PeriodDay | undefined => {
    for (const cycle of periodCycles) {
      const foundDay = cycle.days.find(day => isSameDay(day.date, date));
      if (foundDay) return foundDay;
    }
    return undefined;
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

  const saveMoodForDay = () => {
    if (!selectedDayForMood) return;

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
      description: `You're feeling ${getMoodLabel(selectedMood)} on ${format(selectedDayForMood.date, "MMMM d, yyyy")}`,
    });
    setShowMoodDialog(false);
  };

  const getMoodForDay = (date: Date): MoodType => {
    const day = getDayFromDate(date);
    return day?.mood;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-femme-beige to-femme-pink-light">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Logo className="h-10" />
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy">
              <Link to="/profile">
                <UserRound className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button variant="outline" className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy">Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="shadow-lg border-femme-taupe border-opacity-50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-femme-burgundy text-xl">Period Calendar</CardTitle>
                <Dialog open={showAddPeriodDialog} onOpenChange={setShowAddPeriodDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-femme-pink hover:bg-femme-pink/90">
                      <Plus className="h-4 w-4 mr-1" /> Add Period
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Track New Period</DialogTitle>
                      <DialogDescription>
                        Add the details of your period to track your cycle.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${!newStartDate && "text-muted-foreground"}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newStartDate ? format(newStartDate, "PPP") : <span>Select start date</span>}
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
                      
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date (Optional)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${!newEndDate && "text-muted-foreground"}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newEndDate ? format(newEndDate, "PPP") : <span>Select end date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newEndDate}
                              onSelect={setNewEndDate}
                              disabled={date => !newStartDate || date < newStartDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={newNotes}
                          onChange={(e) => setNewNotes(e.target.value)}
                          placeholder="Add any notes about this period..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddPeriodDialog(false)}>Cancel</Button>
                      <Button onClick={addNewPeriod}>Save Period</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  className="pointer-events-auto"
                  modifiers={{
                    highlighted: (date) => isPeriodDay(date),
                  }}
                  modifiersClassNames={{
                    highlighted: "bg-femme-pink text-white",
                  }}
                  onDayClick={handleDayClick}
                  components={{
                    DayContent: (props) => {
                      const date = props.date;
                      const mood = getMoodForDay(date);
                      
                      return (
                        <div className="flex flex-col items-center justify-center">
                          <div>{props.date.getDate()}</div>
                          {mood && (
                            <div className="mt-1">
                              {getMoodIcon(mood, 14)}
                            </div>
                          )}
                        </div>
                      );
                    },
                  }}
                />
                <div className="mt-4 text-sm text-center text-femme-burgundy/70">
                  Click on highlighted days to log your mood
                </div>
                
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full border-femme-pink text-femme-burgundy hover:bg-femme-pink-light"
                    onClick={() => {
                      const today = new Date();
                      const day = getDayFromDate(today);
                      if (day) {
                        setSelectedDayForMood(day);
                        setSelectedMood(day.mood);
                        setShowMoodDialog(true);
                      } else {
                        toast({
                          title: "No period active",
                          description: "You don't have an active period for today",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Log Today's Mood
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
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
                    No active cycle.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-femme-taupe border-opacity-50 mb-8">
              <CardHeader>
                <CardTitle className="text-femme-burgundy text-xl">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {getAllPeriodDays().length > 0 ? (
                  <div className="space-y-4">
                    {getAllPeriodDays().slice(-3).reverse().map((day, index) => (
                      <div key={index} className="border-b border-femme-taupe/30 pb-3 last:border-0">
                        <div className="font-medium text-femme-burgundy flex items-center gap-2">
                          {format(day.date, "MMMM d, yyyy")}
                          {day.mood && (
                            <span className="ml-2 flex items-center text-sm">
                              {getMoodIcon(day.mood)}
                              <span className="ml-1">{getMoodLabel(day.mood)}</span>
                            </span>
                          )}
                        </div>
                        {day.notes && <div className="text-sm text-femme-burgundy/70 mt-1">{day.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-femme-burgundy/70 text-center py-4">
                    No entries yet.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <DoctorConsultation />
          </div>
        </div>
      </main>

      {/* Mood Dialog */}
      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDayForMood 
                ? `How do you feel on ${format(selectedDayForMood.date, "MMMM d, yyyy")}?` 
                : "Log Your Mood"}
            </DialogTitle>
            <DialogDescription>
              Select the mood that best describes how you're feeling today.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <MoodSelector selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
            
            <div className="mt-4">
              <Label htmlFor="mood-notes">Notes (Optional)</Label>
              <Textarea 
                id="mood-notes"
                placeholder="Add notes about how you're feeling..."
                value={selectedDayForMood?.notes || ""}
                onChange={(e) => {
                  if (selectedDayForMood) {
                    setSelectedDayForMood({
                      ...selectedDayForMood,
                      notes: e.target.value
                    });
                  }
                }}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoodDialog(false)}>Cancel</Button>
            <Button onClick={saveMoodForDay}>Save Mood</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

function Label({ htmlFor, className, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-femme-burgundy ${className}`}
      {...props}
    />
  );
}
