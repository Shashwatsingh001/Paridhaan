/*Writing all basic setup code here*/
if(process.env.NODE_ENV != "production"){// We have written this if statement because, we don't use ".env" file in production 
    // phase
require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override'); // This will allow us to use put, patch and delete request
const Cloth = require('./models/cloth');
const Userinfo = require('./models/userInfo');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const flaskApiUrl = process.env.FLASK_API_URL;
const axios = require("axios");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const https = require('https');



//For views folder
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "/views"));

//For public folder/to serve static files
app.use(express.static(path.join(__dirname, 'public')));

//For using the put, patch, delete opeartions for the html form.
app.use(methodOverride('_method'));

//For fetch data of POST request from the req.body
app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60* 60 * 1000,
        httpOnly: true,
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//For mongodb connection
main()
    .then(() => {
        console.log("Connection Successful");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/paridhaan");
}


// Async function to fetch recommendations from the api model
// async function getRecommendations() {
//     const requestBody = {
//         season: "Autumn",
//         gender: "F",
//         occasion: "Formal",
//         cloth_category: "jeans"
//     };

//     try {
//         // Post request to Flask API
//         const response = await axios.post(flaskApiUrl, requestBody);
//         console.log("Recommendations from ML model:", response.data);

//         // Return recommendations from the API
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching recommendations:", error.response ? error.response.data : error.message);
//         throw new Error("Failed to fetch recommendations");
//     }
// };








// app.get('/demouser', async(req, res) => {
//     let fakeUser = new User({
//         email: "rishabh@gmail.com",
//         username: "delta-student"
//     });

//     let regiteredUser = await User.register(fakeUser, "HelloWorls");
//     res.send(regiteredUser);
// });

// app.get('/', (req, res) => {
//     res.send("Hi, I am main page");
// });

// app.get('/testCloth', async(req, res) => {
//     let sampleCloth =  new Cloth({
//         Cloth_category: 'shorts',
//         Brand: 'Jack and Jones',
//         Available_on: 'J&J',
//         Wear_type: 'Lower',
//         Material: 'Denim',
//         Fit_type: 'Slim',
//         Occasion: 'Casual',
//         Colors: [ 'Blue', 'Black' ],
//         Wash_care: [ 'Hand Wash', 'Machine Wash' ],
//         Price: 4000,
//         Discount_percentage: '5%',
//         Discounted_price: 3800,
//         Gender: 'M',
//         Size: [ 'M' ],
//         Season: 'Summer',
//     });
//     await sampleCloth.save()
//     .then((res) => {
//         console.log(res);
//     })
//     console.log('sample was saved');
//     res.send('Cloth saved successful');
// });

// Cloth.findOne({Available_on: 'J&J'})
// .then((res) => {
// console.log(res);
// })


app.get('/signup', (req, res) => {
    res.render('users/signup');
});

app.post('/signup', async(req, res) => {
    let {email, password, username} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    res.redirect('/home');
});



app.get('/login', (req, res) => {
    res.render('users/login');
});

app.post(
    '/login',
    passport.authenticate("local", {
        failureRedirect: '/signup',
        failureFlash: true,
    }),
    async (req, res) => {
        console.log("Authenticated user:", req.user);
        res.send("Welcome to Paridhaan you are logged in!");
    }
);


app.get('/home', (req, res) => {
    res.render('home/home');
});


//Quiz routes
app.get('/ques1', (req, res) => {
    res.render('quiz/ques1');
});

app.post('/ques1', (req, res) => {
    let {name} = req.body;
    console.log(name);
    res.redirect('/ques2');
});

app.get('/ques2', (req, res) => {
    res.render('quiz/ques2');
});

app.post('/ques2', (req, res) => {
    let { gender } = req.body;
    console.log(gender);
    res.redirect('ques3');
});

app.get('/ques3', (req, res) => {
    res.render('quiz/ques3');
});

app.post('/ques3', (req, res) => {
    let  { feet, inch } = req.body;
    console.log(feet, inch);
    res.redirect('ques4'); 
});

app.get('/ques4', (req, res) => {
    res.render('quiz/ques4');
});

app.post('/ques4', (req, res) => {
    let { weight } = req.body;
    console.log(weight);
    res.redirect('ques5');
});


app.get('/ques5', (req, res) => {
    res.render('quiz/ques5');
});

app.post('/ques5', (req, res) => {
    let { seasons } = req.body;
    console.log(seasons);
    res.redirect('ques6');
});

app.get('/ques6', (req, res) => {
    res.render('quiz/ques6');
});

app.post('/ques6', (req, res) => {
    let { vacations } = req.body;
    console.log(vacations);
    res.redirect('ques7');
});

app.get('/ques7', (req, res) => {
    res.render('quiz/ques7');
});

app.post('/ques7', (req, res) => {
    let { fabrics } = req.body;
    console.log(fabrics);
    res.redirect('ques8');
});

app.get('/ques8', (req, res) => {
    res.render('quiz/ques8');
});

app.post('/ques8', (req, res) => {
    let { bust } = req.body;
    console.log(bust);
    res.redirect('ques9');
});

app.get('/ques9', (req, res) => {
    res.render('quiz/ques9');
});

app.post('/ques9', (req, res) => {
    let { waist } = req.body;
    console.log(waist);
    res.redirect('ques10');
});

app.get('/ques10', (req, res) => {
    res.render('quiz/ques10');
});

app.post('/ques10', (req, res) => {
    let { bustWaist } = req.body;
    console.log(bustWaist);
    res.redirect('ques11');
});

app.get('/ques11', (req, res) => {
    res.render('quiz/ques11');
});

app.post('/ques11', (req, res) => {
    let { style } = req.body;
    console.log(style);
    res.redirect('ques12');
});

app.get('/ques12', (req, res) => {
    res.render('quiz/ques12');
});

app.post('/ques12', (req, res) => {
    let { style } = req.body;
    console.log(style);
    res.redirect('ques13');
});

app.get('/ques13', (req, res) => {
    res.render('quiz/ques13');
});

app.post('/ques13', (req, res) => {
    let { tops, outerwear, dresses } = req.body;
    console.log(tops, outerwear, dresses);
    res.redirect('go_to_recommendation');
});


app.get('/go_to_recommendation', (req, res) => {
    res.render('quiz/go_to_recommendation');
});

app.get('/recommend_input', (req, res) => {
    res.render('quiz/recommend_input');
});

// app.post('/recommend_input', (req, res) => {
//     let { season, clothCategory, occasion} = req.body;
//     console.log(season, clothCategory, occasion);
// });

let category_model;
// Handle /recommend_input POST request
app.post('/recommend_input', (req, res) => {
    console.log(req.body); // Log the entire request body
    const { season, cloth_category, occasion } = req.body;

    if (!season || !cloth_category || !occasion) {
        return res.status(400).send('All inputs are required');
    }

    const inputArray = [season, cloth_category, occasion];
    console.log(inputArray); // Logs the inputs as an array

    // Dynamically create an auto-submitting form for /pay
    const formHtml = `
        <form id="payRedirectForm" action="/pay" method="POST">
            <input type="hidden" name="inputArray" value='${JSON.stringify(inputArray)}'>
        </form>
        <script>
            document.getElementById('payRedirectForm').submit();
        </script>
    `;
    res.send(formHtml); // Send the form to the client for automatic submission
});



//Stripe authetication code

app.post('/pay', async(req, res) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Your own stylist at your home',
                    },
                    unit_amount: 100 * 100,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: 'https://64b9-2402-3a80-b45-2606-8853-585e-1124-aef7.ngrok-free.app/complete1',
        // success_url:`${ process.env.BASE_URL}/output`,
        cancel_url: `${ process.env.BASE_URL}/cancel1`,
    });
    // console.log(session);
    res.redirect(session.url);
});

