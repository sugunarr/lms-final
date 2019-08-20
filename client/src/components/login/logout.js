//user login
import React from 'react';
import { Header } from "../header/header";
import { Alert, Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { inject, observer } from "mobx-react";

const superagent = require('superagent');

var Logout = inject("Store")(
    observer(
 class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            isAuthenticated: false
        };

    } 

    componentDidMount(){
        const url = "https://lms-fleet-pro.herokuapp.com/api/list";
        superagent.get(url).end((err, res) => {
            // Do something
            if(err){
                throw err;

            }
            console.log(JSON.parse(res.body));
            window.location = 'https://lms-fleet-pro.herokuapp.com/'
          });

          this.setState({
            isAuthenticated: true
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        
    };
    
    render() {
        
        return (
            <div>
                <Header name={this.props.name} />
                <Container>
                    <Row>
                        <Col>&nbsp;</Col>
                    </Row>
                    <Alert variant="secondary">
                        <Row>
                            <Col xs lg="12">Please enter valid credentials!</Col>
                        </Row>
                    </Alert>
                    
                    <Row>
                        <Col lg="4"></Col>
                        <Col lg="4">
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" placeholder="Enter name" required />
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Password" required />
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
)
)

export default Logout;