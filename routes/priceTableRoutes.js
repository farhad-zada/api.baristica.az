const {Router} = require('express');
const {getPriceTable} = require('../controllers/priceTableController');

const router = Router();

router.post('/', getPriceTable);

module.exports = router;