app.get('/complete1', (req, res) => {
    res.redirect('/output');
});

app.get('/cancel', (req, res) => {
    res.redirect('/pay');
});

app.get('/output', async (req, res) => {
    let cloth = await Cloth.findOne({Cloth_category: category_model});
    console.log(cloth);
    res.render('recommendation/output', { cloth });
});

app.get('/try_on', (req, res) => {
    res.render('recommendation/try_on');
})

// //Recommendation model setup fro flask make sure to run the flask app 
// app.get('/output', async (req, res) => {
//     try {
//         // Call getRecommendations function
//         const recommendations = await getRecommendations();
//         console.log("Recommendations received:", recommendations);

//         // Extract the key-value pair from recommendations
//         const queryKey = Object.keys(recommendations)[0]; // e.g., "recommended_image"
//         const queryValue = recommendations[queryKey]; // e.g., "a62.jpg"

//         // Query the database using the key-value pair
//         const cloth = await Cloth.findOne({ [queryKey]: queryValue });

//         console.log("Cloth found:", cloth);

//         if (!cloth) {
//             return res.status(404).send({
//                 message: 'No matching cloth found for the recommendations.',
//                 recommendations: recommendations,
//             });
//         }

//         // Send response back to the client
//         // res.send({
//         //     message: 'Recommendations fetched successfully!',
//         //     recommendations: recommendations,
//         //     cloth: cloth,
//         // });
//         res.render('recommendation/output', { cloth });
//     } catch (error) {
//         console.error("Error in /requests route:", error.message);
//         res.status(500).send({ error: "An error occurred while processing the request." });
//     }
// });


