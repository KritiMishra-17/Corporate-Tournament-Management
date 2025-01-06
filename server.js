const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const router = express.Router();
const methodOverride = require('method-override')
const path = require('path');
const auth = require('./middleware/auth');
const Event = require('./models/Event');
const Ad = require('./models/Ad');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateCodename= require('./utils/codenameGenerator');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(methodOverride('_method'))

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Public Routes
app.get('/', (req, res) => {
    res.render('home', { content: res.locals.body });
});

// Auth Routes
app.get('/admin/login', (req, res) => {
    res.render('admin/login', { content: res.locals.body });
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let admin = await Admin.findOne({ email });
        if (!admin) {
            admin = new Admin({ email, password });
            await admin.save();
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.redirect('/admin/login');
        }
        const token = jwt.sign({ id: admin.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/login');
    }
});

app.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
});

// Admin Routes
app.get('/admin/dashboard', auth, async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        const ads = await Ad.find().sort({ views: -1 });
        res.render('admin/dashboard', { events, ads, content: res.locals.body });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.get('/admin/events/:id/teams', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.render('admin/teams', { 
            event,
            content: res.locals.body 
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server Error');
    }
});

// registration endpoint
app.post('/events/:id/register', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check if max teams limit reached
        if (event.teams.length >= event.maxTeams) {
            return res.status(400).json({ 
                success: false, 
                message: 'Maximum team limit reached' 
            });
        }

        const { teamName, members } = req.body;
        
        // Generate team code
        const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Create structured member data
        const structuredMembers = members.map(email => ({
            realName: email.split('@')[0], // Basic name extraction
            email: email,
            codeName: generateCodename() // Note: capital 'N' to match schema
        }));
        
        const team = {
            teamName: teamName, // Changed from name to teamName
            teamCode: teamCode,
            members: structuredMembers
        };
        
        event.teams.push(team);
        await event.save();
        
        // Return codenames mapping
        const codenames = structuredMembers.map(member => ({
            email: member.email,
            codename: member.codeName
        }));
        
        res.json({ 
            success: true, 
            codenames: codenames.map(c => `${c.email}: ${c.codename}`)
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Event Routes
app.post('/admin/events', auth, async (req, res) => {
    try {
        const { name, date, maxTeams, description } = req.body;
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const event = new Event({
            name,
            date,
            maxTeams,
            description,
            code
        });
        await event.save();
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.put('/admin/events/:id', auth, async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/admin/events/:id', auth, async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Ad Routes
app.get('/admin/ads', auth, async (req, res) => {
    try {
        const ads = await Ad.find().sort({ views: -1 });
        res.render('admin/ads', { 
            ads,
            content: res.locals.body 
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.post('/admin/ads', auth, async (req, res) => {
    try {
        const { name, imageUrl } = req.body;
        const ad = new Ad({ name, imageUrl });
        await ad.save();
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.put('/admin/ads/:id/track', auth, async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id);
        ad.views += 1;
        await ad.save();
        res.json(ad);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/admin/ads/:id', auth, async (req, res) => {
    try {
        await Ad.findByIdAndDelete(req.params.id);
        res.json({ message: 'Ad removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/dashboard', async (req, res) => {
    try {
        const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 });
        const ads = await Ad.find().sort({ views: -1 }).limit(2); // Show 2 random ads
        res.render('publicDashboard', { events, ads });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.post('/events/:id/register', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const { teamName, members } = req.body;
        
        // Generate unique codenames for team members
        const codenames = members.map(() => generateCodename());
        
        const team = {
            name: teamName,
            members: members.map((member, index) => ({
                email: member,
                codename: codenames[index]
            }))
        };
        
        event.teams.push(team);
        await event.save();
        
        res.json({ success: true, codenames });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));