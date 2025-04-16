
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Phone, User } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  distance: string;
  availableDates: Date[];
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "OB/GYN",
    location: "Women's Health Clinic, 123 Main St",
    distance: "0.8 miles",
    availableDates: [
      new Date(new Date().setDate(new Date().getDate() + 1)),
      new Date(new Date().setDate(new Date().getDate() + 2)),
      new Date(new Date().setDate(new Date().getDate() + 3)),
    ],
  },
  {
    id: "2",
    name: "Dr. Emily Chen",
    specialty: "Gynecologist",
    location: "City Medical Center, 456 Oak Ave",
    distance: "1.2 miles",
    availableDates: [
      new Date(new Date().setDate(new Date().getDate() + 2)),
      new Date(new Date().setDate(new Date().getDate() + 4)),
    ],
  },
  {
    id: "3",
    name: "Dr. Michael Rodriguez",
    specialty: "OB/GYN",
    location: "Family Care Clinic, 789 Elm St",
    distance: "1.5 miles",
    availableDates: [
      new Date(new Date().setDate(new Date().getDate() + 1)),
      new Date(new Date().setDate(new Date().getDate() + 5)),
    ],
  },
];

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

const DoctorConsultation: React.FC = () => {
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(undefined);
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleScheduleAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentDate(undefined);
    setAppointmentTime("");
    setReason("");
    setShowAppointmentDialog(true);
  };

  const handleConfirmAppointment = () => {
    if (!appointmentDate || !appointmentTime || !reason || !name || !phone) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields to schedule your appointment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Appointment scheduled",
      description: `Your appointment with ${selectedDoctor?.name} on ${format(appointmentDate, "MMMM d, yyyy")} at ${appointmentTime} has been scheduled.`,
    });
    setShowAppointmentDialog(false);
  };

  return (
    <Card className="shadow-lg border-femme-taupe border-opacity-50">
      <CardHeader>
        <CardTitle className="text-femme-burgundy text-xl">Find a Gynecologist Near You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="border border-femme-taupe/30 rounded-lg p-4 hover:bg-femme-pink-light/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-femme-burgundy">{doctor.name}</h3>
                  <p className="text-sm text-femme-burgundy/70">{doctor.specialty}</p>
                  <div className="flex items-center gap-1 mt-1 text-sm text-femme-burgundy/70">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="text-sm text-femme-burgundy/70">
                    <span className="font-medium">{doctor.distance}</span> away
                  </div>
                </div>
                <Button
                  onClick={() => handleScheduleAppointment(doctor)}
                  size="sm"
                  className="bg-femme-pink hover:bg-femme-pink/90"
                >
                  Schedule
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              {selectedDoctor && `Book an appointment with ${selectedDoctor.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid gap-2">
              <Label>Appointment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !appointmentDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {appointmentDate ? format(appointmentDate, "MMMM d, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={appointmentDate}
                    onSelect={setAppointmentDate}
                    disabled={(date) => {
                      // Disable dates that are in the past or not available for the selected doctor
                      return (
                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        !selectedDoctor?.availableDates.some(
                          (availableDate) => format(availableDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                        )
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Time Slot</Label>
              <Select onValueChange={setAppointmentTime} value={appointmentTime}>
                <SelectTrigger id="time" className="w-full">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a brief description of your reason for the appointment"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAppointment}>Confirm Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DoctorConsultation;
