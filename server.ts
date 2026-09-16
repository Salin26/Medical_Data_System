import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;
const db = new Database('medicare.db');

// Initialize Database Schema
db.exec(`
    CREATE TABLE IF NOT EXISTS Branch (
        BranchID INTEGER PRIMARY KEY,
        BranchName TEXT,
        City TEXT
    );

    CREATE TABLE IF NOT EXISTS Patient (
        PatientID INTEGER PRIMARY KEY,
        PatientName TEXT,
        Phone TEXT,
        Address TEXT,
        DOB TEXT
    );

    CREATE TABLE IF NOT EXISTS Doctor (
        DoctorID INTEGER PRIMARY KEY,
        DoctorName TEXT,
        Specialization TEXT,
        BranchID INTEGER,
        FOREIGN KEY (BranchID) REFERENCES Branch(BranchID)
    );

    CREATE TABLE IF NOT EXISTS Appointment (
        AppointmentID INTEGER PRIMARY KEY,
        PatientID INTEGER,
        DoctorID INTEGER,
        AppointmentDate TEXT,
        Status TEXT,
        FOREIGN KEY (PatientID) REFERENCES Patient(PatientID),
        FOREIGN KEY (DoctorID) REFERENCES Doctor(DoctorID)
    );

    CREATE TABLE IF NOT EXISTS Billing (
        BillID INTEGER PRIMARY KEY,
        AppointmentID INTEGER,
        Amount DECIMAL(10,2),
        PaymentMethod TEXT,
        FOREIGN KEY (AppointmentID) REFERENCES Appointment(AppointmentID)
    );

    CREATE TABLE IF NOT EXISTS Medicine (
        MedicineID INTEGER PRIMARY KEY,
        MedicineName TEXT,
        Price DECIMAL(10,2),
        StockQty INTEGER
    );

    CREATE TABLE IF NOT EXISTS Prescription (
        PrescriptionID INTEGER PRIMARY KEY,
        AppointmentID INTEGER,
        MedicineID INTEGER,
        Quantity INTEGER,
        FOREIGN KEY (AppointmentID) REFERENCES Appointment(AppointmentID),
        FOREIGN KEY (MedicineID) REFERENCES Medicine(MedicineID)
    );
`);

// Insert Sample Data if empty
const branchCount = db.prepare('SELECT count(*) as count FROM Branch').get() as any;
if (branchCount.count === 0) {
    db.exec(`
        INSERT INTO Branch VALUES
        (1, 'Dhaka Central', 'Dhaka'),
        (2, 'Chattogram Care', 'Chattogram'),
        (3, 'Sylhet Medical', 'Sylhet'),
        (4, 'Rajshahi Health', 'Rajshahi'),
        (5, 'Khulna Plus', 'Khulna');

        INSERT INTO Patient VALUES
        (101, 'Rahim Uddin', '01711111111', 'Dhaka', '2000-01-15'),
        (102, 'Karim Hasan', '01822222222', 'Gazipur', '1999-03-12'),
        (103, 'Sadia Akter', '01933333333', 'Sylhet', '2001-07-21'),
        (104, 'Nusrat Jahan', '01644444444', 'Khulna', '2002-11-11'),
        (105, 'Tanvir Islam', '01555555555', 'Rajshahi', '1998-09-05');

        INSERT INTO Doctor VALUES
        (201, 'Dr. Hasan', 'Cardiology', 1),
        (202, 'Dr. Nabila', 'Neurology', 2),
        (203, 'Dr. Sami', 'Orthopedics', 3),
        (204, 'Dr. Farhan', 'Medicine', 4),
        (205, 'Dr. Tania', 'Dermatology', 5);

        INSERT INTO Appointment VALUES
        (301, 101, 201, '2026-05-01', 'Completed'),
        (302, 102, 202, '2026-05-02', 'Pending'),
        (303, 103, 203, '2026-05-03', 'Completed'),
        (304, 104, 204, '2026-05-04', 'Cancelled'),
        (305, 105, 205, '2026-05-05', 'Completed');

        INSERT INTO Billing VALUES
        (401, 301, 5000, 'Cash'),
        (402, 302, 3000, 'Card'),
        (403, 303, 4500, 'Cash'),
        (404, 304, 2000, 'Mobile Banking'),
        (405, 305, 3500, 'Cash');

        INSERT INTO Medicine VALUES
        (501, 'Napa', 2.50, 500),
        (502, 'Seclo', 8.00, 300),
        (503, 'Ace', 3.00, 450),
        (504, 'Monas', 12.00, 150),
        (505, 'Antacid', 5.00, 250);

        INSERT INTO Prescription VALUES
        (601, 301, 501, 10),
        (602, 302, 502, 5),
        (603, 303, 503, 7),
        (604, 304, 504, 3),
        (605, 305, 505, 4);
    `);
}

app.use(express.json());

// API Routes
app.get('/api/patients', (req, res) => {
    const patients = db.prepare('SELECT * FROM Patient').all();
    res.json(patients);
});

app.get('/api/doctors', (req, res) => {
    const doctors = db.prepare('SELECT d.*, b.BranchName FROM Doctor d JOIN Branch b ON d.BranchID = b.BranchID').all();
    res.json(doctors);
});

app.get('/api/appointments', (req, res) => {
    const appointments = db.prepare(`
        SELECT a.*, p.PatientName, d.DoctorName, d.Specialization 
        FROM Appointment a 
        JOIN Patient p ON a.PatientID = p.PatientID 
        JOIN Doctor d ON a.DoctorID = d.DoctorID
    `).all();
    res.json(appointments);
});

app.get('/api/billing', (req, res) => {
    const billing = db.prepare(`
        SELECT b.*, a.AppointmentDate, p.PatientName 
        FROM Billing b 
        JOIN Appointment a ON b.AppointmentID = a.AppointmentID 
        JOIN Patient p ON a.PatientID = p.PatientID
    `).all();
    res.json(billing);
});

app.get('/api/medicines', (req, res) => {
    const medicines = db.prepare('SELECT * FROM Medicine').all();
    res.json(medicines);
});

// Analytics / Complex Queries
app.get('/api/stats/revenue', (req, res) => {
    const revenue = db.prepare('SELECT SUM(Amount) as TotalRevenue FROM Billing').get();
    res.json(revenue);
});

app.get('/api/stats/doctor-appointments', (req, res) => {
    const stats = db.prepare(`
        SELECT d.DoctorName, COUNT(a.AppointmentID) as TotalAppointments 
        FROM Doctor d 
        LEFT JOIN Appointment a ON d.DoctorID = a.DoctorID 
        GROUP BY d.DoctorID
    `).all();
    res.json(stats);
});

// Transaction Demonstration Endpoint
app.post('/api/transactions/test', (req, res) => {
    const transaction = db.transaction(() => {
        // Update Medicine Stock
        db.prepare('UPDATE Medicine SET StockQty = StockQty - 5 WHERE MedicineID = 501').run();
        
        // Add new Billing record (This might fail if ID exists, testing rollback)
        // For demonstration, let's just do a series of ops
        const info = db.prepare('INSERT INTO Billing (BillID, AppointmentID, Amount, PaymentMethod) VALUES (?, ?, ?, ?)').run(406, 302, 2500, 'Cash');
        
        return info;
    });

    try {
        const result = transaction();
        res.json({ success: true, result });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Admin/Custom Query Runner (For Playground)
app.post('/api/query', (req, res) => {
    const { query } = req.body;
    try {
        const result = db.prepare(query).all();
        res.json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
});

async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
