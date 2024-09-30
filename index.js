import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import "dotenv/config";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// In-memory user session to track the current step for each user
const userSessions = {};

// Function to send WhatsApp message
async function sendWhatsAppMessage(to, body, interactive = null) {
    try {
        const messageData = {
            from: 'whatsapp:+14155238886', 
            to: to, 
            body: body
        };
        
        // Add interactive if provided
        if (interactive) {
            messageData.interactive = interactive;
        }

        const message = await client.messages.create(messageData);
        console.log('Message sent: ', message.sid);
    } catch (error) {
        console.error('Error sending message: ', error);
    }
}

// Function to display the menu options with buttons
async function displayMenu(to) {
    const menu = {
        "type": "buttons",
        "buttons": [
            {
                "type": "reply",
                "reply": {
                    "id": "purchase",
                    "title": "Purchase"
                }
            },
            {
                "type": "reply",
                "reply": {
                    "id": "status",
                    "title": "Check Status"
                }
            },
            {
                "type": "reply",
                "reply": {
                    "id": "query",
                    "title": "Questions"
                }
            },
            {
                "type": "reply",
                "reply": {
                    "id": "about",
                    "title": "About Us"
                }
            }
        ]
    };

    // Send the menu with buttons
    await sendWhatsAppMessage(to, 'Hello! How can we assist you today?', menu);
}

// Handle incoming WhatsApp messages
app.post('/whatsapp-webhook', async (req, res) => {
    console.log('Incoming message data:', req.body); // Log incoming data
    const incomingMessage = req.body.Body ? req.body.Body.trim().toLowerCase() : null;
    const fromNumber = req.body.From;
    const buttonId = req.body.ButtonId; // Assuming ButtonId is sent when a button is clicked

    // Initialize session if the user is interacting for the first time
    if (!userSessions[fromNumber]) {
        userSessions[fromNumber] = { currentStep: 'initial' };
    }

    // Check the user's current step in the conversation flow
    const session = userSessions[fromNumber];

    // Handle button clicks
    if (buttonId) {
        switch (buttonId) {
            case 'purchase':
                await sendWhatsAppMessage(fromNumber, 'You selected: "Want to purchase something". What would you like to purchase?');
                session.currentStep = 'purchase';
                break;
            case 'status':
                await sendWhatsAppMessage(fromNumber, 'You selected: "Order status". Please provide your order ID for tracking.');
                session.currentStep = 'orderStatus';
                break;
            case 'query':
                await sendWhatsAppMessage(fromNumber, 'You selected: "Queries". Please describe your query.');
                session.currentStep = 'query';
                break;
            case 'about':
                await sendWhatsAppMessage(fromNumber, 'You selected: "About". We are a customer-friendly company providing 24/7 support!');
                session.currentStep = 'about';
                break;
            default:
                await sendWhatsAppMessage(fromNumber, 'Invalid option. Please choose a valid option.');
                await displayMenu(fromNumber); // Redisplay the menu if an invalid option is selected
        }
    } else if (session.currentStep === 'initial' && incomingMessage === 'hi') {
        await sendWhatsAppMessage(fromNumber, 'Hello! How are you?');
        await displayMenu(fromNumber); // Show menu options
        session.currentStep = 'menu'; // Move to the menu step
    } else {
        await sendWhatsAppMessage(fromNumber, 'Please reply with "Hi" to start the interaction.');
    }

    res.send('Webhook received');
});

// Start the server
app.listen(port, () => {
    console.log('Server running on port 3000');
});
