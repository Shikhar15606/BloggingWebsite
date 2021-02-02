const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
router.get("/", (req, res) => {
    if (!req.session.user) {
        res.status(200).render('home',{l:0,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
      } 
    else {
        res.status(200).render('home',{l:1,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
    }
});
router.get("/home", (req, res) => {
    if (!req.session.user) {
        res.status(200).render('home',{l:0,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
      } 
    else {
        res.status(200).render('home',{l:1,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
    }
});

router.get('/dashboard', (req, res) => {
    if (req.session.user)
      res.status(200).send(req.session.user)
    else
      res.status(401).send('login for this');
  });
  router.get("/about", (req, res) => {
    if (!req.session.user) {
        res.status(403).render("about",{user: req.session.user,l:0});
      } 
    else {
        res.status(403).render("about",{user: req.session.user,l:1});
    }
});
router.get("/blog", (req, res) => {
    if (!req.session.user) {
        res.status(403).render("blog",{user: req.session.user,l:0});
      } 
    else {
        res.status(403).render("blog",{user: req.session.user,l:1});
    }
});
// router.get("/contact", (req, res) => {
//     if (!req.session.user) {
//         res.status(403).render("contact",{user: req.session.user,l:0});
//       } 
//     else {
//         res.status(403).render("contact",{user: req.session.user,l:1});
//     }
// });
router.get("/sponsors", (req, res) => {
     if (!req.session.user) {
        res.status(403).render("sponsors",{user: req.session.user,l:0});
      } 
    else {
        res.status(403).render("sponsors",{user: req.session.user,l:1});
    }
});

module.exports = router