import React, { Component } from 'react';
import { Container, Message,Image } from 'semantic-ui-react';
import logo from './logo.png';

class VhHome extends Component {

    state = {
        disabled: true,
        loading: true,
    };

    render() {

        return (
            <Container textAlign='center' >
                <Message size='massive'>
                    <Message.Header>Virtual Home Service</Message.Header>
                    <br/>
                    <Image src={logo} centered />
                </Message>
            </Container>
        );
    }
}

export default VhHome;
