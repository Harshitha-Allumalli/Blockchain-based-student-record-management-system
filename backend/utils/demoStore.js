const mongoose = require('mongoose');

const isDemo = () => mongoose.connection.readyState !== 1;

const demoStore = {
    users: [
        {
            id: 'admin-1',
            name: 'System Admin',
            email: 'admin@blockedu.com',
            password: 'admin123',
            role: 'admin',
            isVerified: true
        },
        { 
            id: 'verifier-1', 
            email: 'verifier@blockedu.com', 
            password: 'verify123', 
            name: 'Verifier HR', 
            role: 'verifier', 
            isVerified: true 
        },
        { 
            id: 'verifier-2', 
            email: 'hr@company.com', 
            password: 'verify123', 
            name: 'HR Team', 
            role: 'verifier', 
            isVerified: true 
        },
        { id: 'S1001', email: 'aarav@student.com',  password: 'student123', name: 'Aarav Sharma', role: 'student', studentId: 'S1001', isVerified: true },
        { id: 'S1002', email: 'priya@student.com',  password: 'student123', name: 'Priya Nair',   role: 'student', studentId: 'S1002', isVerified: true },
        { id: 'S1003', email: 'rohan@student.com',  password: 'student123', name: 'Rohan Gupta',  role: 'student', studentId: 'S1003', isVerified: true },
        { id: 'S1004', email: 'sneha@student.com',  password: 'student123', name: 'Sneha Patel',  role: 'student', studentId: 'S1004', isVerified: true },
        { id: 'S1005', email: 'kiran@student.com',  password: 'student123', name: 'Kiran Mehta',  role: 'student', studentId: 'S1005', isVerified: true },
    ],
    otps: [],
    records: [],
    logs: []
};

module.exports = { isDemo, demoStore };
