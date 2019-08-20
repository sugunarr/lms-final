import React from 'react';
import Header from "../header/header";
import "../../App.css"
import { Alert, Badge, Container, Row, Col, Table } from 'react-bootstrap';
import {Store} from '../../models/store';
import { inject, observer } from "mobx-react";
import update from 'react-addons-update';

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
            role: '',
            userDetails: {},
            appliedLeaves: [],
            requestedLeaves: []
        };
    }

    handleCancel = e => {
        console.log(e.target.value);
        console.log("Applied Leaves: ", this.state.appliedLeaves);
        // let getUserDetails = _.find(this.state.appliedLeaves, ['id', e.target.value]);
        let users = this.state.appliedLeaves;
        const cancelReq = "http://localhost:3000/api/cancel";
        superagent.post(cancelReq).send({ reqId: e.target.value, empid: this.state.empid }).set('accept', 'json').end((err, res) => {
            // Calling the end function will send the request
            console.log("User request: ", res, err);
            
            let index = _.findLastIndex(this.state.appliedLeaves, function(o) { return o.id == res.text; });
            let _state = JSON.parse(JSON.stringify(this.state.appliedLeaves));
            _state[index].status = "Canceled";
            let _updateLeave = this.state.userDetails;
            _updateLeave.availableLeave = this.state.userDetails.availableLeave+1
            this.setState({
                appliedLeaves:_state,
                userDetails: _updateLeave
                })
        });
      }

      handleAction = e => {
        console.log(e.target.id);
        let _getTarget = e.target.id;
        let _getId = _getTarget.split('-');
        const _actionApi = "http://localhost:3000/api/action/"+e.target.value;
        superagent.post(_actionApi).send({ reqId: _getId[0], empName: _getId[1] }).set('accept', 'json').end((err, res) => {
            // Calling the end function will send the request
            console.log("User request: ", res, err);
            
            let index = _.findLastIndex(this.state.requestedLeaves, function(o) { return o.id == res.text; });
            let _state = JSON.parse(JSON.stringify(this.state.requestedLeaves));
            if(_getTarget !== 1){
                _state[index].approvalStatus = "Rejected";
                // _state[index].status = "Rejected";
            }
            
            this.setState({
                requestedLeaves:_state,
                // userDetails: _updateLeave
                })
        });
      }

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
            console.log("Response: ", data.activeUser);
            if(data.activeUser){
                Store.activeUser = data.activeUser;
                let getUser = _.find(data.users, ['name', data.activeUser]);
                let userRole = getUser.role;
                let empid = getUser.empid;
                // console.log("getUser: ", userRole, empid);
                let getUserDetails = _.find(data[userRole], ['empid', empid]);
                if(userRole === "employee"){

                // console.log("getUserDetails: ", getUserDetails.appliedLeaves);
                    let empLeaves = getUserDetails.appliedLeaves;
                    this.setState({
                        appliedLeaves: (this.state.appliedLeaves).concat(empLeaves)
                    });
                    
                }
                else{
                    // let empLeaves = getUserDetails.appliedLeaves;
                    // this.setState({
                    //     requestedLeaves: (this.state.requestedLeaves).concat(empLeaves)
                    // });
                    let _groupDepartment = _.groupBy(data.manager, 'department');
                    let _arr = _groupDepartment[getUser.department];
                    console.log("getUser: ", _arr);
                    this.setState({
                        requestedLeaves: (this.state.requestedLeaves).concat(_arr)
                    });
                }
                this.setState({
                    role: userRole,
                    userDetails: getUserDetails,
                    empid: getUser.empid
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
                {this.state.role === "employee" ? <Alert variant="secondary">
                    <Row>
                        <Col xs lg="10">Available number of leave</Col>
                        <Col xs lg="2">{this.state.userDetails.availableLeave}</Col>
                    </Row>
                </Alert> : ''}
                
                <Alert>
                    <Row>
                        <Col xs lg="10" className="heading2">
                            {this.state.role === "employee" ?
                                <h4>Leave Application List</h4> :
                                <h4>Leave Application Request List</h4>
                            }
                        </Col>
                        <Col xs lg="2">
                        {this.state.role === "employee" ?
                            <Badge variant="primary">
                                <a href="/apply">Apply for leave</a>
                            </Badge> : ''}
                        </Col>
                    </Row>
                </Alert>
                <Row>
                    <Col>
                        <Table striped bordered hover>
                            <thead>
                                {
                                    this.state.role === "employee" ? 
                                    <tr>
                                    <th>Date</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr> : <tr>
                                    <th>User</th>
                                    <th>Date</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                }
                                
                            </thead>
                            <tbody>
                                {
                                    // console.log("State: ", this.state.appliedLeaves)
                                    this.state.role === "employee" ? 
                                    this.state.appliedLeaves.map((list, index) => {
                                        return <tr key={index}>
                                            <td>{dateFormat(list.appliedOn, "mediumDate")}</td>
                                            <td>{list.appliedFor}</td>
                                            <td><Badge variant={list.status === "Applied" 
                                                                                ? "primary" 
                                                                                : list.status === "Approved" 
                                                                                ? "success" 
                                                                                : list.status === "Canceled" 
                                                                                ? "warning" 
                                                                                : "danger"}>
                                            {list.status}
                                                </Badge></td>
                                            <td>{list.status === "Applied" ? <Badge variant="danger">
                                                    <button value={list.id} onClick={this.handleCancel}>Cancel</button>
                                                </Badge> : ""}</td>
                                        </tr>
                                    }) : this.state.requestedLeaves.map((list, index) => {
                                        return <tr key={index}>
                                            <td>{list.requestedBy}</td>
                                            <td>{dateFormat(list.requestedOn, "mediumDate")}</td>
                                            <td>{list.reason}</td>
                                            <td><Badge variant={list.approvalStatus === "Approved" 
                                                                                ? "success" 
                                                                                : list.approvalStatus === "Applied"
                                                                                ? "primary"
                                                                                : "danger"}>
                                            {list.approvalStatus !== "Applied" ? list.approvalStatus : ''}
                                                </Badge></td>
                                            <td>{list.approvalStatus === "Applied" ? <div><Badge variant="success">
                                                    <button value='1' id={list.id+'-'+list.requestedBy} data={list.requestedBy} onClick={this.handleAction}>Approve</button>
                                                </Badge> <Badge variant="danger">
                                                    <button value='2' id={list.id+'-'+list.requestedBy} data={list.requestedBy} onClick={this.handleAction}>Reject</button> </Badge></div> : ""}
                                                </td>
                                        </tr>
                                        }) 
                                }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
            </div>
            
        );

    }
}
)
)
export default Dashboard;