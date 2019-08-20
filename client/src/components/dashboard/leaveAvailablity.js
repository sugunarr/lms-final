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

var Leaves = inject("Store")(
    observer(
class Leaves extends React.Component {
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

    componentDidMount(){
        const url = "http://localhost:3000/api/list";
        superagent.get(url).end((err, res) => {
            if(err){
                throw err;
            }
            const data = JSON.parse(res.body);
            console.log("Response: ", data.activeUser);
            if(data.activeUser){
                let getUser = _.find(data.users, ['name', data.activeUser]);
                
                let availableLeave = getUser.availableLeave;
                

                    this.setState({
                        leaveAvailable: availableLeave
                    });
                    
            }
        });
    }

    
    render() {
        
        return (
            <div>
                
            <Alert variant="secondary">
                    <Row>
                        <Col xs lg="10">Available number of leave</Col>
                        <Col xs lg="2">{this.state.leaveAvailable}</Col>
                    </Row>
                </Alert> 
                </div>
            
        );

    }
}
)
)
export default Leaves;