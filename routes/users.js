const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const mySqlConnection = require("../db/db")
let user
let appointment
let username
  router.post("/register", (req, res) => {
    const { firstname, lastname, email, password, password2, phone } = req.body;
    let errors = [];
    if (!firstname || !lastname || !email || !password || !password2 || !phone) {
    errors.push({ msg: "Please enter all fields" });
    res.status(400).render('home',{l:0,all:1,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
    }
    if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
    res.status(400).render('home',{l:0,all:0,mismatch:1,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
    }
    if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
    res.status(400).render('home',{l:0,all:0,mismatch:0,plen:1,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
    }
    mySqlConnection.query(
    "SELECT * FROM users WHERE email = ? OR phone = ?",
    [email,phone],
    (err, rows) => {
    if (err) res.status(500).send(err);
    else if (rows.length)
    { errors.push({ msg: "Email already exists" });
      res.status(400).render('home',{l:0,all:0,mismatch:0,plen:0,already:1,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
    }
    if (errors.length > 0) {
    res.statusCode = 400;
    // res.send(errors);
    } else {
    pwdHash = bcrypt.hashSync(password, 10);
    var sql = `INSERT INTO users (firstname, lastname, email, phone, pwdHash) VALUES ?`;
    const values = [[firstname, lastname, email, phone, pwdHash]]
    mySqlConnection.query(sql, [values], function(err) {
    if (err) res.status(500).send(err);
    else res.status(200).render('home',{l:0,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:1})
    });
    }
    }
    );
    });

router.post("/login", (req, res) => {
    const { email, password } = req.body
    mySqlConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, rows) => {
        if (err) res.status(500).send(err)
        user = rows[0]
        if (user) {
          const result = bcrypt.compareSync(password, user.pwdHash)
          if (result) {
            req.session.user = user
            // res.status(200).redirect('/home?Login+Success');
            res.status(400).render('home',{l:1,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:1,logoutdone:0,logouterr:0,signin:0})
          } else {
            // res.status(400).send("pwd incorrect")
            res.status(400).render('home',{l:0,all:0,mismatch:0,plen:0,already:0,pinc:1,dne:0,logindone:0,logoutdone:0,logouterr:0,signin:0})
          }
        } else {
          // res.status(400).send("email doesnot exist")
          res.status(400).render('home',{l:0,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:1,logindone:0,logoutdone:0,logouterr:0,signin:0})
        }
      },
    )
  })
  router.get("/logout", (req, res) => {
    if (req.session.user) {
      req.session.destroy(() => {
        res.status(200).render('home',{l:0,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:1,logouterr:0,signin:0})
      })
    } else {
      // res.status(400).send("you are not logged in")
      res.status(400).render('home',{l:0,all:0,mismatch:0,plen:0,already:0,pinc:0,dne:0,logindone:0,logoutdone:0,logouterr:1,signin:0})
    }
  })  
//   router.get("/home", (req, res) => {
//     if (!req.session.user) {
//         res.status(403).render("home",{user: req.session.user,l:0});
//       } 
//     else {
//         res.status(403).render("home",{user: req.session.user,l:1});
//     }
// });

router.post("/contact", (req, res) => {
  if (req.session.user) {
    const { firstname, lastname, phone, email, via, why } = req.body
    let errors = []
    if (!firstname || !lastname || !phone || !email || !via || !why )
      errors.push({ msg: "Fill the complete form "})
    else {
      var sql = `INSERT INTO contactus (firstname, lastname, phone, email, via, why, userID) VALUES ?`
      const values = [
        [firstname, lastname, phone, email, via, why, req.session.user.id],
      ]

      mySqlConnection.query(sql, [values], err => {
        if (err) res.status(500).send(err)
        else res.status(200).redirect('/users/contact?Thanks+for+contacting+us');
      })
    }
  } else res.status(401).send("login to post")
})

router.get("/contact", (req, res) => {
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM contactus WHERE userID = ?",
      [req.session.user.id],
      (err, rows) => {
        if (err) res.status(500).send(err)
        req.session.contactus = rows
        appointment = rows[0]
        if(appointment) res.status(200).render('contact',{a:1,l:1})
        else res.status(200).render('contact',{a:0,l:1})
        // res.status(200).render('contact',{a:1,l:1})
        // res.status(200).send('rows')
      },
    )
  } else res.status(200).render('contact',{a:0,l:0})
})

// Blog Writing CRUD
router.post("/blog", (req, res) => {
  const x = req.session.user;
  if (x) {
    const {content,title} = req.body
    mySqlConnection.query(
      "SELECT * FROM users WHERE id = ?",
      [x.id],
      (err, rows) => {
        username = rows[0].firstname;
        if (err) res.status(500).send(err)
      }
    )
    let errors = []
    if (!username || !content || !title)
      errors.push({ msg: "Fill the complete form "})
    else {
      var sql = `INSERT INTO content (username,content,title, user_id) VALUES ?`
      const values = [
        [username,content,title, req.session.user.id],
      ]

      mySqlConnection.query(sql, [values], err => {
        if (err) res.status(500).send(err)
        else res.status(200).redirect('/users/blog?Blog+posted+successfully');
      })
    }
  } else res.status(401).send("login to post")
})

router.get("/blog", (req, res) => {
  (err,row) => {
    if (err ) console.log(err);
   }
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM content",
      (err, row) => {
        if (err) res.status(500).send(err)
        req.session.content = row;
        res.status(200).render("blog",{
          row:row, l:1
        });
      },
    )
  }  else{
    mySqlConnection.query(
      "SELECT * FROM content",
      (err, row) => {
        if (err) res.status(500).send(err)
        req.session.content = row;
        res.status(200).render("blog",{
          row:row, l:0
        });
      },
    )
  }
})

