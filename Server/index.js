const express = require('express');
const app = express();

const cors = require('cors');

const authRouter = express.Router();
const fs = require('fs');
const fsPromises = require('fs').promises;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = 3001
const corsOptions = {
    origin:  ["http://localhost:3000", "http://34.130.147.130"], // Allow only the React app to connect
    credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/auth', authRouter);

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const { ObjectId } = require('mongodb');
const imageBucketName = process.env.IMAGES_BUCKET_NAME;
// Chatroom Stuff
const http = require('http');
const socketIo = require('socket.io');
// Create an HTTP server from the Express app
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Allow only the React app to connect
        methods: ["GET", "POST"], // Allowed request methods
        credentials: true, // Allow cookies and authentication headers
    }
});

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('getChatrooms', async ({ role }) => { // Now expecting an object with the role
        try {
            let query = {};
            
            // Example filter: if the user's role is 'user', only fetch chatrooms that include 'user' in their allowedRoles
            
            query = { allowedRoles: role };
            
            
            const chatrooms = await chatroomsCollection.find(query).toArray();
            socket.emit('chatrooms', chatrooms);
        } catch (error) {
            console.error('Error fetching chatrooms:', error);
        }
    });

    socket.on('sendMessage', async (chatroomId, message) => {
        try {
            const id = new ObjectId(chatroomId);
            // Assign a server-side timestamp to ensure consistency
            const timestamp = new Date();
            const messageWithTimestamp = { ...message, timestamp };
    
            const result = await chatroomsCollection.updateOne(
                { _id: id },
                { $push: { messages: messageWithTimestamp } }
            );


            if (result.modifiedCount === 1) {
                io.to(chatroomId).emit('newMessage', message); // Emit the new message to all users in the chatroom
            } else {
                console.log("Message update failed for chatroom:", chatroomId);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('joinRoom', (chatroomId) => {
        const id = new ObjectId(chatroomId);
        socket.join(chatroomId);
        console.log(`User joined chatroom: ${chatroomId}`);
    });

    socket.on('leaveRoom', (chatroomId) => {
        const id = new ObjectId(chatroomId);
        socket.leave(id);
        console.log(`User left chatroom: ${chatroomId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection Error:', error);
    });

    socket.on('connect_timeout', (timeout) => {
        console.error('Connection Timeout:', timeout);
    });
});

run();
const uri = process.env.MONGO_URI;
const dbName = '3313';
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const timesheetsCollection = client.db(dbName).collection('Timesheets');


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.log('error connecting to DB');
    }
}

run();
const usersCollection = client.db(dbName).collection('Users');

const chatroomsCollection = client.db(dbName).collection('Chatrooms')


function validateInputSignUp(fullname, password, email, role, isNews) {

    const validRoles = ['Admin', 'User', 'Employee', 'VerifiedUser'];

    if (validRoles.includes(role)) {
        return 'Not Valid Role'
    }

    if (!fullname || !password || !email || !role || isNews == undefined) {
        return 'Please enter all required fields' + isNews;
    }
    if (typeof fullname !== 'string' || typeof password !== 'string' || typeof email !== 'string' ||
        !fullname.trim() || !password.trim() || !email.trim()) {
        return 'Invalid input';
    }
    if (fullname.length > 50 || password.length > 50 || email.length > 100) {
        return 'Input too long';
    }
    return null; // Indicating no error
}

function validateInputSignIn(email, password) {
    if (!email || !password) {
        return 'Please enter all required fields';
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
        return 'invalid input type';
    }
    if (email.length > 100 || password.length > 50) {
        return 'Input too long';
    }
    return null; // Indicating no error
}

authRouter.route('/getuser')
    .get(async (req, res) => {
        try {
            const { email } = req.body;
            const user = await usersCollection.findOne({ email });
            res.json(user)
        } catch {
            console.error('Error getting user', error);
            res.status(500).send('Internal server error');
        }

    });

authRouter.route('/getallusers')
    .get(async (req, res) => {
        try {
            // Fetch all users from the collection
            const users = await usersCollection.find({}).toArray(); // Convert the cursor to an array
            res.json(users); // Send the array of users as a response
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).send('Internal server error');
        }
    });

const saltRounds = 10; // or another appropriate value for bcrypt



authRouter.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        lowEmail = email.toLowerCase();
        console.log(lowEmail);

        const validationError = validateInputSignIn(lowEmail, password);

        if (validationError) {

            return res.status(400).send(validationError);
        }

        const user = await usersCollection.findOne({ email: lowEmail });
        if (user) {
            matching = await bcrypt.compare(password, user.password);

        }
        if (!user || !matching) {
            return res.status(401).send('incorrect email or password');

        } else {

            return res.status(200).send(user);
        }

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send('Internal error');
    }
});

authRouter.post('/signup', async (req, res) => {
    try {
        const { fullname, password, email, role, isNews } = req.body;
        lowEmail = email.toLowerCase();

        // Validate input
        const validationError = validateInputSignUp(fullname, password, lowEmail, role, isNews);
        if (validationError) {
            return res.status(400).send(validationError);
        }

        // Check for existing user
        const userExists = await usersCollection.findOne({ lowEmail });
        if (userExists) {
            return res.status(409).send('This email is already in use');
        }

        // Create verification token
        const token = jwt.sign({ lowEmail }, process.env.JWT_SECRET_KEY, { expiresIn: '2h' });

        // Send verification email
        await sendVerificationEmail(lowEmail, token);

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({
            fullname,
            password: hashedPassword,
            email: lowEmail,
            isDeactivated: false,
            role: role,
            isNews: isNews
        });

        res.status(200).send('User successfully registered');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send('Internal error');
    }
});

authRouter.get('/getchatrooms', async (req, res) => {
    try {
        const chatroomList = await chatroomsCollection.find({}).toArray(); // Find all documents in the collection
        res.status(200).json(chatroomList); // Send the list of chatrooms back to the client
    } catch (error) {
        console.error('Failed to fetch chatrooms:', error);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.post('/createChatroom', multerMiddleware.single('image'), async (req, res) => {
    try {
      const { name, allowedRoles } = req.body; // Extract name and allowedRoles from the request body
      const image = req.file; // Extract the image file from the request
  
      if (!name || !allowedRoles || !image) {
        return res.status(400).send('Missing required chatroom details');
      }
  
      // Upload image to GCS and get the URL
      const imageUrl = await uploadImageToGCS(image);
  
      // Insert the chatroom details into the MongoDB collection
      const result = await chatroomsCollection.insertOne({
        name,
        allowedRoles: JSON.parse(allowedRoles), // Assuming allowedRoles is sent as a JSON string
        image: imageUrl,
        messages: [] // Initialize messages as an empty array
      });
  
      if (!result.acknowledged) {
        throw new Error('Chatroom creation failed');
      }
  
      res.status(201).send('Chatroom created successfully');
    } catch (error) {
      console.error('Failed to create chatroom:', error);
      res.status(500).send('Internal Server Error');
    }
  });

authRouter.post('/chatrooms/:chatroomId/send', async (req, res) => {
    try {
        const { chatroomId } = req.params;
        const { content, senderEmail, name } = req.body;

        // TODO: Authentication and validation logic here

        // Retrieve the chatroom and find the highest messageId
        const chatId = new ObjectId(chatroomId);
        const chatroom = await chatroomsCollection.findOne({ _id: chatId });
        if (!chatroom) {
        
            return res.status(404).json({ message: 'Chatroom not found' });
            
        }

        
        const lastMessageId = chatroom.messages.length > 0
            ? chatroom.messages[chatroom.messages.length - 1].messageId
            : 0;
        const newMessageId = lastMessageId + 1;

        const newMessage = {
            messageId: newMessageId, // Use the newly calculated messageId
            content,
            senderEmail,
            name,
            timestamp: new Date(),
        };

        console.log(newMessage)
        const result = await chatroomsCollection.updateOne(
            { _id: chatId },
            { $push: { messages: newMessage } }
            
        );

        if (result.modifiedCount === 1) {
            console.log("yay")
            res.status(200).json({ message: 'Message sent successfully', data: newMessage });
        } else {
            console.log("nay")
            res.status(500).json({ message: 'Error updating chatroom with new message' });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Internal Server Error');
    }
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
