import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Droplets, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface WaterIntakeData {
  id?: string;
  user_id?: string;
  date: string;
  amount_ml: number;
  created_at?: string;
  updated_at?: string;
}

interface WaterIntakeTrackerProps {
  initialIntake?: number;
  onUpdate?: (intake: number) => void;
}

const WaterIntakeTracker: React.FC<WaterIntakeTrackerProps> = ({ 
  initialIntake = 0,
  onUpdate 
}) => {
  const [waterIntake, setWaterIntake] = useState(initialIntake);
  const [goal, setGoal] = useState(2000); // Default goal: 2000ml (2L)
  const [percentage, setPercentage] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  // Fetch water intake data from Supabase
  const { 
    data: waterData, 
    loading: waterLoading,
    insertData: insertWaterIntake,
    updateData: updateWaterIntake
  } = useSupabaseData<WaterIntakeData>(
    {
      table: "water_intake",
      column: "user_id",
      value: user?.id,
      orderBy: { column: "date", ascending: false }
    },
    [user?.id]
  );

  // Calculate percentage whenever waterIntake changes
  useEffect(() => {
    const newPercentage = Math.min(Math.round((waterIntake / goal) * 100), 100);
    setPercentage(newPercentage);
  }, [waterIntake, goal]);

  // Get today's water intake from Supabase data
  useEffect(() => {
    if (waterData && !waterLoading) {
      const todayEntry = waterData.find(entry => entry.date.split('T')[0] === today);
      
      if (todayEntry) {
        setWaterIntake(todayEntry.amount_ml);
      } else {
        // Load from localStorage as backup if no Supabase data
        const savedIntake = localStorage.getItem(`waterIntake_${today}`);
        if (savedIntake) {
          setWaterIntake(parseInt(savedIntake, 10));
        } else {
          setWaterIntake(0);
        }
      }
      
      const savedGoal = localStorage.getItem('waterIntakeGoal');
      if (savedGoal) {
        setGoal(parseInt(savedGoal, 10));
      }
    }
  }, [waterData, waterLoading, today]);

  // Save water intake whenever it changes (to localStorage as backup)
  useEffect(() => {
    localStorage.setItem(`waterIntake_${today}`, waterIntake.toString());
    if (onUpdate) onUpdate(waterIntake);
  }, [waterIntake, today, onUpdate]);
  
  // Save goal whenever it changes
  useEffect(() => {
    localStorage.setItem('waterIntakeGoal', goal.toString());
  }, [goal]);

  // Find today's record to determine if we need to update or insert
  const getTodayRecord = (): WaterIntakeData | undefined => {
    if (!waterData) return undefined;
    return waterData.find(entry => entry.date.split('T')[0] === today);
  };

  const addWater = async (amount: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to track your water intake",
        variant: "destructive"
      });
      return;
    }

    const newTotal = Math.max(0, waterIntake + amount);
    setWaterIntake(newTotal);
    
    try {
      const todayRecord = getTodayRecord();
      
      const waterEntry: WaterIntakeData = {
        user_id: user.id,
        date: new Date().toISOString(),
        amount_ml: newTotal
      };
      
      if (todayRecord?.id) {
        // Update existing record
        await updateWaterIntake(todayRecord.id, waterEntry);
      } else {
        // Create new record
        await insertWaterIntake(waterEntry);
      }
      
      if (amount > 0) {
        toast({
          title: "Water intake tracked",
          description: `Added ${amount}ml of water. Keep it up! 💧`,
        });
      }
    } catch (error) {
      console.error("Error saving water intake data:", error);
      toast({
        title: "Error saving data",
        description: "There was a problem saving your water intake. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGoalChange = (value: number[]) => {
    setGoal(value[0]);
  };

  return (
    <Card className="shadow-lg border-femme-taupe border-opacity-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-femme-burgundy flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          Water Intake Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 bg-blue-50"></div>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-400 transition-all duration-500 rounded-b-full" 
                style={{ 
                  height: `${percentage}%`,
                  background: `linear-gradient(to top, #60a5fa, #93c5fd)`,
                  borderRadius: percentage === 100 ? '9999px' : '0 0 9999px 9999px'
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-femme-burgundy">
                    {waterIntake}ml
                  </div>
                  <div className="text-xs text-femme-burgundy/70">
                    of {goal}ml
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Progress value={percentage} className="h-2 bg-blue-100" />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-femme-burgundy/70">{0}ml</span>
            <span className="text-xs text-femme-burgundy/70">{goal}ml</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              onClick={() => addWater(200)}
              variant="outline" 
              className="flex flex-col h-auto py-2 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Droplets className="h-4 w-4 mb-1" />
              <span className="text-xs">200ml</span>
            </Button>
            <Button 
              onClick={() => addWater(350)}
              variant="outline" 
              className="flex flex-col h-auto py-2 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Droplets className="h-5 w-5 mb-1" />
              <span className="text-xs">350ml</span>
            </Button>
            <Button 
              onClick={() => addWater(500)}
              variant="outline" 
              className="flex flex-col h-auto py-2 border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              <Droplets className="h-6 w-6 mb-1" />
              <span className="text-xs">500ml</span>
            </Button>
          </div>

          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => addWater(-100)}
              className="rounded-full p-0 h-8 w-8 text-femme-burgundy/70 hover:text-femme-burgundy hover:bg-femme-pink-light/20"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 mx-2">
              <Slider
                defaultValue={[goal]}
                min={500}
                max={4000}
                step={100}
                onValueChange={handleGoalChange}
                className="h-4"
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => addWater(100)}
              className="rounded-full p-0 h-8 w-8 text-femme-burgundy/70 hover:text-femme-burgundy hover:bg-femme-pink-light/20"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center text-sm text-femme-burgundy/70">
            Daily Goal: {goal}ml
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterIntakeTracker;
