var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
console.log(req.user);
  res.render('shake', { user: req.user });
});

module.exports = router;
