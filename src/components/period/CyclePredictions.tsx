
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format, addDays } from "date-fns";
import { Calendar, CalendarCheck } from "lucide-react";

interface CyclePredictionsProps {
  periodCycles: {
    startDate: Date;
    endDate?: Date;
    days: any[];
  }[];
}

const CyclePredictions: React.FC<CyclePredictionsProps> = ({ periodCycles }) => {
  // Calculate average cycle length
  const calculateAvgCycleLength = (): number => {
    if (periodCycles.length < 2) return 28; // Default to 28 if not enough data
    
    let totalDays = 0;
    let cycleCount = 0;
    
    for (let i = 1; i < periodCycles.length; i++) {
      const days = Math.floor((periodCycles[i].startDate.getTime() - periodCycles[i-1].startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0 && days < 60) { // Ignore outliers
        totalDays += days;
        cycleCount++;
      }
    }
    
    return cycleCount > 0 ? Math.round(totalDays / cycleCount) : 28;
  };

  // Calculate average period duration
  const calculateAvgPeriodDuration = (): number => {
    let totalDuration = 0;
    let periodCount = 0;
    
    for (const cycle of periodCycles) {
      if (cycle.endDate) {
        const duration = Math.floor((cycle.endDate.getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (duration > 0 && duration < 15) { // Ignore outliers
          totalDuration += duration;
          periodCount++;
        }
      }
    }
    
    return periodCount > 0 ? Math.round(totalDuration / periodCount) : 5;
  };

  // Predict next period
  const predictNextPeriod = (): { startDate: Date; endDate: Date; fertile: { start: Date; end: Date } } => {
    const avgCycleLength = calculateAvgCycleLength();
    const avgDuration = calculateAvgPeriodDuration();
    
    let baseDate = new Date();
    if (periodCycles.length > 0) {
      baseDate = new Date(periodCycles[periodCycles.length - 1].startDate);
    }
    
    const nextPeriodStart = addDays(baseDate, avgCycleLength);
    const nextPeriodEnd = addDays(nextPeriodStart, avgDuration - 1);
    
    // Fertile window is typically 12-16 days before next period
    const fertileStart = addDays(nextPeriodStart, -16);
    const fertileEnd = addDays(nextPeriodStart, -12);
    
    return {
      startDate: nextPeriodStart,
      endDate: nextPeriodEnd,
      fertile: {
        start: fertileStart,
        end: fertileEnd
      }
    };
  };

  const predictions = predictNextPeriod();

  return (
    <Card className="shadow-lg border-femme-taupe border-opacity-50">
      <CardHeader>
        <CardTitle className="text-femme-burgundy text-xl">Cycle Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-femme-burgundy mb-2">Next Period</h3>
            <div className="flex items-center gap-2 text-femme-burgundy/70">
              <Calendar className="h-5 w-5 text-femme-pink" />
              <span>Expected: {format(predictions.startDate, "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-femme-burgundy/70">
              <Calendar className="h-5 w-5 text-femme-pink" />
              <span>Estimated Duration: {calculateAvgPeriodDuration()} days</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-femme-burgundy mb-2">Fertile Window</h3>
            <div className="flex items-center gap-2 text-femme-burgundy/70">
              <CalendarCheck className="h-5 w-5 text-green-500" />
              <span>{format(predictions.fertile.start, "MMMM d")} - {format(predictions.fertile.end, "MMMM d, yyyy")}</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-femme-burgundy mb-2">Cycle Stats</h3>
            <div className="flex items-center gap-2 text-femme-burgundy/70">
              <Calendar className="h-5 w-5 text-femme-burgundy" />
              <span>Average Cycle Length: {calculateAvgCycleLength()} days</span>
            </div>
          </div>
          
          {periodCycles.length < 2 && (
            <div className="text-sm text-femme-pink/80 italic mt-2">
              Track more periods for more accurate predictions
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CyclePredictions;
