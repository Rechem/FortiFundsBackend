const Ressource = require('../models/roles_permissions/ressource')
const Role = require('../models/role')
const Permission = require('../models/roles_permissions/permission')

const verifyPermission = (nomRessource) => async (req, res, next) => {
    console.log(req.path)
    if (req.user) {
        const ressource = await Ressource.findOne({ where: { nomRessource } })
        const role = await Role.findOne({ where: { nomRole: req.body.user.role } })
        const permission = await Permission.findOne({
            where: {
                idRole: role.idRole,
                idRessource: ressource.idRessource
            }
        })

        let allow = false;

        if (req.method == "POST") {
            if (permission.create)
                allow = true;
            if (permission.checkOwnerCreate && allow) {
                ownerId = req.entity.getOwnerId()
                allow = ownerId === req.body.user.idUser && allow
            }
        }
        else if (req.method == "GET") {
            if (permission.read)
                allow = true;
            if (permission.checkOwnerRead && allow) {
                console.log("we here");
                ownerId = req.entity.getOwnerId()
                allow = ownerId === req.body.user.idUser && allow
            }
        }
        else if (req.method == "PUT") {
            if (permission.write)
                allow = true;
            if (permission.checkOwnerUpdate && allow) {
                ownerId = req.entity.getOwnerId()
                allow = ownerId === req.body.user.idUser && allow
            }
        }
        else if (req.method == "DELETE") {
            if (permission.delete)
                allow = true;
            if (permission.checkOwnerDelete && allow) {
                ownerId = req.entity.getOwnerId()
                allow = ownerId === req.body.user.idUser && allow
            }
        }

        if (!allow)
        res.status(403).send({ status: "erreur", message: "You dont't have the rights" });
    } else res.status(401).json({ status: "erreur", message: "Unathorized, please login" });
}

module.exports = verifyPermission