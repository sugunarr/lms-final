const express = require('express'),
bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const corsOptions = {
  origin: 'https://lms-fleet-pro.herokuapp.com/',
  //origin: 'https://suguna.herokuapp.com/',
  optionsSuccessStatus: 200
}

const app = express();
// const JSON = require('circular-json');
var _ = require('lodash');

app.use(bodyParser.json());


app.use(cors(corsOptions));
app.options('*', cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000/"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// Put all API endpoints under '/api'
app.get('/api/list', (req, res) => {
  
    fs.readFile('./data/data.json', 'utf8', (err, data) => {
        if (err) {
            console.log("File read failed:", err);
            return;
        }
        // console.log('File data:', data);

        res.json(data);
    })
  // Return them as json

});
app.post('/api/user', (req, res) => {

    fs.readFile('./data/data.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        let users = JSON.parse(data);
        users.activeUser= req.body.name;

        console.log(users);
    
        fs.writeFile('./data/data.json', JSON.stringify(users), 'utf-8', function(err) {
            if (err) throw err
            console.log('Done!')
        })
    });
    
    res.send(req.body.name + " Active user added!");

});
app.post('/api/apply', (req, res) => {
    let _generateId = Math.floor((Math.random() * 999) + 100);
    var _obj = {
        requestedBy: req.body.requestedBy,
        department: req.body.department,
        requestedOn: req.body.requestedOn,
        reason: req.body.reason,
        approvalStatus: "Applied",
        id: _generateId
    };

    var _objEmp = {
        appliedOn: req.body.requestedOn,
        appliedFor: req.body.reason,
        status: "Applied",
        id: _generateId
    };

    let empId = req.body.empid;
    // {
    //     "appliedOn": "Sun Feb 28 2010 05:30:00 GMT+0530 (IST)",
    //     "appliedFor": "Personal Work",
    //     "status": "Applied",
    //     "id": "002"
    //   },
    fs.readFile('./data/data.json', 'utf8', function(err, data){
        if (err){
            console.log(err);
        } 
        let user = JSON.parse(data); //now it an object
        user.manager.push(_obj); //add some data
        let findEmp = _.filter(user.employee, function(o) { return o.empid == empId; });
        // // user.employee.empid= req.body.name;
        // let cancelReq = _.filter(findEmp[0].appliedLeaves, function(x) { return x.id == reqId; });
        console.log("findEmp", findEmp);
        // cancelReq[0].status = "Canceled";
        findEmp[0].availableLeave = findEmp[0].availableLeave-1;
        // findEmp[0].availableLeave = _availableLeave;
        findEmp[0].appliedLeaves.push(_objEmp);
        fs.writeFile('./data/data.json', JSON.stringify(user), 'utf8', function(err, data){
            if (err)throw err
            console.log("Done!");
             }); // write it back 

        res.send({leave: findEmp[0].availableLeave});
    });
    
    // res.send(_obj.approvalStatus);

});
app.post('/api/cancel', (req, res) => {
    let empId = req.body.empid;
    let reqId = req.body.reqId;
    fs.readFile('./data/data.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        let user = JSON.parse(data);
        let findEmp = _.filter(user.employee, function(o) { return o.empid == empId; });
        // user.employee.empid= req.body.name;
        let cancelReq = _.filter(findEmp[0].appliedLeaves, function(x) { return x.id == reqId; });
        console.log("findEmp", findEmp[0].availableLeave+1);
        cancelReq[0].status = "Canceled";
        findEmp[0].availableLeave = findEmp[0].availableLeave+1;

        let findReq = _.filter(user.manager, function(o) { return o.id == reqId; });
        console.log("findReq: ", findReq[0]);
        findReq[0].department = "";
    
        fs.writeFile('./data/data.json', JSON.stringify(user), 'utf-8', function(err) {
            if (err) throw err
            console.log('Done!')
        })
    });
    
    res.send(reqId);

});
app.get('/api/add', (req, res) => {
    const user = {
        name: "testuser6",
        password: "test",
        empid: "ID0006",
        department: "Marketing",
        role: "employee"
    };
    fs.readFile('./data/data.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        let arrayOfObjects = JSON.parse(data)
        arrayOfObjects.users.push(user);
    
        console.log(arrayOfObjects)
    
        fs.writeFile('./data/data.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
            if (err) throw err
            console.log('Done!')
        })
    })
    res.send("User Added!");
});
app.post('/api/action/:id', function(req, res){
    console.log(req.params);
    let empName = req.body.empName;
    let reqId = req.body.reqId;
    if(req.params.id == 1){
        fs.readFile('./data/data.json', 'utf-8', function(err, data) {
            if (err) throw err
        
            let user = JSON.parse(data);
            let findEmp = _.filter(user.users, function(o) { return o.name == empName; });
            // user.employee.empid= req.body.name;
            let _getEmp = findEmp[0].empid;
            let _groupUser = _.groupBy(user.employee, 'empid');
            let _getEmpLeaves = _groupUser[_getEmp][0].appliedLeaves;
            let cancelReq = _.filter(_getEmpLeaves, function(x) { return x.id == reqId; });
            console.log("findEmp", cancelReq);
            cancelReq[0].status = "Approved";
            findEmp[0].availableLeave = findEmp[0].availableLeave-1;
    
            let findReq = _.filter(user.manager, function(o) { return o.id == reqId; });
            // console.log("findReq: ", findReq[0]);
            findReq[0].approvalStatus = "Approved";
        
            fs.writeFile('./data/data.json', JSON.stringify(user), 'utf-8', function(err) {
                if (err) throw err
                console.log('Done!')
            })
        });
        
        res.send(reqId);
        
        // res.send("Status updated! " + req.params.id);
    }
    else{
        // res.send("Status updated! " + req.params.id);
        
        fs.readFile('./data/data.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        let user = JSON.parse(data);
        let findEmp = _.filter(user.users, function(o) { return o.name == empName; });
        // user.employee.empid= req.body.name;
        let _getEmp = findEmp[0].empid;
        let _groupUser = _.groupBy(user.employee, 'empid');
        let _getEmpLeaves = _groupUser[_getEmp][0].appliedLeaves;
        let cancelReq = _.filter(_getEmpLeaves, function(x) { return x.id == reqId; });
        console.log("findEmp", user.employee);
        cancelReq[0].status = "Rejected";
        findEmp[0].availableLeave = findEmp[0].availableLeave+1;

        let findReq = _.filter(user.manager, function(o) { return o.id == reqId; });
        // console.log("findReq: ", findReq[0]);
        findReq[0].approvalStatus = "Rejected";
    
        fs.writeFile('./data/data.json', JSON.stringify(user), 'utf-8', function(err) {
            if (err) throw err
            console.log('Done!')
        })
    });
    
    res.send(reqId);
    }
    
});
app.post('/api/logout', function(req, res){
    fs.readFile('./data/data.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        let arrayOfObjects = JSON.parse(data);
        arrayOfObjects.loggedIn= true;

        console.log(arrayOfObjects);
    
        fs.writeFile('./data/data.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
            if (err) throw err
            console.log('Done!')
        })
    });
    res.send("Logged Out Successfully!!");
});



// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Password generator listening on ${port}`);
