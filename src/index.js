//connecting to db
require('./database/connection')
require('./models/initialize')
const dotenv = require('dotenv')
const express = require('express')
const userRouter = require('./routers/user/user')
const demandeRouter = require('./routers/demande/demande')
const membreRouter = require('./routers/commissions/membres/membre')
const commissionRouter = require('./routers/commissions/commission')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { ApiError, InternalError } = require('./core/api-error')

dotenv.config();

const app = express()

const port = process.env.PORT || 3001

//how u start ur express server
app.listen(port, () => {
    console.log("Listening to port " + port)
})

//this shit is necessary
let corsOptions = {
    origin: ['http://localhost:3000'],
    credentials: true,
    //this one to get filename as we download it
    exposedHeaders: ['Content-Disposition']
}

app.use(cors(corsOptions));

//to parse everything to json
app.use(express.json())
app.use(cookieParser());

app.use('/users', userRouter)
app.use('/demandes', demandeRouter)
app.use('/commissions', commissionRouter)
app.use('/commissions/membres', membreRouter)

app.use((err, req, res, next) => {
    console.log(err.stack);
    console.log(err.message);
    if (err instanceof ApiError) {
        ApiError.handle(err, res);
    } else {
        if (process.env.NODE_ENV === "development") {
            res.status(500).send(err.message);
        } else{
            ApiError.handle(new InternalError(), res);
        }
    }
});

