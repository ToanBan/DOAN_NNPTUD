var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: 'Users API OK' });
});

module.exports = router;