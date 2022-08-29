//connecting to db
require('./database/connection')
const dotenv = require('dotenv')
const express = require('express')
const userRouter = require('./routers/user/user')
const demandeRouter = require('./routers/demande/demande')
const membreRouter = require('./routers/membres/membre')
const commissionRouter = require('./routers/commissions/commission')
const complementRouter = require('./routers/complement/complement')
const projetRouter = require('./routers/projet/projet')
const trancheRouter = require('./routers/tranche/tranche')
const previsionRouter = require('./routers/prevision/prevision')
const realisationsRouter = require('./routers/realisations/realisations')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { jwtVerifyAuth } = require('./helpers/jwt-verify-auth')
const { verifyPermission } = require('./helpers/verifyPermission')
const { ApiError, InternalError } = require('./core/api-error')
const compression = require('compression')
const path = require('path');

dotenv.config();

const app = express()

const port = process.env.PORT || 3001

//this shit is necessary
let corsOptions = {
    origin: ['http://localhost:3000'],
    credentials: true,
    //this one to get filename as we download it
    // exposedHeaders: ['Content-Disposition']
}

app.use(compression())
app.use(cors(corsOptions));

//to parse everything to json
app.use(express.json())
app.use(cookieParser());

app.all('/uploads/*',
    jwtVerifyAuth,
    verifyPermission
)

app.use('/uploads', express.static('public'));

app.use('/users', userRouter)
app.use('/demandes', demandeRouter)
app.use('/complements', complementRouter)
app.use('/commissions', commissionRouter)
app.use('/membres', membreRouter)
app.use('/projets', projetRouter)
app.use('/tranches', trancheRouter)
app.use('/previsions', previsionRouter)
app.use('/realisations', realisationsRouter)

app.use((err, req, res, next) => {
    //DELETE IN production
    console.log(err.stack);
    console.log(err.message);
    if (err instanceof ApiError) {
        ApiError.handle(err, res);
    } else {
        if (process.env.NODE_ENV === "development") {
            res.status(500).send(err.message);
        } else {
            ApiError.handle(new InternalError(), res);
        }
    }
});

//how u start ur express server
app.listen(port, () => {
    console.log("Listening to port " + port)
})