import React from 'react';
import {Navbar} from 'react-bootstrap';
import {Store} from '../../models/store';
import { inject, observer } from "mobx-react";

const superagent = require('superagent');

var Header = inject("Store")(
    observer(
class Header extends React.Component {
    constructor(props){
        super(props);
    }

    logoutHandler = () => {
        // Store.activeUser = "Guest";
        const activeUserApi = "http://localhost:3000/api/user";
        superagent.post(activeUserApi).send({ name: "Guest" }).set('accept', 'json').end((err, res) => {
            // Calling the end function will send the request
            console.log("User request: ", res, err);
        });
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
            }
        });
    }
    render() {
        return (
            <div>
                <Navbar bg="light" variant="light">
                    <Navbar.Brand href="/">Company Name</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                            Signed in as: {Store.activeUser} | <a href="/" onClick={this.logoutHandler}>{this.props.logout}</a>
                        </Navbar.Text>
                        <Navbar.Text>
                            
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Navbar>
            </div>
            );
            
    }
}
)
)

export default Header;