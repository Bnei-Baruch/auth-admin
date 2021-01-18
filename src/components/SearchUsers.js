import React, { Component } from 'react';
import {Container, Segment, Table, Icon, Menu, Input, Button} from "semantic-ui-react";
import {getAuthData} from "../shared/tools";
import {AUTH_API} from "../shared/env";

class SearchUsers extends Component {

    state = {
        users: [],
        selected_user: "",
        search_id: "",
        search_mail: "",
        disabled: true,
        loading: true,
        input: "",
    };

    componentDidMount() {
    };

    searchUser = (arg) => {
        const {search_id, search_mail, users} = this.state;
        const value = arg === "id" ? search_id : search_mail;
        console.log(value);
        getAuthData(`${AUTH_API}/search?${arg}=${value}`, (response) => {
            users.push(response)
            console.log(response)
            this.setState({search_id: "", search_mail: ""});
        });
    };

    cleanUsers = () => {
        getAuthData(`${AUTH_API}/cleanup`, (response) => {
            console.log(response);
            alert("Done");
        });
    };

    selectUser = (user) => {
        this.setState({selected_user: user});
    }

    render() {
        const {users, selected_user, search_id, search_mail} = this.state;

        let users_content = users.map(user => {
            const {id,firstName,lastName,emailVerified,email,createdTimestamp,social} = user;
            const reg_time = new Date(createdTimestamp).toUTCString();
            const reg_social = social ? social[0].identityProvider : ""
            return (
                <Table.Row key={id}
                           active={id === selected_user}
                           negative={!emailVerified}
                           onClick={() => this.selectUser(id)} >
                    <Table.Cell>{<Icon name={emailVerified ? 'checkmark' : 'close'} />} - {email}</Table.Cell>
                    <Table.Cell>{firstName}</Table.Cell>
                    <Table.Cell>{lastName}</Table.Cell>
                    <Table.Cell>{reg_time}</Table.Cell>
                    <Table.Cell>{reg_social}</Table.Cell>
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
                                error={!search_id}
                                value={search_id}
                                placeholder='Search user by ID...'
                                onChange={(e, { value }) => this.setState({search_id: value})} />
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='blue' disabled={!search_id} onClick={() => this.searchUser("id")}>Search</Button>
                        </Menu.Item>
                        <Menu.Item>
                            <Input
                                error={!search_mail}
                                value={search_mail}
                                placeholder='Search user by MAIL...'
                                onChange={(e, { value }) => this.setState({search_mail: value})} />
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='blue' disabled={!search_mail} onClick={() => this.searchUser("email")}>Search</Button>
                        </Menu.Item>
                    </Menu.Menu>
                    {/*<Menu.Menu position='right'>*/}
                    {/*    <Menu.Item>*/}
                    {/*    </Menu.Item>*/}
                    {/*    <Menu.Item>*/}
                    {/*        <Button color='red' onClick={this.cleanUsers}>CleanUsers</Button>*/}
                    {/*    </Menu.Item>*/}
                    {/*</Menu.Menu>*/}
                </Menu>
                <Segment textAlign='center' className="group_list" raised >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={3}>Email</Table.Cell>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={3}>Reg Time</Table.Cell>
                                <Table.Cell width={3}>Social</Table.Cell>
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