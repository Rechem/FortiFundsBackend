const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { BadRequestError } = require('./api-error')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const dir = `./public/` + file.fieldname
        // switch (file.fieldname) {
        //     case fieldNames.businessPlan:
        //         dir += `/business-plans/`
        //         break;
        //     case fieldNames.rapportCommission:
        //         dir += `/rapports-commissions/`
        //         break;
        //     case fieldNames.complementFile:
        //         dir += `/complements/`
        //         break;
        //     case fieldNames.documentAccordFinancement:
        //         dir += `/documentAccordFinancement/`
        //         break;
        //     default:
        //         break;
        // }

        if (!fs.existsSync(dir))
            return fs.mkdir(dir, error => cb(error, dir))

        return cb(null, dir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        let fileName = file.originalname.match(RegExp(/^.*(?=\.[a-zA-Z]+)/g))
        fileName = fileName.toString().replace(/ /g, "_");
        cb(null, fileName + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10485760 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /pdf|doc|docx|xls|xlsx|pptx|ppt|zip|jpg|jpeg|png/
        const mimeType = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname))
        if (mimeType && extname) {
            return cb(null, true)
        } else
            cb(null, false, new BadRequestError(`Format de fichier invalide.`))
    }
})

const fieldNames = {
    businessPlan: "businessPlan",
    rapportCommission: "rapportCommission",
    complementFile: "complementFile",
    documentAccordFinancement: "documentAccordFinancement",
    factureArticlePrevision : "factureArticlePrevision",
}

const WILAYA =
    [{ numero: 1, designation: 'Adrar' },
    { numero: 2, designation: 'Chlef' },
    { numero: 3, designation: 'Laghouat' },
    { numero: 4, designation: 'Oum El Bouaghi' },
    { numero: 5, designation: 'Batna' },
    { numero: 6, designation: 'Béjaïa' },
    { numero: 7, designation: 'Biskra' },
    { numero: 8, designation: 'Béchar' },
    { numero: 9, designation: 'Blida' },
    { numero: 10, designation: 'Bouïra' },
    { numero: 11, designation: 'Tamanrasset' },
    { numero: 12, designation: 'Tébessa' },
    { numero: 13, designation: 'Tlemcen' },
    { numero: 14, designation: 'Tiaret' },
    { numero: 15, designation: 'Tizi Ouzou' },
    { numero: 16, designation: 'Algiers' },
    { numero: 17, designation: 'Djelfa' },
    { numero: 18, designation: 'Jijel' },
    { numero: 19, designation: 'Sétif' },
    { numero: 20, designation: 'Saïda' },
    { numero: 21, designation: 'Skikda' },
    { numero: 22, designation: 'Sidi Bel Abbès' },
    { numero: 23, designation: 'Annaba' },
    { numero: 24, designation: 'Guelma' },
    { numero: 25, designation: 'Constantine' },
    { numero: 26, designation: 'Médéa' },
    { numero: 27, designation: 'Mostaganem' },
    { numero: 28, designation: 'M\'Sila' },
    { numero: 29, designation: 'Mascara' },
    { numero: 30, designation: 'Ouargla' },
    { numero: 31, designation: 'Oran' },
    { numero: 32, designation: 'El Bayadh' },
    { numero: 33, designation: 'Illizi' },
    { numero: 34, designation: 'Bordj Bou Arréridj' },
    { numero: 35, designation: 'Boumerdès' },
    { numero: 36, designation: 'El Tarf' },
    { numero: 37, designation: 'Tindouf' },
    { numero: 38, designation: 'Tissemsilt' },
    { numero: 39, designation: 'El Oued' },
    { numero: 40, designation: 'Khenchela' },
    { numero: 41, designation: 'Souk Ahras' },
    { numero: 42, designation: 'Tipaza' },
    { numero: 43, designation: 'Mila' },
    { numero: 44, designation: 'Aïn Defla' },
    { numero: 45, designation: 'Naâma' },
    { numero: 46, designation: 'Aïn Témouchent' },
    { numero: 47, designation: 'Ghardaïa' },
    { numero: 48, designation: 'Relizane' },
    { numero: 49, designation: 'El M\'Ghair' },
    { numero: 50, designation: 'El Menia' },
    { numero: 51, designation: 'Ouled Djellal' },
    { numero: 52, designation: 'Bordj Baji Mokhtar' },
    { numero: 53, designation: 'Béni Abbès' },
    { numero: 54, designation: 'Timimoun' },
    { numero: 55, designation: 'Touggourt' },
    { numero: 56, designation: 'Djanet' },
    { numero: 57, designation: 'In Salah' },
    { numero: 58, designation: 'In Guezzam' }]

const roles = {
    roleSimpleUser: 'simpleUser',
    roleModerator: 'moderator',
    roleAdmin: 'admin',
    roleSuperAdmin: 'superAdmin'
}

const status = {
    accepted: 'Acceptée',
    refused: 'Refusée',
    pending: 'En attente',
    complement: 'Besoin complément',
    programmee: 'Programmée',
    preselectionnee: 'Préselectionnée',
    terminee: 'Terminée',
    brouillon: 'Brouillon'
}

const statusPrevision = {
    accepted: 'Acceptée',
    refused: 'Refusée',
    pending: 'En attente évaluation',
    brouillon: 'Brouillon',
}

const statusRealisation = {
    waiting: 'En attente saisie',
    pending: 'En attente évaluation',
    terminee: 'Terminée',
}

const statusArticleRealisation = {
    accepted: 'Acceptée',
    refused: 'Refusée',
    pending: 'En attente évaluation',
    waiting: 'En attente saisie',
}

const statusCommission = {
    pending: 'En attente',
    terminee: 'Terminée',
}

const statusDemande = {
    accepted: 'Acceptée',
    refused: 'Refusée',
    pending: 'En attente évaluation',
    complement: 'Besoin complément',
    programmee: 'Programmée',
    preselectionnee: 'Préselectionnée',
}


function sanitizeFileName (name) {
    return `\\uploads\\${name.match(new RegExp(/(?<=public\\).*/g))}`
}

function flattenObject(ob) {
    var toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

function isAdmin(req) {
    return req.user.role.nomRole === roles.roleAdmin
}

function isModo(req) {
    return req.user.role.nomRole === roles.roleModerator
}

function isSimpleUser(req) {
    return req.user.role.nomRole === roles.roleSimpleUser
}

const PAGESIZE = 4

const getPagination = (page, size) => {
    const limit = size ? +size : PAGESIZE;
    const offset = page ? +page * limit : 0;
    return { limit, offset };
};

const getDemandesPagingData = (demandeAvecS, page, limit) => {
    const { count, rows: demandes } = demandeAvecS;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(count / limit);
    return { count, demandes, totalPages, currentPage };
};

module.exports = {
    WILAYA,
    roles,
    status,
    statusPrevision,
    statusCommission,
    statusDemande,
    statusRealisation,
    statusArticleRealisation,
    upload,
    fieldNames,
    sanitizeFileName,
    flattenObject,
    isAdmin,
    isModo,
    isSimpleUser,
    // getPagination,
    // getDemandesPagingData,
    // PAGESIZE
}