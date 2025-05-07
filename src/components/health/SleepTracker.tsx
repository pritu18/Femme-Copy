
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, addDays, subDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface SleepData {
  date: string; // ISO date string
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  notes?: string;
}

const SleepTracker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [hours, setHours] = useState<number>(8);
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  // Load sleep data from localStorage
  useEffect(() => {
    const savedSleepData = localStorage.getItem('sleepData');
    if (savedSleepData) {
      setSleepData(JSON.parse(savedSleepData));
    }
  }, []);

  // Save sleep data to localStorage when it changes
  useEffect(() => {
    if (sleepData.length > 0) {
      localStorage.setItem('sleepData', JSON.stringify(sleepData));
    }
  }, [sleepData]);

  // Get sleep data for selected date
  const getDataForDate = (date: Date): SleepData | undefined => {
    const dateString = date.toISOString().split('T')[0];
    return sleepData.find(data => data.date === dateString);
  };

  // Update UI when selected date changes
  useEffect(() => {
    const data = getDataForDate(selectedDate);
    if (data) {
      setHours(data.hours);
      setQuality(data.quality);
      setNotes(data.notes || "");
    } else {
      setHours(8);
      setQuality(3);
      setNotes("");
    }
  }, [selectedDate]);

  const handleSave = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const existingDataIndex = sleepData.findIndex(data => data.date === dateString);
    
    const newData: SleepData = {
      date: dateString,
      hours,
      quality,
      notes: notes || undefined
    };

    if (existingDataIndex >= 0) {
      const updatedData = [...sleepData];
      updatedData[existingDataIndex] = newData;
      setSleepData(updatedData);
    } else {
      setSleepData([...sleepData, newData]);
    }

    toast({
      title: "Sleep data saved",
      description: `Recorded ${hours} hours of sleep for ${format(selectedDate, "MMM d, yyyy")}`,
    });
  };

  const changeDate = (days: number) => {
    if (days > 0) {
      setSelectedDate(addDays(selectedDate, days));
    } else {
      setSelectedDate(subDays(selectedDate, Math.abs(days)));
    }
  };

  const handleHoursChange = (amount: number) => {
    const newHours = Math.min(Math.max(hours + amount, 0), 24);
    setHours(newHours);
  };

  return (
    <Card className="shadow-lg border-femme-taupe border-opacity-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-femme-burgundy flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-400" />
            Sleep Tracker
          </div>
          <div className="text-sm font-normal">
            {format(selectedDate, "MMM d, yyyy")}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => changeDate(-1)} 
              className="text-femme-burgundy/70"
            >
              Previous Day
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-femme-burgundy"
            >
              Today
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => changeDate(1)}
              className="text-femme-burgundy/70"
              disabled={selectedDate >= new Date()}
            >
              Next Day
            </Button>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHoursChange(-0.5)}
                className="rounded-full p-0 h-8 w-8 text-femme-burgundy"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div>
                <span className="text-3xl font-bold text-indigo-700">{hours}</span>
                <span className="text-xl text-indigo-600"> hours</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHoursChange(0.5)}
                className="rounded-full p-0 h-8 w-8 text-femme-burgundy"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-3 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuality(star as 1 | 2 | 3 | 4 | 5)}
                  className={`p-1 ${
                    quality >= star 
                      ? "text-yellow-500 hover:text-yellow-400" 
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              ))}
            </div>
            <div className="mt-1 text-sm text-indigo-600">
              Sleep Quality: {["Poor", "Fair", "Good", "Very Good", "Excellent"][quality - 1]}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className="text-femme-burgundy"
            >
              {showNotes ? "Hide Notes" : "Add Notes"}
            </Button>
            <Button onClick={handleSave}>Save Sleep Data</Button>
          </div>

          {showNotes && (
            <Input
              placeholder="Enter notes about your sleep..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          )}

          <div className="pt-2">
            <h4 className="text-sm font-medium text-femme-burgundy mb-2">Sleep Tips:</h4>
            <ul className="text-xs text-femme-burgundy/70 list-disc pl-4 space-y-1">
              <li>Aim for 7-9 hours of sleep each night</li>
              <li>Keep a consistent sleep schedule, even on weekends</li>
              <li>Create a restful environment by keeping your bedroom dark and cool</li>
              <li>Avoid caffeine and heavy meals before bedtime</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepTracker;
