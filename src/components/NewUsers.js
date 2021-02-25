import React, { Component } from 'react';
import {Button, Container, Segment, Select, Table, Icon, Menu} from "semantic-ui-react";
import {getAuthData} from "../shared/tools";
import {AUTH_API, NEWUSERS_ID} from "../shared/env";

class NewUsers extends Component {

    state = {
        users: [],
        pending_users: [],
        request_users: [],
        selected_user: "",
        disabled: true,
        loading: true,
        input: "",
    };

    componentDidMount() {
        getAuthData(`${AUTH_API}/users/${NEWUSERS_ID}?first=0&max=10000`, (users) => {

            users.sort((a, b) => {
                if (a.createdTimestamp < b.createdTimestamp) return 1;
                if (a.createdTimestamp > b.createdTimestamp) return -1;
                return 0;
            });

            this.setState({users, loading: false});
        });
    };

    selectUser = (user) => {
        this.setState({selected_user: user});
    }

    approveUser = () => {
        const {selected_user,users} = this.state;
        console.log(selected_user);
        getAuthData(`${AUTH_API}/approve/${selected_user}`, (response) => {
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

    removeUser = () => {
        const {selected_user,users} = this.state;
        console.log(selected_user);
        getAuthData(`${AUTH_API}/remove/${selected_user}`, (response) => {
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
        const {users,selected_user,loading} = this.state;

        let users_list = users.map((data, i) => {
            const { id, email } = data;
            return ({ key: i, text: email, value: id });
        });

        let users_content = users.map(user => {
            const {id,firstName,lastName,emailVerified,email,createdTimestamp} = user;
            const reg_time = new Date(createdTimestamp).toUTCString();
            return (
                <Table.Row key={id}
                           active={id === selected_user}
                           negative={!emailVerified}
                           onClick={() => this.selectUser(id)} >
                    <Table.Cell>{<Icon name={emailVerified ? 'checkmark' : 'close'} />} - {email}</Table.Cell>
                    <Table.Cell>{firstName}</Table.Cell>
                    <Table.Cell>{lastName}</Table.Cell>
                    <Table.Cell>{reg_time}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Container fluid >
                <Menu size='large' secondary>
                    <Menu.Item>
                        <Select
                            search
                            error={!selected_user}
                            value={selected_user}
                            options={users_list}
                            placeholder='Search...'
                            onChange={(e, { value }) => this.selectUser(value)} />
                    </Menu.Item>
                    <Menu.Menu position='left'>
                        <Menu.Item>
                            <Button color='green' disabled={!selected_user} onClick={this.approveUser}>Approve</Button>
                        </Menu.Item>
                        <Menu.Item>
                        </Menu.Item>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='red' disabled={!selected_user} icon='close' onClick={this.removeUser} />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Segment textAlign='center' className="group_list" raised loading={loading} >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={3}>Email</Table.Cell>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={3}>Reg Time</Table.Cell>
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
            </Container>
        );
    }
}

export default NewUsers;