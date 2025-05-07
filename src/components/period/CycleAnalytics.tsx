
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CycleAnalyticsProps {
  periodCycles: {
    startDate: Date;
    endDate?: Date;
    days: any[];
  }[];
}

const CycleAnalytics: React.FC<CycleAnalyticsProps> = ({ periodCycles }) => {
  // Prepare data for cycle length chart
  const prepareCycleLengthData = () => {
    if (periodCycles.length < 2) return [];
    
    return periodCycles.slice(1).map((cycle, index) => {
      const previousCycle = periodCycles[index];
      const cycleLength = Math.floor((cycle.startDate.getTime() - previousCycle.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        name: `Cycle ${index + 1}`,
        length: cycleLength,
      };
    });
  };

  // Prepare data for period duration chart
  const preparePeriodDurationData = () => {
    return periodCycles
      .filter(cycle => cycle.endDate)
      .map((cycle, index) => {
        const duration = Math.floor((cycle.endDate!.getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        return {
          name: `Period ${index + 1}`,
          duration: duration,
        };
      });
  };

  // Prepare data for symptoms frequency
  const prepareSymptomData = () => {
    const symptoms: Record<string, number> = {
      cramps: 0,
      headache: 0,
      bloating: 0,
      fatigue: 0,
      acne: 0,
      cravings: 0
    };
    
    let totalDays = 0;
    
    periodCycles.forEach(cycle => {
      cycle.days.forEach(day => {
        if (day.symptoms) {
          day.symptoms.forEach((symptom: string) => {
            if (symptoms.hasOwnProperty(symptom)) {
              symptoms[symptom]++;
            }
          });
        }
        totalDays++;
      });
    });
    
    return Object.entries(symptoms).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: value,
      percentage: totalDays > 0 ? Math.round((value / totalDays) * 100) : 0
    }));
  };

  const cycleLengthData = prepareCycleLengthData();
  const periodDurationData = preparePeriodDurationData();
  const symptomData = prepareSymptomData();

  return (
    <Card className="shadow-lg border-femme-taupe border-opacity-50">
      <CardHeader>
        <CardTitle className="text-femme-burgundy text-xl">Cycle Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cycle">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="cycle" className="flex-1">Cycle Length</TabsTrigger>
            <TabsTrigger value="duration" className="flex-1">Period Duration</TabsTrigger>
            <TabsTrigger value="symptoms" className="flex-1">Symptoms</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cycle">
            {cycleLengthData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleLengthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="length" fill="#D291BC" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-femme-burgundy/70">
                Track at least two periods to see cycle length data
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="duration">
            {periodDurationData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={periodDurationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="duration" fill="#9C4670" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-femme-burgundy/70">
                Complete at least one period to see duration data
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="symptoms">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#EEB5EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CycleAnalytics;
