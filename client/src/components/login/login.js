//user login
import React from 'react';
import Header from "../header/header";
import { Alert, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { Store } from '../../models/store';

const superagent = require('superagent');
var _ = require('lodash');

export class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            // isAuthenticated: Store.isAuthenticated
            isAuthenticated: false,
            userName: '',
            password: '',
            loginErr: false
        };
    } 

    componentDidMount(){
        // const url = "https://lms-fleet-pro.herokuapp.com/api/list";
        // superagent.get(url).end((err, res) => {
        //     if(err){
        //         throw err;
        //     }
        //     const data = JSON.parse(res.body);
        //     console.log("Response: ", data);
        //     if(data.activeUser){
        //         Store.activeUser = data.activeUser;
        //     }
        // });
    }
    componentWillUnmount(){
        const activeUserApi = "https://lms-fleet-pro.herokuapp.com/api/user";
        superagent.post(activeUserApi).send({ name: this.state.userName }).set('accept', 'json').end((err, res) => {
            // Calling the end function will send the request
            console.log("User request: ", res, err);
        });
    }
    handleChange = e => {
        this.setState({
          [e.target.id]: e.target.value
        });
      }

    handleSubmit = (e) => {
        e.preventDefault();
        const url = "https://lms-fleet-pro.herokuapp.com/api/list";
        superagent.get(url).end((err, res) => {
            if(err){
                throw err;
            }
            const data = JSON.parse(res.body);

            console.log("data: ", data.users, " && ", this.state.userName);
            let getUser = _.find(data.users, ['name', this.state.userName]);
            console.log("getUser: ", getUser.password);
            if(!getUser || getUser.password !== this.state.password){
                this.setState({
                    isAuthenticated: false,
                    loginErr: true
                });
            }
            else{
                this.setState({
                    isAuthenticated: true,
                    loginErr: false
                });

                Store.activeUser = getUser.name;
                
            }
            

        });
 
    };
    
    render() {
        if(this.state.isAuthenticated === true){
            return <Redirect to='/dashboard' />;
        }
        return (
            <div>
                <Header name="Guest" />
                
                <Container>
                    <Row>
                        <Col>&nbsp;</Col>
                    </Row>
                    {this.state.loginErr ? <Alert variant="danger">
                        <Row>
                            <Col xs lg="12">Please enter valid credentials!</Col>
                        </Row>
                    </Alert> : ''}
                    
                    
                    <Row>
                        <Col lg="4"></Col>
                        <Col lg="4">
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId="userName">
                                <Form.Label>Username</Form.Label>
                                <Form.Control autoFocus type="text" placeholder="Enter name" required value={this.state.userName} onChange={this.handleChange} />
                            </Form.Group>

                            <Form.Group controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Password" required  onChange={this.handleChange} />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                            </Form>
                        </Col>
                        <Col lg="4"></Col>
                    </Row>
                </Container>
            </div>
        );

    }
}
