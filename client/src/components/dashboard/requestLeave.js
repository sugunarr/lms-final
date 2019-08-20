import React from 'react';
import { Link} from 'react-router-dom';
import Header from "../header/header";
import "../../App.css"
import { Alert, Badge, Container, Row, Col, Table , Form, Button} from 'react-bootstrap';
import {Store} from '../../models/store';
import { inject, observer } from "mobx-react";

const dateFormat = require('dateformat');

const superagent = require('superagent');
let _ = require('lodash');

var Dashboard = inject("Store")(
    observer(
class Dashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            empid: '',
            empName: '',
            department: '',
            role: '',
            userDetails: {},
            appliedLeaves: [],
            minDate: new Date().toISOString().split("T")[0],
            reason: '',
            dateOn: '',
            applied: false,
            availableLeaves: 0,
            limitExceeds: false
        };
    }

    handleChange = e => {
        this.setState({
          [e.target.id]: e.target.value
        });
      }

    handleSubmit = (e) => {
        e.preventDefault();
        if(this.state.availableLeaves > 0){
            const url = "http://localhost:3000/api/apply";
            console.log("UserDetails: ", this.state.department);
            superagent.post(url).send({ requestedBy: this.state.empName, empid: this.state.empid, department: this.state.department, reason: this.state.reason, requestedOn: dateFormat(this.state.dateOn, "mediumDate") }).set('accept', 'json').end((err, res) => {
                // Calling the end function will send the request
                console.log("User request: ", res);
                const data = JSON.parse(res.text);
                console.log("Response: ", data);
                this.setState({
                    applied: true,
                    availableLeaves: data.leave,
                    reason: '',
                    dateOn: ''
                })
            });
        }
        else{
            this.setState({
                limitExceeds: true,
                reason: '',
                dateOn: ''
            })
        }
        
    };

    componentDidUpdate(){
        console.log("Component Updated!!");
    }

      componentDidMount(){
        const url = "http://localhost:3000/api/list";
        superagent.get(url).end((err, res) => {
            if(err){
                throw err;
            }
            const data = JSON.parse(res.body);
            console.log("Response: ", data);
            if(data.activeUser){
                Store.activeUser = data.activeUser;
                let getUser = _.find(data.users, ['name', data.activeUser]);
                let userRole = getUser.role;
                let empid = getUser.empid;
                let _empName = getUser.name;
                let _department = getUser.department;
                console.log("getUser: ", getUser, empid);
                let getUserDetails = _.find(data[userRole], ['empid', empid]);
                if(userRole == "employee"){

                // console.log("getUserDetails: ", getUserDetails.availableLeave);
                    let empLeaves = getUserDetails.appliedLeaves;
                    this.setState({
                        appliedLeaves: (this.state.appliedLeaves).concat(empLeaves),
                        availableLeaves: getUserDetails.availableLeave
                    });
                    
                }
                this.setState({
                    role: userRole,
                    userDetails: getUserDetails,
                    empid: getUser.empid,
                    empName: _empName,
                    department: _department
                });
                Store.userDetails = getUserDetails;
            }
        });
    }
    
    render() {
        
        return (
            <div>
                
                
            <Header name="test" logout="logout" />
            <Container>
                <Row>
                    <Col>&nbsp;</Col>
                </Row>
                 <Alert variant="secondary">
                    <Row>
                        <Col xs lg="10">Available number of leave</Col>
                        <Col xs lg="2">{this.state.availableLeaves}</Col>
                    </Row>
                </Alert> 
                {this.state.limitExceeds ? <Alert variant="danger">
                    Leaves not available in your basket! Please contact your manager.
                </Alert> : ''}
                <Alert>
                    <Row>
                        <Col xs lg="10" className="heading2">
                        <h4>Apply for leave</h4>
                        </Col>
                        <Col xs lg="2">
                            <Link to="/dashboard">
                                <Button>Dashboard</Button>
                            </Link>
                        </Col>
                    </Row>
                </Alert>
                <Row>
                    <Col lg={1}>&nbsp;</Col>
                    <Col lg={4}>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Group controlId="dateOn">
                            <Form.Label>Date</Form.Label>
                            <Form.Control type="date" placeholder="Choose a date" min={this.state.minDate} required autoFocus value={this.state.dateOn} onChange={this.handleChange} />
                        </Form.Group>

                        <Form.Group controlId="reason">
                            <Form.Label>Reason</Form.Label>
                            <Form.Control type="text" placeholder="Reason" required value={this.state.reason} onChange={this.handleChange} />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                        </Form>
                    </Col>
                    <Col lg={7}>&nbsp;</Col>
                </Row>
            </Container>
            </div>
            
        );

    }
}
)
)
export default Dashboard;