router.get("/blog/:cid", (req, res) => {
  const x= (req.params.cid)
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM content WHERE id = ?",
      [x],
      (err, rows) => {
        if (err) res.status(500).send(err)
        req.session.content = rows;
        row = rows[0];
        if(row.user_id===req.session.user.id){
          res.status(200).render("content",{
            row : row, l:1,ud:1
          });
        }
        else{
          res.status(200).render("content",{
            row : row, l:1,ud:0
          });
        }
      },
    )
  } else {
    mySqlConnection.query(
      "SELECT * FROM content  WHERE id = ?",
       [x],
      (err, rows) => {
        if (err) res.status(500).send(err)
        req.session.content = rows;
        row = rows[0];
        res.status(200).render("content",{
          row : row, l:0
        });
      },
    )
  }
})

router.get("/delete/:cid", (req, res) => {
  const x= (req.params.cid)
  if (req.session.user) {
    mySqlConnection.query(
      "SELECT * FROM content WHERE id = ?",
      [x],
      (err, rows) => {
        if (err) res.status(500).send(err)
        req.session.content = rows;
        row = rows[0];
        if(row.user_id===req.session.user.id){
          mySqlConnection.query(
            "DELETE FROM content WHERE id = ?",
            [x],
            (err, rows) => {
              if (err) res.status(500).send(err)
              res.status(200).redirect("/users/blog?blog+deleted+successfully")
            },
            )
        }
        else{
          res.status(401).send("you don't have this blog")
        }
      },
    )
  } else {
    res.status(401).send("login to perform this operation")
  }
})

// router.get("/blog/delete/:contactID", (req, res) => {
//   if (req.session.user) {
//     mySqlConnection.query(
//       "SELECT * FROM contacts WHERE contactID = ? AND userID = ?",
//       [req.params.contactID, req.session.user.userID],
//       (err, rows) => {
//         if (err) res.status(500).send(err)
//         else if (!rows.length) res.status(401).send("you don't have this contact")
//         else {
//           mySqlConnection.query(
//             "DELETE FROM contacts WHERE contactID = ?",
//             [req.params.contactID],
//             (err, rows) => {
//               if (err) res.status(500).send(err)
//               res.status(200).send(`deleted successfully`)
//             },
//             )
//           }
//         },
//         )
//       } else {
//         res.status(401).send("login to perform this operation")
//       }
//     })
router.post("/update/:cid", (req, res) => {
  let errors = []
  if (req.session.user) {
    const {content,title } = req.body
    if (!content || !title)
      errors.push({ msg: "Fill the complete form "})
    else
    {
    mySqlConnection.query(
      "UPDATE content SET content=?, title=? WHERE id = ?",
      [content, title, req.params.cid],
      (err) => {
        if (err) throw err
        else res.status(200).redirect('/users/blog?Blog+posted+successfully');
      },
    )
    }
  } else res.status(401).send("please login")
})

router.get("/write", (req, res) => {
  if (!req.session.user) {
      res.status(403).render("Login To Write a Blog");
    } 
  else {
      res.status(403).render("write",{u:0,v:null,content:null,title:null});
  }
});

router.get("/update/:cid", (req, res) => {
  if (!req.session.user) {
      res.status(403).render("Login To Write a Blog");
    } 
  else {
    var content,title;
    mySqlConnection.query(
      "SELECT * FROM content WHERE id = ?",
       [req.params.cid],
      (err, rows) => {
        if (err) res.status(500).send(err)
        content = rows[0].content;
        title = rows[0].title;
        res.status(403).render("write",{u:1,v:req.params.cid,content:content,title:title});
      },
    )
      
  }
});

module.exports = router