var express = require("express");
var app = express();
var session = require("express-session");
var bodyparser = require("body-parser");
var mysqlConnection = require("./model/db");


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));


app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));




app.get("/home", function(req, res) {
    var signIn = "Sign In";
    var login = "/login";
    var home = "#";
    var studentinfo = "";
    var paymentinfo = "";
    var addpayment = "";
    var reglink = " <a class='nav-link ' href='/register'> Register </a>";
    res.render("home", { signIn: signIn, login: login, home: home, studentinfo: studentinfo, paymentinfo: paymentinfo, addpayment: addpayment, reglink: reglink });
});

app.get("/home/signedin/admin", function(req, res) {
    var signIn = "Welcome";
    var home = "#";
    var login = "#";
    var studentinfo = "<a class='nav-link' href='/adminstudentinfo'>Student Information</a>";
    var paymentinfo = "<a class='nav-link' href='/paymentinfo'>Paymentinfo</a>";
    var addpayment = "<a class='nav-link' href='/payform'>Add Payments</a>";

    var reglink = "";
    res.render("home", { signIn: signIn, login: login, studentinfo: studentinfo, paymentinfo: paymentinfo, addpayment: addpayment, home: home, reglink: reglink });
});

app.get("/home/signedin/student", function(req, res) {
    var signIn = "Welcome";
    var login = "#";
    var home = "#";
    var studentinfo = "";
    var paymentinfo = "";
    var addpayment = "";
    var reglink = "<a class='nav-link ' href='/mypayments'> My payments </a>";
    res.render("home", { signIn: signIn, login: login, studentinfo: studentinfo, paymentinfo: paymentinfo, addpayment: addpayment, home: home, reglink: reglink });
});

app.get("/mypayments", function(req, res) {
    mysqlConnection.query("SELECT payments.PaymentId,payments.Month,payments.Amount,student_information.FirstName FROM payments INNER JOIN student_information ON payments.StudentId=student_information.StudentId WHERE student_information.username ='" + req.session.username + "'", function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.render("mypayments", { mypayment: result, username: req.session.username });
        }
    });

});



app.get("/login", function(req, res) {
    //shows the login page
    res.render("login");
});

app.post("/login/auth", function(req, res) {

    //take details from the form
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        mysqlConnection.query('SELECT*FROM logininfo WHERE UserName = ? AND Password = ? ', [username, password], function(err, results) {
            if (err) throw err;
            if (results.length > 0) {

                req.session.loggedin = true;
                req.session.username = username;
                if (results[0].Admin === 2) {
                    res.redirect("/home/signedIn/admin");
                } else {
                    res.redirect("/home/signedIn/student");
                }

            } else {

                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
    //redirect to home page
});

app.get("/register", function(req, res) {
    res.render("register");

});

app.post("/register", function(req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var birthday = req.body.birthday;
    var guardian = req.body.guardian;
    var mobileNo = req.body.mobileNo;
    var school = req.body.school;
    var grade = req.body.grade;
    var email = req.body.email;
    var cpassword = req.body.cpassword;
    // var index = req.body.index;
    mysqlConnection.query("Insert into student_information (FirstName,LastName,Birthday,GuardianName,MobileNumber,School,Grade,Username) VALUES ('" + firstName + "','" + lastName + "','" + birthday + "','" + guardian + "','" + mobileNo + "','" + school + "'," + grade + ",'" + email + "')", function(err, result) {
        if (err) throw err;

    });
    mysqlConnection.query("Insert into logininfo (UserName,Password)  VALUES ('" + email + "','" + cpassword + "')", function(err, result) {
        if (err) console.log(err);
    });
    res.redirect("/home");
});

app.get("/adminstudentinfo", function(req, res) {
    mysqlConnection.query("SELECT * FROM student_information ",
        function(err, result) {
            if (err) {
                console.log(err);
            } else {

                res.render("adminstudentinfo", { studentinfo: result });
            }
        });
});

app.post("/delete/:id", function(req, res) {
    var id = req.params.id;

    mysqlConnection.query("DELETE FROM student_information WHERE StudentId =" + id,
        function(err, result) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/adminstudentinfo");
            }
        });
});

app.post("/update/:user", function(req, res) {
    var user = req.params.user;
    var FirstName = req.body.FirstName;
    var LastName = req.body.LastName;
    var Username = req.body.Username;
    var Birthday = req.body.Birthday;
    var GuardianName = req.body.GuardianName;
    var MobileNumber = req.body.MobileNumber;
    var School = req.body.School;
    var Grade = req.body.Grade;

    //console.log(req);

    mysqlConnection.query("UPDATE student_information SET FirstName='" + FirstName + "',LastName='" + LastName + "',Username='" + Username + "',Birthday='" + Birthday + "',GuardianName='" + GuardianName + "',MobileNumber='" + MobileNumber + "',School='" + School + "',Grade='" + Grade + "'  WHERE Username='" + user + "'", function(err, results) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/adminstudentinfo");
        }
    });
});

app.get("/payform", function(req, res) {
    res.render("payform");
});

app.post("/payform", function(req, res) {
    var username = req.body.username;
    var amount = req.body.amount;
    var date = new Date();
    var month = req.body.month;
    var body1;
    var msg = "done";

    mysqlConnection.query("SELECT StudentId FROM student_information where UserName='" + username + "'", function(err, result1) {
        if (err) {
            console.log(err);
        } else {
            console.log(result1);
            mysqlConnection.query("Insert into payments (Amount,Month,StudentId) VALUES ('" + amount + "','" + month + "'," + result1[0].StudentId + ")", function(err, result2) {
                if (err) {
                    console.log(err);
                } else {


                    res.redirect("payform");
                }
            });
        }
    });


});

app.get("/paymentinfo", function(req, res) {
    mysqlConnection.query("SELECT payments.PaymentId,payments.Month,payments.Amount,student_information.FirstName,student_information.LastName FROM payments INNER JOIN student_information ON payments.StudentId=student_information.StudentId", function(err, result) {
        if (err) {
            console.log(err);
        } else {
            // console.log(result);
            res.render("paymentinfo", { paymentinfo: result });
        }
    })
});

app.get("/monthlypayments", function(req, res) {
    res.render("monthlypayments");
});

app.post("/month", function(req, res) {
    var month = req.body.month;
    mysqlConnection.query("SELECT FirstName,MobileNumber,Grade FROM student_information WHERE StudentId not in (SELECT DISTINCT StudentId FROM payments WHERE Month='" + month + "' )", function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.render("monthlypayments", { studentpayinfo: result, selectedmonth: month });
        }

    });

})

// app.get("/search", function(req, res) {
//     res.render("paymentinfo")
// });

// app.post("/search", function(req, res) {

// });

app.listen("3000", function() {
    console.log("Connected");
});