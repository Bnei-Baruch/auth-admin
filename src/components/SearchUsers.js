import React, { Component } from 'react';
import {Container, Segment, Table, Icon, Menu, Input, Button} from "semantic-ui-react";
import {getAuthData} from "../shared/tools";
import {AUTH_API} from "../shared/env";

class SearchUsers extends Component {

    state = {
        users: [],
        selected_user: "",
        search_user: "",
        disabled: true,
        loading: true,
        input: "",
    };

    componentDidMount() {
    };

    searchUser = () => {
        const {search_user,users} = this.state;
        console.log(search_user);
        getAuthData(`${AUTH_API}/user/${search_user}`, (response) => {
            users.push(response)
            console.log(response)
            this.setState({search_user: ""});
        });
    };

    selectUser = (user) => {
        this.setState({selected_user: user});
    }

    render() {
        const {users, selected_user, search_user} = this.state;

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
        })

        return (
            <Container fluid >
                <Menu size='large' secondary>
                    <Menu.Item>
                    </Menu.Item>
                    <Menu.Menu position='left'>
                        <Menu.Item>
                            <Input
                                error={!search_user}
                                value={search_user}
                                placeholder='Search by user id...'
                                onChange={(e, { value }) => this.setState({search_user: value})} />
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='blue' disabled={!search_user} onClick={this.searchUser}>Search</Button>
                        </Menu.Item>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                        </Menu.Item>
                        <Menu.Item>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Segment textAlign='center' className="group_list" raised >
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

export default SearchUsers;