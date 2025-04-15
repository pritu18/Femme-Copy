import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar as CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { toast } from "@/hooks/use-toast";

interface PeriodDay {
  date: Date;
  notes?: string;
  flow?: "light" | "medium" | "heavy";
}

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [periodDays, setPeriodDays] = useState<PeriodDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<PeriodDay | null>(null);
  const [notes, setNotes] = useState("");
  const [flow, setFlow] = useState<"light" | "medium" | "heavy">("medium");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isPeriodDay = (day: Date | undefined) => {
    if (!day) return false;
    return periodDays.some(periodDay => 
      periodDay.date.toDateString() === day.toDateString()
    );
  };

  const getPeriodDay = (day: Date): PeriodDay | undefined => {
    return periodDays.find(periodDay => 
      periodDay.date.toDateString() === day.toDateString()
    );
  };

  const handleAddPeriodDay = () => {
    if (!date) return;
    
    const existingDayIndex = periodDays.findIndex(
      day => day.date.toDateString() === date.toDateString()
    );
    
    if (existingDayIndex >= 0) {
      const updatedDays = [...periodDays];
      updatedDays[existingDayIndex] = {
        ...updatedDays[existingDayIndex],
        notes,
        flow
      };
      setPeriodDays(updatedDays);
    } else {
      setPeriodDays([...periodDays, { date: date, notes, flow }]);
    }
    
    toast({
      title: "Period data saved",
      description: `Data for ${format(date, "MMMM d, yyyy")} has been saved.`,
    });
    
    setNotes("");
    setFlow("medium");
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
    
    setIsDialogOpen(true);
  };

  const handleQuickLog = (daysOffset: number) => {
    if (!date) return;
    
    const targetDate = daysOffset === 0 ? new Date() : 
                     daysOffset > 0 ? addDays(new Date(), daysOffset) : 
                     subDays(new Date(), Math.abs(daysOffset));
    
    const existingDayIndex = periodDays.findIndex(
      day => day.date.toDateString() === targetDate.toDateString()
    );
    
    if (existingDayIndex >= 0) {
      const updatedDays = [...periodDays];
      updatedDays[existingDayIndex] = {
        ...updatedDays[existingDayIndex],
        flow
      };
      setPeriodDays(updatedDays);
    } else {
      setPeriodDays([...periodDays, { date: targetDate, flow }]);
    }
    
    toast({
      title: "Period day logged",
      description: `Quick logged ${format(targetDate, "MMMM d, yyyy")} with ${flow} flow.`,
    });
  };

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
                Log your period days by selecting dates on the calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-start items-start md:items-center gap-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDaySelect}
                className="p-3 pointer-events-auto rounded-md bg-white shadow-md w-full max-w-[275px]"
                modifiers={{
                  periodDay: periodDays.map(d => d.date)
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
              
              <div className="bg-white p-4 rounded-md shadow-md w-full max-w-[275px]">
                <h3 className="text-femme-burgundy text-lg font-medium mb-3">Quick Log</h3>
                <p className="text-femme-burgundy/70 text-sm mb-4">Log your period days for the current cycle quickly:</p>
                
                <div className="grid grid-cols-2 gap-2">
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
                  
                  <Button 
                    variant="outline" 
                    className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Custom
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
                      {selectedDay ? "Update Period Data" : "Add Period Day"}
                    </DialogTitle>
                    <DialogDescription className="text-femme-burgundy/70">
                      {date && format(date, "MMMM d, yyyy")}
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
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <div className="col-span-1">
            <Card className="shadow-lg border-femme-taupe border-opacity-50 mb-8">
              <CardHeader>
                <CardTitle className="text-femme-burgundy text-xl">Next Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-femme-burgundy/70">
                  <CalendarIcon className="h-5 w-5 text-femme-pink" />
                  <span>Estimated in 14 days</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-femme-taupe border-opacity-50">
              <CardHeader>
                <CardTitle className="text-femme-burgundy text-xl">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {periodDays.length > 0 ? (
                  <div className="space-y-4">
                    {periodDays.slice(-3).reverse().map((day, index) => (
                      <div key={index} className="border-b border-femme-taupe/30 pb-3 last:border-0">
                        <div className="font-medium text-femme-burgundy">{format(day.date, "MMMM d, yyyy")}</div>
                        <div className="text-sm text-femme-burgundy/70">
                          Flow: <span className="capitalize">{day.flow}</span>
                        </div>
                        {day.notes && (
                          <div className="text-sm mt-1 line-clamp-2 text-femme-burgundy/80">{day.notes}</div>
                        )}
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
