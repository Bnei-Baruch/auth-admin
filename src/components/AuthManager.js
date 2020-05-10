import React, { Component } from 'react';
import {Button, Container, Segment, Select, Table, Icon, Input} from "semantic-ui-react";
import {getAuthData} from "../shared/tools";
import {AUTH_API_APPR, AUTH_API_USERS} from "../shared/env";

class AuthManager extends Component {

    state = {
        users: [],
        selected_user: "",
        disabled: true,
        loading: true,
        input: "",
    };

    componentDidMount() {
        getAuthData(`${AUTH_API_USERS}`, (users) => {
            this.setState({users});
        });
    };

    selectUser = (user) => {
        this.setState({selected_user: user});
    }

    approveUser = () => {
        const {selected_user,users} = this.state;
        console.log(selected_user);
        getAuthData(`${AUTH_API_APPR}/${selected_user}`, (response) => {
            for (let i = 0; i < users.length; i++) {
                if (users[i].id === selected_user) {
                    users.splice(i, 1);
                    this.setState({selected_user: "",users});
                    break;
                }
            }
            alert(response.result);
        });
    }

    setRequest = () => {
        const {input} = this.state;
        console.log(input);
    }

    render() {
        const {users,selected_user,input} = this.state;

        let users_list = users.map((data, i) => {
            const { id, email } = data;
            return ({ key: i, text: email, value: id });
        });

        let users_content = users.map(user => {
            const {id,firstName,lastName,emailVerified,email} = user;
            return (
                <Table.Row key={id}
                           active={id === selected_user}
                           negative={!emailVerified}
                           onClick={() => this.selectUser(id)} >
                    <Table.Cell>{<Icon name={emailVerified ? 'checkmark' : 'close'} />} - {email}</Table.Cell>
                    <Table.Cell>{firstName}</Table.Cell>
                    <Table.Cell>{lastName}</Table.Cell>
                </Table.Row>
            )
        })

        return (
            <Container fluid >
                <Segment.Group horizontal>
                    <Segment>
                        <Select
                            search
                            error={!selected_user}
                            value={selected_user}
                            options={users_list}
                            placeholder='Select user'
                            onChange={(e, { value }) => this.selectUser(value)} />
                        <Button color='red' disabled={!selected_user} onClick={this.approveUser}>Approve</Button>
                    </Segment>
                    <Segment>
                        <Input type='text' placeholder='Type mail...' action
                               value={input} onChange={e => this.setState({input:e.target.value})}>
                            <input />
                            <Button positive type='submit' disabled={input === ""} onClick={this.setRequest}>Request</Button>
                        </Input>
                    </Segment>
                </Segment.Group>
                <Segment textAlign='center' className="group_list" raised>
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={2}>Email</Table.Cell>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={3}>Last Name</Table.Cell>
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
            </Container>
        );
    }
}

export default AuthManager;