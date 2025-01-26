const {Router} = require('express');
const {index} = require('../controllers/countryController');

const router = Router();

router.get('/', index);

module.exports = router;