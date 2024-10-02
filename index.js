// import express from 'express';
// import bodyParser from 'body-parser';
// import twilio from 'twilio';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// const port = process.env.PORT || 3000;
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);

// const userSessions = {};

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

// async function displayMenu(to) {
//     const menuMessage = `
//         Please select your issue from the options below:
//         1. Restaurant Enquiry
//         2. Food Enquiry
//         3. Tiffin Enquiry
//         4. Delivery Issue
//     `;
//     await sendWhatsAppMessage(to, menuMessage);
// }

// app.post('/whatsapp-webhook', async (req, res) => {
//     const incomingMessage = req.body.Body ? req.body.Body.trim().toLowerCase() : null;
//     const fromNumber = req.body.From;
    
//     if (!userSessions[fromNumber]) {
//         userSessions[fromNumber] = { currentStep: 'initial' };
//     }

//     const session = userSessions[fromNumber];

//     switch (session.currentStep) {
//         case 'initial':
//             if (incomingMessage === 'hi') {
//                 await sendWhatsAppMessage(fromNumber, 'Hello, Welcome to our website! What is your name?');
//                 session.currentStep = 'askName';
//             } else {
//                 await sendWhatsAppMessage(fromNumber, 'Please say "hi" to start.');
//             }
//             break;

//         case 'askName':
//             session.name = incomingMessage;
//             await sendWhatsAppMessage(fromNumber, `Thank you, ${session.name}! Could you please provide your phone number?`);
//             session.currentStep = 'askPhoneNumber';
//             break;

//         case 'askPhoneNumber':
//             session.phone = incomingMessage;
//             await displayMenu(fromNumber);
//             session.currentStep = 'menu';
//             break;

//         case 'menu':
//             switch (incomingMessage) {
//                 case '1':
//                     await sendWhatsAppMessage(fromNumber, 'You selected: Restaurant Enquiry.\nHere is a brief about our restaurant: [Restaurant Details]');
//                     break;
//                 case '2':
//                     await sendWhatsAppMessage(fromNumber, 'You selected: Food Enquiry.\nFor food enquiries, please contact our restaurant at: 123-456-7890. You can also view our menu at: https://example.com/menu');
//                     break;
//                 case '3':
//                     await sendWhatsAppMessage(fromNumber, 'You selected: Tiffin Enquiry.\nFor tiffin enquiries, please contact our restaurant at: 123-456-7890. You can find more details about our tiffin service at: https://example.com/tiffin');
//                     break;
//                 case '4':
//                     await sendWhatsAppMessage(fromNumber, 'You selected: Delivery Issue.\nPlease provide your order ID.');
//                     session.currentStep = 'askOrderID';
//                     break;
//                 default:
//                     await sendWhatsAppMessage(fromNumber, 'Invalid option. Please select a valid option (1-4).');
//                     await displayMenu(fromNumber);
//                     return; 
//             }
//             session.currentStep = 'finalResponse';
//             break;

//         case 'askOrderID':
//             session.orderID = incomingMessage;
//             await sendWhatsAppMessage(fromNumber, 'Thank you for providing your order ID. Our team will contact you shortly.');
//             session.currentStep = 'finalResponse';
//             break;

//         case 'finalResponse':
//             await sendWhatsAppMessage(fromNumber, 'Is there anything else I can help you with? (Reply with "yes" or "no")');
//             session.currentStep = 'askFinalResponse';
//             break;

//         case 'askFinalResponse':
//             if (incomingMessage === 'yes') {
//                 await displayMenu(fromNumber);
//                 session.currentStep = 'menu';
//             } else {
//                 await sendWhatsAppMessage(fromNumber, 'Thank you for contacting us. Have a good day!');
//                 delete userSessions[fromNumber];
//             }
//             break;

//         default:
//             await sendWhatsAppMessage(fromNumber, 'I am not sure how to respond to that. Please start with "hi".');
//             break;
//     }

//     res.send('Webhook received');
// });


// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

// import express from 'express';
// import bodyParser from 'body-parser';
// import twilio from 'twilio';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// const port = process.env.PORT || 3000;
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);

// // Function to send WhatsApp template message
// async function sendWhatsAppTemplateMessage(to) {
//     try {
//         const message = await client.messages.create({
//             from: 'whatsapp:+14155238886', 
//             to: to,
//             contentSid: 'HX3e386ca73e928ea475d4c3e99e31b70d',
//             contentVariables: JSON.stringify({}) 
//         });
//         console.log('Template message sent: ', message.sid);
//     } catch (error) {
//         console.error('Error sending template message: ', error);
//     }
// }

// app.post('/whatsapp-webhook', async (req, res) => {
//     const fromNumber = req.body.From;

//     await sendWhatsAppTemplateMessage(fromNumber);

//     res.send('Template message sent');
// });

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });


import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Function to send WhatsApp List Picker Template
async function sendWhatsAppTemplateMessage(to) {
    try {
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886', // Twilio WhatsApp sandbox or your Twilio WhatsApp number
            to: to,
            contentSid: 'HX1c3237f4cbeb878c0d42247e440fa992', // List picker Template SID
            contentVariables: JSON.stringify({}) // Pass any required variables for the list template here
        });
        console.log('Template message sent: ', message.sid);
    } catch (error) {
        console.error('Error sending template message: ', error);
    }
}

// Function to send a follow-up message based on the user's choice
async function sendFollowUpMessage(to, choice) {
    try {
        let followUpMessage = '';

        // Customize the follow-up message based on the choice made by the user
        if (choice === 'option1') {
            followUpMessage = 'You selected option 1. We will assist you with this soon.';
        } else if (choice === 'option2') {
            followUpMessage = 'You selected option 2. We will assist you with this soon.';
        } else if (choice === 'option3') {
            followUpMessage = 'You selected option 3. We will assist you with this soon.';
        } else {
            followUpMessage = 'You selected an unknown option. Please try again.';
        }

        // Send the follow-up message
        await client.messages.create({
            from: 'whatsapp:+14155238886', // Twilio WhatsApp number
            to: to,
            body: followUpMessage
        });
        console.log('Follow-up message sent.');
    } catch (error) {
        console.error('Error sending follow-up message: ', error);
    }
}

// Function to send a thank-you message
async function sendThankYouMessage(to) {
    try {
        await client.messages.create({
            from: 'whatsapp:+14155238886', // Twilio WhatsApp number
            to: to,
            body: 'Thank you! We will reach out to you soon.'
        });
        console.log('Thank-you message sent.');
    } catch (error) {
        console.error('Error sending thank-you message: ', error);
    }
}

// Webhook to handle incoming WhatsApp messages
app.post('/whatsapp-webhook', async (req, res) => {
    const fromNumber = req.body.From;
    const incomingMessage = req.body.Body ? req.body.Body.trim().toLowerCase() : null;

    // Step 1: Send the list picker template message if it's the first interaction
    if (incomingMessage === 'hi') {
        await sendWhatsAppTemplateMessage(fromNumber);
        res.send('Template message sent');
    }
    
    // Step 2: Handle the user's choice (for this example, assuming the choices are "option1", "option2", and "option3")
    else if (incomingMessage === 'option1' || incomingMessage === 'option2' || incomingMessage === 'option3') {
        await sendFollowUpMessage(fromNumber, incomingMessage);
        
        // Step 3: Send a thank-you message
        await sendThankYouMessage(fromNumber);
        res.send('Follow-up and thank-you message sent');
    } else {
        res.send('No valid interaction detected.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
