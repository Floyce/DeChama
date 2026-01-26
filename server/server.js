const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// --- MOCK DATABASE ---
const DB_FILE = path.join(__dirname, 'db.json');

// Initial DB State
let db = {
    users: [], // { id, email, phone, password, name, chamas: [] }
    chamas: [] // { id, name, description, type, members: [], contributions: [] }
};

// Load DB
if (fs.existsSync(DB_FILE)) {
    try {
        const data = fs.readFileSync(DB_FILE);
        db = JSON.parse(data);
    } catch (err) {
        console.error("Error reading DB:", err);
    }
} else {
    // Seed with some data if empty
    db.chamas.push({
        id: '1',
        name: 'Chama Alpha',
        description: 'The first genesis chama.',
        expectedMembers: 10,
        amount: '0.01 BTC',
        balance: '1.45 BTC',
        nextPayout: '12 Days',
        members: [] // User IDs
    });
    saveDB();
}

function saveDB() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// --- ROUTES ---

// 1. Auth: Register
app.post('/api/auth/register', (req, res) => {
    const { email, phone, password, displayName } = req.body;

    // Check if exists
    const existing = db.users.find(u => u.email === email || u.phone === phone);
    if (existing) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
        id: 'user_' + Date.now(),
        email,
        phone,
        password, // In real app, hash this!
        displayName,
        chamas: []
    };

    db.users.push(newUser);
    saveDB();

    res.json({ success: true, user: { id: newUser.id, displayName: newUser.displayName, email: newUser.email, phone: newUser.phone } });
});

// 2. Auth: Login
app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    // Identifier can be email or phone
    const user = db.users.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ success: true, user: { id: user.id, displayName: user.displayName, email: user.email, phone: user.phone, chamas: user.chamas } });
});

// 3. User Chamas
app.get('/api/user/chamas', (req, res) => {
    const userId = req.headers['user-id']; // In real app, use JWT
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch full chama details for IDs in user.chamas
    // ALSO include chamas where "name" matches (legacy support for myChamas array of strings in frontend)
    // Actually, let's just return what matches.

    // For MVP transparency, if user.chamas is list of IDs, we resolve them.
    // If it's names, we match names.
    const userChamas = db.chamas.filter(c => user.chamas.includes(c.id) || user.chamas.includes(c.name));

    res.json(userChamas);
});

// 4. Create Chama
app.post('/api/chamas/create', (req, res) => {
    const { name, description, type, contributionAmount, frequency, userId } = req.body;

    // Check unique name
    if (db.chamas.find(c => c.name === name)) {
        return res.status(400).json({ error: 'Chama name already taken' });
    }

    const newChama = {
        id: 'chama_' + Date.now(),
        name,
        description,
        type,
        amount: contributionAmount,
        frequency,
        balance: '0.00 BTC',
        members: [userId],
        nextPayout: '30 Days',
        memberCount: 1
    };

    db.chamas.push(newChama);

    // Add to user
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.chamas.push(newChama.id); // Store ID
    }

    saveDB();
    res.json({ success: true, chama: newChama });
});

// 5. Validate Email
app.post('/api/validate-email', (req, res) => {
    const { email } = req.body;
    // Mock Validation
    // Regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ valid: false, reason: 'Invalid format' });
    }

    // Mock MX check (random delay)
    setTimeout(() => {
        if (email.endsWith('@invalid.com')) {
            res.json({ valid: false, reason: 'Domain not found' });
        } else {
            res.json({ valid: true });
        }
    }, 500);
});

// 6. Invite Member
app.post('/api/chamas/invite', (req, res) => {
    const { chamaId, email } = req.body;
    // Mock sending invite
    console.log(`Sending invite to ${email} for Chama ${chamaId}`);
    res.json({ success: true, message: 'Invite sent' });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
