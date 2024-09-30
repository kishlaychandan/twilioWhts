import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

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
async function sendWhatsAppMessage(to, body) {
    try {
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
            to: to,
            body: body
        });
        console.log('Message sent: ', message.sid);
    } catch (error) {
        console.error('Error sending message: ', error);
    }
}

// Function to display the menu options
async function displayMenu(to) {
    const menuMessage = `
        Please select your issue from the options below:
        1. Restaurant Enquiry
        2. Food Enquiry
        3. Tiffin Enquiry
        4. Delivery Issue
    `;
    await sendWhatsAppMessage(to, menuMessage);
}

// Handle incoming WhatsApp messages
app.post('/whatsapp-webhook', async (req, res) => {
    const incomingMessage = req.body.Body ? req.body.Body.trim().toLowerCase() : null;
    const fromNumber = req.body.From;

    // Initialize session if the user is interacting for the first time
    if (!userSessions[fromNumber]) {
        userSessions[fromNumber] = { currentStep: 'initial' };
    }

    // Check the user's current step in the conversation flow
    const session = userSessions[fromNumber];

    // Step-by-step conversation flow
    switch (session.currentStep) {
        case 'initial':
            if (incomingMessage === 'hi') {
                await sendWhatsAppMessage(fromNumber, 'Hello, Welcome to our website! What is your name?');
                session.currentStep = 'askName';
            } else {
                await sendWhatsAppMessage(fromNumber, 'Please say "hi" to start.');
            }
            break;

        case 'askName':
            session.name = incomingMessage; // Save the name
            await sendWhatsAppMessage(fromNumber, `Thank you, ${session.name}! Could you please provide your phone number?`);
            session.currentStep = 'askPhoneNumber';
            break;

        case 'askPhoneNumber':
            session.phone = incomingMessage; // Save the phone number
            await displayMenu(fromNumber);
            session.currentStep = 'menu'; // Move to the menu step
            break;

        case 'menu':
            switch (incomingMessage) {
                case '1':
                    await sendWhatsAppMessage(fromNumber, 'You selected: Restaurant Enquiry.\nHere is a brief about our restaurant: [Restaurant Details]');
                    break;
                case '2':
                    await sendWhatsAppMessage(fromNumber, 'You selected: Food Enquiry.\nFor food enquiries, please contact our restaurant at: 123-456-7890. You can also view our menu at: https://example.com/menu');
                    break;
                case '3':
                    await sendWhatsAppMessage(fromNumber, 'You selected: Tiffin Enquiry.\nFor tiffin enquiries, please contact our restaurant at: 123-456-7890. You can find more details about our tiffin service at: https://example.com/tiffin');
                    break;
                case '4':
                    await sendWhatsAppMessage(fromNumber, 'You selected: Delivery Issue.\nPlease provide your order ID.');
                    session.currentStep = 'askOrderID';
                    break;
                default:
                    await sendWhatsAppMessage(fromNumber, 'Invalid option. Please select a valid option (1-4).');
                    await displayMenu(fromNumber); // Redisplay the menu
                    return; // Exit the switch statement
            }
            session.currentStep = 'finalResponse'; // Move to the final response step
            break;

        case 'askOrderID':
            session.orderID = incomingMessage; // Save the order ID
            await sendWhatsAppMessage(fromNumber, 'Thank you for providing your order ID. Our team will contact you shortly.');
            session.currentStep = 'finalResponse';
            break;

        case 'finalResponse':
            await sendWhatsAppMessage(fromNumber, 'Is there anything else I can help you with? (Reply with "yes" or "no")');
            session.currentStep = 'askFinalResponse';
            break;

        case 'askFinalResponse':
            if (incomingMessage === 'yes') {
                await displayMenu(fromNumber); // Redisplay the menu
                session.currentStep = 'menu'; // Go back to the menu
            } else {
                await sendWhatsAppMessage(fromNumber, 'Thank you for contacting us. Have a good day!');
                delete userSessions[fromNumber]; // End the session
            }
            break;

        default:
            await sendWhatsAppMessage(fromNumber, 'I am not sure how to respond to that. Please start with "hi".');
            break;
    }

    res.send('Webhook received');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
