
import { useState } from "react";
import { format } from "date-fns";
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
  const [periodCycles, setPeriodCycles] = useState<PeriodCycle[]>([]);

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
        <div className="grid grid-cols-1 gap-8">
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
                  No entries yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

