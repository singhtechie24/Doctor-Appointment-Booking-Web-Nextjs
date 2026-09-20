import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, Clock, Loader2 } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { DialogClose } from '@radix-ui/react-dialog'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import GlobalApi from '@/app/_utils/GlobalApi'
import { toast } from 'sonner'
import moment from 'moment'

function BookAppointment({doctor}) {
    const [date, setDate] = useState(new Date());
    const [timeSlot, setTimeSlot] = useState([]);
    const [selectedTimeSLot, setSelectedTimeslot] = useState();
    const [note, setNote] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const {user} = useKindeBrowserClient();

    useEffect(()=>{
        getTime();
    },[])

    useEffect(() => {
        if (date && doctor?.id) {
            checkBookedSlots();
        }
    }, [date, doctor])

    const getTime = () => {
        const timeList = [];
        for (let i = 10; i <= 12; i++) {
            timeList.push({ time: i + ':00 AM' })
            timeList.push({ time: i + ':30 AM' })
        }

        for (let i = 1; i <= 6; i++) {
            timeList.push({ time: i + ':00 PM' })
            timeList.push({ time: i + ':30 PM' })
        }

        setTimeSlot(timeList)
    }

    // Fetch slots that are already booked for this doctor on the selected date
    const checkBookedSlots = () => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        GlobalApi.getBookedSlots(doctor.id, formattedDate).then(resp => {
            const bookings = resp.data.data || [];
            const occupied = bookings.map(b => b.attributes?.Time);
            setBookedSlots(occupied);
            // If user's selected slot is already booked, reset selection
            if (occupied.includes(selectedTimeSLot)) {
                setSelectedTimeslot(null);
            }
        }).catch(err => {
            console.error('Error fetching booked slots:', err);
        });
    }

    // Check if a time slot has already passed for today
    const isSlotPast = (slotTime) => {
        const isToday = moment(date).isSame(moment(), 'day');
        if (!isToday) return false;
        
        const slotMoment = moment(`${moment(date).format('YYYY-MM-DD')} ${slotTime}`, 'YYYY-MM-DD hh:mm A');
        return slotMoment.isBefore(moment());
    }

    const isSlotUnavailable = (slotTime) => {
        return bookedSlots.includes(slotTime) || isSlotPast(slotTime);
    }

    const saveBooking = () => {
        if (isSubmitting || !date || !selectedTimeSLot) return;
        
        if (!user) {
            toast.error("Please login to book an appointment!");
            return;
        }

        setIsSubmitting(true);
        const formattedDate = moment(date).format('YYYY-MM-DD');

        const data = {
            data: {
               UserName: (user.given_name || '') + " " + (user.family_name || ''),
               Email: user.email,
               Time: selectedTimeSLot,
               Date: formattedDate,
               doctor: doctor.id,
               Note: note
            }
        }

        GlobalApi.bookAppointment(data).then(resp => {
            if (resp) {
                GlobalApi.sendEmail(data).catch(e => console.error("Email send failed:", e));
                toast.success("Appointment Booked! Confirmation sent to your email.");
                setIsOpen(false);
                setSelectedTimeslot(null);
                setNote('');
                checkBookedSlots();
            }
        }).catch(err => {
            toast.error("Booking failed. Slot may already be taken.");
        }).finally(() => {
            setIsSubmitting(false);
        });
    }

    const isPastDay = (day) => {
        return moment(day).isBefore(moment(), 'day');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="mt-3 rounded-full">Book Appointment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Book Appointment with {doctor?.attributes?.Name}</DialogTitle>
              <DialogDescription>
                Select your preferred date and available consultation time slot.
              </DialogDescription>
            </DialogHeader>

            <div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mt-3'>
                    {/* Calendar */}
                    <div className='flex flex-col gap-2 items-baseline'>
                        <h2 className='flex gap-2 items-center font-semibold text-gray-700 text-sm'>
                            <CalendarDays className='text-primary h-5 w-5'/>
                            Select Date 
                        </h2>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                                if (selectedDate) setDate(selectedDate);
                            }}
                            disabled={isPastDay}
                            className="rounded-md border p-2 w-full"
                        />
                    </div>

                    {/* Time Slots */}
                    <div>
                        <h2 className='flex gap-2 items-center mb-2 font-semibold text-gray-700 text-sm'>
                            <Clock className='text-primary h-5 w-5'/>
                            Select Time Slot
                        </h2>
                        <div className='grid grid-cols-3 gap-2 border rounded-lg p-3 max-h-[300px] overflow-y-auto'>
                            {timeSlot?.map((item, index) => {
                                const unavailable = isSlotUnavailable(item.time);
                                const isBooked = bookedSlots.includes(item.time);
                                const isSelected = item.time === selectedTimeSLot;

                                return (
                                    <button 
                                        type="button"
                                        key={index}
                                        disabled={unavailable}
                                        onClick={() => !unavailable && setSelectedTimeslot(item.time)} 
                                        className={`p-2 border text-xs font-medium rounded-full transition-all text-center
                                            ${unavailable 
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through' 
                                                : isSelected
                                                    ? 'bg-primary text-white border-primary shadow-sm'
                                                    : 'hover:bg-primary hover:text-white cursor-pointer'
                                            }`}
                                        title={isBooked ? "Slot Already Booked" : isSlotPast(item.time) ? "Time Has Passed" : "Available Slot"}
                                    >
                                        {item.time}
                                    </button>
                                );
                            })}
                        </div>
                        <div className='flex items-center gap-4 mt-3 text-xs text-gray-500'>
                            <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full bg-primary inline-block'></span> Selected</span>
                            <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full border border-gray-400 inline-block'></span> Available</span>
                            <span className='flex items-center gap-1'><span className='w-3 h-3 rounded-full bg-gray-200 inline-block'></span> Unavailable</span>
                        </div>
                    </div>
                </div>

                <Textarea 
                    className="mt-4" 
                    placeholder="Add any specific health concerns or notes here..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)} 
                />
            </div>

            <DialogFooter className="sm:justify-end gap-2 mt-4">
                <Button 
                    type="button" 
                    className="text-red-500 border-red-300 hover:bg-red-50" 
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                >
                  Close
                </Button>
                <Button 
                    type="button" 
                    disabled={!(date && selectedTimeSLot) || isSubmitting}
                    onClick={() => saveBooking()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm & Book'
                  )}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    )
}

export default BookAppointment