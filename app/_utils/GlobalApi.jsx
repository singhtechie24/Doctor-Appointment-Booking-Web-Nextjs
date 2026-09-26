const { default: axios } = require("axios")


const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || 'http://localhost:1337';

// Public client for fetching doctors and categories (public endpoints that don't need a token)
const publicClient = axios.create({
    baseURL: `${BASE_URL}/api`
})

// Only the relations doctor cards/details need — never the appointments relation
const DOCTOR_POPULATE = 'populate[0]=image&populate[1]=categories';

const getCategory = () => publicClient.get('/categories?populate=*');

const getDoctorList = () => publicClient.get('/doctors?' + DOCTOR_POPULATE);

const getDoctorByCategory = (category) => publicClient.get('/doctors?filters[categories][Name][$in]=' + encodeURIComponent(category) + '&' + DOCTOR_POPULATE);

const getDoctorById = (id) => publicClient.get('/doctors/' + id + '?' + DOCTOR_POPULATE);

// Appointment operations go through our authenticated Next.js API routes
const bookAppointment = (data) => axios.post('/api/appointments', data);

const sendEmail = (data) => axios.post('/api/sendEmail', data);

const getUserBookingList = () => axios.get('/api/appointments');

const deleteBooking = (id) => axios.delete('/api/appointments/' + id);

const getBookedSlots = (doctorId, dateString) => axios.get('/api/booked-slots', { params: { doctorId, date: dateString } });
  
  export default{
    getCategory,
    getDoctorList,
    getDoctorByCategory,
    getDoctorById, 
    bookAppointment,
    sendEmail,
    getUserBookingList,
    deleteBooking,
    getBookedSlots
  }