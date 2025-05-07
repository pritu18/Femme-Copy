
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format, subDays, isSameDay } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WeightEntry {
  date: Date;
  weight: number;
  notes?: string;
}

const WeightTracker: React.FC = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [newNotes, setNewNotes] = useState("");
  const [timeRange, setTimeRange] = useState<"1W" | "1M" | "3M" | "6M" | "1Y">("1M");

  // Load saved weight entries from localStorage
  useEffect(() => {
    const savedWeightEntries = localStorage.getItem("weightEntries");
    if (savedWeightEntries) {
      const parsed = JSON.parse(savedWeightEntries);
      setWeightEntries(
        parsed.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }))
      );
    }
  }, []);

  // Save weight entries to localStorage when they change
  useEffect(() => {
    if (weightEntries.length > 0) {
      localStorage.setItem("weightEntries", JSON.stringify(weightEntries));
    }
  }, [weightEntries]);

  // Function to filter data based on the selected time range
  const getFilteredData = () => {
    const today = new Date();
    let daysToSubtract: number;
    
    switch (timeRange) {
      case "1W":
        daysToSubtract = 7;
        break;
      case "1M":
        daysToSubtract = 30;
        break;
      case "3M":
        daysToSubtract = 90;
        break;
      case "6M":
        daysToSubtract = 180;
        break;
      case "1Y":
        daysToSubtract = 365;
        break;
      default:
        daysToSubtract = 30;
    }
    
    const startDate = subDays(today, daysToSubtract);
    return weightEntries
      .filter(entry => entry.date >= startDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const filteredData = getFilteredData();
  
  // Prepare data for the chart
  const chartData = filteredData.map(entry => ({
    date: format(entry.date, "MMM d"),
    weight: entry.weight,
    fullDate: entry.date,
  }));

  // Calculate stats
  const calculateStats = () => {
    if (filteredData.length === 0) return { current: 0, change: 0, average: 0 };
    
    const sortedData = [...filteredData].sort((a, b) => b.date.getTime() - a.date.getTime());
    const current = sortedData[0].weight;
    const oldest = sortedData[sortedData.length - 1].weight;
    const change = Number((current - oldest).toFixed(1));
    const average = Number((sortedData.reduce((sum, entry) => sum + entry.weight, 0) / sortedData.length).toFixed(1));
    
    return { current, change, average };
  };

  const stats = calculateStats();

  const handleAddWeight = () => {
    const weightValue = parseFloat(newWeight);
    
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value.",
        variant: "destructive",
      });
      return;
    }

    // Check if there's already an entry for this date
    const existingEntryIndex = weightEntries.findIndex(entry => 
      isSameDay(entry.date, newDate)
    );

    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedEntries = [...weightEntries];
      updatedEntries[existingEntryIndex] = {
        date: newDate,
        weight: weightValue,
        notes: newNotes || undefined,
      };
      setWeightEntries(updatedEntries);
      toast({
        title: "Weight updated",
        description: `Updated weight for ${format(newDate, "MMMM d, yyyy")}`,
      });
    } else {
      // Add new entry
      setWeightEntries([
        ...weightEntries,
        {
          date: newDate,
          weight: weightValue,
          notes: newNotes || undefined,
        },
      ]);
      toast({
        title: "Weight added",
        description: `Added weight record for ${format(newDate, "MMMM d, yyyy")}`,
      });
    }

    // Reset form
    setShowAddDialog(false);
    setNewWeight("");
    setNewDate(new Date());
    setNewNotes("");
  };

  return (
    <Card className="shadow-lg border-femme-taupe border-opacity-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-femme-burgundy flex items-center gap-2">
            <Scale className="h-5 w-5 text-femme-burgundy" />
            Weight Tracker
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowAddDialog(true)}
            className="bg-femme-pink hover:bg-femme-pink/90"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Weight
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weightEntries.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-femme-pink-light/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-femme-burgundy/70">Current</div>
                  <div className="text-xl font-semibold text-femme-burgundy">{stats.current} kg</div>
                </div>
                <div className="bg-femme-pink-light/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-femme-burgundy/70">Change</div>
                  <div className={`text-xl font-semibold ${stats.change < 0 ? 'text-green-600' : stats.change > 0 ? 'text-red-500' : 'text-femme-burgundy'}`}>
                    {stats.change > 0 ? '+' : ''}{stats.change} kg
                  </div>
                </div>
                <div className="bg-femme-pink-light/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-femme-burgundy/70">Average</div>
                  <div className="text-xl font-semibold text-femme-burgundy">{stats.average} kg</div>
                </div>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#7D1F27' }}
                      tickMargin={8}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#7D1F27' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #D9B4A3',
                        borderRadius: '0.375rem'
                      }}
                      formatter={(value) => [`${value} kg`, 'Weight']}
                      labelFormatter={(label, entry) => {
                        const dataPoint = entry[0]?.payload;
                        if (dataPoint && dataPoint.fullDate) {
                          return format(new Date(dataPoint.fullDate), "MMMM d, yyyy");
                        }
                        return label;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#D291BC" 
                      strokeWidth={2}
                      dot={{ fill: '#7D1F27', r: 4 }}
                      activeDot={{ r: 6, fill: '#D291BC' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                {(['1W', '1M', '3M', '6M', '1Y'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className={timeRange === range 
                      ? "bg-femme-pink hover:bg-femme-pink/90"
                      : "text-femme-burgundy"
                    }
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-femme-burgundy/70 mb-4">No weight data recorded yet</p>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="bg-femme-pink hover:bg-femme-pink/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Weight Record
              </Button>
            </div>
          )}
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Weight</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="weight" className="text-right text-femme-burgundy">
                  Weight (kg)
                </label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="date" className="text-right text-femme-burgundy">
                  Date
                </label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newDate ? format(newDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newDate}
                        onSelect={(date) => date && setNewDate(date)}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="notes" className="text-right text-femme-burgundy">
                  Notes
                </label>
                <Input
                  id="notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWeight}>
                Save Weight
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default WeightTracker;
