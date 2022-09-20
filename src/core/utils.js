const multer = require('multer')
const path = require('path')
const { BadRequestError } = require('./api-error')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = `./public/` + file.fieldname
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
    factureArticlePrevision: "factureArticlePrevision",
    factureArticleRealisation: "factureArticleRealisation",
    factureArticleRevenu: "factureArticleRevenu",

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
    pendingWaiting : 'En attente évaluation et saisie',
    evaluatedWaiting : 'Evalué en attente saisie',
    evaluatedPending : 'Evalué en attente évaluation',
    evaluated : 'Evalué',
    terminee: 'Terminée',
}

const statusArticleRealisation = {
    accepted: 'Acceptée',
    refused: 'Refusée',
    pending: 'En attente évaluation',
    waiting: 'En attente saisie',
}

const statusArticleRevenu = {
    accepted: 'Acceptée',
    refused: 'Refusée',
    pending: 'En attente évaluation',
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
const statusTicket = {
    ouvert: 'Ouvert',
    ferme: 'Fermé',
}

const statusRevenu = {
    waiting: 'En attente saisie',
    pending: 'En attente évaluation',
    evaluated: 'Evalué',
}

const motifTicket = {
    rdv: 'Demander un rendez-vous',
    renseignement: 'Demander un renseignement',
    reclamation: 'Faire une réclamation',
    autre: 'Autre',
}


function sanitizeFileName(name) {
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

async function deleteFile(fileNameToDelete) {
    try {
        console.log('deleting ' + fileNameToDelete);
        await unlinkAsync(fileNameToDelete)
    } catch (error) {
        console.log('Could not delete' + fileNameToDelete);
    }
}

const PAGESIZE = 10

const getPagination = (page, size) => {
    const limit = size ? +size : PAGESIZE;
    const offset = page ? +page * limit : 0;
    return { limit, offset };
};

const getPagingData = (list, page) => {
    const { count: totalCount, rows : data } = list;
    const currentPage = page ? +page : 0;
    return { data, page: currentPage, totalCount, };
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
    statusArticleRevenu,
    statusTicket,
    statusRevenu,
    motifTicket,
    deleteFile,
    sanitizeFileName,
    flattenObject,
    isAdmin,
    isModo,
    isSimpleUser,
    getPagination,
    getPagingData,
    PAGESIZE
}