// app.get('/x', async(req, res) => {
//     let cloth = await Cloth.findOne({Brand: 'H&M'});
    
//     // res.render('recommendation/try_on', { cloth });
// });


app.get('/cloth', async(req, res) => {
    let allCloth = await Cloth.find();
    res.render('home/cloth', { allCloth });
});




















//Miscellaneous Route

app.get('/our_stores', (req, res) => {
    res.render('miscellaneous/ourStores');
});

app.get('/privacy', (req, res) => {
    res.render('miscellaneous/privacy');
});

app.get('/terms', (req, res) => {
    res.render('miscellaneous/terms&conditions');
});

app.get('/help', (req, res) => {
    res.render('miscellaneous/help');
});

app.get('/book', (req, res) => {
    res.render('miscellaneous/book');
});

app.post('/book-appointment', async (req, res) => {
    try {
        // Extract and sanitize input
        const city = typeof req.body.city === 'string' ? req.body.city.trim() : null;
        const date = typeof req.body.date === 'string' ? req.body.date.trim() : null;

        if (!city || !date) {
            return res.status(400).send('City or date is missing or invalid');
        }

        console.log(`City: ${city}, Date: ${date}`);

        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Appointment on ${date} in ${city}`,
                        },
                        unit_amount: 300 * 100, // $300 in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // success_url: `${process.env.BASE_URL}/complete2`,
            success_url: `https://64b9-2402-3a80-b45-2606-8853-585e-1124-aef7.ngrok-free.app/complete2`,
            cancel_url: `${process.env.BASE_URL}/cancel2`,
        });

        // Redirect to Stripe payment page
        res.redirect(session.url);
    } catch (err) {
        console.error('Error creating Stripe session:', err);
        res.status(500).send('Internal Server Error');
    }
});

// function calculateAppointmentTime(date) {
//     const appointmentDate = new Date(date);
//     let appointmentTime = new Date(appointmentDate.getTime() + 5 * 60 * 60 * 1000); // Add 5 hours

//     if (appointmentTime.getHours() >= 21) {
//         // If it's past 9 PM, set to next day at 11 AM
//         appointmentTime.setDate(appointmentTime.getDate() + 1);
//         appointmentTime.setHours(11, 0, 0, 0);
//     }

//     return appointmentTime;
// };

// // Route: Handle successful payment
// app.get('/complete2', async (req, res) => {
//     try {
//         const { city, date } = req.query;

//         if (!city || !date) {
//             return res.status(400).send('City or date is missing or invalid');
//         }

//         // Calculate the appointment time
//         const appointmentTime = calculateAppointmentTime(date);

//         // Nodemailer setup
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASSWORD,
//             },
//         });

//         // Email content
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: 'user@example.com', // Replace with the user's email
//             subject: 'Appointment Confirmation',
//             text: `Dear User,

// Your appointment is confirmed.

// Details:
// City: ${city}
// Date: ${appointmentTime.toLocaleDateString()}
// Time: ${appointmentTime.toLocaleTimeString()}

// Thank you for booking with us!

// Best regards,
// Your Team`,
//         };

//         // Send email
//         await transporter.sendMail(mailOptions);

//         res.send('Payment successful! A confirmation email has been sent to your registered email.');
//     } catch (error) {
//         console.error('Error sending confirmation email:', error);
//         res.status(500).send('An error occurred while processing your request.');
//     }
// });

app.get('/complete2', (req, res) => {
    res.redirect('appointment_booked');
});

// Route: Handle canceled payment
app.get('/cancel2', (req, res) => {
    res.redirect('book-appointment');
});


app.get('/appointment_booked', (req, res) => {
    res.render('miscellaneous/appointment_booked');
})

app.get('/faq', (req, res) => {
    res.render('miscellaneous/faq');
});

app.get('/about_us', (req, res) => {
    res.render('miscellaneous/about_us');
});

app.get('/contact_us', (req, res) => {
    res.render('miscellaneous/contact_us');
});

app.get('/game', (req, res) => {
    res.render('miscellaneous/game');
});

app.get('*', (req, res) => {
    res.send("Page not found");
});



const port = 8080;

app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`)
});