// import express from 'express';
// import bodyParser from 'body-parser';
// import twilio from 'twilio';
// import "dotenv/config";

// const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
// const port=process.env.PORT || 3000;
// // Twilio configuration
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);

// // In-memory user session to track the current step for each user
// const userSessions = {};

// // Function to send WhatsApp message
// async function sendWhatsAppMessage(to, body) {
//     try {
//         const message = await client.messages.create({
//             from: 'whatsapp:+14155238886', 
//             to: to, 
//             body: body
//         });
//         console.log('Message sent: ', message.sid);
//     } catch (error) {
//         console.error('Error sending message: ', error);
//     }
// }

// // Function to display the menu options
// async function displayMenu(to) {
//     const menu = `Hello! How can we assist you today?\n\nPlease choose one of the following options by replying with a keyword:\n
//     1. *purchase* - Want to purchase something
//     2. *status* - Check your order status
//     3. *query* - Have any questions or queries
//     4. *about* - Learn more about us`;
//     await sendWhatsAppMessage(to, menu);
// }

// // Handle incoming WhatsApp messages
// app.post('/whatsapp-webhook', async (req, res) => {
//     const incomingMessage = req.body.Body.trim().toLowerCase();
//     const fromNumber = req.body.From;

//     // Initialize session if the user is interacting for the first time
//     if (!userSessions[fromNumber]) {
//         userSessions[fromNumber] = { currentStep: 'initial' };
//     }

//     // Check the user's current step in the conversation flow
//     const session = userSessions[fromNumber];

//     // User sends "Hi" - respond with the menu
//     if (session.currentStep === 'initial' && incomingMessage === 'hi') {
//         await sendWhatsAppMessage(fromNumber, 'Hello! How are you?');
//         await displayMenu(fromNumber);

//         // Send a message to your number
//         await sendWhatsAppMessage('+919631252292', 'A user has initiated the chat with Hi!'); // Your number
//         session.currentStep = 'menu'; // Move to the menu step
//     }
//     // Handle the user's response to the menu options using keywords
//     else if (session.currentStep === 'menu') {
//         if (incomingMessage === 'purchase') {
//             await sendWhatsAppMessage(fromNumber, 'You selected: "Want to purchase something". What would you like to purchase?');
//             session.currentStep = 'purchase';
//         } else if (incomingMessage === 'status') {
//             await sendWhatsAppMessage(fromNumber, 'You selected: "Order status". Please provide your order ID for tracking.');
//             session.currentStep = 'orderStatus';
//         } else if (incomingMessage === 'query') {
//             await sendWhatsAppMessage(fromNumber, 'You selected: "Queries". Please describe your query.');
//             session.currentStep = 'query';
//         } else if (incomingMessage === 'about') {
//             await sendWhatsAppMessage(fromNumber, 'You selected: "About". We are a customer-friendly company providing 24/7 support!');
//             session.currentStep = 'about';
//         } else {
//             await sendWhatsAppMessage(fromNumber, 'Invalid option. Please choose a valid option by replying with a keyword: *purchase*, *status*, *query*, or *about*.');
//             await displayMenu(fromNumber); // Redisplay the menu if an invalid option is selected
//         }
//     }

//     // Reset session after a response is handled (optional)
//     if (session.currentStep !== 'menu') {
//         userSessions[fromNumber] = { currentStep: 'initial' }; // Reset session after each interaction
//     }

//     res.send('Webhook received');
// });

// // Start the server
// app.listen(port, () => {
//     console.log('Server running on port 3000');
// });

import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import "dotenv/config";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Added for parsing JSON body
const port = process.env.PORT || 3000;

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// In-memory user session to track the current step for each user
const userSessions = {};

// Function to send WhatsApp message
async function sendWhatsAppMessage(to, body) {
    try {
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: to,
            body: body
        });
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

    // Send the menu as a message
    await sendWhatsAppMessage(to, 'Hello! How can we assist you today?');
    // Note: Persistent menus are typically not directly supported in WhatsApp API messages, this needs to be sent via a different method or configuration.
}

// Handle incoming WhatsApp messages
app.post('/whatsapp-webhook', async (req, res) => {
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
        await displayMenu(fromNumber);
        session.currentStep = 'menu'; // Move to the menu step
    } else {
        await sendWhatsAppMessage(fromNumber, 'Please reply with "Hi" to start the interaction.');
    }

    // Reset session after a response is handled (optional)
    if (session.currentStep !== 'menu') {
        userSessions[fromNumber] = { currentStep: 'initial' }; // Reset session after each interaction
    }

    res.send('Webhook received');
});

// Start the server
app.listen(port, () => {
    console.log('Server running on port 3000');
});
